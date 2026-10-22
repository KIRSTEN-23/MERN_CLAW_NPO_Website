// Production configuration and serving tests. Verify frontend allowlists, API errors, TLS requirements and lifecycle failures without Azure services.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { databaseConfig } from '../src/database-config.js';
import { createApp } from '../src/app.js';
import { startServer } from '../src/server.js';
const ready = () => ({prepare: () => ({get: async () => ({ok: 1})}), close: async () => {}});
async function fixture(t, db = ready()) {
 const result = await startServer({env: {NODE_ENV: 'production', APP_ORIGIN: 'https://claw.example', PORT: '0', TRUST_PROXY_HOPS: '1'}, open: async () => db, signals: false});
 t.after(result.stop);
 assert.equal(result.server.address().address, '0.0.0.0');
 return `http://127.0.0.1:${result.server.address().port}`;
}
test('production serves only frontend entry, modules and assets; API misses stay JSON', async t => {
 const base = await fixture(t);
 for (const [path, type] of [['/', 'text/html'], ['/index.html', 'text/html'], ['/worker', 'text/html'], ['/worker.html', 'text/html'], ['/src/worker/main.js', 'javascript'], ['/src/worker/worker.css', 'text/css'], ['/src/main.js', 'javascript'], ['/src/styles/base.css', 'text/css'], ['/public/assets/shared/logo.svg', 'image/svg+xml']]) {
  const response = await fetch(base + path); assert.equal(response.status, 200, path); assert.ok(response.headers.get('content-type').includes(type));
 }
 assert.equal((await fetch(base + '/', {method: 'HEAD'})).status, 200);
 const worker = await fetch(base + '/worker');
 assert.equal(worker.headers.get('x-robots-tag'), 'noindex, nofollow');
 assert.ok(!(await worker.text()).includes('/src/main.js'), 'worker has a separate browser entry');
 for (const path of ['/api', '/api/missing']) {
  const response = await fetch(base + path); assert.equal(response.status, 404); assert.match(response.headers.get('content-type'), /application\/json/); assert.equal((await response.json()).error, 'Endpoint not found.');
 }
 for (const path of ['/backend/src/app.js', '/backend/.env', '/.env', '/package.json', '/frontend/package.json', '/src/.env', '/src/package.json', '/public/.DS_Store', '/src/missing.js', '/dogs/details']) assert.equal((await fetch(base + path)).status, 404, path);
 const malformed = await fetch(base + '/api/auth/register', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{'});
 assert.equal(malformed.status, 400); assert.equal((await malformed.json()).error, 'Invalid JSON.');
 assert.equal((await fetch(base + '/api/health')).status, 200);
});
test('readiness failures close the pool and never start serving', async () => {
 let closed = false;
 await assert.rejects(startServer({env: {PORT: '0'}, signals: false, open: async () => ({prepare: () => ({get: async () => {throw Object.assign(new Error('database failure'), {code: 'ECONNREFUSED'});}}), close: async () => {closed = true;}})}), {code: 'ECONNREFUSED'});
 assert.ok(closed);
});
test('health reports database loss as JSON rather than HTML', async t => {
 let queries = 0;
 const base = await fixture(t, {prepare: () => ({get: async () => {if (++queries > 1) throw Object.assign(new Error('private connection information'), {code: 'ECONNREFUSED'}); return {};}}), close: async () => {}});
 const response = await fetch(base + '/api/health'); assert.equal(response.status, 500); assert.equal((await response.json()).error, 'Unable to complete this request.');
});
test('TLS verifies both CA and hostname; insecure or incomplete production configuration fails', async () => {
 assert.equal((await databaseConfig({})).ssl, undefined);
 const env = {NODE_ENV: 'production', MYSQL_HOST: 'example.mysql.database.azure.com', MYSQL_DATABASE: 'claw', MYSQL_USER: 'test', MYSQL_PASSWORD: 'test-only'};
 const {ssl} = await databaseConfig(env);
 assert.equal(ssl.rejectUnauthorized, true); assert.equal(ssl.verifyIdentity, true); assert.equal(ssl.minVersion, 'TLSv1.2');
 await assert.rejects(databaseConfig({...env, MYSQL_SSL: 'false'}), {code: 'INVALID_CONFIGURATION'});
 await assert.rejects(databaseConfig({NODE_ENV: 'production'}), {code: 'INVALID_CONFIGURATION'});
 await assert.rejects(databaseConfig({...env, MYSQL_SSL_CA: 'missing-test-ca.pem'}), {code: 'INVALID_TLS_CA'});
});
test('real production entry fails safely on missing origin before database access', () => {
 const result = spawnSync(process.execPath, [fileURLToPath(new URL('../src/server.js', import.meta.url))], {env: {PATH: process.env.PATH, NODE_ENV: 'production'}, encoding: 'utf8'});
 assert.equal(result.status, 1); assert.match(result.stderr, /INVALID_CONFIGURATION/); assert.doesNotMatch(result.stderr, /password|test-only/);
});

test('proxy trust is limited to one immediate ingress hop and remains off locally', () => {
 const trusted=createApp(ready(), {trustProxyHops:'1'}).get('trust proxy fn');
 assert.equal(trusted('192.0.2.1',0),true);assert.equal(trusted('192.0.2.2',1),false);
 assert.equal(createApp(ready(),{trustProxyHops:'0'}).get('trust proxy'),false);
 assert.throws(()=>createApp(ready(),{trustProxyHops:'true'}));
});
