import * as T from '../../vendor/three.module.js';
import {Parts,Face,stoneTextures} from './kit.js?v=20';
import {pieces,walls,roofs,v3,signPanel,punched,storefront,facing,mergeWalls} from './facade.js?v=20';
import model3d from '../data/campus-3d.js?v=20';
// NYU Stern School of Business on Gould Plaza: the Henry Kaufman Management Center (44 W 4th St,
// BIN 1078952; completed about 1992) and Tisch Hall (40 W 4th St, BIN 1077346;
// Philip Johnson and Richard Foster, 1972). Volumes from the NYC 3D Building Model (2014); detail from
// Commons photos stern_full, stern_nyc, stern_kmc, stern_plaza, stern_grad, stern_1 (2014-19).
//  KMC: pale stone panels with a dense window grid; the two lowest storeys in big openings with red
//   gridded frames; a rotunda on the plaza: a ring of columns under an entablature lettered LEONARD N.
//   STERN SCHOOL OF BUSINESS, a glass drum and a shallow glass dome.
//  Tisch Hall: red sandstone like Bobst, a regular grid of deep windows, a dark recessed top storey
//   behind a sandstone parapet frame, a glazed entrance on the plaza flanked by pale green glass panels.
// Gould Plaza is behind the construction shed seen on W 4th St in April 2026 (see sheds.js).
export const STERN={kmc:1078952,tisch:1077346,
 rotunda:{R:9.1,col:9,colTop:8.4,win:[9.0,11.4],text:12.4,dome:17.0,top:19.1},
 kmcWin:{wall:'kmcStone',pitch:2.45,floor:3.95,first:9.6,win:[.92,2.45],pair:1,mullion:.1,parapet:1.2,reveal:.22,frames:'frameGrey',sill:.06,margin:.5},
 tischWin:{wall:'sandstone',trim:'sandstone',pitch:2.5,floor:3.6,first:6.4,win:[1.45,2.25],parapet:.6,reveal:.38,frames:'frameDark',sill:0,margin:.8},
 tischTop:36.8};
const GU=[.837,-.547],GV=[.547,.837];const gdir=n=>{const a=n[0]*GU[0]+n[1]*GU[1],b=n[0]*GV[0]+n[1]*GV[1];return Math.abs(b)>=Math.abs(a)?(b>0?'n':'s'):(a>0?'e':'w');};const gu=p=>p[0]*GU[0]+p[1]*GU[1],gv=p=>p[0]*GV[0]+p[1]*GV[1],mp=(u,v)=>[u*GU[0]+v*GV[0],u*GU[1]+v*GV[1]];
// Curved wall on an arc (grid frame): centre c=[u,v], radius r, angles a0..a1 (0 = grid east, CCW),
// from y0 to y1, outward (or inward) facing; UVs run 0..1 round the arc so a texture can wrap it.
function arcWall(P,name,c,r,a0,a1,y0,y1,{n=24,inward=false}={}){for(let i=0;i<n;i++){const t0=a0+(a1-a0)*i/n,t1=a0+(a1-a0)*(i+1)/n,p=t=>mp(c[0]+r*Math.cos(t),c[1]+r*Math.sin(t)),A=p(t0),B=p(t1),tm=(t0+t1)/2,d=mp(Math.cos(tm),Math.sin(tm)),nrm=inward?[-d[0],0,d[1]]:[d[0],0,-d[1]];
  const U0=i/n,U1=(i+1)/n;P.push(name,[v3(A,y0),v3(B,y0),v3(B,y1),v3(A,y0),v3(B,y1),v3(A,y1)],Array(6).fill(nrm),[[U0,0],[U1,0],[U1,1],[U0,0],[U1,1],[U0,1]]);}}
