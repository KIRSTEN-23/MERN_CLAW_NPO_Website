// Explicit schema setup command. Creates missing tables and optionally seeds fictional data without resetting the database.
import { readFile } from "node:fs/promises";
import { openDatabase, seedDatabase } from "./database.js";
const db = await openDatabase();
try {
  const sql = await readFile(
    new URL("../sql/schema.sql", import.meta.url),
    "utf8",
  );
  // The bundled schema uses simple semicolon-separated statements. This is not a general SQL import parser.
  for (const statement of sql.split(";").filter((s) => s.trim()))
    await db.pool.query(statement);
  // The schema-only command skips fictional data insertion. Normal server startup never calls this script.
  if (!process.argv.includes("--schema-only")) await seedDatabase(db);
  console.log(
    process.argv.includes("--schema-only")
      ? "MySQL schema ready."
      : "MySQL schema ready; fictional dogs seeded without overwriting existing records.",
  );
// Always close the pool, including when a schema statement or seed insert fails.
} finally {
  await db.close();
}
