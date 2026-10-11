import { openDatabase } from './database.js';
import { seedDogs } from './seed.js';
const db = await openDatabase();
try {
 let updated = 0;
 for (const dog of seedDogs) {
  const result = await db.prepare("UPDATE dogs SET data = JSON_SET(data, '$.image', ?) WHERE id = ? AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.mock')) = 'true'").run(dog.image, dog.id);
  updated += result.affectedRows;
 }
 console.log(`Corrected Figma photo mappings for ${updated} mock dogs. Other details were preserved.`);
} finally { await db.close(); }
