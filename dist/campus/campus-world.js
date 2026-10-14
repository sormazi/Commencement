import * as T from '../vendor/three.module.js';
import {campus} from './campus.js?v=24';
import model3d from './data/campus-3d.js?v=24';
import {archPiers,CURB_HEIGHT} from './collision.js?v=24';
import {ringArea,centroid,rectFrame,rectRing,pointInRing} from './geometry.js?v=24';
import {buildArch} from './landmarks/arch.js?v=24';
import {LANDMARK_BUILDINGS} from './landmarks/index.js?v=24';
import {buildSheds} from './landmarks/sheds.js?v=24';
import {buildUnionSquare,UNION_SQUARE,HANDLED as UNION_STATUES} from './landmarks/union-square.js?v=24';
import {ROW_BINS} from './landmarks/row.js?v=24';
import {buildDecay,treeBoost,volunteerTrees,dryFountain,inSlice,cleanInstanceAttributes,blendInstances,applyDecay,DECAY} from './atmosphere/decay.js?v=24';
import {buildNight} from './atmosphere/night.js?v=24';
import {buildCrowd} from './atmosphere/crowd.js?v=24';
import {buildSpeaker} from './atmosphere/speaker.js?v=24';
import {buildSignage} from './signage.js?v=24';
import {buildStorefronts} from './storefronts.js?v=24';
import {buildSubway} from './subway.js?v=24';
import {bakeGroundAO,patchGroundAO,patchWallAO,AO} from './atmosphere/ao.js?v=24';
import {patchWallPBR,patchGroundPBR} from './atmosphere/pbr.js?v=24';
import {crownGeometry,patchLeaves,FOLIAGE_TIME} from './atmosphere/foliage.js?v=24';
import {treeSize,leafColour,crownShapeGeometry,SHAPES,dayOfYear,limbGeometry,leafless} from './atmosphere/species.js?v=24';
import {treeGroup,treeMaterials,treeLibrary,shrubTexture} from './atmosphere/trees.js?v=24';
// Tree detail by distance from the camera to a tile's edge (metres); quality presets may override (world.treeLod).
export const TREE_LOD={near:70,mid:240};
import {buildGrassField} from './atmosphere/grassfield.js?v=24';
import {patchSnow} from './atmosphere/snow.js?v=24';
import {buildSteam} from './atmosphere/steam.js?v=24';
import {perfOn} from '../perf.js?v=24';
import MARKINGS from './data/street-markings.js?v=24';
import {buildBikeMarkings} from './bike-markings.js?v=24';
import {buildSignals} from './signals.js?v=24';
import {buildFurniture} from './furniture.js?v=24';
import {fountainSchedule} from './atmosphere/fountain-water.js?v=24';
import {buildParkFurniture,buildFences,lawnEdgeChains,boxwoodLayout} from './park-furniture.js?v=24';
import FURNITURE from './data/street-furniture.js?v=24';
import {buildFountain,lampLayout,lampParts,chessLayout,chessParts,furnitureGeometry,furnitureMaterial,chessTopMaterial} from './park.js?v=24';
import {buildTier2,TIER2_BINS} from './tier2/world.js?v=24';
import {classify,facadeCode,materialTile,GENERIC_CODE,tier3Enabled,facadeAtlas,patchFacadeMaterial} from './tier3/facades.js?v=24';
// Free-roam world for Washington Square · NYU. Phase 0: real street/curb/sidewalk/park layout and
// footprint massing at surveyed roof heights, streamed in 120 m tiles. Facade detail comes in Phase 2.
// Second-tier buildings show their kit facades within DETAIL metres and fall back to plain massing beyond.
const TILE=120,VIEW=560,PROP_VIEW=330,DETAIL=260;
const toV=(p,y=0)=>new T.Vector3(p[0],y,-p[1]);
function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
const hash=n=>{const v=Math.sin(n*127.1+31.7)*43758.5453;return v-Math.floor(v);};
// Accumulates triangles for one merged mesh (per tile and material).
class Builder{
 constructor(){this.pos=[];this.nor=[];this.uv=[];this.col=[];this.idx=[];this.fac=[];this.facade=GENERIC_CODE;}
 get count(){return this.pos.length/3;}
 vertex(x,y,z,nx,ny,nz,u,v,c){this.pos.push(x,y,z);this.nor.push(nx,ny,nz);this.uv.push(u,v);this.col.push(c.r,c.g,c.b);this.fac.push(this.facade);return this.count-1;}
 // Vertical wall between map points a and b, outward normal on the right of a->b for CCW rings.
 wall(a,b,y0,y1,c,u0=0,bay=3.2,floor=3.5){const dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn);if(L<.01)return u0;const nx=dn/L,nz=dx/L;
  const i=this.vertex(a[0],y0,-a[1],nx,0,nz,u0/bay,y0/floor,c),j=this.vertex(b[0],y0,-b[1],nx,0,nz,(u0+L)/bay,y0/floor,c),k=this.vertex(b[0],y1,-b[1],nx,0,nz,(u0+L)/bay,y1/floor,c),l=this.vertex(a[0],y1,-a[1],nx,0,nz,u0/bay,y1/floor,c);
  this.idx.push(i,j,k,i,k,l);return u0+L;}
 // Wall with a sloping top (roof edge heights za, zb), from y0 up.
 wallZ(a,b,y0,za,zb,c,u0=0,bay=3.2,floor=3.5){const dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn);if(L<.01||Math.max(za,zb)<=y0+.01)return u0;const nx=dn/L,nz=dx/L;
  const i=this.vertex(a[0],y0,-a[1],nx,0,nz,u0/bay,y0/floor,c),j=this.vertex(b[0],y0,-b[1],nx,0,nz,(u0+L)/bay,y0/floor,c),k=this.vertex(b[0],zb,-b[1],nx,0,nz,(u0+L)/bay,zb/floor,c),l=this.vertex(a[0],za,-a[1],nx,0,nz,u0/bay,za/floor,c);
  this.idx.push(i,j,k,i,k,l);return u0+L;}
 // Cap over a 3D roof polygon (flat [x,n,z,...]); triangulated in plan, facing up.
 capZ(flat,c,uvScale=.2){const pts=[];for(let i=0;i<flat.length;i+=3)pts.push(new T.Vector2(flat[i],flat[i+1]));let faces;try{faces=T.ShapeUtils.triangulateShape(pts,[]);}catch{return;}const base=this.count;
  for(let i=0;i<pts.length;i++)this.vertex(pts[i].x,flat[3*i+2],-pts[i].y,0,1,0,pts[i].x*uvScale,pts[i].y*uvScale,c);
  for(const [a,b,d] of faces){const A=pts[a],B=pts[b],D=pts[d];const cross=(B.x-A.x)*(D.y-A.y)-(B.y-A.y)*(D.x-A.x);if(cross>0)this.idx.push(base+a,base+b,base+d);else this.idx.push(base+a,base+d,base+b);}}
 // Horizontal cap over a polygon with holes, facing up.
 cap(rings,y,c,uvScale=.25){const contour=rings[0].map(p=>new T.Vector2(p[0],p[1])),holes=rings.slice(1).filter(h=>h.length>2).map(h=>h.map(p=>new T.Vector2(p[0],p[1])));let faces;try{faces=T.ShapeUtils.triangulateShape(contour,holes);}catch{return;}const all=[...contour,...holes.flat()],base=this.count;
  for(const p of all)this.vertex(p.x,y,-p.y,0,1,0,p.x*uvScale,p.y*uvScale,c);
  for(const [a,b,d] of faces){const A=all[a],B=all[b],D=all[d];const cross=(B.x-A.x)*(D.y-A.y)-(B.y-A.y)*(D.x-A.x);
   // Viewed from +y with x right and -z (north) up, map orientation is preserved: CCW faces up.
   if(cross>0)this.idx.push(base+a,base+b,base+d);else this.idx.push(base+a,base+d,base+b);}}
 // Closed prism: walls on every ring plus a top cap.
 prism(rings,y0,y1,c,bay,floor){rings.forEach((r,ri)=>{const ccw=ringArea(r)>0,ring=(ri===0)===ccw?r:[...r].reverse();let u=0;for(let i=0;i<ring.length;i++)u=this.wall(ring[i],ring[(i+1)%ring.length],y0,y1,c,u,bay,floor);});this.cap(rings,y1,c);}
 geometry(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.uv,2));g.setAttribute('color',new T.Float32BufferAttribute(this.col,3));g.setAttribute('aFacade',new T.Float32BufferAttribute(this.fac,1));g.setIndex(this.idx);g.computeBoundingSphere();return g;}
}
// Paulson Center (BIN 1090263, completed 2022) postdates the 2014 3D model and its footprint has a single
// height. Heights from CTBUH (skyscrapercenter.com, complex 5988): student tower at the Bleecker St
// (north) end 68.6 m / 16 floors, faculty tower at the Houston St (south) end 91 m / 23 floors; podium of
// six storeys (world-architects.com review). Tower plan shares are estimated from aerial imagery.
const PAULSON={bin:1090263,podium:27,towerN:68.6,towerS:91,northShare:.30,southShare:.25};
function clipHalf(r,ax,an,k,keepAbove){const out=[],f=p=>(p[0]*ax+p[1]*an-k)*(keepAbove?1:-1);for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],fa=f(a),fb=f(b);if(fa>=0)out.push(a);if((fa>=0)!==(fb>=0)){const t=fa/(fa-fb);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;}
export function paulsonMassing(ring){const c=centroid(ring);let sxx=0,sxy=0,syy=0;for(const p of ring){const x=p[0]-c[0],y=p[1]-c[1];sxx+=x*x;sxy+=x*y;syy+=y*y;}const th=.5*Math.atan2(2*sxy,sxx-syy);let ax=Math.cos(th),an=Math.sin(th);if(an<0){ax=-ax;an=-an;}
 const s=ring.map(p=>p[0]*ax+p[1]*an),lo=Math.min(...s),hi=Math.max(...s),L=hi-lo;
 return [{ring,h:PAULSON.podium},{ring:clipHalf(ring,ax,an,hi-L*PAULSON.northShare,true),h:PAULSON.towerN},{ring:clipHalf(ring,ax,an,lo+L*PAULSON.southShare,false),h:PAULSON.towerS}].filter(m=>m.ring.length>=3);}
