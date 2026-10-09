import * as T from '../../vendor/three.module.js';
import {Parts,Face,stoneTextures,canvas,brickTextures} from './kit.js?v=24';
const tex=(w,h,draw)=>{const c=canvas(w,h);draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;};
import {pieces,roofs,v3,signPanel} from './facade.js?v=24';
import model3d from '../data/campus-3d.js?v=24';
// University Village: Silver Towers I and II (100 and 110 Bleecker St, NYU) and 505 LaGuardia Place
// (co-op), I. M. Pei & Associates, 1964-67; NYC landmark 2008 (LPC report 2300). Three identical
// 30-storey towers of cast-in-place buff concrete set in a pinwheel round a 100 x 100 ft lawn.
// Plans and heights from the NYC 3D Building Model (2014). Facade grammar from LPC 2300 pp. 8 and 15
// and Commons photos (st_j04, st_flickr2, st_uv002):
//  - every face of the main shaft carries a waffle grid of four or eight deeply recessed bays per floor,
//    framed by T-shaped columns that narrow toward the front (a wedge in plan) and floor slabs;
//  - each bay is a pair of sliding windows over a ventilation grille;
//  - beside the grid, a slot of narrow windows, then a smooth windowless shear wall in vertical panels;
//  - at the ground storey the columns run more than twice the floor height: on the entrance fronts they
//    form a deep arcade before a glazed lobby flanked by tan brick; elsewhere large windows over a base.
// Bay pitch 2.30 m (eight bays over the 18.6 m grid of tower I's west face); 29 upper floors of 2.65 m
// over a 5.6 m ground storey reach the 82.5 m roof (estimates checked against st_j04).
export const SILVER_TOWERS={bins:[1087825,1083218,1008241],pitch:2.3,ground:5.6,depth:.75,
 // Entrance (arcade) front of each tower, as the grid-frame direction it faces: towers I and II face
 // the lawn (west and north); 505 LaGuardia's lobby faces north (LPC 2300 p. 15).
 front:{1087825:'w',1083218:'n',1008241:'n'},number:{1087825:'100',1083218:'110',1008241:'505'}};
// Bust of Sylvette (Carl Nesjar after Picasso, 1968): at the south-east corner of the central lawn,
// opposite the entrance to 110 Bleecker (LPC 2300 p. 14). The sculpture is a protected artwork, so it is
// represented by a neutral, non-figurative placeholder of its overall size (36 ft high, 20 ft wide,
// 12.5 in thick) on a low plinth, with the small plaque pedestal beside it. The OpenStreetMap node for
// it sits 115 m further south, near Houston St, and is not used.
export const SYLVETTE={p:[-108.3,-478.6],facing:[-.23,.97],w:6.1,h:11,t:.32,plinth:[7.4,2.4,.45]};
// Grid frame of the Manhattan street grid here: u along Bleecker St (east), v along Mercer St (north).
const GU=[.837,-.547],GV=[.547,.837];
const DIRS={e:GU,w:[-GU[0],-GU[1]],n:GV,s:[-GV[0],-GV[1]]};
// Edges of the main roof piece, with colinear runs merged (the 3D model splits some faces).
function edges(ring){const E=[];for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.05)continue;E.push({a,b,len,t:[(b[0]-a[0])/len,(b[1]-a[1])/len]});}
 const out=[];for(const e of E){const p=out[out.length-1];if(p){const cr=p.t[0]*e.t[1]-p.t[1]*e.t[0],dot=p.t[0]*e.t[0]+p.t[1]*e.t[1],off=Math.abs((e.b[0]-p.a[0])*p.t[1]-(e.b[1]-p.a[1])*p.t[0]);
   if(dot>.995&&Math.abs(cr)<.06&&off<.3){p.b=e.b;p.len=Math.hypot(p.b[0]-p.a[0],p.b[1]-p.a[1]);p.t=[(p.b[0]-p.a[0])/p.len,(p.b[1]-p.a[1])/p.len];continue;}}out.push({...e});}
 const f=out[0],l=out[out.length-1];if(out.length>2&&f.t[0]*l.t[0]+f.t[1]*l.t[1]>.995&&Math.abs((f.b[0]-l.a[0])*l.t[1]-(f.b[1]-l.a[1])*l.t[0])<.3){l.b=f.b;l.len=Math.hypot(l.b[0]-l.a[0],l.b[1]-l.a[1]);out.shift();}
 for(const e of out){e.n=[e.t[1],-e.t[0]];e.face=new Face(v3(e.a),[e.t[0],0,-e.t[1]],[0,1,0]);}return out;}
