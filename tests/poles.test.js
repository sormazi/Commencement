// Pole audit (Avi, 14 Oct 2026): nothing that stands up from the ground may stand in a traffic, bike or parking lane.
// Roadway = the planimetric roadbed minus sidewalks, plazas and raised medians (tools/lib/curbs.mjs).
import assert from 'node:assert/strict';
const D=(await import('../dist/campus/data/campus-data.js')).default;
const F=(await import('../dist/campus/data/street-furniture.js')).default;
const M=(await import('../dist/campus/data/street-markings.js')).default;
const {curbIndex,isKnownGap}=await import('../dist/campus/curbs.js');
const {streetSignAssemblies}=await import('../dist/campus/streetsigns.js');
const {inRoad}=curbIndex(D);
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
const none=(label,pts)=>{const bad=pts.filter(inRoad);assert.equal(bad.length,0,`${bad.length} ${label} in the roadway, e.g. ${JSON.stringify(bad.slice(0,5))}`);};
test('no parking sign post stands in the roadway',()=>none('sign posts',F.signPoles.map(s=>[s[0],s[1]])));
test('no hydrant stands in the roadway',()=>none('hydrants',F.hydrants.map(s=>[s[0],s[1]])));
test('no bus stop pole stands in the roadway',()=>none('bus stop poles',F.busStops.map(s=>[s[0],s[1]])));
test('no traffic signal pole stands in the roadway',()=>none('signal poles',M.poles.map(s=>[s[0],s[1]])));
test('no street lamp stands in the roadway',()=>none('lamps',D.lamps.map(l=>l.p)));
test('no street name sign pole stands in the roadway',()=>none('street sign poles',streetSignAssemblies(D).map(a=>a.p)));
test('no litter basket, drinking fountain or bench stands in the roadway',()=>none('park furniture',D.misc.filter(m=>m.kind==='waste_basket'||m.kind==='drinking_water').map(m=>m.p).concat(D.benches.map(b=>b.p))));
test('no tree stands in the roadway (bar six data gaps checked on orthoimagery)',()=>none('trees',D.trees.map(t=>t.p).filter(p=>!isKnownGap(p))));
console.log(`${passed} pole tests passed`);
