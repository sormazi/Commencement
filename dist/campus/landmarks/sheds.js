import * as T from '../../vendor/three.module.js';
import {Parts,Face} from './kit.js?v=18';
import {v3} from './facade.js?v=18';
// Sidewalk sheds (and construction fences) where Google Street View showed them, with the capture
// date of each observation, since sheds come and go. Each shed runs along a building line given in
// map metres from a to b with the street on the right-hand side. Building lines for the W 4th St
// site are taken 10.5 m off the street centrelines (estimate; no footprint in the data).
// NYU Public Safety booths: none were visible at the twelve campus corners surveyed (captures Apr–May
// 2026), so none are placed; see the inventory.
export const SHEDS=[
 {id:'washington-pl-south',a:[141.1,-165.8],b:[107.2,-144.5],depth:2.6,height:3.3,fence:false,
  note:'South side of Washington Pl from Washington Sq E to Greene St, along the Academic Resource Center (18 Washington Pl) and Pless Annex; Citi Bike dock along the curb.',
  seen:'Google Street View, Greene St at Washington Pl (40.72979, -73.99531), heading 300, capture Apr 2026'},
 {id:'w4th-greene-sw',a:[95.7,-230.9],b:[70.5,-214.7],depth:2.6,height:3.6,fence:true,
  note:'South-west corner of W 4th St and Greene St: scaffold shed over a green plywood construction fence (site not in the 2014 3D model or the footprint data). Extent along W 4th estimated at 30 m.',
  seen:'Google Street View, W 4th St at Greene St (40.72917, -73.99577), heading 210, capture Apr 2026'},
 {id:'w4th-greene-sw-greene',a:[87.6,-243.5],b:[95.7,-230.9],depth:2.4,height:3.6,fence:true,
  note:'Return of the same shed along the west side of Greene St; extent estimated.',seen:'same as above'}];
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
export function buildSheds(){const P=shedParts();const materials={steel:new T.MeshStandardMaterial({color:0x5a5f62,roughness:.6,metalness:.5}),ply:new T.MeshStandardMaterial({color:0x2f5a3c,roughness:.9}),
 green:new T.MeshStandardMaterial({color:0x2e5c3b,roughness:.9}),lamp:new T.MeshStandardMaterial({color:0xfff3d0,emissive:0xffe9b0,emissiveIntensity:.8})};
 const g=P.build(materials);g.name='Sidewalk sheds';g.position.y=.15;g.userData.materials=Object.values(materials);g.userData.tris=P.tris;return g;}
