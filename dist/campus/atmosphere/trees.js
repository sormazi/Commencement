import * as T from '../../vendor/three.module.js';
import {Tree} from '../../vendor/ez-tree/tree.js';
import TreeOptions from '../../vendor/ez-tree/options.js';
import {WIND,WIND_DIR,FOLIAGE_TIME} from './foliage.js?v=24';
// Realistic trees (Avi, 15 Oct 2026: "the trees look smooth and blobby and clash with the detailed buildings").
// Trunks and branches are grown by the EZ-Tree generator (Daniel Greenheck, MIT licence, vendored in
// vendor/ez-tree); leaves are alpha-cut cards carrying a cluster of leaves; bark and leaf textures are drawn here, per
// species, so no image of unknown licence ships with the game. One model family per species group, two seeds for the
// common street trees; every tree is turned, mirrored and scaled to its own height and crown width (from DBH,
// species.js), so no two look alike. Three levels of detail per tile: full models near, lighter models in the middle
// distance, crossed billboards far away. Leaf colour per tree comes from leafColour (species.js) as instance colour,
// so autumn and the Callery pears' April blossom follow the real date; bare deciduous trees show only branches.

// ---- Species groups ---------------------------------------------------------------------------------------------
// key: which EZ-Tree form, leaf card and bark each species uses. Matched on the forestry/OSM species name.
const GROUPS=[
 [/cedar|deodar|spruce|fir\b|pine/i,'conifer'],[/holly/i,'holly'],[/sycamore|plane/i,'plane'],[/honeylocust|honey locust/i,'honeylocust'],
 [/pagoda|goldenrain/i,'pagoda'],[/ginkgo|maidenhair/i,'ginkgo'],[/redwood|bald ?cypress/i,'redwood'],[/pin oak/i,'pinoak'],[/oak/i,'oak'],
 [/zelkova/i,'zelkova'],[/elm/i,'elm'],[/linden|basswood/i,'linden'],[/pear/i,'pear'],[/cherry|plum|crabapple|dogwood|redbud|serviceberry/i,'cherry'],
 [/maple|hackberry|sweetgum|coffeetree|catalpa|horsechestnut|ash|hornbeam|magnolia/i,'maple']];
