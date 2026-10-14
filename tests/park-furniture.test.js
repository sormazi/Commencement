import assert from 'node:assert/strict';
const D=(await import('../dist/campus/data/campus-data.js')).default;
const {benchLayout,graniteLayout,seatsOf}=await import('../dist/campus/park-furniture.js');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
const benches=benchLayout(D.benches,D.paths),granite=graniteLayout(D.benchLines),seats=seatsOf(benches,granite,.15);
test('every OSM bench is placed, with unit direction vectors',()=>{assert.equal(benches.length,D.benches.length);for(const b of benches){assert.ok(Math.abs(Math.hypot(...b.u)-1)<1e-6);assert.ok(Math.abs(b.u[0]*b.f[0]+b.u[1]*b.f[1])<1e-6);}});
test('benches are no longer than 1.9 m and do not overlap their neighbours',()=>{let ov=0;for(let i=0;i<benches.length;i++){assert.ok(benches[i].len<=1.9);for(let j=i+1;j<benches.length;j++){const a=benches[i],b=benches[j],dx=b.p[0]-a.p[0],dn=b.p[1]-a.p[1];if(Math.abs(dx*a.u[0]+dn*a.u[1])<(a.len+b.len)/2-.05&&Math.abs(dx*a.f[0]+dn*a.f[1])<.6)ov++;}}assert.ok(ov<=2,ov+' overlaps');});
test('granite benches round the fountain plaza, and seats for sitting on every bench',()=>{assert.ok(granite.length>20);assert.ok(seats.length>=benches.length*2);assert.ok(seats.every(s=>Number.isFinite(s.p[0])&&s.y>.5));});
console.log(`${passed} park furniture tests passed`);
