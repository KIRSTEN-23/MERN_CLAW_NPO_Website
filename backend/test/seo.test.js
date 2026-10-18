import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { serveFrontend } from '../src/frontend-serving.js';

test('public SEO endpoints expose only allowlisted configuration and escape metadata', async t => {
 const app=express();
 serveFrontend(app,{APP_ORIGIN:'https://claw.example',GA_MEASUREMENT_ID:'G-TEST123',GOOGLE_SITE_VERIFICATION:'test_token',MYSQL_PASSWORD:'must-never-leak'});
 const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base=`http://127.0.0.1:${server.address().port}`;
 assert.deepEqual(await (await fetch(base+'/api/public-config')).json(),{gaMeasurementId:'G-TEST123'});
 const html=await (await fetch(base+'/')).text();
 assert.match(html, /name="google-site-verification" content="test_token"/);
 assert.match(html, /rel="canonical" href="https:\/\/claw.example\/"/);
 assert.doesNotMatch(html,/must-never-leak/);
 const sitemap=await (await fetch(base+'/sitemap.xml')).text();
 assert.match(sitemap, /<loc>https:\/\/claw.example\/<\/loc>/); assert.doesNotMatch(sitemap,/#/);
 assert.match(await (await fetch(base+'/robots.txt')).text(),/Disallow: \/api\//);
 assert.equal((await fetch(base+'/backend/.env')).status,404);
});