export function treeGroup(sp){if(!sp)return 'linden';for(const [re,k] of GROUPS)if(re.test(sp))return k;return 'linden';}
// Common street and park trees get two seeds, the rest one.
const SEEDS={plane:2,honeylocust:2,pear:2,linden:2,ginkgo:2,pinoak:2,oak:2,elm:2,zelkova:2};
// EZ-Tree forms. Lengths are relative (the model is normalised to height 1 afterwards); `leaf` names the card.
const FORM={
 plane:{levels:3,angle:{1:50,2:45,3:40},children:{0:6,1:4,2:3},force:.008,length:{0:14,1:9.5,2:5,3:2},radius:{0:.9,1:.55,2:.6,3:.7},start:{1:.3,2:.25,3:.2},leaves:5,size:2.3,leaf:'plane',bark:'plane'},
 honeylocust:{levels:3,angle:{1:55,2:48,3:40},children:{0:5,1:4,2:4},force:.02,length:{0:13,1:9,2:5.5,3:2.4},radius:{0:.75,1:.5,2:.55,3:.6},start:{1:.33,2:.2,3:.2},leaves:4,size:2.2,leaf:'honeylocust',bark:'dark',sparse:true},
 pagoda:{levels:3,angle:{1:58,2:46,3:40},children:{0:5,1:4,2:3},force:.015,length:{0:11,1:8,2:4.5,3:2},radius:{0:.7,1:.5,2:.55,3:.6},start:{1:.3,2:.2,3:.2},leaves:5,size:2.1,leaf:'honeylocust',bark:'grey'},
 ginkgo:{levels:3,angle:{1:35,2:40,3:35},children:{0:7,1:3,2:3},force:.03,length:{0:15,1:5.5,2:3,3:1.4},radius:{0:.7,1:.45,2:.55,3:.6},start:{1:.25,2:.2,3:.2},leaves:4,size:1.8,leaf:'ginkgo',bark:'grey'},
 redwood:{levels:3,angle:{1:70,2:45,3:40},children:{0:12,1:3,2:2},force:.04,length:{0:16,1:4,2:2,3:1},radius:{0:.8,1:.4,2:.5,3:.5},start:{1:.2,2:.2,3:.2},leaves:4,size:1.6,leaf:'needle',bark:'red'},
 pinoak:{levels:3,angle:{1:72,2:50,3:40},children:{0:9,1:4,2:3},force:-.012,length:{0:15,1:8,2:4,3:1.8},radius:{0:.8,1:.45,2:.55,3:.6},start:{1:.18,2:.2,3:.2},leaves:5,size:1.9,leaf:'oak',bark:'grey'},
 oak:{levels:3,angle:{1:55,2:48,3:40},children:{0:6,1:4,2:3},force:.002,length:{0:12,1:9,2:5,3:2.2},radius:{0:.95,1:.58,2:.6,3:.65},start:{1:.32,2:.25,3:.2},leaves:5,size:2.2,leaf:'oak',bark:'oak'},
 elm:{levels:3,angle:{1:30,2:42,3:40},children:{0:5,1:4,2:4},force:.02,length:{0:9,1:11,2:5,3:2.4},radius:{0:.9,1:.6,2:.55,3:.6},start:{1:.45,2:.3,3:.2},leaves:5,size:2.0,leaf:'elm',bark:'oak'},
 zelkova:{levels:3,angle:{1:30,2:40,3:38},children:{0:6,1:4,2:3},force:.025,length:{0:9,1:10,2:4.5,3:2},radius:{0:.8,1:.55,2:.55,3:.6},start:{1:.4,2:.3,3:.2},leaves:5,size:1.9,leaf:'elm',bark:'zelkova'},
 linden:{levels:3,angle:{1:48,2:44,3:40},children:{0:7,1:4,2:3},force:.015,length:{0:13,1:7,2:4,3:2},radius:{0:.8,1:.5,2:.55,3:.6},start:{1:.28,2:.25,3:.2},leaves:6,size:2.0,leaf:'linden',bark:'grey'},
 pear:{levels:3,angle:{1:32,2:40,3:38},children:{0:7,1:4,2:3},force:.035,length:{0:11,1:7,2:3.8,3:1.8},radius:{0:.75,1:.5,2:.55,3:.6},start:{1:.3,2:.25,3:.2},leaves:6,size:1.8,leaf:'pear',bark:'dark'},
 cherry:{levels:3,angle:{1:55,2:45,3:40},children:{0:5,1:4,2:3},force:.0,length:{0:7,1:6,2:3.5,3:1.6},radius:{0:.7,1:.5,2:.55,3:.6},start:{1:.35,2:.25,3:.2},leaves:5,size:1.7,leaf:'pear',bark:'cherry'},
 maple:{levels:3,angle:{1:50,2:45,3:40},children:{0:6,1:4,2:3},force:.008,length:{0:12,1:8.5,2:4.5,3:2},radius:{0:.85,1:.55,2:.6,3:.6},start:{1:.3,2:.25,3:.2},leaves:5,size:2.1,leaf:'plane',bark:'grey'},
 holly:{levels:3,angle:{1:60,2:45,3:40},children:{0:9,1:3,2:2},force:.02,length:{0:9,1:3.5,2:2,3:1},radius:{0:.5,1:.35,2:.4,3:.4},start:{1:.15,2:.2,3:.2},leaves:5,size:1.4,leaf:'holly',bark:'grey',evergreen:true},
 conifer:{type:'evergreen',levels:2,angle:{1:95,2:40},children:{0:28,1:4},force:-.01,length:{0:18,1:5,2:1.6},radius:{0:.8,1:.25,2:.3},start:{1:.12,2:.2},leaves:8,size:1.6,leaf:'needle',bark:'red',evergreen:true}};
function options(f,seed,lod){const o=new TreeOptions();o.seed=seed;o.type=f.type||'deciduous';o.bark.textured=false;o.bark.textureScale={x:1,y:1};const b=o.branch;
 const levels=lod==='mid'?Math.max(1,f.levels-1):f.levels;b.levels=levels;Object.assign(b.angle,f.angle);Object.assign(b.children,f.children);b.force.strength=f.force;
 Object.assign(b.length,f.length);Object.assign(b.radius,f.radius);Object.assign(b.start,f.start);
 const near=lod!=='mid';Object.assign(b.sections,near?{0:8,1:5,2:3,3:2}:{0:5,1:3,2:2,3:2});Object.assign(b.segments,near?{0:8,1:5,2:3,3:3}:{0:6,1:3,2:3,3:3});
 Object.assign(b.gnarliness,{0:.06,1:.14,2:.16,3:.1});Object.assign(b.taper,{0:.68,1:.6,2:.65,3:.7});
 // The middle-distance model has one level fewer, so its leaf cards are larger and fewer.
 Object.assign(o.leaves,{billboard:'double',count:near?f.leaves:Math.round(f.leaves*1.8),size:near?f.size:f.size*1.9,sizeVariance:.45,angle:30,start:.05,alphaTest:.5});return o;}
