import { openDatabase, seedDatabase } from './database.js';
const db = await openDatabase();
try { await seedDatabase(db); console.log('Fictional dogs seeded without overwriting existing records.'); }
finally { await db.close(); }
