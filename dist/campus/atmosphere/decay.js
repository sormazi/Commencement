import * as T from '../../vendor/three.module.js';
import {pointInRing,centroid,ringArea} from '../geometry.js?v=24';
import {archPiers,CURB_HEIGHT} from '../collision.js?v=24';
// Phase 3 first slice: a hundred years of reclamation on Washington Square Park and the buildings
// facing it (the Arch, Bobst, Kimmel, Judson, the Row and the Silver Center). Everything here is
// generated from the map data with seeded noise so it is the same on every run.
// The Brown Building and the Triangle Fire memorial are deliberately left out: they are not in the slice
// list, and any group flagged userData.preserve is skipped even if it falls inside the slice.
// Performance: weathering is a shader change on existing materials (no extra draw calls); ivy, meadow
// grass, banners and the chess pieces are one instanced mesh each.
const GU=[.837,-.547],GV=[.547,.837];
export const gu=p=>p[0]*GU[0]+p[1]*GU[1],gv=p=>p[0]*GV[0]+p[1]*GV[1],mp=(u,v)=>[u*GU[0]+v*GV[0],u*GU[1]+v*GV[1]];
// The slice: the park (grid u -162..135, v -128..18 from the OSM outline) plus the facing blocks.
export const SLICE={u:[-205,180],v:[-195,62]};
export const inSlice=p=>{const u=gu(p),v=gv(p);return u>SLICE.u[0]&&u<SLICE.u[1]&&v>SLICE.v[0]&&v<SLICE.v[1];};
// Landmarks that decay in this slice (BINs); the Row is registered under its first BIN.
export const DECAY_BINS={bobst:1008626,kimmel:1008662,judson:1008717,silver:1008820};
// The decay layer. Everything this file adds sits on top of the clean 2026 campus and is blended in by one
// shared uniform, DECAY.value: 0 = the clean campus of 2026, 1 = the ruin of 2126. Nothing is baked into
// the clean models or textures; world.setDecay(t) and world.eraTo(t) switch or fade the whole study area.
export const DECAY={value:1};
let RAG=null;const rag=()=>RAG||(RAG=ragMask());
export const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const toV=(p,y=0)=>new T.Vector3(p[0],y,-p[1]);
function tex(w,h,draw,{repeat=false}={}){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;if(repeat)t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
// ---- Weathering shader -------------------------------------------------------------------------
// kind: 'masonry' (stains, soot crusts, moss and cracks), 'glass' (crazed and broken panes),
// 'metal' (rust), 'light' (lighter grime for signs and plaques).
const NOISE=`float dkHash(vec3 p){return fract(sin(dot(p,vec3(12.71,39.17,71.93)))*43758.5453);}
float dkNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(dkHash(i),dkHash(i+vec3(1,0,0)),f.x),mix(dkHash(i+vec3(0,1,0)),dkHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(dkHash(i+vec3(0,0,1)),dkHash(i+vec3(1,0,1)),f.x),mix(dkHash(i+vec3(0,1,1)),dkHash(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
const BODY={
 masonry:`float broad=dkNoise(dp*.31),fine=dkNoise(dp*13.),damp=1.-smoothstep(0.,9.,dp.y);
float streak=pow(dkNoise(vec3(dp.x*2.3,dp.y*.04,dp.z*2.3)),4.);
float crust=smoothstep(.45,.75,dkNoise(dp*.9+3.))*(.4+.6*smoothstep(4.,30.,dp.y));
float moss=smoothstep(.45,.75,broad+damp*.45)*damp;
float crack=(1.-smoothstep(.012,.035,abs(dkNoise(dp*1.7)-.5)))*smoothstep(.4,.7,broad);
diffuseColor.rgb*=mix(.7,.98,fine)*.86;diffuseColor.rgb*=1.-streak*.7-crack*.6;
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.08,.075,.065),crust*.72);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.36,.33,.22),smoothstep(.62,.9,broad)*.35);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.12,.17,.07),moss*.75);`,
 glass:`float pane=dkHash(floor(dp*vec3(.9,.42,.9))+7.);float broad=dkNoise(dp*.5);
float web=1.-smoothstep(.006,.03,abs(dkNoise(dp*3.1)-.5));float web2=1.-smoothstep(.006,.025,abs(dkNoise(dp*7.3+5.)-.5));
float grime=smoothstep(.3,.9,broad);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.16,.17,.15),grime*.55);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.42,.44,.42),max(web,web2*.7)*step(.45,pane)*.7);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.01),step(.82,pane));diffuseColor.a=mix(diffuseColor.a,1.,max(step(.82,pane),grime*.6));`,
 metal:`float broad=dkNoise(dp*.8),fine=dkNoise(dp*21.);float rust=smoothstep(.25,.75,broad+fine*.25);
diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.33,.15,.06),vec3(.48,.25,.1),fine),rust*.85);`,
 paving:`float broad=dkNoise(dp*.22),fine=dkNoise(dp*7.);
