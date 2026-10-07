import * as T from '../../vendor/three.module.js';
import {pointInRing,centroid,ringArea} from '../geometry.js?v=21';
import {CURB_HEIGHT} from '../collision.js?v=21';
import {hash,gu,gv,mp,inSlice,DECAY_BINS} from './decay.js?v=21';
// Phase 4 first slice: the loiterers. People stand about the park and on the Bobst and Kimmel fronts
// doing nobody knows what: facing walls, queueing at locked doors, holding lanyards up to dead card
// readers, sitting in lecture formations on the grass, some in faded graduation gowns. Most slowly
// turn to watch the car. They step aside when it comes close, and if it is too fast the car simply
// passes through them. Nobody is ever hit: there is no collision and no reaction beyond stepping away.
// Cost: one instanced mesh per pose (four), about 150 triangles a figure.
const GU=[.837,-.547],GV=[.547,.837];
// ---- Figures -----------------------------------------------------------------------------------
// Low-poly figures built from boxes, faces +z, feet at y=0, about 1.7 m tall. Vertex colour carries
// the material split (clothes white so the instance colour tints them; skin and trousers fixed).
function part(geos,g,color,{x=0,y=0,z=0,rx=0,ry=0,rz=0}={}){g.rotateX(rx);g.rotateY(ry);g.rotateZ(rz);g.translate(x,y,z);g=g.toNonIndexed();const n=g.attributes.position.count,c=new Float32Array(n*3);for(let i=0;i<n;i++)c.set(color,i*3);g.setAttribute('color',new T.BufferAttribute(c,3));geos.push(g);}
function merge(geos){const P=[],N=[],C=[];for(const g of geos){P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);C.push(...g.attributes.color.array);g.dispose();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.computeBoundingSphere();return g;}
const CLOTH=[1,1,1],SKIN=[.62,.52,.45],LEGS=[.32,.32,.34],DARK=[.12,.12,.13];
function figure(pose){const G=[],B=(w,h,d)=>new T.BoxGeometry(w,h,d);
 const head=(y,z=0)=>{part(G,new T.IcosahedronGeometry(.115,0),SKIN,{y,z});};
 if(pose==='sit'){// Cross-legged on the ground, facing +z.
  part(G,B(.42,.16,.5),LEGS,{y:.08,z:.12});part(G,B(.36,.52,.22),CLOTH,{y:.42});part(G,B(.1,.42,.12),CLOTH,{x:.23,y:.36,z:.06,rx:-.5});part(G,B(.1,.42,.12),CLOTH,{x:-.23,y:.36,z:.06,rx:-.5});head(.8);
  return merge(G);}
 part(G,B(.13,.82,.15),LEGS,{x:.09,y:.41});part(G,B(.13,.82,.15),LEGS,{x:-.09,y:.41});part(G,B(.38,.6,.22),CLOTH,{y:1.12});head(1.56);
 if(pose==='raise'){// Right arm held up and forward, a lanyard card at the end of it.
  part(G,B(.09,.58,.11),CLOTH,{x:-.24,y:1.12});part(G,B(.09,.55,.11),CLOTH,{x:.22,y:1.38,z:.22,rx:-1.25});part(G,B(.07,.1,.01),[.9,.9,.85],{x:.22,y:1.47,z:.5});part(G,B(.012,.28,.012),[.3,.2,.5],{x:.22,y:1.42,z:.42,rx:-.6});}
 else part(G,B(.09,.6,.11),CLOTH,{x:.24,y:1.1}),part(G,B(.09,.6,.11),CLOTH,{x:-.24,y:1.1});
 if(pose==='gown'){// Graduation gown to the shins and a mortarboard.
  part(G,new T.CylinderGeometry(.22,.34,1.05,8,1,true),CLOTH,{y:.82});part(G,new T.CylinderGeometry(.21,.22,.6,8),CLOTH,{y:1.12});part(G,B(.3,.02,.3),DARK,{y:1.72,ry:.6});part(G,B(.17,.08,.17),DARK,{y:1.67});}
 return merge(G);}
