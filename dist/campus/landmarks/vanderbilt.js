import * as T from '../../vendor/three.module.js';
import {Parts,Face,brickTextures,stoneTextures,reveal} from './kit.js?v=22';
import {pieces,walls,roofs,v3,signPanel,archHole,sashWindows,sashTexture,modillionCornice,pediment} from './facade.js?v=22';
import model3d from '../data/campus-3d.js?v=22';
// Arthur T. Vanderbilt Hall, NYU School of Law, 40 Washington Square South (Eggers & Higgins,
// 1948-51). Neo-Georgian red brick with limestone trim round a garden court: two five-storey wings run
// up to Washington Sq S, each ending in a pedimented gable, and a one-storey arcade of round arches
// closes the court along the square. Volume from the NYC 3D Building Model (2014); detail from Commons
// photos vh_1, vh_2, vh_entr, vh_gv019, vh_mmda and vh_arches.
export const VANDERBILT={bin:1008716,eave:22.6,ground:5.6,floor:4.0,
 // Window-bottom heights: ground floor, then floors 2-5, then the attic storey of the 26.3 m block.
 rows:[1.3,6.6,10.6,14.6,18.6,22.9],win:[[1.3,2.6],[1.3,2.4],[1.3,2.4],[1.3,2.4],[1.25,2.1],[1.1,1.7]],
 bands:[[6.15,6.45],[18.2,18.45]],base:.9,crossV:-178.6,
 arcade:{bays:5,open:3.2,spring:3.9,sill:.95,entrance:2}};
// Grid frame of the street grid here: u east along Washington Sq S, v north.
const GU=[.837,-.547],GV=[.547,.837];
const gdir=n=>{const a=n[0]*GU[0]+n[1]*GU[1],b=n[0]*GV[0]+n[1]*GV[1];return Math.abs(b)>=Math.abs(a)?(b>0?'n':'s'):(a>0?'e':'w');};
const gv=p=>p[0]*GV[0]+p[1]*GV[1],gu=p=>p[0]*GU[0]+p[1]*GU[1],mp=(u,v)=>[u*GU[0]+v*GV[0],u*GU[1]+v*GV[1]];
// Merge colinear consecutive walls of the same piece and height (the model splits many faces).
function merge(W){const out=[];for(const w of W){const p=out[out.length-1];
  if(p&&p.piece===w.piece&&Math.abs(p.y0-w.y0)<.05&&Math.hypot(p.b[0]-w.a[0],p.b[1]-w.a[1])<.3&&p.n[0]*w.n[0]+p.n[1]*w.n[1]>.995&&Math.abs((w.b[0]-p.a[0])*p.n[0]+(w.b[1]-p.a[1])*p.n[1])<.45){
   p.b=w.b;p.len=Math.hypot(p.b[0]-p.a[0],p.b[1]-p.a[1]);continue;}out.push({...w});}
 for(const w of out){const dx=w.b[0]-w.a[0],dn=w.b[1]-w.a[1];w.face=new Face(v3(w.a),[dx,0,-dn],[0,1,0]);}return out;}
