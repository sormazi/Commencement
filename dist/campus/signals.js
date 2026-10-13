import * as T from '../vendor/three.module.js';
// Traffic and pedestrian signals (roads survey, 13 Oct 2026). Pole positions come from tools/build-markings.mjs:
// one galvanized pole on every corner of each intersection that has a signal in OpenStreetMap, 0.6 m in from
// the curb. Each pole carries, for each of its two streets, a vehicle signal facing back along that street (for
// traffic coming through the intersection towards it) and a pedestrian signal facing across the other street.
// What they look like follows Street View (Broadway at E 8th St, Apr 2026): yellow three-lamp heads on grey
// poles; pedestrian heads are black boxes with the orange hand and white walking figure.
// Timing: a 90 s cycle per intersection with its own offset: one axis green 42 s, amber 3 s, then red while the
// other axis runs; walk for the first 30 s of the parallel green, then a flashing hand for 12 s. In 2126 the
// signals are dead.
const CYCLE=90,GREEN=42,AMBER=3;
const ON={r:new T.Color(4,.25,.12),y:new T.Color(4,2.2,.15),g:new T.Color(.25,3.2,1.6),walk:new T.Color(2.6,2.6,2.4),hand:new T.Color(3.6,1.1,.15)};
const OFF={r:new T.Color(.12,.03,.02),y:new T.Color(.12,.09,.02),g:new T.Color(.02,.1,.06),walk:new T.Color(.05,.05,.05),hand:new T.Color(.08,.04,.02)};
export function buildSignals(poles,{groundY=.15,steel}={}){const g=new T.Group();g.name='signals';const n=poles.length;if(!n)return {group:g,update(){}};
 const o=new T.Object3D(),M=(geo,mat,count)=>{const m=new T.InstancedMesh(geo,mat,count);m.frustumCulled=false;g.add(m);return m;};
 const poleM=M(new T.CylinderGeometry(.075,.09,4.6,8),steel||new T.MeshStandardMaterial({color:0x8d9296,metalness:.5,roughness:.5}),n);
 const headM=M(new T.BoxGeometry(.3,1.02,.36),new T.MeshStandardMaterial({color:0xd9a91c,roughness:.6}),n*2);
 const pedM=M(new T.BoxGeometry(.22,.42,.42),new T.MeshStandardMaterial({color:0x151515,roughness:.7}),n*2);
 const lensGeo=new T.CircleGeometry(.1,14).rotateY(Math.PI/2),lensMat=new T.MeshBasicMaterial({color:0xffffff}),lens={r:M(lensGeo,lensMat,n*2),y:M(lensGeo,lensMat,n*2),g:M(lensGeo,lensMat,n*2)};
 const pedLensGeo=new T.PlaneGeometry(.32,.32).rotateY(Math.PI/2),pedLens=M(pedLensGeo,lensMat,n*2);
 const heads=[];// {pole, axis, offset}
 poles.forEach(([x,nn,a1,a2,ax1,ax2,off],i)=>{o.position.set(x,groundY+2.3,-nn);o.rotation.set(0,0,0);o.updateMatrix();poleM.setMatrixAt(i,o.matrix);
  [[a1,ax1,ax2],[a2,ax2,ax1]].forEach(([a,axV,axP],k)=>{const j=i*2+k,f=a+Math.PI,fx=Math.cos(f),fn=Math.sin(f);// facing back along the street
   const side=k?-.18:.18,px=x+fx*.22-fn*side,pn=nn+fn*.22+fx*side;const ry=Math.atan2(fn,fx);
   o.position.set(px,groundY+3.35,-pn);o.rotation.set(0,ry,0);o.updateMatrix();headM.setMatrixAt(j,o.matrix);
   [['r',.32],['y',0],['g',-.32]].forEach(([c,dy])=>{o.position.set(px+fx*.19,groundY+3.35+dy,-(pn+fn*.19));o.updateMatrix();lens[c].setMatrixAt(j,o.matrix);});
   // The pedestrian head faces across the other street: same rule, lower down, serving the parallel walkers.
   o.position.set(px,groundY+2.55,-pn);o.updateMatrix();pedM.setMatrixAt(j,o.matrix);o.position.set(px+fx*.12,groundY+2.55,-(pn+fn*.12));o.updateMatrix();pedLens.setMatrixAt(j,o.matrix);
   heads.push({axis:axV,off});});});
 for(const m of [lens.r,lens.y,lens.g,pedLens])m.setColorAt(0,OFF.r);
 let last=-1;
 return {group:g,count:n,update(time,dead){const t=Math.floor(time*2)/2;if(t===last)return;last=t;
  heads.forEach((h,j)=>{let s=(((time+h.off)%CYCLE)+CYCLE)%CYCLE;if(h.axis)s=(s+CYCLE/2)%CYCLE;// axis 1 runs half a cycle later
   const green=s<GREEN,amber=s>=GREEN&&s<GREEN+AMBER,red=!green&&!amber;
   lens.r.setColorAt(j,!dead&&red?ON.r:OFF.r);lens.y.setColorAt(j,!dead&&amber?ON.y:OFF.y);lens.g.setColorAt(j,!dead&&green?ON.g:OFF.g);
   const walk=s<30,flash=s>=30&&s<GREEN&&Math.floor(time*1.5)%2===0;pedLens.setColorAt(j,dead?OFF.walk:walk?ON.walk:(s>=30&&s<GREEN)?(flash?ON.hand:OFF.hand):ON.hand);});
  for(const m of [lens.r,lens.y,lens.g,pedLens])m.instanceColor.needsUpdate=true;}};}
