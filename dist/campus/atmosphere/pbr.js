import * as T from '../../vendor/three.module.js';
import {KTX2Loader} from '../../vendor/addons/loaders/KTX2Loader.js';
// Physically based surface detail (Step A.2). CC0 materials from ambientCG, compressed to KTX2 by
// tools/build-pbr.mjs (credits in credits.html). The game's colours stay as they are (tax-lot classes,
// facade atlas, paving joints); these maps add what flat colour cannot: the relief of brick courses and
// mortar, the grain of brownstone, limestone, concrete and painted iron, and roughness that varies across
// a surface. Building walls pick their tile from the facade code (tier3/facades.js MATERIAL_TILE); ground
// surfaces get asphalt and concrete-flag sets. Off on Low; on at Medium and High.
export const WALL_TILES=['Concrete034','Bricks101','Bricks105','Concrete012','Travertine009','Metal027','flat','Concrete047A'];
// Metres covered by one repeat of each wall tile, in the same order. Brick tiles are sized to the US
// course of about 6.8 cm (three courses to 8 in): Bricks101 has 24 courses per tile, Bricks105 has 16.
const WALL_SCALE=[2.5,1.62,1.08,2.5,3.0,2.0,2.0,2.5];
export const PBR={want:false,on:{value:0},strength:{value:1},wallN:{value:null},wallP:{value:null},asphaltN:{value:null},asphaltP:{value:null},sidewalkN:{value:null},sidewalkP:{value:null}};
let loader=null;const pending=[];
// Called once by the renderer, before the world loads. Loading is asynchronous: surfaces simply gain their
// detail when the files arrive, and stay plain if the browser cannot transcode KTX2.
export function initPBR(renderer,base='vendor/addons/libs/basis/'){if(loader)return;loader=new KTX2Loader().setTranscoderPath(base).detectSupport(renderer);
 const load=(file,key,srgb=false)=>loader.loadAsync('assets/pbr/'+file).then(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.needsUpdate=true;PBR[key].value=t;return t;}).catch(e=>{console.warn('pbr',file,e.message);});
 for(const [f,k] of [['walls-normal.ktx2','wallN'],['walls-params.ktx2','wallP'],['asphalt-normal.ktx2','asphaltN'],['asphalt-params.ktx2','asphaltP'],['sidewalk-normal.ktx2','sidewalkN'],['sidewalk-params.ktx2','sidewalkP']])pending.push(load(f,k));
 PBR.ready=Promise.all(pending).then(r=>{PBR.loaded=r.every(Boolean);setPBR(PBR.want);});}
// The graphics preset asks for detail; it only switches on once every file has arrived.
export function setPBR(want){PBR.want=want;PBR.on.value=want&&PBR.loaded?1:0;}
const chain=(m,key,fn)=>{const prev=m.onBeforeCompile&&Object.prototype.hasOwnProperty.call(m,'onBeforeCompile')?m.onBeforeCompile:null,prevKey=prev&&m.customProgramCacheKey?m.customProgramCacheKey():'';
 m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);fn(sh);};m.customProgramCacheKey=()=>prevKey+'|'+key;m.needsUpdate=true;return m;};
const VS=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vPbrW;varying vec3 vPbrN;')
 .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvPbrW=(modelMatrix*vec4(transformed,1.0)).xyz;vPbrN=normalize(mat3(modelMatrix)*objectNormal);');};
