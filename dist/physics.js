// SI units. World +Z is forward, +X right, +Y up; positive yaw turns right.
// No browser, rendering, mapping or timing dependencies.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const FIXED_DT=1/120;
const base={mass:1320,cgHeight:.49,wheelbase:2.65,frontWeight:.54,track:1.56,yawInertia:2050,rollInertia:580,pitchInertia:1850,wheelRadius:.34,wheelInertia:1.7,springRate:39000,damperRate:4300,suspensionTravel:.18,rideHeight:.47,mu:1.2,cornerStiffness:42000,longStiffness:2400,engineInertia:.35,peakTorque:310,idleRPM:950,redline:7600,gears:[3.2,2.1,1.55,1.2,.97,.8],reverseRatio:3.1,finalDrive:3.8,driveFront:0,dragArea:.7,rollingResistance:.014,brakeTorque:2200,handbrakeTorque:1800,steerMax:.55,steerRate:2.4,tractionControl:.35,stabilityAssist:6500};
export const cars=[{...base,name:'KITE / S1',type:'Lightweight tuner',max:58,color:'#ceff59',mass:1180,peakTorque:285,yawInertia:1650,driveFront:.55},{...base,name:'VESPER / GT',type:'Sports coupe',max:75,color:'#67d9ef',peakTorque:410,mu:1.25},{...base,name:'PHANTOM / R',type:'Supercar',max:94,color:'#dd95fa',mass:1480,peakTorque:590,mu:1.35,yawInertia:2300,driveFront:.3,dragArea:.62}];
export function initial(c=cars[0]){const s={position:{x:0,y:c.rideHeight,z:0},velocity:{x:0,y:0,z:0},acceleration:{x:0,y:0,z:0},orientation:{yaw:0,pitch:0,roll:0},angularVelocity:{yaw:0,pitch:0,roll:0},angularAcceleration:{yaw:0,pitch:0,roll:0},localVelocity:{longitudinal:0,lateral:0},steeringAngle:0,throttle:0,brake:0,handbrake:0,engineOmega:c.idleRPM*Math.PI/30,rpm:c.idleRPM,gear:1,shiftTimer:0,boost:100,damage:0,crash:0,impact:0,hit:0,distance:0,top:0,score:0,drift:0,checkpoint:1,tick:0,shiftLatch:0,wheels:Array.from({length:4},()=>({rotation:0,omega:0,steeringAngle:0,suspension:{compression:0,velocity:0,load:0},slip:{ratio:0,angle:0},force:{longitudinal:0,lateral:0},normalLoad:0}))};s.wheels.forEach((w,i)=>{const load=c.mass*9.81*(i<2?c.frontWeight:1-c.frontWeight)/2;w.normalLoad=load;w.suspension.load=load;w.suspension.compression=load/c.springRate;});sync(s);return s;}
function sync(s){const y=s.orientation.yaw,co=Math.cos(y),si=Math.sin(y);s.localVelocity.longitudinal=s.velocity.x*si+s.velocity.z*co;s.localVelocity.lateral=s.velocity.x*co-s.velocity.z*si;s.speed=s.localVelocity.longitudinal;s.lateral=s.position.x;s.roadPosition=s.position.z;s.yaw=y;s.yawRate=s.angularVelocity.yaw;s.lateralVelocity=s.velocity.x;s.slip=y/.21;s.rpm=s.engineOmega*30/Math.PI;s.engineRPM=s.rpm;s.currentGear=s.gear;}
export function inputFromKeys(k,manual=false){return {throttle:k.w||k.arrowup?1:0,brake:k.s||k.arrowdown?1:0,steer:(!!(k.d||k.arrowright))-(!!(k.a||k.arrowleft)),handbrake:k[' ']?1:0,clutch:!!k.c,boost:!!k.shift,manual,shift:(!!k.e)-(!!k.q)};}
export function shift(s,direction){s.gear=clamp(s.gear+direction,1,6);s.shiftTimer=.16;}
export function simulate(s,input,c,dt=FIXED_DT,surface=()=>({height:0,grip:1})){if(!(dt>0&&dt<=.02))throw Error('Use fixed physics steps of at most 20 ms');
 sync(s);if(input.manual&&input.shift&&input.shift!==s.shiftLatch)shift(s,input.shift);s.shiftLatch=input.shift||0;const u=s.localVelocity.longitudinal,v=s.localVelocity.lateral,r=s.angularVelocity.yaw,co=Math.cos(s.orientation.yaw),si=Math.sin(s.orientation.yaw);
 s.throttle+=clamp(clamp(input.throttle||0,0,1)-s.throttle,-dt*6,dt*4);s.brake=clamp(input.brake||0,0,1);s.handbrake=clamp(input.handbrake||0,0,1);
 const reverse=s.brake>.2&&s.throttle<.1&&u<.4;if(reverse)s.gear=-1;else if(s.throttle>.1&&s.gear<1)s.gear=1;
 const brake=reverse?0:s.brake,throttle=reverse?s.brake*.6:s.throttle,burnout=throttle>.2&&brake>.2&&Math.abs(u)<3;
 const steerTarget=clamp(input.steer||0,-1,1)*c.steerMax/(1+u*u/81);s.steeringAngle+=clamp(steerTarget-s.steeringAngle,-c.steerRate*dt,c.steerRate*dt);
 if(!input.manual&&!input.clutch&&!burnout&&s.shiftTimer<=0&&s.gear>0){if(s.rpm>6600&&s.gear<6)shift(s,1);else if(s.rpm<2200&&s.gear>1)shift(s,-1);}s.shiftTimer=Math.max(0,s.shiftTimer-dt);
 const boosting=!!input.boost&&throttle>.5&&brake<.1&&s.boost>0&&!input.clutch&&s.crash<=0;
 const ratio=(s.gear<0?-c.reverseRatio:c.gears[s.gear-1])*c.finalDrive;
 const driven=(i)=>burnout?(i<2?0:.5):(i<2?c.driveFront/2:(1-c.driveFront)/2);
 const wheelOmega=s.wheels.reduce((a,w,i)=>a+w.omega*driven(i),0);
 const engineTarget=Math.abs(wheelOmega*ratio),idle=c.idleRPM*Math.PI/30,redline=c.redline*Math.PI/30;
 const torqueCurve=.65+.35*Math.sin(clamp(s.rpm/c.redline,0,1)*Math.PI),engineTorque=c.peakTorque*torqueCurve*throttle*(boosting?1.5:1)*(1-s.damage*.25)*(s.rpm>c.redline?0:1);
 const engaged=!input.clutch&&s.shiftTimer<=0&&s.crash<=0;
 const clutchTorque=engaged?clamp((s.engineOmega-Math.max(idle,engineTarget))*6,-c.peakTorque*.45,c.peakTorque*1.25):0;
 // Idle governor and flywheel inertia. Engine torque reaches the tires through the clutch.
 const governor=clamp((idle-s.engineOmega)*5,0,c.peakTorque*.5),drag=12+s.engineOmega*.018;
 s.engineOmega=clamp(s.engineOmega+(engineTorque+governor-drag-clutchTorque)*dt/c.engineInertia,idle,redline*1.025);
 let fx=0,fz=0,torqueYaw=0,vertical=-c.mass*9.81,rollTorque=0,pitchTorque=0;
 const a=c.wheelbase*(1-c.frontWeight),b=c.wheelbase*c.frontWeight;
 const ax=s.acceleration.x*si+s.acceleration.z*co,ay=s.acceleration.x*co-s.acceleration.z*si;
 for(let i=0;i<4;i++){const w=s.wheels[i],front=i<2,x=(i%2?1:-1)*c.track/2,z=front?a:-b,ground=surface(s.position.x+x*co+z*si,s.position.z-x*si+z*co)||{height:0,grip:1};
 const staticLoad=c.mass*9.81*(front?c.frontWeight:1-c.frontWeight)/2,staticCompression=staticLoad/c.springRate;
 const wheelHeight=s.position.y+s.orientation.roll*x+s.orientation.pitch*z;
 const compression=clamp(staticCompression+c.rideHeight-wheelHeight+ground.height,0,c.suspensionTravel);
 const suspensionVelocity=(compression-w.suspension.compression)/dt;
 // Suspension spring support and damping use body velocities, avoiding finite-difference spikes.
 const verticalSpeed=s.velocity.y+s.angularVelocity.roll*x+s.angularVelocity.pitch*z;
 const springLoad=Math.max(0,c.springRate*compression-c.damperRate*verticalSpeed);
 const transferLong=c.mass*ax*c.cgHeight/c.wheelbase/2*(front?-1:1),transferLat=c.mass*ay*c.cgHeight/c.track/2*(x>0?-1:1);
 const normalLoad=Math.max(0,springLoad+transferLong+transferLat);w.suspension={compression,velocity:suspensionVelocity,load:springLoad};w.normalLoad=normalLoad;
 vertical+=springLoad;rollTorque+=springLoad*x;pitchTorque+=springLoad*z;
 const steer=front?s.steeringAngle:0;w.steeringAngle=steer;const cs=Math.cos(steer),ss=Math.sin(steer);
 const vx=v+r*z,vz=u-r*x,lat=vx*cs-vz*ss,long=vx*ss+vz*cs;
 w.slip.angle=Math.atan2(lat,Math.max(2,Math.abs(long)));w.slip.ratio=(w.omega*c.wheelRadius-long)/Math.max(2,Math.abs(long));
 const mu=c.mu*(ground.grip??1)*(front?1:1-s.handbrake*.45),limit=normalLoad*mu;
 const traction=1-c.tractionControl*clamp(Math.abs(w.slip.ratio)-.2,0,.8);
 let drive=clutchTorque*ratio*.9*driven(i)*traction;
 const brakeTorque=(brake*c.brakeTorque*(burnout&&!front?0:1)+(front?0:s.handbrake*c.handbrakeTorque));
 const spinSign=Math.sign(w.omega||long||ratio);let wheelBrake=spinSign*Math.min(brakeTorque,Math.abs(w.omega)*c.wheelInertia/dt+Math.abs(drive)+Math.abs(long)*c.longStiffness*c.wheelRadius);
 const k=c.longStiffness,predict=(w.omega+dt/c.wheelInertia*(drive-wheelBrake+k*c.wheelRadius*long))/(1+dt/c.wheelInertia*k*c.wheelRadius*c.wheelRadius);
 let tireLong=k*(predict*c.wheelRadius-long),tireLat=-c.cornerStiffness*Math.atan(w.slip.angle)*(front?1:1-s.handbrake*.25);
 const length=Math.hypot(tireLong,tireLat),scale=length>limit&&length>0?limit/length:1;tireLong*=scale;tireLat*=scale;
 w.omega+=(drive-wheelBrake-tireLong*c.wheelRadius)*dt/c.wheelInertia;if(brakeTorque>0&&Math.sign(w.omega)!==spinSign)w.omega=0;w.rotation+=w.omega*dt;w.force={longitudinal:tireLong,lateral:tireLat};
 const wheelX=tireLat*cs+tireLong*ss,wheelZ=tireLong*cs-tireLat*ss;fx+=wheelX;fz+=wheelZ;torqueYaw+=z*wheelX-x*wheelZ;
 }
 const speed=Math.hypot(u,v),airDrag=.5*1.225*c.dragArea*speed;
 fz-=airDrag*u+c.rollingResistance*c.mass*9.81*Math.tanh(u*3);fx-=airDrag*v;
 // Assist is a limited torque, never an orientation or velocity assignment.
 const desiredYaw=Math.abs(u)>1?u*Math.tan(s.steeringAngle)/c.wheelbase:0;
 torqueYaw+=clamp((desiredYaw-r)*c.stabilityAssist,-4000,4000)*(1-s.handbrake*.8);
 s.acceleration={x:(fx*co+fz*si)/c.mass,y:vertical/c.mass,z:(fz*co-fx*si)/c.mass};
 rollTorque-=s.orientation.roll*45000+s.angularVelocity.roll*7000;pitchTorque-=s.orientation.pitch*55000+s.angularVelocity.pitch*9500;
 // Body inertial weight transfer excites pitch/roll; suspension opposes it.
 rollTorque-=c.mass*ay*c.cgHeight;pitchTorque+=c.mass*ax*c.cgHeight;
 s.angularAcceleration={yaw:torqueYaw/c.yawInertia,roll:rollTorque/c.rollInertia,pitch:pitchTorque/c.pitchInertia};
 for(const k of ['x','y','z']){s.velocity[k]+=s.acceleration[k]*dt;s.position[k]+=s.velocity[k]*dt;}
 for(const k of ['yaw','pitch','roll']){s.angularVelocity[k]+=s.angularAcceleration[k]*dt;s.orientation[k]+=s.angularVelocity[k]*dt;}
 s.distance+=speed*dt;s.top=Math.max(s.top,speed);s.boost=clamp(s.boost+dt*(boosting?-24:8),0,100);s.hit=Math.max(0,s.hit-dt);s.crash=Math.max(0,s.crash-dt);s.impact=Math.max(0,s.impact-dt*2);s.tick++;sync(s);
 const drifting=Math.abs(Math.atan2(v,Math.max(1,Math.abs(u))))>.12&&speed>8||s.handbrake>.1&&speed>8;
 if(drifting){const points=Math.abs(v)*dt*10;s.drift+=points;s.score+=points;}s.score+=Math.max(0,speed-30)*dt*.3;
 return {steer:input.steer||0,drifting,boosting,burnout,clutch:!!input.clutch,throttle:throttle>.1};
}
export function resolveContact(s,c,contact){const norm=Math.hypot(contact.normal.x,contact.normal.z);if(norm<1e-8)return 0;const n={x:contact.normal.x/norm,z:contact.normal.z/norm},point=contact.point||{x:0,z:0},other=contact.otherVelocity||{x:0,z:0},co=Math.cos(s.orientation.yaw),si=Math.sin(s.orientation.yaw),rx=point.x*co+point.z*si,rz=point.z*co-point.x*si;
 const vx=s.velocity.x+s.angularVelocity.yaw*rz-other.x,vz=s.velocity.z-s.angularVelocity.yaw*rx-other.z,vn=vx*n.x+vz*n.z;
 if(contact.penetration>0){s.position.x+=n.x*contact.penetration;s.position.z+=n.z*contact.penetration;}
 if(vn>=0){sync(s);return 0;}const lever=rz*n.x-rx*n.z,inverseMass=1/c.mass+lever*lever/c.yawInertia,j=-(1+(contact.restitution??.12))*vn/inverseMass;
 s.velocity.x+=j*n.x/c.mass;s.velocity.z+=j*n.z/c.mass;s.angularVelocity.yaw+=j*lever/c.yawInertia;
 const tx=-n.z,tz=n.x,vt=vx*tx+vz*tz,tl=rz*tx-rx*tz,jt=clamp(-vt/(1/c.mass+tl*tl/c.yawInertia),-j*.35,j*.35);
 s.velocity.x+=jt*tx/c.mass;s.velocity.z+=jt*tz/c.mass;s.angularVelocity.yaw+=jt*tl/c.yawInertia;
 const force=clamp(-vn/55,0,1);s.damage=clamp(s.damage+force*.22,0,1);s.impact=force;s.hit=.3+force*.7;s.crash=force>.5?.5:0;sync(s);return j;
}
// Compatibility adapter for callers supplying key maps; the live loop uses simulate.
export function step(s,k,c,dt,manual=false){return simulate(s,inputFromKeys(k,manual),c,dt);}
export function impact(s,relativeSpeed,side=0,c=cars[0]){return resolveContact(s,c,{normal:{x:side*.3,z:Math.sign(relativeSpeed)>0?-1:1},point:{x:side*.7,z:1.3},otherVelocity:{x:0,z:s.velocity.z-relativeSpeed}});}
export function cloneState(s){return structuredClone(s);}
export function interpolate(a,b,alpha){const s=cloneState(b),mix=(x,y)=>x+(y-x)*alpha;for(const k of ['x','y','z']){s.position[k]=mix(a.position[k],b.position[k]);s.velocity[k]=mix(a.velocity[k],b.velocity[k]);}for(const k of ['yaw','pitch','roll'])s.orientation[k]=mix(a.orientation[k],b.orientation[k]);s.steeringAngle=mix(a.steeringAngle,b.steeringAngle);s.wheels.forEach((w,i)=>{w.rotation=mix(a.wheels[i].rotation,w.rotation);w.steeringAngle=mix(a.wheels[i].steeringAngle,w.steeringAngle);w.suspension.compression=mix(a.wheels[i].suspension.compression,w.suspension.compression);});sync(s);return s;}
export class FixedVehicleLoop{
 constructor(c=cars[0]){for(const k of ['mass','wheelbase','track','yawInertia','rollInertia','pitchInertia','wheelRadius','wheelInertia','springRate','damperRate','mu','engineInertia'])if(!(Number.isFinite(c[k])&&c[k]>0))throw Error('Invalid vehicle parameter: '+k);if(!(c.frontWeight>0&&c.frontWeight<1&&c.driveFront>=0&&c.driveFront<=1&&c.gears.length===6&&c.gears.every(g=>g>0)))throw Error('Invalid axle or gearing configuration');this.config=c;this.reset();}
 reset(){this.state=initial(this.config);this.previous=cloneState(this.state);this.accumulator=0;this.time=0;this.droppedTime=0;this.controls={};}
 advance(elapsed,input,afterStep){if(!Number.isFinite(elapsed))throw Error('Elapsed time must be finite');const frame=Math.max(0,Math.min(.1,elapsed));this.droppedTime+=Math.max(0,elapsed-frame);this.accumulator+=frame;let count=0;while(this.accumulator+1e-10>=FIXED_DT&&count<12){this.previous=cloneState(this.state);this.controls=simulate(this.state,input,this.config,FIXED_DT);this.time+=FIXED_DT;afterStep?.(this.state,FIXED_DT,this.time);this.accumulator-=FIXED_DT;count++;}if(this.accumulator>=FIXED_DT){this.droppedTime+=this.accumulator-this.accumulator%FIXED_DT;this.accumulator%=FIXED_DT;}return interpolate(this.previous,this.state,clamp(this.accumulator/FIXED_DT,0,1));}
}
