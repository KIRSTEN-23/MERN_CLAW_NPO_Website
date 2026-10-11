import { dogStatus } from './dog-status.js';
import express from 'express';
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const derive=promisify(scrypt);
const hash = value => createHash('sha256').update(value).digest('hex');
const emailValid = value => typeof value==='string' && value.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const publicUser = row => ({id:row.id,username:row.username,email:row.email});
export function createApp(db) {
 const app=express(); app.disable('x-powered-by'); app.use(express.json({limit:'16kb'}));
 app.use('/api',(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
 const fail=(res,status,message)=>res.status(status).json({error:message});
 const cookie=(res,token,maxAge)=>res.set('Set-Cookie',`claw_session=${token}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=${maxAge}${process.env.NODE_ENV==='production'?'; Secure':''}`);
 const session=async req=>{
  const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('claw_session='))?.slice(13);
  return token && await db.prepare('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?').get(hash(token),Date.now());
 };
 app.use('/api',(req,res,next)=>{
  if(!['GET','HEAD','OPTIONS'].includes(req.method) && req.headers.origin && req.headers.origin !== (process.env.APP_ORIGIN || 'http://localhost:5173')) return fail(res,403,'Untrusted request origin.');
  next();
 });
 const attempts=new Map();
 app.use('/api/auth',(req,res,next)=>{
  if(req.method!=='POST') return next();
  const key=req.ip,now=Date.now();let entry=attempts.get(key);
  if(!entry || entry.until<now) {entry={count:0,until:now+15*60*1000};attempts.set(key,entry);}
  if(++entry.count>30) return fail(res,429,'Too many attempts. Try again in 15 minutes.');
  if(attempts.size>10000) for(const [key,item] of attempts) if(item.until<now) attempts.delete(key);
  next();
 });
 app.get('/api/health',async (_req,res)=>{await db.prepare('SELECT 1 AS ok').get();res.json({status:'ok',service:'claw-backend',database:'mysql'});});
 app.get('/api/dogs',async (req,res)=>{
  let dogs=(await db.prepare('SELECT data FROM dogs ORDER BY id').all()).map(row=>dogStatus(typeof row.data==='string'?JSON.parse(row.data):row.data)).filter(d=>d.placementStatus==='in_care');
  if(req.query.available==='true') dogs=dogs.filter(d=>d.available);
  for(const key of ['size','sex']) if(req.query[key]) dogs=dogs.filter(d=>d[key]===req.query[key]);
  res.json({dogs});
 });
 app.get('/api/dogs/:id',async (req,res)=>{
  const row=await db.prepare('SELECT data FROM dogs WHERE id=?').get(req.params.id);
  if(!row) return fail(res,404,'Dog not found.');
  const dog=dogStatus(typeof row.data==='string'?JSON.parse(row.data):row.data);
  if(dog.placementStatus==='permanently_adopted') return fail(res,404,'This dog is no longer available. Browse our available dogs.');
  res.json({dog});
 });
 const startSession=async (res,user)=>{
  await db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now());
  const token=randomBytes(32).toString('hex');await db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(token),user.id,Date.now()+7*86400000);
  cookie(res,token,7*86400);res.json({user:publicUser(user)});
 };
 app.post('/api/auth/register',async (req,res)=>{
  const {username,email,password,confirmPassword}=req.body||{};
  if(typeof username!=='string' || !/^[\w.-]{3,40}$/.test(username) || !emailValid(email) || typeof password!=='string' || password.length<8 || password.length>128 || password!==confirmPassword) return fail(res,400,'Use a 3–40 character username, valid email and matching passwords of 8–128 characters.');
  const salt=randomBytes(16).toString('hex'),passwordHash=`${salt}:${(await derive(password,salt,64)).toString('hex')}`;
  const user={id:randomUUID(),username,email:email.toLowerCase()};
  try {await db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(user.id,user.username,user.email,passwordHash,new Date().toISOString());}
  catch(error) {if(error.code==='ER_DUP_ENTRY') return fail(res,409,'That username or email is already registered.');throw error;}
  res.status(201);await startSession(res,user);
 });
 app.post('/api/auth/login',async (req,res)=>{
  const {username,email,password}=req.body||{};
  if(typeof password!=='string' || password.length>128 || !emailValid(email) || typeof username!=='string' || username.length>40) return fail(res,400,'Enter your username, email and password.');
  const user=await db.prepare('SELECT * FROM users WHERE email=? AND username=?').get(email,username);
  const [salt,expected]=(user?.password_hash || `${'0'.repeat(32)}:${'0'.repeat(128)}`).split(':');
  const valid=timingSafeEqual(await derive(password,salt,64),Buffer.from(expected,'hex'));
  if(!user || !valid) return fail(res,401,'Incorrect login details.');await startSession(res,user);
 });
 app.get('/api/auth/me',async (req,res)=>{const user=await session(req);res.json({user:user?publicUser(user):null});});
 app.post('/api/auth/logout',async (req,res)=>{
  const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('claw_session='))?.slice(13);
  if(token) await db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token));cookie(res,'',0);res.status(204).end();
 });
 app.use('/api',(_req,res)=>fail(res,404,'Endpoint not found.'));
 app.use((error,_req,res,_next)=>{if(error.type==='entity.parse.failed')return fail(res,400,'Invalid JSON.');if(error.type==='entity.too.large')return fail(res,413,'Request too large.');console.error(error);fail(res,500,'Unable to complete this request.');});
 return app;
}
