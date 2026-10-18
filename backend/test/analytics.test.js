import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
test('analytics is opt-in, deduplicates strict-mode page views and never forwards query/contact data', async () => {
 const source=(await readFile(new URL('../../frontend/src/components/analytics.js',import.meta.url),'utf8')).replace(/^import .*;$/m,'const React={createElement(){}};').replaceAll('export function','function');
 let choice=null, fetches=0; const scripts=[];
 const sandbox={location:{origin:'https://claw.example'},localStorage:{getItem:()=>choice},document:{title:'Our Dogs',head:{append:s=>scripts.push(s)},createElement:()=>({})},fetch:async()=>{fetches++;return {ok:true,json:async()=>({gaMeasurementId:'G-TEST123'})};},window:{},Set};
 vm.createContext(sandbox);vm.runInContext(source,sandbox);
 sandbox.trackPage({path:'/dogs',email:'never@example.com'});assert.equal(fetches,0);assert.equal(scripts.length,0);
 choice='granted';sandbox.trackPage({path:'/dogs'});sandbox.trackPage({path:'/dogs'});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(scripts.length,1);
 let events=sandbox.window.dataLayer.map(args=>Array.from(args)).filter(args=>args[0]==='event');assert.equal(events.length,1);
 sandbox.trackPage({path:'/terms'});sandbox.trackEvent('sign_up');sandbox.trackEvent('demo_contribution_request');sandbox.trackEvent('purchase');
 events=sandbox.window.dataLayer.map(args=>Array.from(args)).filter(args=>args[0]==='event');assert.equal(events.length,4);
 assert.doesNotMatch(JSON.stringify(events),/never@example.com|purchase|password/);
 choice='denied';sandbox.trackEvent('sign_up');assert.equal(sandbox.window.dataLayer.map(args=>Array.from(args)).filter(args=>args[0]==='event').length,4);
});
