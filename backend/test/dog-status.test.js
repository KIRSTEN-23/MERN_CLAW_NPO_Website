import test from 'node:test';
import assert from 'node:assert/strict';
import { dogStatus } from '../src/dog-status.js';
test('sponsorship expiry releases an in-care dog but never a permanently adopted dog',()=>{
 const record={id:'demo',sponsorshipStartedAt:'2026-01-10'};
 assert.equal(dogStatus(record,new Date('2026-07-09')).available,false);
 assert.equal(dogStatus(record,new Date('2026-07-11')).available,true);
 const placed=dogStatus({...record,permanentAdoptionDate:'2026-02-01'},new Date('2026-07-11'));
 assert.equal(placed.available,false);
 assert.equal(placed.placementStatus,'permanently_adopted');
});
