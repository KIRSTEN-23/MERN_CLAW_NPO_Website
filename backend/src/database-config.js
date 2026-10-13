import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { isIP } from 'node:net';
import { createSecureContext } from 'node:tls';

export async function databaseConfig(env = process.env) {
 const production = env.NODE_ENV === 'production';
 const tls = env.MYSQL_SSL || (production ? 'true' : 'false');
 if (!['true', 'false'].includes(tls) || (production && tls !== 'true')) {
  throw Object.assign(new Error('MYSQL_SSL must be true in production; local values are true or false.'), {code: 'INVALID_CONFIGURATION'});
 }
 if (production && ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'].some(key => !env[key])) {
  throw Object.assign(new Error('Production MySQL settings are incomplete.'), {code: 'INVALID_CONFIGURATION'});
 }
 const config = {host: env.MYSQL_HOST || '127.0.0.1', port: Number(env.MYSQL_PORT || 3306),
  user: env.MYSQL_USER || 'claw', password: env.MYSQL_PASSWORD || '', database: env.MYSQL_DATABASE || 'claw',
  connectionLimit: 10, connectTimeout: 10000};
 if (tls === 'true') {
  if (isIP(config.host)) throw Object.assign(new Error('Use a DNS hostname for verified MySQL TLS, not an IP address.'), {code: 'INVALID_CONFIGURATION'});
  // Node's maintained root store is the default. Optional PEM bundle contains root CAs only.
  const ssl = {rejectUnauthorized: true, verifyIdentity: true, minVersion: 'TLSv1.2'};
  if (env.MYSQL_SSL_CA) {
   try {
    ssl.ca = await readFile(resolve(fileURLToPath(new URL('../', import.meta.url)), env.MYSQL_SSL_CA), 'utf8');
    if (!ssl.ca.includes('-----BEGIN CERTIFICATE-----')) throw new Error('Invalid PEM');
    createSecureContext(ssl);
   } catch {
    throw Object.assign(new Error('MYSQL_SSL_CA must point to a readable valid PEM root-CA bundle.'), {code: 'INVALID_TLS_CA'});
   }
  }
  config.ssl = ssl;
 }
 return config;
}
