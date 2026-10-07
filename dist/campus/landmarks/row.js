import * as T from '../../vendor/three.module.js';
import {Parts,Face,brickTextures,grainTextures} from './kit.js?v=21';
import {pieces,walls,v3} from './facade.js?v=21';
import model3d from '../data/campus-3d.js?v=21';
// "The Row": Greek Revival town houses on Washington Square North (LPC Greenwich Village HD
// report LP-0489 pp.52–57). East of Fifth Avenue, Nos. 1–13 (1832–33): red brick in Flemish bond,
// white marble porticoes with two fluted Doric columns, marble stoops, pedimented marble lintels
// with little cornices, floor-length parlour windows, an entablature with attic windows cut into
// its frieze, and the continuous Greek Revival iron railing along the sidewalk with double gates.
// Nos. 7–13 are fronts kept in 1939 on a new apartment house, with their cornice raised a storey;
// No. 3 was remodelled in 1884 (Queen Anne). West of Fifth, Nos. 19–26 are a looser group of the
// same period (brownstone trim, shutters, iron balconies).
// Each house is built on its footprint's street front (edges facing the park, about 35 m off the
// street centreline); the rest of the volume comes from the 3D model.
const PARK=[-0.54,-0.84];
export const ROW={
 // [bin, houses on this front, variant]; listed west → east within each group.
 east:[[1078085,7,'tall'],[1080109,1,'east'],[1008843,1,'east'],[1008842,1,'east'],[1080107,1,'queenAnne'],[1085663,1,'east'],[1066883,1,'east']],
 west:[[1008854,1,'brown'],[1077886,1,'shutters'],[1008853,1,'brown'],[1008852,1,'plain'],[1080111,1,'shutters'],[1077885,1,'brown'],[1008851,2,'plain'],[1077881,1,'shutters']],
 fenceSet:3.6};
export const ROW_BINS=[...ROW.east,...ROW.west].map(r=>r[0]);
function fronts(b){const r=b.rings[0];let A=0;for(let i=0;i<r.length;i++){const j=(i+1)%r.length;A+=r[i][0]*r[j][1]-r[j][0]*r[i][1];}const cc=A>0?r:[...r].reverse(),out=[];
 for(let i=0;i<cc.length;i++){const p=cc[i],q=cc[(i+1)%cc.length],dx=q[0]-p[0],dn=q[1]-p[1],L=Math.hypot(dx,dn);if(L<3)continue;const n=[dn/L,-dx/L];if(n[0]*PARK[0]+n[1]*PARK[1]<.95)continue;
  const mid=[(p[0]+q[0])/2,(p[1]+q[1])/2],off=mid[0]*PARK[0]+mid[1]*PARK[1];if(off<-38||off>-32)continue;out.push({a:p,b:q,len:L,n});}return out;}
