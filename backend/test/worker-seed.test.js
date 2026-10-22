import test from 'node:test';
import assert from 'node:assert/strict';
import { seedWorker, workerSeedData } from '../src/worker-seed.js';
test('worker seed has consistent references, realistic metrics and no administrator accounts', () => {
  const data = workerSeedData(new Date('2026-10-19T10:00:00Z'));
  assert.equal(data.staff.length,4);
  assert.ok(data.staff.every(p => p.role !== 'admin' && p.email.endsWith('@example.test')));
  assert.equal(data.requests.filter(r => r.status === 'pending_payment').length,3);
  assert.equal(data.requests.filter(r => r.status === 'paid').reduce((sum,r) => sum+r.amount,0),135000);
  assert.equal(data.animals.filter(d => d.permanentAdoptionDate).length,2);
  assert.deepEqual(workerSeedData(new Date('2026-11-19')).requests.map(r => r.id),data.requests.map(r => r.id));
});
test('worker seed can run repeatedly without overwriting edits or existing roles', async () => {
  const tables = new Map(), counts = { commits: 0, rollbacks: 0, releases: 0 };
  const connection = {
    async beginTransaction() {}, async commit() { counts.commits++; }, async rollback() { counts.rollbacks++; }, release() { counts.releases++; },
    async execute(sql,args = []) {
      if (sql.startsWith('SELECT user_id') || sql.startsWith('SELECT contribution_id')) return [[]];
      if (sql.startsWith('SELECT id FROM users')) return [tables.get('users')?.has(args[0]) ? [{ id: args[0] }] : []];
      const table = sql.match(/^INSERT IGNORE INTO (\w+)/)?.[1];
      assert.ok(table, sql);
      if (!tables.has(table)) tables.set(table,new Map());
      const rows = tables.get(table);
      if (rows.has(args[0])) return [{ affectedRows: 0 }];
      rows.set(args[0],structuredClone(args)); return [{ affectedRows: 1 }];
    },
  };
  const db = { pool: { async getConnection() { return connection; } } };
  const now = new Date('2026-10-19');
  assert.ok((await seedWorker(db,now)).added > 0);
  const person = workerSeedData(now).staff[0];
  tables.get('worker_access').get(person.id)[1] = 'viewer';
  tables.get('dogs').get('bella')[1] = '{"name":"User edited profile"}';
  assert.equal((await seedWorker(db,now)).added,0);
  assert.equal(tables.get('worker_access').get(person.id)[1],'viewer');
  assert.equal(tables.get('dogs').get('bella')[1],'{"name":"User edited profile"}');
  assert.equal(counts.commits,2); assert.equal(counts.rollbacks,0); assert.equal(counts.releases,2);
});
