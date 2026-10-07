import * as T from '../../vendor/three.module.js';
import {Parts,Face,stack,out,up,ovolo,cymaRecta,planRun,stoneTextures,brickTextures} from './kit.js?v=18';
import model3d from '../data/campus-3d.js?v=18';
// Silver Center for Arts and Science (NYU Main Building), 100 Washington Square East
// (Alfred Zucker, 1892–95). A limestone base of three storeys (rusticated ground storey, two
// smooth storeys with framed windows, dentilled cornice) under a buff-grey brick shaft with stone
// sills and quoins and a crowning cornice. A loggia of four Tuscan columns opens at the Washington Place
// (south) end of the Washington Square East front, beside the corner pier (Street View, May 2026;
// former Grey Art Gallery entrance); NYU banners hang from
// angled poles. Overall volume comes from the NYC 3D Building Model (setbacks, light courts);
// the three street fronts get full facade geometry. Built directly in world coordinates.
export const SILVER={bin:1008820,ground:5.4,entab:6.6,base:14.0,cornice:15.0,top:46.9,pitch:4.15,colonnade:{bays:3,columns:4,depth:3.0},
 // Street fronts as [from, to] footprint vertices (map metres), listed with the street they face.
 fronts:[{street:'Washington Sq E',a:[129.29,-65.18],b:[97.74,-114.21],colonnade:'end',entrance:.42,flags:[.3,.62]},
  {street:'Washington Pl',a:[97.74,-114.21],b:[124.8,-131.62],entrance:.2,flags:[.5]},
  {street:'Waverly Pl',a:[157.39,-83.26],b:[129.29,-65.18],flags:[]}]};
const v3=(p,y=0)=>[p[0],y,-p[1]];
export function silverParts(b){FOOT=b.rings[0];const S=SILVER,P=new Parts(),m=model3d[b.bin];
 // ---- massing from the 3D model, in brick ----
 const rings=m?m.roofs:[b.rings[0].flatMap(p=>[p[0],p[1],b.h])];
 for(const r of rings){const k=r.length/3;let A=0;for(let i=0;i<k;i++){const j=(i+1)%k;A+=r[3*i]*r[3*j+1]-r[3*j]*r[3*i+1];}if(Math.abs(A)<.4)continue;
  for(let s=0;s<k;s++){const i=A>0?s:k-1-s,j=A>0?(s+1)%k:(k-2-s+k)%k;const a=[r[3*i],r[3*i+1]],c=[r[3*j],r[3*j+1]],za=r[3*i+2],zb=r[3*j+2];const dx=c[0]-a[0],dn=c[1]-a[1];
   // Walls along a street front are replaced by the facade up to its parapet.
   const y0=S.fronts.some(F=>nearLine(a,F)&&nearLine(c,F))?S.top+.6:0;if(Math.max(za,zb)<=y0)continue;
   P.quad('brick',v3(a,y0),v3(c,y0),v3(c,Math.max(zb,y0)),v3(a,Math.max(za,y0)),[dn,0,dx]);}
  const pts=[];for(let i=0;i<k;i++)pts.push([r[3*i],r[3*i+1]]);P.poly('roof',new Face([0,r[2],0],[1,0,0],[0,0,-1]),pts);}
 for(const F of S.fronts)front(P,F);
 return P;}

