import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { seedDogs } from '../src/seed.js';
// API tests use a repository double; the optional separate suite checks MySQL itself.
function repository() {
 const users=[],sessions=[],contributions=[];
 return {users,sessions,contributions,prepare(sql){return {
 async get(...args){
  if(sql==='SELECT 1 AS ok')return {ok:1};
  if(sql.includes('FROM dogs WHERE')){const dog=seedDogs.find(d=>d.id===args[0]);return dog?{data:dog}:undefined;}
  if(sql.includes('JOIN users')){const session=sessions.find(s=>s.token===args[0] && s.expires>args[1]);return users.find(u=>u.id===session?.userId);}
  if(sql.includes('FROM users WHERE'))return users.find(u=>u.email===args[0] && u.username===args[1]);
  throw new Error(`Unexpected SQL: ${sql}`);
 },async all(...args){if(sql.includes('FROM dogs'))return seedDogs.map(data=>({data}));if(sql.includes('FROM contributions'))return contributions.filter(c=>c.user_id===args[0]);throw new Error(sql);},
 async run(...args){
  if(sql.startsWith('INSERT INTO users')){if(users.some(u=>u.username===args[1]||u.email===args[2]))throw Object.assign(new Error('Duplicate'),{code:'ER_DUP_ENTRY'});users.push({id:args[0],username:args[1],email:args[2],password_hash:args[3]});}
  else if(sql.startsWith('INSERT INTO sessions'))sessions.push({token:args[0],userId:args[1],expires:args[2]});
  else if(sql.startsWith('DELETE FROM sessions')){for(let i=sessions.length-1;i>=0;i--)if(sql.includes('token_hash')?sessions[i].token===args[0]:sessions[i].expires<args[0])sessions.splice(i,1);}
  else if(sql.startsWith('INSERT INTO contributions'))contributions.push({id:args[0],user_id:args[1],dog_id:args[2],amount_cents:args[3],status:args[9],ends_at:args[11]});
  else throw new Error(sql);
 },};}};
}
async function fixture(t, options){const db=repository();const server=createApp(db, options).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));const base=`http://127.0.0.1:${server.address().port}`;return {db,request:(path,body,cookie,origin)=>fetch(base+'/api'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(origin?{Origin:origin}:{})},...(body?{body:JSON.stringify(body)}:{})})};}
test('registration, private session, pending adoption, logout and login',async t=>{
 const {db,request}=await fixture(t);
 const details={username:'demo.user',email:'demo@example.com',password:'strong-password',confirmPassword:'strong-password'};
 const registration=await request('/auth/register',details);assert.equal(registration.status,201);
 const cookie=registration.headers.get('set-cookie').split(';')[0];assert.match(registration.headers.get('set-cookie'),/HttpOnly/);
 assert.equal((await registration.json()).user.username,details.username);assert.notEqual(db.users[0].password_hash,details.password);
 assert.equal((await (await request('/auth/me',null,cookie)).json()).user.email,details.email);
 assert.equal((await request('/auth/register',details)).status,409);
 assert.equal((await request('/auth/login',{...details,password:'wrong'})).status,401);
 const contribution=await request('/contributions',{amount:'250.50',frequency:'monthly',paymentMethod:'eft',name:'Demo User',email:details.email,dogId:'max'},cookie);
 assert.equal(contribution.status,201);assert.equal(db.contributions[0].amount_cents,25050);assert.equal(db.contributions[0].status,'pending_payment');assert.equal(db.contributions[0].ends_at,null);
 assert.equal((await (await request('/contributions',null,cookie)).json()).contributions.length,1);
 assert.equal((await request('/contributions')).status,401);
 assert.equal((await request('/auth/logout',{},cookie)).status,204);
 assert.equal((await (await request('/auth/me',null,cookie)).json()).user,null);
 assert.equal((await request('/auth/login',details)).status,200);
});
test('dog data, filters, unknown IDs and invalid requests',async t=>{
 const {request}=await fixture(t);
 const dogs=(await (await request('/dogs')).json()).dogs;assert.equal(dogs.length,10);assert.ok(dogs.every(d=>d.placementStatus==='in_care'));
 const available=(await (await request('/dogs?available=true')).json()).dogs;assert.equal(available.length,7);assert.ok(available.every(d=>d.available));
 assert.equal((await request('/dogs/bella')).status,200);
 assert.equal((await (await request('/dogs/bella')).json()).dog.sponsorshipStatus,'active');
 assert.equal((await request('/dogs/missing')).status,404);
 assert.equal((await request('/auth/register',{username:'bad',email:'invalid',password:'a'})).status,400);
 const valid={amount:'250',frequency:'monthly',paymentMethod:'eft',name:'Demo',email:'demo@example.com'};
 for(const amount of ['0','-1','1.001','NaN'])assert.equal((await request('/contributions',{...valid,amount})).status,400);
 assert.equal((await request('/contributions',{...valid,dogId:'bella'})).status,409);
 assert.equal((await request('/contributions',{...valid,dogId:'max',frequency:'once'})).status,400);
 assert.equal((await request('/health')).status,200);
});

test('production keeps secure private cookies and rejects foreign origins', async t => {
 const {request}=await fixture(t,{production:true,trustProxyHops:'1'});
 const details={username:'production.test',email:'production@example.com',password:'test-password',confirmPassword:'test-password'};
 const response=await request('/auth/register',details);
 assert.equal(response.status,201);
 const cookie=response.headers.get('set-cookie');
 assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Lax/);assert.match(cookie,/Secure/);assert.match(cookie,/Path=\/api/);
 assert.equal((await request('/auth/login',details,null,'https://untrusted.example')).status,403);
 assert.equal((await request('/auth/login',details,null,process.env.APP_ORIGIN || 'http://localhost:5173')).status,200);
 const sessionCookie=cookie.split(';')[0];
 assert.equal((await (await request('/auth/me',null,sessionCookie)).json()).user.username,details.username);
});
