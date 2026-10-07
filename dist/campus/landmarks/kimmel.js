import * as T from '../../vendor/three.module.js';
import {Parts,Face,stoneTextures} from './kit.js?v=18';
import {pieces,walls,roofs,punched,curtain,storefront,facing,signPanel,v3} from './facade.js?v=18';
import model3d from '../data/campus-3d.js?v=18';
// Helen and Martin Kimmel Center for University Life, 60 Washington Square South
// (Kevin Roche John Dinkeloo and Associates, opened 2003). Stepped volume from the NYC 3D model:
// a glass-roofed podium along Washington Sq S, a tan stone block with paired windows and glazed
// corner bays, a recessed glass top storey over the 36.9 m terrace, and a taller stone slab on the
// Thompson St side. Built in world coordinates.
export const KIMMEL={bin:1008662,ground:6.3,stoneTop:36.9,glassTop:46.4};
// A sub-section [u0,u1] of a wall, as its own wall.
const sub=(w,u0,u1)=>{const t=[w.b[0]-w.a[0],w.b[1]-w.a[1]].map(x=>x/w.len),a=[w.a[0]+t[0]*u0,w.a[1]+t[1]*u0],b=[w.a[0]+t[0]*u1,w.a[1]+t[1]*u1];return {...w,a,b,len:u1-u0,face:new Face(v3(a),w.face.u,w.face.v)};};
export function kimmelParts(b){const K=KIMMEL,P=new Parts(),m=model3d[b.bin];const ps=pieces(m),W=walls(ps);
 // The canopy slopes from 7.6 m against the stone block down to 4.4 m at the street edge: height by
 // distance from the block's park wall line (the long north-facing wall of the 36.9 m piece).
 const pw=W.filter(w=>facing(w)==='n'&&Math.abs(w.piece.z-K.stoneTop)<.3).sort((a,b)=>b.len-a.len)[0];
 const canopyH=q=>{if(!pw)return K.ground;const d=Math.max(0,(q[0]-pw.a[0])*pw.n[0]+(q[1]-pw.a[1])*pw.n[1]);return Math.max(4.4,7.6-d*.42);};
 const win={wall:'stone',pitch:3.25,floor:3.75,first:1.0,win:[.88,2.45],pair:1,mullion:.2,surround:.14,reveal:.32,parapet:1.1};
 for(const w of W){const z=w.piece.z,dir=facing(w);
  if(z<=K.ground+.1){// Podium along the square: dark-framed storefront under the sloping glass canopy (below).
   const ha=canopyH(w.a),hb=canopyH(w.b);P.quad('glassClear',v3(w.a,0),v3(w.b,0),v3(w.b,hb),v3(w.a,ha),[w.n[0],0,-w.n[1]]);
   const n=Math.max(1,Math.round(w.len/1.6));for(let i=0;i<=n;i++){const t=i/n,h=ha+(hb-ha)*t;P.block('frame',w.face,w.len*t-.04,w.len*t+.04,0,h,0,.1,{skip:['top','bottom']});}
   P.block('frame',w.face,0,w.len,3.0,3.08,0,.1,{skip:['left','right']});continue;}
  if(Math.abs(z-K.glassTop)<.2&&w.y0>=K.stoneTop-.2){curtain(P,w,w.y0,z,{mw:1.6,floor:3.75,spandrel:.5,spandrelName:'frame'});continue;}
  // Stone walls: storefront at the street on the square and LaGuardia fronts, punched windows above.
  const street=w.y0<1&&(dir==='n'||dir==='e');let y=w.y0;
  if(street){storefront(P,w,0,K.ground,{wall:'stone',pitch:3.25,pier:.55,set:.35});y=K.ground;}
  // Glazed corner bays at both ends of the long park and LaGuardia walls.
  if((dir==='n'||dir==='e')&&w.len>14&&z>30){const g=2.9;curtain(P,sub(w,0,g),y,z-1.1,{mw:1.45,floor:3.75,spandrel:.35});curtain(P,sub(w,w.len-g,w.len),y,z-1.1,{mw:1.45,floor:3.75,spandrel:.35});
   P.rect('stone',sub(w,0,g).face,0,g,z-1.1,z,0);P.rect('stone',sub(w,w.len-g,w.len).face,0,g,z-1.1,z,0);punched(P,sub(w,g,w.len-g),y,z,{...win,rowsFrom:0,first:1.2});}
  else punched(P,w,y,z,{...win,first:y<1?K.ground+1.2:1.2});
  // Coping.
  P.block('stoneLight',w.face,0,w.len,z-.3,z,0,.18,{skip:['left','right']});}
 roofs(P,ps.filter(p=>p.z>K.ground+.1),'roof');
 // Podium roof: glass, sloping from the stone wall down to the street edge.
 for(const p of ps.filter(p=>p.z<=K.ground+.1)){const pts=p.ring.map(q=>new T.Vector2(q[0],q[1]));let tri;try{tri=T.ShapeUtils.triangulateShape(pts,[]);}catch{continue;}
  for(const [i,j,k] of tri)P.tri('glassRoof',v3(p.ring[i],canopyH(p.ring[i])),v3(p.ring[j],canopyH(p.ring[j])),v3(p.ring[k],canopyH(p.ring[k])),[0,1,0]);
  // Canopy ribs every 1.6 m along the front, running up to the wall.
  }
 // The long park wall of the stone block carries the curved glass balcony and the entrance sign.
 const park=W.filter(w=>facing(w)==='n'&&Math.abs(w.piece.z-K.stoneTop)<.3).sort((a,b)=>b.len-a.len)[0];
 if(park){const f=park.face,c=park.len*.42,r=3.1,y=10.6,M=new T.Matrix4().makeBasis(new T.Vector3(...f.u),new T.Vector3(...f.v),new T.Vector3(...f.n));
  const at=(u,v,d)=>new T.Matrix4().copy(M).setPosition(...f.at(u,v,d));
  P.geo('stoneLight',new T.CylinderGeometry(r,r,.45,28,1,false,-Math.PI/2,Math.PI),at(c,y-.22,0));
  P.geo('glassRail',new T.CylinderGeometry(r,r,1.15,28,1,true,-Math.PI/2,Math.PI),at(c,y+.58,0));P.geo('frame',new T.TorusGeometry(r,.04,4,28,Math.PI).rotateX(Math.PI/2),at(c,y+1.15,0));
  P.geo('stoneLight',new T.CylinderGeometry(r*.94,r*.94,.3,28,1,false,-Math.PI/2,Math.PI),at(c,y+4.2,0));}
 return {P,park};}