function front(P,F){const S=SILVER,dx=F.b[0]-F.a[0],dn=F.b[1]-F.a[1],L=Math.hypot(dx,dn);
 // Face with u along the front (a → b as seen from the street), v up, n toward the street.
 // The ring is clockwise in map space for these edges, so flip if the normal points inward.
 let f=new Face(v3(F.a),[dx,0,-dn],[0,1,0]);const mid=[(F.a[0]+F.b[0])/2,(F.a[1]+F.b[1])/2],probe=[mid[0]+f.n[0]*3,-(f.n[2])*3+mid[1]];
 if(insideFoot(probe))f=new Face(v3(F.b),[-dx,0,dn],[0,1,0]);
 const nb=Math.max(3,Math.round(L/S.pitch)),p=L/nb,pier=.95,bayW=p-pier,o=.06;
 const bays=[...Array(nb).keys()],cu=i=>(i+.5)*p;const colSpan=F.colonnade==='start'?[1.7,12.9]:[L-12.9,L-1.7],isCol=i=>F.colonnade&&(i+1)*p>colSpan[0]+.2&&i*p<colSpan[1]-.2,entrance=F.entrance!=null?Math.round(F.entrance*nb):-1;
 // Ground storey: rusticated limestone with large openings (display windows), granite plinth.
 const holes=[];for(const i of bays){if(isCol(i))continue;const w=i===entrance?2.2:bayW-.5;holes.push([[cu(i)-w/2,.6],[cu(i)+w/2,.6],[cu(i)+w/2,4.7],[cu(i)-w/2,4.7]]);}
 if(F.colonnade){const [c0,c1]=colSpan;holes.push([[c0,.6],[c1,.6],[c1,S.ground-.02],[c0,S.ground-.02]]);}
 P.poly('lime',f,[[0,.6],[L,.6],[L,S.ground],[0,S.ground]],holes,o);
 for(const h of holes){const [u0,v0]=h[0],[u1,v1]=h[2];const col=F.colonnade&&u0>=colSpan[0]-.01&&u1<=colSpan[1]+.01;P.recess('lime',new Face(f.at(0,0,o),f.u,f.v),u0,u1,v0,v1,col?S.colonnade.depth:.45,col?'loggia':'display');
  if(!col){P.block('metal',f,u0,u1,3.85,3.95,o-.45,o-.38);P.block('metal',f,(u0+u1)/2-.04,(u0+u1)/2+.04,v0,3.9,o-.45,o-.38);}}
 // Horizontal rustication grooves on the ground storey piers.
 for(let v=1.05;v<S.ground-.2;v+=.45)P.block('lime',f,0,L,v,v+.03,o-.02,o+.005,{skip:['left','right']});
 P.block('granite',f,0,L,0,.6,0,o+.1);
 // Entrance: dark doors, flanking pilasters and a projecting entablature (balcony) above.
 if(entrance>=0){const c=cu(entrance);P.rect('door',f,c-1.1,c+1.1,.6,3.9,o-.44);P.panel('signSilver',f,c-1.0,c+1.0,4.05,4.6,o-.4);
  for(const s of [-1,1]){P.block('lime',f,c+s*1.35-.3,c+s*1.35+.3,0,S.ground,o,o+.35);}P.block('lime',f,c-1.9,c+1.9,S.ground-.55,S.ground,o,o+.6);
  for(const s of [-1,1])P.cyl('metal',.12,.16,.55,f.matrix(c+s*1.85,3.2,o+.75),8);}
 // Entablature over the ground storey.
 P.rect('lime',f,0,L,S.ground,S.entab,o);P.sweep('lime',stack(out(.06),up(.5),out(.06),up(.2),ovolo(.12,.14),out(.12),up(.2),cymaRecta(.1,.1),[[-.46,0]]),planRunFace(f,0,L,S.ground+.0,o),{caps:true});
 // Second and third storeys: smooth limestone, framed windows with sills; hoods on the second floor.
 const w2=[7.3,10.0],w3=[10.9,13.3],ww=1.75,holes2=[];for(const i of bays)for(const w of [w2,w3])holes2.push([[cu(i)-ww/2,w[0]],[cu(i)+ww/2,w[0]],[cu(i)+ww/2,w[1]],[cu(i)-ww/2,w[1]]]);
 P.poly('lime',f,[[0,S.entab],[L,S.entab],[L,S.base],[0,S.base]],holes2,o);
 for(const i of bays)for(const [k,w] of [w2,w3].entries()){const u0=cu(i)-ww/2,u1=cu(i)+ww/2;P.recess('lime',new Face(f.at(0,0,o),f.u,f.v),u0,u1,w[0],w[1],.25,'window');
  frame(P,f,u0,u1,w[0],w[1],o,.18,.09);P.block('lime',f,u0-.25,u1+.25,w[0]-.16,w[0],o,o+.16);if(k===0)P.block('lime',f,u0-.32,u1+.32,w[1]+.18,w[1]+.4,o,o+.22);}
 // Main cornice of the base with dentils.
 P.rect('lime',f,0,L,S.base,S.cornice,o);P.sweep('lime',stack(ovolo(.08,.1),up(.18),out(.1),up(.06),out(.5),up(.22),out(.05),up(.04),cymaRecta(.14,.16),[[-.87,0]]),planRunFace(f,0,L,S.base+.15,o),{caps:true});
 for(let u=.12;u<L-.08;u+=.2)P.block('lime',f,u,u+.11,S.base+.28,S.base+.46,o,o+.16,{skip:['top']});
 // Brick shaft: windows in every bay with stone sills and splayed lintels; stone quoins at corners.
 const rows=8,fh=(S.top-1.4-S.cornice)/rows,holes3=[];for(const i of bays)for(let r=0;r<rows;r++){const y=S.cornice+.9+r*fh;holes3.push([[cu(i)-.8,y],[cu(i)+.8,y],[cu(i)+.8,y+fh-1.35],[cu(i)-.8,y+fh-1.35]]);}
 P.poly('brick',f,[[0,S.cornice+.42],[L,S.cornice+.42],[L,S.top-1.4],[0,S.top-1.4]],holes3,o);
 for(const h of holes3){const [u0,v0]=h[0],[u1,v1]=h[2];P.recess('brick',new Face(f.at(0,0,o),f.u,f.v),u0,u1,v0,v1,.22,'window');P.block('lime',f,u0-.12,u1+.12,v0-.14,v0,o,o+.1);P.block('lime',f,u0-.1,u1+.1,v1,v1+.3,o,o+.05);
  P.block('metal',f,u0,u1,v0+(v1-v0)*.55,v0+(v1-v0)*.55+.06,o-.22,o-.18);}
 for(const u0 of [0,L-.9])for(let y=S.cornice+.5,k=0;y<S.top-1.6;y+=.62,k++)P.block('lime',f,k%2?u0+(u0?.3:0):u0,k%2?u0+(u0?.9:.6):u0+.9,y,y+.56,o,o+.06);
 // Crowning cornice with modillions and a plain parapet.
 P.sweep('lime',stack(out(.06),up(.3),ovolo(.12,.14),up(.2),out(.75),up(.3),cymaRecta(.12,.14),[[-1.05,0]]),planRunFace(f,0,L,S.top-1.4,o),{caps:true});
 for(let u=.3;u<L-.2;u+=.55)P.block('lime',f,u,u+.16,S.top-1.0,S.top-.75,o+.2,o+.85,{skip:['top']});
 P.block('lime',f,0,L,S.top-.45,S.top+.6,-.1,o+.05,{skip:['bottom']});
 // Loggia: four Tuscan columns carrying the entablature, storefront glass behind.
 if(F.colonnade){const [c0,c1]=colSpan,n=S.colonnade.columns,d=S.colonnade.depth;
  P.rect('loggiaGlass',f,c0,c1,.6,S.ground-.3,o-d+.05);P.rect('lime',new Face(f.at(0,S.ground-.02,0),f.u,f.n),c0,c1,o-d,o);
  P.rect('paving',new Face(f.at(0,.62,0),f.u,f.n.map(x=>-x)),c0,c1,-o,d-o);
  for(let k=0;k<n;k++){const u=c0+(c1-c0)*(k+.5)/n;column(P,f,u,.6,S.ground-.02,o+.55);}}
 // NYU banners on angled poles (plain violet; the university's emblem is deliberately not drawn).
 for(const t of F.flags){const u=t*L,a=f.at(u,7.0,o+.1),dir=[f.n[0]*.71,.71,f.n[2]*.71],len=3.4,tip=[a[0]+dir[0]*len,a[1]+dir[1]*len,a[2]+dir[2]*len];
  const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...dir).normalize());P.cyl('metal',.035,.035,len,new T.Matrix4().compose(new T.Vector3((a[0]+tip[0])/2,(a[1]+tip[1])/2,(a[2]+tip[2])/2),q,new T.Vector3(1,1,1)),6);
  P.sphere('gilt',.07,new T.Matrix4().makeTranslation(...tip),6,4);
  // Banner hung from the pole: top edge just under the pole, perpendicular to the wall.
  const bf=new Face(f.at(u,7.0+len*.71*.35,o+.1+len*.71*.35),f.n,f.v);P.panel('flag',bf,0,len*.71*.62,-2.1,-.05,0);}
}
function nearLine(p,F){const dx=F.b[0]-F.a[0],dn=F.b[1]-F.a[1],L2=dx*dx+dn*dn,t=((p[0]-F.a[0])*dx+(p[1]-F.a[1])*dn)/L2;if(t<-.05||t>1.05)return false;
 const x=F.a[0]+dx*t,n=F.a[1]+dn*t;return Math.hypot(p[0]-x,p[1]-n)<1.5;}
