// Settling snow (Step B). SNOW_COVER (0 bare .. 1 deep) comes from the live snow depth or a manual Snow sky
// (weather.js). Ground, roofs and the tops of tree crowns whiten in uneven drifts that fill in as cover
// grows; streets take less (traffic and plows turn it to grey slush), and snow is a little rougher.
export const SNOW_COVER={value:0};
const NOISE=`float snH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float snN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(snH(i),snH(i+vec2(1.,0.)),f.x),mix(snH(i+vec2(0.,1.)),snH(i+vec2(1.,1.)),f.x),f.y);}`;
// mode: 'ground' and 'roof' (upward surfaces, drifts by world position) or 'leaves' (crown tops, by the crown's own space).
// k: how much snow this surface holds; tint: what the snow becomes (white, or grey slush on streets).
export function patchSnow(m,mode='ground',k=1,tint=[.9,.92,.95]){const prev=Object.prototype.hasOwnProperty.call(m,'onBeforeCompile')?m.onBeforeCompile:null,prevKey=prev&&m.customProgramCacheKey?m.customProgramCacheKey():'';
 const t=tint.map(v=>v.toFixed(3)).join(',');
 m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.uniforms.uSnowCover=SNOW_COVER;
  if(mode!=='leaves')sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSnowW;')
   .replace('#include <project_vertex>','#include <project_vertex>\n#ifdef USE_INSTANCING\n vSnowW=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n#else\n vSnowW=(modelMatrix*vec4(transformed,1.)).xyz;\n#endif');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uSnowCover;'+(mode!=='leaves'?'varying vec3 vSnowW;':'')+'\n'+NOISE)
   .replace('#include <color_fragment>',`#include <color_fragment>
 float nvSnow=0.;if(uSnowCover>.001){${mode==='leaves'?'vec2 sp=vLeaf.xz*3.+vLeaf.y;float up=smoothstep(.05,.6,vLeaf.y);':'vec2 sp=vSnowW.xz*.35;float up=1.;'}
  float n=snN(sp)*.65+snN(sp*3.7)*.35;nvSnow=clamp((uSnowCover*1.3-(1.-n)*.75)*1.6,0.,1.)*up*${k.toFixed(3)};
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(${t}),nvSnow);}`)
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(roughnessFactor,.82,nvSnow);');};
 m.customProgramCacheKey=()=>prevKey+'|snow-'+mode+k;m.needsUpdate=true;return m;}