export function buildKimmel(b){const {P,park}=kimmelParts(b);
 const st=stoneTextures({base:'#cdb48c',vary:.05,course:1.25,courses:3,block:1.55,tileW:4.65,joint:.006,jointAlpha:.25,seed:21});
 const materials={stone:new T.MeshStandardMaterial({map:st.map,normalMap:st.normalMap,normalScale:new T.Vector2(.4,.4),roughness:.82}),stoneLight:new T.MeshStandardMaterial({color:0xd8c39d,roughness:.8}),
  glass:new T.MeshStandardMaterial({color:0x7d97a6,roughness:.12,metalness:.55}),glassClear:new T.MeshStandardMaterial({color:0x8fa6ad,roughness:.1,metalness:.3,transparent:true,opacity:.35,depthWrite:false}),
  glassRoof:new T.MeshStandardMaterial({color:0x7d9aa3,roughness:.1,metalness:.5,transparent:true,opacity:.6,depthWrite:false,side:T.DoubleSide}),glassRail:new T.MeshStandardMaterial({color:0xa9c2c6,roughness:.05,metalness:.3,transparent:true,opacity:.4,depthWrite:false,side:T.DoubleSide}),
  frame:new T.MeshStandardMaterial({color:0x3c4144,roughness:.5,metalness:.6}),roof:new T.MeshStandardMaterial({color:0x7b746a,roughness:.95}),
  sign:new T.MeshStandardMaterial({map:signPanel(['HELEN AND MARTIN KIMMEL','CENTER FOR UNIVERSITY LIFE','NEW YORK UNIVERSITY'],{bg:'#e6e1d6',ink:'#3a3a3a',h:160}),roughness:.6})};
 if(park){const L=park.len;P.panel('sign',park.face,L*.62,L*.62+2.4,2.4,3.1,.02);}
 const g=P.build(materials);for(const m of g.children)if(/glassClear|glassRoof|glassRail/.test(m.name)){m.castShadow=false;m.renderOrder=2;}
 g.name='Kimmel Center';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