float crack=1.-smoothstep(.004,.014,abs(dkNoise(dp*1.3)-.5)),crack2=1.-smoothstep(.003,.01,abs(dkNoise(dp*3.9+9.)-.5));
diffuseColor.rgb*=mix(.72,1.,fine)*mix(.78,1.,smoothstep(.3,.7,broad));
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.07,.09,.05),max(crack,crack2*.6)*.85*smoothstep(.42,.62,dkNoise(dp*.11+4.)));
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.2,.23,.12),smoothstep(.72,.88,broad)*.55);`,
 facade:`float broad=dkNoise(dp*.31),fine=dkNoise(dp*13.),damp=1.-smoothstep(0.,9.,dp.y);
float streak=pow(dkNoise(vec3(dp.x*2.3,dp.y*.04,dp.z*2.3)),4.);float moss=smoothstep(.45,.75,broad+damp*.45)*damp;
float isGlass=1.-step(.34,dot(sampledDiffuseColor.rgb,vec3(.333)));vec2 cell=floor(vMapUv);float pane=dkHash(vec3(cell,floor(dp.x*.05)+floor(dp.z*.05)*7.));
diffuseColor.rgb*=mix(.72,.98,fine)*.88*(1.-streak*.6);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.12,.17,.07),moss*.7);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.008),isGlass*step(.72,pane));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.42,.34,.24),isGlass*step(.62,pane)*(1.-step(.72,pane)));`,
 paint:`float broad=dkNoise(dp*1.1),fine=dkNoise(dp*17.);float streak=pow(dkNoise(vec3(dp.x*7.,dp.y*.7,dp.z*7.)),3.);
float rust=smoothstep(.46,.78,broad+streak*.6);float lum=dot(diffuseColor.rgb,vec3(.3,.59,.11));
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(lum)*.85+vec3(.1,.09,.09),.4);diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.31,.15,.07),vec3(.48,.26,.11),fine),rust*.85);
diffuseColor.rgb*=1.-streak*.45;diffuseColor.rgb*=mix(.55,1.,smoothstep(-.4,.5,dp.y+fine*.3));`,
 cloth:`float broad=dkNoise(dp*.6),fine=dkNoise(dp*11.);float lum=dot(diffuseColor.rgb,vec3(.3,.59,.11));
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(lum)*.8+vec3(.17,.16,.14),.5);diffuseColor.rgb*=mix(.78,1.,fine);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.33,.31,.26),smoothstep(.55,.9,broad)*.45);`,
 light:`float broad=dkNoise(dp*.6),fine=dkNoise(dp*11.);float streak=pow(dkNoise(vec3(dp.x*3.,dp.y*.06,dp.z*3.)),4.);