// Flat ring between radii r0 and r1 at height y, facing up or down.
function arcRing(P,name,c,r0,r1,a0,a1,y,{n=24,down=false}={}){for(let i=0;i<n;i++){const t0=a0+(a1-a0)*i/n,t1=a0+(a1-a0)*(i+1)/n,p=(r,t)=>v3(mp(c[0]+r*Math.cos(t),c[1]+r*Math.sin(t)),y);P.quad(name,p(r0,t0),p(r1,t0),p(r1,t1),p(r0,t1),[0,down?-1:1,0]);}}
// Sloped ring (a cone band) from (r0,y0) to (r1,y1).
function arcCone(P,name,c,r0,y0,r1,y1,a0,a1,n=24){for(let i=0;i<n;i++){const t0=a0+(a1-a0)*i/n,t1=a0+(a1-a0)*(i+1)/n,p=(r,t,y)=>v3(mp(c[0]+r*Math.cos(t),c[1]+r*Math.sin(t)),y);P.quad(name,p(r0,t0,y0),p(r0,t1,y0),p(r1,t1,y1),p(r1,t0,y1),[0,1,0]);}}
function rotunda(P,piece,K){const R=K.rotunda,ring=piece.ring,us=ring.map(gu),vs=ring.map(gv),u0=Math.min(...us),v0=Math.min(...vs),v1=Math.max(...vs),c=[u0,(v0+v1)/2],r=Math.max(...us)-u0,a0=-Math.PI/2,a1=Math.PI/2;
 // Recessed glass lobby wall, the column ring, soffit and entablature with the school's name.
 arcWall(P,'glassDark',c,r-3.0,a0,a1,0,R.colTop);arcRing(P,'kmcStone',c,r-3.0,r+.2,a0,a1,R.colTop,{down:true});arcRing(P,'paving',c,r-3.0,r+.1,a0,a1,.02);
 for(let i=0;i<R.col;i++){const t=a0+(a1-a0)*(i+.5)/R.col,q=mp(c[0]+(r-.45)*Math.cos(t),c[1]+(r-.45)*Math.sin(t)),M=new T.Matrix4().makeTranslation(...v3(q,R.colTop/2));P.cyl('column',.42,.42,R.colTop-.6,M,14);
  P.geo('kmcStone',new T.BoxGeometry(1.1,.3,1.1),new T.Matrix4().makeTranslation(...v3(q,.15)));P.geo('kmcStone',new T.BoxGeometry(1.15,.3,1.15),new T.Matrix4().makeTranslation(...v3(q,R.colTop-.15)));}
 // Over the columns (C stern_kmc): a stone band, a ring of windows, the band lettered LEONARD N. STERN
 // SCHOOL OF BUSINESS with a cornice, then a sloping glass dome with radial ribs and a stone rim.
 arcWall(P,'kmcStone',c,r+.2,a0,a1,R.colTop,R.win[0]);arcWall(P,'drumWin',c,r+.05,a0,a1,R.win[0],R.win[1],{n:32});
 arcWall(P,'sternText',c,r+.2,a0+.1,a1-.1,R.win[1],R.text);arcWall(P,'kmcStone',c,r+.2,a0,a0+.1,R.win[1],R.text,{n:2});arcWall(P,'kmcStone',c,r+.2,a1-.1,a1,R.win[1],R.text,{n:2});
 arcRing(P,'kmcStone',c,r+.05,r+.2,a0,a1,R.win[1],{n:32,down:true});arcWall(P,'kmcStone',c,r+.45,a0,a1,R.text,R.text+.45,{n:32});arcRing(P,'kmcStone',c,r+.2,r+.45,a0,a1,R.text,{n:32,down:true});arcRing(P,'kmcStone',c,r-.3,r+.45,a0,a1,R.text+.45,{n:32});
 arcCone(P,'glassBlue',c,r-.3,R.text+.45,r-4.4,R.dome,a0,a1,32);
 for(let i=0;i<=16;i++){const t=a0+(a1-a0)*i/16,A=new T.Vector3(...v3(mp(c[0]+(r-.3)*Math.cos(t),c[1]+(r-.3)*Math.sin(t)),R.text+.5)),B=new T.Vector3(...v3(mp(c[0]+(r-4.4)*Math.cos(t),c[1]+(r-4.4)*Math.sin(t)),R.dome+.05));
  P.cyl('frameGrey',.06,.06,A.distanceTo(B),new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),B.clone().sub(A).normalize()),new T.Vector3(1,1,1)),5);}
 arcWall(P,'kmcStone',c,r-4.4,a0,a1,R.dome,R.top,{n:24});arcRing(P,'roof',c,0,r-4.4,a0,a1,R.top);
 // Plain violet flags on poles angled out from the second and second-last columns (no logo), and the
 // centre's name over the door.
 for(const i of [1,R.col-2]){const t=a0+(a1-a0)*(i+.5)/R.col,q=mp(c[0]+(r+.1)*Math.cos(t),c[1]+(r+.1)*Math.sin(t)),o=mp(Math.cos(t),Math.sin(t)),f=new Face(v3(q,0),[o[0],0,-o[1]],[0,1,0]);
  P.block('frameGrey',f,0,1.9,6.2,6.27,-.03,.03);P.panel('flag',f,.25,1.5,4.0,6.2,0);}
 P.panel('kmcSign',new Face(v3(mp(c[0]+r-2.9,c[1]-2.2)),[GV[0],0,-GV[1]],[0,1,0]),0,4.4,6.4,7.3,0);
 return {c,r};}