export class CampusWorld{
 constructor(config){this.config=config;this.freeRoam=true;const c=campus();this.campus=c;this.data=c.data;this.collision=c.collision;this.streets=c.streets;this.spawn=c.spawn;
  this.stats={model:0,extruded:0,estimated:0};this.group=new T.Group();this.group.name='washington-square';this.tiles=new Map();this.disposables=new Set();this.rowBin=ROW_BINS[0];this.rowBins=ROW_BINS;this.tier2Bins=TIER2_BINS;this.build();buildStorefronts(this);this.group.add(buildSubway(this));this.group.add(buildSignage(this));this.applyAO();this.decay=buildDecay(this);this.group.add(this.decay);this.night=buildNight(this);this.group.add(this.night.group);this.night.setNight(false);this.crowd=buildCrowd(this);this.group.add(this.crowd.group);{const q=new URLSearchParams(globalThis.location?.search||'').get('era');const t=q==='2026'||q==null?0:q==='2126'?1:Math.max(0,Math.min(1,+q||0));this.setDecay(t);}this.group.add(buildSpeaker(this));
  // Performance: almost nothing in the world moves, so stop three.js recomputing ~4,000 local matrices every
  // frame (2 to 4 ms of CPU on an M3). The night lamps' lights move, so their group stays live; anything added
  // later keeps automatic updates; the decay layer re-syncs the frozen matrices when the era changes.
  // Performance: 2126-only growth (meadow tufts, ivy) is drawn at zero size in 2026; hide it until the decay
  // layer starts to grow it (32 draws and about 90,000 triangles at the Arch).
  if(perfOn('grow')){const grow=[];this.group.traverse(o=>{if(o.isMesh&&(o.name==='meadow'||o.name==='ivy'))grow.push(o);});const vis=t=>{for(const m of grow)m.visible=t>.002;};vis(DECAY.value);this.decayHooks.push(vis);}
  if(perfOn('matrix'))this.freezeMatrices();}
 freezeMatrices(){const live=this.night?.group,frozen=this.frozen=[];const walk=(o)=>{if(o===live)return;if(o.matrixAutoUpdate){o.updateMatrix();o.matrixAutoUpdate=false;frozen.push(o);}for(const c of o.children)walk(c);};
  for(const c of this.group.children)walk(c);this.group.updateMatrixWorld(true);(this.decayHooks||(this.decayHooks=[])).push(()=>this.touchMatrices());}
 touchMatrices(){for(const o of this.frozen||[]){o.updateMatrix();o.matrixWorldNeedsUpdate=true;}}
 // Manual atmosphere presets fix the lamps and ground fog; Real NYC time sets them continuously through setSky.
 // Baked ambient occlusion (atmosphere/ao.js): ground contact AO from a texture baked over the map, and
 // wall-base AO on every static, non-instanced lit material. Runs before the decay layer, which chains it.
 applyAO(){const d=this.data;this.aoTex=bakeGroundAO(d,{arch:d.arch?.ring});this.disposables.add(this.aoTex);const ground=new Set(),walls=new Set();
  for(const k of ['paving','grass','parkFloor'])ground.add(this.materials[k]);
  this.group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.ownDecay)return;for(const m of [].concat(o.material)){if(!m||!m.isMeshStandardMaterial||m.transparent)continue;
   if(o.userData.kind==='asphalt'||ground.has(m)){ground.add(m);continue;}if(o.userData.kind==='atlas'||/sign|lamp|glow|emissive/i.test(m.name||''))continue;walls.add(m);}});
  for(const m of ground)patchGroundAO(m);for(const m of walls)patchWallAO(m,0);
  // Physically based detail (atmosphere/pbr.js): wall relief and grain by facade material, asphalt on the
  // street plane, concrete flags on slabs and the park floor.
  patchWallPBR(this.materials.wall);patchGroundPBR(this.materials.paving,'sidewalk',2.5);patchGroundPBR(this.materials.parkFloor,'sidewalk',2.5);
  this.group.traverse(o=>{if(o.userData.kind==='asphalt')patchGroundPBR(o.material,'asphalt',4.0);});this.aoStats={ground:ground.size,walls:walls.size};
  // Settling snow (atmosphere/snow.js): pavements, the park floor, lawns and roofs whiten; streets turn to slush; crowns get caps.
  patchSnow(this.materials.paving,'ground',.95);patchSnow(this.materials.parkFloor,'ground',.95);patchSnow(this.materials.grass,'ground',1);patchSnow(this.materials.roof,'roof',1);patchSnow(this.materials.leaves,'leaves',.75);
  {const done=new Set();this.group.traverse(o=>{if(o.userData.kind==='asphalt'&&!done.has(o.material)){done.add(o.material);patchSnow(o.material,'ground',.55,[.55,.56,.57]);}});}
  // Manhole steam on cold days (atmosphere/steam.js), driven by the weather.
  {const st=this.steam=buildSteam(this.data,{groundY:.03});this.group.add(st.mesh);this.disposables.add({dispose:()=>st.dispose()});}
  // Dense grass on the overgrown lawns (atmosphere/grassfield.js); its density comes from the graphics preset.
  {const gf=this.grassField=buildGrassField(this.data,{groundY:CURB_HEIGHT+.01});this.group.add(gf.mesh);this.disposables.add({dispose:()=>gf.dispose()});gf.setLevel(this.grassLevel||'off');}}
 setPreset(p){if(p!=='realtime')this.night?.setNight(p==='night');}
 setSky(lamps,cards,fog){this.night?.setLevels(lamps,cards,fog);this.lampLevel=lamps;if(this.shopUniforms)this.shopUniforms.uNight.value=lamps;for(const im of this.signage?.group.children||[])if(im.userData.lit&&im.material)im.material.emissiveIntensity=1.1*lamps*(1-DECAY.value);this.materials.lamp.emissiveIntensity=1.2*lamps*(1-DECAY.value);}
 // The decay layer (2026 clean <-> 2126 ruin). setDecay jumps; eraTo fades over about a second.
 setDecay(t){this.era=this.eraTarget=t;applyDecay(this,t);}
 eraTo(t,seconds=1){this.eraTarget=Math.max(0,Math.min(1,t));this.eraRate=1/Math.max(.05,seconds);}
 tile(x,n){const i=Math.floor(x/TILE),j=Math.floor(n/TILE),k=i+','+j;let t=this.tiles.get(k);if(!t){t={i,j,center:[(i+.5)*TILE,(j+.5)*TILE],group:new T.Group(),b:{},inst:{}};t.group.name='tile '+k;this.group.add(t.group);this.tiles.set(k,t);}return t;}
 builder(t,name){return t.b[name]||(t.b[name]=new Builder());}
 inst(t,name,p,s=[1,1,1],r=0,color=null,clean=null){(t.inst[name]||(t.inst[name]=[])).push({p,s,r,color,clean});}
 build(){const d=this.data,col=hex=>new T.Color(hex);
  const wallTex=canvasTexture(64,64,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.fillStyle='#ece9e2';g.fillRect(0,h-6,w,6);g.fillStyle='#4b5157';g.fillRect(w*.24,h*.2,w*.52,h*.56);g.fillStyle='#e2ded6';g.fillRect(w*.24,h*.74,w*.52,h*.05);});
  const pavingTex=canvasTexture(128,128,(g,w,h)=>{g.fillStyle='#d8d6d0';g.fillRect(0,0,w,h);g.strokeStyle='rgba(60,60,60,.18)';for(let i=0;i<=w;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}});
  const asphaltTex=canvasTexture(256,256,(g,w,h)=>{g.fillStyle='#55585a';g.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const v=60+hash(i)*60;g.fillStyle=`rgba(${v},${v},${v},.45)`;g.fillRect(hash(i+1)*w,hash(i+2)*h,1.5,1.5);}});
  // Washington Square Park walks (Avi's photo, Oct 2026): hexagonal asphalt paving blocks, about 20 cm across, grey
  // with dark joints and a little variation block to block. 512 px covers 5.6 m (the park floor's uv scale .18).
  const hexTex=canvasTexture(512,512,(g,w,h)=>{g.fillStyle='#4a4b4c';g.fillRect(0,0,w,h);const R=10.4,dx=R*Math.sqrt(3),dy=R*1.5;let k=0;
   for(let row=-1;row*dy<h+R;row++)for(let col=-1;col*dx<w+dx;col++){const cx=col*dx+(row&1?dx/2:0),cy=row*dy;const l=58+hash(k++)*14;g.fillStyle=`hsl(40,3%,${l}%)`;g.beginPath();for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3;g.lineTo(cx+Math.cos(a)*(R-1),cy+Math.sin(a)*(R-1));}g.closePath();g.fill();}});
  // The fountain plaza: smoother light granite slabs in rings, with darker radial bands (Step 4 notes; Avi's photo).
  const plazaTex=canvasTexture(1024,1024,(g,w,h)=>{g.fillStyle='#c9c6be';g.fillRect(0,0,w,h);const c=w/2,S=w/62;for(let i=0;i<3000;i++){g.fillStyle=`rgba(${hash(i)>.5?90:255},${hash(i)>.5?88:255},${hash(i)>.5?84:250},.05)`;g.fillRect(hash(i+1)*w,hash(i+2)*h,3,3);}
   g.strokeStyle='rgba(70,68,64,.28)';g.lineWidth=1.2;for(let r=1.2;r<31;r+=1.2){g.beginPath();g.arc(c,c,r*S,0,Math.PI*2);g.stroke();}
   g.fillStyle='rgba(95,92,86,.35)';for(let i=0;i<16;i++){const a=i*Math.PI/8;g.save();g.translate(c,c);g.rotate(a);g.fillRect(9*S,-.45*S,22*S,.9*S);g.restore();}});
  const grassTex=canvasTexture(128,128,(g,w,h)=>{g.fillStyle='#7f8e5e';g.fillRect(0,0,w,h);for(let i=0;i<1600;i++){g.fillStyle=`hsl(${70+hash(i)*30},${25+hash(i+3)*20}%,${30+hash(i+5)*20}%)`;g.fillRect(hash(i+7)*w,hash(i+9)*h,1,2+hash(i)*3);}});
  this.materials={wall:patchFacadeMaterial(new T.MeshStandardMaterial({map:facadeAtlas(T),vertexColors:true,roughness:.86})),roof:new T.MeshStandardMaterial({vertexColors:true,roughness:.95}),paving:new T.MeshStandardMaterial({map:pavingTex,vertexColors:true,roughness:.9}),grass:new T.MeshStandardMaterial({map:grassTex,vertexColors:true,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),parkFloor:new T.MeshStandardMaterial({map:pavingTex,vertexColors:true,roughness:.92,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),marble:new T.MeshStandardMaterial({color:0xe8e4da,roughness:.6}),iron:new T.MeshStandardMaterial({color:0x1d2124,metalness:.6,roughness:.5}),bark:new T.MeshStandardMaterial({color:0xffffff,roughness:1}),leaves:new T.MeshStandardMaterial({color:0xffffff,roughness:.9,flatShading:true}),stripe:new T.MeshStandardMaterial({color:0xe9e7df,roughness:.7,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),water:new T.MeshStandardMaterial({color:0x2c3a3c,roughness:.25,metalness:.2}),lamp:new T.MeshStandardMaterial({color:0xfff1cf,emissive:0xffd59a,emissiveIntensity:1.2})};
  // Clipped shrubs and hedges: dense leaf texture (atmosphere/trees.js), tinted per plant.
  {const st=shrubTexture();st.repeat.set(2,1);this.materials.shrubLeaf=new T.MeshStandardMaterial({map:st,roughness:.92});this.disposables.add(st);this.disposables.add(this.materials.shrubLeaf);}
  Object.assign(this.materials,{hexPave:new T.MeshStandardMaterial({map:hexTex,vertexColors:true,roughness:.9,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),plazaStone:new T.MeshStandardMaterial({map:plazaTex,vertexColors:true,roughness:.7,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})});for(const k of ['hexPave','plazaStone']){this.disposables.add(this.materials[k]);this.disposables.add(this.materials[k].map);}
  for(const m of Object.values(this.materials)){this.disposables.add(m);if(m.map)this.disposables.add(m.map);}
  blendInstances(this.materials.bark);blendInstances(this.materials.leaves);patchLeaves(this.materials.leaves);
  // Park furniture (park.js): granite for the fountain and chess tables, grey steel street poles, bench slats.
  Object.assign(this.materials,{granite:new T.MeshStandardMaterial({color:0xb9b4aa,roughness:.75}),steel:new T.MeshStandardMaterial({color:0x8d9296,metalness:.5,roughness:.5}),wood:new T.MeshStandardMaterial({color:0x6b4a32,roughness:.85})});
  for(const k of ['granite','steel','wood'])this.disposables.add(this.materials[k]);this.materials.chessTop=chessTopMaterial();for(const m of new Set(this.materials.chessTop)){this.disposables.add(m);if(m.map)this.disposables.add(m.map);}
  // Asphalt everywhere at y=0; blocks and sidewalks are raised by the curb height.
  const B=d.meta.bounds,w=B.maxX-B.minX+600,h=B.maxN-B.minN+600;asphaltTex.repeat.set(w/9,h/9);const ground=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:asphaltTex,color:0x8c8f92,roughness:.88}));ground.rotation.x=-Math.PI/2;ground.position.set((B.minX+B.maxX)/2,0,-(B.minN+B.maxN)/2);ground.receiveShadow=true;ground.userData.noShadow=true;ground.userData.kind='asphalt';this.group.add(ground);this.disposables.add(ground.geometry);this.disposables.add(ground.material);
  // Sidewalk/block slabs: outer outlines only, skipping slabs wholly inside a larger one (park walks).
  // Painted medians (planimetric subtype 360010) are white hatching on the asphalt, not raised islands: they
  // were extruded as sidewalk slabs, which put strips of paving down the middle of Fifth Avenue and other
  // roads. They are drawn as road markings below; only curb medians and traffic islands are raised.
  const raisedMedians=d.median.filter((m,i)=>(d.medianKind?.[i]||'raised')!=='painted');
  // Where a sidewalk and a median or island overlap (59 places in the planimetric data, RESEARCH/roads/sweep.md), their
  // tops z-fought; plazas sit 3 mm and medians 6 mm above the sidewalk so the higher one always wins.
  const slabs=[...d.sidewalk.map(p=>[p,0]),...d.plazas.map(p=>[p,.003]),...raisedMedians.map(p=>[p,.006])].map(([p,dy])=>({rings:[p[0]],dy,area:Math.abs(ringArea(p[0])),c:centroid(p[0])})).sort((a,b)=>b.area-a.area);const kept=[];
  for(const s of slabs){if(kept.some(k=>k.area>s.area&&pointInRing(s.c,k.rings[0])&&s.rings[0].every(p=>pointInRing(p,k.rings[0]))))continue;kept.push(s);const t=this.tile(...s.c);this.builder(t,'paving').prism(s.rings,0,CURB_HEIGHT+s.dy,col(0xbdbab2),3,3);}
  // OSM pedestrian areas (plazas such as Gould Plaza and Astor Place, 31 of them) were never drawn, so they showed as
  // bare asphalt where the planimetric data has no plaza (surface sweep, 14 Oct 2026). Paved to the sidewalk, 2 mm
  // above it where the two overlap; asphalt-surfaced ones in a darker grey.
  for(const a of d.paths){if(!a.area||a.pts.length<3)continue;const r=a.pts,A=Math.abs(ringArea(r));if(A<20)continue;const t=this.tile(...centroid(r));this.builder(t,'paving').prism([r],0,CURB_HEIGHT+.002,col(a.surface==='asphalt'?0x8d8c88:a.surface==='paving_stones'?0xb0a796:0xbdbab2),3,3);}
  const parkRingA=(d.areas.find(a=>a.kind==='park'&&pointInRing([-30,-46],a.ring))||{}).ring;
  // Park surfaces: paved park floor, lawns, dog runs and playgrounds (OSM areas), slightly above the slab.
  const tint={bed:0x4a3b2c,pit:0x463829,flowerbed:0x4f3c2b,shrubbery:0x45382a,park:0xc9c3b6,grass:0xa8b48c,dogrun:0x9b8a6c,playground:0x8c6f62,pitch:0x8b9a7a,plaza:0xcfc9bd,courtyard:0xb7a596};
  for(const a of d.areas){if(a.kind==='fountain')continue;const y=CURB_HEIGHT+(a.kind==='park'?.004:.01),t=this.tile(...centroid(a.ring)),gc=a.kind==='bed'&&parkRingA&&pointInRing(a.ring[0],parkRingA),hx=a.kind==='park'&&a.ring===parkRingA,mat=hx?'hexPave':a.kind==='grass'||a.kind==='pitch'||gc?'grass':'parkFloor';this.builder(t,mat).cap([a.ring],y,col(hx?0xffffff:gc?0x52643c:(tint[a.kind]||0xc9c3b6)),.18);}
  {const fa=parkRingA&&d.areas.find(a=>a.kind==='fountain'&&pointInRing(centroid(a.ring),parkRingA));if(fa){const c=centroid(fa.ring),R=30.5,ring=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2;ring.push([c[0]+Math.cos(a)*R,c[1]+Math.sin(a)*R]);}
   const u=1/62;this.materials.plazaStone.map.offset.set(.5-c[0]*u,.5-c[1]*u);this.builder(this.tile(...c),'plazaStone').cap([ring],CURB_HEIGHT+.007,col(0xd4d4d4),u);}}
  // Planting beds (OSM gardens, flower beds, shrubberies): mulch with shrubs scattered through them, about one
  // every 3 square metres, and in flower beds, from May to October, a low mass of flowers. Tree pits stay bare soil.
  {const qd=(globalThis.location?.search||'').match(/[?&]date=(\d{4}-\d\d-\d\d)/),dy=dayOfYear(qd?new Date(qd[1]+'T12:00:00'):new Date()),bloom=dy>=121&&dy<=300;
   const FLOWERS=[0xd8423a,0xe8b42a,0xd65a9a,0xf0ece0,0x8a5ac8].map(c=>new T.Color(c));
   // In Washington Square Park (Avi's photo, 14 Oct 2026): beds are low ground cover with rows of clipped round
   // boxwoods along their walk sides, not scattered mounds; flower beds keep their flowers.
   const inPk=p=>!!parkRingA&&pointInRing(p,parkRingA);
   for(const b of boxwoodLayout(d.areas,d.trees,{inPark:inPk,pip:(pp,r)=>pointInRing(pp,r)})){const c=new T.Color().setHSL(.29,.42,.13+hash(b.p[0]*.7)*.04);this.inst(this.tile(...b.p),'shrub',toV(b.p,CURB_HEIGHT+.04+b.d*b.y/2),[b.d,b.d*b.y,b.d],hash(b.p[1])*6.3,c.clone().multiplyScalar(2.4));}
   for(const a of d.areas){if(a.kind!=='bed'&&a.kind!=='shrubbery'&&a.kind!=='flowerbed')continue;const r=a.ring;if(a.kind==='bed'&&inPk(r[0]))continue;let x0=1e9,x1=-1e9,n0=1e9,n1=-1e9;for(const p of r){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);n0=Math.min(n0,p[1]);n1=Math.max(n1,p[1]);}
    const A=Math.abs(ringArea(r)),count=Math.min(400,Math.round(A/(a.kind==='shrubbery'?1.6:3)));let k=0,tries=0;
    while(k<count&&tries<count*6){tries++;const sd=a.id*.001+tries*1.618,p=[x0+hash(sd)*(x1-x0),n0+hash(sd+.5)*(n1-n0)];if(!pointInRing(p,r))continue;k++;
     const w=.7+hash(sd+1)*1.1,ht=.45+hash(sd+2)*.8,c=new T.Color().setHSL(.27+hash(sd+3)*.06,.38,.17+hash(sd+4)*.08);
     this.inst(this.tile(...p),'shrub',toV(p,CURB_HEIGHT+.04+ht/2),[w,ht,w*(.8+hash(sd+5)*.4)],hash(sd+6)*6.3,c.clone().multiplyScalar(2.4));
     if(a.kind==='flowerbed'&&bloom)this.inst(this.tile(...p),'crown_oval',toV(p,CURB_HEIGHT+.18),[.6,.3,.6],hash(sd+7)*6.3,FLOWERS[Math.floor(hash(sd+8)*FLOWERS.length)]);}}}
  // Buildings: NYC footprints extruded to their surveyed roof height (Phase 0 massing, no setbacks yet).
  // Detailed landmarks (Phase 2 detail pass) replace the massing of their footprint.
  this.landmarks=[];const covered=new Set(Object.values(LANDMARK_BUILDINGS).flatMap(L=>L.also||[]));for(const b of d.buildings){const L=LANDMARK_BUILDINGS[b.bin];if(!L)continue;const g=L.build(b,{campus:this.campus});this.landmarks.push({bin:b.bin,name:L.name,group:g});this.tile(...centroid(b.rings[0])).group.add(g);this.trackDisposables(g);}
  this.tier2=buildTier2(this);
  for(const b of d.buildings){if(LANDMARK_BUILDINGS[b.bin]||covered.has(b.bin))continue;const h=Math.max(3,b.h||0),t=this.tile(...centroid(b.rings[0])),floors=b.floors&&b.floors>=1?b.floors:Math.max(1,Math.round(h/3.6)),floor=Math.min(5.5,Math.max(2.8,h/floors)),seed=b.bin||h;
   let base=b.nyu?new T.Color().setHSL(.74,.12,.6+hash(seed)*.06):new T.Color().setHSL(.08+hash(seed)*.05,.1+hash(seed+2)*.08,.55+hash(seed+4)*.12),bay=3.1,code=GENERIC_CODE;
   // Third tier (Step 3): material colour and window rhythm from the building's class, age and height.
   if(!b.nyu&&tier3Enabled(b)){const f=classify(b);base=new T.Color(f.color).multiplyScalar(1.22+(hash(seed+9)-.5)*.12);bay=f.bay;code=facadeCode(f)+256*materialTile(f.material);}
   const lod=TIER2_BINS.has(b.bin),wallB=this.builder(t,lod?'wallLod':'wall'),roofB=this.builder(t,lod?'roofLod':'roof'),roofC=base.clone().multiplyScalar(.62),m=model3d[b.bin];
   wallB.facade=code;if(m){this.stats.model++;
    // NYC 3D Building Model (LoD2): every roof piece becomes a prism down to the ground, so setbacks,
    // bulkheads and sloped roofs keep their surveyed shape. Hidden interior faces are acceptable overdraw.
    for(const r of m.roofs){const k=r.length/3;let A=0;for(let i=0;i<k;i++){const j=(i+1)%k;A+=r[3*i]*r[3*j+1]-r[3*j]*r[3*i+1];}if(Math.abs(A)<.4)continue;const ccw=A>0;let u=0;
     for(let s=0;s<k;s++){const i=ccw?s:k-1-s,j=ccw?(s+1)%k:(k-2-s+k)%k;u=wallB.wallZ([r[3*i],r[3*i+1]],[r[3*j],r[3*j+1]],0,r[3*i+2],r[3*j+2],base,u,bay,floor);}
     roofB.capZ(r,roofC);}}
   else if(b.bin===PAULSON.bin){this.stats.estimated++;for(const part of paulsonMassing(b.rings[0])){const r=ringArea(part.ring)>0?part.ring:[...part.ring].reverse();let u=0;for(let i=0;i<r.length;i++)u=wallB.wall(r[i],r[(i+1)%r.length],0,part.h,base,u,3.1,floor);roofB.cap([part.ring],part.h,roofC,.2);}}
   else{this.stats.extruded++;b.rings.forEach((r,ri)=>{const ccw=ringArea(r)>0,ring=(ri===0)===ccw?r:[...r].reverse();let u=0;for(let i=0;i<ring.length;i++)u=wallB.wall(ring[i],ring[(i+1)%ring.length],0,h,base,u,bay,floor);});
   roofB.cap(b.rings,h,roofC,.2);}}
  // Washington Square Arch: full detail model in its own frame (see landmarks/arch.js), on the plaza.
  {const f=rectFrame(d.arch.ring),g=buildArch();g.position.set(f.c[0],CURB_HEIGHT,-f.c[1]);g.rotation.y=Math.atan2(-f.u[1],-f.u[0]);this.archGroup=g;this.tile(...f.c).group.add(g);this.trackDisposables(g);}
  // Sidewalk sheds seen on Street View (street furniture; see landmarks/sheds.js for dates).
  {const g=buildSheds();this.tile(110,-200).group.add(g);this.trackDisposables(g);}
  {const g=buildUnionSquare(CURB_HEIGHT);this.tile(...UNION_SQUARE.washington.p).group.add(g);this.trackDisposables(g);this.unionSquare=g;}
  // Fountain: rim, basin and centre jet. Radius from the OSM outline.
  const parkRing=(d.areas.find(a=>a.kind==='park'&&pointInRing([-30,-46],a.ring))||{}).ring;
  for(const a of d.areas.filter(a=>a.kind==='fountain')){const c=centroid(a.ring),r=a.ring.reduce((s,p)=>s+Math.hypot(p[0]-c[0],p[1]-c[1]),0)/a.ring.length;if(r<2)continue;
   // The Washington Square fountain in detail (park.js); any other fountain keeps the plain basin.
   if(parkRing&&pointInRing(c,parkRing)){const g=buildFountain(r,this.materials);g.position.copy(toV(c,CURB_HEIGHT));this.fountain={c,r,group:g};if(inSlice(c))dryFountain(g,r,x=>{this.disposables.add(x);return x;});for(const m of g.children)this.disposables.add(m.geometry);this.tile(...c).group.add(g);continue;}
   const g=new T.Group();g.position.copy(toV(c,CURB_HEIGHT));
   const rim=new T.Mesh(new T.CylinderGeometry(r,r,.55,72,1,true),this.materials.marble);rim.position.y=.27;const inner=new T.Mesh(new T.CylinderGeometry(r-.45,r-.45,.55,72,1,true),this.materials.marble);inner.position.y=.27;inner.material=this.materials.marble.clone();inner.material.side=T.BackSide;this.disposables.add(inner.material);
   const top=new T.Mesh(new T.RingGeometry(r-.45,r,72),this.materials.marble);top.rotation.x=-Math.PI/2;top.position.y=.55;const basin=new T.Mesh(new T.CircleGeometry(r-.45,72),this.materials.water);basin.rotation.x=-Math.PI/2;basin.position.y=.08;const jet=new T.Mesh(new T.CylinderGeometry(.6,.9,.9,24),this.materials.marble);jet.position.y=.45;
   g.add(rim,inner,top,basin,jet);if(inSlice(c))dryFountain(g,r,x=>{this.disposables.add(x);return x;});for(const m of g.children)this.disposables.add(m.geometry);this.tile(...c).group.add(g);}
  // Trees (NYC Parks Forestry + OSM), lamps, benches, fences and crosswalk bars, instanced per tile.
  // Phase 3 slice: park trees have had a century to grow, and volunteers have seeded in the lawns.
    const vol=volunteerTrees(d,parkRing);if(!this.collision._volunteers){for(const v of vol)this.collision.addCircle(v.p,.55,'tree');this.collision._volunteers=true;}this.volunteers=vol;
    // Each tree in both eras: as surveyed (2026) and after a century of growth (2126); volunteers only in 2126.
    // The instance carries both transforms and the decay layer blends between them (blendInstances).
    // Species (atmosphere/species.js): crown shape, size from DBH, leaf colour for today's date, bark colour.
    const qd=(globalThis.location?.search||'').match(/[?&]date=(\d{4}-\d\d-\d\d)/),day=dayOfYear(qd?new Date(qd[1]+'T12:00:00'):new Date());
    // Real trees (atmosphere/trees.js, 15 Oct 2026): EZ-Tree trunks and branches with leaf cards, per species group,
    // in three levels of detail per tile (near models, lighter middle models, far billboards). Each tree is turned and
    // scaled to its own height and crown width; its leaf colour follows the date (autumn, bare winter, pear blossom).
    const all=[...d.trees,...vol],groups=[...new Set(all.map(tr=>treeGroup(tr.sp)))];
    const TM=this.treeMats=treeMaterials(m=>blendInstances(m)),TL=this.treeLib=treeLibrary(groups);this.disposables.add(TM);this.disposables.add(TL);
    const EG=this._ezGeo={},EM=this._ezMat={},EDepth=this._ezDepth={};
    for(const key of groups){const L=TL.lib[key],M=TM.M[key];L.variants.forEach((v,vi)=>{for(const [lod,m] of [['n',v.near],['m',v.mid]]){EG[`ezb:${key}:${vi}:${lod}`]=m.branches;EM[`ezb:${key}:${vi}:${lod}`]=M.bark;EG[`ezl:${key}:${vi}:${lod}`]=m.leaves;EM[`ezl:${key}:${vi}:${lod}`]=M.leaves;EDepth[`ezl:${key}:${vi}:${lod}`]=M.leafDepth;}});EG['ezf:'+key]=L.far;EM['ezf:'+key]=M.far;}
    for(const tr of all){const bo=treeBoost(tr.p,parkRing)||(tr.volunteer?{height:1.8,crown:2.1,trunk:1.6}:null),D=treeSize(tr,bo),C=tr.volunteer?null:treeSize(tr,null),t=this.tile(...tr.p),y=CURB_HEIGHT,pr=D.p;
     const seed=tr.p[0]*3.7+tr.p[1]*1.3,rot=hash(seed)*6.283,sx=.9+hash(seed+1)*.2,sz=.9+hash(seed+2)*.2,sy=.93+hash(seed+5)*.14;
     const key=treeGroup(tr.sp),V=this.treeLib.lib[key].variants,vi=Math.floor(hash(seed+11)*V.length)%V.length,v=V[vi];
     let tint=leafColour(pr,day,seed);const bare=leafless(day,pr)&&!tr.volunteer,blossom=key==='pear'&&day>=92&&day<=112;if(blossom)tint=new T.Color(.96,.95,.92);
     const bark=new T.Color(1,1,1).multiplyScalar(.88+hash(seed+7)*.22);
     const H=x=>x.cy+x.hgt/2,size=(x,w0)=>[x.w/w0*sx,H(x)*sy,x.w/w0*sz],at=toV(tr.p,y),zero={p:at,s:[0,0,0]};
     for(const [lod,m] of [['n',v.near],['m',v.mid]]){this.inst(t,`ezb:${key}:${vi}:${lod}`,at,size(D,m.width),rot,bark,C?{p:at,s:size(C,m.width)}:zero);
      if(!bare||blossom)this.inst(t,`ezl:${key}:${vi}:${lod}`,at,size(D,m.width),rot,tint,C?{p:at,s:size(C,m.width)}:zero);}
     const ft=bare&&!blossom?new T.Color(.42,.38,.34):tint;this.inst(t,'ezf:'+key,at,[D.w*.9,H(D),D.w*.9],rot,ft,C?{p:at,s:[C.w*.9,H(C),C.w*.9]}:zero);}
  // Lamps: three kinds (park lanterns, plaza globe clusters, street poles); see park.js.
  this.lamps=lampLayout(d,parkRing,this.fountain?.c);for(const L of this.lamps){const t=this.tile(...L.p);for(const [name,p,r] of lampParts(L,CURB_HEIGHT))this.inst(t,name,p,[1,1,1],r);}
  // Chess tables in the south-west corner.
  this.chessTables=chessLayout();for(const c of this.chessTables){const t=this.tile(...c.p);for(const [name,p,r] of chessParts(c,CURB_HEIGHT))this.inst(t,name,p,[1,1,1],r);}
  if(!this.collision._chess){for(const c of this.chessTables)this.collision.addCircle(c.p,.6,'chess table');this.collision._chess=true;}
  // Benches, granite benches, litter baskets and drinking fountains (park-furniture.js); every bench is a seat.
  {const pf=this.parkFurniture=buildParkFurniture(d,{groundY:CURB_HEIGHT,materials:this.materials});this.group.add(pf.group);this.seats=pf.seats;this.disposables.add({dispose:()=>pf.dispose()});
   if(!this.collision._parkFurniture){for(const b of pf.benches){const h=b.len/2,c=[b.p[0]-b.f[0]*.05,b.p[1]-b.f[1]*.05];this.collision.addSegment([c[0]-b.u[0]*h,c[1]-b.u[1]*h],[c[0]+b.u[0]*h,c[1]+b.u[1]*h],'bench',.25);}
    for(const g of pf.granites){const h=g.len/2;this.collision.addSegment([g.p[0]-g.u[0]*h,g.p[1]-g.u[1]*h],[g.p[0]+g.u[0]*h,g.p[1]+g.u[1]*h],'bench',.27);}
    for(const m of pf.baskets)this.collision.addCircle(m.p,.3,'litter basket');for(const m of pf.fountains)this.collision.addCircle(m.p,.3,'drinking fountain');this.collision._parkFurniture=true;}}
  // Fences, railings and hedges in their real styles (park-furniture.js); walls stay marble segments below.
  {const pipR=(pp,r)=>pointInRing(pp,r),inPk=pp=>!!parkRing&&pointInRing(pp,parkRing);this.lawnChains=lawnEdgeChains(d.areas,{inPark:inPk,pip:pipR});const fe=this.fences=buildFences([...d.barriers,...this.lawnChains],{groundY:CURB_HEIGHT,inPark:p=>!!parkRing&&pointInRing(p,parkRing),materials:this.materials});this.group.add(fe.group);this.disposables.add({dispose:()=>fe.dispose()});}
  for(const br of d.barriers){if(br.kind!=='wall')continue;const ht=br.height||(br.kind==='wall'?1.2:1.0);for(let i=1;i<br.pts.length;i++){const a=br.pts[i-1],b=br.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.05)continue;const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];this.inst(this.tile(...m),br.kind==='wall'?'wallseg':'fence',toV(m,CURB_HEIGHT+ht/2),[L,ht,br.kind==='wall'?.3:.05],Math.atan2(b[1]-a[1],b[0]-a[0]));}}
  // Painted medians: a white outline and diagonal hatching at 45 degrees to the median's long axis, 2.4 m apart.
  d.median.forEach((m,mi)=>{if(d.medianKind?.[mi]!=='painted')return;const r=m[0];for(const [a,b,w] of paintedMedianStripes(r)){const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.15)continue;const p=[(a[0]+b[0])/2,(a[1]+b[1])/2];this.inst(this.tile(...p),'stripe',toV(p,.013),[L,1,w],Math.atan2(b[1]-a[1],b[0]-a[0]));}});
  // Traffic and pedestrian signals on their corner poles (signals.js).
  {const sg=this.signals=buildSignals(MARKINGS.poles||[],{groundY:CURB_HEIGHT,steel:this.materials.steel});this.group.add(sg.group);if(!this.collision._signals){for(const p of MARKINGS.poles||[])this.collision.addCircle([p[0],p[1]],.15,'signal pole');this.collision._signals=true;}}
  // Street furniture at surveyed positions: curb ramps, hydrants, parking signs, bus stops, Citi Bike (furniture.js).
  {const fu=this.furniture=buildFurniture(FURNITURE,{groundY:CURB_HEIGHT});this.group.add(fu.group);this.disposables.add({dispose:()=>fu.dispose()});(this.decayHooks||(this.decayHooks=[])).push(t=>fu.setDecay(t));}
  // Lane markings (tools/build-markings.mjs): centre lines, lane lines, bike and bus lanes, stop lines.
  // Bike stencils and delineators (bike-markings.js).
  {const bm=buildBikeMarkings(MARKINGS,{groundY:0});this.group.add(bm.group);this.disposables.add({dispose:()=>bm.dispose()});if(!this.collision._delineators){for(const p of MARKINGS.posts||[])this.collision.addCircle(p,.1,'delineator');this.collision._delineators=true;}}
  {const COL=[null,new T.Color(1,.74,.16),new T.Color(.26,.62,.34),new T.Color(.62,.12,.1)];for(const [x,n,L,W,a,c] of MARKINGS.stripes){const p=[x,n];this.inst(this.tile(...p),'stripe',toV(p,c>=2?.011:.013),[L,1,W],a,COL[c]);}}
  // Crosswalks by their OSM marking (crossing:markings): bars across the walk for 'zebra' and the city's usual
  // high-visibility pattern; bars between two edge lines for 'ladder'; two lines only for 'lines'; nothing where
  // OSM says the crossing is unmarked. NYC dimensions: 2 ft (0.6 m) bars on 4 ft (1.2 m) centres, about 10 ft
  // (3 m) long, 8 in (0.2 m) edge lines.
  for(const c of d.crossings){if(c.pts.length<2||c.marking==='no'||c.marking==='unmarked')continue;const bars=c.marking!=='lines',edges=c.marking==='ladder'||c.marking==='lines';
   for(let i=1;i<c.pts.length;i++){const a=c.pts[i-1],b=c.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.3)continue;const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
    if(bars)for(let s=.6;s<L-.3;s+=1.2){const p=[a[0]+(b[0]-a[0])*s/L,a[1]+(b[1]-a[1])*s/L];this.inst(this.tile(...p),'stripe',toV(p,.012),[.6,1,3.0],ang);}
    if(edges){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],nx=-(b[1]-a[1])/L,nn=(b[0]-a[0])/L;for(const o of [-1.6,1.6]){const p=[m[0]+nx*o,m[1]+nn*o];this.inst(this.tile(...p),'stripe',toV(p,.012),[L,1,.2],ang);}}}}
  for(const m of d.monuments){if(/plaque/.test(m.kind)||m.kind==='memorial'&&!m.name||UNION_STATUES.test(m.name||''))continue;const t=this.tile(...m.p);if(m.kind==='flagpole')this.inst(t,'flagpole',toV(m.p,CURB_HEIGHT+11),[1,1,1]);else this.inst(t,'pedestal',toV(m.p,CURB_HEIGHT+1),/Garibaldi/.test(m.name||'')?[3,2,2.4]:[1.6,2,1.6]);}
  const geo={trunk:new T.CylinderGeometry(.7,1,1,7),crown:crownGeometry(),limb:limbGeometry(),...Object.fromEntries(SHAPES.map(k=>['crown_'+k,crownShapeGeometry(k)])),pole:new T.CylinderGeometry(.07,.11,4.4,8),lantern:new T.BoxGeometry(.42,.55,.42),bench:new T.BoxGeometry(1.8,.12,.55),fence:new T.BoxGeometry(1,1,1),wallseg:new T.BoxGeometry(1,1,1),stripe:new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),flagpole:new T.CylinderGeometry(.08,.16,22,8),pedestal:new T.BoxGeometry(1,1,1)};
  const furn=furnitureGeometry();Object.assign(geo,furn);{const sg=new T.IcosahedronGeometry(.5,3),p=sg.attributes.position,uv=new Float32Array(p.count*2),v=new T.Vector3();for(let k=0;k<p.count;k++){v.fromBufferAttribute(p,k);const r=1+.04*Math.sin(v.x*41+v.y*37)*Math.sin(v.z*29);p.setXYZ(k,v.x*r,v.y*r,v.z*r);uv[k*2]=Math.atan2(v.z,v.x)/(2*Math.PI)+.5;uv[k*2+1]=v.y+.5;}sg.setAttribute('uv',new T.BufferAttribute(uv,2));sg.computeVertexNormals();geo.shrub=sg;}
  const instMat={trunk:'bark',limb:'bark',crown:'leaves',...Object.fromEntries(SHAPES.map(k=>['crown_'+k,'leaves'])),pole:'iron',lantern:'lamp',bench:'iron',fence:'iron',wallseg:'marble',stripe:'stripe',flagpole:'iron',pedestal:'marble',shrub:'shrubLeaf'};for(const k of Object.keys(furn))instMat[k]=furnitureMaterial(k);for(const g of Object.values(geo))this.disposables.add(g);
  const o3=new T.Object3D(),mats=this.materials,WHITE=new T.Color(1,1,1);
  for(const t of this.tiles.values()){
   for(const [name,b] of Object.entries(t.b)){if(!b.idx.length)continue;const m=new T.Mesh(b.geometry(),name.startsWith('wall')?mats.wall:name.startsWith('roof')?mats.roof:name==='grass'?mats.grass:name==='parkFloor'?mats.parkFloor:name==='hexPave'?mats.hexPave:name==='plazaStone'?mats.plazaStone:name==='arch'?mats.marble:mats.paving);m.castShadow=name.startsWith('wall')||name==='arch';m.receiveShadow=true;m.userData.kind=name;if(name.endsWith('Lod'))(t.lod||(t.lod=[])).push(m);this.disposables.add(m.geometry);t.group.add(m);}
   t.props=new T.Group();t.group.add(t.props);
   for(const [name,list] of Object.entries(t.inst)){const G=geo[name]||this._ezGeo?.[name],MT=mats[instMat[name]]||this._ezMat?.[name];const im=new T.InstancedMesh(G,MT,list.length);im.name=name;const anyColor=list.some(it=>it.color);list.forEach((it,k)=>{o3.position.copy(it.p);o3.rotation.set(0,it.r,0);o3.scale.set(...it.s);o3.updateMatrix();im.setMatrixAt(k,o3.matrix);if(it.color)im.setColorAt(k,it.color);else if(anyColor)im.setColorAt(k,WHITE);});if(list.some(it=>it.clean)){const A=new Float32Array(list.length*16);list.forEach((it,k)=>{const c=it.clean||it;o3.position.copy(c.p);o3.rotation.set(0,it.r,0);o3.scale.set(...c.s);o3.updateMatrix();o3.matrix.toArray(A,k*16);});im.geometry=cleanInstanceAttributes(G.clone(),A);this.disposables.add(im.geometry);im.customDepthMaterial=this._ezDepth?.[name]||this.treeDepth||(this.treeDepth=blendInstances(new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking})));}im.castShadow=name==='shrub'||name==='trunk'||name==='limb'||/^crown/.test(name)||/^ez[bl]:/.test(name)||/Pole$|^pole$|chessTop|chessBase/.test(name);im.receiveShadow=name!=='stripe';im.computeBoundingSphere();
    // Trees by level of detail: each tile keeps near models, middle models and far billboards, shown by distance.
    const lodG=/^ez[bl]:.*:n$/.test(name)?(t.treeNear||(t.treeNear=new T.Group())):/^ez[bl]:.*:m$/.test(name)?(t.treeMid||(t.treeMid=new T.Group())):/^ezf:/.test(name)?(t.treeFar||(t.treeFar=new T.Group())):null;
    if(lodG){lodG.add(im);if(!lodG.parent)t.group.add(lodG);}else (name==='stripe'?t.group:t.props).add(im);}
   delete t.b;delete t.inst;}
 }
 update(state,time,camera){this.signals?.update(time,DECAY.value>.5);
  // The fountain runs on its real schedule in real NYC time; with a manual light preset, by day in its season.
  {const fw=this.fountain?.group.userData.water;if(fw){let want;if(this.nyTime)want=fountainSchedule(this.nyTime);else{const n=new Date(),q=(globalThis.location?.search||'').match(/[?&]date=(\d{4})-(\d\d)-(\d\d)/);want=fountainSchedule({m:q?+q[2]:n.getMonth()+1,d:q?+q[3]:n.getDate(),hh:12,mm:0})&&(this.lampLevel??0)<.35;}fw.tick(time,want,DECAY.value);}}if(this.decayUniforms)this.decayUniforms.uTime.value=time;FOLIAGE_TIME.value=time;this.grassField?.update();if(this.eraTarget!==undefined&&this.era!==this.eraTarget){const dt=Math.min(.1,Math.max(0,time-(this.eraClock??time)));const d=this.eraTarget-this.era,k=Math.min(Math.abs(d),dt*(this.eraRate||1));this.era+=Math.sign(d)*k;applyDecay(this,this.era*this.era*(3-2*this.era));}this.eraClock=time;if(camera)this.night?.update(time,camera);this.crowd?.update(state,time);const x=camera?camera.position.x:state?.position?.x||0,n=camera?-camera.position.z:state?.position?.z||0;this.visibleTiles=0;for(const t of this.tiles.values()){const dx=Math.max(Math.abs(t.center[0]-x)-TILE/2,0),dn=Math.max(Math.abs(t.center[1]-n)-TILE/2,0),d=Math.hypot(dx,dn);t.group.visible=d<(this.viewDistance||VIEW);if(t.tier2Group){const near=d<DETAIL;t.tier2Group.visible=near;if(t.lod)for(const m of t.lod)m.visible=!near;}if(t.props)t.props.visible=d<PROP_VIEW;{const L=this.treeLod||TREE_LOD;if(t.treeNear)t.treeNear.visible=d<L.near;if(t.treeMid)t.treeMid.visible=d>=L.near&&d<L.mid;if(t.treeFar)t.treeFar.visible=d>=L.mid;}if(t.group.visible)this.visibleTiles++;}}
 trackDisposables(g){g.traverse(o=>{if(o.geometry)this.disposables.add(o.geometry);});for(const m of g.userData.materials||[]){this.disposables.add(m);for(const k of ['map','normalMap'])if(m[k])this.disposables.add(m[k]);}}
 dispose(){for(const d of this.disposables)d.dispose?.();this.disposables.clear();}
}

