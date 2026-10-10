import * as T from '../vendor/three.module.js';
import {Parts,Face} from './landmarks/kit.js?v=24';
import {STOREFRONTS} from './storefronts/index.js?v=24';
import model3d from './data/campus-3d.js?v=24';
import {interiorMaterial,addPane,paneMesh,newPanes} from './interiors.js?v=24';
// Storefront kit (Step 4B, Tier B): turns the records in storefronts/ into real ground-floor geometry,
// merged per 120 m tile and per material and parented to the tile's props (so storefront detail only
// draws within about 330 m). Signs are decals in the signage atlas (see signage.js and the manifest).
export {STOREFRONTS};
// A building's frontage on a street: the ring edges that face the street's centreline (3-28 m away),
// merged into one run, ordered left to right as seen from the street. Returns {a, b, len} or null.
export function frontage(data,bin,street){const b=data.buildings.find(x=>x.bin===bin);if(!b)return null;const re=new RegExp(street,'i'),segs=[];
 for(const s of data.streets.segments)if(re.test(data.streets.names[s.street]))for(let i=1;i<s.pts.length;i++)segs.push([s.pts[i-1],s.pts[i]]);if(!segs.length)return null;
 const near=p=>{let best=null;for(const [a,c] of segs){const ex=c[0]-a[0],en=c[1]-a[1],L=ex*ex+en*en;let k=L?((p[0]-a[0])*ex+(p[1]-a[1])*en)/L:0;k=Math.max(0,Math.min(1,k));const q=[a[0]+ex*k,a[1]+en*k],d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(!best||d<best.d)best={q,d};}return best;};
 const r=b.rings[0],A=r.reduce((s,p,k)=>{const q=r[(k+1)%r.length];return s+p[0]*q[1]-q[0]*p[1];},0),pts=[];let on=null;
 for(let i=0;i<r.length;i++){const a=r[i],c=r[(i+1)%r.length],el=Math.hypot(c[0]-a[0],c[1]-a[1]);if(el<1)continue;const m=[(a[0]+c[0])/2,(a[1]+c[1])/2],nb=near(m);if(nb.d<2||nb.d>28)continue;
  const et=[(c[0]-a[0])/el,(c[1]-a[1])/el],o=A>0?[et[1],-et[0]]:[-et[1],et[0]],ts=[(nb.q[0]-m[0])/nb.d,(nb.q[1]-m[1])/nb.d];if(o[0]*ts[0]+o[1]*ts[1]<.8)continue;pts.push({a,c,d:nb.d,o});}
 if(!pts.length)return null;const dmin=Math.min(...pts.map(e=>e.d)),keep=pts.filter(e=>e.d<dmin+2);on=keep[0].o;pts.length=0;for(const e of keep)pts.push(e.a,e.c);const right=[-on[1],on[0]],proj=p=>p[0]*right[0]+p[1]*right[1];pts.sort((p,q)=>proj(p)-proj(q));const a=pts[0],c=pts[pts.length-1];return {a,b:c,len:Math.hypot(c[0]-a[0],c[1]-a[1]),normal:on};}
// Expand building-based records ({bin, street, shops: [{frac: [f0, f1], ...}]}) into shopfront records with a and b.
// The rendered walls come from the NYC 3D Building Model roofs, which can stand up to a metre proud of the tax-lot
// footprint the frontage is measured on. Find where the real wall is: cast rays outward from points along the
// frontage and take the farthest wall edge within 2 m, so the shopfront sits on the face you see, not inside it.
const EDGES=[];for(const k in model3d){for(const r of model3d[k].roofs||[]){const n=r.length/3;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const pts=[];for(let i=0;i<n;i++){const p=[r[i*3],r[i*3+1]];pts.push(p);x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}EDGES.push({pts,box:[x0,x1,y0,y1]});}}
export function wallSetOut(a,b,N,max=2){const ts=[.15,.35,.5,.65,.85];let best=0;const x0=Math.min(a[0],b[0])-max-1,x1=Math.max(a[0],b[0])+max+1,y0=Math.min(a[1],b[1])-max-1,y1=Math.max(a[1],b[1])+max+1;
 const polys=EDGES.filter(e=>e.box[1]>x0&&e.box[0]<x1&&e.box[3]>y0&&e.box[2]<y1),hits=[];
 for(const t of ts){const o=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];let far=null;
  for(const e of polys){const P=e.pts;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],ex=q[0]-p[0],ey=q[1]-p[1],den=N[0]*ey-N[1]*ex;if(Math.abs(den)<1e-6)continue;
   const wx=p[0]-o[0],wy=p[1]-o[1],s=(wx*ey-wy*ex)/den,u=(wx*N[1]-wy*N[0])/den;if(u<0||u>1||s<-.3||s>max)continue;if(far===null||s>far)far=s;}}
  if(far!==null)hits.push(far);}
 if(hits.length<3)return 0;hits.sort((p,q)=>p-q);best=hits[Math.floor(hits.length/2)];return best>-.02?Math.round((best+.02)*100)/100:0;}
