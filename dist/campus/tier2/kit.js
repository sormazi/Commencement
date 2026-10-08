import * as T from '../../vendor/three.module.js';
import {Parts,Face,brickTextures,stoneTextures,reveal} from '../landmarks/kit.js?v=22';
import {pieces,walls,roofs,mergeWalls,curtain,storefront,facing,signPanel,sashTexture,archHole} from '../landmarks/facade.js?v=22';
import {pointInRing,centroid,ringArea} from '../geometry.js?v=22';
import model3d from '../data/campus-3d.js?v=22';
// Second-tier kit buildings (Phase 2, Step 2). Every NYU building that is not a detailed landmark is
// described by a short spec (tier2/b/*.js): its wall material, window rhythm, ground storey, cornice,
// entrances and any signature feature. This module turns a spec plus the building's surveyed volume
// (NYC 3D Building Model roof pieces, or the footprint extruded to the surveyed roof height) into
// geometry. Geometry is merged per world tile and per material with shared materials, so fifty
// buildings cost a few draw calls per tile rather than a few per building.
// Entrance doors are kept out of the merged meshes: each one is an instance in one door mesh, and
// world.doors lists them (building, position, facing, size) for the future walking character.

// ---- Volume ----
export function volumePieces(b,extra=[]){const out=[];for(const bb of [b,...extra]){const m=model3d[bb.bin];
  if(m)out.push(...pieces(m).map(p=>({...p,bin:bb.bin})));else for(const r of bb.rings.slice(0,1)){const A=ringArea(r);out.push({ring:A>0?r.slice():r.slice().reverse(),z:Math.max(3,bb.h||3),bin:bb.bin});}}
 return out;}
// Party walls: a wall whose outside (1.2 m out from its midpoint) lies inside a neighbouring footprint.
export class FootprintIndex{constructor(buildings,cell=40){this.cell=cell;this.g=new Map();this.byBin=new Map(buildings.map(b=>[b.bin,b]));for(const b of buildings){const r=b.rings[0];let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of r){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}
  for(let i=Math.floor(x0/cell);i<=Math.floor(x1/cell);i++)for(let j=Math.floor(y0/cell);j<=Math.floor(y1/cell);j++){const k=i+','+j;if(!this.g.has(k))this.g.set(k,[]);this.g.get(k).push(b);}}}
 at(p,skip){for(const b of this.g.get(Math.floor(p[0]/this.cell)+','+Math.floor(p[1]/this.cell))||[])if(!skip.has(b.bin)&&pointInRing(p,b.rings[0]))return b;return null;}}
// The 3D model often stacks roof pieces whose walls share one facade plane; keep only the tallest wall
// where coplanar walls overlap, otherwise their windows z-fight.
export function dedupeCoplanar(W){const keep=[];for(const w of W){let covered=false;for(const o of W){if(o===w||o.y1<w.y1-.01||o.y0>w.y0+.05||(o.y1===w.y1&&W.indexOf(o)>W.indexOf(w)))continue;
  if(o.n[0]*w.n[0]+o.n[1]*w.n[1]<.995)continue;const off=(w.a[0]-o.a[0])*o.n[0]+(w.a[1]-o.a[1])*o.n[1];if(Math.abs(off)>.3)continue;
  const ux=(o.b[0]-o.a[0])/o.len,un=(o.b[1]-o.a[1])/o.len,t0=(w.a[0]-o.a[0])*ux+(w.a[1]-o.a[1])*un,t1=(w.b[0]-o.a[0])*ux+(w.b[1]-o.a[1])*un,lo=Math.max(0,Math.min(t0,t1)),hi=Math.min(o.len,Math.max(t0,t1));
  if(hi-lo>.8*w.len){covered=true;break;}}if(!covered)keep.push(w);}return keep;}