let FOOT=null;function insideFoot(p){if(!FOOT)return false;let c=false;for(let i=0,j=FOOT.length-1;i<FOOT.length;j=i++){const a=FOOT[i],b=FOOT[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
// Horizontal moulding run along a face from u0 to u1 at height y, offset d from the face.
function planRunFace(f,u0,u1,y,d){return [{p:f.at(u0,y,d),o:f.n,u:[0,1,0]},{p:f.at(u1,y,d),o:f.n,u:[0,1,0]}];}
function frame(P,f,u0,u1,v0,v1,o,w,dd){P.block('lime',f,u0-w,u0,v0,v1+w,o,o+dd);P.block('lime',f,u1,u1+w,v0,v1+w,o,o+dd);P.block('lime',f,u0,u1,v1,v1+w,o,o+dd);}
// Tuscan column: base (plinth + torus), shaft with entasis, capital (echinus + abacus).
function column(P,f,u,v0,v1,d){const H=v1-v0,r=.42,m=f.matrix(u,v0,d);
 const prof=[[0,0],[r*1.32,0],[r*1.32,.2],[r*1.25,.24],[r*1.22,.32],[r*1.12,.4],[r,.42]];for(let k=1;k<=10;k++){const t=k/10;prof.push([r*(1-.14*Math.max(0,t-.33)/.67),.42+t*(H-1.0)]);}
 const top=.42+H-1.0;prof.push([r*.92,top+.08],[r*1.18,top+.28],[r*1.22,top+.36],[r*1.3,top+.38],[r*1.3,H],[0,H]);P.lathe('lime',prof,m,20);
 P.block('lime',f,u-r*1.4,u+r*1.4,H+v0-.22,H+v0,d-r*1.4,d+r*1.4);}
export function buildSilver(b){FOOT=b.rings[0];const P=silverParts(b);
 const lime=stoneTextures({base:'#d8d3c6',vary:.03,course:.45,courses:6,block:1.45,tileW:4.35,joint:.006,seed:11}),brick=brickTextures({base:'#c4bdae',mortar:'#d4cfc4',vary:.07});
 const std=(t,x={})=>new T.MeshStandardMaterial({map:t.map,normalMap:t.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.8,...x});
 const sign=document.createElement('canvas');sign.width=512;sign.height=128;{const g=sign.getContext('2d');g.fillStyle='#2a2522';g.fillRect(0,0,512,128);g.fillStyle='#c9a65a';g.font='600 46px "Times New Roman", serif';g.textAlign='center';g.fillText('SILVER CENTER',256,62);g.font='600 26px "Times New Roman", serif';g.fillText('100 WASHINGTON SQUARE EAST',256,104);}
 const signTex=new T.CanvasTexture(sign);signTex.colorSpace=T.SRGBColorSpace;
 const materials={lime:std(lime,{roughness:.78}),brick:std(brick,{roughness:.9}),granite:new T.MeshStandardMaterial({color:0x8d8a86,roughness:.6}),roof:new T.MeshStandardMaterial({color:0x6e6a64,roughness:.95}),
  window:new T.MeshStandardMaterial({color:0x2f3438,roughness:.2,metalness:.5}),display:new T.MeshStandardMaterial({color:0x4b2a5e,roughness:.3,metalness:.2,emissive:0x2a0f3a}),
  loggia:new T.MeshStandardMaterial({color:0xcfc9bb,roughness:.85}),loggiaGlass:new T.MeshStandardMaterial({color:0x3a3240,roughness:.2,metalness:.4,emissive:0x1c0f26}),
  door:new T.MeshStandardMaterial({color:0x1e1a17,roughness:.5,metalness:.3}),metal:new T.MeshStandardMaterial({color:0x26282a,roughness:.5,metalness:.6}),
  gilt:new T.MeshStandardMaterial({color:0xb08d4a,roughness:.35,metalness:.8}),paving:new T.MeshStandardMaterial({color:0xb8b2a6,roughness:.9}),
  flag:new T.MeshStandardMaterial({color:0x57068c,roughness:.85,side:T.DoubleSide}),signSilver:new T.MeshStandardMaterial({map:signTex,roughness:.5,metalness:.3})};
 const g=P.build(materials);g.name='Silver Center';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
