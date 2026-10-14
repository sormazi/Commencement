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
// A bench of unit length 1 along x (scaled per bench), the sitter facing +z. Slats run the whole length and follow
// the frame's curve (Avi's photo, Oct 2026: pale weathered slats on curved black cast-iron frames, scrolled arms).
// Cross-section of the frame in (z, y): seat dipping slightly to the back, back curving up and back.
const SEAT=[[.24,.45],[.12,.44],[0,.425],[-.12,.41],[-.2,.405]],BACK=[[-.22,.44],[-.27,.56],[-.31,.68],[-.34,.8],[-.355,.9]];
const seg=(a,b,t=.045,x=0)=>{const dz=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dz,dy);const g=new T.BoxGeometry(t,t,L+t*.6);g.rotateX(-Math.atan2(dy,dz));return g.translate(x,(a[1]+b[1])/2,(a[0]+b[0])/2);};
function benchWood(){const p=[];for(const [z,y] of SEAT.slice(0,4))p.push(box(1,.028,.095,0,y+.035,z-.03));
 for(let k=0;k<3;k++){const a=BACK[k+1],b=BACK[k+2]||BACK[k+1];const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const g=new T.BoxGeometry(1,.1,.026);g.rotateX(Math.PI/2+ang);p.push(g.translate(0,a[1]+.02,a[0]+.03));}return merge(p);}
// Iron end frame: front and back legs splayed a little, the curved seat bearer, the curved back standard, and the
// armrest that runs forward from the back and ends in a scroll curling down to the seat.
function benchFrame(){const p=[seg([.2,0],[.23,.42]),seg([-.18,0],[-.22,.44]),seg([-.18,0],[.2,0],.035)];
 for(let i=1;i<SEAT.length;i++)p.push(seg(SEAT[i-1],SEAT[i]));for(let i=1;i<BACK.length;i++)p.push(seg(BACK[i-1],BACK[i]));
 p.push(seg([-.29,.64],[.12,.66],.04),seg([.12,.66],[.2,.64],.04));
 const C=[.21,.59],R=.05;for(let k=0;k<7;k++){const a0=Math.PI/2-k*.8,a1=a0-.8;p.push(seg([C[0]+Math.cos(a0)*R,C[1]+Math.sin(a0)*R],[C[0]+Math.cos(a1)*R*.9,C[1]+Math.sin(a1)*R*.9],.03));}
 p.push(seg([.2,.54],[.23,.45],.035));return merge(p);}
function canGeometry(){const g=new T.LatheGeometry([[.0,0],[.3,0],[.3,.06],[.24,.14],[.27,.92],[.29,.95],[.0,.95]].map(([x,y])=>new T.Vector2(x,y)),18);return g;}
function fountainGeometry(){return merge([new T.CylinderGeometry(.16,.22,.9,10).translate(0,.45,0),new T.CylinderGeometry(.27,.12,.14,14).translate(0,.97,0),
 new T.CylinderGeometry(.11,.15,.42,8).translate(.42,.21,0),new T.CylinderGeometry(.2,.1,.1,12).translate(.42,.47,0),box(.4,.08,.1,.22,.3,0)]);}
export function buildParkFurniture(data,{groundY=.15,materials}={}){const g=new T.Group();g.name='park-furniture';const own=[],geos=[];
 const mat=(c,r=.7,m=0)=>{const x=new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});own.push(x);return x;};
 const wood=mat(0xa39580,.85),iron=materials?.iron||mat(0x1d2124,.5,.6),granite=mat(0x5e5c58,.7),can=mat(0x18191a,.6,.3),castIron=mat(0x2a2c2c,.55,.5);
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
// ---- Fences, railings and hedges (OSM barrier ways; 13 Oct 2026) --------------------------------------
// Looks (Street View user photospheres, Jul 2017, Washington Square Park): the lawns are edged with low black
// posts carrying drooping chains; the playgrounds and dog runs have tall black picket fences. Elsewhere the
// railings are black iron pickets (the usual New York areaway and churchyard railing). So: inside the park,
// fences 1 m or lower are post-and-chain; every other fence is a picket railing at its OSM height (1.2 m when
// untagged); hedges are clipped privet boxes.
export function fenceStyle(b,inPark){if(b.kind==='hedge')return 'hedge';if(b.kind!=='fence')return null;const h=b.height||1.2;return inPark&&h<=1.05?'chain':'picket';}
function picketTexture(){const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d');g.clearRect(0,0,64,128);g.fillStyle='#fff';
 for(let i=0;i<4;i++){g.fillRect(i*16+6,6,4,122);g.beginPath();g.moveTo(i*16+4,10);g.lineTo(i*16+8,0);g.lineTo(i*16+12,10);g.fill();}g.fillRect(0,16,64,5);g.fillRect(0,116,64,6);
 const t=new T.CanvasTexture(c);t.wrapS=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;return t;}
