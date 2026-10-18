// MySQL connection pool and parameterized query adapter. Fictional seeding only inserts missing records and runs explicitly.
import mysql from "mysql2/promise";
import { databaseConfig } from "./database-config.js";
import { seedDogs } from "./seed.js";
export async function openDatabase(env = process.env) {
  // Reuse a bounded connection pool instead of opening a new connection for every API call.
  const pool = mysql.createPool(await databaseConfig(env));
  return {
    pool,
    // Bind values separately through execute(). all returns rows, get returns the first row, run returns write metadata.
    prepare(sql) {
      return {
        async all(...params) {
          const [rows] = await pool.execute(sql, params);
          return rows;
        },
        async get(...params) {
          const [rows] = await pool.execute(sql, params);
          return rows[0];
        },
        async run(...params) {
          const [result] = await pool.execute(sql, params);
          return result;
        },
      };
    },
    // Pool shutdown waits for database resources to be released.
    async close() {
      await pool.end();
    },
  };
}
export async function seedDatabase(db) {
  // INSERT IGNORE preserves profiles already stored under these stable dog IDs.
  for (const dog of seedDogs)
    await db
      .prepare("INSERT IGNORE INTO dogs (id,data) VALUES (?,?)")
      .run(dog.id, JSON.stringify(dog));
}
