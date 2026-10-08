import assert from 'node:assert/strict';
import {VEHICLE,initial,simulate,resolveContact,FixedVehicleLoop,FIXED_DT,interpolate} from '../dist/physics.js';
// The one vehicle: NYU Campus Safety unit 4, a compact electric crossover. Single speed, campus pace, soft.
const c=VEHICLE,run=(input,seconds,s=initial(c))=>{for(let i=0;i<Math.round(seconds/FIXED_DT);i++)simulate(s,input,c);return s;};
const finite=s=>{for(const o of [s.position,s.velocity,s.acceleration,s.orientation,s.angularVelocity,s.angularAcceleration])for(const value of Object.values(o))assert(Number.isFinite(value));};
assert(c.electric&&c.gears.length===1&&c.mass>1500&&c.mass<2600,'one electric crossover, single speed');
// Gentle acceleration and a governed top speed of about 30 km/h, a campus pace.
const a2=run({throttle:1},2).speed;assert(a2>1.2&&a2<3.2,'gentle: '+a2.toFixed(2)+' m/s after 2 s');
const top=run({throttle:1},20).speed;assert(top>7&&top<=c.vmax+.05,'top '+top.toFixed(2));
// No boost, no clutch, no gear shifts: the electric drive ignores them.
assert.equal(run({throttle:1,boost:true},10).speed.toFixed(3),run({throttle:1},10).speed.toFixed(3));const sh=run({throttle:1,manual:true,shift:1},5);assert.equal(sh.gear,1);
// Braking and reverse (slow).
let s=run({throttle:1},8),before=s.speed;run({brake:1},1,s);assert(s.speed<before);run({brake:1},12,s);assert(s.speed<0&&s.gear===-1&&s.speed>-c.vmaxReverse-.1);
// Soft: noticeable body roll in a full-lock turn at speed, but stable and finite.
s=run({throttle:1},6);run({throttle:1,steer:1},4,s);finite(s);assert(Math.abs(s.orientation.roll)>.03&&Math.abs(s.orientation.roll)<.25,'roll '+s.orientation.roll.toFixed(3));
for(const w of s.wheels){assert(w.normalLoad>=0);assert(Math.hypot(w.force.longitudinal,w.force.lateral)<=w.normalLoad*c.mu+1e-6);}
// Deterministic simulation and render-rate independence for identical tick inputs.
const drive=()=>{const loop=new FixedVehicleLoop(c);for(let i=0;i<1200;i++)loop.advance(FIXED_DT,{throttle:1,steer:i>500&&i<700?.35:0});return loop.state;};assert.deepEqual(drive(),drive());
let states=[];for(const hz of [30,60,144]){const loop=new FixedVehicleLoop();for(let i=0;i<hz*10;i++)loop.advance(1/hz,{throttle:1});assert.equal(loop.state.tick,1200);states.push(loop.state);}assert.deepEqual(states[0],states[1]);assert.deepEqual(states[0],states[2]);
const loop=new FixedVehicleLoop();loop.advance(3,{throttle:1});assert.equal(loop.state.tick,12);assert(loop.droppedTime>2.8);assert(loop.accumulator<FIXED_DT);
// Impulses cannot add energy at a passive stationary wall; offset impacts spin the body.
s=run({throttle:1},5);const energy=.5*c.mass*(s.velocity.x**2+s.velocity.z**2)+.5*c.yawInertia*s.angularVelocity.yaw**2;resolveContact(s,c,{normal:{x:0,z:-1},point:{x:0,z:1.5}});const after=.5*c.mass*(s.velocity.x**2+s.velocity.z**2)+.5*c.yawInertia*s.angularVelocity.yaw**2;assert(after<=energy);
s=run({throttle:1},5);resolveContact(s,c,{normal:{x:0,z:-1},point:{x:.6,z:1.5}});assert(Math.abs(s.angularVelocity.yaw)>0,'Offset impacts must generate angular impulse');
let a=initial(),b=structuredClone(a);b.position.z=10;assert.equal(interpolate(a,b,.5).position.z,5);assert.equal(a.position.z,0);
// Long replay stays finite, including reverse, steering and the parking brake.
s=initial();for(let i=0;i<24000;i++){simulate(s,{throttle:i%1200<800?1:0,brake:i%1200>=800?1:0,steer:Math.sin(i*.015),handbrake:i%700<100?1:0},c);finite(s);}assert(Math.abs(s.position.y-c.rideHeight)<.2);
s=initial();for(let i=0;i<240;i++)simulate(s,{throttle:1},c,FIXED_DT,()=>({height:0,grip:0}));assert.equal(s.speed,0,'No grip means the motor cannot propel the body');assert(s.wheels.some(w=>w.omega>1));
s=initial();s.position.y=1.5;simulate(s,{throttle:1},c);assert(s.acceleration.y< -9);assert(s.wheels.every(w=>w.normalLoad===0));
s=run({throttle:1},2);assert(s.wheels[2].normalLoad>s.wheels[2].suspension.load,'Acceleration transfers tyre load rearward');
assert.throws(()=>new FixedVehicleLoop({...c,mass:0}));assert.throws(()=>new FixedVehicleLoop().advance(Infinity,{}));
console.log('PASS: electric utility van: gentle acceleration, governed top speed, slow reverse, soft roll, grip limits, 30/60/144 Hz equivalence, deterministic replay, passive collision energy, interpolation, 200-second stability');