// Plan of the wedge column between two bays: front width wf at the face, back width wb at the glass.
function wedge(P,name,f,u,y0,y1,{wf=.3,wb=.52,depth=.75}={}){const q=(du,d,y)=>f.at(u+du,y,d);
 const a=[-wf/2,0],b=[wf/2,0],c=[wb/2,-depth],d=[-wb/2,-depth];
 P.quad(name,q(a[0],a[1],y0),q(b[0],b[1],y0),q(b[0],b[1],y1),q(a[0],a[1],y1),f.n);
 P.quad(name,q(b[0],b[1],y0),q(c[0],c[1],y0),q(c[0],c[1],y1),q(b[0],b[1],y1),f.u);P.quad(name,q(d[0],d[1],y0),q(a[0],a[1],y0),q(a[0],a[1],y1),q(d[0],d[1],y1),f.u.map(x=>-x));}
// Glazing plane behind a waffle grid, UVs in cells (4 x 4 cells per texture tile).
function cells(P,name,f,u0,u1,y0,y1,d,pitch,floor,uo=0){const A=f.at(u0,y0,d),B=f.at(u1,y0,d),C=f.at(u1,y1,d),D=f.at(u0,y1,d),n=f.n;
 const U=(u,y)=>[(u-uo)/pitch/4,(y-y0)/floor/4];P.push(name,[A,B,C,A,C,D],[n,n,n,n,n,n],[U(u0,y0),U(u1,y0),U(u1,y1),U(u0,y0),U(u1,y1),U(u0,y1)]);}
function towerParts(bin,P,K){const m=model3d[bin];if(!m)return null;const ps=pieces(m);
 const main=ps.filter(p=>p.z>70).sort((a,b)=>area(b.ring)-area(a.ring))[0];const top=main.z,G=K.ground,floor=(top-G-.35)/29,dep=K.depth;
 const E=edges(main.ring),want=DIRS[K.front[bin]];
 const front=E.filter(e=>e.len>15).sort((a,b)=>(b.n[0]*want[0]+b.n[1]*want[1])-(a.n[0]*want[0]+a.n[1]*want[1]))[0];
 const info={front,grids:[],shear:[]};
 E.forEach((e,i)=>{const f=e.face,prev=E[(i-1+E.length)%E.length],next=E[(i+1)%E.length];
  if(e.len<3){P.rect('concrete',f,0,e.len,0,top,0);return;}
  if(e.len<9){// Set-back shear wall: smooth panels, full height.
   P.rect('shear',f,0,e.len,0,top,0);info.shear.push(e);return;}
  // Waffle grid of eight (long faces) or four (end faces) bays, at the end away from the jog; then a
  // slot of narrow windows and a strip of shear wall.
  const nb=e.len>15?8:4,gw=nb*K.pitch,slot=.55,jogAtEnd=next.len<=prev.len,g0=jogAtEnd?0:e.len-gw,g1=g0+gw;
  const s0=jogAtEnd?g1:g0-slot,s1=s0+slot,b0=jogAtEnd?s1:0,b1=jogAtEnd?e.len:s0;
  if(b1-b0>.05)P.rect('shear',f,b0,b1,0,top,0);
  P.rect('concrete',f,s0,s1,top-.35,top,0);P.rect('concrete',f,s0,s1,0,G,0);
  cells(P,'slot',f,s0,s1,G,top-.35,-.12,slot,floor,s0);P.block('concrete',f,s0-.02,s0+.06,G,top-.35,-.12,0,{skip:['top','bottom']});P.block('concrete',f,s1-.06,s1+.02,G,top-.35,-.12,0,{skip:['top','bottom']});
  const isFront=e===front;info.grids.push({e,g0,g1,isFront});
  // Columns: wedge-shaped, full height; at the ground they run down to the pavement.
  for(let k=0;k<=nb;k++){const u=g0+k*K.pitch,end=k===0||k===nb;
   if(end)P.block('concrete',f,u-(k===0?0:.25),u+(k===0?.25:0),0,top,-dep,0,{skip:['bottom']});
   else wedge(P,'concrete',f,u,isFront?0:G,top,{depth:dep});}
  // Floor slabs with a shallow sill lip, and the parapet band.
  for(let r=0;r<=29;r++){const y=G+r*floor;P.block('concrete',f,g0,g1,y-.19,y+.17,-dep,0,{skip:['left','right']});}
  P.block('concrete',f,g0,g1,top-.35,top,-dep,0,{skip:['left','right','bottom']});
  cells(P,'cells',f,g0,g1,G,G+29*floor,-dep,K.pitch,floor,g0);
  if(isFront){// Arcade: lobby glass set 3.2 m back behind the tall columns, tan brick at both ends,
   // soffit, entrance pavilion and the address numerals.
   const back=-3.2;P.rect('lobby',f,g0+.25,g1-.25,0,G-.4,back);P.block('brick',f,g0+.25,g0+K.pitch,0,G,back,-dep,{skip:['top','bottom']});P.block('brick',f,g1-K.pitch,g1-.25,0,G,back,-dep,{skip:['top','bottom']});
   P.block('concrete',f,g0,g1,G-.4,G,back,-dep,{skip:['left','right','top']});
   const c=(g0+g1)/2;P.block('frameDark',f,c-1.6,c+1.6,0,2.9,back,back+1.0,{skip:['bottom']});P.rect('lobby',f,c-1.4,c+1.4,0,2.7,back+1.01);
   P.panel('num'+bin,f,g1-K.pitch+.3,g1-K.pitch+1.5,2.4,2.95,-dep+.02);
   if(bin!==1008241)P.panel('plaque',f,g1-K.pitch+.3,g1-K.pitch+1.5,1.4,2.1,-dep+.02);}
  else{// Secondary faces: a raised concrete base with large windows between the columns.
   P.rect('concrete',f,g0,g1,0,1.1,-dep);P.rect('lobby',f,g0,g1,1.1,G-.2,-dep);P.block('concrete',f,g0,g1,G-.2,G+.05,-dep,0,{skip:['left','right']});}
 });
 roofs(P,ps,'roof');
 // Rooftop bulkheads (the higher pieces) in plain concrete.
 for(const p of ps.filter(p=>p.z>top+.5)){const r=p.ring;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dn=b[1]-a[1];if(Math.hypot(dx,dn)<.1)continue;P.rect('concrete',new Face(v3(a),[dx,0,-dn],[0,1,0]),0,Math.hypot(dx,dn),top,p.z,0);}}
 return info;}
