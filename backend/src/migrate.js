import { readFile } from 'node:fs/promises';
import { openDatabase } from './database.js';
const db=await openDatabase();
try {
 const sql=await readFile(new URL('../sql/schema.sql',import.meta.url),'utf8');
 for(const statement of sql.split(';').filter(s=>s.trim())) await db.pool.query(statement);
 console.log('MySQL schema ready.');
} finally {await db.close();}