// Grow one model and normalise it: base at the origin, height 1. Returns geometries and the crown's width at height 1.
function grow(f,seed,lod){const t=new Tree(options(f,seed,lod));t.generate();const b=t.branchesMesh.geometry,l=t.leavesMesh.geometry;t.branchesMesh.material.dispose();t.leavesMesh.material.dispose();
 b.computeBoundingBox();l.computeBoundingBox();const box=b.boundingBox.clone().union(l.boundingBox),h=box.max.y,s=1/h;for(const g of [b,l]){g.scale(s,s,s);g.computeBoundingSphere();}
 const w=Math.max(box.max.x-box.min.x,box.max.z-box.min.z)*s;
 // Leaf cards: a per-vertex height (0 base, 1 top) and a per-card phase drive the wind sway in the shader.
 const p=l.attributes.position,ph=new Float32Array(p.count);for(let i=0;i<p.count;i+=4){const v=Math.sin(i*12.9898)*43758.5453;for(let k=0;k<4&&i+k<p.count;k++)ph[i+k]=v-Math.floor(v);}l.setAttribute('aPhase',new T.BufferAttribute(ph,1));
 return {branches:b,leaves:l,width:w};}

// ---- Textures, drawn per kind ------------------------------------------------------------------------------------
const rnd=s=>{let x=s>>>0||1;return ()=>((x=(x*1664525+1013904223)>>>0)/4294967296);};
function leafShape(g,kind,len,r){// a leaf pointing up (+y is the tip) of length len, at the origin
 g.beginPath();
 if(kind==='plane'){// palmate, five shallow lobes
  for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,lobe=1+.28*Math.cos(5*a),rr=len*.5*lobe;g.lineTo(Math.sin(a)*rr*.95,-Math.cos(a)*rr+len*.45);}}
 else if(kind==='oak'){// deeply lobed
  for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,lobe=1-.38*Math.max(0,Math.cos(7*a)),rr=len*.5*lobe;g.lineTo(Math.sin(a)*rr*.6,-Math.cos(a)*rr+len*.5);}}
 else if(kind==='ginkgo'){// fan
  g.moveTo(0,0);g.lineTo(-len*.5,len*.75);g.quadraticCurveTo(0,len*1.05,len*.5,len*.75);}
 else if(kind==='linden'){// heart
  g.moveTo(0,len);g.bezierCurveTo(len*.6,len*.75,len*.55,len*.05,0,len*.15);g.bezierCurveTo(-len*.55,len*.05,-len*.6,len*.75,0,len);}
 else if(kind==='holly'){for(let i=0;i<=20;i++){const t=i/20,side=i%2?1:.7;g.lineTo(Math.sin(t*Math.PI)*len*.3*side,t*len);}for(let i=20;i>=0;i--){const t=i/20,side=i%2?1:.7;g.lineTo(-Math.sin(t*Math.PI)*len*.3*side,t*len);}}
 else{// ellipse (elm, pear, cherry): w/l from kind
  const w=kind==='elm'?.32:kind==='pear'?.38:.34;g.ellipse(0,len*.5,len*w,len*.5,0,0,Math.PI*2);}
 g.fill();}
