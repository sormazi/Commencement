import assert from 'node:assert/strict';
import {initial,simulate,resolveContact,cars} from '../dist/physics.js';
import {trafficPose,trafficCount} from '../dist/traffic.js';
const run=(s,input,n=240)=>{for(let i=0;i<n;i++)simulate(s,input,cars[0]);};
let s=initial();run(s,{throttle:1,clutch:true});assert(s.rpm>6000);assert.equal(s.speed,0);assert.equal(s.roadPosition,0);
s=initial();run(s,{throttle:1},600);resolveContact(s,cars[0],{normal:{x:0,z:-1},point:{x:0,z:2}});assert(s.damage>0&&s.hit>0);const damage=s.damage;run(s,{},240);assert.equal(s.damage,damage);assert.equal(s.hit,0);assert.equal(initial().damage,0);
for(let i=0;i<18;i++)for(let t=0;t<160;t+=.25){const a=trafficPose(i,t,0,11),b=trafficPose(i,t+.001,0,11);let delta=((b.z-a.z+700)%1400+1400)%1400-700;assert(Math.abs(delta)<.1);}
assert.equal(trafficCount('none'),0);assert.equal(trafficCount('busy'),18);
console.log('PASS: independent engine revs, persistent impact damage, continuous traffic');
