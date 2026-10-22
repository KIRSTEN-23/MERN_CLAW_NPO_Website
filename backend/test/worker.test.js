// HTTP-level worker security and workflow checks use isolated in-memory records, never a deployed DB.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { validateAnimal } from '../src/worker.js';
import { seedDogs } from '../src/seed.js';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { workerFixture } from './helpers/worker-fixture.js';

async function fixture(t) {
  const db = workerFixture(), server = createApp(db).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { db, base, request: (path, role, method = 'GET', body) => fetch(`${base}/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...(role ? { Cookie: `claw_session=${role}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) }) };
}
const profile = () => ({ ...seedDogs[1], revision: 0, personality: ['Gentle'], image: '/public/assets/dogs/profiles/max.jpg' });
test('worker login date comes from the persisted session and stays unchanged on refresh', async t => {
  const { request } = await fixture(t);
  const first = await (await request('/worker/session', 'admin')).json();
  const refreshed = await (await request('/worker/session', 'admin')).json();
  assert.equal(first.worker.lastLoginAt, '2026-10-18T13:00:00.000Z');
  assert.equal(refreshed.worker.lastLoginAt, first.worker.lastLoginAt);
});
test('worker permissions deny anonymous/public accounts and enforce viewer/editor/admin boundaries', async t => {
  const { request, db } = await fixture(t);
  assert.equal((await request('/worker/dashboard')).status, 401);
  assert.equal((await request('/worker/dashboard', 'visitor')).status, 403);
  assert.equal((await request('/worker/dashboard', 'viewer')).status, 200);
  for (const role of ['viewer', 'editor']) assert.equal((await request('/worker/staff', role)).status, 403);
  for (const [path, method, body] of [['/worker/animals', 'POST', profile()], ['/worker/animals/max', 'PUT', profile()], ['/worker/requests/request-1/review', 'PUT', { status: 'reviewed', note: '' }]]) assert.equal((await request(path, 'viewer', method, body)).status, 403);
  db.access.delete('editor');
  assert.equal((await request('/worker/dashboard', 'editor')).status, 403, 'revocation takes effect on the next request');
});
test('animal creation, stale-edit conflicts, archive/restore and permanent adoption update public visibility', async t => {
  const { request, db } = await fixture(t);
  const creation = await request('/worker/animals', 'editor', 'POST', profile());
  assert.equal(creation.status, 201);
  const created = (await creation.json()).animal;
  assert.notEqual(created.id, 'max'); assert.equal(created.revision, 1);
  const update = await request('/worker/animals/max', 'editor', 'PUT', { ...profile(), name: 'Updated Max' });
  assert.equal(update.status, 200); assert.equal(db.animals.get('max').name, 'Updated Max');
  assert.equal((await request('/worker/animals/max', 'editor', 'PUT', profile())).status, 409);
  assert.equal((await request('/worker/animals/max/archive', 'editor', 'PATCH', { archived: true, revision: 1 })).status, 200);
  assert.equal((await request('/dogs/max')).status, 404);
  assert.ok(!(await (await request('/dogs')).json()).dogs.some(d => d.id === 'max'));
  assert.equal((await request('/worker/animals/max/archive', 'editor', 'PATCH', { archived: false, revision: 2 })).status, 200);
  assert.equal((await request('/dogs/max')).status, 200);
  assert.equal((await request('/worker/animals/max', 'editor', 'PUT', { ...profile(), permanentAdoptionDate: '2026-10-01', revision: 3 })).status, 200);
  assert.equal((await request('/dogs/max')).status, 404);
});
test('request reviews do not mark payments paid or activate a dog sponsorship', async t => {
  const { request, db } = await fixture(t), before = structuredClone(db.animals.get('max'));
  assert.equal((await request('/worker/requests/request-1/review', 'editor', 'PUT', { status: 'paid', note: '' })).status, 400);
  assert.equal((await request('/worker/requests/request-1/review', 'editor', 'PUT', { status: 'reviewed', note: 'Checked details' })).status, 200);
  assert.equal(db.contributions[0].status, 'pending_payment');
  assert.deepEqual(db.animals.get('max'), before);
  const dashboard = await (await request('/worker/dashboard', 'admin')).json();
  assert.equal(dashboard.summary.monthlyDonations, 0);
  assert.equal(dashboard.requests[0].review_status, 'reviewed');
  assert.equal((await request('/worker/requests/request-1/review', 'editor', 'PUT', { status: 'approved', note: 'Approved for sponsorship' })).status, 200);
  const approved = await (await request('/worker/dashboard', 'editor')).json();
  assert.equal(approved.requests[0].review_status, 'approved');
  assert.equal(approved.requests[0].status, dashboard.requests[0].status);
  assert.equal(approved.animals.find(d => d.id === 'max').sponsorshipStartedAt, dashboard.animals.find(d => d.id === 'max').sponsorshipStartedAt);
});
test('staff grants require an existing account and cannot change or remove own access', async t => {
  const { request, db } = await fixture(t);
  assert.equal((await request('/worker/staff', 'admin', 'POST', { email: 'missing@example.com', role: 'editor' })).status, 404);
  assert.equal((await request('/worker/staff', 'admin', 'POST', { email: 'admin@example.com', role: 'viewer' })).status, 400);
  assert.equal((await request('/worker/staff/admin', 'admin', 'DELETE')).status, 400);
  assert.equal((await request('/worker/staff', 'admin', 'POST', { email: 'visitor@example.com', role: 'editor' })).status, 201);
  assert.equal(db.access.get('visitor'), 'editor');
  assert.equal((await request('/worker/staff/visitor', 'admin', 'DELETE')).status, 204);
  assert.equal(db.access.has('visitor'), false);
});
test('profile validation rejects invalid dates, arbitrary image URLs and inconsistent sponsorship dates', () => {
  for (const change of [{ intakeDate: '2026-02-30' }, { ageMonths: -1 }, { image: 'https://evil.example/photo.svg' }, { sex: 'Other' }, { sponsorshipStartedAt: '2026-10-10', sponsorshipEndsAt: '2026-10-01' }, { personality: ['x'.repeat(161)] }]) assert.throws(() => validateAnimal({ ...profile(), ...change }), error => error.status === 400);
  assert.equal(validateAnimal(profile()).mock, false);
});
test('animal photo uploads enforce authorization, format and size and serve generated filenames', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'claw-worker-upload-')), previous = process.env.UPLOAD_DIR;
  process.env.UPLOAD_DIR = directory;
  t.after(async () => { if (previous === undefined) delete process.env.UPLOAD_DIR; else process.env.UPLOAD_DIR = previous; await rm(directory, { recursive: true, force: true }); });
  const { base } = await fixture(t);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j04sAAAAASUVORK5CYII=', 'base64');
  const upload = (bytes, type = 'image/png', role = 'editor') => fetch(`${base}/api/worker/images`, { method: 'POST', headers: { Cookie: `claw_session=${role}`, 'Content-Type': type }, body: bytes });
  assert.equal((await upload(png, 'image/png', 'viewer')).status, 403);
  assert.equal((await upload(Buffer.from('<svg onload="alert(1)"></svg>'), 'image/svg+xml')).status, 400);
  assert.equal((await upload(Buffer.alloc(2 * 1024 * 1024 + 1))).status, 413);
  const response = await upload(png); assert.equal(response.status, 201);
  const { image } = await response.json(); assert.match(image, /^\/public\/uploads\/[a-f0-9-]+\.png$/);
  const photo = await fetch(base + image); assert.equal(photo.status, 200); assert.equal(photo.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(Buffer.from(await photo.arrayBuffer()), png);
  assert.equal((await fetch(base + '/public/uploads/.env')).status, 404);
});
