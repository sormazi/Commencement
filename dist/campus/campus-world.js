import * as T from '../vendor/three.module.js';
import {campus} from './campus.js?v=17';
import {archPiers,CURB_HEIGHT} from './collision.js?v=17';
import {ringArea,centroid,rectFrame,rectRing,pointInRing} from './geometry.js?v=17';
// Free-roam world for Washington Square · NYU. Phase 0: real street/curb/sidewalk/park layout and
// footprint massing at surveyed roof heights, streamed in 120 m tiles. Facade detail comes in Phase 2.
const TILE=120,VIEW=560,PROP_VIEW=330;
const toV=(p,y=0)=>new T.Vector3(p[0],y,-p[1]);
function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
const hash=n=>{const v=Math.sin(n*127.1+31.7)*43758.5453;return v-Math.floor(v);};
// Accumulates triangles for one merged mesh (per tile and material).
class Builder{
 constructor(){this.pos=[];this.nor=[];this.uv=[];this.col=[];this.idx=[];}
 get count(){return this.pos.length/3;}
 vertex(x,y,z,nx,ny,nz,u,v,c){this.pos.push(x,y,z);this.nor.push(nx,ny,nz);this.uv.push(u,v);this.col.push(c.r,c.g,c.b);return this.count-1;}
 // Vertical wall between map points a and b, outward normal on the right of a->b for CCW rings.
 wall(a,b,y0,y1,c,u0=0,bay=3.2,floor=3.5){const dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn);if(L<.01)return u0;const nx=dn/L,nz=dx/L;
  const i=this.vertex(a[0],y0,-a[1],nx,0,nz,u0/bay,y0/floor,c),j=this.vertex(b[0],y0,-b[1],nx,0,nz,(u0+L)/bay,y0/floor,c),k=this.vertex(b[0],y1,-b[1],nx,0,nz,(u0+L)/bay,y1/floor,c),l=this.vertex(a[0],y1,-a[1],nx,0,nz,u0/bay,y1/floor,c);
  this.idx.push(i,j,k,i,k,l);return u0+L;}
 // Horizontal cap over a polygon with holes, facing up.
 cap(rings,y,c,uvScale=.25){const contour=rings[0].map(p=>new T.Vector2(p[0],p[1])),holes=rings.slice(1).filter(h=>h.length>2).map(h=>h.map(p=>new T.Vector2(p[0],p[1])));let faces;try{faces=T.ShapeUtils.triangulateShape(contour,holes);}catch{return;}const all=[...contour,...holes.flat()],base=this.count;
  for(const p of all)this.vertex(p.x,y,-p.y,0,1,0,p.x*uvScale,p.y*uvScale,c);
  for(const [a,b,d] of faces){const A=all[a],B=all[b],D=all[d];const cross=(B.x-A.x)*(D.y-A.y)-(B.y-A.y)*(D.x-A.x);
   // Viewed from +y with x right and -z (north) up, map orientation is preserved: CCW faces up.
   if(cross>0)this.idx.push(base+a,base+b,base+d);else this.idx.push(base+a,base+d,base+b);}}
 // Closed prism: walls on every ring plus a top cap.
 prism(rings,y0,y1,c,bay,floor){rings.forEach((r,ri)=>{const ccw=ringArea(r)>0,ring=(ri===0)===ccw?r:[...r].reverse();let u=0;for(let i=0;i<ring.length;i++)u=this.wall(ring[i],ring[(i+1)%ring.length],y0,y1,c,u,bay,floor);});this.cap(rings,y1,c);}
 geometry(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.uv,2));g.setAttribute('color',new T.Float32BufferAttribute(this.col,3));g.setIndex(this.idx);g.computeBoundingSphere();return g;}
}
export class CampusWorld{
 constructor(config){this.config=config;this.freeRoam=true;const c=campus();this.campus=c;this.data=c.data;this.collision=c.collision;this.streets=c.streets;this.spawn=c.spawn;
  this.group=new T.Group();this.group.name='washington-square';this.tiles=new Map();this.disposables=new Set();this.build();}
 tile(x,n){const i=Math.floor(x/TILE),j=Math.floor(n/TILE),k=i+','+j;let t=this.tiles.get(k);if(!t){t={i,j,center:[(i+.5)*TILE,(j+.5)*TILE],group:new T.Group(),b:{},inst:{}};t.group.name='tile '+k;this.group.add(t.group);this.tiles.set(k,t);}return t;}
 builder(t,name){return t.b[name]||(t.b[name]=new Builder());}
 inst(t,name,p,s=[1,1,1],r=0,color=null){(t.inst[name]||(t.inst[name]=[])).push({p,s,r,color});}
 build(){const d=this.data,col=hex=>new T.Color(hex);
  const wallTex=canvasTexture(64,64,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.fillStyle='#ece9e2';g.fillRect(0,h-6,w,6);g.fillStyle='#4b5157';g.fillRect(w*.24,h*.2,w*.52,h*.56);g.fillStyle='#e2ded6';g.fillRect(w*.24,h*.74,w*.52,h*.05);});
  const pavingTex=canvasTexture(128,128,(g,w,h)=>{g.fillStyle='#d8d6d0';g.fillRect(0,0,w,h);g.strokeStyle='rgba(60,60,60,.18)';for(let i=0;i<=w;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}});
  const asphaltTex=canvasTexture(256,256,(g,w,h)=>{g.fillStyle='#55585a';g.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const v=60+hash(i)*60;g.fillStyle=`rgba(${v},${v},${v},.45)`;g.fillRect(hash(i+1)*w,hash(i+2)*h,1.5,1.5);}});
  const grassTex=canvasTexture(128,128,(g,w,h)=>{g.fillStyle='#7f8e5e';g.fillRect(0,0,w,h);for(let i=0;i<1600;i++){g.fillStyle=`hsl(${70+hash(i)*30},${25+hash(i+3)*20}%,${30+hash(i+5)*20}%)`;g.fillRect(hash(i+7)*w,hash(i+9)*h,1,2+hash(i)*3);}});
  this.materials={wall:new T.MeshStandardMaterial({map:wallTex,vertexColors:true,roughness:.86}),roof:new T.MeshStandardMaterial({vertexColors:true,roughness:.95}),paving:new T.MeshStandardMaterial({map:pavingTex,vertexColors:true,roughness:.9}),grass:new T.MeshStandardMaterial({map:grassTex,vertexColors:true,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),parkFloor:new T.MeshStandardMaterial({map:pavingTex,vertexColors:true,roughness:.92,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),marble:new T.MeshStandardMaterial({color:0xe8e4da,roughness:.6}),iron:new T.MeshStandardMaterial({color:0x1d2124,metalness:.6,roughness:.5}),bark:new T.MeshStandardMaterial({color:0x4d4436,roughness:1}),leaves:new T.MeshStandardMaterial({color:0xffffff,roughness:.9,flatShading:true}),stripe:new T.MeshStandardMaterial({color:0xe9e7df,roughness:.7,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),water:new T.MeshStandardMaterial({color:0x2c3a3c,roughness:.25,metalness:.2}),lamp:new T.MeshStandardMaterial({color:0xfff1cf,emissive:0xffd59a,emissiveIntensity:1.2})};
  for(const m of Object.values(this.materials)){this.disposables.add(m);if(m.map)this.disposables.add(m.map);}
  // Asphalt everywhere at y=0; blocks and sidewalks are raised by the curb height.
  const B=d.meta.bounds,w=B.maxX-B.minX+600,h=B.maxN-B.minN+600;asphaltTex.repeat.set(w/9,h/9);const ground=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:asphaltTex,color:0x8c8f92,roughness:.88}));ground.rotation.x=-Math.PI/2;ground.position.set((B.minX+B.maxX)/2,0,-(B.minN+B.maxN)/2);ground.receiveShadow=true;ground.userData.noShadow=true;this.group.add(ground);this.disposables.add(ground.geometry);this.disposables.add(ground.material);
  // Sidewalk/block slabs: outer outlines only, skipping slabs wholly inside a larger one (park walks).
  const slabs=[...d.sidewalk,...d.plazas,...d.median].map(p=>({rings:[p[0]],area:Math.abs(ringArea(p[0])),c:centroid(p[0])})).sort((a,b)=>b.area-a.area);const kept=[];
  for(const s of slabs){if(kept.some(k=>k.area>s.area&&pointInRing(s.c,k.rings[0])&&s.rings[0].every(p=>pointInRing(p,k.rings[0]))))continue;kept.push(s);const t=this.tile(...s.c);this.builder(t,'paving').prism(s.rings,0,CURB_HEIGHT,col(0xbdbab2),3,3);}
  // Park surfaces: paved park floor, lawns, dog runs and playgrounds (OSM areas), slightly above the slab.
  const tint={park:0xc9c3b6,grass:0xa8b48c,dogrun:0x9b8a6c,playground:0x8c6f62,pitch:0x8b9a7a,plaza:0xcfc9bd,courtyard:0xb7a596};
  for(const a of d.areas){if(a.kind==='fountain')continue;const y=CURB_HEIGHT+(a.kind==='park'?.004:.01),t=this.tile(...centroid(a.ring)),mat=a.kind==='grass'||a.kind==='pitch'?'grass':'parkFloor';this.builder(t,mat).cap([a.ring],y,col(tint[a.kind]||0xc9c3b6),.18);}
  // Buildings: NYC footprints extruded to their surveyed roof height (Phase 0 massing, no setbacks yet).
  for(const b of d.buildings){const h=Math.max(3,b.h||0),t=this.tile(...centroid(b.rings[0])),floors=b.floors&&b.floors>=1?b.floors:Math.max(1,Math.round(h/3.6)),floor=Math.min(5.5,Math.max(2.8,h/floors)),seed=b.bin||h;
   const base=b.nyu?new T.Color().setHSL(.74,.12,.6+hash(seed)*.06):new T.Color().setHSL(.08+hash(seed)*.05,.1+hash(seed+2)*.08,.55+hash(seed+4)*.12);
   const wallB=this.builder(t,'wall');b.rings.forEach((r,ri)=>{const ccw=ringArea(r)>0,ring=(ri===0)===ccw?r:[...r].reverse();let u=0;for(let i=0;i<ring.length;i++)u=wallB.wall(ring[i],ring[(i+1)%ring.length],0,h,base,u,3.1,floor);});
   this.builder(t,'roof').cap(b.rings,h,base.clone().multiplyScalar(.62),.2);}
  // Washington Square Arch: two piers and the attic over the 30 ft opening (Phase 0 massing).
  const archT=this.tile(0,0),archB=this.builder(archT,'arch'),white=col(0xffffff),f=rectFrame(d.arch.ring),o=d.arch.openingWidth/2;
  for(const p of archPiers(d.arch))archB.prism([p],0,d.arch.height,white,2,2);archB.prism([rectRing(f,-o,o,-f.halfShort,f.halfShort)],14.33,d.arch.height,white,2,2);
  // Fountain: rim, basin and centre jet. Radius from the OSM outline.
  for(const a of d.areas.filter(a=>a.kind==='fountain')){const c=centroid(a.ring),r=a.ring.reduce((s,p)=>s+Math.hypot(p[0]-c[0],p[1]-c[1]),0)/a.ring.length;if(r<2)continue;const g=new T.Group();g.position.copy(toV(c,CURB_HEIGHT));
   const rim=new T.Mesh(new T.CylinderGeometry(r,r,.55,72,1,true),this.materials.marble);rim.position.y=.27;const inner=new T.Mesh(new T.CylinderGeometry(r-.45,r-.45,.55,72,1,true),this.materials.marble);inner.position.y=.27;inner.material=this.materials.marble.clone();inner.material.side=T.BackSide;this.disposables.add(inner.material);
   const top=new T.Mesh(new T.RingGeometry(r-.45,r,72),this.materials.marble);top.rotation.x=-Math.PI/2;top.position.y=.55;const basin=new T.Mesh(new T.CircleGeometry(r-.45,72),this.materials.water);basin.rotation.x=-Math.PI/2;basin.position.y=.08;const jet=new T.Mesh(new T.CylinderGeometry(.6,.9,.9,24),this.materials.marble);jet.position.y=.45;
   g.add(rim,inner,top,basin,jet);for(const m of g.children)this.disposables.add(m.geometry);this.tile(...c).group.add(g);}
  // Trees (NYC Parks Forestry + OSM), lamps, benches, fences and crosswalk bars, instanced per tile.
  for(const tr of d.trees){const dbh=tr.dbh||8,height=tr.landmark?24:Math.min(24,5+dbh*.42),crown=tr.landmark?9:Math.min(7.5,1.6+dbh*.16),t=this.tile(...tr.p),y=CURB_HEIGHT;this.inst(t,'trunk',toV(tr.p,y+height*.3),[Math.max(.18,dbh*.0254/2),height*.6,Math.max(.18,dbh*.0254/2)]);const tint=new T.Color().setHSL(.22+hash(tr.p[0])*.08,.32,.24+hash(tr.p[1])*.1);this.inst(t,'crown',toV(tr.p,y+height*.68),[crown,crown*.85,crown],hash(tr.p[0]+tr.p[1])*6,tint);}
  for(const l of d.lamps){const t=this.tile(...l.p);this.inst(t,'pole',toV(l.p,CURB_HEIGHT+2.2),[1,1,1]);this.inst(t,'lantern',toV(l.p,CURB_HEIGHT+4.45),[1,1,1]);}
  for(const b of d.benches){const t=this.tile(...b.p);this.inst(t,'bench',toV(b.p,CURB_HEIGHT+.45),[1,1,1],hash(b.p[0]*3.1)*0);}
  for(const br of d.barriers){if(br.kind==='retaining_wall')continue;const ht=br.height||(br.kind==='wall'?1.2:1.0);for(let i=1;i<br.pts.length;i++){const a=br.pts[i-1],b=br.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.05)continue;const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];this.inst(this.tile(...m),br.kind==='wall'?'wallseg':'fence',toV(m,CURB_HEIGHT+ht/2),[L,ht,br.kind==='wall'?.3:.05],Math.atan2(b[1]-a[1],b[0]-a[0]));}}
  for(const c of d.crossings){if(c.pts.length<2)continue;for(let i=1;i<c.pts.length;i++){const a=c.pts[i-1],b=c.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);for(let s=.6;s<L-.3;s+=1.2){const p=[a[0]+(b[0]-a[0])*s/L,a[1]+(b[1]-a[1])*s/L];this.inst(this.tile(...p),'stripe',toV(p,.012),[.6,1,3.0],ang);}}}
  for(const m of d.monuments){if(/plaque/.test(m.kind)||m.kind==='memorial'&&!m.name)continue;const t=this.tile(...m.p);if(m.kind==='flagpole')this.inst(t,'flagpole',toV(m.p,CURB_HEIGHT+11),[1,1,1]);else this.inst(t,'pedestal',toV(m.p,CURB_HEIGHT+1),/Garibaldi/.test(m.name||'')?[3,2,2.4]:[1.6,2,1.6]);}
  const geo={trunk:new T.CylinderGeometry(.7,1,1,7),crown:new T.IcosahedronGeometry(1,1),pole:new T.CylinderGeometry(.07,.11,4.4,8),lantern:new T.BoxGeometry(.42,.55,.42),bench:new T.BoxGeometry(1.8,.12,.55),fence:new T.BoxGeometry(1,1,1),wallseg:new T.BoxGeometry(1,1,1),stripe:new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),flagpole:new T.CylinderGeometry(.08,.16,22,8),pedestal:new T.BoxGeometry(1,1,1)};
  const instMat={trunk:'bark',crown:'leaves',pole:'iron',lantern:'lamp',bench:'iron',fence:'iron',wallseg:'marble',stripe:'stripe',flagpole:'iron',pedestal:'marble'};for(const g of Object.values(geo))this.disposables.add(g);
  const o3=new T.Object3D(),mats=this.materials;
  for(const t of this.tiles.values()){
   for(const [name,b] of Object.entries(t.b)){if(!b.idx.length)continue;const m=new T.Mesh(b.geometry(),name==='wall'?mats.wall:name==='roof'?mats.roof:name==='grass'?mats.grass:name==='parkFloor'?mats.parkFloor:name==='arch'?mats.marble:mats.paving);m.castShadow=name==='wall'||name==='arch';m.receiveShadow=true;m.userData.kind=name;this.disposables.add(m.geometry);t.group.add(m);}
   t.props=new T.Group();t.group.add(t.props);
   for(const [name,list] of Object.entries(t.inst)){const im=new T.InstancedMesh(geo[name],mats[instMat[name]],list.length);list.forEach((it,k)=>{o3.position.copy(it.p);o3.rotation.set(0,it.r,0);o3.scale.set(...it.s);o3.updateMatrix();im.setMatrixAt(k,o3.matrix);if(it.color)im.setColorAt(k,it.color);});im.castShadow=name==='trunk'||name==='crown'||name==='pole';im.receiveShadow=name!=='stripe';im.computeBoundingSphere();(name==='stripe'?t.group:t.props).add(im);}
   delete t.b;delete t.inst;}
 }
 update(state,time,camera){const x=camera?camera.position.x:state?.position?.x||0,n=camera?-camera.position.z:state?.position?.z||0;this.visibleTiles=0;for(const t of this.tiles.values()){const dx=Math.max(Math.abs(t.center[0]-x)-TILE/2,0),dn=Math.max(Math.abs(t.center[1]-n)-TILE/2,0),d=Math.hypot(dx,dn);t.group.visible=d<(this.viewDistance||VIEW);if(t.props)t.props.visible=d<PROP_VIEW;if(t.group.visible)this.visibleTiles++;}}
 dispose(){for(const d of this.disposables)d.dispose?.();this.disposables.clear();}
}
