// Manual repair command for mock dog photo mappings only. Preserves the rest of each profile and ignores non-mock records.
import { openDatabase } from './database.js';
import { seedDogs } from './seed.js';
const db = await openDatabase();
// Only mock records are eligible for repair. JSON_SET changes the image field without replacing the profile.
try {
 let updated = 0;
 for (const dog of seedDogs) {
  const result = await db.prepare("UPDATE dogs SET data = JSON_SET(data, '$.image', ?) WHERE id = ? AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.mock')) = 'true'").run(dog.image, dog.id);
  updated += result.affectedRows;
 }
 console.log(`Corrected Figma photo mappings for ${updated} mock dogs. Other details were preserved.`);
} finally { await db.close(); }
