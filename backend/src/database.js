import mysql from 'mysql2/promise';
import { seedDogs } from './seed.js';
export async function openDatabase() {
 const pool=mysql.createPool({host:process.env.MYSQL_HOST||'127.0.0.1',port:Number(process.env.MYSQL_PORT||3306),user:process.env.MYSQL_USER||'claw',password:process.env.MYSQL_PASSWORD||'',database:process.env.MYSQL_DATABASE||'claw',connectionLimit:10});
 return {pool,prepare(sql){return {
  async all(...params){const [rows]=await pool.execute(sql,params);return rows;},
  async get(...params){const [rows]=await pool.execute(sql,params);return rows[0];},
  async run(...params){const [result]=await pool.execute(sql,params);return result;},
 };},async close(){await pool.end();}};
}
export async function seedDatabase(db) {
 for(const dog of seedDogs) await db.prepare('INSERT IGNORE INTO dogs (id,data) VALUES (?,?)').run(dog.id,JSON.stringify(dog));
}