export function sternParts(){const K=STERN,P=new Parts(),info={kmcWalls:0,tischWalls:0,rotunda:null};
 // Kaufman Management Center.
 const pk=pieces(model3d[K.kmc]),rot=pk.find(p=>p.ring.length>20&&p.z<25);info.rotunda=rot?rotunda(P,rot,K):null;
 for(const w of mergeWalls(walls(pk.filter(p=>p!==rot)))){const z=w.piece.z,y0=w.y0;info.kmcWalls++;
  if(y0<.5){// Two lowest storeys: big openings with red gridded frames between stone piers.
   storefront(P,w,0,8.4,{wall:'kmcStone',glass:'glassDark',frames:'redFrame',pitch:3.4,pier:.9,set:.35});
   const nb=Math.max(1,Math.round(w.len/3.4)),p=w.len/nb;for(let i=0;i<nb;i++){const a=i*p+.45,b=(i+1)*p-.45;if(b-a<1)continue;for(const y of [3.0,4.3,6.1])P.block('redFrame',w.face,a,b,y-.06,y+.06,-.35,-.25,{skip:['left','right']});for(let k=1;k<3;k++){const u=a+(b-a)*k/3;P.block('redFrame',w.face,u-.05,u+.05,.2,8.2,-.35,-.25,{skip:['top','bottom']});}}
   P.block('kmcStone',w.face,0,w.len,8.4,9.2,0,.08,{skip:['left','right']});}
  const yy=Math.max(y0,y0<.5?9.2:y0);if(z-yy>3)punched(P,w,yy,z,{...K.kmcWin,first:y0<.5?.4:1.0});else P.rect('kmcStone',w.face,0,w.len,yy,z,0);
  P.block('kmcStone',w.face,0,w.len,z-.45,z,0,.15,{skip:['left','right']});}
 roofs(P,pk.filter(p=>p!==rot),'roof');
 // Tisch Hall.
 const pt=pieces(model3d[K.tisch]),top=K.tischTop;
 for(const w of mergeWalls(walls(pt))){const z=w.piece.z,y0=w.y0,f=w.face;info.tischWalls++;
  if(z<top+.5){P.rect('sandstone',f,0,w.len,y0,z,0);continue;}// Inner face of the parapet frame.
  const plaza=y0<.5&&gdir(w.n)==='n'&&w.len>30;
  if(y0<.5){// Ground storey: sandstone with pale green glass panels; the glazed entrance on the plaza.
   P.rect('sandstone',f,0,w.len,0,5.2,0);const nb=Math.floor((w.len-1.6)/K.tischWin.pitch),p0=(w.len-nb*K.tischWin.pitch)/2;
   for(let i=0;i<nb;i++){const c=p0+(i+.5)*K.tischWin.pitch;if(plaza&&Math.abs(c-w.len/2)<5)continue;if(i%2===0)P.block('aqua',f,c-.8,c+.8,.4,4.6,-.1,.02,{skip:['back']});}
   if(plaza){const c=w.len/2;info.entrance={w,c};P.block('limestone',f,c-5,c+5,0,5.6,0,.5,{skip:['back','bottom']});P.block('glassWarm',f,c-4.5,c+4.5,0,4.3,.48,.52);for(let k=0;k<=6;k++){const u=c-4.5+k*1.5;P.block('frameDark',f,u-.05,u+.05,0,4.3,.5,.56);}
    P.panel('tischSign',f,c-4.3,c+4.3,4.55,5.15,.51);}}
  // Window grid up to the main roof; the top storey is dark glass recessed behind the sandstone frame.
  punched(P,w,Math.max(y0,5.2),top,{...K.tischWin,first:y0<.5?1.2:1.0});
  const nb=Math.max(1,Math.floor((w.len-1.2)/2.5)),p0=(w.len-nb*2.5)/2,holes=[];for(let i=0;i<nb;i++){const c=p0+(i+.5)*2.5;holes.push([[c-1.05,top+.6],[c+1.05,top+.6],[c+1.05,z-1.2],[c-1.05,z-1.2]]);}
  P.poly('sandstone',f,[[0,top],[w.len,top],[w.len,z],[0,z]],holes,0);for(const h of holes)P.recess('sandstone',f,h[0][0],h[1][0],h[0][1],h[2][1],1.4,'glassDark');}
 roofs(P,pt,'roof');
 return {P,info};}
