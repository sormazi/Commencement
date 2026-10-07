import assert from 'node:assert/strict';
import {inSlice,DECAY_BINS,treeBoost,decayKind,gu,gv} from '../dist/campus/atmosphere/decay.js';
import data from '../dist/campus/data/campus-data.js';
import {pointInRing,centroid} from '../dist/campus/geometry.js';
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
const B=bin=>data.buildings.find(b=>b.bin===bin);
test('decay slice covers the park and the facing landmarks but never the Brown Building',()=>{
 for(const bin of Object.values(DECAY_BINS))assert.ok(inSlice(centroid(B(bin).rings[0])),'in slice '+bin);
 assert.ok(!Object.values(DECAY_BINS).includes(1008823));assert.ok(!inSlice(centroid(B(1008823).rings[0])),'Brown outside the slice');
 assert.ok(inSlice([-30,-46]),'fountain');});
test('only park trees get the century of growth',()=>{const park=data.areas.find(a=>a.kind==='park'&&pointInRing([-30,-46],a.ring)).ring;
 const inside=data.trees.find(t=>pointInRing(t.p,park)),outside=data.trees.find(t=>!pointInRing(t.p,park)&&!inSlice(t.p));
 assert.ok(treeBoost(inside.p,park).height>1.5);assert.equal(treeBoost(outside.p,park),null);});
test('weathering kinds by material name',()=>{assert.equal(decayKind('glassClear'),'glass');assert.equal(decayKind('iron'),'metal');assert.equal(decayKind('sign'),'light');assert.equal(decayKind('brick'),'masonry');});
console.log('atmosphere: '+passed+' passed');