export function vanderbiltParts(){const K=VANDERBILT,P=new Parts(),ps=pieces(model3d[K.bin]);
 const arcadePiece=ps.find(p=>Math.abs(p.z-6.5)<.2);const W=merge(walls(ps).filter(w=>w.piece!==arcadePiece));
 const info={wingEnds:[],arcade:null,doorcase:null,windows:0,sides:[]};
 const allU=ps.flatMap(p=>p.ring.map(gu)),uMin=Math.min(...allU),uMax=Math.max(...allU);
 const vFront=Math.max(...ps.flatMap(p=>p.ring.map(gv)));
 for(const w of W){const z=w.piece.z,y0=w.y0,dir=gdir(w.n),f=w.face,L=w.len;if(L<.4){P.rect('brick',f,0,L,y0,z,0);continue;}
  const tall=z>20,top=tall?z-.75:z-.3;
  // Wing ends on the square: three bays, blind recessed panels in the middle bay, pediment above.
  const wingEnd=tall&&dir==='n'&&Math.abs(gv(w.a)-vFront)<1.5&&L>11&&L<16;
  // Courtyard face of the south range (the doorcase seen through the entrance arch).
  const court=tall&&dir==='n'&&!wingEnd&&L>18&&gv(w.a)<vFront-20&&gv(w.a)>vFront-30;
  const rows=K.rows.filter(r=>r>=y0+.3),win=K.win.slice(K.rows.length-rows.length);
  let skip=null,bays={pitch:3.3,margin:1.1};
  if(wingEnd){// vh_1: the ends on the square carry only a central column of blind recessed panels.
   const c=L/2;bays=[c];skip=(i,r)=>(r+K.rows.length-rows.length>0&&r+K.rows.length-rows.length<5)?'panel':true;info.wingEnds.push(w);}
  // Side streets: the cross range ends in a pedimented centre on MacDougal and Sullivan Sts (Street View
  // Apr 2026), with the fanlit doorway of 131 MacDougal under the west one (C vh_mmda).
  const side=tall&&(dir==='w'||dir==='e')&&L>30&&Math.abs(gu(w.a)-(dir==='w'?uMin:uMax))<1.5;let sideC=null;
  if(side){const va=gv(w.a),vb=gv(w.b);sideC=(va-K.crossV)/(va-vb)*L;const nb=Math.floor((L-2.2)/3.3),p0=(L-nb*3.3)/2;bays=Array.from({length:nb},(_,i)=>p0+(i+.5)*3.3);
   skip=(i,r)=>dir==='w'&&r+K.rows.length-rows.length===0&&Math.abs(bays[i]-sideC)<2.2;info.sides.push({w,c:sideC,dir});}
  if(court){skip=(i,r)=>{const nb=Math.floor((L-2.2)/3.3);return r+K.rows.length-rows.length===0&&Math.abs(i-(nb-1)/2)<.6;};}
  const wins=sashWindows(P,w,y0,top,{rows,win,bays,skip,lintel:.0,panelInset:.2});info.windows+=wins.length;
  if(y0<.1)P.block('granite',f,0,L,0,K.base,0,.06,{skip:['left','right']});
  for(const [b0,b1] of K.bands)if(b0>y0&&b1<top)P.block('stone',f,0,L,b0,b1,0,.08,{skip:['left','right']});
  if(tall){P.rect('brick',f,0,L,top,z,0);if(wingEnd){P.block('stone',f,-.2,L+.2,z-.75,z-.4,0,.5);pediment(P,w,-.3,L+.3,z-.4,(L/2+.3)*Math.tan(20*Math.PI/180),{oculus:.55,glass:'glass'});}else{modillionCornice(P,w,z,{proj:.7,h:.75});if(sideC!==null)pediment(P,w,sideC-7,sideC+7,z,7*Math.tan(20*Math.PI/180),{oculus:.5,glass:'glass'});}}
  else P.block('stone',f,0,L,z-.3,z,0,.12,{skip:['left','right']});
  if(wingEnd&&y0<.1){// Ground storey of the wing end: an arched blind recess with an oval stone tablet.
   // The west wing's arch is an open doorway (vh_1, left); the east wing's is blind with a tablet.
   const west=gu(w.a)<-130;const h=archHole(L/2,2.8,west?0:1.0,3.5,12);reveal(P,'brick',f,h,west?.6:.3,west?'door':'brick');
   for(const s2 of [-1,1])P.block('stone',f,L/2+s2*1.4-.3,L/2+s2*1.4+.3,3.3,3.55,0,.06);P.block('stone',f,L/2-.22,L/2+.22,4.7,5.35,0,.05);
   if(!west)P.block('stone',f,L/2-.55,L/2+.55,1.6,3.6,-.29,-.22);}
  if(side&&dir==='w'&&y0<.1){const c=sideC,d=archHole(c,1.8,K.base,3.1,12);reveal(P,'stone',f,d,.3,null);P.panel('door',f,c-.9,c+.9,K.base,3.1,-.29);P.panel('fan',f,c-.9,c+.9,3.1,4.0,-.29);
   P.block('stone',f,c-.2,c+.2,3.85,4.3,0,.05);P.block('iron',f,c-.17,c+.17,2.6,3.05,0,.3);P.block('lamp',f,c-.12,c+.12,2.65,3.0,.05,.25);for(let k=0;k<3;k++)P.block('granite',f,c-1.2,c+1.2,k*.15,(k+1)*.15,0,.9-k*.3);}
  if(court&&y0<.1){// Doorcase: limestone pilasters, entablature and pediment over a fanlit double door.
   const c=L/2;info.doorcase={w,c};P.block('stone',f,c-1.65,c-1.2,K.base,4.3,0,.16);P.block('stone',f,c+1.2,c+1.65,K.base,4.3,0,.16);P.block('stone',f,c-1.85,c+1.85,4.3,4.85,0,.24);
   pediment(P,w,c-1.95,c+1.95,4.85,.85,{wall:'stone',name:'stone',proj:.3,t:.2});const d=archHole(c,1.9,.45,3.1,12);reveal(P,'stone',f,d,.25,null);
   P.panel('door',f,c-.95,c+.95,.45,3.1,-.24);P.panel('fan',f,c-.95,c+.95,3.1,4.05,-.24);for(let k=0;k<3;k++)P.block('granite',f,c-1.4,c+1.4,k*.15,(k+1)*.15,0,.9-k*.3);}
 }
 roofs(P,ps,'roof');
 // Arcade along the square: a thick brick wall pierced by five round arches; the middle one is the
 // entrance, the others stand on a granite base with iron railings.
 if(arcadePiece){const us=arcadePiece.ring.map(gu),vs=arcadePiece.ring.map(gv),u0=Math.min(...us),u1=Math.max(...us),vF=Math.max(...vs),vB=Math.min(...vs),L=u1-u0,D=vF-vB,top=arcadePiece.z,A=K.arcade;
  const f=new Face(v3(mp(u1,vF)),[-GU[0],0,GU[1]],[0,1,0]),pitch=L/A.bays,holes=[];info.arcade={L,D,f,pitch};
  for(let i=0;i<A.bays;i++){const c=(i+.5)*pitch,ent=i===A.entrance;holes.push({c,ent,h:archHole(c,A.open,ent?0:A.sill,A.spring,14)});}
  P.poly('brick',f,[[0,A.sill],[L,A.sill],[L,top],[0,top]],holes.filter(h=>!h.ent).map(h=>h.h).concat(holes.filter(h=>h.ent).map(h=>archHole(h.c,A.open,A.sill,A.spring,14))),0);
  const ent=holes.find(h=>h.ent);P.poly('granite',f,[[0,0],[L,0],[L,A.sill],[0,A.sill]],[[[ent.c-A.open/2,0],[ent.c+A.open/2,0],[ent.c+A.open/2,A.sill],[ent.c-A.open/2,A.sill]]],0);
  const back=new Face(f.at(L,0,-D),f.u.map(x=>-x),f.v);P.poly('brick',back,[[0,0],[L,0],[L,top],[0,top]],holes.map(h=>h.h.map(([u,v])=>[L-u,v])),0);
  for(const h of holes){reveal(P,'brick',f,h.h,D,null);const c=h.c;
   P.block('stone',f,c-A.open/2-.45,c-A.open/2,A.spring-.2,A.spring+.05,0,.06,{skip:['right']});P.block('stone',f,c+A.open/2,c+A.open/2+.45,A.spring-.2,A.spring+.05,0,.06,{skip:['left']});
   P.block('stone',f,c-.22,c+.22,A.spring+A.open/2-.25,A.spring+A.open/2+.45,0,.05);
   if(h.ent){for(let k=0;k<3;k++)P.block('granite',f,c-A.open/2,c+A.open/2,k*.17,(k+1)*.17,-D,-.25-k*.35,{skip:['left','right']});continue;}
   // Railing: bars every 12 cm with top and bottom rails, set just inside the face.
   for(let u=c-A.open/2+.08;u<c+A.open/2-.04;u+=.12)P.block('iron',f,u-.012,u+.012,A.sill,A.sill+1.3,-.32,-.29,{skip:['bottom']});
   for(const y of [A.sill+.08,A.sill+1.2])P.block('iron',f,c-A.open/2,c+A.open/2,y,y+.04,-.33,-.28,{skip:['left','right']});}
  P.block('stone',f,0,L,top-.3,top,0,.1,{skip:['left','right']});
  // Street number, the two bronze name plaques and the lanterns beside the entrance arch.
  const e=ent.c,pl=e-A.open/2-.25,pr=e+A.open/2+.25;P.panel('num',f,pl-.22,pl+.22,2.55,2.8,.02);P.panel('plaqueL',f,pl-.4,pl+.4,1.75,2.25,.02);P.panel('plaqueR',f,pr-.4,pr+.4,1.75,2.25,.02);
  for(const x of [pl,pr]){P.block('iron',f,x-.17,x+.17,2.9,3.35,0,.3);P.block('lamp',f,x-.12,x+.12,2.95,3.3,.05,.25);}}
 // A plain violet banner on the corner of Washington Sq S and Sullivan St (no logo).
 const ce=W.filter(w=>w.piece.z>20&&gdir(w.n)==='e').sort((a,b)=>gv(b.a)-gv(a.a))[0];
 if(ce){const f=ce.face,u=Math.max(gv(ce.a)>gv(ce.b)?.8:ce.len-.8,0);P.block('iron',f,u-.03,u+.03,8.6,8.66,0,1.1);P.block('iron',f,u-.03,u+.03,11.4,11.46,0,1.1);P.panel('banner',new Face(f.at(u,0,.25),[...f.n],[0,1,0]),0,.75,8.7,11.4,0);P.panel('banner',new Face(f.at(u,0,1.0),f.n.map(x=>-x),[0,1,0]),0,.75,8.7,11.4,0);}
 return {P,info};}