export function buildStern(){const {P}=sternParts();
 const ks=stoneTextures({base:'#d6d0c3',vary:.03,course:1.3,courses:3,block:1.6,tileW:4.8,joint:.006,jointAlpha:.3,seed:51});
 const ss=stoneTextures({base:'#a85b48',vary:.06,course:.52,courses:8,block:.72,tileW:4.32,joint:.005,grain:1.6,seed:7,px:512,jointAlpha:.12,jointDepth:.5});
 const S=o=>new T.MeshStandardMaterial(o);
 const dw=(()=>{const c=document.createElement('canvas');c.width=1024;c.height=64;const g=c.getContext('2d');g.fillStyle='#cdc6b8';g.fillRect(0,0,1024,64);g.fillStyle='#26323a';for(let i=0;i<14;i++)g.fillRect(i*1024/14+14,12,1024/14-28,42);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;})();
 const text=(lines,o)=>{const t=signPanel(lines,o);t.wrapS=T.ClampToEdgeWrapping;return t;};
 const materials={kmcStone:S({map:ks.map,normalMap:ks.normalMap,normalScale:new T.Vector2(.3,.3),roughness:.75}),sandstone:S({map:ss.map,normalMap:ss.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.85}),
  limestone:S({color:0xd8d2c4,roughness:.7}),column:S({color:0xd3cdbf,roughness:.6}),paving:S({color:0xbdb6aa,roughness:.9}),roof:S({color:0x77736c,roughness:.95}),
  glass:S({color:0x3b4c57,roughness:.12,metalness:.6}),glassDark:S({color:0x1f2a31,roughness:.15,metalness:.55}),glassBlue:S({color:0x5d7f92,roughness:.08,metalness:.65,transparent:true,opacity:.85}),
  glassWarm:S({color:0xb59a6c,emissive:0x6b4d22,emissiveIntensity:.6,roughness:.15,metalness:.2}),aqua:S({color:0x9fc9c4,roughness:.25,metalness:.2}),
  frame:S({color:0x8a8d8f,roughness:.5,metalness:.5}),frameGrey:S({color:0x8f9193,roughness:.5,metalness:.5}),frameDark:S({color:0x2c2f31,roughness:.5,metalness:.5}),redFrame:S({color:0x9b2a22,roughness:.55,metalness:.3}),
  drumWin:S({map:dw,roughness:.7}),flag:S({color:0x57068c,roughness:.8,side:T.DoubleSide}),
  sternText:S({map:text(['LEONARD N. STERN SCHOOL OF BUSINESS'],{bg:'#d3cdbf',ink:'#6d675c',w:2048,h:96}),roughness:.7}),
  kmcSign:S({map:text(['HENRY KAUFMAN','MANAGEMENT CENTER'],{bg:'#3a3c3d',ink:'#e6dfcf',w:512,h:112}),roughness:.5,metalness:.4}),
  tischSign:S({map:text(['NYU STERN SCHOOL OF BUSINESS'],{bg:'#d8d2c4',ink:'#4a4640',w:1024,h:72}),roughness:.6})};
 const g=P.build(materials);for(const m of g.children)if(m.name==='glassBlue'){m.castShadow=false;m.renderOrder=2;}
 g.name='Stern: Kaufman Management Center and Tisch Hall';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
