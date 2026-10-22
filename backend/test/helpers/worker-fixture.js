import { createHash } from 'node:crypto';
import { seedDogs } from '../../src/seed.js';
const hash = value => createHash('sha256').update(value).digest('hex');
export function workerFixture() {
  const users = ['admin','editor','viewer','visitor'].map(id => ({ id, username: id, email: `${id}@example.com` }));
  const access = new Map([['admin', 'admin'], ['editor','editor'], ['viewer','viewer']]);
  const animals = new Map(seedDogs.map(d => [d.id, structuredClone(d)]));
  const contributions = [{ id: 'request-1', dog_id: 'max', amount_cents: 25000, frequency: 'monthly', status: 'pending_payment', name: 'Test Person', email: 'person@example.com', created_at: '2026-10-01T00:00:00Z' }];
  const reviews = new Map();
  return { access, animals, contributions, reviews, prepare(sql) { return {
    async get(...args) {
      if (sql.includes('FROM sessions JOIN users')) { const user = users.find(u => hash(u.id) === args[0]); return user ? { ...user, session_expires_at: Date.parse('2026-10-18T13:00:00Z') + 7 * 86400000 } : undefined; }
      if (sql.includes('FROM worker_access WHERE')) return access.has(args[0]) ? { role: access.get(args[0]) } : undefined;
      if (sql.includes('FROM dogs WHERE')) return animals.has(args[0]) ? { data: structuredClone(animals.get(args[0])) } : undefined;
      if (sql.includes('FROM contributions WHERE')) return contributions.find(c => c.id === args[0]);
      if (sql.includes('FROM users WHERE email')) return users.find(u => u.email === args[0]);
      throw new Error(`Unhandled test query ${sql}`);
    },
    async all() {
      if (sql.includes('FROM dogs')) return [...animals.values()].map(data => ({ data: structuredClone(data) }));
      if (sql.includes('FROM contributions c')) return contributions.map(c => ({ ...c, review_status: reviews.get(c.id)?.status, review_note: reviews.get(c.id)?.note }));
      if (sql.includes('FROM worker_access w')) return users.filter(u => access.has(u.id)).map(u => ({ ...u, role: access.get(u.id), granted_at: '2026-10-01' }));
      throw new Error(`Unhandled test query ${sql}`);
    },
    async run(...args) {
      if (sql.startsWith('INSERT INTO dogs')) { animals.set(args[0], JSON.parse(args[1])); return { affectedRows: 1 }; }
      if (sql.startsWith('UPDATE dogs')) { const previous = animals.get(args[1]); if (String(previous.revision || 0) !== args[2]) return { affectedRows: 0 }; animals.set(args[1], JSON.parse(args[0])); return { affectedRows: 1 }; }
      if (sql.startsWith('INSERT INTO worker_reviews')) { reviews.set(args[0], { status: args[1], note: args[2] }); return { affectedRows: 1 }; }
      if (sql.startsWith('INSERT INTO worker_access')) { access.set(args[0], args[1]); return { affectedRows: 1 }; }
      if (sql.startsWith('DELETE FROM worker_access')) { access.delete(args[0]); return { affectedRows: 1 }; }
      throw new Error(`Unhandled test query ${sql}`);
    },
  }; } };
}
