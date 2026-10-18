// Optional integration checks against a dedicated test database. Never run these against the deployed application database.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { openDatabase,seedDatabase } from '../src/database.js';
test('MySQL schema, JSON seeds, unique accounts and durable persistence',{skip:process.env.MYSQL_INTEGRATION!=='1'},async()=>{
 assert.ok(process.env.MYSQL_DATABASE?.endsWith('_test'),'Use a dedicated database whose name ends in _test.');
 const db=await openDatabase(),id=randomUUID(),suffix=id.slice(0,8);
 try {
  const schema=await readFile(new URL('../sql/schema.sql',import.meta.url),'utf8');
  for(const statement of schema.split(';').filter(s=>s.trim()))await db.pool.query(statement);
  await seedDatabase(db);await seedDatabase(db);
  const dogs=await db.prepare('SELECT data FROM dogs').all();assert.ok(dogs.length>=10);
  await db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(id,`test-${suffix}`,`${suffix}@example.com`,'test-hash',new Date().toISOString());
  const another=await openDatabase();try{assert.equal((await another.prepare('SELECT * FROM users WHERE id=?').get(id)).username,`test-${suffix}`);}finally{await another.close();}
  await assert.rejects(db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(randomUUID(),`test-${suffix}`,`other-${suffix}@example.com`,'test-hash',new Date().toISOString()),error=>error.code==='ER_DUP_ENTRY');
 }finally{await db.prepare('DELETE FROM users WHERE id=?').run(id);await db.close();}
});