function leafCard(kind){const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),R=rnd(kind.length*977+13);
 const shade=()=>{const l=170+R()*85|0;return `rgb(${l*.86|0},${l},${l*.8|0})`;};g.lineCap='round';
 if(kind==='needle'){// conifer sprays: twigs with dense short needles
  for(let s=0;s<7;s++){const x0=40+R()*176,y0=230,ang=-Math.PI/2+(R()-.5)*1.2,L=120+R()*90;g.strokeStyle='rgb(120,110,95)';g.lineWidth=3;const x1=x0+Math.cos(ang)*L,y1=y0+Math.sin(ang)*L;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
   g.lineWidth=2;for(let k=0;k<70;k++){const t=R(),px=x0+(x1-x0)*t,py=y0+(y1-y0)*t,a2=ang+(k%2?1:-1)*(.9+R()*.4);g.strokeStyle=shade();g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(a2)*14,py+Math.sin(a2)*14);g.stroke();}}}
 else if(kind==='honeylocust'){// fine pinnate leaves: many tiny leaflets along thin rachises
  for(let s=0;s<9;s++){const x0=128+(R()-.5)*60,y0=240,ang=-Math.PI/2+(R()-.5)*2.2,L=90+R()*90;const x1=x0+Math.cos(ang)*L,y1=y0+Math.sin(ang)*L;g.strokeStyle='rgb(150,160,110)';g.lineWidth=1.5;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
   for(let k=0;k<22;k++){const t=.15+k/22*.85,px=x0+(x1-x0)*t,py=y0+(y1-y0)*t;for(const sd of [1,-1]){g.save();g.translate(px,py);g.rotate(ang+Math.PI/2+sd*1.35);g.fillStyle=shade();g.beginPath();g.ellipse(0,5,2.6,6,0,0,Math.PI*2);g.fill();g.restore();}}}}
 else{const n=kind==='plane'?9:kind==='ginkgo'?16:kind==='oak'?12:kind==='holly'?14:kind==='linden'?11:15,len=kind==='plane'?70:kind==='ginkgo'?42:kind==='oak'?58:kind==='linden'?56:kind==='holly'?44:46;
  g.strokeStyle='rgb(110,100,80)';g.lineWidth=2.5;g.beginPath();g.moveTo(128,250);g.lineTo(128,60);g.stroke();
  for(let i=0;i<n;i++){const t=i/n,px=128+(R()-.5)*150*(.3+t),py=250-t*190-R()*30,a=(R()-.5)*2.4+(px-128)/120;g.strokeStyle='rgb(120,110,85)';g.lineWidth=1.5;g.beginPath();g.moveTo(128,py+14);g.lineTo(px,py);g.stroke();
   g.save();g.translate(px,py);g.rotate(a);const s=.8+R()*.4;g.scale(s,s);g.fillStyle=shade();leafShape(g,kind,len,R);g.strokeStyle='rgba(60,70,40,.35)';g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(0,len*.85);g.stroke();g.restore();}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
// Bark: colour pattern per kind, 128 x 256, repeating round and up the trunk.
function barkTex(kind){const W=128,H=256,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),R=rnd(kind.length*31+7);
 const base={plane:'#b7ae95',dark:'#3b332d',grey:'#6f6a62',oak:'#56504a',zelkova:'#8a8478',red:'#6e4634',cherry:'#5a3a33'}[kind]||'#666';g.fillStyle=base;g.fillRect(0,0,W,H);
 if(kind==='plane'){// London plane: peeling camouflage of cream, olive and grey-brown patches
  for(let i=0;i<70;i++){g.fillStyle=['#d9d2bb','#9a9a74','#7d725f','#c8c09f','#a59c80'][i%5];g.beginPath();const x=R()*W,y=R()*H,rx=8+R()*22,ry=10+R()*30;g.ellipse(x,y,rx,ry,R()*3,0,Math.PI*2);g.fill();}}
 else if(kind==='zelkova'){for(let i=0;i<40;i++){g.fillStyle=R()>.7?'#b0764b':'#9b958a';g.fillRect(R()*W,R()*H,4+R()*14,3+R()*8);}}
 else{// furrowed: vertical dark fissures and lighter ridges
  for(let x=0;x<W;x+=4+R()*7){g.strokeStyle=`rgba(0,0,0,${.25+R()*.35})`;g.lineWidth=1+R()*2.5;g.beginPath();let y=0,xx=x;g.moveTo(xx,0);while(y<H){y+=8+R()*20;xx+=(R()-.5)*6;g.lineTo(xx,y);}g.stroke();}
  for(let i=0;i<300;i++){g.fillStyle=`rgba(255,255,255,${R()*.12})`;g.fillRect(R()*W,R()*H,2+R()*5,1+R()*3);}
  if(kind==='cherry')for(let i=0;i<60;i++){g.fillStyle='rgba(200,170,140,.55)';g.fillRect(R()*W,R()*H,6+R()*8,1.5);}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
// Far billboard: a soft crown of leaf cards over a trunk, drawn from the leaf card itself.
function farCard(card,kind){const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),R=rnd(kind.length*71+3);
 g.fillStyle='#4a4036';g.fillRect(S/2-6,S*.62,12,S*.38);const img=card.image,cone=kind==='needle';
 for(let i=0;i<46;i++){const t=R(),a=R()*Math.PI*2,rr=Math.sqrt(R());const cx=S/2+Math.cos(a)*rr*(cone?S*.32*(1-t):S*.4),cy=cone?S*.06+t*S*.66:S*.36+Math.sin(a)*rr*S*.28;const s=S*(.26+R()*.14);g.drawImage(img,cx-s/2,cy-s/2,s,s);}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}

// ---- Materials -----------------------------------------------------------------------------------------------------
// Leaf cards sway: a slow whole-crown lean plus a quicker flutter per card, both growing with height.
function swayLeaves(m,cacheKey){const prev=Object.prototype.hasOwnProperty.call(m,'onBeforeCompile')?m.onBeforeCompile:null,prevKey=prev&&m.customProgramCacheKey?m.customProgramCacheKey():'';m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);Object.assign(sh.uniforms,{fWind:WIND,fWindDir:WIND_DIR,fTime:FOLIAGE_TIME});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float fWind;uniform vec2 fWindDir;uniform float fTime;attribute float aPhase;')
  .replace('#include <begin_vertex>',`#include <begin_vertex>
 {float h=clamp(position.y,0.,1.);vec4 wp=modelMatrix*vec4(0.,0.,0.,1.);
  #ifdef USE_INSTANCING
  wp=instanceMatrix*wp;
  #endif
  float s=sin(fTime*.9+wp.x*.21+wp.z*.17)*.6+sin(fTime*2.3+aPhase*6.28)*.25;
  transformed.xz+=fWindDir*s*fWind*.035*h*h;transformed.y+=sin(fTime*3.1+aPhase*12.)*.004*fWind*h;}`);};m.customProgramCacheKey=()=>prevKey+'|'+cacheKey;m.needsUpdate=true;}
