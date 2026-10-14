import * as T from '../vendor/three.module.js';
// Park furniture (Step 4B second pass, park first; 13 Oct 2026): benches, the granite benches round the
// fountain plaza, litter baskets and drinking fountains, at their OpenStreetMap positions (Washington Square
// Park is mapped bench by bench: 394 wooden benches with backs, 8 granite benches without, 55 litter baskets,
// 7 drinking fountains). What they look like follows Street View user photospheres, looked at and not saved:
// - Wooden benches (Jan 2018, north edge of the fountain plaza; Jul 2017, the paths): pale weathered wooden
//   slats for the seat and back on black cast-iron end frames with armrests, about 1.9 m long, set along the
//   edges of the paths and the plaza with their backs to the lawns and planted beds, facing the walk.
// - Granite benches (Jan 2018): long, low, backless blocks of dark grey granite on short plinths, on the
//   inner edge of the plaza round the fountain.
// - Litter baskets (Jan 2018): round black cans, ribbed, on a flared foot.
// - Drinking fountains (Jul 2017, by the north-east playground): dark cast-iron pedestals with a bowl on top
//   and a low step bowl at the side.
// Orientation: OSM gives a point per bench, not a direction. Each bench is turned to run along the nearest
// footway (or plaza edge) and to face it; benches in a row (neighbours within 3.5 m along the same line)
// share the row's direction. Every bench is a seat that people can sit on: seats() lists them.

const LEN=1.9,SEAT_H=.45,SEAT_D=.5;
// Nearest point on any walkable path (footways, plazas' outlines, pedestrian streets) within reach.
function nearestWalk(p,paths,reach=8){let best=null;for(const w of paths){if(!(w.kind==='footway'&&w.sub!=='crossing'||w.kind==='pedestrian'||w.kind==='path'))continue;const P=w.pts;
  for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],dx=b[0]-a[0],dn=b[1]-a[1],L2=dx*dx+dn*dn;if(!L2)continue;if(Math.abs(p[0]-a[0])>reach+Math.abs(dx)+2||Math.abs(p[1]-a[1])>reach+Math.abs(dn)+2)continue;
   let t=((p[0]-a[0])*dx+(p[1]-a[1])*dn)/L2;t=Math.max(0,Math.min(1,t));const q=[a[0]+dx*t,a[1]+dn*t],d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<reach&&(!best||d<best.d)){const L=Math.sqrt(L2);best={d,q,tan:[dx/L,dn/L]};}}}
 return best;}
// Bench records: {p, u (map unit vector along the bench), f (map unit vector the sitter faces), len}.
export function benchLayout(benches,paths){const pts=benches.map(b=>b.p),out=[];
 for(let i=0;i<pts.length;i++){const p=pts[i],w=nearestWalk(p,paths);
  // Row direction from neighbours that line up (principal axis of the points within 3.5 m).
  const nb=pts.filter((q,j)=>j!==i&&Math.hypot(q[0]-p[0],q[1]-p[1])<3.5);let u=w?w.tan:[1,0];
  if(nb.length){let sxx=0,sxn=0,snn=0;for(const q of [p,...nb]){const dx=q[0]-p[0],dn=q[1]-p[1];sxx+=dx*dx;sxn+=dx*dn;snn+=dn*dn;}const a=.5*Math.atan2(2*sxn,sxx-snn),r=[Math.cos(a),Math.sin(a)];
   // Use the row only where it roughly agrees with the path (else the neighbour is across the walk).
   if(!w||w.d>4||Math.abs(r[0]*u[0]+r[1]*u[1])>.7)u=r;}
  let f=[u[1],-u[0]];if(w&&w.d>.05){const to=[w.q[0]-p[0],w.q[1]-p[1]];if(f[0]*to[0]+f[1]*to[1]<0)f=[-f[0],-f[1]];}
  const gap=Math.min(...nb.map(q=>Math.abs((q[0]-p[0])*u[0]+(q[1]-p[1])*u[1])).filter(x=>x>.3),9);
  out.push({p,u,f,len:Math.max(1.2,Math.min(LEN,gap-.15)),backrest:benches[i].backrest!=='no'});}
 return out;}
// Granite benches: each OSM bench line is a run of blocks along the plaza's inner edge.
export function graniteLayout(lines){const out=[];for(const P of lines)for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.3)continue;out.push({p:[(a[0]+b[0])/2,(a[1]+b[1])/2],u:[(b[0]-a[0])/L,(b[1]-a[1])/L],len:L});}return out;}
// Seats for sitting: one per 0.65 m of bench, with the spot to sit (map), the facing direction and the seat height.
export function seatsOf(benches,granite,y0){const s=[];const add=(b,depth,h,kind,both)=>{const n=Math.max(1,Math.floor(b.len/.65));for(let k=0;k<n;k++){const o=(k-(n-1)/2)*(b.len/n);
  const faces=both?[[b.u[1],-b.u[0]],[-b.u[1],b.u[0]]]:[b.f];for(const f of faces)s.push({p:[b.p[0]+b.u[0]*o+f[0]*depth,b.p[1]+b.u[1]*o+f[1]*depth],f,y:y0+h,kind});}};
 for(const b of benches)add(b,.05,SEAT_H,'bench',false);for(const g of granite)add(g,.2,.45,'granite',true);return s;}