diffuseColor.rgb*=mix(.7,.95,fine)*(1.-streak*.45);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.3,.29,.24),smoothstep(.5,.9,broad)*.5);`};
const ROUGH={paint:'roughnessFactor=mix(roughnessFactor,.95,rust);metalnessFactor=mix(metalnessFactor,.1,rust);',facade:'',cloth:'',paving:'',masonry:'roughnessFactor=clamp(roughnessFactor+.08-moss*.25,.35,1.);',glass:'roughnessFactor=mix(.08,.7,grime);',metal:'roughnessFactor=mix(roughnessFactor,.9,rust);metalnessFactor=mix(metalnessFactor,.15,rust);',light:''};
export function decayMaterial(material,kind='masonry',{tear=false,dissolve=false,local=false}={}){const m=material.clone();
 // Chain onto an existing shader patch (the third-tier facade atlas, the sign atlas), so decay draws on top.
 const prev=Object.prototype.hasOwnProperty.call(material,'onBeforeCompile')?material.onBeforeCompile:null,prevKey=prev&&material.customProgramCacheKey?material.customProgramCacheKey():'';
 if(tear){m.alphaMap=rag();m.alphaTest=Math.max(m.alphaTest||0,.5);}
 if(dissolve)m.alphaTest=Math.max(m.alphaTest||0,.01);
 m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.uniforms.uDecay=DECAY;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 dp;').replace('#include <begin_vertex>',local?'#include <begin_vertex>\ndp=(modelMatrix*vec4(position,1.)).xyz-modelMatrix[3].xyz;dp=vec3(dot(dp,normalize(modelMatrix[0].xyz)),dot(dp,normalize(modelMatrix[1].xyz)),dot(dp,normalize(modelMatrix[2].xyz)));':'#include <begin_vertex>\n#ifdef USE_INSTANCING\ndp=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\ndp=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 dp;\nuniform float uDecay;\n'+NOISE).replace('#include <color_fragment>','#include <color_fragment>\nvec4 nvClean=diffuseColor;\n'+BODY[kind]+'\ndiffuseColor=mix(nvClean,diffuseColor,uDecay);'+(dissolve?'\nif(dkHash(vec3(floor(gl_FragCoord.xy),3.))>uDecay)discard;':''));
  if(ROUGH[kind])sh.fragmentShader=sh.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nfloat nvR0=roughnessFactor,nvM0=metalnessFactor;\n'+ROUGH[kind]+'\nroughnessFactor=mix(nvR0,roughnessFactor,uDecay);metalnessFactor=mix(nvM0,metalnessFactor,uDecay);');
  // Lit signs and lamps go dark as the layer comes in (plaques keep their glow, if any).
  if(kind!=='light')sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance*=1.-.98*uDecay;');
  // Torn cloth: the rag mask only bites as the layer comes in.
  if(tear)sh.fragmentShader=sh.fragmentShader.replace('#include <alphamap_fragment>','#ifdef USE_ALPHAMAP\ndiffuseColor.a*=mix(1.,texture2D(alphaMap,vAlphaMapUv).g,uDecay);\n#endif');};
 m.customProgramCacheKey=()=>'nv-decay-'+kind+(tear?'-tear':'')+(dissolve?'-dissolve':'')+(local?'-local':'')+(prevKey?'|'+prevKey:'');return m;}
// Two-state instances (trees): each instance has its 2126 transform in instanceMatrix and its 2026 transform
// in four vec4 attributes (aC0..aC3, the columns); the vertex shader blends them with the decay layer.
export function cleanInstanceAttributes(geometry,A){const n=A.length/16;for(let c=0;c<4;c++){const a=new Float32Array(n*4);for(let i=0;i<n;i++)for(let k=0;k<4;k++)a[i*4+k]=A[i*16+c*4+k];geometry.setAttribute('aC'+c,new T.InstancedBufferAttribute(a,4));}return geometry;}
export function blendInstances(m){const swap=chunk=>T.ShaderChunk[chunk].replaceAll('instanceMatrix','nvIM');
 m.onBeforeCompile=sh=>{sh.uniforms.uDecay=DECAY;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uDecay;\n#ifdef USE_INSTANCING\nattribute vec4 aC0,aC1,aC2,aC3;\n#endif')
  .replace('void main() {','void main() {\n#ifdef USE_INSTANCING\nmat4 nvIM=mat4(mix(aC0,instanceMatrix[0],uDecay),mix(aC1,instanceMatrix[1],uDecay),mix(aC2,instanceMatrix[2],uDecay),mix(aC3,instanceMatrix[3],uDecay));\n#endif')
  .replace('#include <defaultnormal_vertex>',swap('defaultnormal_vertex')).replace('#include <project_vertex>',swap('project_vertex')).replace('#include <worldpos_vertex>',swap('worldpos_vertex'));};
 m.customProgramCacheKey=()=>'nv-blend-inst';m.needsUpdate=true;return m;}
// Growth: instanced plants (grass tufts, ivy, saplings) scale up from their base with the decay layer.
export function growMaterial(m){const prev=Object.prototype.hasOwnProperty.call(m,'onBeforeCompile')?m.onBeforeCompile:null,prevKey=prev&&m.customProgramCacheKey?m.customProgramCacheKey():'';
 m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.uniforms.uDecay=DECAY;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uDecay;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed*=smoothstep(0.,1.,uDecay);');};
 m.customProgramCacheKey=()=>'nv-grow|'+prevKey;return m;}
export const decayKind=name=>/awning/i.test(name)?'cloth':/glass|lobby|drum/i.test(name)?'glass':/iron|frame|rail|steel|bronze|brass|copper|mullion|fin|column|pole|lamp/i.test(name)?'metal':/sign|plaque|text|inscr|num|tablet/i.test(name)?'light':'masonry';
// Re-material a landmark group in place (cached per original material).
export function weatherGroup(g,cache,disposables){if(g.userData.preserve)return 0;let n=0;
 g.traverse(o=>{if(!o.isMesh)return;const name=o.name||'';const src=o.material;if(Array.isArray(src))return;let m=cache.get(src);
  if(!m){const kind=/^(banner|flag|flags)$/.test(name)?'cloth':decayKind(name);m=decayMaterial(src,kind,{tear:kind==='cloth'});cache.set(src,m);disposables.add(m);}o.material=m;n++;});return n;}
// ---- Textures ----------------------------------------------------------------------------------
export function ivyTexture(){return tex(128,128,(g,w,h)=>{const r=(i=>()=>(i=(i*16807)%2147483647)/2147483647)(11);g.clearRect(0,0,w,h);
 for(let i=0;i<70;i++){const x=w*.15+r()*w*.7,y=h*.12+r()*h*.8,s=5+r()*9,l=20+r()*22;g.fillStyle=`hsl(${95+r()*35},${35+r()*25}%,${l}%)`;g.beginPath();g.moveTo(x,y-s);g.quadraticCurveTo(x+s,y-s*.3,x,y+s*.8);g.quadraticCurveTo(x-s,y-s*.3,x,y-s);g.fill();}
 g.strokeStyle='rgba(60,45,30,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(w/2,h);for(let y=h;y>0;y-=12)g.lineTo(w/2+(r()-.5)*30,y);g.stroke();});}
export function grassTexture(){return tex(64,128,(g,w,h)=>{const r=(i=>()=>(i=(i*16807)%2147483647)/2147483647)(5);g.clearRect(0,0,w,h);
 for(let i=0;i<34;i++){const x=4+r()*(w-8),top=h*(.05+r()*.5),bend=(r()-.5)*18;g.strokeStyle=`hsl(${45+r()*35},${18+r()*22}%,${26+r()*26}%)`;g.lineWidth=1+r()*1.6;g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+bend*.3,(h+top)/2,x+bend,top);g.stroke();
  if(r()<.25){g.fillStyle=`hsl(${40+r()*15},40%,${55+r()*20}%)`;g.beginPath();g.ellipse(x+bend,top,1.8,4.5,0,0,Math.PI*2);g.fill();}}});}
// Alpha mask for torn cloth: white where the cloth survives, black where it has rotted away (green channel).
export function ragMask(){return tex(64,160,(g,w,h)=>{const r=(i=>()=>(i=(i*16807)%2147483647)/2147483647)(29);g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#fff';
 const cols=6;for(let c=0;c<cols;c++){const x0=c*w/cols,len=h*(.4+r()*.58);g.beginPath();g.moveTo(x0,0);g.lineTo(x0+w/cols+.5,0);g.lineTo(x0+w/cols+.5-r()*3,len*(.8+r()*.2));g.lineTo(x0+w/cols*(.3+r()*.4),len);g.lineTo(x0+r()*3,len*(.75+r()*.2));g.closePath();g.fill();}
 g.fillStyle='#000';for(let i=0;i<8;i++)g.fillRect(r()*w,10+r()*h*.45,2+r()*5,2+r()*7);});}
export function bannerTexture(){return tex(64,192,(g,w,h)=>{const r=(i=>()=>(i=(i*16807)%2147483647)/2147483647)(23);g.clearRect(0,0,w,h);
 // Sun-bleached violet cloth, torn into ragged strips from the bottom up, with holes.
 const cols=7;for(let c=0;c<cols;c++){const x0=c*w/cols,len=h*(.35+r()*.6);const grd=g.createLinearGradient(0,0,0,len);grd.addColorStop(0,'#a796b0');grd.addColorStop(.5,'#9c8aa6');grd.addColorStop(1,'#b8adbd');g.fillStyle=grd;g.beginPath();g.moveTo(x0,0);g.lineTo(x0+w/cols+.5,0);
  g.lineTo(x0+w/cols+.5-r()*3,len*(.8+r()*.2));g.lineTo(x0+w/cols*(.3+r()*.4),len);g.lineTo(x0+r()*3,len*(.75+r()*.2));g.closePath();g.fill();}
 g.fillStyle='#8c7a96';g.fillRect(0,0,w,8);for(let i=0;i<9;i++){g.clearRect(r()*w,10+r()*h*.5,2+r()*6,2+r()*8);}
 for(let i=0;i<300;i++){g.fillStyle=`rgba(80,70,60,${r()*.15})`;g.fillRect(r()*w,r()*h,2,3);}});}
export function chessTexture(){return tex(128,128,(g,w,h)=>{g.fillStyle='#8e8a80';g.fillRect(0,0,w,h);const s=w/10;for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.fillStyle=(i+j)%2?'#3d3a35':'#b9b2a2';g.fillRect(s+i*s,s+j*s,s,s);}
 for(let i=0;i<400;i++){g.fillStyle=`rgba(40,60,30,${Math.random()*.25})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}});}
