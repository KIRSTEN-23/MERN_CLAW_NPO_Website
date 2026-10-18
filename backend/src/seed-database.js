// Explicit fictional-data seed command, separate from normal server startup.
import { openDatabase, seedDatabase } from './database.js';
// Open the configured target only when this explicit seed command is run.
const db = await openDatabase();
try { await seedDatabase(db); console.log('Fictional dogs seeded without overwriting existing records.'); }
finally { await db.close(); }
