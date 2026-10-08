import * as T from '../../vendor/three.module.js';
import {Parts,Face,stoneTextures} from './kit.js?v=23';
import {pieces,walls,roofs,punched,curtain,storefront,facing,signPanel,v3} from './facade.js?v=23';
import model3d from '../data/campus-3d.js?v=23';
// Helen and Martin Kimmel Center for University Life, 60 Washington Square South
// (Kevin Roche John Dinkeloo and Associates, opened 2003). Stepped volume from the NYC 3D model:
// a glass-roofed podium along Washington Sq S, a tan stone block with paired windows and glazed
// corner bays, a recessed glass top storey over the 36.9 m terrace, and a taller stone slab on the
// Thompson St side. Built in world coordinates.
export const KIMMEL={bin:1008662,ground:6.3,stoneTop:36.9,glassTop:46.4};
// A sub-section [u0,u1] of a wall, as its own wall.
const sub=(w,u0,u1)=>{const t=[w.b[0]-w.a[0],w.b[1]-w.a[1]].map(x=>x/w.len),a=[w.a[0]+t[0]*u0,w.a[1]+t[1]*u0],b=[w.a[0]+t[0]*u1,w.a[1]+t[1]*u1];return {...w,a,b,len:u1-u0,face:new Face(v3(a),w.face.u,w.face.v)};};
export function kimmelParts(b){const K=KIMMEL,P=new Parts(),m=model3d[b.bin];const ps=pieces(m),W=walls(ps);
 // The canopy is a curved glass vault (a quarter-ellipse in section) that wraps the podium: it
 // springs from the stone block at 8.6 m and curves down to 4.8 m over the street edge, nearly
 // vertical there, like half a barrel vault (C kimmel_2008). Each long stone wall standing on the
 // podium is a springing line; the height at a point comes from its distance to the nearest of
 // those walls, so the vault turns the LaGuardia Pl corner as a rounded quarter-cone.
 const podium=ps.filter(p=>p.z<=K.ground+.1),V0=8.6,V1=4.8;
 const inside=(q,ring)=>{let o=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>q[1])!==(b[1]>q[1])&&q[0]<(b[0]-a[0])*(q[1]-a[1])/(b[1]-a[1])+a[0])o=!o;}return o;};
 const inPodium=q=>podium.some(p=>inside(q,p.ring));
 const springs=W.filter(w=>w.piece.z>K.ground+.1&&Math.abs(w.y0-K.ground)<.3&&w.len>8).map(w=>{const t=[(w.b[0]-w.a[0])/w.len,(w.b[1]-w.a[1])/w.len];
  let D=0;for(let d=.2;d<15;d+=.1){const m=[(w.a[0]+w.b[0])/2+w.n[0]*d,(w.a[1]+w.b[1])/2+w.n[1]*d];if(!inPodium(m))break;D=d;}return {...w,t,D:D+.05};}).filter(w=>w.D>1);
 const rise=(d,D)=>{const t=Math.min(1,d/D);return (V0-V1)*Math.sqrt(1-t*t);};
 const canopyH=q=>{let h=0;for(const w of springs){const r=[q[0]-w.a[0],q[1]-w.a[1]],dn=r[0]*w.n[0]+r[1]*w.n[1];if(dn<-.2)continue;
  const u=Math.max(0,Math.min(w.len,r[0]*w.t[0]+r[1]*w.t[1])),c=[w.a[0]+w.t[0]*u,w.a[1]+w.t[1]*u];h=Math.max(h,rise(Math.hypot(q[0]-c[0],q[1]-c[1]),w.D));}return V1+h;};
 const win={wall:'stone',pitch:3.25,floor:3.75,first:1.0,win:[.88,2.45],pair:1,mullion:.2,surround:.14,reveal:.32,parapet:1.1};
 for(const w of W){const z=w.piece.z,dir=facing(w);
  if(z<=K.ground+.1){// Podium along the square: dark-framed storefront under the sloping glass canopy (below).
   const at=u=>[w.a[0]+(w.b[0]-w.a[0])*u/w.len,w.a[1]+(w.b[1]-w.a[1])*u/w.len],ns=Math.max(1,Math.ceil(w.len/.8));
   for(let i=0;i<ns;i++){const u0=w.len*i/ns,u1=w.len*(i+1)/ns,q0=at(u0),q1=at(u1);P.quad('glassClear',v3(q0,0),v3(q1,0),v3(q1,canopyH(q1)),v3(q0,canopyH(q0)),[w.n[0],0,-w.n[1]]);}
   const n=Math.max(1,Math.round(w.len/1.6));for(let i=0;i<=n;i++){const u=w.len*i/n;P.block('frame',w.face,u-.04,u+.04,0,canopyH(at(u)),0,.1,{skip:['top','bottom']});}
   P.block('frame',w.face,0,w.len,3.0,3.08,0,.1,{skip:['left','right']});
   // Dark fascia beam where the vault meets the storefront along the street edge.
   if(canopyH(w.a)<V1+.3&&canopyH(w.b)<V1+.3)P.block('frame',w.face,0,w.len,V1-.45,V1,0,.35,{skip:['left','right']});
   continue;}
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
 // Podium roof: the glass vault, triangulated in plan and subdivided to about 0.9 m so the curve
 // reads smoothly, then lifted to the vault profile.
 const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],len2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const split=(a,b,c,out)=>{const e=[len2(a,b),len2(b,c),len2(c,a)],m=Math.max(...e);if(m<.9){out.push([a,b,c]);return;}
  if(m===e[0]){const q=mid(a,b);split(a,q,c,out);split(q,b,c,out);}else if(m===e[1]){const q=mid(b,c);split(a,b,q,out);split(a,q,c,out);}else{const q=mid(c,a);split(a,b,q,out);split(q,b,c,out);}};
 for(const p of podium){const pts=p.ring.map(q=>new T.Vector2(q[0],q[1]));let tri;try{tri=T.ShapeUtils.triangulateShape(pts,[]);}catch{continue;}
  const out=[];for(const [i,j,k] of tri)split(p.ring[i],p.ring[j],p.ring[k],out);
  for(const [a,b,c] of out)P.tri('glassRoof',v3(a,canopyH(a)),v3(b,canopyH(b)),v3(c,canopyH(c)),[0,1,0]);
  }
 // Ribs: dark steel arches every 1.6 m along each springing wall, from the wall out to the street
 // edge, fanning round the free ends of the wall; purlins at five heights tie them together.
 const seg=(a,b2)=>{const A=new T.Vector3(...a),B=new T.Vector3(...b2),L=A.distanceTo(B);if(L<.05)return;P.cyl('frame',.06,.06,L,new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),B.clone().sub(A).normalize()),new T.Vector3(1,1,1)),4);};
 const lift=q=>inPodium(q)?v3(q,canopyH(q)+.06):null,F=[0,.35,.6,.78,.9,.97,1];
 for(const w of springs){const rays=[];// each ray: origin on the wall and unit direction
  for(let u=.8;u<w.len;u+=1.6)rays.push([[w.a[0]+w.t[0]*u,w.a[1]+w.t[1]*u],w.n]);
  for(const [o,s2] of [[w.a,-1],[w.b,1]])for(let k=1;k<=4;k++){const g=k/4*Math.PI/2,dir=[w.n[0]*Math.cos(g)+s2*w.t[0]*Math.sin(g),w.n[1]*Math.cos(g)+s2*w.t[1]*Math.sin(g)];
   if(inPodium([o[0]+dir[0]*1.5,o[1]+dir[1]*1.5]))rays.push([o,dir]);}
  const pts=rays.map(([o,d])=>F.map(f=>lift([o[0]+d[0]*(w.D*f-.05*(f===1)),o[1]+d[1]*(w.D*f-.05*(f===1))])));
  for(const r of pts)for(let k=1;k<r.length;k++)if(r[k-1]&&r[k])seg(r[k-1],r[k]);
  // Purlins along the straight run (consecutive rays) only.
  const n0=Math.floor((w.len-.8)/1.6)+1;for(let i=1;i<n0;i++)for(let k=1;k<F.length-1;k++)if(pts[i-1][k]&&pts[i][k])seg(pts[i-1][k],pts[i][k]);}
 // The long park wall of the stone block carries the curved glass balcony and the entrance sign.
 const park=W.filter(w=>facing(w)==='n'&&Math.abs(w.piece.z-K.stoneTop)<.3).sort((a,b)=>b.len-a.len)[0];
 if(park){const f=park.face,c=park.len*.42,r=3.1,y=10.6,M=new T.Matrix4().makeBasis(new T.Vector3(...f.u),new T.Vector3(...f.v),new T.Vector3(...f.n));
  const at=(u,v,d)=>new T.Matrix4().copy(M).setPosition(...f.at(u,v,d));
  P.geo('stoneLight',new T.CylinderGeometry(r,r,.45,28,1,false,-Math.PI/2,Math.PI),at(c,y-.22,0));
  P.geo('glassRail',new T.CylinderGeometry(r,r,1.15,28,1,true,-Math.PI/2,Math.PI),at(c,y+.58,0));P.geo('frame',new T.TorusGeometry(r,.04,4,28,Math.PI).rotateX(Math.PI/2),at(c,y+1.15,0));
  P.geo('stoneLight',new T.CylinderGeometry(r*.94,r*.94,.3,28,1,false,-Math.PI/2,Math.PI),at(c,y+4.2,0));}
 return {P,park,canopyH,springs};}