export function resolveStorefronts(data,list){const out=[];for(const r of list){if(r.a&&r.b){out.push(r);continue;}const f=frontage(data,r.bin,r.street);if(!f)continue;
 for(const [k,sh] of (r.shops||[]).entries()){const [f0,f1]=sh.frac||[0,1],P=t=>[f.a[0]+(f.b[0]-f.a[0])*t,f.a[1]+(f.b[1]-f.a[1])*t];const a=P(f0),b=P(f1),N=outward(a,b),so=sh.setOut??wallSetOut(a,b,N),sh2=p=>[p[0]+N[0]*so,p[1]+N[1]*so];out.push({...sh,id:sh.id||`${r.bin}-${k}`,addr:sh.addr||r.addr,seen:sh.seen||r.seen,bin:r.bin,a:sh2(a),b:sh2(b),setOut:so});}}return out;}
export const outward=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),t=[(b[0]-a[0])/L,(b[1]-a[1])/L];return [t[1],-t[0]];};
// The sign decal for a record: centred on the fascia, 8 cm proud of the frame.
export function signDecal(r){if(!r.sign)return null;const L=Math.hypot(r.b[0]-r.a[0],r.b[1]-r.a[1]),N=outward(r.a,r.b),h=r.h||3.8,band=r.band||.9;
 const size=(r.sign.size||[Math.min(L-.6,Math.max(1.2,L*.8)),Math.min(band-.15,.7)]).slice();const m=[(r.a[0]+r.b[0])/2+N[0]*.24,(r.a[1]+r.b[1])/2+N[1]*.24];
 const onAwn=r.sign.mount==='awning'&&r.awning?.type&&r.awning.type!=='none';
 // An awning sign is lettered on the valance that hangs from the awning's front edge.
 if(onAwn){const D=r.awning.depth||1.1,drop=r.awning.type==='flat'?.12:.75;size[1]=Math.min(size[1],.3);m[0]=(r.a[0]+r.b[0])/2+N[0]*(D+.04);m[1]=(r.a[1]+r.b[1])/2+N[1]*(D+.04);
  return {id:'shop-'+r.id,file:'assets/signage/shop-'+r.id+'.png',kind:'sign',lit:true,size,bg:r.sign.bg,fg:r.sign.fg,lines:r.sign.lines,font:r.sign.font,border:r.sign.border,seen:r.seen,
   placements:[{p:m,y:h-band-drop-size[1],normal:N,where:`${r.name}, ${r.addr} (lettered awning valance)`}]};}
 const y=h-band+(band-size[1])/2;
 return {id:'shop-'+r.id,file:'assets/signage/shop-'+r.id+'.png',kind:'sign',lit:true,size,bg:r.sign.bg,fg:r.sign.fg,lines:r.sign.lines,font:r.sign.font,border:r.sign.border,seen:r.seen,
  placements:[{p:m,y,normal:N,where:`${r.name}, ${r.addr} (shop sign)`}]};}