export function classifyWalls(W,index,skip){for(const w of W){const m=[(w.a[0]+w.b[0])/2+w.n[0]*1.2,(w.a[1]+w.b[1])/2+w.n[1]*1.2];let nb=index?index.at(m,w.piece.bin?new Set([w.piece.bin]):skip):null;
  // Ground walls that face back into their own footprint (3D model and footprint disagree) are interior walls.
  if(!nb&&index&&w.y0<1&&w.piece.bin){const own=index.byBin.get(w.piece.bin);if(own&&pointInRing(m,own.rings[0]))nb=own;}
  // Exposed above the neighbour? Then only the part above its roof is a street face.
  w.party=!!nb;w.partyTop=nb?Math.min(w.y1,Math.max(w.y0,(nb.h||0))):w.y0;w.dir=facing(w);}return W;}

// ---- Facade pieces ----
// Punched windows between y0 and y1. o: {mat, trim, pitch, win:[w,h], pair, floor, first, sill, lintel, reveal, margin, parapet, sash}
export function windowWall(P,w,y0,y1,o){const L=w.len,f=w.face,{mat,trim=mat,pitch=3.2,win=[1.3,2],pair=0,floor=3.4,first=.9,sill=1,lintel=0,reveal:reveal_=.2,margin=.8,parapet=.9,sash=0,glass='glass',arch=0,count=0}=o;
 if(y1-y0<.5)return 0;if(L<Math.max(2.2,pitch*.8)){P.rect(mat,f,0,L,y0,y1,0);return 0;}
 // count: the real number of bays on this wall (counted from Street View), spread evenly.
 const nb=count?count:Math.max(1,Math.floor((L-2*margin)/pitch)),pp=count?(L-2*Math.min(margin,.6))/count:pitch,p0=(L-nb*pp)/2,ws=[];
 const ww=pair?win[0]*2+.3:win[0];
 for(let ys=y0+first;ys+win[1]<=y1-Math.min(parapet,(y1-y0)*.3)+.01;ys+=floor)for(let i=0;i<nb;i++){const c=p0+(i+.5)*pp;if(ww>pp-.2)continue;
  if(pair){ws.push([c-ww/2,ys,c-.15,ys+win[1]],[c+.15,ys,c+ww/2,ys+win[1]]);}else ws.push([c-ww/2,ys,c+ww/2,ys+win[1]]);}
 if(arch){const holes=ws.map(([a,b,c,d])=>archHole((a+c)/2,c-a,b,d-(c-a)/2,8));P.poly(mat,f,[[0,y0],[L,y0],[L,y1],[0,y1]],holes,0);
  for(let k=0;k<ws.length;k++){reveal(P,mat,f,holes[k],reveal_,glass);const [u0,v0,u1]=ws[k];if(sill)P.block(trim,f,u0-.08,u1+.08,v0-.12,v0,0,.1,{skip:['left','right','bottom']});}return ws.length;}
 P.poly(mat,f,[[0,y0],[L,y0],[L,y1],[0,y1]],ws.map(([a,b,c,d])=>[[a,b],[c,b],[c,d],[a,d]]),0);
 for(const [u0,v0,u1,v1] of ws){P.recess(mat,f,u0,u1,v0,v1,reveal_,'_none');if(sash)P.panel('sash',f,u0,u1,v0,v1,-reveal_);else P.rect(glass,f,u0,u1,v0,v1,-reveal_);
  if(sill)P.block(trim,f,u0-.08,u1+.08,v0-.12,v0,0,.1,{skip:['left','right','bottom']});if(lintel)P.block(trim,f,u0-.12,u1+.12,v1,v1+lintel,0,.05,{skip:['left','right','bottom']});}
 return ws.length;}
// Johnson and Foster style: deep vertical piers, recessed glass and spandrels between them.
export function pierWall(P,w,y0,y1,{mat,pitch=3,pier=.7,depth=.5,floor=3.6,spandrel=1.0,glass='glass'}){const L=w.len,f=w.face;if(y1-y0<.5)return;
 P.rect(glass,f,0,L,y0,y1,-depth);const n=Math.max(1,Math.round(L/pitch));
 for(let i=0;i<=n;i++){const u=L*i/n;P.block(mat,f,Math.max(0,u-pier/2),Math.min(L,u+pier/2),y0,y1,-depth,0,{skip:['bottom']});}
 for(let y=y0+floor-spandrel;y<y1-.3;y+=floor)P.block(mat,f,0,L,y,Math.min(y1,y+spandrel),-depth,-depth*.35,{skip:['left','right']});}
