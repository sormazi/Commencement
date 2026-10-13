import * as T from '../vendor/three.module.js';
// Street furniture at surveyed positions (roads survey, 13 Oct 2026; data from tools/build-furniture.mjs):
// curb-ramp warning pads, Citi Bike docks, bus stop poles, parking sign poles and fire hydrants. Looks follow
// Street View (University Pl and E 9th St, Sep 2024): pale galvanized poles, a black hydrant body with a silver
// bonnet. Detectable warning pads are the NYC Street Design Manual's red (FED-STD 31350) on concrete sidewalks,
// 0.6 m deep and as wide as the ramp. Citi Bike bikes are generic blue bicycles; no logos or lettering.
// In 2126 the docks stand empty.
export function buildFurniture(F,{groundY=.15}={}){const g=new T.Group();g.name='street-furniture';const o=new T.Object3D(),mats=[],geos=[];
 const mat=(c,r=.7,m=0)=>{const x=new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});mats.push(x);return x;};
 const inst=(geo,material,list,place)=>{geos.push(geo);const im=new T.InstancedMesh(geo,material,Math.max(1,list.length));im.count=list.length;im.frustumCulled=false;list.forEach((it,k)=>{place(it,o);o.updateMatrix();im.setMatrixAt(k,o.matrix);});g.add(im);return im;};
 const at=(x,n,y,ry)=>{o.position.set(x,y,-n);o.rotation.set(0,ry,0);o.scale.set(1,1,1);};
 const galv=mat(0xb9bcbc,.45,.55),red=mat(0x8a3324,.85),white=mat(0xf2f1ec,.6),blue=mat(0x1f5fa8,.5,.2),dark=mat(0x1d1f21,.6,.3),silver=mat(0xd2d4d4,.4,.6),rubber=mat(0x141414,.9);
 // Curb ramps: warning pads, turned to face the roadway.
 inst(new T.BoxGeometry(.6,.02,1),red,F.ramps,([x,n,w,f],O)=>{at(x,n,groundY+.008,f);O.scale.set(1,1,w);});
 // Hydrants: body, bonnet, two side nozzles.
 inst(new T.CylinderGeometry(.13,.16,.62,12),dark,F.hydrants,([x,n,f])=>at(x,n,groundY+.31,f));
 inst(new T.SphereGeometry(.15,12,6,0,Math.PI*2,0,Math.PI/2),silver,F.hydrants,([x,n,f])=>at(x,n,groundY+.6,f));
 inst(new T.CylinderGeometry(.055,.055,.42,8).rotateZ(Math.PI/2),dark,F.hydrants,([x,n,f])=>at(x,n,groundY+.42,f+Math.PI/2));
 // Parking sign poles: a 3 m post with white plates stacked from 2.1 m, facing the roadway.
 inst(new T.CylinderGeometry(.03,.03,3,6),galv,F.signPoles,([x,n,f])=>at(x,n,groundY+1.5,f));
 const plates=[];for(const [x,n,f,k] of F.signPoles)for(let i=0;i<k;i++)plates.push([x,n,f,i]);
 inst(new T.BoxGeometry(.02,.46,.31),white,plates,([x,n,f,i])=>{const fx=Math.cos(f),fn=Math.sin(f);at(x+fx*.04,n+fn*.04,groundY+2.75-i*.5,f);});
 // Bus stops: a pole with a blue stop sign standing edge-on to the curb, so buses coming along the street see it.
 inst(new T.CylinderGeometry(.04,.04,3.2,8),galv,F.busStops,([x,n,f])=>at(x,n,groundY+1.6,f));
 inst(new T.BoxGeometry(.6,.75,.03),blue,F.busStops,([x,n,f])=>at(x,n,groundY+2.75,f));
 // Citi Bike: a base plate along the curb, a dock post every 0.72 m, bikes in about two docks out of three.
 const docks=[],bikes=[],bases=[],kiosks=[];
 for(const [x,n,a,cap,kiosk] of F.citibike){const ux=Math.cos(a),un=Math.sin(a),L=cap*.72;bases.push([x,n,a,L]);if(kiosk)kiosks.push([x-ux*(L/2+.6),n-un*(L/2+.6),a]);
  for(let i=0;i<cap;i++){const s=-L/2+.36+i*.72,px=x+ux*s,pn=n+un*s;docks.push([px,pn,a]);const h=Math.sin((x+i*7.3)*12.9898+n*78.233)*43758.5453;if(h-Math.floor(h)<.66)bikes.push([px,pn,a]);}}
 const dockY=groundY;// docks in the parking lane sit at road level; the small offset is invisible either way
 inst(new T.BoxGeometry(1,.05,.7),galv,bases,([x,n,a,L],O)=>{at(x,n,dockY+.025,a);O.scale.set(L,1,1);});
 inst(new T.BoxGeometry(.12,.85,.22),dark,docks,([x,n,a])=>at(x,n,dockY+.45,a));
 inst(new T.BoxGeometry(.5,2.1,.35),blue,kiosks,([x,n,a])=>at(x,n,dockY+1.05,a));
 // A bike stands across the row (perpendicular to the curb): frame, and two wheels.
 const frame=inst(new T.BoxGeometry(.06,.5,1.15),blue,bikes,([x,n,a])=>at(x,n,dockY+.62,a));
 const wheels=[];for(const [x,n,a] of bikes){const vx=-Math.sin(a),vn=Math.cos(a);wheels.push([x+vx*.52,n+vn*.52,a],[x-vx*.52,n-vn*.52,a]);}
 const wheel=inst(new T.TorusGeometry(.33,.035,6,18).rotateY(Math.PI/2),rubber,wheels,([x,n,a])=>at(x,n,dockY+.36,a));
 return {group:g,setDecay(t){frame.visible=wheel.visible=t<.5;},dispose(){for(const m of mats)m.dispose();for(const x of geos)x.dispose();}};}