// One town house front on face f between u0 and u1 (viewer's left to right), cornice at H.
function house(P,f,u0,u1,H,variant,doorLeft){const w=u1-u0,bay=w/3,c=i=>u0+(i+.5)*bay,tall=variant==='tall',qa=variant==='queenAnne';
 const trim=variant==='brown'?'brown':'marble',base=1.9,floors=tall?[base,5.9,9.4,12.7]:[base,5.9,9.5],top=tall?15.9:12.9,ent=top+.35,frieze=ent+1.5,cor=frieze+.8;
 const winH=[3.2,2.4,2.2,1.8],doorBay=doorLeft?0:2,holes=[];const wins=[];
 floors.forEach((y,k)=>{for(let i=0;i<3;i++){if(k===0&&i===doorBay&&!qa)continue;const ww=k===0?1.05:1.0,hh=winH[k];wins.push({u0:c(i)-ww/2,u1:c(i)+ww/2,v0:y+(k===0?.25:.75),v1:y+(k===0?.25:.75)+hh,k});}});
 if(qa)wins.push({u0:c(1)-1.6,u1:c(1)+1.6,v0:13.3,v1:15.6,k:9});
 if(!qa){wins.push({u0:c(doorBay)-.75,u1:c(doorBay)+.75,v0:base+.05,v1:base+3.35,k:-1});}
 // Basement (raised, rusticated brownstone) windows.
 for(let i=0;i<3;i++)if(i!==doorBay||qa)wins.push({u0:c(i)-.55,u1:c(i)+.55,v0:.35,v1:1.45,k:-2});
 for(const q of wins)holes.push([[q.u0,q.v0],[q.u1,q.v0],[q.u1,q.v1],[q.u0,q.v1]]);
 const brickTop=qa?Math.min(H,17):ent;P.poly('brick',f,[[u0,base],[u1,base],[u1,brickTop],[u0,brickTop]],holes.filter(h=>h[0][1]>=base-.01),0);
 P.poly('brownstone',f,[[u0,0],[u1,0],[u1,base],[u0,base]],holes.filter(h=>h[0][1]<base),.08);
 for(let v=.5;v<base;v+=.5)P.block('brownstone',f,u0,u1,v-.03,v,.04,.081,{skip:['left','right']});
 const back=new Face(f.at(0,0,0),f.u,f.v);
 for(const q of wins){const d=q.k===-2?.08:0,door=q.k===-1;P.recess(door?'door':'brick',new Face(f.at(0,0,d),f.u,f.v),q.u0,q.u1,q.v0,q.v1,door?.45:.22,door?'door':'glass');
  if(door){P.block('marble',f,q.u0-.25,q.u1+.25,q.v1,q.v1+.5,0,.06);P.panel('fanlight',f,q.u0+.05,q.u1-.05,q.v1-.75,q.v1-.05,-.4);continue;}
  // Six-over-six sash: white frame, meeting rail and muntins.
  const mu=(q.u0+q.u1)/2,mv=(q.v0+q.v1)/2;P.block('sash',f,q.u0,q.u1,mv-.04,mv+.04,-.22,-.16);for(const t of [1/3,2/3])P.block('sash',f,q.u0+(q.u1-q.u0)*t-.02,q.u0+(q.u1-q.u0)*t+.02,q.v0,q.v1,-.22,-.18);
  P.block('sash',f,q.u0,q.u1,q.v0,q.v1,-.22,-.2,{skip:['top','bottom','left','right']});
  if(q.k>=0&&q.k<9){P.block(trim,f,q.u0-.12,q.u1+.12,q.v0-.12,q.v0,d,d+.1);// sill
   // Pedimented lintel with level shoulders and a little cornice (LPC).
   P.block(trim,f,q.u0-.18,q.u1+.18,q.v1,q.v1+.36,d,d+.06);P.block(trim,f,q.u0-.24,q.u1+.24,q.v1+.36,q.v1+.44,d,d+.14);
   if(variant!=='plain'&&variant!=='brown'){const g=new T.Shape([[-1,0],[1,0],[0,.3]].map(p=>new T.Vector2(p[0]*(q.u1-q.u0)/2,p[1])));P.geo(trim,new T.ExtrudeGeometry(g,{depth:.08,bevelEnabled:false}),f.matrix(mu,q.v1+.44,d));}}
  if(variant==='shutters'&&q.k>=0&&q.k<9)for(const s of [-1,1])P.block('shutter',f,s<0?q.u0-.55:q.u1,s<0?q.u0:q.u1+.55,q.v0,q.v1,.02,.06);
  if(variant==='brown'&&q.k===1)P.block('iron',f,q.u0-.3,q.u1+.3,q.v0-.05,q.v0+.9,0,.45,{skip:['top']});}
 // Portico: two fluted Doric columns, entablature, marble stoop with iron rails.
 if(!qa){const cu=c(doorBay),pd=1.35;for(const s of [-1,1]){const m=f.matrix(cu+s*1.0,base+1.75,pd-.2);P.lathe(trim,[[0,-1.75],[.2,-1.75],[.19,-1.6],[.17,1.45],[.24,1.6],[.27,1.75],[0,1.75]],m,16);}
  P.block(trim,f,cu-1.35,cu+1.35,base+3.5,base+4.3,0,pd+.05);P.block(trim,f,cu-1.45,cu+1.45,base+4.3,base+4.45,0,pd+.15);
  for(let k=0;k<7;k++){const y=base-k*base/7;P.block('marble',f,cu-1.0,cu+1.0,0,y,pd+k*.32,pd+(k+1)*.32,{skip:['bottom']});}
  P.block('marble',f,cu-1.15,cu+1.15,0,base,0,pd,{skip:['bottom']});
  for(const s of [-1,1]){const x=cu+s*1.05;for(let k=0;k<=7;k++)P.block('iron',f,x-.015,x+.015,base-k*base/7,base-k*base/7+.9,pd+k*.32,pd+k*.32+.03);
   const a=f.at(x,base+.9,pd),b=f.at(x,.9,pd+7*.32),L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize());
   P.cyl('iron',.03,.03,L,new T.Matrix4().compose(new T.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),q,new T.Vector3(1,1,1)),6);}}
 // Entablature: architrave with taenia and guttae, frieze with attic windows, cornice; balustrade on the east houses.
 if(!qa){P.block('cornice',f,u0,u1,top,ent,0,.08,{skip:['left','right']});P.block('cornice',f,u0,u1,ent,ent+.08,0,.14,{skip:['left','right']});
  for(let u=u0+.25;u<u1-.1;u+=.6)P.block('cornice',f,u,u+.18,ent-.12,ent,.08,.12,{skip:['top']});
  const att=[];for(let i=0;i<3;i++)att.push([[c(i)-.55,ent+.35],[c(i)+.55,ent+.35],[c(i)+.55,frieze-.2],[c(i)-.55,frieze-.2]]);P.poly('cornice',f,[[u0,ent+.08],[u1,ent+.08],[u1,frieze],[u0,frieze]],att,.04);
  for(const a of att){P.recess('cornice',new Face(f.at(0,0,.04),f.u,f.v),a[0][0],a[1][0],a[0][1],a[2][1],.2,'glass');for(let k=1;k<5;k++)P.block('iron',f,a[0][0]+(a[1][0]-a[0][0])*k/5-.02,a[0][0]+(a[1][0]-a[0][0])*k/5+.02,a[0][1],a[2][1],0,.05);}
  P.block('cornice',f,u0,u1,frieze,frieze+.25,0,.3,{skip:['left','right']});P.block('cornice',f,u0,u1,frieze+.25,cor,0,.55,{skip:['left','right']});
  if(variant==='east'||variant==='tall'){for(let u=u0+.15;u<u1-.1;u+=.32)P.cyl('cornice',.06,.06,.6,f.matrix(u,cor+.35,.3),6);P.block('cornice',f,u0,u1,cor+.62,cor+.75,.15,.45,{skip:['left','right']});}
  if(cor<H-.3)P.rect('brick',f,u0,u1,cor,H,-.2);}
 else{P.block('cornice',f,u0,u1,17-.6,17,0,.4,{skip:['left','right']});const s=new T.Shape([[-w/2,0],[w/2,0],[0,2.2]].map(p=>new T.Vector2(...p)));P.geo('brick',new T.ExtrudeGeometry(s,{depth:.3,bevelEnabled:false}),f.matrix((u0+u1)/2,17,-.3));
  P.block('marble',f,u0,u1,base-.2,base,0,.15);}
 return {cor,top};}
