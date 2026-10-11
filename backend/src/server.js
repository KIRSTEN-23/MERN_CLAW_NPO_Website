import { createApp } from './app.js';
import { openDatabase } from './database.js';
const db=await openDatabase();
try {await db.prepare('SELECT id FROM dogs LIMIT 1').get();}
catch(error){await db.close();console.error('Unable to open the CLAW MySQL database. Check backend/.env and run npm run db:setup.',error.code);process.exit(1);}
const server=createApp(db).listen(Number(process.env.PORT||5001),'127.0.0.1',()=>console.log(`CLAW backend: http://localhost:${process.env.PORT||5001}`));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(async ()=>{await db.close();process.exit(0);}));