export function coping(P,w,y,{mat,proj=.2,h=.3}){P.block(mat,w.face,0,w.len,y-h,y,0,proj);}
export function modillions(P,w,y,{mat,proj=.65,h=.7,spacing=.7}){const f=w.face,L=w.len;P.block(mat,f,0,L,y-h*.35,y,0,proj);P.block(mat,f,0,L,y-h,y-h*.35,0,proj*.4,{skip:['left','right']});
 for(let u=spacing/2;u<L;u+=spacing)P.block(mat,f,u-.07,u+.07,y-h*.35-.18,y-h*.35,0,proj*.8,{skip:['top','left','right']});}

// ---- One building ----
// Returns {walls, doors, windows, tris}.
export function buildKit(P,spec,ps,{index=null,bins=new Set([spec.bin])}={}){
 const s={wall:'brickRed',trim:'limestone',floor:3.4,pitch:3.2,win:[1.3,2.0],pair:0,first:.9,style:'punched',cornice:'coping',sash:0,...spec};
 const g={h:4.2,style:'storefront',mat:s.trim,...(spec.ground||{})};
 // storeys: the real number of storeys of the main volume; sets the floor height so the window rows match.
 if(spec.storeys){const top=Math.max(...ps.map(p=>p.z));s.floor=(top-g.h-(s.parapet??.9))/(spec.storeys-1);}const W=classifyWalls(dedupeCoplanar(mergeWalls(walls(ps))),index,bins);
 const dirMax={};for(const w of W)if(!w.party)dirMax[w.dir]=Math.max(dirMax[w.dir]||0,w.len);
 const countFor=w=>{const n=spec.bays?.[w.dir];return n&&!w.party?Math.max(1,Math.round(n*w.len/dirMax[w.dir])):0;};const t0=P.tris;let windows=0;
 const base=spec.base||null;// {to: height, mat}
 for(const w of W){const y0=w.y0,y1=w.y1,top=w.piece.z;
  if(w.party){P.rect(s.partyMat||s.wall,w.face,0,w.len,y0,w.partyTop,0);if(w.partyTop>=y1-.3){continue;}}
  let y=w.party?w.partyTop:y0;
  // Ground storey on street faces that reach the ground.
  if(!w.party&&y0<1&&w.len>2.5&&top>g.h+1){const gh=g.h;
   if(g.style==='storefront')storefront(P,w,0,gh,{wall:g.mat,glass:'glassClear',frames:'frame',pitch:g.pitch||4.2,pier:g.pier||.55});
   else if(g.style==='glass')curtain(P,w,0,gh,{glass:'glassClear',frames:'frame',mw:g.pitch||2,floor:gh});
   else if(g.style==='plain')P.rect(g.mat,w.face,0,w.len,0,gh,0);
   else windows+=windowWall(P,w,0,gh,{arch:g.arch||0,count:g.bays??countFor(w),mat:g.mat,trim:s.trim,pitch:g.pitch||s.pitch,win:g.win||[s.win[0],Math.min(gh-1.3,2.6)],pair:s.pair,floor:gh,first:g.first||1.0,sill:1,parapet:.2,sash:s.sash,margin:s.margin});
   if(g.belt!==0)P.block(s.trim,w.face,0,w.len,gh-.05,gh+.3,0,.12);y=gh;}
  if(s.style==='curtain'){curtain(P,w,y,y1,{glass:'glass',frames:'frame',mw:s.pitch,floor:s.floor,spandrel:s.spandrel||0,spandrelName:s.wall});}
  else if(s.style==='piers'&&!w.party&&w.len>4){pierWall(P,w,y,y1,{mat:s.wall,pitch:s.pitch,floor:s.floor,pier:s.pier||.8,depth:s.depth||.55});}
  else{const opt={count:countFor(w),mat:s.wall,trim:s.trim,pitch:s.pitch,win:s.win,pair:s.pair,floor:s.floor,sill:s.sill??1,lintel:s.lintel||0,sash:s.sash,margin:s.margin,first:s.first,parapet:s.parapet??.9,arch:s.arch||0,reveal:s.reveal??.2};
   if(base&&y<base.to&&!w.party){const bt=Math.min(base.to,y1);windows+=windowWall(P,w,y,bt,{...opt,mat:base.mat,first:y<1?s.first+1:s.first,parapet:.2});if(bt<y1)P.block(s.trim,w.face,0,w.len,bt-.1,bt+.25,0,.15);y=bt;}
   // First upper row: windows start a floor above the ground storey line.
   windows+=windowWall(P,w,y,y1,{...opt,first:y===y0&&y0<1?s.first+(s.raised||0):s.first});}
  // Cornice at the roof line of street faces.
  if(!w.party&&Math.abs(y1-top)<.05&&w.len>3){if(s.cornice==='modillion')modillions(P,w,top,{mat:s.corniceMat||s.trim});else if(s.cornice==='coping')coping(P,w,top,{mat:s.corniceMat||s.trim});else if(s.cornice==='band')P.block(s.corniceMat||s.trim,w.face,0,w.len,top-1.2,top,0,.06);}}
 roofs(P,ps,'roof');
 // Entrances.
 const doors=[];// Entrance walls must face open ground (a street or plaza): nothing built 6 m out from their middle.
 const open=w=>!index||!index.at([(w.a[0]+w.b[0])/2+w.n[0]*6,(w.a[1]+w.b[1])/2+w.n[1]*6],new Set());
 let ranked=W.filter(w=>!w.party&&w.y0<1&&w.len>3&&open(w)).sort((a,b)=>b.len-a.len);if(!ranked.length)ranked=W.filter(w=>!w.party&&w.y0<1&&w.len>3).sort((a,b)=>b.len-a.len);const front=dir=>typeof dir==='number'?ranked[dir]:dir?ranked.find(w=>w.dir===dir):ranked[0];
 for(const d of spec.doors||[]){const w=d.wall||front(d.dir??d.rank??0);if(!w)continue;const u=Math.max(1.2,Math.min(w.len-1.2,(d.at??.5)*w.len)),dw=d.w||2.0,dh=d.h||2.9,f=w.face,y0=d.y||0;
  const fr=d.frame||s.trim;P.block(fr,f,u-dw/2-.25,u-dw/2,y0,y0+dh,0,.22,{skip:['bottom']});P.block(fr,f,u+dw/2,u+dw/2+.25,y0,y0+dh,0,.22,{skip:['bottom']});P.block(fr,f,u-dw/2-.25,u+dw/2+.25,y0+dh,y0+dh+.3,0,.22);
  if(d.canopy)P.block(d.canopyMat||'frame',f,u-dw/2-(d.canopyW||.8),u+dw/2+(d.canopyW||.8),y0+dh+.4,y0+dh+.65,0,d.canopy);
  if(d.steps)for(let k=0;k<d.steps;k++)P.block(s.trim,f,u-dw/2-.4,u+dw/2+.4,0,y0*(k+1)/d.steps,0,.3*(d.steps-k)+.05,{skip:['bottom']});
  const p=f.at(u,y0+dh/2,.2);doors.push({bin:spec.bin,name:spec.name,label:d.label||null,pos:p,normal:f.n,w:dw,h:dh,dir:w.dir});}
 // NYU banners on poles (plain violet cloth, no emblem).
 if(spec.flags){const w=front(spec.flags.dir??spec.doors?.[0]?.dir??spec.doors?.[0]?.rank??0);if(w){const n=spec.flags.n||2,y=spec.flags.y||5.6;for(let k=0;k<n;k++){const u=w.len*(k+1)/(n+1),f=w.face,a=f.at(u,y,0);
  P.cyl('frame',.035,.035,1.5,new T.Matrix4().makeTranslation(a[0]+f.n[0]*.75,a[1]+.9,a[2]+f.n[2]*.75).multiply(new T.Matrix4().makeRotationAxis(new T.Vector3(-f.u[0],0,-f.u[2]).normalize(),Math.PI/2)),5);
  P.panel('flag',new Face(f.at(u,y,1.45),f.n.map(x=>-x),f.v),-1.4,0,-1.7,.85,0);}}}
 const K={P,W,front,ranked,spec:s,doors};spec.extra?.(K);
 return {walls:W,doors,windows,tris:P.tris-t0};}