// Sidewalk seating and dining sheds, as seen on Street View: a painted railing (or planter boxes) a little way
// out from the shopfront with tables inside, and a roofed shed out in the curb lane. Distances are metres out
// from the building line; from/to are fractions along the shopfront (they may run past it, over a neighbour).
//  seating {color, depth, from, to, tables, planters}   shed {color, d0, d1, from, to, h, roof, closed}
function extras(r,P,f,L){const se=r.seating;if(se){const c='frame:'+(se.color||r.frame||'#2b2724'),D=se.depth||1.6,u0=(se.from??0)*L,u1=(se.to??1)*L;
  if(se.planters){P.block(c,f,u0,u1,0,.75,D-.45,D,{});P.block('sfSoil',f,u0+.05,u1-.05,.7,.78,D-.4,D-.05,{});}
  else{P.block(c,f,u0,u1,.9,.96,D-.05,D,{});P.block(c,f,u0,u1,.12,.5,D-.04,D-.01,{});for(let u=u0;u<=u1+.01;u+=Math.max(.6,(u1-u0)/Math.round((u1-u0)/1.2))){P.block(c,f,u-.03,u+.03,0,.96,D-.05,D,{});}
   for(const u of [u0,u1])P.block(c,f,u-.03,u+.03,.9,.96,.1,D,{});}
  const n=se.tables??Math.max(1,Math.floor((u1-u0)/1.6));for(let i=0;i<n;i++){const u=u0+(u1-u0)*(i+.5)/n,m=f.matrix(u,0,D*.5);
   P.cyl('sfTable',.32,.32,.04,f.matrix(u,.74,D*.5),12);P.cyl('sfTable',.03,.03,.72,f.matrix(u,.37,D*.5),6);
   for(const du of [-.45,.45])P.block('sfChair',f,u+du-.17,u+du+.17,.44,.48,D*.5-.17,D*.5+.17,{});}}
 const sh=r.shed;if(sh){const c='frame:'+(sh.color||r.frame||'#2b2724'),d0=sh.d0??4.4,d1=sh.d1??6.8,u0=(sh.from??0)*L,u1=(sh.to??1)*L,H=sh.h||2.6;
  for(const u of [u0,u1])for(const d of [d0,d1])P.block(c,f,u-.06,u+.06,0,H,d-.06,d+.06,{});
  P.block(sh.roof?'awn:'+sh.roof:c,f,u0-.15,u1+.15,H,H+.12,d0-.2,d1+.2,{});P.block(c,f,u0,u1,H-.3,H,d1-.05,d1+.05,{});P.block(c,f,u0,u1,0,1.0,d1-.05,d1+.05,{});
  for(const u of [u0,u1])P.block(c,f,u-.05,u+.05,0,1.0,d0,d1,{});
  if(sh.closed){P.rect('sfGlass',f,u0,u1,1.0,H-.3,d1+.06);}
  const n=Math.max(1,Math.floor((u1-u0)/1.8));for(let i=0;i<n;i++){const u=u0+(u1-u0)*(i+.5)/n,d=(d0+d1)/2;P.cyl('sfTable',.32,.32,.04,f.matrix(u,.74,d),12);P.cyl('sfTable',.03,.03,.72,f.matrix(u,.37,d),6);}}}
// The logo slot for a record: an empty (transparent) decal at the left end of the sign band, for the
// business's own logo file. The game never draws logos or logo-like art; Avi adds the files himself.
export function logoDecal(r){if(!r.sign||r.logo===false)return null;const L=Math.hypot(r.b[0]-r.a[0],r.b[1]-r.a[1]),N=outward(r.a,r.b),h=r.h||3.8,band=r.band||.9,t=[(r.b[0]-r.a[0])/L,(r.b[1]-r.a[1])/L];
 const s=Math.min(band-.2,.7),u=Math.min(.55,L*.12)+s/2+.05,m=[r.a[0]+t[0]*u+N[0]*.26,r.a[1]+t[1]*u+N[1]*.26];
 return {id:'logo-'+r.id,file:'assets/signage/logo-'+r.id+'.png',kind:'logo',lit:true,size:[s,s],bg:'rgba(0,0,0,0)',lines:[],
  seen:'Logo slot for '+r.name+': empty until a logo file is added here; the game draws no logos',placements:[{p:m,y:h-band+(band-s)/2,normal:N,where:`${r.name}, ${r.addr} (logo slot)`}]};}
