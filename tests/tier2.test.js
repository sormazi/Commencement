import assert from 'node:assert/strict';
import data from '../dist/campus/data/campus-data.js';
import {TIER2} from '../dist/campus/tier2/registry.js';
import {TIER2_BINS,buildTier2Geometry} from '../dist/campus/tier2/world.js';
import {LANDMARK_BUILDINGS} from '../dist/campus/landmarks/index.js';
import {pointInRing} from '../dist/campus/geometry.js';
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
const by=new Map(data.buildings.map(b=>[b.bin,b]));
const landmarkBins=new Set(Object.entries(LANDMARK_BUILDINGS).flatMap(([k,L])=>[+k,...(L.also||[])]));
test('every second-tier spec names real buildings, once each, and never a detailed landmark',()=>{const seen=new Set();
 for(const s of TIER2){assert.ok(s.slug&&s.name&&s.source,'fields '+s.slug);for(const bin of [s.bin,...(s.also||[])]){assert.ok(by.has(bin),`${s.slug}: BIN ${bin} in the data`);assert.ok(!seen.has(bin),`${s.slug}: BIN ${bin} used twice`);seen.add(bin);assert.ok(!landmarkBins.has(bin),`${s.slug}: ${bin} is a landmark`);}}});
test('the Brown Building is never a kit building',()=>{assert.ok(!TIER2_BINS.has(1008823));});
const geo=buildTier2Geometry(data.buildings,(x,n)=>Math.floor(x/120)+','+Math.floor(n/120));
test('every second-tier building builds, with windows and at least one entrance door',()=>{assert.equal(geo.stats.length,TIER2.length);
 for(const s of geo.stats){assert.ok(s.tris>100,s.slug+' has geometry');assert.ok(s.doors>=1,s.slug+' has a door');}});
test('doors stand on their building\'s outline, facing out',()=>{for(const d of geo.doors){const spec=TIER2.find(s=>s.bin===d.bin);const rings=[spec.bin,...(spec.also||[])].map(b=>by.get(b).rings[0]);
  const p=[d.pos[0],-d.pos[2]],out=[p[0]+d.normal[0]*2.5,p[1]-d.normal[2]*2.5],inn=[p[0]-d.normal[0]*2.5,p[1]+d.normal[2]*2.5];
  if(/St. Ann/.test(d.name))continue;// the St. Ann's gate stands in front of Founders Hall
  assert.ok(rings.some(r=>pointInRing(inn,r)),`${d.name}: door backs onto the building`);assert.ok(!rings.some(r=>pointInRing(out,r)),`${d.name}: door faces outward`);}});
test('second-tier geometry stays within its triangle budget',()=>{const tris=geo.stats.reduce((a,s)=>a+s.tris,0);assert.ok(tris<900000,'total '+tris);for(const s of geo.stats)assert.ok(s.tris<70000,s.slug+' '+s.tris);});
test('every spec says whether it was observed on Street View or is an estimate; counted bays are whole numbers',()=>{for(const s of TIER2){assert.ok(['observed','estimate'].includes(s.status),s.slug+' status');
  for(const [d,n] of Object.entries(s.bays||{})){assert.ok('nesw'.includes(d)&&Number.isInteger(n)&&n>0,s.slug+' bays '+d);}if(s.storeys)assert.ok(Number.isInteger(s.storeys)&&s.storeys>1);}
 assert.ok(TIER2.filter(s=>s.status==='observed').length>=65,'most buildings observed');});
console.log(`tier2: ${passed} passed`);