const area=r=>{let A=0;for(let i=0;i<r.length;i++){const j=(i+1)%r.length;A+=r[i][0]*r[j][1]-r[j][0]*r[i][1];}return Math.abs(A/2);};
// Free-standing box: kit.block leaves out the back (d0) face, so add it.
function solid(P,name,f,u0,u1,v0,v1,d0,d1){P.block(name,f,u0,u1,v0,v1,d0,d1);P.quad(name,f.at(u0,v0,d0),f.at(u1,v0,d0),f.at(u1,v1,d0),f.at(u0,v1,d0),f.n.map(x=>-x));}
export function sylvetteParts(P,S=SYLVETTE){const t=[S.facing[1],-S.facing[0]],f=new Face(v3([S.p[0]-t[0]*S.w/2,S.p[1]-t[1]*S.w/2]),[t[0],0,-t[1]],[0,1,0]),[pw,pd,ph]=S.plinth;
 // f.n points away from the lawn (-facing), so the lawn side is negative d.
 solid(P,'concrete',f,(S.w-pw)/2,(S.w+pw)/2,0,ph,-pd/2,pd/2);
 solid(P,'betograve',f,0,S.w,ph,ph+S.h,-S.t/2,S.t/2);
 // Plaque on a low concrete pedestal, 3 m in front of the sculpture on the lawn side.
 solid(P,'concrete',f,S.w/2-.35,S.w/2+.35,0,.55,-3.3,-2.8);solid(P,'brass',f,S.w/2-.3,S.w/2+.3,.55,.58,-3.25,-2.85);}
