import * as T from '../../vendor/three.module.js';
import {Parts,stoneTextures} from './kit.js?v=23';
import {pieces,walls,roofs,punched} from './facade.js?v=23';
import {Frame,pointed,apexOf,wall,buttress,gableRoof,leanTo,pinnacle,spire} from './gothic.js?v=23';
import model3d from '../data/campus-3d.js?v=23';
// Grace Church, 800 Broadway at E 10th St (James Renwick Jr., 1843-46; marble spire 1883; LPC 1966).
// Gothic Revival in grey-white marble: a west tower on Broadway with corner buttresses, a belfry of paired
// louvred lancets, corner pinnacles and an octagonal spire; nave with lean-to aisles and a clerestory,
// transepts and a chancel, all under steep slate roofs. Plan, heights and the parish buildings behind come
// from the NYC 3D Building Model (BIN 1008997): tower 7.6 m square to 40.0 m, nave and transepts to a
// 19.1 m ridge, aisles to 9.8 m. The church's axis runs at bearing 99 degrees (west front on Broadway).
// See RESEARCH/checklists/grace.md for what was observed on Street View and what is still an estimate.
export const GRACE={bin:1008997,axis:99,origin:[502.3,88.2],tower:[-3.8,3.8,-4.0,4.1],towerTop:40.0,spireTop:66,ridge:19.1,eave:13.6,aisle:[7.5,9.8]};
export function graceParts(b){const G=GRACE,F=new Frame(G.origin,G.axis),P=new Parts();
 const [tu0,tu1,tv0,tv1]=G.tower,nv0=-4.8,nv1=3.8,crossing=[20.7,28.4],east=44.2,av0=-14.6,av1=13.7,west=-1.0;
 // ---- Aisles: low walls with a lancet per bay, buttresses between, lean-to roofs up to the clerestory.
 const bay=3.6;for(const [vOut,vIn,side] of [[av1,nv1,1],[av0,nv0,-1]]){const a=side>0?[crossing[0],vOut]:[west,vOut],c=side>0?[west,vOut]:[crossing[0],vOut],f=F.face(a,c),L=crossing[0]-west,n=Math.round(L/bay);
  const ops=[];for(let i=0;i<n;i++){const cu=(i+.5)*L/n;ops.push({hole:pointed(cu,1.3,1.6,5.0),depth:.35});}wall(P,f,L,0,G.aisle[0],ops);for(let i=1;i<n;i++)buttress(P,f,i*L/n,0,G.aisle[0]+.6,{w:.7,d:.8,steps:1});
  leanTo(P,F,west,crossing[0],vIn,vOut+side*.3,G.aisle[1],G.aisle[0]-.1);
  // West end of the aisle (on Broadway): a lancet and a sloping parapet.
  const we=side>0?F.face([west,vOut],[west,vIn]):F.face([west,vIn],[west,vOut]);const wl=Math.abs(vOut-vIn);wall(P,we,wl,0,G.aisle[0],[{hole:pointed(wl/2,1.6,1.8,5.6),depth:.4}]);
  P.poly('stone',we,side>0?[[0,G.aisle[0]],[wl,G.aisle[0]],[wl,G.aisle[1]]]:[[0,G.aisle[0]],[wl,G.aisle[0]],[0,G.aisle[1]]]);pinnacle(P,F,west+.2,vOut,G.aisle[0],G.aisle[0]+1.6,{s:.6,h:1.6});}
 // ---- Nave clerestory (above the aisle roofs) and chancel, gable roofs, east window.
 for(const [u0,u1] of [[tu1,crossing[0]],[crossing[1],east]]){for(const [a,c] of [[[u1,nv1],[u0,nv1]],[[u0,nv0],[u1,nv0]]]){const f=F.face(a,c),L=u1-u0,n=Math.max(1,Math.round(L/bay)),y0=G.aisle[1];
   const ops=[];for(let i=0;i<n;i++)ops.push({hole:pointed((i+.5)*L/n,1.0,y0+1.0,G.eave-1.6),depth:.3});wall(P,f,L,y0,G.eave,ops);}
  gableRoof(P,F,u0,u1,nv0,nv1,G.eave,G.ridge,{ends:false});}
 {const f=F.face([east,nv0],[east,nv1]),L=nv1-nv0;wall(P,f,L,0,G.eave,[{hole:pointed(L/2,4.2,3.0,10.0),depth:.5,mullion:1}],{gable:G.ridge-G.eave});buttress(P,f,.3,0,G.eave-1,{w:.8,d:1.2});buttress(P,f,L-.3,0,G.eave-1,{w:.8,d:1.2});}
 // ---- Transepts: tall gable ends north and south with great pointed windows.
 {const [u0,u1]=crossing;gableRoof(P,F,u0,u1,av0,av1,G.eave,G.ridge,{ends:false,axis:'v'});const w=u1-u0;
  for(const [vOut,side] of [[av1,1],[av0,-1]]){const f=side>0?F.face([u1,vOut],[u0,vOut]):F.face([u0,vOut],[u1,vOut]);wall(P,f,w,0,G.eave,[{hole:pointed(w/2,3.6,2.8,10.2),depth:.5,mullion:1}],{gable:G.ridge-G.eave});
   pinnacle(P,F,u0,vOut,G.eave,G.eave+1.4,{s:.7,h:2.2});pinnacle(P,F,u1,vOut,G.eave,G.eave+1.4,{s:.7,h:2.2});
   // Transept side walls (west and east faces of each arm) above the aisle roofs.
   const vIn=side>0?nv1:nv0,L=Math.abs(vOut-vIn);const fw=side>0?F.face([u0,vOut],[u0,vIn]):F.face([u0,vIn],[u0,vOut]),fe=side>0?F.face([u1,vIn],[u1,vOut]):F.face([u1,vOut],[u1,vIn]);
   wall(P,fw,L,G.aisle[1],G.eave,[{hole:pointed(L/2,1.2,G.aisle[1]+.8,G.eave-1.6),depth:.3}]);wall(P,fe,L,G.aisle[1],G.eave,[{hole:pointed(L/2,1.2,G.aisle[1]+.8,G.eave-1.6),depth:.3}]);}}
 // ---- Chancel aisles (lean-to, as the nave aisles), north u 28.4-38.5 and south u 28.4-37.7.
 for(const [ue,vOut,vIn,side] of [[38.5,12.9,nv1,1],[37.7,-15.7,nv0,-1]]){const u0=crossing[1],L=ue-u0,f=side>0?F.face([ue,vOut],[u0,vOut]):F.face([u0,vOut],[ue,vOut]);
  wall(P,f,L,0,G.aisle[0],[0,1,2].map(i=>({hole:pointed((i+.5)*L/3,1.3,1.6,5.0),depth:.35})));leanTo(P,F,u0,ue,vIn,vOut+side*.3,G.aisle[1],G.aisle[0]-.1);
  const fe=side>0?F.face([ue,vIn],[ue,vOut]):F.face([ue,vOut],[ue,vIn]),wl=Math.abs(vOut-vIn);wall(P,fe,wl,0,G.aisle[0],[{hole:pointed(wl/2,1.4,1.8,5.2),depth:.35}]);
  P.poly('stone',fe,side>0?[[0,G.aisle[0]],[wl,G.aisle[0]],[0,G.aisle[1]]]:[[0,G.aisle[0]],[wl,G.aisle[0]],[wl,G.aisle[1]]]);}
 // ---- Tower: four faces with a portal (west), a great window, a clock stage and the belfry.
 const tw=tu1-tu0,faces=[F.face([tu0,tv1],[tu0,tv0]),F.face([tu0,tv0],[tu1,tv0]),F.face([tu1,tv1],[tu0,tv1]),F.face([tu1,tv0],[tu1,tv1])];
 faces.forEach((f,i)=>{const ops=[];if(i===0){ops.push({hole:pointed(tw/2,2.6,0,4.2),depth:.9,glass:'door',hood:true});ops.push({hole:pointed(tw/2,2.4,9.0,15.5),depth:.5,mullion:1});}
  ops.push({hole:pointed(tw/2-.75,.9,31.2,35.6),depth:.6,glass:'louvre'},{hole:pointed(tw/2+.75,.9,31.2,35.6),depth:.6,glass:'louvre'});
  if(i===1||i===2)ops.push({hole:pointed(tw/2,1.0,19,22.5),depth:.3});wall(P,f,tw,i===0?0:i===3?G.ridge-.5:G.aisle[1],G.towerTop-1.2,ops);
  // Clock: a dark dial on the west and the two sides.
  if(i<3)P.geo('dial',new T.CircleGeometry(1.0,24),f.matrix(tw/2,26.0,.06));P.block('trim',f,0,tw,G.towerTop-1.2,G.towerTop,0,.35);P.block('trim',f,0,tw,29.6,29.9,0,.2);P.block('trim',f,0,tw,17.4,17.7,0,.2);
  if(i<3)for(const u of [.0,tw])buttress(P,f,u,i===0?0:G.aisle[1],37.5,{w:1.0,d:1.0,steps:3});});
 for(const [u,v] of [[tu0,tv0],[tu0,tv1],[tu1,tv0],[tu1,tv1]])pinnacle(P,F,u,v,G.towerTop-1.2,G.towerTop+1.8,{s:.9,h:3.6});
 spire(P,F,(tu0+tu1)/2,(tv0+tv1)/2,G.towerTop,G.spireTop-G.towerTop,{r:3.0});
 // ---- Parish buildings behind (chantry, Grace House, the school): plain marble with pointed-head windows
 // on their 3D-model volumes.
 const church=new Set([40,19.1,9.8]);const rest=pieces(model3d[b.bin]).filter(p=>!church.has(+p.z.toFixed(1)));
 for(const w of walls(rest)){if(w.y1-w.y0<2.5)continue;punched(P,w,w.y0,w.y1,{wall:'stone',glass:'glass',pitch:2.8,floor:3.6,win:[1.0,2.0],parapet:.8,reveal:.25,first:1.1,margin:.8});P.block('trim',w.face,0,w.len,w.y1-.3,w.y1,0,.2,{skip:['left','right']});}
 roofs(P,rest,'slate');return {P};}
export function buildGrace(b){const {P}=graceParts(b);const s=stoneTextures({base:'#cfccc4',course:.45,block:1.1,tileW:3.3,seed:23});
 const m={stone:new T.MeshStandardMaterial({map:s.map,normalMap:s.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.85}),trim:new T.MeshStandardMaterial({color:0xd6d3cb,roughness:.8}),slate:new T.MeshStandardMaterial({color:0x4b5055,roughness:.75}),
  glass:new T.MeshStandardMaterial({color:0x2c3138,roughness:.3,metalness:.3}),louvre:new T.MeshStandardMaterial({color:0x2a2724,roughness:.8}),door:new T.MeshStandardMaterial({color:0x3a2a1e,roughness:.7}),
  dial:new T.MeshStandardMaterial({color:0x22262a,roughness:.5,metalness:.3}),metal:new T.MeshStandardMaterial({color:0x3d3f40,roughness:.5,metalness:.6}),frame:new T.MeshStandardMaterial({color:0x3d3f40,roughness:.5,metalness:.4})};
 const g=P.build(m);g.name='Grace Church';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(m);return g;}
