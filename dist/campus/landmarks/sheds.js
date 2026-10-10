import * as T from '../../vendor/three.module.js';
import {Parts,Face} from './kit.js?v=24';
import {v3} from './facade.js?v=24';
// Sidewalk sheds (and construction fences) where Google Street View showed them, with the capture
// date of each observation, since sheds come and go. Each shed runs along a building line given in
// map metres from a to b with the street on the right-hand side. The W 4th St site has no footprint in
// the data, so its building line is the Kaufman Management Center's front extended east.
// NYU Public Safety booths: none were visible at the twelve campus corners surveyed (captures Apr–May
// 2026), so none are placed; see the inventory.
export const SHEDS=[
 {id:'washington-pl-south',a:[141.1,-165.8],b:[107.2,-144.5],depth:2.6,height:3.3,fence:false,
  note:'South side of Washington Pl from Washington Sq E to Greene St, along the Academic Resource Center (18 Washington Pl) and Pless Annex; Citi Bike dock along the curb.',
  seen:'Google Street View, Greene St at Washington Pl (40.72979, -73.99531), heading 300, capture Apr 2026'}];

// Gould Plaza gate (W 4th St, between the Kaufman Management Center and Mercer St). The construction shed
// that stood here in the April 2026 captures is gone (Avi, 9 Oct 2026) and the plaza has a new gate. This is a
// placeholder, a plain black steel gate on the old building line, until Avi's photos arrive in
// RESEARCH/my-photos/stern/; then it is modelled from them.
export const GOULD_GATE={id:'gould-plaza-gate-placeholder',a:[115.0,-242.4],b:[103.0,-234.6],height:2.4,status:'placeholder'};
export function gateParts(g=GOULD_GATE,P=new Parts()){const dx=g.b[0]-g.a[0],dn=g.b[1]-g.a[1],L=Math.hypot(dx,dn),f=new Face(v3(g.a),[dx,0,-dn],[0,1,0]),h=g.height;
 for(const u of [0,L/2,L])P.block('gate',f,u-.1,u+.1,0,h+.2,.2,.4);P.block('gate',f,0,L,h-.05,h,.27,.33);P.block('gate',f,0,L,.12,.17,.27,.33);
 for(let u=.15;u<L;u+=.15)P.block('gate',f,u-.012,u+.012,.12,h,.288,.312);return P;}
export function shedParts(list=SHEDS){const P=new Parts();
 for(const s of list){const dx=s.b[0]-s.a[0],dn=s.b[1]-s.a[1],L=Math.hypot(dx,dn);
  // Face along the building line, normal pointing to the street (right of a → b in map space).
  const f=new Face(v3(s.a),[dx,0,-dn],[0,1,0]),d0=.3,d1=d0+s.depth,h=s.height;
  // Posts on both lines every 2.4 m, the deck with a plywood fascia, cross-bracing on the curb side.
  for(let u=0;u<=L+.01;u+=Math.min(2.4,L)){for(const d of [d0+.1,d1-.1])P.block('steel',f,u-.06,u+.06,0,h-.35,d-.06,d+.06,{skip:['top','bottom']});}
  P.block('ply',f,0,L,h-.35,h,d0,d1);P.block('green',f,0,L,h,h+.9,d1-.03,d1,{skip:['top','bottom']});
  for(let u=0;u+2.4<=L;u+=2.4){const a=f.at(u,0,d1-.1),b=f.at(u+2.4,h-.4,d1-.1),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize());
   P.cyl('steel',.03,.03,Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),new T.Matrix4().compose(new T.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),q,new T.Vector3(1,1,1)),5);}
  // Light fixtures under the deck.
  for(let u=1.2;u<L;u+=4.8)P.block('lamp',f,u-.3,u+.3,h-.42,h-.37,(d0+d1)/2-.08,(d0+d1)/2+.08);
  if(s.fence)P.block('green',f,0,L,0,2.5,d0-.05,d0+.02,{skip:['top','bottom']});}
 return P;}
export function buildSheds(){const P=shedParts();gateParts(GOULD_GATE,P);const materials={gate:new T.MeshStandardMaterial({color:0x17191b,roughness:.5,metalness:.6}),steel:new T.MeshStandardMaterial({color:0x5a5f62,roughness:.6,metalness:.5}),ply:new T.MeshStandardMaterial({color:0x2f5a3c,roughness:.9}),
 green:new T.MeshStandardMaterial({color:0x2e5c3b,roughness:.9}),lamp:new T.MeshStandardMaterial({color:0xfff3d0,emissive:0xffe9b0,emissiveIntensity:.8})};
 const g=P.build(materials);g.name='Sidewalk sheds';g.position.y=.15;g.userData.materials=Object.values(materials);g.userData.tris=P.tris;return g;}
