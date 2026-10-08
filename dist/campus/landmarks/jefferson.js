import * as T from '../../vendor/three.module.js';
import {Parts,Face,brickTextures} from './kit.js?v=22';
import {pieces,walls} from './facade.js?v=22';
import {Frame,pointed,wall,pinnacle,spire} from './gothic.js?v=22';
import model3d from '../data/campus-3d.js?v=22';
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
 // Tower: square shaft to 38 m with corner shafts, clock faces, an open belfry stage, then a tall
 // octagonal spirelet with lucarnes and four corner pinnacles.
 const tc=tw?centroid(tw.ring):J.tower,F=new Frame(tc,29),s=3.4;
 const sides=[[[-s,s],[-s,-s]],[[-s,-s],[s,-s]],[[s,-s],[s,s]],[[s,s],[-s,s]]];
 sides.forEach(([a,q],i)=>{const f=F.face(a,q),L=2*s;wall(P,f,L,0,38,[{hole:pointed(L/2,1.2,4,8.4,{k:.8}),depth:.4},{hole:pointed(L/2,1.0,17,21.6,{k:.9}),depth:.35},{hole:pointed(L/2-.8,.8,31.6,36,{k:.9}),depth:.6,glass:'louvre'},{hole:pointed(L/2+.8,.8,31.6,36,{k:.9}),depth:.6,glass:'louvre'}],{mat:'brick'});
  for(const y of [3,10,16,24,30.8])P.block('band',f,0,L,y,y+.35,0,.12,{skip:['left','right']});P.geo('dial',new T.CircleGeometry(1.25,24),f.matrix(L/2,27.2,.08));P.torus('band',1.3,.1,f.matrix(L/2,27.2,.08));
  P.block('band',f,-.3,L+.3,38,38.6,0,.4);});
 for(const [u,v] of [[-s,-s],[-s,s],[s,-s],[s,s]])pinnacle(P,F,u,v,38.6,40.4,{s:1.0,h:3.0,name:'band'});
 P.geo('brick',new T.CylinderGeometry(2.6,2.9,4.4,8),F.matrix(0,0,40.8));spire(P,F,0,0,43.0,J.towerTop-43.0-1.4,{r:2.6,name:'slate',lucarnes:true});
 return {P};}
export function buildJefferson(b){const {P}=jeffersonParts(b);const br=brickTextures({base:'#8f4a39',mortar:'#c9b9a3',vary:.12,seed:57});
 const m={brick:new T.MeshStandardMaterial({map:br.map,normalMap:br.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.88}),band:new T.MeshStandardMaterial({color:0xd8cfba,roughness:.8}),
  slate:new T.MeshStandardMaterial({color:0x45494d,roughness:.75}),glass:new T.MeshStandardMaterial({color:0x2a2f34,roughness:.3,metalness:.3}),louvre:new T.MeshStandardMaterial({color:0x2b2622,roughness:.8}),
  dial:new T.MeshStandardMaterial({color:0xe8e4d8,roughness:.6}),metal:new T.MeshStandardMaterial({color:0x3d3f40,roughness:.5,metalness:.6}),trim:new T.MeshStandardMaterial({color:0xd8cfba,roughness:.8}),stone:new T.MeshStandardMaterial({color:0xd8cfba,roughness:.8})};
 const g=P.build(m);g.name='Jefferson Market Library';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(m);return g;}