export function buildFences(barriers,{groundY=.15,inPark=()=>false,materials}={}){const g=new T.Group();g.name='fences';const own=[],geos=[];
 const pos=[],nor=[],uv=[],hed=[],posts=[],chains=[];
 const quad=(a,b,y0,y1,u1)=>{const dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn),nx=-dn/L,nz=-dx/L;// normal in three coords (map normal (dn,-dx) -> three (dn, dx)), any sign: double-sided
  const A=[a[0],y0,-a[1]],B=[b[0],y0,-b[1]],C=[b[0],y1,-b[1]],D=[a[0],y1,-a[1]];for(const v of [A,B,C,A,C,D])pos.push(...v);for(let i=0;i<6;i++)nor.push(dn/L,0,dx/L);
  for(const t of [[0,0],[u1,0],[u1,1],[0,0],[u1,1],[0,1]])uv.push(...t);};
 for(const b of barriers){const st=fenceStyle(b,inPark(b.pts[Math.floor(b.pts.length/2)]));if(!st)continue;const h=b.height||(st==='hedge'?1:1.2);
  for(let i=1;i<b.pts.length;i++){const a=b.pts[i-1],c=b.pts[i],L=Math.hypot(c[0]-a[0],c[1]-a[1]);if(L<.05)continue;
   if(st==='picket')quad(a,c,groundY,groundY+h,L/.64*(1.2/h));
   else if(st==='hedge')hed.push({p:[(a[0]+c[0])/2,(a[1]+c[1])/2],a:Math.atan2(c[1]-a[1],c[0]-a[0]),L,h});
   else{const n=Math.max(1,Math.round(L/2.2));for(let k=0;k<=n;k++){if(k===0&&i>1)continue;posts.push([a[0]+(c[0]-a[0])*k/n,a[1]+(c[1]-a[1])*k/n]);}
    for(let k=0;k<n;k++){const p0=[a[0]+(c[0]-a[0])*k/n,a[1]+(c[1]-a[1])*k/n],p1=[a[0]+(c[0]-a[0])*(k+1)/n,a[1]+(c[1]-a[1])*(k+1)/n];// three straight links approximating the sag
     const sag=[0,.12,.12,0];for(let s=0;s<3;s++){const q0=[p0[0]+(p1[0]-p0[0])*s/3,p0[1]+(p1[1]-p0[1])*s/3],q1=[p0[0]+(p1[0]-p0[0])*(s+1)/3,p0[1]+(p1[1]-p0[1])*(s+1)/3];chains.push({q0,q1,y0:groundY+.58-sag[s],y1:groundY+.58-sag[s+1]});}}}}}
 if(pos.length){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(nor,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  const tex=picketTexture(),m=new T.MeshStandardMaterial({color:0x1b1d1f,map:tex,alphaTest:.5,side:T.DoubleSide,metalness:.5,roughness:.5});own.push(m,tex);geos.push(geo);const mesh=new T.Mesh(geo,m);mesh.name='picket railings';mesh.castShadow=true;g.add(mesh);}
 const o=new T.Object3D(),inst=(geo,material,list,place)=>{geos.push(geo);const im=new T.InstancedMesh(geo,material,Math.max(1,list.length));im.count=list.length;im.frustumCulled=false;im.castShadow=true;list.forEach((it,k)=>{o.rotation.set(0,0,0);o.scale.set(1,1,1);place(it,o);o.updateMatrix();im.setMatrixAt(k,o.matrix);});g.add(im);return im;};
 const iron=materials?.iron||(()=>{const m=new T.MeshStandardMaterial({color:0x1d2124,metalness:.6,roughness:.5});own.push(m);return m;})();
 inst(new T.CylinderGeometry(.035,.04,.66,8).translate(0,.33,0),iron,posts,(p,O)=>O.position.set(p[0],groundY,-p[1]));
 inst(new T.SphereGeometry(.045,8,6).translate(0,.68,0),iron,posts,(p,O)=>O.position.set(p[0],groundY,-p[1]));
 inst(new T.CylinderGeometry(.012,.012,1,4).rotateZ(Math.PI/2),iron,chains,(c,O)=>{const dx=c.q1[0]-c.q0[0],dn=c.q1[1]-c.q0[1],L=Math.hypot(dx,dn),dy=c.y1-c.y0;O.position.set((c.q0[0]+c.q1[0])/2,(c.y0+c.y1)/2,-(c.q0[1]+c.q1[1])/2);O.rotation.set(0,Math.atan2(dn,dx),Math.atan2(dy,L),'YXZ');O.scale.set(Math.hypot(L,dy),1,1);});
 const hm=new T.MeshStandardMaterial({color:0x3f5a2c,roughness:.95});own.push(hm);
 inst(new T.BoxGeometry(1,1,.8).translate(0,.5,0),hm,hed,(e,O)=>{O.position.set(e.p[0],groundY,-e.p[1]);O.rotation.y=e.a;O.scale.set(e.L+.3,e.h,1);});
 return {group:g,counts:{picketM:pos.length/18,posts:posts.length,links:chains.length,hedges:hed.length},dispose(){for(const m of own)m.dispose();for(const x of geos)x.dispose();}};}
