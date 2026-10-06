import assert from 'node:assert/strict';
import {cars,initial,simulate,resolveContact,FixedVehicleLoop,FIXED_DT,interpolate} from '../dist/physics.js';
const run=(input,seconds,c=cars[0],s=initial(c))=>{for(let i=0;i<Math.round(seconds/FIXED_DT);i++)simulate(s,input,c);return s;};
const finite=s=>{for(const o of [s.position,s.velocity,s.acceleration,s.orientation,s.angularVelocity,s.angularAcceleration])for(const value of Object.values(o))assert(Number.isFinite(value));};
let speeds=cars.map(c=>run({throttle:1},20,c).speed);assert(speeds[0]<speeds[1]&&speeds[1]<speeds[2]);
let s=run({throttle:1},8),before=s.speed;run({brake:1},1,cars[0],s);assert(s.speed<before);run({brake:1},12,cars[0],s);assert(s.speed<0&&s.gear===-1);
s=run({throttle:1},5);run({throttle:1,steer:.5,handbrake:1},2,cars[0],s);finite(s);assert(s.drift>0&&s.orientation.yaw>0);for(const w of s.wheels){assert(w.normalLoad>=0);assert(Math.hypot(w.force.longitudinal,w.force.lateral)<=w.normalLoad*cars[0].mu+1e-6);}
s=run({throttle:1,boost:true},25);assert(s.boost>=0&&s.boost<=100);assert(s.distance>0);
// Deterministic simulation and render-rate independence for identical tick inputs.
const drive=()=>{const loop=new FixedVehicleLoop(cars[1]);for(let i=0;i<1200;i++)loop.advance(FIXED_DT,{throttle:1,steer:i>500&&i<700?.35:0});return loop.state;};assert.deepEqual(drive(),drive());
let states=[];for(const hz of [30,60,144]){const loop=new FixedVehicleLoop();for(let i=0;i<hz*10;i++)loop.advance(1/hz,{throttle:1});assert.equal(loop.state.tick,1200);states.push(loop.state);}assert.deepEqual(states[0],states[1]);assert.deepEqual(states[0],states[2]);
const loop=new FixedVehicleLoop();loop.advance(3,{throttle:1});assert.equal(loop.state.tick,12);assert(loop.droppedTime>2.8);assert(loop.accumulator<FIXED_DT);
// Impulses cannot add energy at a passive stationary wall.
s=run({throttle:1},5);const energy=.5*cars[0].mass*(s.velocity.x**2+s.velocity.z**2)+.5*cars[0].yawInertia*s.angularVelocity.yaw**2;resolveContact(s,cars[0],{normal:{x:0,z:-1},point:{x:0,z:2}});const after=.5*cars[0].mass*(s.velocity.x**2+s.velocity.z**2)+.5*cars[0].yawInertia*s.angularVelocity.yaw**2;assert(after<=energy);assert(s.damage>0);
s=run({throttle:1},5);resolveContact(s,cars[0],{normal:{x:0,z:-1},point:{x:.8,z:2}});assert(Math.abs(s.angularVelocity.yaw)>0,'Offset impacts must generate angular impulse');
let a=initial(),b=structuredClone(a);b.position.z=10;assert.equal(interpolate(a,b,.5).position.z,5);assert.equal(a.position.z,0);
// Long aggressive replay stays finite, including reverse, steering and handbrake.
s=initial();for(let i=0;i<24000;i++){simulate(s,{throttle:i%1200<800?1:0,brake:i%1200>=800?1:0,steer:Math.sin(i*.015),handbrake:i%700<100?1:0},cars[0]);finite(s);}assert(Math.abs(s.position.y-.47)<.2);
s=initial();for(let i=0;i<240;i++)simulate(s,{throttle:1},cars[0],FIXED_DT,()=>({height:0,grip:0}));assert.equal(s.speed,0,'No grip means engine cannot propel the body');assert(s.wheels.some(w=>w.omega>1));
s=initial();s.position.y=1.5;simulate(s,{throttle:1},cars[0]);assert(s.acceleration.y< -9);assert(s.wheels.every(w=>w.normalLoad===0));
s=run({throttle:1},4);assert(s.wheels[2].normalLoad>s.wheels[2].suspension.load,'Acceleration transfers tire load rearward');
const firstGear=run({throttle:1,manual:true},20);assert(firstGear.speed<speeds[0]);assert.equal(firstGear.gear,1);
assert.throws(()=>new FixedVehicleLoop({...cars[0],mass:0}));assert.throws(()=>new FixedVehicleLoop().advance(Infinity,{}));
console.log('PASS: forces/grip, braking/reverse, drift, 30/60/144 Hz equivalence, deterministic replay, stall protection, passive collision energy, interpolation, 200-second stability');