// ---- Browser only ----------------------------------------------------------------------------
function merge(parts){const geos=parts.map(g=>g.index?g.toNonIndexed():g);let n=0;for(const g of geos)n+=g.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3);let o=0;
 for(const g of geos){pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);o+=g.attributes.position.count;g.dispose();}
 const m=new T.BufferGeometry();m.setAttribute('position',new T.BufferAttribute(pos,3));m.setAttribute('normal',new T.BufferAttribute(nor,3));return m;}
const box=(w,h,d,x,y,z,rx=0)=>{const g=new T.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);return g.translate(x,y,z);};
// A bench of unit length 1 along x (scaled per bench), the sitter facing +z. Slats run the whole length.
function benchWood(){const p=[];for(let k=0;k<4;k++)p.push(box(1,.03,.09,0,SEAT_H,.2-k*.115));
 for(let k=0;k<3;k++)p.push(box(1,.09,.03,0,SEAT_H+.17+k*.12,-.27-k*.025,-.2));return merge(p);}
// Iron end frame (leg, seat bearer, back standard, armrest), placed at each end and in the middle.
function benchFrame(){return merge([box(.05,SEAT_H,.05,0,SEAT_H/2,.2),box(.05,SEAT_H,.05,0,SEAT_H/2,-.22),box(.05,.05,.52,0,SEAT_H-.03,-.02),box(.05,.5,.05,0,SEAT_H+.24,-.3,-.2),
 box(.05,.04,.42,0,SEAT_H+.24,.0),box(.05,.24,.04,0,SEAT_H+.12,.2)]);}
function canGeometry(){const g=new T.LatheGeometry([[.0,0],[.3,0],[.3,.06],[.24,.14],[.27,.92],[.29,.95],[.0,.95]].map(([x,y])=>new T.Vector2(x,y)),18);return g;}
function fountainGeometry(){return merge([new T.CylinderGeometry(.16,.22,.9,10).translate(0,.45,0),new T.CylinderGeometry(.27,.12,.14,14).translate(0,.97,0),
 new T.CylinderGeometry(.11,.15,.42,8).translate(.42,.21,0),new T.CylinderGeometry(.2,.1,.1,12).translate(.42,.47,0),box(.4,.08,.1,.22,.3,0)]);}
export function buildParkFurniture(data,{groundY=.15,materials}={}){const g=new T.Group();g.name='park-furniture';const own=[],geos=[];
 const mat=(c,r=.7,m=0)=>{const x=new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});own.push(x);return x;};
 const wood=mat(0x8b7a62,.85),iron=materials?.iron||mat(0x1d2124,.5,.6),granite=mat(0x5e5c58,.7),can=mat(0x18191a,.6,.3),castIron=mat(0x2a2c2c,.55,.5);
 const benches=benchLayout(data.benches,data.paths),granites=graniteLayout(data.benchLines||[]);
 const o=new T.Object3D(),inst=(geo,material,list,place)=>{geos.push(geo);const im=new T.InstancedMesh(geo,material,Math.max(1,list.length));im.count=list.length;im.frustumCulled=false;im.castShadow=true;im.receiveShadow=true;
  list.forEach((it,k)=>{o.rotation.set(0,0,0);o.scale.set(1,1,1);place(it,o);o.updateMatrix();im.setMatrixAt(k,o.matrix);});g.add(im);return im;};
 const yawOf=f=>Math.atan2(f[0],-f[1]);// turns local +z to face the map direction f (local +x then runs along the bench)
 inst(benchWood(),wood,benches,(b,O)=>{O.position.set(b.p[0],groundY,-b.p[1]);O.rotation.y=yawOf(b.f);O.scale.set(b.len,1,1);});
 const frames=[];for(const b of benches)for(const s of [-.5,0,.5])frames.push({p:[b.p[0]+b.u[0]*s*(b.len-.06),b.p[1]+b.u[1]*s*(b.len-.06)],f:b.f});
 inst(benchFrame(),iron,frames,(b,O)=>{O.position.set(b.p[0],groundY,-b.p[1]);O.rotation.y=yawOf(b.f);});
 inst(box(1,.14,.55,0,.38,0),granite,granites,(b,O)=>{O.position.set(b.p[0],groundY,-b.p[1]);O.rotation.y=Math.atan2(b.u[1],b.u[0]);O.scale.set(b.len,1,1);});
 inst(box(1,.31,.4,0,.155,0),granite,granites,(b,O)=>{O.position.set(b.p[0],groundY,-b.p[1]);O.rotation.y=Math.atan2(b.u[1],b.u[0]);O.scale.set(Math.max(.3,b.len-.3),1,1);});
 const misc=data.misc||[],baskets=misc.filter(m=>m.kind==='waste_basket'),fountains=misc.filter(m=>m.kind==='drinking_water');
 inst(canGeometry(),can,baskets,(m,O)=>O.position.set(m.p[0],groundY,-m.p[1]));
 inst(fountainGeometry(),castIron,fountains,(m,O)=>{O.position.set(m.p[0],groundY,-m.p[1]);const w=nearestWalk(m.p,data.paths);if(w)O.rotation.y=yawOf([w.q[0]-m.p[0],w.q[1]-m.p[1]].map(v=>v/Math.max(w.d,.01)));});
 const seats=seatsOf(benches,granites,groundY);
 return {group:g,benches,granites,seats,baskets,fountains,dispose(){for(const m of own)m.dispose();for(const x of geos)x.dispose();}};}