export function basinTexture(){return tex(256,256,(g,w,h)=>{g.fillStyle='#6f7466';g.fillRect(0,0,w,h);const r=(i=>()=>(i=(i*16807)%2147483647)/2147483647)(31);
 for(let i=0;i<900;i++){const x=r()*w,y=r()*h,s=2+r()*14;g.fillStyle=r()<.6?`hsla(${75+r()*40},${30+r()*30}%,${18+r()*18}%,.55)`:`hsla(30,15%,${20+r()*20}%,.4)`;g.beginPath();g.arc(x,y,s,0,7);g.fill();}
 g.strokeStyle='rgba(30,28,24,.6)';for(let i=0;i<14;i++){g.beginPath();let x=r()*w,y=r()*h;g.moveTo(x,y);for(let k=0;k<6;k++){x+=(r()-.5)*50;y+=(r()-.5)*50;g.lineTo(x,y);}g.stroke();}
 for(let i=0;i<160;i++){g.fillStyle=`hsl(${25+r()*20},${40+r()*20}%,${25+r()*15}%)`;g.save();g.translate(r()*w,r()*h);g.rotate(r()*7);g.fillRect(-3,-1.5,6,3);g.restore();}},{repeat:true});}
export function meadowTexture(){return tex(128,128,(g,w,h)=>{g.fillStyle='#6e744a';g.fillRect(0,0,w,h);const r=(i=>()=>(i=(i*16807)%2147483647)/2147483647)(41);
 for(let i=0;i<2200;i++){g.fillStyle=`hsl(${45+r()*45},${25+r()*25}%,${22+r()*24}%)`;g.fillRect(r()*w,r()*h,1,2+r()*4);}},{repeat:true});}
// ---- Geometry helpers --------------------------------------------------------------------------
// Two crossed vertical quads (a grass tuft or a foliage card), base at y=0, height 1, width 1.
function crossedQuads(){const g=new T.BufferGeometry(),P=[],U=[],N=[];const q=(ax,az)=>{const p=[[-ax/2,0,-az/2],[ax/2,0,az/2],[ax/2,1,az/2],[-ax/2,1,-az/2]],uv=[[0,0],[1,0],[1,1],[0,1]];for(const k of [0,1,2,0,2,3]){P.push(...p[k]);U.push(...uv[k]);N.push(0,1,0);}};q(1,0);q(0,1);
 g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));return g;}
