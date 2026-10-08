import * as T from '../vendor/three.module.js';
import {Parts,Face} from './landmarks/kit.js?v=23';
import {STOREFRONTS} from './storefronts/index.js?v=23';
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
export function resolveStorefronts(data,list){const out=[];for(const r of list){if(r.a&&r.b){out.push(r);continue;}const f=frontage(data,r.bin,r.street);if(!f)continue;
 for(const [k,sh] of (r.shops||[]).entries()){const [f0,f1]=sh.frac||[0,1],P=t=>[f.a[0]+(f.b[0]-f.a[0])*t,f.a[1]+(f.b[1]-f.a[1])*t];out.push({...sh,id:sh.id||`${r.bin}-${k}`,addr:sh.addr||r.addr,seen:sh.seen||r.seen,bin:r.bin,a:P(f0),b:P(f1)});}}return out;}
export const outward=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),t=[(b[0]-a[0])/L,(b[1]-a[1])/L];return [t[1],-t[0]];};
// The sign decal for a record: centred on the fascia, 8 cm proud of the frame.
export function signDecal(r){if(!r.sign)return null;const L=Math.hypot(r.b[0]-r.a[0],r.b[1]-r.a[1]),N=outward(r.a,r.b),h=r.h||3.8,band=r.band||.9;
 const size=r.sign.size||[Math.min(L-.6,Math.max(1.2,L*.8)),Math.min(band-.15,.7)];const m=[(r.a[0]+r.b[0])/2+N[0]*.24,(r.a[1]+r.b[1])/2+N[1]*.24];
 const y=r.sign.mount==='awning'&&r.awning?.type&&r.awning.type!=='none'?h-band-.55:h-band+(band-size[1])/2;
 return {id:'shop-'+r.id,file:'assets/signage/shop-'+r.id+'.png',kind:'sign',size,bg:r.sign.bg,fg:r.sign.fg,lines:r.sign.lines,font:r.sign.font,border:r.sign.border,seen:r.seen,
  placements:[{p:m,y,normal:N,where:`${r.name}, ${r.addr} (shop sign)`}]};}
export function storefrontParts(r,P){const L=Math.hypot(r.b[0]-r.a[0],r.b[1]-r.a[1]);if(L<1.5)return;const t=[(r.b[0]-r.a[0])/L,(r.b[1]-r.a[1])/L],y0=.15;
 const f=new Face([r.a[0],y0,-r.a[1]],[t[0],0,-t[1]],[0,1,0]),h=(r.h||3.8)-y0,band=r.band||.9,b=r.bulkhead??.5,pil=Math.min(.35,L*.08),fr='frame:'+(r.frame||'#2b2724'),top=h-band;
 P.block(fr,f,0,pil,0,h,0,.12);P.block(fr,f,L-pil,L,0,h,0,.12);P.block(fr,f,0,L,top,h,0,.16,{skip:['left','right']});
 if(b>0)P.block('sfStone',f,pil,L-pil,0,b,0,.07,{skip:['left','right']});
 P.rect(r.shutter?'sfShutter':'sfGlass',f,pil,L-pil,b,top,.03);P.block(fr,f,pil,L-pil,top-.08,top,0,.09,{skip:['left','right']});
 const n=Math.max(0,r.mullions??Math.max(1,Math.round((L-2*pil)/1.6)-1));for(let i=1;i<=n;i++){const u=pil+(L-2*pil)*i/(n+1);P.block(fr,f,u-.04,u+.04,b,top,0,.08);}
 if(r.door){const w=r.door.w||1.0,c=Math.min(L-pil-w/2,Math.max(pil+w/2,r.door.at*L)),dt=Math.min(2.3,top-.15);P.block(fr,f,c-w/2-.08,c+w/2+.08,0,dt+.08,0,.1,{skip:['bottom']});P.rect('sfDoor',f,c-w/2,c+w/2,0,dt,.105);}
 const aw=r.awning;if(aw&&aw.type&&aw.type!=='none'){const m='awn:'+(aw.color||'#3c4a3a'),D=aw.depth||1.1,v1=top,v0=aw.type==='flat'?top-.12:top-.75,u0=.1,u1=L-.1;
  if(aw.type==='barrel'){const steps=8,prof=[];for(let i=0;i<=steps;i++){const a=Math.PI/2*i/steps;prof.push([.16+(D-.16)*Math.sin(a),v1-.75*(1-Math.cos(a))]);}
   for(let i=0;i<steps;i++){const [d0,a0]=prof[i],[d1,a1]=prof[i+1];P.quad(m,f.at(u0,a0,d0),f.at(u1,a0,d0),f.at(u1,a1,d1),f.at(u0,a1,d1),[f.n[0],1,f.n[2]]);}
   P.quad(m,f.at(u0,v1-.75,D),f.at(u1,v1-.75,D),f.at(u1,v1-1.0,D),f.at(u0,v1-1.0,D),f.n);}
  else{P.quad(m,f.at(u0,v1,.16),f.at(u1,v1,.16),f.at(u1,v0,D),f.at(u0,v0,D),[f.n[0],1,f.n[2]]);P.quad(m,f.at(u0,v0,D),f.at(u1,v0,D),f.at(u1,v0-.25,D),f.at(u0,v0-.25,D),f.n);
   for(const [u,s] of [[u0,-1],[u1,1]])P.tri(m,f.at(u,v1,.16),f.at(u,v0,D),f.at(u,v0-.25,D),f.u.map(x=>x*s));}}}
const hex=c=>new T.Color(c);
export function buildStorefronts(world,list=STOREFRONTS){const records=resolveStorefronts(world.data,list);const tiles=new Map(),keep=x=>{world.disposables.add(x);return x;};
 for(const r of records){const c=[(r.a[0]+r.b[0])/2,(r.a[1]+r.b[1])/2],t=world.tile(...c);let P=tiles.get(t);if(!P){P=new Parts();tiles.set(t,P);}storefrontParts(r,P);}
 const mats={sfGlass:keep(new T.MeshStandardMaterial({color:0x2b3238,roughness:.15,metalness:.4})),sfStone:keep(new T.MeshStandardMaterial({color:0x9c968c,roughness:.85})),
  sfDoor:keep(new T.MeshStandardMaterial({color:0x1e1b18,roughness:.5,metalness:.2})),sfShutter:keep(new T.MeshStandardMaterial({color:0x7d8084,roughness:.6,metalness:.5}))};
 const get=k=>mats[k]||(mats[k]=keep(k.startsWith('awn:')?new T.MeshStandardMaterial({color:hex(k.slice(4)),roughness:.95,side:T.DoubleSide}):new T.MeshStandardMaterial({color:hex(k.slice(6)),roughness:.6,metalness:.2})));
 const groups=[];let tris=0;for(const [t,P] of tiles){for(const k of Object.keys(P.m))get(k);const g=P.build(mats);g.name='storefronts';for(const m of g.children){keep(m.geometry);m.name=m.name.startsWith('awn:')?'awning':m.name.startsWith('frame:')?'frame':m.name;}(t.props||t.group).add(g);groups.push(g);tris+=P.tris;}
 world.storefronts={groups,count:records.length,tris};return groups;}