// Road marking lines for one painted median ring: its outline (15 cm) and 30 cm hatch lines across it.
export function paintedMedianStripes(r){const out=[];const n=r.length;for(let i=0;i<n;i++){const a=r[i],b=r[(i+1)%n];out.push([a,b,.15]);}
 let cx=0,cn=0;for(const p of r){cx+=p[0];cn+=p[1];}cx/=n;cn/=n;let sxx=0,sxy=0,syy=0;for(const p of r){const x=p[0]-cx,y=p[1]-cn;sxx+=x*x;sxy+=x*y;syy+=y*y;}
 const th=.5*Math.atan2(2*sxy,sxx-syy)+Math.PI/4,ux=Math.cos(th),un=Math.sin(th),vx=-un,vn=ux;// hatch lines run along u, stepped along v
 let vmin=1e9,vmax=-1e9;for(const p of r){const v=(p[0]-cx)*vx+(p[1]-cn)*vn;vmin=Math.min(vmin,v);vmax=Math.max(vmax,v);}
 for(let v=vmin+1.2;v<vmax;v+=2.4){const hits=[];for(let i=0;i<n;i++){const a=r[i],b=r[(i+1)%n];const va=(a[0]-cx)*vx+(a[1]-cn)*vn,vb=(b[0]-cx)*vx+(b[1]-cn)*vn;if((va<v)===(vb<v))continue;const t=(v-va)/(vb-va);hits.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
  hits.sort((p,q)=>((p[0]-cx)*ux+(p[1]-cn)*un)-((q[0]-cx)*ux+(q[1]-cn)*un));for(let k=0;k+1<hits.length;k+=2)out.push([hits[k],hits[k+1],.3]);}
 return out;}
