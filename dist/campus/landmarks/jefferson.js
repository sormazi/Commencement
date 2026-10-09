import * as T from '../../vendor/three.module.js';
import {Parts,Face,brickTextures} from './kit.js?v=24';
import {pieces,walls} from './facade.js?v=24';
import {Frame,pointed,wall,pinnacle,spire} from './gothic.js?v=24';
import model3d from '../data/campus-3d.js?v=24';
// Jefferson Market Library (former Jefferson Market Courthouse), 425 Sixth Avenue at W 10th St (Frederick
// Clarke Withers and Calvert Vaux, 1874-77; LPC 1967). High Victorian Gothic in red brick banded with
// pale stone: tall pointed windows in two tiers, steep slate roofs with gabled dormers, and the clock
// tower at the Sixth Avenue and W 10th Street corner. Volume from the NYC 3D Building Model (BIN 1082668):
// the main block's roof to 28.4 m and the tower to 53.2 m. See RESEARCH/checklists/jefferson.md.
export const JEFFERSON={bin:1082668,tower:[-161.5,386.9],towerTop:53.2,eave:15.5,ridge:28.4};
const centroid=r=>r.reduce((s,p)=>[s[0]+p[0]/r.length,s[1]+p[1]/r.length],[0,0]);
export function jeffersonParts(b){const J=JEFFERSON,P=new Parts(),ps=pieces(model3d[b.bin]),main=ps.find(p=>p.z<40),tw=ps.find(p=>p.z>=40);
 // Main block: walls to the eave with two tiers of pointed windows per bay, stone bands, then a hipped
 // slate roof (eave ring drawn in toward the centre at the ridge height).
 const r=main.ring,c=centroid(r);
 for(let i=0;i<r.length;i++){const a=r[i],q=r[(i+1)%r.length],L=Math.hypot(q[0]-a[0],q[1]-a[1]);if(L<.6)continue;const f=new Face([a[0],0,-a[1]],[q[0]-a[0],0,-(q[1]-a[1])],[0,1,0]);
  // Skip walls that stand inside the tower.
  const m=[(a[0]+q[0])/2,(a[1]+q[1])/2];if(Math.hypot(m[0]-J.tower[0],m[1]-J.tower[1])<4.2)continue;
  const n=Math.max(0,Math.floor(L/3.4)),ops=[];for(let k=0;k<n;k++){const cu=(k+.5)*L/n;ops.push({hole:pointed(cu,1.3,1.4,5.2,{k:.8}),depth:.4},{hole:pointed(cu,1.3,7.4,11.6,{k:.8}),depth:.4,mullion:1});}
  wall(P,f,L,0,J.eave,ops,{mat:'brick'});for(const y of [1.2,6.6,12.6])P.block('band',f,0,L,y,y+.3,0,.08,{skip:['left','right']});P.block('band',f,0,L,J.eave-.4,J.eave,0,.3,{skip:['left','right']});
  // A gabled dormer over the middle of each long wall.
  if(L>9){const g=new Face(f.at(L/2-2.2,J.eave,.05),f.u,f.v);P.poly('brick',g,[[0,0],[4.4,0],[4.4,2.2],[2.2,5.4],[0,2.2]],[pointed(2.2,1.4,.6,2.6)]);P.rect('glass',g,1.5,2.9,.6,3.4,-.2);
   P.quad('slate',f.at(L/2-2.4,J.eave+2.2,.1),f.at(L/2,J.eave+5.6,.1),f.at(L/2,J.eave+5.6,-3),f.at(L/2-2.4,J.eave+2.2,-3),[f.u[0]*-1+0,1,f.u[2]*-1]);P.quad('slate',f.at(L/2+2.4,J.eave+2.2,.1),f.at(L/2,J.eave+5.6,.1),f.at(L/2,J.eave+5.6,-3),f.at(L/2+2.4,J.eave+2.2,-3),[f.u[0],1,f.u[2]]);}}
 const inset=r.map(p=>[c[0]+(p[0]-c[0])*.22,c[1]+(p[1]-c[1])*.22]);
 for(let i=0;i<r.length;i++){const a=r[i],q=r[(i+1)%r.length],ai=inset[i],qi=inset[(i+1)%r.length];P.quad('slate',[a[0],J.eave,-a[1]],[q[0],J.eave,-q[1]],[qi[0],J.ridge,-qi[1]],[ai[0],J.ridge,-ai[1]],[0,1,0]);}
 P.poly('slate',new Face([0,J.ridge,0],[1,0,0],[0,0,-1]),inset);
 // Tower (checked on Commons photographs, 2006 and 2022): a square base to the main eaves with pointed
 // windows and stone bands, then a round brick shaft banded every metre and a half in pale stone, a ring
 // balcony with an iron railing, the round clock stage with four dials, and a steep slate spire.
 const tc=tw?centroid(tw.ring):J.tower,F=new Frame(tc,29),s=3.4,sq=16;
 const sides=[[[-s,s],[-s,-s]],[[-s,-s],[s,-s]],[[s,-s],[s,s]],[[s,s],[-s,s]]];
 sides.forEach(([a,q],i)=>{const f=F.face(a,q),L=2*s;wall(P,f,L,0,sq,[{hole:pointed(L/2,1.2,4,8.4,{k:.8}),depth:.4},{hole:pointed(L/2,1.0,10.4,14.4,{k:.9}),depth:.35}],{mat:'brick'});
  for(const y of [3,9.6,15.2])P.block('band',f,0,L,y,y+.35,0,.12,{skip:['left','right']});P.block('band',f,-.2,L+.2,sq,sq+.5,0,.3);});
 for(const [u,v] of [[-s,-s],[-s,s],[s,-s],[s,s]])pinnacle(P,F,u,v,sq+.5,sq+2.1,{s:.9,h:2.4,name:'band'});
 const R=3.1,b0=sq+.5,b1=36;P.geo('brick',new T.CylinderGeometry(R,R,b1-b0,20,1,true),F.matrix(0,0,(b0+b1)/2));
 for(let y=b0+1.2;y<b1-.4;y+=1.5)P.geo('band',new T.CylinderGeometry(R+.06,R+.06,.32,20,1,true),F.matrix(0,0,y));
 P.geo('band',new T.CylinderGeometry(R+.9,R+.3,.45,24),F.matrix(0,0,b1));P.torus('iron',R+.85,.05,F.matrix(0,0,b1+1.05).multiply(new T.Matrix4().makeRotationX(Math.PI/2)));
 for(let k=0;k<24;k++){const a=k/24*Math.PI*2;P.geo('iron',new T.CylinderGeometry(.03,.03,1.05,4),F.matrix(Math.cos(a)*(R+.85),Math.sin(a)*(R+.85),b1+.75));}
 const cr=2.5,c0=b1+.2,c1=b1+6.2;P.geo('brick',new T.CylinderGeometry(cr,cr,c1-c0,16),F.matrix(0,0,(c0+c1)/2));
 sides.forEach(([a,q])=>{const f=F.face(a,q);P.geo('dial',new T.CircleGeometry(1.0,24),f.matrix(s,c0+3.1,cr-s+.12));P.torus('band',1.05,.08,f.matrix(s,c0+3.1,cr-s+.12));});
 P.geo('band',new T.CylinderGeometry(cr+.35,cr+.35,.4,16),F.matrix(0,0,c1));spire(P,F,0,0,c1+.2,J.towerTop-c1-1.6,{r:cr+.2,name:'slate',lucarnes:true});
 return {P};}
export function buildJefferson(b){const {P}=jeffersonParts(b);const br=brickTextures({base:'#8f4a39',mortar:'#c9b9a3',vary:.12,seed:57});
 const m={brick:new T.MeshStandardMaterial({map:br.map,normalMap:br.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.88}),band:new T.MeshStandardMaterial({color:0xd8cfba,roughness:.8}),
  slate:new T.MeshStandardMaterial({color:0x45494d,roughness:.75}),glass:new T.MeshStandardMaterial({color:0x2a2f34,roughness:.3,metalness:.3}),louvre:new T.MeshStandardMaterial({color:0x2b2622,roughness:.8}),iron:new T.MeshStandardMaterial({color:0x22252a,roughness:.6,metalness:.4}),
  dial:new T.MeshStandardMaterial({color:0xe8e4d8,roughness:.6}),metal:new T.MeshStandardMaterial({color:0x5f8f7a,roughness:.6,metalness:.3}),trim:new T.MeshStandardMaterial({color:0xd8cfba,roughness:.8}),stone:new T.MeshStandardMaterial({color:0xd8cfba,roughness:.8})};
 const g=P.build(m);g.name='Jefferson Market Library';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(m);return g;}
