// Explicit operator command: add worker tables, then optionally grant an existing account access.
// Passwords stay in the normal registration/login flow; public signup cannot grant worker roles.
import { readFile } from 'node:fs/promises';
import { openDatabase } from './database.js';
const db = await openDatabase();
try {
  const sql = await readFile(new URL('../sql/worker-schema.sql', import.meta.url), 'utf8');
  for (const statement of sql.split(';').filter(s => s.trim())) await db.pool.query(statement);
  const email = process.argv[2], role = process.argv[3] || 'admin';
  if (email) {
    if (!['admin', 'editor', 'viewer'].includes(role)) throw new Error('Role must be admin, editor or viewer.');
    const user = await db.prepare('SELECT id FROM users WHERE email=?').get(email);
    if (!user) throw new Error('Register the account on this deployment first, then retry.');
    await db.prepare('INSERT INTO worker_access (user_id,role,granted_at) VALUES (?,?,?) ON DUPLICATE KEY UPDATE role=VALUES(role)').run(user.id, role, new Date().toISOString());
    console.log('Worker access granted to the existing account.');
  } else console.log('Worker schema ready. No accounts were granted access.');
} finally { await db.close(); }