function swayMaterial(map,uniforms,{amp=.18,color=0xffffff}={}){const m=new T.MeshStandardMaterial({map,color,alphaTest:.45,side:T.DoubleSide,roughness:.95});
 m.onBeforeCompile=sh=>{sh.uniforms.uTime=uniforms.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>',`#include <begin_vertex>
#ifdef USE_INSTANCING
float ph=instanceMatrix[3].x*.37+instanceMatrix[3].z*.21;transformed.x+=sin(uTime*1.3+ph)*${amp.toFixed(3)}*position.y*position.y;transformed.z+=cos(uTime*1.1+ph)*${(amp*.6).toFixed(3)}*position.y*position.y;
#endif`);};m.customProgramCacheKey=()=>'nv-sway-'+amp;return m;}
// Seeded scatter inside a ring.
function scatter(ring,count,seed){const xs=ring.map(p=>p[0]),ns=ring.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),n0=Math.min(...ns),n1=Math.max(...ns),out=[];let k=0;
 for(let tries=0;out.length<count&&tries<count*8;tries++){const p=[x0+hash(seed+k++)*(x1-x0),n0+hash(seed+k++)*(n1-n0)];if(pointInRing(p,ring))out.push(p);}return out;}
// ---- The decay pass ----------------------------------------------------------------------------
export function buildDecay(world){const d=world.data,group=new T.Group();group.name='decay';
 const uniforms={uTime:{value:0}},dis=world.disposables,keep=x=>{dis.add(x);return x;};
 const park=d.areas.find(a=>a.kind==='park'&&pointInRing([-30,-46],a.ring));const P=park?park.ring:null;
 const o3=new T.Object3D(),stats={weathered:0,ivy:0,tufts:0,banners:0,trees:0};
 // 1. Weather every landmark except the preserved ones (the Brown Building and memorial), the Arch, every
 // second-tier building and the third-tier facades and roofs (shader only; no extra draw calls).
 const cache=new Map(),hooks=[];
 for(const L of world.landmarks)if(!L.group.userData.preserve)stats.weathered+=weatherGroup(L.group,cache,dis);
 if(world.archGroup)stats.weathered+=weatherGroup(world.archGroup,cache,dis);
 for(const t of world.tiles.values())if(t.tier2Group)stats.weathered+=weatherGroup(t.tier2Group,cache,dis);
 // Storefronts (Tier B): frames rust, glass breaks, awnings bleach and tear.
 for(const g of world.storefronts?.groups||[])stats.weathered+=weatherGroup(g,cache,dis);
 {const wall=keep(decayMaterial(world.materials.wall,'facade')),roof=keep(decayMaterial(world.materials.roof,'masonry')),sw=new Map([[world.materials.wall,wall],[world.materials.roof,roof]]);
  world.materials.wall=wall;world.materials.roof=roof;world.group.traverse(o=>{if(o.isMesh&&sw.has(o.material))o.material=sw.get(o.material);});}
 // Lamp poles, benches and fences rust; dead lanterns everywhere (night.js adds the few that work).
 // (Blended by hooks, below: the clean colours are kept and lerped toward these.)
 const lerpMat=(m,to)=>{const from={color:m.color.clone(),roughness:m.roughness,metalness:m.metalness,emissiveIntensity:m.emissiveIntensity},c=new T.Color(to.color);
  hooks.push(t=>{m.color.copy(from.color).lerp(c,t);if(to.roughness!=null)m.roughness=from.roughness+(to.roughness-from.roughness)*t;if(to.metalness!=null)m.metalness=from.metalness+(to.metalness-from.metalness)*t;if(to.emissiveIntensity!=null)m.emissiveIntensity=from.emissiveIntensity+(to.emissiveIntensity-from.emissiveIntensity)*t;});};
 lerpMat(world.materials.iron,{color:0x3a2a20,roughness:.85,metalness:.3});lerpMat(world.materials.lamp,{color:0x2f322e,roughness:.4});hooks.push(t=>{world.materials.lamp.emissiveIntensity=1.2*(world.lampLevel??0)*(1-t);});lerpMat(world.materials.marble,{color:0xbdb6a5});
 // Park paving and sidewalks: cracked, stained and mossy (shader only, shared materials).
 for(const k of ['parkFloor','paving']){const m=decayMaterial(world.materials[k],'paving');world.materials[k]=keep(m);}
 world.group.traverse(o=>{if(o.isMesh&&(o.userData.kind==='parkFloor'||o.userData.kind==='paving'))o.material=world.materials[o.userData.kind];});
 // 2. Meadow: lawns re-textured, and tall grass tufts across the park lawns.
 // Lawns: the mown 2026 texture and the 2126 meadow, blended in the shader.
 {const gm=world.materials.grass,meadow=keep(meadowTexture()),prev=Object.prototype.hasOwnProperty.call(gm,'onBeforeCompile')?gm.onBeforeCompile:null;
  gm.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.uniforms.uDecay=DECAY;sh.uniforms.uMeadow={value:meadow};sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uDecay;uniform sampler2D uMeadow;').replace('#include <map_fragment>','#include <map_fragment>\n#ifdef USE_MAP\ndiffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb/max(sampledDiffuseColor.rgb,vec3(.05))*texture2D(uMeadow,vMapUv*.6).rgb,uDecay);\n#endif');};
  gm.customProgramCacheKey=()=>'nv-lawn';gm.needsUpdate=true;}
 // Tall grass across every lawn in the study area (thicker in the park), sparse tufts in the park paving
 // cracks and along the curbs; one instanced mesh per tile so tiles cull and fade like the other props.
 const lawns=d.areas.filter(a=>a.kind==='grass'||a.kind==='pitch');const tufts=[];
 lawns.forEach((a,i)=>{const A=Math.abs(ringArea(a.ring)),inPark=P&&pointInRing(centroid(a.ring),P);tufts.push(...scatter(a.ring,Math.round(A*(inPark?.42:.3)),1000+i*97));});
 if(P){const xs=P.map(p=>p[0]),ns=P.map(p=>p[1]);let k=0;for(let i=0;i<5000;i++){const p=[Math.min(...xs)+hash(5000+k++)*(Math.max(...xs)-Math.min(...xs)),Math.min(...ns)+hash(5000+k++)*(Math.max(...ns)-Math.min(...ns))];if(pointInRing(p,P)&&!lawns.some(a=>pointInRing(p,a.ring)))tufts.push([...p,1]);}}
 for(const [si,s] of (d.sidewalk||[]).entries()){const r=Array.isArray(s[0]?.[0])?s[0]:s;if(!Array.isArray(r)||r.length<3||!Array.isArray(r[0]))continue;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=1;t<L;t+=2.2){const k=si*131+i*17+t;if(hash(k)<.3)tufts.push([a[0]+(b[0]-a[0])*t/L,a[1]+(b[1]-a[1])*t/L,1]);}}}
 const tg=keep(crossedQuads()),tm=keep(growMaterial(swayMaterial(keep(grassTexture()),uniforms,{amp:.12})));const tileTufts=new Map();
 tufts.forEach((p,i)=>{const t=world.tile(p[0],p[1]);(tileTufts.get(t)||tileTufts.set(t,[]).get(t)).push([p,i]);});
 for(const [t,list] of tileTufts){const tuft=new T.InstancedMesh(tg,tm,list.length);list.forEach(([p,i],j)=>{const small=p[2]===1,h=small?.25+hash(i*3)*.3:.55+hash(i*3)*1.0;o3.position.copy(toV(p,CURB_HEIGHT+.01));o3.rotation.set(0,hash(i*7)*3.14,0);o3.scale.set(h*.9,h,h*.9);o3.updateMatrix();tuft.setMatrixAt(j,o3.matrix);});
  tuft.computeBoundingSphere();tuft.receiveShadow=true;tuft.name='meadow';(t.props||t.group).add(tuft);}
 stats.tufts=tufts.length;
 // 3. Ivy on the facing landmarks (footprint edges), the Arch piers and the park fences.
 const ivy=[];const wall=(a,b,seed,maxH,step=1.05,chance=.62)=>{const dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn);if(L<1)return;const n=[dn/L,-dx/L];
  for(let s=.5;s<L;s+=step){const k=seed+s*13.1;if(hash(k)>chance)continue;const h=maxH*(.25+.75*Math.pow(hash(k+1),.7));const p=[a[0]+dx*s/L+n[0]*.16,a[1]+dn*s/L+n[1]*.16];
   for(let y=0;y<h;y+=.85){const sz=1.0+hash(k+y)*.7;ivy.push({p:[p[0]+(hash(k+y*3)-.5)*.6*dx/L,p[1]+(hash(k+y*3)-.5)*.6*dn/L],y:CURB_HEIGHT+y,yaw:Math.atan2(n[0],n[1]),s:sz*(1-.45*(y/h)),c:hash(k+y*5)});}}};
 const landmarkBins=new Set();for(const L of world.landmarks){if(L.group.userData.preserve)continue;landmarkBins.add(L.bin);for(const x of L.also||[])landmarkBins.add(x);}
 const preserved=new Set(world.landmarks.filter(L=>L.group.userData.preserve).flatMap(L=>[L.bin,...(L.also||[])]));
 for(const b of d.buildings){if(preserved.has(b.bin))continue;const r=ringArea(b.rings[0])>0?b.rings[0]:[...b.rings[0]].reverse(),big=landmarkBins.has(b.bin)||world.tier2Bins?.has(b.bin)||(world.rowBins&&world.rowBins.includes(b.bin));
  const tall=b.bin===DECAY_BINS.judson||(world.rowBins&&world.rowBins.includes(b.bin))?16:b.bin===DECAY_BINS.bobst?22:big?12:6;
  for(let i=0;i<r.length;i++)big?wall(r[i],r[(i+1)%r.length],b.bin%1000+i*31,tall,1.05,inSlice(r[i])?.62:.4):wall(r[i],r[(i+1)%r.length],b.bin%1000+i*31,tall,2.2,.09);}
 for(const pier of archPiers(d.arch)){const r=ringArea(pier)>0?pier:[...pier].reverse();for(let i=0;i<r.length;i++)wall(r[i],r[(i+1)%r.length],77+i*19,11,.9,.7);}
 for(const br of d.barriers){if(br.kind!=='fence')continue;for(let i=1;i<br.pts.length;i++){const a=br.pts[i-1],b=br.pts[i];const dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn);
  for(let s=.4;s<L;s+=1.4){const k=a[0]*3.1+a[1]*7.7+s;if(hash(k)>.45)continue;ivy.push({p:[a[0]+dx*s/L,a[1]+dn*s/L],y:CURB_HEIGHT,yaw:Math.atan2(dx,dn)+Math.PI/2,s:.8+hash(k+1)*.5,c:hash(k+2)});}}}
 const ig=keep(new T.PlaneGeometry(1,1).translate(0,.5,0)),im=keep(growMaterial(new T.MeshStandardMaterial({map:keep(ivyTexture()),alphaTest:.4,side:T.DoubleSide,roughness:.9}))),col=new T.Color(),tileIvy=new Map();
 for(const v of ivy){const t=world.tile(v.p[0],v.p[1]);(tileIvy.get(t)||tileIvy.set(t,[]).get(t)).push(v);}
 for(const [t,list] of tileIvy){const ivyMesh=new T.InstancedMesh(ig,im,list.length);list.forEach((v,i)=>{o3.position.copy(toV(v.p,v.y));o3.rotation.set(0,v.yaw,(v.c-.5)*.5);o3.scale.set(v.s,v.s,1);o3.updateMatrix();ivyMesh.setMatrixAt(i,o3.matrix);ivyMesh.setColorAt(i,col.setHSL(.24+v.c*.06,.3,.45+v.c*.25));});
  ivyMesh.computeBoundingSphere();ivyMesh.name='ivy';(t.props||t.group).add(ivyMesh);}
 stats.ivy=ivy.length;
 // 4. Signage decals (signage.js): grimy and sun-bleached; pole banners also torn into ragged strips.
 if(world.signage){const weathered={};for(const im of world.signage.group.children){const id=im.userData.decal,src=im.material;const m=keep(decayMaterial(src,im.userData.kind==='atlas'?'light':'cloth',{tear:im.userData.kind==='pole-banner'}));
   weathered[id]=m;im.material=m;stats.banners+=im.count;}
  world.onSignage=(id,mat)=>{const m=weathered[id];if(m){m.map=mat.map;m.needsUpdate=true;}};}
 // 5. Park furniture weathers too: granite fountain and chess tables stain, steel poles rust, bench slats grey.
 const swap=new Map();for(const [k,kind] of [['granite','masonry'],['steel','metal'],['wood','masonry']]){const m=world.materials[k];if(!m)continue;const w=keep(decayMaterial(m,kind));if(k==='wood')w.color.set(0x5d5348);swap.set(m,w);world.materials[k]=w;}
 if(Array.isArray(world.materials.chessTop)){const arr=world.materials.chessTop.map(m=>{if(!swap.has(m))swap.set(m,keep(decayMaterial(m,'light')));return swap.get(m);});swap.set(world.materials.chessTop,arr);world.materials.chessTop=arr;}
 world.group.traverse(o=>{if(!o.isMesh)return;if(swap.has(o.material))o.material=swap.get(o.material);});
 // 6. The chess tables in the south-west corner of the park, one game still set up.
 group.add(chessCorner(world,P,keep,o3));
 // Era hooks: the fountain, the lamp and iron colours, and anything else registered on the world.
 if(world.fountain?.group?.userData.era)hooks.push(world.fountain.group.userData.era);
 world.decayHooks=(world.decayHooks||[]).concat(hooks);world.decayUniforms=uniforms;world.decayStats=stats;return group;}
