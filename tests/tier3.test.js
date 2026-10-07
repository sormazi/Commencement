import assert from 'node:assert/strict';
import data from '../dist/campus/data/campus-data.js';
import {classify,facadeCode,CELLS,BAY,blockOf} from '../dist/campus/tier3/facades.js';
import {TIER3_BLOCKS} from '../dist/campus/tier3/blocks.js';
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
const others=data.buildings.filter(b=>!b.nyu);
test('every non-NYU building gets a known facade type, colour and bay',()=>{const used=new Set();for(const b of others){const f=classify(b);assert.ok(f.upper in BAY,'upper '+f.upper);assert.ok(f.ground in CELLS,'ground '+f.ground);assert.ok(Number.isInteger(f.color)&&f.color>0);assert.ok(f.bay>1&&f.bay<5);const c=facadeCode(f);assert.ok(c>=0&&c<16*16);used.add(f.upper);}
 assert.ok(used.size>=6,'variety: '+[...used]);});
test('classes map to sensible types',()=>{const t=(cls,yr,h,floors)=>classify({bin:1,cls,yr,h,floors}).upper;
 assert.equal(t('A4',1840,12,3),'townhouse');assert.equal(t('M1',1850,20,1),'solid');assert.equal(t('D1',1925,40,12),'apartment');assert.equal(t('C4',1905,18,5),'tenement');assert.equal(t('R4',2008,60,18),'curtain');assert.equal(t('K1',1885,20,5),'castiron');});
test('third-tier blocks are real tax blocks in the study area',()=>{const blocks=new Set(others.map(blockOf));for(const k of TIER3_BLOCKS)assert.ok(blocks.has(k),'block '+k);});
console.log(`tier3: ${passed} passed`);
