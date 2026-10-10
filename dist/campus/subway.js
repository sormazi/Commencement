// Subway entrances (Step 4B): every entrance in the study area at its MTA position (data/subway-entrances.js).
// Stairs: the dark stairwell opening in the sidewalk, a stone curb and painted iron railing round three sides,
// the two globe lamps at the head (green where you can go in, red where it is exit-only) and the black
// "Subway" sign (a decal in the signage manifest). Elevators: a small glass and steel lift house. The Astor
// Place uptown entrance is the cast-iron kiosk (the 1985 copy of the 1904 original). Entrances inside
// buildings ('easement') get the sign only. Each stairway and its folding gate are separate records in
// world.subway (like world.doors), so they can later lead down into stations. The direction a stair runs is
// taken along the nearest street, descending away from the nearest corner: checked on Street View as the
// survey reaches each corner (RESEARCH/storefronts/subway.md).
// 2126: railings rust, globes go dark (some broken), gates pulled shut.
import * as T from '../vendor/three.module.js';
import {Parts,Face} from './landmarks/kit.js?v=24';
import {SUBWAY_ENTRANCES} from './data/subway-entrances.js?v=24';
export {SUBWAY_ENTRANCES};
const L=4.6,W=1.85,RAIL=1.0,KW=2.9;
const hash=x=>{const s=Math.sin(x*12.9898)*43758.5453;return s-Math.floor(s);};
// Axis along the nearest street, pointing away from that street's nearest end node (the corner).
export function entranceFrames(data){const S=data.streets;return SUBWAY_ENTRANCES.map((e,i)=>{let best=null;
 for(const s of S.segments)for(let k=1;k<s.pts.length;k++){const a=s.pts[k-1],b=s.pts[k],dx=b[0]-a[0],dn=b[1]-a[1],LL=dx*dx+dn*dn||1;let t=((e.p[0]-a[0])*dx+(e.p[1]-a[1])*dn)/LL;t=Math.max(0,Math.min(1,t));
  const q=[a[0]+dx*t,a[1]+dn*t],d=Math.hypot(q[0]-e.p[0],q[1]-e.p[1]);if(!best||d<best.d)best={d,a:s.pts[0],b:s.pts[s.pts.length-1],q};}
 const da=Math.hypot(best.q[0]-best.a[0],best.q[1]-best.a[1]),db=Math.hypot(best.q[0]-best.b[0],best.q[1]-best.b[1]),from=da<db?best.a:best.b,to=da<db?best.b:best.a;
 let ax=[to[0]-from[0],to[1]-from[1]];const l=Math.hypot(...ax)||1;ax=[ax[0]/l,ax[1]/l];
 const kiosk=e.station==='Astor Pl'&&e.p[0]>500;
 // The kiosk's entrance faces north-north-east and the stair runs south-south-west under its glass enclosure (Street View, Apr 2026).
 if(kiosk)ax=[-.5,-.866];return {...e,id:'subway-'+i,axis:ax,kiosk};});}
// Sign decals for the manifest (kind 'sign', drawn in the signage atlas): one per station, placed at each head.
export function subwayDecals(data){const by=new Map();for(const e of entranceFrames(data)){if(e.type==='elevator')continue;const id='subway-'+e.station.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
 if(!by.has(id))by.set(id,{id,file:'assets/signage/'+id+'.png',kind:'sign',lit:true,size:[1.7,.34],bg:'#141414',fg:'#ffffff',lines:['Subway',e.station+'   '+e.routes],font:'sans-bold',
  seen:'Standard MTA entrance sign (white Helvetica on black, here as plain lettering without the route bullets); station and routes from the MTA entrance data',placements:[]});
 const s=by.get(id),n=[-e.axis[0],-e.axis[1]];
 if(e.type==='easement'){s.placements.push({p:[e.p[0]+n[0]*.3,e.p[1]+n[1]*.3],y:2.6,normal:n,where:e.station+' entrance in a building'});continue;}
 if(e.kiosk){if(!by.has('subway-astor-kiosk-entrance'))by.set('subway-astor-kiosk-entrance',{id:'subway-astor-kiosk-entrance',file:'assets/signage/subway-astor-kiosk-entrance.png',kind:'sign',lit:true,size:[1.7,.42],bg:'#14181a',fg:'#d6b45c',lines:['ENTRANCE','UPTOWN'],font:'serif',
   seen:'Astor Place uptown kiosk frieze panels, gold serif capitals on dark glass (Wikimedia Commons "Astor Place Uptown.JPG", CC BY-SA 4.0; Street View Apr 2026)',placements:[]});
  const k=by.get('subway-astor-kiosk-entrance'),ax=e.axis,c=[-ax[1],ax[0]],at=(u,d)=>[e.p[0]+ax[0]*u+c[0]*d,e.p[1]+ax[1]*u+c[1]*d];
  k.placements.push({p:at(-.02,0),y:2.82,normal:[-ax[0],-ax[1]],where:'Astor Pl uptown kiosk, entrance front'});
  for(const sd of [1,-1])k.placements.push({p:at(1.35,sd*(KW/2+.03)),y:2.82,normal:[c[0]*sd,c[1]*sd],where:'Astor Pl uptown kiosk, side'});continue;}
 s.placements.push({p:[e.p[0]+n[0]*.06,e.p[1]+n[1]*.06],y:RAIL+.05,normal:n,where:e.station+' entrance'});}
 return [...by.values()].filter(x=>x.placements.length);}