export function buildKimmel(b){const {P,park}=kimmelParts(b);
 const st=stoneTextures({base:'#cdb48c',vary:.05,course:1.25,courses:3,block:1.55,tileW:4.65,joint:.006,jointAlpha:.25,seed:21});
 const materials={stone:new T.MeshStandardMaterial({map:st.map,normalMap:st.normalMap,normalScale:new T.Vector2(.4,.4),roughness:.82}),stoneLight:new T.MeshStandardMaterial({color:0xd8c39d,roughness:.8}),
  glass:new T.MeshStandardMaterial({color:0x7d97a6,roughness:.12,metalness:.55}),glassClear:new T.MeshStandardMaterial({color:0x8fa6ad,roughness:.1,metalness:.3,transparent:true,opacity:.35,depthWrite:false}),
  glassRoof:new T.MeshStandardMaterial({color:0x6f8f9a,roughness:.08,metalness:.65,transparent:true,opacity:.72,depthWrite:false,side:T.DoubleSide}),glassRail:new T.MeshStandardMaterial({color:0xa9c2c6,roughness:.05,metalness:.3,transparent:true,opacity:.4,depthWrite:false,side:T.DoubleSide}),
  frame:new T.MeshStandardMaterial({color:0x3c4144,roughness:.5,metalness:.6}),roof:new T.MeshStandardMaterial({color:0x7b746a,roughness:.95}),
  sign:new T.MeshStandardMaterial({map:signPanel(['HELEN AND MARTIN KIMMEL','CENTER FOR UNIVERSITY LIFE','NEW YORK UNIVERSITY'],{bg:'#e6e1d6',ink:'#3a3a3a',h:160}),roughness:.6})};
 if(park){const L=park.len;P.panel('sign',park.face,L*.62,L*.62+2.4,2.4,3.1,.02);}
 const g=P.build(materials);for(const m of g.children)if(/glassClear|glassRoof|glassRail/.test(m.name)){m.castShadow=false;m.renderOrder=2;}
 g.name='Kimmel Center';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
