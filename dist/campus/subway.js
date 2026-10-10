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
const L=4.6,W=1.85,RAIL=1.0;
const hash=x=>{const s=Math.sin(x*12.9898)*43758.5453;return s-Math.floor(s);};
// Axis along the nearest street, pointing away from that street's nearest end node (the corner).
export function entranceFrames(data){const S=data.streets;return SUBWAY_ENTRANCES.map((e,i)=>{let best=null;
 for(const s of S.segments)for(let k=1;k<s.pts.length;k++){const a=s.pts[k-1],b=s.pts[k],dx=b[0]-a[0],dn=b[1]-a[1],LL=dx*dx+dn*dn||1;let t=((e.p[0]-a[0])*dx+(e.p[1]-a[1])*dn)/LL;t=Math.max(0,Math.min(1,t));
  const q=[a[0]+dx*t,a[1]+dn*t],d=Math.hypot(q[0]-e.p[0],q[1]-e.p[1]);if(!best||d<best.d)best={d,a:s.pts[0],b:s.pts[s.pts.length-1],q};}
 const da=Math.hypot(best.q[0]-best.a[0],best.q[1]-best.a[1]),db=Math.hypot(best.q[0]-best.b[0],best.q[1]-best.b[1]),from=da<db?best.a:best.b,to=da<db?best.b:best.a;
 let ax=[to[0]-from[0],to[1]-from[1]];const l=Math.hypot(...ax)||1;ax=[ax[0]/l,ax[1]/l];
 const kiosk=e.station==='Astor Pl'&&e.p[0]>500;return {...e,id:'subway-'+i,axis:ax,kiosk};});}
// Sign decals for the manifest (kind 'sign', drawn in the signage atlas): one per station, placed at each head.
export function subwayDecals(data){const by=new Map();for(const e of entranceFrames(data)){if(e.type==='elevator')continue;const id='subway-'+e.station.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
 if(!by.has(id))by.set(id,{id,file:'assets/signage/'+id+'.png',kind:'sign',size:[1.7,.34],bg:'#141414',fg:'#ffffff',lines:['Subway',e.station+'   '+e.routes],font:'sans-bold',
  seen:'Standard MTA entrance sign (white Helvetica on black, here as plain lettering without the route bullets); station and routes from the MTA entrance data',placements:[]});
 const s=by.get(id),n=[-e.axis[0],-e.axis[1]];
 if(e.type==='easement'){s.placements.push({p:[e.p[0]+n[0]*.3,e.p[1]+n[1]*.3],y:2.6,normal:n,where:e.station+' entrance in a building'});continue;}
 s.placements.push({p:[e.p[0]+n[0]*.06,e.p[1]+n[1]*.06],y:e.kiosk?2.75:RAIL+.05,normal:n,where:e.station+' entrance'+(e.kiosk?' (kiosk)':'')});}
 return [...by.values()];}