export function rowParts(data){const P=new Parts();const all=[...ROW.east.map(r=>[...r,'east']),...ROW.west.map(r=>[...r,'west'])];const fenceRuns=[];
 for(const [bin,n,variant,group] of all){const b=data.buildings.find(x=>x.bin===bin);if(!b)continue;const F=fronts(b);
  // Volume from the 3D model; walls along the street front are replaced by the facade.
  const m=model3d[bin];const front=F[0];
  if(m){const ps=pieces(m),W=walls(ps);for(const w of W){const onFront=F.some(fr=>{const d=(p)=>Math.abs((p[0]-fr.a[0])*fr.n[0]+(p[1]-fr.a[1])*fr.n[1]);return d(w.a)<1.5&&d(w.b)<1.5&&w.n[0]*fr.n[0]+w.n[1]*fr.n[1]>.9;});
    if(onFront)continue;P.rect('brick',w.face,0,w.len,w.y0,w.piece.z,0);}for(const p of ps)P.poly('roof',new Face([0,p.z,0],[1,0,0],[0,0,-1]),p.ring);}
  for(const fr of F){// Face looking at the park: u from viewer's left (east) to right (west).
   const f=new Face(v3(fr.a),[fr.b[0]-fr.a[0],0,-(fr.b[1]-fr.a[1])],[0,1,0]);const H=b.h||17,hw=fr.len/n;
   for(let k=0;k<n;k++){const r=house(P,f,k*hw,(k+1)*hw,H,variant,(k+(bin%2))%2===0);
    // Brick side above and between when the house front is lower than the volume.
    }
   // Front yard and the railing along the sidewalk with a double gate on each walk.
   fenceRuns.push({f,len:fr.len,n});}}
 for(const {f,len,n} of fenceRuns){const d=ROW.fenceSet;for(let u=.05;u<len;u+=.16)P.block('iron',f,u,u+.022,.15,1.25,d,d+.022,{skip:['top','bottom']});P.block('iron',f,0,len,1.15,1.21,d-.01,d+.035);P.block('iron',f,0,len,.12,.18,d-.01,d+.035);
  for(let k=0;k<=n;k++){const u=Math.min(len-.1,k*len/n);P.block('iron',f,u-.06,u+.06,0,1.45,d-.04,d+.08);P.sphere('iron',.08,f.matrix(u,1.5,d+.02),6,4);}
  P.rect('lawn',new Face(f.at(0,.02,0),f.u,f.n.map(x=>-x)),0,len,-d,0);}
 return P;}