export function buildSubway(world){const P=new Parts(),y0=world.curbHeight??.15,list=[],frames=entranceFrames(world.data),globes=[];
 const gate=new T.Group();gate.name='subway gates';
 for(const e of frames){if(e.type==='easement'){list.push({id:e.id,station:e.station,type:e.type,p:e.p});continue;}
  const ax=e.axis,f=new Face([e.p[0],y0,-e.p[1]],[ax[0],0,-ax[1]],[0,1,0]);
  if(e.type==='elevator'){P.block('subGlass',f,0,2.2,0,2.7,-1.1,1.1);P.block('subIron',f,-.05,2.25,2.7,2.95,-1.15,1.15);for(const u of [0,2.2])for(const d of [-1.1,1.1])P.block('subIron',f,u-.05,u+.05,0,2.7,d-.05,d+.05);
   list.push({id:e.id,station:e.station,type:'elevator',p:e.p,axis:ax});continue;}
  // The stairwell: dark opening with a few lighter tread lines receding.
  const top=new Face(f.at(0,.012,W/2),f.u,[-f.n[0],-f.n[1],-f.n[2]]);P.rect('subPit',top,0,L,0,W,0);
  for(let k=1;k<8;k++)P.rect('subTread',top,k*L/8-.04,k*L/8,.05,W-.05,.002);
  if(e.kiosk)kioskParts(P,f);
  else{// Stone curb and iron railing on both long sides and the far end.
   for(const d of [-W/2-.12,W/2+.12])P.block('subStone',f,-.05,L+.1,0,.28,d-.12,d+.12);P.block('subStone',f,L-.02,L+.22,0,.28,-W/2-.24,W/2+.24);
   for(const d of [-W/2-.12,W/2+.12]){P.block('subIron',f,0,L+.1,RAIL-.05,RAIL,d-.03,d+.03);P.block('subIron',f,0,L+.1,.55,.58,d-.02,d+.02);for(let u=0;u<=L+.05;u+=.12)P.block('subIron',f,u-.012,u+.012,.28,RAIL,d-.012,d+.012);}
   P.block('subIron',f,L+.08,L+.14,.28,RAIL,-W/2-.12,W/2+.12);
   // Globe lamps at the head.
   for(const d of [-W/2-.12,W/2+.12]){P.cyl('subIron',.05,.06,2.1,f.matrix(.05,1.05,d),8);globes.push({p:f.at(.05,2.28,d),entry:e.entry,seed:hash(e.p[0]+d*7)});}}
  // Folding gate at the head: folded open against one side in 2026, drawn across in 2126.
  const g=new T.Mesh(gateGeo(),world.subwayGateMat||(world.subwayGateMat=new T.MeshStandardMaterial({color:0x5d6166,roughness:.6,metalness:.5,side:T.DoubleSide})));
  g.matrixAutoUpdate=false;const m=f.matrix(e.kiosk?.1:.02,0,-W/2);g.userData={base:m,width:W};g.name='subway gate '+e.id;gate.add(g);
  list.push({id:e.id,station:e.station,routes:e.routes,type:'stair',p:e.p,axis:ax,width:W,length:L,kiosk:!!e.kiosk,entry:e.entry,gate:g});}
 const mats={subPit:new T.MeshStandardMaterial({color:0x07080a,roughness:1}),subTread:new T.MeshStandardMaterial({color:0x2a2c2e,roughness:1}),subStone:new T.MeshStandardMaterial({color:0x9a958c,roughness:.9}),
  subIron:new T.MeshStandardMaterial({color:0x2c4436,roughness:.55,metalness:.4}),subGlass:new T.MeshStandardMaterial({color:0x334048,roughness:.15,metalness:.4,transparent:true,opacity:.55}),
  kIron:new T.MeshStandardMaterial({color:0x3f7a6c,roughness:.5,metalness:.35}),kRoof:new T.MeshStandardMaterial({color:0x4b8a79,roughness:.45,metalness:.4}),kDark:new T.MeshStandardMaterial({color:0x26443d,roughness:.55,metalness:.3})};
 for(const m of Object.values(mats))world.disposables.add(m);const group=P.build(mats);group.name='subway entrances';group.add(gate);
 // Globes: one instanced sphere, coloured per entrance; dimmed and some missing in 2126.
 const gg=new T.SphereGeometry(.17,12,8),gm=new T.MeshBasicMaterial({color:0xffffff});world.disposables.add(gg);world.disposables.add(gm);
 const gi=new T.InstancedMesh(gg,gm,globes.length),o3=new T.Object3D(),col=new T.Color();gi.name='subway globes';group.add(gi);
 const iron=mats.subIron.color.clone(),kiron=mats.kIron.color.clone(),kroof=mats.kRoof.color.clone(),rust=new T.Color(0x6b3f24);
 function place(t){const s=Math.max(0,Math.min(1,(t-.3)/.5)),sm=s*s*(3-2*s);
  globes.forEach((g,i)=>{const broken=g.seed<.45&&sm>.5;o3.position.set(...g.p);o3.scale.setScalar(broken?0:1);o3.updateMatrix();gi.setMatrixAt(i,o3.matrix);
   col.set(g.entry?0x3fbf6a:0xd23a2e).multiplyScalar(1-.85*sm);gi.setColorAt(i,col);});gi.instanceMatrix.needsUpdate=true;if(gi.instanceColor)gi.instanceColor.needsUpdate=true;
  mats.subIron.color.copy(iron).lerp(rust,.75*sm);mats.kIron.color.copy(kiron).lerp(rust,.6*sm);mats.kRoof.color.copy(kroof).lerp(rust,.5*sm);
  for(const g of gate.children){const w=g.userData.width*(.08+.92*sm);g.matrix.copy(g.userData.base).multiply(new T.Matrix4().makeScale(1,1,w));}}
 place(0);(world.decayHooks||(world.decayHooks=[])).push(place);world.subway={group,entrances:list,stairs:list.filter(x=>x.type==='stair').length,place};return group;}
