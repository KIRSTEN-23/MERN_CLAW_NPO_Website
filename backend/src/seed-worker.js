// Run explicitly against local development only, never from normal startup or a deployed site.
import { openDatabase } from './database.js';
import { seedWorker } from './worker-seed.js';
if (process.env.NODE_ENV === 'production' || !['127.0.0.1','localhost','::1'].includes(process.env.MYSQL_HOST || '127.0.0.1')) {
  console.error('Worker sample seeding is restricted to local development MySQL.');
  process.exitCode = 1;
} else {
  let db;
  try {
    db = await openDatabase();
    const { added } = await seedWorker(db);
    console.log(`Worker records ready (${added} new rows). Existing profiles, staff roles and requests were preserved.`);
  } catch (error) {
    console.error('Worker seed failed. Check local MySQL credentials and run db:worker first. The seed transaction was rolled back.');
    process.exitCode = 1;
  } finally { await db?.close(); }
}
