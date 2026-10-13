import { readFile } from 'node:fs/promises';
import { openDatabase, seedDatabase } from './database.js';
const db=await openDatabase();
try {
 const sql=await readFile(new URL('../sql/schema.sql',import.meta.url),'utf8');
 for(const statement of sql.split(';').filter(s=>s.trim())) await db.pool.query(statement);
 if (!process.argv.includes('--schema-only')) await seedDatabase(db);
 console.log(process.argv.includes('--schema-only') ? 'MySQL schema ready.' : 'MySQL schema ready; fictional dogs seeded without overwriting existing records.');
} finally {await db.close();}
