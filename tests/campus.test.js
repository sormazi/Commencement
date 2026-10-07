import assert from 'node:assert/strict';
import {makeProjection,ARCH_ORIGIN,metresPerDegree} from '../dist/campus/projection.js';
import {campus,snapToStreet} from '../dist/campus/campus.js';
import {initial,simulate,resolveContact,cars,FIXED_DT} from '../dist/physics.js';
const c=campus(),{data,streets,collision}=c,P=makeProjection(data.meta.origin);
// ---- Projection: origin at the Arch, round trip, and agreement with great-circle distance.
assert(Math.abs(data.meta.origin.lat-ARCH_ORIGIN.lat)<1e-6&&Math.abs(data.meta.origin.lon-ARCH_ORIGIN.lon)<1e-6,'Arch is the map origin');
const hav=(a,b)=>{const R=6371008.8,r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lon-a.lon)*r,h=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h));};
for(const p of [{lat:40.7294,lon:-73.9972},{lat:40.7359,lon:-73.9911},{lat:40.7247,lon:-73.9985},{lat:40.7302,lon:-74.0008}]){const [x,n]=P.toLocal(p.lat,p.lon),back=P.toLatLon(x,n);assert(Math.abs(back.lat-p.lat)<1e-9&&Math.abs(back.lon-p.lon)<1e-9);const d=Math.hypot(x,n),g=hav(ARCH_ORIGIN,p);assert(Math.abs(d-g)/g<.003,`projection distance ${d} vs ${g}`);}
assert(metresPerDegree(40.73).lat>111000&&metresPerDegree(40.73).lon<85000);
// ---- Street graph: the named streets of the study area exist and connect.
const required=['5 Av','Washington Sq N','Washington Sq S','Washington Sq E','Washington Sq W','University Pl','W 4 St','Washington Pl','Waverly Pl','MacDougal St','Sullivan St','Thompson St','LaGuardia Pl','Mercer St','Greene St','Wooster St','Broadway','Bleecker St','W 3 St','W Houston St','E Houston St','W 8 St','E 8 St','Astor Pl','E 10 St','E 11 St','E 12 St','E 13 St','E 14 St','Washington Mews','MacDougal Alley','6 Av · Av of the Americas','Lafayette St','3 Av'];
for(const name of required)assert(streets.names.includes(name),'Missing street '+name);
const sizes=streets.componentSizes();assert(sizes[0]/streets.nodes.length>.9,'Street graph is mostly one connected network');
for(const e of data.streets.segments)assert(e.width>=2&&e.width<40&&e.pts.length>=2);
// Fifth Avenue ends at Washington Square North, just north of the Arch.
const fifthEnd=streets.nodes.map((p,i)=>({p,i})).filter(({i})=>streets.namesFor(i).includes('5 Av')).sort((a,b)=>Math.hypot(...a.p)-Math.hypot(...b.p))[0];
assert(streets.namesFor(fifthEnd.i).includes('Washington Sq N'),'Fifth Avenue meets Washington Square North');assert(Math.hypot(...fifthEnd.p)<45&&fifthEnd.p[1]>0);
// Washington Square East continues north as University Place at the Waverly Place / Washington Sq N corner.
const wse=streets.nearest(109,-88,20),up=streets.nearest(180,20,30);assert.equal(wse.name,'Washington Sq E');assert.equal(up.name,'University Pl');
const ne=streets.nodes.findIndex((p,i)=>['Washington Sq E','University Pl','Waverly Pl','Washington Sq N'].every(n=>streets.namesFor(i).includes(n)));assert(ne>=0,'NE corner joins Washington Sq E, University Pl, Waverly Pl and Washington Sq N');
const route=streets.route([30,40],[0,-220]);assert(Number.isFinite(route)&&route<600,'Fifth Av to Washington Sq S is reachable by road');
// ---- Spawn and surfaces.
assert.equal(streets.streetAt(c.spawn.x,c.spawn.z),'5 Av');assert.equal(collision.surface(c.spawn.x,c.spawn.z).height,0);
const toArch=Math.atan2(-c.spawn.x,-c.spawn.z);assert(Math.cos(c.spawn.yaw-toArch)>.95,'Spawn faces the Arch');
assert.equal(collision.surface(0,0).kind,'paving');assert(collision.surface(0,0).height>.1,'Park paving sits at curb height');
const lawn=data.areas.find(a=>a.kind==='grass'&&Math.hypot(...a.ring[0])<160);const lp=lawn.ring.reduce((s,p)=>[s[0]+p[0]/lawn.ring.length,s[1]+p[1]/lawn.ring.length],[0,0]);if(collision.surface(...lp).kind==='grass')assert(collision.surface(...lp).grip<.8);
// ---- Collision: Arch opening is passable, piers, fountain, Hangman's Elm and buildings are solid.
assert.equal(collision.solidAt(0,0),null,'Arch opening is open');for(const p of collision.piers){const m=p.reduce((s,q)=>[s[0]+q[0]/4,s[1]+q[1]/4],[0,0]);assert.equal(collision.solidAt(...m),'arch');}
const fountain=data.areas.find(a=>a.kind==='fountain'&&a.name==='Washington Square Fountain'),fc=fountain.ring.reduce((s,p)=>[s[0]+p[0]/fountain.ring.length,s[1]+p[1]/fountain.ring.length],[0,0]);assert.equal(collision.solidAt(...fc),'fountain');
const elm=data.trees.find(t=>t.landmark);assert(elm&&collision.solidAt(...elm.p)==='tree','Hangman\'s Elm stands and is solid');assert(elm.p[0]<-60&&elm.p[1]>40,'Hangman\'s Elm is in the northwest corner');
const bobst=data.buildings.find(b=>/Bobst/.test(b.name||''));assert(bobst&&bobst.h>35&&bobst.nyu);const bc=bobst.rings[0].reduce((s,p)=>[s[0]+p[0]/bobst.rings[0].length,s[1]+p[1]/bobst.rings[0].length],[0,0]);assert.equal(collision.solidAt(...bc),'building');
for(const name of ['Kimmel','Silver Center','Brown Building','Weinstein','Furman','Judson'])assert(data.buildings.some(b=>(b.names||[]).some(n=>n.includes(name))),'Missing building '+name);
// Driving south from the spawn passes through the Arch without touching it.
let s=initial(cars[0]);Object.assign(s.position,{x:c.spawn.x,z:c.spawn.z});s.orientation.yaw=c.spawn.yaw;let archHits=0,passed=false;
for(let i=0;i<120*20;i++){simulate(s,{throttle:.5},cars[0],FIXED_DT,c.surface);for(const k of collision.contacts(s.position.x,s.position.z,s.orientation.yaw)){if(k.kind==='arch')archHits++;resolveContact(s,cars[0],k);}if(s.position.z<-5){passed=true;break;}}
assert(passed,'Car reaches the south side of the Arch');assert.equal(archHits,0,'Arch opening fits the car');assert(s.position.y>.55,'Car climbed the curb onto park paving');
// Driving hard into Bobst stops the car at the wall: no tunnelling, finite state, damage recorded.
const wall=streets.nearest(bc[0],bc[1]+40,80);s=initial(cars[2]);const start=[bc[0],bc[1]+45];Object.assign(s.position,{x:start[0],z:start[1]});s.orientation.yaw=Math.atan2(bc[0]-start[0],bc[1]-start[1]);
for(let i=0;i<120*10;i++){simulate(s,{throttle:1},cars[2],FIXED_DT,c.surface);for(const k of collision.contacts(s.position.x,s.position.z,s.orientation.yaw))resolveContact(s,cars[2],k);assert(collision.solidAt(s.position.x,s.position.z)!=='building','Car centre never enters Bobst');for(const v of [s.position.x,s.position.z,s.velocity.x,s.velocity.z])assert(Number.isFinite(v));}
assert(s.damage>0,'Impact registers damage');assert(wall,'Bobst fronts a street');
// Reset snaps a car stuck in the park or a building back to the nearest street.
const snap=snapToStreet(c,bc[0],bc[1],0);assert(streets.streetAt(snap.x,snap.z));
assert(data.meta.sources.some(s=>/OpenStreetMap/.test(s.name)&&/ODbL/.test(s.licence)));
console.log(`PASS: campus projection, ${streets.names.length} named streets / ${streets.nodes.length} graph nodes, Arch/fountain/Elm/building collision, curb surfaces, spawn and reset`);
// ---- NYC 3D Building Model (2014 LoD2) roofs: coverage and agreement with footprint heights.
const {default:model}=await import('../dist/campus/data/campus-3d.js');
const covered=data.buildings.filter(b=>model[b.bin]).length;assert(covered/data.buildings.length>.9,'Most buildings use 3D-model roofs');
for(const [name,bin] of [['Bobst',1008626],['Kimmel',1008662],['Silver Center',1008820],['Weinstein',1080105],['Brown',1008823],['Silver Tower I',1087825]]){const m=model[bin],fp=data.buildings.find(b=>b.bin===bin);assert(m,'3D roofs for '+name);assert(Math.abs(m.top-fp.h)<Math.max(6,.2*fp.h),name+' 3D height agrees with footprint');for(const r of m.roofs)for(let i=2;i<r.length;i+=3)assert(r[i]>=-1&&r[i]<120);}
console.log(`PASS: 3D model roofs cover ${covered} of ${data.buildings.length} footprints; landmark heights agree`);