// A collapsible gate, authored 1 m deep across the head (scaled to the opening): lattice of thin bars.
let _gate=null;function gateGeo(){if(_gate)return _gate;const P=[];const add=(x0,x1,y0,y1,z0,z1)=>P.push(new T.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2));
 for(let z=0;z<=1.001;z+=.1)add(-.015,.015,.28,2.05,z-.008,z+.008);for(const y of [.4,1.15,1.95])add(-.015,.015,y-.02,y+.02,0,1);
 const g=new T.BufferGeometry(),pos=[],nor=[];for(const b of P){const nb=b.toNonIndexed();pos.push(...nb.attributes.position.array);nor.push(...nb.attributes.normal.array);}
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));_gate=g;return g;}

// The Astor Place uptown kiosk (Heins & LaFarge's 1904 design, recast in 1985), checked against Wikimedia
// Commons photographs ("NYCS IRT LexAve AstorPl Kiosk.jpg", CC BY 2.0; "Astor Place Uptown.JPG", CC BY-SA 4.0)
// and Street View (Apr 2026). Painted cast iron in verdigris green. At the entrance end a square head pavilion:
// paneled dado, tall glazing, fluted corner pilasters with scrolled consoles, a frieze with a Greek-key band and
// the ENTRANCE / UPTOWN panels (signage decals), a cornice, and a bell-curved hipped roof of fish-scale plates
// with ridge cresting and urn finials; a canopy on scrolled brackets over the entrance. Behind it, over the
// stair, a long low glazed enclosure on a paneled base with a ribbed glass roof. Face f: origin at the entrance
// front, u running back along the stair, d across.
function kioskParts(P,f){const HL=2.6,HW=2.9,h0=.12,dado=1.05,gl=2.72,ent=3.05,cor=3.38;
 const box=(m,u0,u1,v0,v1,d0,d1)=>P.block(m,f,u0,u1,v0,v1,d0,d1);
 box('kIron',-.05,HL+.05,0,h0,-HW/2-.05,HW/2+.05);
 // Head pavilion walls: dado with raised panels, glazing above (front left open for the entrance).
 for(const sd of [-1,1]){const d=sd*HW/2;box('kIron',0,HL,h0,dado,d-.05,d+.05);for(let k=0;k<2;k++){const u0=.35+k*1.0;box('kDark',u0,u0+.8,h0+.18,dado-.15,d+sd*.05-.015,d+sd*.05+.015);}
  box('subGlass',.15,HL-.15,dado,gl,d-.02,d+.02);for(const u of [.95,1.65])box('kIron',u-.03,u+.03,dado,gl,d-.04,d+.04);}
 box('kIron',HL-.05,HL+.05,h0,dado,-HW/2,HW/2);box('subGlass',HL-.02,HL+.02,dado,gl,-HW/2+.15,HW/2-.15);
 // Corner pilasters with fluting, capitals and scrolled consoles.
 for(const u of [0,HL])for(const sd of [-1,1]){const d=sd*HW/2;box('kIron',u-.16,u+.16,h0,gl,d-.16,d+.16);
  for(const k of [-.08,0,.08])box('kDark',u+k-.012,u+k+.012,dado+.1,gl-.15,d+sd*.165-.006,d+sd*.165+.006);
  box('kIron',u-.2,u+.2,gl,gl+.12,d-.2,d+.2);box('kIron',u-.13,u+.13,gl+.12,ent,d-.13,d+.13);
  P.geo('kIron',new T.CylinderGeometry(.14,.05,.3,6),f.matrix(u,gl+.02,d+sd*.12));}
 // Frieze, Greek-key band (a row of small raised blocks), cornice.
 box('kIron',-.12,HL+.12,gl,ent,-HW/2-.12,HW/2+.12);
 for(let u=-.05;u<HL+.05;u+=.16)for(const sd of [-1,1])box('kDark',u,u+.1,gl+.05,gl+.11,sd*(HW/2+.125)-.008,sd*(HW/2+.125)+.008);
 box('kIron',-.25,HL+.25,ent,ent+.1,-HW/2-.25,HW/2+.25);box('kIron',-.32,HL+.32,ent+.1,cor,-HW/2-.32,HW/2+.32);
 for(let u=0;u<=HL;u+=.65)for(const sd of [-1,1])P.sphere('kDark',.05,f.matrix(u,ent+.05,sd*(HW/2+.26)),8,6);
 // Bell roof: a curved hipped roof built from tiers whose plan shrinks along an ogee curve to a short ridge.
 const tiers=14,rh=.95,ridge=[HL*.72,.3];
 for(let k=0;k<tiers;k++){const t0=k/tiers,t1=(k+1)/tiers,bell=t=>Math.pow(Math.cos(t*Math.PI/2),.55),
  w=(t)=>ridge[1]+(HW/2+.3-ridge[1])*bell(t),l=(t)=>ridge[0]/2+(HL/2+.3-ridge[0]/2)*bell(t),wm=w(t0),lm=l(t0);
  box('kRoof',HL/2-lm,HL/2+lm,cor+t0*rh,cor+t1*rh,-wm,wm);
  // Fish-scale plate rows: a thin darker band at the foot of each tier.
  box('kDark',HL/2-lm-.005,HL/2+lm+.005,cor+t0*rh,cor+t0*rh+.025,-wm-.005,wm+.005);}
 box('kIron',HL/2-ridge[0]/2-.05,HL/2+ridge[0]/2+.05,cor+rh,cor+rh+.06,-ridge[1]-.03,ridge[1]+.03);
 // Ridge cresting and urn finials at the ridge ends and the four roof corners.
 for(let u=HL/2-ridge[0]/2;u<=HL/2+ridge[0]/2+.01;u+=.1)box('kIron',u-.012,u+.012,cor+rh+.06,cor+rh+.16,-.012,.012);
 const urn=(u,v,d,s)=>{P.cyl('kIron',.06*s,.1*s,.12*s,f.matrix(u,v+.06*s,d),8);P.sphere('kIron',.11*s,f.matrix(u,v+.2*s,d),10,8);P.cyl('kIron',.015*s,.03*s,.28*s,f.matrix(u,v+.42*s,d),6);};
 urn(HL/2-ridge[0]/2,cor+rh+.06,0,.8);urn(HL/2+ridge[0]/2,cor+rh+.06,0,.8);
 for(const u of [-.25,HL+.25])for(const sd of [-1,1])urn(u,cor,sd*(HW/2+.25),.6);
 // Canopy over the entrance: a sloped panel on two scrolled brackets.
 const cd=1.5;P.quad('kRoof',f.at(0,gl+.2,-HW/2+.1),f.at(0,gl+.2,HW/2-.1),f.at(-cd,gl-.25,HW/2-.1),f.at(-cd,gl-.25,-HW/2+.1),[0,1,0]);
 box('kIron',-cd-.04,-cd+.04,gl-.33,gl-.2,-HW/2+.1,HW/2-.1);
 for(const sd of [-1,1]){const d=sd*(HW/2-.18);for(let k=0;k<6;k++){const a=k/5,u=-cd*.9*a,v=gl-.05-.9*(1-a)*(1-a);box('kIron',u-.05,u+.05,v,v+.06,d-.03,d+.03);}
  P.torus('kIron',.18,.025,f.matrix(-.35,gl-.45,d).multiply(new T.Matrix4().makeRotationY(Math.PI/2)),Math.PI*2,14);}
 // The glazed enclosure over the stair.
 const E0=HL,E1=HL+6.4,EW=2.6,ed=.95,eg=2.0;
 box('kIron',E0,E1+.05,0,h0,-EW/2-.05,EW/2+.05);
 for(const sd of [-1,1]){const d=sd*EW/2;box('kIron',E0,E1,h0,ed,d-.05,d+.05);for(let u=E0+.2;u+.9<E1;u+=1.07)box('kDark',u,u+.85,h0+.15,ed-.13,d+sd*.05-.015,d+sd*.05+.015);
  box('subGlass',E0,E1,ed,eg,d-.02,d+.02);for(let u=E0;u<=E1+.01;u+=1.07)box('kIron',u-.05,u+.05,h0,eg+.08,d-.06,d+.06);
  box('kIron',E0,E1,eg,eg+.16,d-.09,d+.09);for(let u=E0+.05;u<E1;u+=.16)box('kDark',u,u+.1,eg+.04,eg+.1,d+sd*.095-.006,d+sd*.095+.006);}
 box('kIron',E1-.05,E1+.05,h0,ed,-EW/2,EW/2);box('subGlass',E1-.02,E1+.02,ed,eg,-EW/2,EW/2);box('kIron',E1-.08,E1+.08,eg,eg+.16,-EW/2-.09,EW/2+.09);
 // Ribbed glass roof: a low gable with iron ribs every 0.53 m.
 const rr=.42;for(const sd of [-1,1]){P.quad('subGlass',f.at(E0,eg+.16,sd*EW/2),f.at(E1,eg+.16,sd*EW/2),f.at(E1,eg+.16+rr,0),f.at(E0,eg+.16+rr,0),[0,1,0]);
  for(let u=E0;u<=E1+.01;u+=.53){const a=f.at(u,eg+.16,sd*EW/2),b=f.at(u,eg+.16+rr,0),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize());
   P.geo('kIron',new T.BoxGeometry(.05,Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),.05),new T.Matrix4().compose(new T.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),q,new T.Vector3(1,1,1)));}}
 box('kIron',E0,E1,eg+.16+rr-.03,eg+.16+rr+.05,-.05,.05);}