export function buildSubway(world){const P=new Parts(),y0=world.curbHeight??.15,list=[],frames=entranceFrames(world.data),globes=[];
 const gate=new T.Group();gate.name='subway gates';
 for(const e of frames){if(e.type==='easement'){list.push({id:e.id,station:e.station,type:e.type,p:e.p});continue;}
  const ax=e.axis,f=new Face([e.p[0],y0,-e.p[1]],[ax[0],0,-ax[1]],[0,1,0]);
  if(e.type==='elevator'){P.block('subGlass',f,0,2.2,0,2.7,-1.1,1.1);P.block('subIron',f,-.05,2.25,2.7,2.95,-1.15,1.15);for(const u of [0,2.2])for(const d of [-1.1,1.1])P.block('subIron',f,u-.05,u+.05,0,2.7,d-.05,d+.05);
   list.push({id:e.id,station:e.station,type:'elevator',p:e.p,axis:ax});continue;}
  // The stairwell: dark opening with a few lighter tread lines receding.
  const top=new Face(f.at(0,.012,W/2),f.u,[-f.n[0],-f.n[1],-f.n[2]]);P.rect('subPit',top,0,L,0,W,0);
  for(let k=1;k<8;k++)P.rect('subTread',top,k*L/8-.04,k*L/8,.05,W-.05,.002);
  if(e.kiosk){// Cast-iron kiosk over the head of the stair.
   const H=3.2;for(const u of [-.1,1.3,2.7,4.1,L])for(const d of [-W/2-.15,W/2+.15])P.block('subIron',f,u-.07,u+.07,0,H,d-.07,d+.07);
   for(const d of [-W/2-.15,W/2+.15])P.block('subGlass',f,0,L,.9,H-.15,d-.02,d+.02);P.block('subIron',f,-.15,L+.15,H-.15,H+.15,-W/2-.3,W/2+.3);
   P.geo('subIron',new T.ConeGeometry(1.0,1.0,4,1).rotateY(Math.PI/4).scale(L*.75,1,(W+.9)*.75),f.matrix(L/2,H+.65,0));
   P.block('subIron',f,L-.1,L+.15,0,H,-W/2-.15,W/2+.15);}
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
  subIron:new T.MeshStandardMaterial({color:0x2c4436,roughness:.55,metalness:.4}),subGlass:new T.MeshStandardMaterial({color:0x334048,roughness:.15,metalness:.4,transparent:true,opacity:.55})};
 for(const m of Object.values(mats))world.disposables.add(m);const group=P.build(mats);group.name='subway entrances';group.add(gate);
 // Globes: one instanced sphere, coloured per entrance; dimmed and some missing in 2126.
 const gg=new T.SphereGeometry(.17,12,8),gm=new T.MeshBasicMaterial({color:0xffffff});world.disposables.add(gg);world.disposables.add(gm);
 const gi=new T.InstancedMesh(gg,gm,globes.length),o3=new T.Object3D(),col=new T.Color();gi.name='subway globes';group.add(gi);
 const iron=mats.subIron.color.clone(),rust=new T.Color(0x6b3f24);
 function place(t){const s=Math.max(0,Math.min(1,(t-.3)/.5)),sm=s*s*(3-2*s);
  globes.forEach((g,i)=>{const broken=g.seed<.45&&sm>.5;o3.position.set(...g.p);o3.scale.setScalar(broken?0:1);o3.updateMatrix();gi.setMatrixAt(i,o3.matrix);
   col.set(g.entry?0x3fbf6a:0xd23a2e).multiplyScalar(1-.85*sm);gi.setColorAt(i,col);});gi.instanceMatrix.needsUpdate=true;if(gi.instanceColor)gi.instanceColor.needsUpdate=true;
  mats.subIron.color.copy(iron).lerp(rust,.75*sm);
  for(const g of gate.children){const w=g.userData.width*(.08+.92*sm);g.matrix.copy(g.userData.base).multiply(new T.Matrix4().makeScale(1,1,w));}}
 place(0);(world.decayHooks||(world.decayHooks=[])).push(place);world.subway={group,entrances:list,stairs:list.filter(x=>x.type==='stair').length,place};return group;}
// A collapsible gate, authored 1 m deep across the head (scaled to the opening): lattice of thin bars.
let _gate=null;function gateGeo(){if(_gate)return _gate;const P=[];const add=(x0,x1,y0,y1,z0,z1)=>P.push(new T.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2));
 for(let z=0;z<=1.001;z+=.1)add(-.015,.015,.28,2.05,z-.008,z+.008);for(const y of [.4,1.15,1.95])add(-.015,.015,y-.02,y+.02,0,1);
 const g=new T.BufferGeometry(),pos=[],nor=[];for(const b of P){const nb=b.toNonIndexed();pos.push(...nb.attributes.position.array);nor.push(...nb.attributes.normal.array);}
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));_gate=g;return g;}
