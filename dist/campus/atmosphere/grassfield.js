import * as T from '../../vendor/three.module.js';
import {DECAY} from './decay.js?v=24';
import {WIND,WIND_DIR,FOLIAGE_TIME} from './foliage.js?v=24';
// Dense grass on the overgrown lawns (Step A.6). One instanced draw of thin bent blades in a square field
// that follows the camera; each blade keeps a fixed place in the world (the field wraps by whole field
// widths), so nothing slides as you drive. A lawn mask baked once from the map's grass and pitch areas
// collapses every blade that is not on a lawn. Blades grow with the decay layer (mown lawns in 2026, a
// meadow in 2126), bend in the wind and fade out towards the edge of the field. The existing tall tufts
// (decay.js) carry the meadow further out.
// Presets: Low none, Medium 26,000 blades within about 28 m, High 72,000 within about 42 m.
export const GRASS_LEVELS={off:{n:0,r:0},medium:{n:26000,r:28},high:{n:72000,r:42}};
function bakeLawnMask(data,pxPerM=1.5){const B=data.meta.bounds,x0=B.minX-20,n1=B.maxN+20,W=B.maxX-B.minX+40,H=B.maxN-B.minN+40;
 const w=Math.min(2048,Math.round(W*pxPerM)),h=Math.min(2560,Math.round(H*pxPerM)),sx=w/W,sy=h/H,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
 g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#fff';
 for(const a of data.areas||[]){if(a.kind!=='grass'&&a.kind!=='pitch')continue;g.beginPath();a.ring.forEach((p,i)=>{const X=(p[0]-x0)*sx,Y=(n1-p[1])*sy;i?g.lineTo(X,Y):g.moveTo(X,Y);});g.closePath();g.fill();}
 const t=new T.CanvasTexture(c);t.colorSpace=T.NoColorSpace;t.minFilter=T.LinearFilter;t.generateMipmaps=false;return {tex:t,box:new T.Vector4(x0,n1,W,H)};}
export function buildGrassField(data,{groundY=.16}={}){const MAX=GRASS_LEVELS.high.n,mask=bakeLawnMask(data);
 // Blade: a 3-segment strip, 7 vertices, base at y=0, height 1, width 1 at the base narrowing to a tip.
 const P=[],idx=[];for(let i=0;i<=3;i++){const v=i/3,w=.5*(1-v*.85);if(i<3){P.push(-w,v,0,w,v,0);}else P.push(0,1,0);}
 for(let i=0;i<2;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}idx.push(4,5,6);
 const g=new T.InstancedBufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(new Array(P.length/3).fill([0,1,0]).flat(),3));g.setIndex(idx);
 const off=new Float32Array(MAX*4);let s=12345;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<MAX;i++){off[i*4]=rnd();off[i*4+1]=rnd();off[i*4+2]=rnd();off[i*4+3]=rnd()*6.283;}
 g.setAttribute('aOff',new T.InstancedBufferAttribute(off,4));g.instanceCount=0;
 const U={gMask:{value:mask.tex},gBox:{value:mask.box},gField:{value:84},gRadius:{value:42},gY:{value:groundY},uDecay:DECAY,fWind:WIND,fWindDir:WIND_DIR,fTime:FOLIAGE_TIME};
 const m=new T.MeshStandardMaterial({color:0xffffff,roughness:.95,side:T.DoubleSide});
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
uniform sampler2D gMask;uniform vec4 gBox;uniform float gField;uniform float gRadius;uniform float gY;uniform float uDecay;uniform float fWind;uniform vec2 fWindDir;uniform float fTime;
attribute vec4 aOff;varying vec3 vGrass;`)
   .replace('#include <beginnormal_vertex>','vec3 objectNormal=vec3(0.,1.,0.);\n#ifdef USE_TANGENT\nvec3 objectTangent=vec3(1.,0.,0.);\n#endif')
   .replace('#include <begin_vertex>',`// World place of this blade: fixed in the world, wrapped to the field around the camera.
 vec2 o=aOff.xy*gField;vec2 cam=cameraPosition.xz;vec2 wp=o+floor((cam-o)/gField+.5)*gField;
 float d=length(wp-cam);vec2 muv=vec2((wp.x-gBox.x)/gBox.z,1.-((gBox.y+wp.y)/gBox.w));// wp.y is three's z, which is minus north
 float lawn=step(.5,texture2D(gMask,muv).r);
 float grow=smoothstep(.15,.85,uDecay);float fade=1.-smoothstep(gRadius*.6,gRadius,d);
 float hgt=(.35+.75*aOff.z)*grow*fade*lawn;
 float c=cos(aOff.w),s=sin(aOff.w);vec3 p=position;
 float bend=p.y*p.y*(.18+.35*fWind+.25*fWind*sin(fTime*1.7+wp.x*.31+wp.y*.23));
 vec3 transformed=vec3(wp.x,gY,wp.y)+vec3((c*p.x)*.06+fWindDir.x*bend*hgt,p.y*hgt,(s*p.x)*.06+fWindDir.y*bend*hgt);
 vGrass=vec3(p.y,aOff.z,aOff.w);`)
   .replace('#include <project_vertex>','vec4 mvPosition=viewMatrix*vec4(transformed,1.);gl_Position=projectionMatrix*mvPosition;')
   .replace('#include <worldpos_vertex>','vec4 worldPosition=vec4(transformed,1.);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGrass;')
   .replace('#include <color_fragment>',`#include <color_fragment>
 {vec3 base=mix(vec3(.13,.16,.07),vec3(.2,.21,.09),vGrass.y),tip=mix(vec3(.46,.47,.24),vec3(.58,.52,.3),fract(vGrass.z*.37));
  diffuseColor.rgb=mix(base,tip,smoothstep(.0,1.,vGrass.x));}`);};
 m.customProgramCacheKey=()=>'nv-grassfield';
 const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.receiveShadow=true;mesh.castShadow=false;mesh.name='grass field';mesh.visible=false;mesh.renderOrder=1;
 let level='off';
 return {mesh,setLevel(l){level=GRASS_LEVELS[l]?l:'off';const L=GRASS_LEVELS[level];g.instanceCount=L.n;U.gRadius.value=L.r;U.gField.value=Math.max(1,L.r*2);mesh.visible=L.n>0&&DECAY.value>.05;},
  update(){const L=GRASS_LEVELS[level];mesh.visible=L.n>0&&DECAY.value>.05;},dispose(){g.dispose();m.dispose();mask.tex.dispose();}};}