export function buildVanderbilt(){const {P}=vanderbiltParts();
 const br=brickTextures({base:'#9b4b36',mortar:'#c9bfb0',vary:.09,seed:41}),st=stoneTextures({base:'#d8d0bf',vary:.03,course:.6,courses:3,block:1.2,joint:.008,jointAlpha:.22,seed:42});
 const S=(m,o={})=>new T.MeshStandardMaterial({...o,...m});
 const materials={brick:S({map:br.map,normalMap:br.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.9}),stone:S({map:st.map,normalMap:st.normalMap,normalScale:new T.Vector2(.3,.3),roughness:.75}),
  granite:S({color:0xa9a59d,roughness:.7}),sash:S({map:sashTexture({cols:3,rows:2}),roughness:.35,metalness:.1}),glass:S({color:0x1e252b,roughness:.4,metalness:.1}),
  iron:S({color:0x1c1e1f,roughness:.5,metalness:.6}),lamp:S({color:0xfff1cc,emissive:0xffe2a8,emissiveIntensity:.7}),roof:S({color:0x77736c,roughness:.95}),
  door:S({color:0x141617,roughness:.5}),fan:S({map:sashTexture({cols:4,rows:1,glass:'#3a4650'}),roughness:.3}),
  num:S({map:signPanel(['40'],{bg:'#1b1b1b',ink:'#d8c58c',w:128,h:80}),roughness:.5}),
  plaqueL:S({map:signPanel(['ARTHUR T. VANDERBILT','HALL'],{bg:'#5b4527',ink:'#e2cf98',h:256}),roughness:.4,metalness:.6}),
  plaqueR:S({map:signPanel(['NEW YORK UNIVERSITY','SCHOOL OF LAW'],{bg:'#5b4527',ink:'#e2cf98',h:256}),roughness:.4,metalness:.6}),
  banner:S({color:0x57068c,roughness:.8,side:T.DoubleSide})};
 const g=P.build(materials);g.name='Vanderbilt Hall';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
