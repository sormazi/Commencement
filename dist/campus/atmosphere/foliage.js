import * as T from '../../vendor/three.module.js';
// Foliage (Step A.6). Better tree crowns and wind.
// Crown: a lumpy icosphere (320 triangles, displaced by smooth noise so each crown reads as clumps of leaves
// rather than a faceted ball), with soft normals. Leaf shader: clump-scale colour variation, a darker,
// cooler underside and inner shade, a lighter sky-lit top, and a fine leaf grain that breaks up the surface.
// Wind: crowns sway with two slow sine waves whose phase comes from each tree's position, so a gust rolls
// across the park instead of every tree moving together. WIND.value (0 calm .. 1 gale) is set by the
// weather (Step B); until then a light breeze.
export const WIND={value:.35},WIND_DIR={value:new T.Vector2(.8,.6)},FOLIAGE_TIME={value:0};
const h3=(x,y,z)=>{const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);};
function vnoise3(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz,s=t=>t*t*(3-2*t),u=s(fx),v=s(fy),w=s(fz);
 const L=(a,b,t)=>a+(b-a)*t,c=(i,j,k)=>h3(ix+i,iy+j,iz+k);
 return L(L(L(c(0,0,0),c(1,0,0),u),L(c(0,1,0),c(1,1,0),u),v),L(L(c(0,0,1),c(1,0,1),u),L(c(0,1,1),c(1,1,1),u),v),w);}
export function crownGeometry(){const g=new T.IcosahedronGeometry(1,2),p=g.attributes.position,n=new Float32Array(p.count*3),v=new T.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();const d=v.clone();
  const r=1+.15*(vnoise3(d.x*2.2+5,d.y*2.2,d.z*2.2)-.5)*2+.06*(vnoise3(d.x*5.1,d.y*5.1+3,d.z*5.1)-.5)*2;v.multiplyScalar(r);if(v.y<-.35)v.y=-.35+(v.y+.35)*.6;// flatter underside
  p.setXYZ(i,v.x,v.y,v.z);n[i*3]=d.x;n[i*3+1]=d.y;n[i*3+2]=d.z;}
 g.computeVertexNormals();const fn=g.attributes.normal;// soft facets: mostly the sphere normal, a little of the face normal
 for(let i=0;i<p.count;i++){const a=new T.Vector3(n[i*3],n[i*3+1],n[i*3+2]).multiplyScalar(.7).add(new T.Vector3().fromBufferAttribute(fn,i).multiplyScalar(.3)).normalize();fn.setXYZ(i,a.x,a.y,a.z);}
 return g;}
const NOISE=`float fhash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float fnoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(fhash(i),fhash(i+vec3(1,0,0)),f.x),mix(fhash(i+vec3(0,1,0)),fhash(i+vec3(1,1,0)),f.x),f.y),mix(mix(fhash(i+vec3(0,0,1)),fhash(i+vec3(1,0,1)),f.x),mix(fhash(i+vec3(0,1,1)),fhash(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
// Sway offset in the crown's own (unit) space; the instance matrix scales it to the crown's size.
const SWAY=`vec3 fSway(vec3 o,vec2 base){float ph=base.x*.071+base.y*.053;float t=fTime;
 float g=fWind*(.035*sin(t*1.1+ph)+.018*sin(t*2.3+ph*1.7)+.012*sin(t*4.1+ph*2.9+o.x*2.))+fWind*fWind*.03;float k=clamp(o.y*.5+.6,0.,1.4);
 return vec3(fWindDir.x*g*k,0.,fWindDir.y*g*k);}`;
const base=`#ifdef USE_INSTANCING\n vec2 fBase=vec2(nvIM[3].x,nvIM[3].z);\n#else\n vec2 fBase=vec2(0.);\n#endif`;// nvIM: the era-blended instance matrix (decay.js blendInstances)
// Leaves: patch an (already instance-blended) MeshStandardMaterial. Chains any earlier onBeforeCompile.
export function patchLeaves(m){const prev=Object.prototype.hasOwnProperty.call(m,'onBeforeCompile')?m.onBeforeCompile:null,prevKey=prev&&m.customProgramCacheKey?m.customProgramCacheKey():'';
 m.flatShading=false;
 m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);Object.assign(sh.uniforms,{fWind:WIND,fWindDir:WIND_DIR,fTime:FOLIAGE_TIME});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float fWind;uniform vec2 fWindDir;uniform float fTime;varying vec3 vLeaf;\n'+SWAY)
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvLeaf=position;\n'+base+'\ntransformed+=fSway(position,fBase);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLeaf;\n'+NOISE)
   .replace('#include <color_fragment>',`#include <color_fragment>
 {float clump=fnoise(vLeaf*3.1+7.)*.6+fnoise(vLeaf*7.3)*.4;float grain=fnoise(vLeaf*23.);
  float up=clamp(vLeaf.y*.75+.5,0.,1.);
  diffuseColor.rgb*=mix(.62,1.12,up)*(.82+.36*clump)*(.9+.2*grain);
  diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.86,.95,1.05),(1.-up)*.5);}`)
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 {vec3 q=vLeaf*13.;vec3 gq=vec3(fnoise(q+vec3(.5,0.,0.))-fnoise(q-vec3(.5,0.,0.)),fnoise(q+vec3(0.,.5,0.))-fnoise(q-vec3(0.,.5,0.)),fnoise(q+vec3(0.,0.,.5))-fnoise(q-vec3(0.,0.,.5)));
  vec3 q2=vLeaf*31.;gq+=.5*vec3(fnoise(q2+vec3(.5,0.,0.))-fnoise(q2-vec3(.5,0.,0.)),fnoise(q2+vec3(0.,.5,0.))-fnoise(q2-vec3(0.,.5,0.)),fnoise(q2+vec3(0.,0.,.5))-fnoise(q2-vec3(0.,0.,.5)));
  normal=normalize(normal+(viewMatrix*vec4(gq,0.)).xyz*.9);}`);};
 m.customProgramCacheKey=()=>prevKey+'|leaves2';m.needsUpdate=true;return m;}