// Set the decay layer now: t = 0 clean 2026, 1 ruined 2126.
export function applyDecay(world,t){DECAY.value=t;for(const h of world.decayHooks||[])h(t);}
// Tree boost for the park: the trees have had a century to grow.
export function treeBoost(p,park){const h=hash(p[0]*.7+p[1]*1.3);if(park&&pointInRing(p,park))return {height:1.55+h*.45,crown:1.7+h*.6,trunk:1.5};
 // Street trees have had a century too, though their pits hold them back.
 return {height:1.25+h*.3,crown:1.4+h*.4,trunk:1.35};}
// Volunteer trees self-seeded in the lawns (positions only; solid like the others).
export function volunteerTrees(d,park){if(!park)return [];const out=[];d.areas.filter(a=>a.kind==='grass'&&pointInRing(centroid(a.ring),park)&&Math.abs(ringArea(a.ring))>250).forEach((a,i)=>{if(hash(i*3.7)<.55){const p=scatter(a.ring,1,9000+i*13)[0];if(p)out.push({p,dbh:22+hash(i)*16,volunteer:true});}});return out;}
function chessCorner(world,P,keep,o3){const g=new T.Group();g.name='chess game';const tables=world.chessTables||[];if(!tables.length)return g;
 // A game abandoned mid-way on the first table: pawns, a few pieces, two knocked over.
 const t0=tables[0].p,ax=tables[0].axis,pe=[ax[1],-ax[0]],sq=.8/10,at=(f,r)=>{const u=(f-3.5)*sq,v=(r-3.5)*sq;return [t0[0]+ax[0]*u+pe[0]*v,t0[1]+ax[1]*u+pe[1]*v];};
 const pawn=keep(new T.LatheGeometry([[0,0],[.028,0],[.026,.012],[.014,.03],[.012,.05],[.02,.06],[0,.075]].map(([x,y])=>new T.Vector2(x,y)),8));
 const tall=keep(new T.LatheGeometry([[0,0],[.032,0],[.03,.014],[.015,.04],[.013,.08],[.022,.095],[.012,.11],[0,.125]].map(([x,y])=>new T.Vector2(x,y)),8));
 const W=[[0,1],[1,1],[2,3],[3,3],[5,1],[6,2],[7,1],[4,0,'t'],[6,0,'t'],[2,0,'t'],[3,2,'t']],B=[[0,6],[1,5],[3,4],[4,6],[5,6],[6,6],[7,5],[4,7,'t'],[2,5,'t'],[5,7,'t'],[0,7,'t',1],[6,4,'t',1]];
 for(const [list,c] of [[W,0xd8d0bc],[B,0x26231f]]){const mat=keep(decayMaterial(new T.MeshStandardMaterial({color:c,roughness:.6}),'light',{dissolve:true}));
  for(const kind of ['p','t']){const L=list.filter(x=>(x[2]||'p')===kind);if(!L.length)continue;const m=new T.InstancedMesh(kind==='p'?pawn:tall,mat,L.length);
   L.forEach((x,i)=>{const q=at(x[0],x[1]);o3.position.copy(toV(q,CURB_HEIGHT+.76+(x[3]?.02:0)));o3.rotation.set(x[3]?Math.PI/2:0,hash(i)*3,0);o3.scale.setScalar(1.4);o3.updateMatrix();m.setMatrixAt(i,o3.matrix);});m.computeBoundingSphere();g.add(m);}}
 return g;}
