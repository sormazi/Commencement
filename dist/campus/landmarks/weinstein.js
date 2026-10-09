import * as T from '../../vendor/three.module.js';
import {Parts,Face,brickTextures} from './kit.js?v=24';
import {pieces,walls,roofs,punched,facing,v3} from './facade.js?v=24';
import model3d from '../data/campus-3d.js?v=24';
// Weinstein Hall, 5–11 University Place (NYU residence hall, 1962). Street-visible parts only, as
// observed on Google Street View (Apr 2026 captures on University Pl at Waverly Pl, mid-block and
// at E 8th St; looked at, not saved): a nine-storey slab of orange-red brick with a regular grid
// of single windows (dark frames over a grey louvre panel), a ground storey of light concrete
// piers with storefront glass and dark security grilles, three segmental concrete canopies over
// the residence entrance near the E 8th St end, and an NYU banner at the corner. The "East" and
// "West towers" read from University Pl and Waverly Pl as one continuous slab; they rise only a
// storey above the main roof (3D model 32.6 m and 34.6 m against 29.8 m).
export const WEINSTEIN={bin:1080105,ground:4.2,floor:3.05,canopies:3};
export function weinsteinParts(b){const Wn=WEINSTEIN,P=new Parts(),m=model3d[b.bin];const ps=pieces(m),W=walls(ps);
 const spec={wall:'brick',glass:'glass',frames:'frame',trim:'concrete',pitch:3.05,floor:Wn.floor,win:[1.35,1.95],pair:0,reveal:.16,sill:0,louvre:'louvre',surround:0,parapet:.9,margin:.4};
 for(const w of W){const z=w.piece.z,street=w.y0<1&&z>20;let y=w.y0;
  if(street){// Ground storey: concrete piers, storefront glass, fascia band.
   const n=Math.max(1,Math.round(w.len/3.05)),p=w.len/n;for(let i=0;i<=n;i++){const u=i*p;P.block('concrete',w.face,Math.max(0,u-.32),Math.min(w.len,u+.32),0,Wn.ground,-.5,.04,{skip:['top','bottom']});}
   P.rect('glassClear',w.face,0,w.len,0,Wn.ground-.4,-.5);P.rect('concrete',w.face,0,w.len,Wn.ground-.4,Wn.ground,-.5);P.block('concrete',w.face,0,w.len,Wn.ground-.05,Wn.ground+.35,0,.12,{skip:['left','right']});
   for(let i=0;i<n;i++){const c=(i+.5)*p;P.block('frame',w.face,c-.03,c+.03,0,Wn.ground-.4,-.5,-.44);}P.block('frame',w.face,0,w.len,2.7,2.75,-.5,-.44);
   P.rect('concrete',new Face(w.face.at(0,Wn.ground-.4,0),w.face.u,w.face.n),0,w.len,-.5,0);y=Wn.ground+.35;}
  if(z>20)punched(P,w,y,z,{...spec,first:street?.55:(y<1?Wn.ground+.9:.55)});else P.rect('brick',w.face,0,w.len,w.y0,z,0);
  // Louvre panel under every window: drawn as a band inside the reveal (grey).
  P.block('concrete',w.face,0,w.len,z-.25,z,0,.08,{skip:['left','right']});}
 roofs(P,ps,'roof');
 // The University Place front: the longest west-facing wall of the main slab.
 const front=W.filter(w=>facing(w)==='w'&&w.y0<1&&w.piece.z>20).sort((a,b)=>b.len-a.len)[0];
 if(front){const f=front.face,L=front.len,north=f.u[2]<0?L:0,dir=north?-1:1;// u runs toward north if the face's u has -z (north) component
  for(let k=0;k<Wn.canopies;k++){const c=north+dir*(6.2+k*3.6);
   // Segmental canopy: a shallow barrel section, chord across the bay, projecting 2.4 m.
   const arc=[];for(let t=0;t<=12;t++){const x=-1.7+3.4*t/12;arc.push([x,.38*(1-(x/1.7)**2)]);}const sh=new T.Shape([...arc,...arc.slice().reverse().map(([x,y])=>[x,y+.22])].map(p=>new T.Vector2(...p)));
   P.geo('concrete',new T.ExtrudeGeometry(sh,{depth:2.4,bevelEnabled:false}),f.matrix(c,3.55,0));
P.block('grille',f,c-1.4,c+1.4,0,3.5,-.45,-.4);}
  // NYU banner on a short pole at the corner, second floor (plain violet).
  const cu=north?L-1.2:1.2,a=f.at(cu,6.4,.1);P.cyl('frame',.04,.04,2.6,new T.Matrix4().makeTranslation(a[0]+f.n[0]*1.2,a[1]+.9,a[2]+f.n[2]*1.2).multiply(new T.Matrix4().makeRotationFromEuler(new T.Euler(0,0,0))),6);
  P.panel('flag',new Face(f.at(cu,6.4,.4),f.n,f.v),0,2.2,-1.6,.6,0);}
 return {P,front};}
export function buildWeinstein(b){const {P}=weinsteinParts(b);
 const brick=brickTextures({base:'#ad5a3c',mortar:'#c7b7a6',vary:.1,seed:41});
 const materials={brick:new T.MeshStandardMaterial({map:brick.map,normalMap:brick.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.88}),concrete:new T.MeshStandardMaterial({color:0xc9c6bf,roughness:.85}),
  concreteDS:new T.MeshStandardMaterial({color:0xc9c6bf,roughness:.85,side:T.DoubleSide}),glass:new T.MeshStandardMaterial({color:0x3a4650,roughness:.2,metalness:.5}),
  glassClear:new T.MeshStandardMaterial({color:0x7f949c,roughness:.1,metalness:.3,transparent:true,opacity:.45,depthWrite:false}),frame:new T.MeshStandardMaterial({color:0x6b6e70,roughness:.5,metalness:.5}),louvre:new T.MeshStandardMaterial({color:0x8d9093,roughness:.6,metalness:.4}),
  grille:new T.MeshStandardMaterial({color:0x2a2c2e,roughness:.6,metalness:.5}),roof:new T.MeshStandardMaterial({color:0x6d675f,roughness:.95}),flag:new T.MeshStandardMaterial({color:0x57068c,roughness:.85,side:T.DoubleSide})};
 const g=P.build(materials);for(const m of g.children)if(m.name==='glassClear'){m.castShadow=false;m.renderOrder=2;}
 g.name='Weinstein Hall';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