// ---- Lawn and bed edges (Avi, 14 Oct 2026, from his photo of the park): the beds and lawns are edged with low
// black posts and drooping chains. OSM maps only a few of these fences, so every edge of a lawn or planting bed
// inside the park that faces a walk gets one, 0.15 m out from the edge; edges shared with another lawn or bed
// (where the outside is planting too) get none. Returned as barrier lines for buildFences (post-and-chain style).
export function lawnEdgeChains(areas,{inPark,pip}){const soft=areas.filter(a=>(a.kind==='grass'||a.kind==='bed'||a.kind==='flowerbed'||a.kind==='shrubbery')&&a.ring.length>=3&&inPark(a.ring[0]));
 const bbs=soft.map(a=>{const b=[1e9,1e9,-1e9,-1e9];for(const p of a.ring){b[0]=Math.min(b[0],p[0]);b[1]=Math.min(b[1],p[1]);b[2]=Math.max(b[2],p[0]);b[3]=Math.max(b[3],p[1]);}return b;});
 const inSoft=(p,skip)=>soft.some((a,i)=>i!==skip&&p[0]>=bbs[i][0]&&p[0]<=bbs[i][2]&&p[1]>=bbs[i][1]&&p[1]<=bbs[i][3]&&pip(p,a.ring));
 const lines=[];soft.forEach((a,ai)=>{const r=a.ring,n=r.length;let cur=null;
  for(let i=0;i<n;i++){const p=r[i],q=r[(i+1)%n],dx=q[0]-p[0],dn=q[1]-p[1],L=Math.hypot(dx,dn);if(L<.3){continue;}
   let nx=dn/L,nn=-dx/L;const m=[(p[0]+q[0])/2,(p[1]+q[1])/2];if(pip([m[0]+nx*.1,m[1]+nn*.1],r)){nx=-nx;nn=-nn;}// outward normal
   const out=[m[0]+nx*.8,m[1]+nn*.8],keep=inPark(out)&&!inSoft(out,ai);
   if(keep){const A=[p[0]+nx*.15,p[1]+nn*.15],B=[q[0]+nx*.15,q[1]+nn*.15];if(cur)cur.push(B);else{cur=[A,B];lines.push(cur);}}else cur=null;}});
 return lines.filter(l=>{let s=0;for(let i=1;i<l.length;i++)s+=Math.hypot(l[i][0]-l[i-1][0],l[i][1]-l[i-1][1]);return s>1.5;}).map(pts=>({kind:'fence',height:.7,pts,edge:true}));}
// Clipped boxwood balls along the walk side of each planting bed in the park (Avi's photo: rows of round, clipped
// boxwoods just inside the bed edge), about 2 m apart and 0.7 m in, clear of tree trunks.
export function boxwoodLayout(areas,trees,{inPark,pip}){const out=[];const h=x=>{const v=Math.sin(x*12.9898)*43758.5453;return v-Math.floor(v);};
 for(const a of areas){if(a.kind!=='bed'||!inPark(a.ring[0]))continue;const r=a.ring,n=r.length;let carry=1;
  for(let i=0;i<n;i++){const p=r[i],q=r[(i+1)%n],dx=q[0]-p[0],dn=q[1]-p[1],L=Math.hypot(dx,dn);if(L<.5)continue;let nx=dn/L,nn=-dx/L;const m=[(p[0]+q[0])/2,(p[1]+q[1])/2];if(!pip([m[0]+nx*.1,m[1]+nn*.1],r)){nx=-nx;nn=-nn;}// inward normal
   for(let t=carry;t<L;t+=2.05){const c=[p[0]+dx/L*t+nx*.7,p[1]+dn/L*t+nn*.7];carry=t+2.05-L;if(!pip(c,r))continue;if(trees.some(tr=>Math.abs(tr.p[0]-c[0])<1.3&&Math.abs(tr.p[1]-c[1])<1.3))continue;if(out.some(o=>Math.abs(o.p[0]-c[0])<1.2&&Math.abs(o.p[1]-c[1])<1.2))continue;
    const s=h(c[0]*3.7+c[1]);out.push({p:c,d:1.05+s*.35,y:.85+h(s*7)*.25});}}}
 return out;}