// The fountain, dry: a stained basin with leaf litter, moss on the rim and a young tree in the middle.
export function dryFountain(g,r,keep){// The fountain in both eras: water and jets in 2026, a dry stained basin with moss and a young tree in 2126.
 const basinMat=keep(new T.MeshStandardMaterial({map:keep(basinTexture()),roughness:.95}));basinMat.map.repeat.set(r/4,r/4);let water=null;
 for(const m of [...g.children]){if(m.material&&m.material.color&&m.geometry.type==='CircleGeometry'){water=m;water.material=keep(water.material.clone());water.material.transparent=true;const dry=new T.Mesh(m.geometry,basinMat);dry.rotation.copy(m.rotation);dry.position.copy(m.position);dry.position.y=.07;water.position.y=.14;g.add(dry);}
  else if(m.material&&m.material.color)m.material=keep(decayMaterial(m.material,'masonry'));}
 const jetMat=keep(new T.MeshStandardMaterial({color:0xe8f0f2,roughness:.2,transparent:true,opacity:.55,depthWrite:false})),jets=new T.Group();
 const cj=new T.Mesh(keep(new T.CylinderGeometry(.12,.35,3.4,10,1,true)),jetMat);cj.position.y=.82+1.7;jets.add(cj);
 for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8,j=new T.Mesh(keep(new T.CylinderGeometry(.04,.08,2.2,6,1,true)),jetMat);j.position.set(Math.sin(a)*(r-1.4),1.25,Math.cos(a)*(r-1.4));j.rotation.set(Math.cos(a)*-.9,0,Math.sin(a)*.9);jets.add(j);}g.add(jets);
 const ring=new T.Mesh(keep(new T.TorusGeometry(r-1.95,.2,6,64)),keep(new T.MeshStandardMaterial({color:0x3f4a26,roughness:1})));ring.rotation.x=Math.PI/2;ring.position.y=.1;g.add(ring);
 const sap=new T.Group();const trunk=new T.Mesh(keep(new T.CylinderGeometry(.08,.14,3.2,6)),keep(new T.MeshStandardMaterial({color:0x4b4134,roughness:1})));trunk.position.y=1.6;trunk.rotation.z=.08;
 const crown=new T.Mesh(keep(new T.IcosahedronGeometry(1.4,1)),keep(new T.MeshStandardMaterial({color:0x4f5f2c,roughness:.9,flatShading:true})));crown.position.set(.2,3.4,0);crown.scale.set(1,.8,1);sap.add(trunk,crown);sap.position.set(1.8,.05,-1.2);g.add(sap);
 g.userData.era=t=>{const k=Math.max(.001,t);if(water){water.material.opacity=1-t;water.visible=t<.999;}jetMat.opacity=.55*(1-t);jets.visible=t<.999;ring.scale.setScalar(k);ring.visible=t>.001;sap.scale.setScalar(k);sap.visible=t>.001;};g.userData.era(DECAY.value);
 return g;}