// Shared fragment helpers: perturb the view-space normal with a tangent-space map given the surface's
// world tangent and bitangent.
const FS_COMMON=`varying vec3 vPbrW;varying vec3 vPbrN;uniform float pbrOn;uniform float pbrStrength;
vec3 pbrPerturb(vec3 n,vec3 tW,vec3 bW,vec3 m,float k){vec3 tv=normalize((viewMatrix*vec4(tW,0.)).xyz),bv=normalize((viewMatrix*vec4(bW,0.)).xyz);m=m*2.-1.;m.xy*=k;return normalize(tv*m.x+bv*m.y+n*max(m.z,.2));}`;
// Building walls (tier3 and generic massing). Uses vFacade (tile = code / 256) and nvWall (wall vs window).
export function patchWallPBR(m){return chain(m,'pbrWall',sh=>{Object.assign(sh.uniforms,{pbrOn:PBR.on,pbrStrength:PBR.strength,tWallN:PBR.wallN,tWallP:PBR.wallP});VS(sh);
 const scales=WALL_SCALE.map(v=>v.toFixed(2)).join(',');
 sh.fragmentShader=sh.fragmentShader.replace('varying float vFacade;','varying float vFacade;\n'+FS_COMMON+`
uniform sampler2D tWallN;uniform sampler2D tWallP;float pbrScale[8]=float[8](${scales});
vec3 pbrWallT;vec2 pbrAuv,pbrDx,pbrDy;float pbrUse;
void pbrWallSetup(){vec3 N=normalize(vPbrN);pbrUse=pbrOn*(1.-smoothstep(.6,.8,abs(N.y)));pbrWallT=normalize(vec3(-N.z,0.,N.x));
 float tile=floor(floor(vFacade+.5)/256.+.001);float sc=pbrScale[int(clamp(tile,0.,7.))];vec2 uv=vec2(dot(vPbrW.xz,pbrWallT.xz),vPbrW.y)/sc;
 vec2 org=vec2(mod(tile,4.),floor(tile/4.))*512.;// KTX2 is not flipped on upload: v=0 is the atlas's top row.
 vec2 k=vec2(496./2048.,496./1024.);pbrAuv=(org+8.)/vec2(2048.,1024.)+fract(uv)*k;pbrDx=dFdx(uv)*k;pbrDy=dFdy(uv)*k;}`)
  .replace('#include <color_fragment>',`#include <color_fragment>
 pbrWallSetup();vec4 pbrP=pbrUse>0.?textureGrad(tWallP,pbrAuv,pbrDx,pbrDy):vec4(.7,.5,1.,1.);float pbrW=pbrUse*nvWall;
 diffuseColor.rgb*=mix(1.,(.62+.76*pbrP.g)*mix(1.,pbrP.b,.6),pbrW*.85*pbrStrength);`)
  .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(roughnessFactor,pbrP.r,pbrW*.8);')
  .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 if(pbrW>.01){vec3 pm=textureGrad(tWallN,pbrAuv,pbrDx,pbrDy).xyz;normal=normalize(mix(normal,pbrPerturb(normal,pbrWallT,vec3(0.,1.,0.),pm,1.2*pbrStrength),pbrW));}`);});}
// Ground: asphalt (the street plane) and concrete flags (slabs and park floor), sampled by world x/z.
export function patchGroundPBR(m,kind,scale){return chain(m,'pbr'+kind,sh=>{const N=kind+'N',P=kind+'P';Object.assign(sh.uniforms,{pbrOn:PBR.on,pbrStrength:PBR.strength,['t'+N]:PBR[N],['t'+P]:PBR[P]});VS(sh);
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+FS_COMMON+`\nuniform sampler2D t${N};uniform sampler2D t${P};`)
  .replace('#include <color_fragment>',`#include <color_fragment>
 vec2 gUv=vec2(vPbrW.x,-vPbrW.z)/${scale.toFixed(2)};float gOn=pbrOn*smoothstep(.7,.9,normalize(vPbrN).y);vec4 gP=gOn>0.?texture2D(t${P},gUv):vec4(.85,.5,1.,1.);
 diffuseColor.rgb*=mix(1.,(.7+.6*gP.g)*mix(1.,gP.b,.5),gOn*.8*pbrStrength);`)
  .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(roughnessFactor,gP.r,gOn*.85);')
  .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 if(gOn>.01){vec3 pm=texture2D(t${N},gUv).xyz;normal=normalize(mix(normal,pbrPerturb(normal,vec3(1.,0.,0.),vec3(0.,0.,-1.),pm,1.*pbrStrength),gOn));}`);});}