const POSES=['stand','raise','sit','gown'];
// ---- Placement ---------------------------------------------------------------------------------
const facingEdge=(ring,dir)=>{const r=ringArea(ring)>0?ring:[...ring].reverse();let best=null;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn);if(L<6)continue;const n=[dn/L,-dx/L],s=(n[0]*dir[0]+n[1]*dir[1])*Math.min(L,40);if(!best||s>best.s)best={a,b,L,n,t:[dx/L,dn/L],s};}return best;};
const yawTo=(from,to)=>Math.atan2(to[0]-from[0],-(to[1]-from[1]));// three.js yaw so local +z faces the target
export function crowdPlan(d,world){const people=[],add=(p,pose,yaw,o={})=>{people.push({home:[...p],p:[...p],pose,yaw,base:yaw,role:o.role||'idle',watch:o.watch??true,tint:o.tint??hash(people.length*3.3)});};
 const park=d.areas.find(a=>a.kind==='park'&&pointInRing([-30,-46],a.ring));const P=park?park.ring:null;const doors=[];
 // Bobst and Kimmel fronts on Washington Sq S: queue at the locked doors, lanyards at the dead card
 // readers, people facing the wall, and a few sitting on the steps.
 for(const [bin,doorAt] of [[DECAY_BINS.bobst,.55],[DECAY_BINS.kimmel,.5]]){const b=d.buildings.find(x=>x.bin===bin);if(!b)continue;const e=facingEdge(b.rings[0],GV);if(!e)continue;
  const at=(u,off)=>[e.a[0]+e.t[0]*u+e.n[0]*off,e.a[1]+e.t[1]*u+e.n[1]*off],door=e.L*doorAt,wallYaw=Math.atan2(-e.n[0],e.n[1]);
  doors.push({p:at(door,0),reader:at(door-1.6,.06),readers:[at(door-1.6,.06),at(door+1.6,.06)],yaw:wallYaw});
  for(const s of [-1,1])add(at(door+s*1.6,.75),'raise',wallYaw,{role:'reader',watch:false});
  for(let k=0;k<13;k++){const q=k<5?at(door+.4,1.6+k*.85):at(door+.4+(k-4)*.8,1.6+4*.85);add(q,k%6===5?'gown':'stand',k<5?wallYaw:yawTo(q,at(door,0)),{role:'queue'});}
  for(let k=0;k<9;k++){const u=4+hash(bin+k)*(e.L-8);if(Math.abs(u-door)<5)continue;add(at(u,.7),hash(bin*2+k)<.15?'gown':'stand',wallYaw,{role:'wall',watch:hash(k*7+bin)<.3});}
  for(let k=0;k<6;k++){const u=door+(k<3?-1:1)*(3+(k%3)*1.1);add(at(u,2.6+hash(k+bin)),'sit',wallYaw+Math.PI,{role:'steps'});}
  for(let k=0;k<10;k++){const q=at(hash(bin*5+k)*e.L,3.5+hash(bin+k*3)*4.5);add(q,hash(k*11+bin)<.2?'gown':'stand',hash(k+bin*9)*6.28,{role:'loiter'});}}
 if(P){// Lecture formations on the four biggest lawns: rows facing a standing figure.
  const lawns=d.areas.filter(a=>(a.kind==='grass'||a.kind==='pitch')&&pointInRing(centroid(a.ring),P)).sort((a,b)=>Math.abs(ringArea(b.ring))-Math.abs(ringArea(a.ring))).slice(0,4);
  lawns.forEach((a,li)=>{const c=centroid(a.ring),face=hash(li*3)*6.28,f=[Math.sin(face),Math.cos(face)],r=[f[1],-f[0]];const lect=[c[0]+f[0]*4.5,c[1]+f[1]*4.5];
   add(lect,'lecturer',Math.atan2(-f[0],f[1]),{role:'lecturer',watch:true});
   for(let row=0;row<3;row++)for(let k=0;k<6;k++){const q=[c[0]-f[0]*row*1.3+r[0]*(k-2.5)*1.0,c[1]-f[1]*row*1.3+r[1]*(k-2.5)*1.0];if(!pointInRing(q,a.ring))continue;add(q,'sit',yawTo(q,lect),{role:'lecture',watch:hash(li*40+row*6+k)<.25});}});
  // A graduating class standing in rows on the plaza north of the fountain, facing the Arch.
  const arch=[0,0],g0=[-24,-26];for(let row=0;row<2;row++)for(let k=0;k<7;k++){const q=[g0[0]+GU[0]*(k-3)*1.1-GV[0]*row*1.2,g0[1]+GU[1]*(k-3)*1.1-GV[1]*row*1.2];add(q,'gown',yawTo(q,arch),{role:'class',watch:hash(row*7+k)<.4});}
  // Loiterers across the park, some standing nose to a tree.
  const trees=d.trees.filter(t=>pointInRing(t.p,P));let k=0;
  for(let i=0;i<70;i++){const t=trees[Math.floor(hash(i*13.7)*trees.length)];if(!t)break;const a=hash(i*3.9)*6.28,toTree=i%4===0;const q=toTree?[t.p[0]+Math.sin(a)*.75,t.p[1]+Math.cos(a)*.75]:[t.p[0]+Math.sin(a)*(3+hash(i)*6),t.p[1]+Math.cos(a)*(3+hash(i)*6)];
   if(!pointInRing(q,P))continue;add(q,hash(i*17)<.18?'gown':'stand',toTree?yawTo(q,t.p):hash(i*29)*6.28,{role:toTree?'tree':'loiter',watch:!toTree||hash(i)<.2});k++;}}
 return {people,doors};}
