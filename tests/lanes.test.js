// Bike and bus lanes (roads survey (b)): generated lanes sit on the roadbed, beside the curb, buses keep right.
import assert from 'node:assert/strict';
import data from '../dist/campus/data/campus-data.js';
import {STREET_LANES} from '../dist/campus/data/street-lanes.js';
import {laneMarks} from '../dist/campus/lanes.js';
let passed=0;const ok=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
const pip=(p,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const onRoad=p=>data.roadbed.some(poly=>pip(p,poly[0]));
ok('lanes: green protected and painted bike lanes and red bus lanes are all present',()=>{
 for(const s of ['protected','painted'])assert.ok(STREET_LANES.some(l=>l.kind==='bike'&&l.style===s),s);
 assert.ok(STREET_LANES.some(l=>l.kind==='bus'&&/14/.test(l.street)),'14 St bus lanes');});
ok('lanes: at least 97% of lane-centre samples outside intersections are on the roadbed',()=>{
 const pts=STREET_LANES.flatMap(l=>l.pts.filter(p=>!p[2]));const step=Math.ceil(pts.length/1500);let n=0,on=0;
 for(let i=0;i<pts.length;i+=step){n++;if(onRoad(pts[i]))on++;}assert.ok(on/n>.97,`${on}/${n}`);});
ok('lanes: buses keep right on E 14 St (eastbound south of the westbound lane)',()=>{
 const mid=d=>{const l=STREET_LANES.filter(l=>l.kind==='bus'&&l.street==='EAST 14 STREET'&&l.dir===d).flatMap(l=>l.pts);return l.reduce((a,p)=>a+(p[1]*Math.cos(.506)-p[0]*Math.sin(.506)),0)/l.length;};
 assert.ok(mid('EB')<mid('WB'),'EB lane is on the grid-south side');});
ok('lanes: marking pieces are short, flat and finite',()=>{const m=laneMarks();assert.ok(m.length>5000);
 for(const [a,b,w] of m){const L=Math.hypot(b[0]-a[0],b[1]-a[1]);assert.ok(Number.isFinite(L)&&L<=6&&w>0&&w<4);}});
console.log(`lanes: ${passed} passed`);