export function buildRow(b,{campus}={}){const P=rowParts(campus.data);
 const brick=brickTextures({base:'#9a3b2b',mortar:'#c9b8a8',brick:[.2,.065],tileW:1.6,tileH:.78,vary:.12,seed:31}),grain=grainTextures({base:'#ebe8e1'});
 const std=(t,x={})=>new T.MeshStandardMaterial({map:t.map,normalMap:t.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.85,...x});
 const fan=document.createElement('canvas');fan.width=128;fan.height=64;{const g=fan.getContext('2d');g.fillStyle='#2b3034';g.fillRect(0,0,128,64);g.strokeStyle='#e8e4da';g.lineWidth=3;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(64,64);g.lineTo(64+Math.cos(Math.PI*i/8)*-60,64-Math.sin(Math.PI*i/8)*60);g.stroke();}}
 const ft=new T.CanvasTexture(fan);ft.colorSpace=T.SRGBColorSpace;
 const materials={brick:std(brick),marble:std(grain,{roughness:.55}),cornice:std(grain,{color:0xf2efe8,roughness:.6}),brownstone:new T.MeshStandardMaterial({color:0x6b4a3a,roughness:.9}),brown:new T.MeshStandardMaterial({color:0x7c5442,roughness:.85}),
  glass:new T.MeshStandardMaterial({color:0x252b30,roughness:.2,metalness:.4}),sash:new T.MeshStandardMaterial({color:0xf0ede6,roughness:.6}),door:new T.MeshStandardMaterial({color:0x1d2a24,roughness:.5}),fanlight:new T.MeshStandardMaterial({map:ft,roughness:.4}),
  shutter:new T.MeshStandardMaterial({color:0x244a33,roughness:.7}),iron:new T.MeshStandardMaterial({color:0x1b1d1e,roughness:.5,metalness:.6}),roof:new T.MeshStandardMaterial({color:0x5a5450,roughness:.95}),
  lawn:new T.MeshStandardMaterial({color:0x5f6e45,roughness:1,polygonOffset:true,polygonOffsetFactor:-2})};
 const g=P.build(materials);g.name='The Row';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