// ---- Runtime -----------------------------------------------------------------------------------
export function buildCrowd(world){const d=world.data,group=new T.Group();group.name='loiterers';const keep=x=>{world.disposables.add(x);return x;};
 const {people,doors}=crowdPlan(d,world);
 const mat=keep(new T.MeshStandardMaterial({vertexColors:true,roughness:.92}));const meshes={},idx={};
 people.forEach(p=>{if(p.pose==='lecturer')p.pose='stand';});
 for(const pose of POSES){const list=people.filter(p=>p.pose===pose);if(!list.length)continue;const m=new T.InstancedMesh(keep(figure(pose)),mat,list.length);m.frustumCulled=false;m.castShadow=false;m.name='crowd-'+pose;meshes[pose]=m;idx[pose]=list;group.add(m);}
 // Tints: washed-out clothes; gowns faded violet to grey.
 const c=new T.Color();for(const [pose,list] of Object.entries(idx))list.forEach((p,i)=>{if(pose==='gown')c.setHSL(.76,.1+p.tint*.12,.2+p.tint*.14);else c.setHSL(.05+p.tint*.6,.05+p.tint*.08,.16+p.tint*.22);meshes[pose].setColorAt(i,c);});
 // Dead card readers by the doors.
 const rg=keep(new T.BoxGeometry(.12,.18,.05)),rm=keep(new T.MeshStandardMaterial({color:0x1c1d1f,roughness:.5,metalness:.4}));const readers=new T.InstancedMesh(rg,rm,doors.length*2),o3=new T.Object3D();
 doors.forEach((dr,i)=>dr.readers.forEach((q,j)=>{o3.position.set(q[0],CURB_HEIGHT+1.25,-q[1]);o3.rotation.set(0,dr.yaw,0);o3.scale.set(1,1,1);o3.updateMatrix();readers.setMatrixAt(i*2+j,o3.matrix);}));readers.computeBoundingSphere();group.add(readers);
 const write=()=>{for(const [pose,list] of Object.entries(idx)){const m=meshes[pose];list.forEach((p,i)=>{o3.position.set(p.p[0],CURB_HEIGHT+.01,-p.p[1]);o3.rotation.set(0,p.yaw,0);o3.scale.setScalar(.94+p.tint*.12);o3.updateMatrix();m.setMatrixAt(i,o3.matrix);});m.instanceMatrix.needsUpdate=true;}};write();
 let last=0;
 return {group,people,doors,update(state,time){const dt=Math.min(.1,Math.max(0,time-last));last=time;if(!state||!state.position)return;const cx=state.position.x,cn=state.position.z,yaw=state.orientation?.yaw||0,fwd=[Math.sin(yaw),Math.cos(yaw)],v=Math.abs(state.speed||0);let moved=false;
  for(const p of people){const dx=p.p[0]-cx,dn=p.p[1]-cn,dist=Math.hypot(dx,dn);if(dist>60&&p.p[0]===p.home[0]&&p.p[1]===p.home[1])continue;
   // Turn slowly to watch the car when it is near; drift back to the old pose when it has gone.
   const target=p.watch&&dist<32?Math.atan2(cx-p.p[0],-(cn-p.p[1])):p.base;let dy=target-p.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const turn=Math.min(Math.abs(dy),dt*(p.watch&&dist<32?.55:.25))*Math.sign(dy);if(Math.abs(turn)>1e-4){p.yaw+=turn;moved=true;}
   // Step aside from a car coming at them (not if it is already too fast to dodge: it passes through).
   const ahead=dx*fwd[0]+dn*fwd[1],side=dx*fwd[1]-dn*fwd[0];
   if(ahead>-1&&ahead<7&&Math.abs(side)<2.3&&v>.5&&v<14&&p.pose!=='sit'){const s=side>=0?1:-1,push=dt*2.2;p.p[0]+=fwd[1]*s*push;p.p[1]+=-fwd[0]*s*push;moved=true;}
   else if(dist>14){const hx=p.home[0]-p.p[0],hn=p.home[1]-p.p[1],h=Math.hypot(hx,hn);if(h>.01){const k=Math.min(1,dt*.4/h);p.p[0]+=hx*k;p.p[1]+=hn*k;moved=true;}}}
  if(moved)write();}};}