export function silverTowersParts(){const K=SILVER_TOWERS,P=new Parts(),infos={};for(const bin of K.bins)infos[bin]=towerParts(bin,P,K);sylvetteParts(P);return {P,infos};}
function cellTexture(){// 4 x 4 cells: two sliding lights over a louvred grille; curtains and lit rooms vary.
 const rnd=(i=>()=>(i=(i*16807)%2147483647)/2147483647)(97);
 return tex(512,512,(g,w,h)=>{g.fillStyle='#6f675b';g.fillRect(0,0,w,h);const cw=w/4,ch=h/4;
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){const x=c*cw,y=h-(r+1)*ch,gx=x+cw*.09,gw=cw*.82,gy=y+ch*.06,gh=ch*.6;
   const tone=rnd();g.fillStyle=tone<.25?'#a29b8c':tone<.35?'#a8987a':'#232c33';g.fillRect(gx,gy,gw,gh);
   if(tone>=.35){const gr=g.createLinearGradient(gx,gy,gx+gw,gy+gh);gr.addColorStop(0,'rgba(170,190,205,.35)');gr.addColorStop(1,'rgba(40,50,60,0)');g.fillStyle=gr;g.fillRect(gx,gy,gw,gh);}
   g.fillStyle='#6e675c';g.fillRect(gx,gy,gw,3);g.fillRect(gx,gy+gh-3,gw,3);g.fillRect(gx+gw/2-2,gy,4,gh);g.fillRect(gx,gy,3,gh);g.fillRect(gx+gw-3,gy,3,gh);
   // Baked shade of the deep reveal: darker under the slab above and beside the columns.
   const sh=g.createLinearGradient(0,y,0,y+ch*.35);sh.addColorStop(0,'rgba(0,0,0,.55)');sh.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sh;g.fillRect(x,y,cw,ch*.35);
   for(const [x0,dir] of [[x,1],[x+cw,-1]]){const sg=g.createLinearGradient(x0,0,x0+dir*cw*.18,0);sg.addColorStop(0,'rgba(0,0,0,.4)');sg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sg;g.fillRect(Math.min(x0,x0+dir*cw*.18),y,cw*.18,ch);}
   const ly=gy+gh+ch*.04,lh=ch*.24;g.fillStyle='#3f3c37';g.fillRect(gx,ly,gw,lh);g.fillStyle='#57534c';for(let k=0;k<lh;k+=5)g.fillRect(gx,ly+k,gw,2);}});}
function slotTexture(){return tex(64,256,(g,w,h)=>{g.fillStyle='#9c9282';g.fillRect(0,0,w,h);for(let r=0;r<4;r++){const y=h-(r+1)*h/4;g.fillStyle='#2c363d';g.fillRect(w*.18,y+h/4*.08,w*.64,h/4*.78);}});}
function numberTexture(txt){return tex(256,128,(g,w,h)=>{g.fillStyle='#b8a17e';g.fillRect(0,0,w,h);g.fillStyle='#5b4a33';g.font='bold 92px Helvetica,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h/2+4);});}
export function buildSilverTowers(b){const {P}=silverTowersParts(),K=SILVER_TOWERS;
 const conc=stoneTextures({base:'#b6a58b',vary:.035,course:2.65,courses:2,block:1.53,tileW:4.6,joint:.004,jointAlpha:.18,seed:31});
 const shear=stoneTextures({base:'#b9a98f',vary:.025,course:2.65,courses:2,block:1.15,tileW:4.6,joint:.004,jointAlpha:.28,seed:33});
 const cellsTex=cellTexture();cellsTex.wrapS=cellsTex.wrapT=T.RepeatWrapping;const slotTex=slotTexture();slotTex.wrapS=slotTex.wrapT=T.RepeatWrapping;
 const br=brickTextures?brickTextures({base:'#b79a72',seed:5}):null;
 const materials={concrete:new T.MeshStandardMaterial({map:conc.map,normalMap:conc.normalMap,normalScale:new T.Vector2(.3,.3),roughness:.9}),
  shear:new T.MeshStandardMaterial({map:shear.map,normalMap:shear.normalMap,normalScale:new T.Vector2(.35,.35),roughness:.88}),
  cells:new T.MeshStandardMaterial({map:cellsTex,roughness:.45,metalness:.1}),slot:new T.MeshStandardMaterial({map:slotTex,roughness:.4,metalness:.2}),
  lobby:new T.MeshStandardMaterial({color:0x33424b,roughness:.1,metalness:.6}),frameDark:new T.MeshStandardMaterial({color:0x4a3a2c,roughness:.6,metalness:.4}),
  brick:br?new T.MeshStandardMaterial({map:br.map,normalMap:br.normalMap,roughness:.9}):new T.MeshStandardMaterial({color:0xb79a72,roughness:.9}),
  roof:new T.MeshStandardMaterial({color:0x8c8578,roughness:.95}),betograve:new T.MeshStandardMaterial({color:0x8d877c,roughness:.95}),brass:new T.MeshStandardMaterial({color:0xa58a4a,roughness:.4,metalness:.8}),
  plaque:new T.MeshStandardMaterial({map:signPanel(['SILVER TOWERS','NEW YORK UNIVERSITY'],{bg:'#9a8a6c',ink:'#2d2618',h:160}),roughness:.5,metalness:.5})};
 for(const bin of K.bins)materials['num'+bin]=new T.MeshStandardMaterial({map:numberTexture(K.number[bin]),roughness:.6,metalness:.3});
 const g=P.build(materials);g.name='Silver Towers';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
