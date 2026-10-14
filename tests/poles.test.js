// Pole audit (Avi, 14 Oct 2026): nothing that stands up from the ground may stand in a traffic, bike or parking lane.
// Roadway = the planimetric roadbed minus sidewalks, plazas and raised medians (tools/lib/curbs.mjs).
import assert from 'node:assert/strict';
const D=(await import('../dist/campus/data/campus-data.js')).default;
const F=(await import('../dist/campus/data/street-furniture.js')).default;
const M=(await import('../dist/campus/data/street-markings.js')).default;
const {curbIndex}=await import('../tools/lib/curbs.mjs');
const {inRoad}=curbIndex(D);
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
const none=(label,pts)=>{const bad=pts.filter(inRoad);assert.equal(bad.length,0,`${bad.length} ${label} in the roadway, e.g. ${JSON.stringify(bad.slice(0,5))}`);};
test('no parking sign post stands in the roadway',()=>none('sign posts',F.signPoles.map(s=>[s[0],s[1]])));
test('no hydrant stands in the roadway',()=>none('hydrants',F.hydrants.map(s=>[s[0],s[1]])));
test('no bus stop pole stands in the roadway',()=>none('bus stop poles',F.busStops.map(s=>[s[0],s[1]])));
test('no traffic signal pole stands in the roadway',()=>none('signal poles',M.poles.map(s=>[s[0],s[1]])));
test('no street lamp stands in the roadway',()=>none('lamps',D.lamps.map(l=>l.p)));
console.log(`${passed} pole tests passed`);