// ---- Shared materials (browser only) ----
let MATS=null;
export function tier2Materials(){if(MATS)return MATS;const brick=(base,mortar,seed)=>{const t=brickTextures({base,mortar,vary:.1,seed});return new T.MeshStandardMaterial({map:t.map,normalMap:t.normalMap,normalScale:new T.Vector2(.45,.45),roughness:.9});};
 const stone=(base,seed)=>{const t=stoneTextures({base,seed,vary:.05});return new T.MeshStandardMaterial({map:t.map,normalMap:t.normalMap,normalScale:new T.Vector2(.3,.3),roughness:.85});};
 const flat=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.85,...o});
 const sash=new T.MeshStandardMaterial({map:sashTexture({}),roughness:.45,metalness:.2});
 MATS={brickRed:brick('#99503a','#bdb2a4',11),brickOrange:brick('#ad5a3c','#c7b7a6',12),brickBrown:brick('#6f4c3c','#a89b8c',13),brickDark:brick('#5a3a30','#8c8075',14),brickBuff:brick('#c8ad86','#d8cdbb',15),
  brickYellow:brick('#d0b678','#ddd2bb',16),brickWhite:brick('#d6d0c4','#e2ddd2',17),brickPainted:flat(0xd9d2c4,{roughness:.95}),brickPink:brick('#b97b66','#d1c2b3',18),
  limestone:stone('#d5ccb8',3),granite:stone('#9d9890',5),sandstone:stone('#8c5a48',7),brownstone:stone('#6d4c3e',8),terracotta:flat(0xd8c7a8),castIron:flat(0xd3ccbc,{roughness:.6,metalness:.2}),
  concrete:flat(0xc3bdb2,{roughness:.9}),precast:flat(0xcfc8b8,{roughness:.88}),stucco:flat(0xe0d6c2,{roughness:.95}),stuccoYellow:flat(0xd9c38c,{roughness:.95}),stuccoBlue:flat(0x9fb0b5,{roughness:.95}),stuccoPink:flat(0xd4a596,{roughness:.95}),
  glazedRed:flat(0xa33a2c,{roughness:.35}),glazedBlue:flat(0x2f5c8f,{roughness:.35}),glazedYellow:flat(0xd6a531,{roughness:.35}),metalPanel:flat(0x8f9497,{roughness:.45,metalness:.55}),
  glass:new T.MeshStandardMaterial({color:0x2f3a42,roughness:.18,metalness:.55}),glassClear:new T.MeshStandardMaterial({color:0x7d929a,roughness:.1,metalness:.3,transparent:true,opacity:.5,depthWrite:false}),
  frame:flat(0x3a3d3f,{roughness:.5,metalness:.5}),frameLight:flat(0xd7d4cc,{roughness:.6}),sash,roof:flat(0x5f5a52,{roughness:.95}),flag:flat(0x57068c,{side:T.DoubleSide}),gold:flat(0xc9a03a,{roughness:.35,metalness:.8}),iron:flat(0x24262a,{roughness:.55,metalness:.5}),
  slate:flat(0x4c5156,{roughness:.8}),copper:flat(0x6f9c87,{roughness:.6,metalness:.3})};
 for(const m of Object.values(MATS))m.userData.tier2=true;return MATS;}
// Text panels (signs) are the only per-building materials.
export function signMaterial(lines,opt){return new T.MeshStandardMaterial({map:signPanel(lines,opt),roughness:.6});}
