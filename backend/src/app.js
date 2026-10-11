import { dogStatus } from './dog-status.js';
import express from 'express';
export function createApp(db) {
 const app=express(); app.disable('x-powered-by'); app.use(express.json({limit:'16kb'}));
 app.use('/api',(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
 const fail=(res,status,message)=>res.status(status).json({error:message});
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
 app.use('/api',(_req,res)=>fail(res,404,'Endpoint not found.'));
 app.use((error,_req,res,_next)=>{if(error.type==='entity.parse.failed')return fail(res,400,'Invalid JSON.');if(error.type==='entity.too.large')return fail(res,413,'Request too large.');console.error(error);fail(res,500,'Unable to complete this request.');});
 return app;
}