export function storefrontParts(r,P,panes){const L=Math.hypot(r.b[0]-r.a[0],r.b[1]-r.a[1]);if(L<1.5)return;const t=[(r.b[0]-r.a[0])/L,(r.b[1]-r.a[1])/L],y0=.15;
 const f=new Face([r.a[0],y0,-r.a[1]],[t[0],0,-t[1]],[0,1,0]),h=(r.h||3.8)-y0,band=r.band||.9,b=r.bulkhead??.5,pil=Math.min(.55,L*.1),fr='frame:'+(r.frame||'#2b2724'),top=h-band;
 P.block(fr,f,0,pil,0,h,0,.12);P.block(fr,f,L-pil,L,0,h,0,.12);P.block(fr,f,0,L,top,h,0,.16,{skip:['left','right']});
 if(b>0)P.block(r.bulkheadStone?'sfStone':fr,f,pil,L-pil,0,b,0,.09,{skip:['left','right']});
 if(r.shutter||!panes)P.rect(r.shutter?'sfShutter':'sfGlass',f,pil,L-pil,b,top,.03);else addPane(panes,f,pil,L-pil,b,top,.03,r);P.block(fr,f,pil,L-pil,top-.08,top,0,.09,{skip:['left','right']});
 const n=Math.max(0,r.mullions??Math.max(1,Math.round((L-2*pil)/1.6)-1));for(let i=1;i<=n;i++){const u=pil+(L-2*pil)*i/(n+1);P.block(fr,f,u-.04,u+.04,b,top,0,.08);}
 if(r.door){const w=r.door.w||1.0,c=Math.min(L-pil-w/2,Math.max(pil+w/2,r.door.at*L)),dt=Math.min(2.3,top-.15);P.block(fr,f,c-w/2-.08,c+w/2+.08,0,dt+.08,0,.1,{skip:['bottom']});P.rect('sfDoor',f,c-w/2,c+w/2,0,dt,.105);}
 extras(r,P,f,L);
 const aw=r.awning;if(aw&&aw.type&&aw.type!=='none'){const m='awn:'+(aw.color||'#3c4a3a'),D=aw.depth||1.1,v1=top,v0=aw.type==='flat'?top-.12:top-.75,u0=.1,u1=L-.1;
  if(aw.type==='barrel'){const steps=8,prof=[];for(let i=0;i<=steps;i++){const a=Math.PI/2*i/steps;prof.push([.16+(D-.16)*Math.sin(a),v1-.75*(1-Math.cos(a))]);}
   for(let i=0;i<steps;i++){const [d0,a0]=prof[i],[d1,a1]=prof[i+1];P.quad(m,f.at(u0,a0,d0),f.at(u1,a0,d0),f.at(u1,a1,d1),f.at(u0,a1,d1),[f.n[0],1,f.n[2]]);}
   P.quad(m,f.at(u0,v1-.75,D),f.at(u1,v1-.75,D),f.at(u1,v1-1.0,D),f.at(u0,v1-1.0,D),f.n);}
  else{P.quad(m,f.at(u0,v1,.16),f.at(u1,v1,.16),f.at(u1,v0,D),f.at(u0,v0,D),[f.n[0],1,f.n[2]]);P.quad(m,f.at(u0,v0,D),f.at(u1,v0,D),f.at(u1,v0-.25,D),f.at(u0,v0-.25,D),f.n);
   for(const [u,s] of [[u0,-1],[u1,1]])P.tri(m,f.at(u,v1,.16),f.at(u,v0,D),f.at(u,v0-.25,D),f.u.map(x=>x*s));}}}
const hex=c=>new T.Color(c);
export function buildStorefronts(world,list=STOREFRONTS){const records=resolveStorefronts(world.data,list);const tiles=new Map(),keep=x=>{world.disposables.add(x);return x;};
 const paneByTile=new Map();for(const r of records){const c=[(r.a[0]+r.b[0])/2,(r.a[1]+r.b[1])/2],t=world.tile(...c);let P=tiles.get(t);if(!P){P=new Parts();tiles.set(t,P);paneByTile.set(t,newPanes());}storefrontParts(r,P,paneByTile.get(t));}
 const imat=interiorMaterial(world);
 const mats={sfGlass:keep(new T.MeshStandardMaterial({color:0x2b3238,roughness:.15,metalness:.4})),sfStone:keep(new T.MeshStandardMaterial({color:0x9c968c,roughness:.85})),
  sfDoor:keep(new T.MeshStandardMaterial({color:0x1e1b18,roughness:.5,metalness:.2})),sfShutter:keep(new T.MeshStandardMaterial({color:0x7d8084,roughness:.6,metalness:.5})),sfTable:keep(new T.MeshStandardMaterial({color:0x4a4640,roughness:.6,metalness:.3})),sfChair:keep(new T.MeshStandardMaterial({color:0x3a3632,roughness:.7})),sfSoil:keep(new T.MeshStandardMaterial({color:0x3b4a2c,roughness:.95}))};
 const get=k=>mats[k]||(mats[k]=keep(k.startsWith('awn:')?new T.MeshStandardMaterial({color:hex(k.slice(4)),roughness:.95,side:T.DoubleSide}):new T.MeshStandardMaterial({color:hex(k.slice(6)),roughness:.6,metalness:.2})));
 const groups=[];let tris=0;for(const [t,P] of tiles){for(const k of Object.keys(P.m))get(k);const g=P.build(mats);g.name='storefronts';for(const m of g.children){keep(m.geometry);m.name=m.name.startsWith('awn:')?'awning':m.name.startsWith('frame:')?'frame':m.name;}(t.props||t.group).add(g);groups.push(g);const pn=paneByTile.get(t);if(pn&&pn.pos.length){const pm=paneMesh(pn,imat);keep(pm.geometry);g.add(pm);}tris+=P.tris;}
 world.storefronts={groups,count:records.length,tris};return groups;}