export function treeMaterials(patch=m=>m){const cards={},bark={},far={},M={};
 const card=k=>cards[k]||(cards[k]=leafCard(k)),bk=k=>bark[k]||(bark[k]=barkTex(k));
 for(const [key,f] of Object.entries(FORM)){
  const lm=patch(new T.MeshStandardMaterial({map:card(f.leaf),alphaTest:.5,side:T.DoubleSide,roughness:.8,color:0xffffff}));swayLeaves(lm,'nv-ezleaf');lm.name='leaves '+key;
  const bm=patch(new T.MeshStandardMaterial({map:bk(f.bark),roughness:.95,color:0xffffff}));bm.name='bark '+key;
  const ld=patch(new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:card(f.leaf),alphaTest:.5}));
  const fc=far[f.leaf]||(far[f.leaf]=farCard(card(f.leaf),f.leaf));const fm=patch(new T.MeshStandardMaterial({map:fc,alphaTest:.45,side:T.DoubleSide,roughness:.9}));fm.name='far tree '+key;
  M[key]={leaves:lm,bark:bm,far:fm,leafDepth:ld};}
 const all=[...Object.values(M).flatMap(m=>[m.leaves,m.bark,m.far,m.leafDepth]),...Object.values(cards),...Object.values(bark),...Object.values(far)];
 return {M,dispose(){for(const x of all)x.dispose();}};}
// Grow the model library: for each group and seed, a near and a middle model, and one far billboard per group.
export function treeLibrary(keys){const lib={},geos=[];const far=new T.PlaneGeometry(1,1).translate(0,.5,0),far2=far.clone().rotateY(Math.PI/2);
 const farGeo=new T.BufferGeometry();{const a=far.toNonIndexed(),b=far2.toNonIndexed();for(const k of ['position','normal','uv']){const x=a.attributes[k],y=b.attributes[k];const arr=new Float32Array(x.array.length+y.array.length);arr.set(x.array);arr.set(y.array,x.array.length);farGeo.setAttribute(k,new T.BufferAttribute(arr,x.itemSize));}}
 geos.push(farGeo);for(const key of keys){const f=FORM[key];const n=SEEDS[key]||1;lib[key]={variants:[],far:farGeo};
  for(let s=0;s<n;s++){const seed=1000+key.length*97+s*7919,near=grow(f,seed,'near'),mid=grow(f,seed,'mid');geos.push(near.branches,near.leaves,mid.branches,mid.leaves);lib[key].variants.push({near,mid});}}
 return {lib,dispose(){for(const g of geos)g.dispose();}};}
export const TREE_FORMS=FORM;
// Clipped shrubs and hedges (boxwood, privet): a dense tiling of small leaves over dark shadowed depth, no holes.
export function shrubTexture(){const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),R=rnd(4242);g.fillStyle='#2a3a1f';g.fillRect(0,0,S,S);
 for(let i=0;i<900;i++){const x=R()*S,y=R()*S,l=110+R()*120|0;g.fillStyle=`rgb(${l*.62|0},${l*.85|0},${l*.45|0})`;g.save();g.translate(x,y);g.rotate(R()*6.28);g.beginPath();g.ellipse(0,0,3+R()*2,6+R()*3,0,0,Math.PI*2);g.fill();g.restore();
  for(const [dx,dy] of [[S,0],[-S,0],[0,S],[0,-S]])if(x+dx>-10&&x+dx<S+10&&y+dy>-10&&y+dy<S+10){g.save();g.translate(x+dx,y+dy);g.beginPath();g.ellipse(0,0,4,7,0,0,Math.PI*2);g.restore();}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
