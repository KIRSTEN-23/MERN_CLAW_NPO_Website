import mysql from 'mysql2/promise';
import { databaseConfig } from './database-config.js';
import { seedDogs } from './seed.js';
export async function openDatabase(env = process.env) {
 const pool=mysql.createPool(await databaseConfig(env));
 return {pool,prepare(sql){return {
  async all(...params){const [rows]=await pool.execute(sql,params);return rows;},
  async get(...params){const [rows]=await pool.execute(sql,params);return rows[0];},
  async run(...params){const [result]=await pool.execute(sql,params);return result;},
 };},async close(){await pool.end();}};
}
export async function seedDatabase(db) {
 for(const dog of seedDogs) await db.prepare('INSERT IGNORE INTO dogs (id,data) VALUES (?,?)').run(dog.id,JSON.stringify(dog));
}
