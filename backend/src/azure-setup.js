// Explicit, interactive setup for the fictional CLAW Azure database.
// Passwords are read without echo and are never saved to a file.
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { databaseConfig } from './database-config.js';
import { openDatabase, seedDatabase } from './database.js';

async function secret(label) {
 if (!process.stdin.isTTY) throw new Error('Run setup in an interactive terminal.');
 process.stdout.write(label);
 process.stdin.setRawMode(true);
 process.stdin.resume();
 return new Promise((resolve, reject) => {
  let value = '';
  const finish = () => {
   process.stdin.off('data', onData);
   process.stdin.setRawMode(false);
   process.stdin.pause();
   process.stdout.write('\n');
  };
  const onData = chunk => {
   for (const char of chunk.toString()) {
    if (char === '\u0003') { finish(); reject(new Error('Cancelled.')); return; }
    if (char === '\r' || char === '\n') { finish(); resolve(value); return; }
    if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
    else if (char >= ' ') value += char;
   }
  };
  process.stdin.on('data', onData);
 });
}

let connection, db;
let stage = 'password validation';
const setupError = (code) => Object.assign(new Error(code), {code});
try {
 const host = process.env.MYSQL_HOST;
 if (!host?.endsWith('.mysql.database.azure.com')) throw setupError('INVALID_HOST');
 console.log(`Target: ${host}; database: claw; application login: claw_app`);
 console.log('Creates missing tables and inserts fictional dogs. Existing records are preserved.');
 const adminPassword = await secret('Existing clawadmin password (hidden): ');
 const appPassword = await secret('New claw_app password (save privately; hidden): ');
 const confirm = await secret('Repeat new claw_app password (hidden): ');
 if (!adminPassword) throw setupError('EMPTY_ADMIN_PASSWORD');
 if (appPassword !== confirm) throw setupError('PASSWORD_MISMATCH');
 if (appPassword.length < 16) throw setupError('PASSWORD_TOO_SHORT');
 stage = 'administrator connection';
 const env = {NODE_ENV: 'production', MYSQL_HOST: host, MYSQL_USER: 'clawadmin', MYSQL_PASSWORD: adminPassword, MYSQL_DATABASE: 'mysql', MYSQL_SSL: 'true'};
 const {connectionLimit, ...config} = await databaseConfig(env);
 connection = await mysql.createConnection(config);
 stage = 'database and schema creation';
 await connection.query('CREATE DATABASE IF NOT EXISTS claw CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
 db = await openDatabase({...env, MYSQL_DATABASE: 'claw'});
 const sql = await readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8');
 for (const statement of sql.split(';').filter(s => s.trim())) await db.pool.query(statement);
 await seedDatabase(db);
 stage = 'application login creation';
 // No IF NOT EXISTS: never silently reuse or change an existing login's password.
 await connection.query("CREATE USER 'claw_app'@'%' IDENTIFIED BY ? REQUIRE SSL", [appPassword]);
 await connection.query("GRANT SELECT, INSERT, UPDATE, DELETE ON claw.* TO 'claw_app'@'%'");
 stage = 'application login verification';
 const testDb = await openDatabase({...env, MYSQL_DATABASE: 'claw', MYSQL_USER: 'claw_app', MYSQL_PASSWORD: appPassword});
 try { await testDb.pool.query('SELECT id FROM dogs LIMIT 1'); } finally { await testDb.close(); }
 console.log('Database, fictional dog data and restricted TLS application login are ready.');
 console.log('In App Service set MYSQL_USER=claw_app and MYSQL_PASSWORD to the new password you saved.');
} catch (error) {
 const code = typeof error.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? error.code : 'SETUP_FAILED';
 const hints = {
  INVALID_HOST: 'Set MYSQL_HOST to the Azure MySQL hostname.',
  EMPTY_ADMIN_PASSWORD: 'Enter the existing clawadmin password.',
  PASSWORD_MISMATCH: 'The two new application passwords did not match. Try again.',
  PASSWORD_TOO_SHORT: 'Choose an application password containing at least 16 characters.',
  ER_ACCESS_DENIED_ERROR: 'Check the existing administrator password or application login credentials.',
  ENOTFOUND: 'The MySQL hostname could not be resolved. Check DNS.',
  ETIMEDOUT: 'The connection timed out. Check the server and allowed client IP.',
  ER_CANNOT_USER: 'The claw_app login may already exist. It has not been overwritten.',
 };
 console.error(`Setup failed during ${stage} (${code}). ${hints[code] || 'Check the target, firewall, TLS configuration and credentials.'}`);
 console.error('Existing data was not reset. Passwords are not logged.');
 process.exitCode = 1;
} finally {
 if (db) await db.close();
 if (connection) await connection.end();
}
