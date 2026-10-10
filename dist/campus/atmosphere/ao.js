import * as T from '../../vendor/three.module.js';
// Baked ambient occlusion (Step A.1). Two cheap layers that cost almost nothing per frame:
//  1. Ground contact AO: a texture baked once at load over the whole map from the building footprints,
//     the Arch, tree trunks and canopies, benches, lamps and monuments, softly blurred, so pavements,
//     roads and lawns darken where they meet walls and under trees. Sampled by world x/z in the ground
//     materials (asphalt, slabs, park floor, lawns).
//  2. Wall base AO: building walls darken over their lowest couple of metres, where real streets collect
//     shade, and slightly under the first few metres of every street canyon.
// Both multiply only the ambient (indirect) light fully and the sun partly, so lamps and lit windows keep
// their punch at night. Strength comes from the graphics preset (dist/quality.js).
export const AO={strength:{value:1},tex:{value:null},box:{value:new T.Vector4(0,0,1,1)}};
// Bake the ground AO texture. data: campus data (map metres, x east, n north); px per metre ~1.4.
export function bakeGroundAO(data,{arch=null,pxPerM=1.4}={}){const B=data.meta.bounds,x0=B.minX-20,n1=B.maxN+20,W=B.maxX-B.minX+40,H=B.maxN-B.minN+40;
 const w=Math.min(2048,Math.round(W*pxPerM)),h=Math.min(2560,Math.round(H*pxPerM)),sx=w/W,sy=h/H;
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,w,h);
 const P=p=>[(p[0]-x0)*sx,(n1-p[1])*sy];
 // Each layer is drawn sharp on a scratch canvas, then composited once with a blur (one filter pass per
 // layer, not per shape).
 const L=document.createElement('canvas');L.width=w;L.height=h;const q=L.getContext('2d');
 const layer=(blurM,alpha,draw)=>{q.clearRect(0,0,w,h);q.fillStyle='#fff';draw(q);g.save();g.globalAlpha=alpha;g.filter=`blur(${Math.max(1,blurM*sx).toFixed(1)}px)`;g.drawImage(L,0,0);g.restore();};
 const poly=(q,ring)=>{q.beginPath();ring.forEach((p,i)=>{const r=P(p);i?q.lineTo(r[0],r[1]):q.moveTo(r[0],r[1]);});q.closePath();q.fill();};
 const disks=(q,list,r)=>{q.beginPath();for(const t of list){const c=P(t.p);q.moveTo(c[0]+Math.max(.6,r*sx),c[1]);q.arc(c[0],c[1],Math.max(.6,r*sx),0,Math.PI*2);}q.fill();};
 // Wide, faint layer: the general shade of tall street walls; then a tight, darker contact layer.
 layer(6,.35,q=>{for(const b of data.buildings)if((b.h||10)>12)poly(q,b.rings[0]);});
 layer(1.6,1,q=>{for(const b of data.buildings)poly(q,b.rings[0]);if(arch)poly(q,arch);});
 // Trees: a soft pool of shade under each canopy and a dark ring at the trunk; benches, lamps, monuments.
 layer(2.5,.34,q=>disks(q,data.trees||[],3.4));
 layer(.6,.6,q=>disks(q,data.trees||[],.55));
 layer(.6,.35,q=>disks(q,data.benches||[],.9));layer(.4,.45,q=>disks(q,data.lamps||[],.35));layer(.6,.5,q=>disks(q,data.monuments||[],1.2));
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.NoColorSpace;tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;tex.generateMipmaps=true;tex.minFilter=T.LinearMipmapLinearFilter;tex.anisotropy=4;
 AO.tex.value=tex;AO.box.value.set(x0,n1,W,H);return tex;}
const chain=(m,key,fn)=>{const prev=m.onBeforeCompile&&Object.prototype.hasOwnProperty.call(m,'onBeforeCompile')?m.onBeforeCompile:null,prevKey=prev&&m.customProgramCacheKey?m.customProgramCacheKey():'';
 m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);fn(sh);};m.customProgramCacheKey=()=>prevKey+'|'+key;m.needsUpdate=true;return m;};
const WORLD_VS=['#include <common>','#include <common>\nvarying vec3 vAoW;'];
const WORLD_VS2=['#include <worldpos_vertex>','#include <worldpos_vertex>\nvAoW=(modelMatrix*vec4(transformed,1.0)).xyz;'];
// Ground: sample the baked texture at the fragment's world position.
export function patchGroundAO(m){return chain(m,'aoGround',sh=>{sh.uniforms.aoTex=AO.tex;sh.uniforms.aoBox=AO.box;sh.uniforms.aoStrength=AO.strength;
 sh.vertexShader=sh.vertexShader.replace(...WORLD_VS).replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvAoW=(modelMatrix*vec4(transformed,1.0)).xyz;');
 if(!/vAoW=/.test(sh.vertexShader))sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvAoW=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vAoW;uniform sampler2D aoTex;uniform vec4 aoBox;uniform float aoStrength;')
  .replace('#include <aomap_fragment>',`#include <aomap_fragment>
 {vec2 auv=vec2((vAoW.x-aoBox.x)/aoBox.z,1.-((aoBox.y+vAoW.z)/aoBox.w));float occ=texture2D(aoTex,auv).r;float ao=1.-occ*.78*aoStrength;
  reflectedLight.indirectDiffuse*=ao;reflectedLight.directDiffuse*=mix(1.,ao,.35);}`);});}
// Walls: darken towards the ground. groundY is the street level the walls stand on.
export function patchWallAO(m,groundY=0){return chain(m,'aoWall',sh=>{sh.uniforms.aoStrength=AO.strength;sh.uniforms.aoGround={value:groundY};
 sh.vertexShader=sh.vertexShader.replace(...WORLD_VS);
 sh.vertexShader=/#include <worldpos_vertex>/.test(sh.vertexShader)?sh.vertexShader.replace(...WORLD_VS2):sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvAoW=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vAoW;uniform float aoStrength;uniform float aoGround;')
  .replace('#include <aomap_fragment>',`#include <aomap_fragment>
 {float hy=vAoW.y-aoGround;float ao=1.-aoStrength*(.5*(1.-smoothstep(0.,2.6,hy))+.15*(1.-smoothstep(2.,14.,hy)));
  reflectedLight.indirectDiffuse*=ao;reflectedLight.directDiffuse*=mix(1.,ao,.3);}`);});}
