import * as T from '../../vendor/three.module.js';
import {CURB_HEIGHT} from '../collision.js?v=24';
import {hash,inSlice,DECAY} from './decay.js?v=24';
// "Dead of night" for Washington Square: almost every lamp is dead; a few still burn, some of them
// flickering; fog drifts in low between the trees. Cost: two instanced meshes for the live lanterns
// and their halos, one for the fog cards, and a pool of three point lights that follow the nearest
// live lamps (lit only at night).
const FLICKER=`float nvFlick(float t,float s){if(s<.55)return .85+.15*sin(t*1.7+s*40.);
 float k=floor(t*7.+s*93.);float on=step(.28,fract(sin(k*12.9898+s*78.233)*43758.5453));
 float slow=step(.15,fract(sin(floor(t*.35+s*11.)*4.13)*913.7));return on*slow*(.6+.4*fract(sin(k*3.1)*99.));}`;
export function flicker(t,s){if(s<.55)return .85+.15*Math.sin(t*1.7+s*40);const fr=x=>x-Math.floor(x);const k=Math.floor(t*7+s*93);
 const on=fr(Math.sin(k*12.9898+s*78.233)*43758.5453)>=.28?1:0,slow=fr(Math.sin(Math.floor(t*.35+s*11)*4.13)*913.7)>=.15?1:0;return on*slow*(.6+.4*fr(Math.sin(k*3.1)*99));}
function haloTexture(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,214,150,1)');r.addColorStop(.25,'rgba(255,190,120,.45)');r.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=r;g.fillRect(0,0,64,64);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
function fogTexture(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const r=(i=>()=>(i=(i*16807)%2147483647)/2147483647)(17);
 for(let i=0;i<40;i++){const x=20+r()*88,y=40+r()*48,s=14+r()*26,gr=g.createRadialGradient(x,y,0,x,y,s);gr.addColorStop(0,'rgba(200,210,220,.22)');gr.addColorStop(1,'rgba(200,210,220,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}
 const t=new T.CanvasTexture(c);return t;}
// Instanced material whose brightness follows nvFlick(time, seed); seed from the instance position.
// Lamp brightness: in 2126 (decay layer on) only the live lamps burn, some flickering; in 2026 every lamp is lit.
const LAMP=`float nvLamp(float t,float s,float alive){return mix(1.,alive*nvFlick(t,s),uDecay);}`;
function flickerMaterial(base,uniforms,key){base.onBeforeCompile=sh=>{sh.uniforms.uTime=uniforms.uTime;sh.uniforms.uNight=uniforms.uNight;sh.uniforms.uDecay=DECAY;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;uniform float uNight;uniform float uDecay;attribute float aSeed;attribute float aAlive;varying float vFl;\n'+FLICKER+LAMP).replace('#include <begin_vertex>','#include <begin_vertex>\nvFl=nvLamp(uTime,aSeed,aAlive)*uNight;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFl;').replace('#include <opaque_fragment>','outgoingLight*=mix(.05,1.,vFl);\n#include <opaque_fragment>');};
 base.customProgramCacheKey=()=>'nv-flicker-'+key;return base;}
export function buildNight(world){const d=world.data,group=new T.Group();group.name='dead of night';const keep=x=>{world.disposables.add(x);return x;};
 const uniforms={uTime:{value:0},uNight:{value:0}},o3=new T.Object3D();
 // Live lamps: about one in nine in the park slice, one in thirty elsewhere.
 // Each live lamp glows at its own head (park lantern, plaza globes or street-pole head; see park.js).
 const lampList=world.lamps||d.lamps.map(l=>({p:l.p,head:[l.p[0],4.45,l.p[1]]}));
 const all=lampList.map(l=>({p:l.p,head:l.head,seed:hash(l.p[0]*7.31+l.p[1]*3.17),alive:hash(l.p[0]*2.17+l.p[1]*.31)<(inSlice(l.p)?.11:.035)?1:0})),live=all.filter(l=>l.alive);
 // Each lamp's flicker seed and whether it survives to 2126 travel as instanced attributes, so the real lights match the glow.
 const seeds=new Float32Array(all.map(l=>l.seed)),alive=new Float32Array(all.map(l=>l.alive));
 const lg=keep(new T.BoxGeometry(.42,.55,.42));lg.setAttribute('aSeed',new T.InstancedBufferAttribute(seeds,1));lg.setAttribute('aAlive',new T.InstancedBufferAttribute(alive,1));const lm=keep(flickerMaterial(new T.MeshBasicMaterial({color:0xffd9a0}),uniforms,'lantern'));const lantern=new T.InstancedMesh(lg,lm,all.length);
 const hg=keep(new T.PlaneGeometry(1,1));hg.setAttribute('aSeed',new T.InstancedBufferAttribute(seeds,1));hg.setAttribute('aAlive',new T.InstancedBufferAttribute(alive,1));const hm=new T.MeshBasicMaterial({map:keep(haloTexture()),transparent:true,depthWrite:false,blending:T.AdditiveBlending,color:0xffc890});keep(hm);
 hm.onBeforeCompile=sh=>{sh.uniforms.uTime=uniforms.uTime;sh.uniforms.uNight=uniforms.uNight;sh.uniforms.uDecay=DECAY;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;uniform float uNight;uniform float uDecay;attribute float aSeed;attribute float aAlive;varying float vFl;\n'+FLICKER+LAMP).replace('#include <project_vertex>',`vFl=nvLamp(uTime,aSeed,aAlive)*uNight;
vec4 mvPosition=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);mvPosition.xy+=position.xy*3.2;gl_Position=projectionMatrix*mvPosition;`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFl;').replace('#include <opaque_fragment>','outgoingLight*=vFl;diffuseColor.a*=vFl;\n#include <opaque_fragment>');};
 hm.customProgramCacheKey=()=>'nv-halo';const halo=new T.InstancedMesh(hg,hm,all.length);
 all.forEach((l,i)=>{o3.position.set(l.head[0],CURB_HEIGHT+l.head[1],-l.head[2]);o3.rotation.set(0,0,0);o3.scale.set(1.01,1.01,1.01);o3.updateMatrix();lantern.setMatrixAt(i,o3.matrix);halo.setMatrixAt(i,o3.matrix);});
 for(const m of [lantern,halo]){m.computeBoundingSphere();m.frustumCulled=false;group.add(m);}halo.renderOrder=3;
 // Pool of real lights on the nearest live lamps.
 const pool=[0,1,2].map(()=>{const L=new T.PointLight(0xffc98a,0,26,1.6);group.add(L);return L;});
 // Fog: soft vertical cards drifting low around the camera.
 const N=26,fg=keep(new T.PlaneGeometry(1,1)),fm=new T.MeshBasicMaterial({map:keep(fogTexture()),transparent:true,depthWrite:false,color:0x56606e,opacity:.32,fog:true});keep(fm);
 fm.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','vec4 mvPosition=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);mvPosition.xy+=position.xy*vec2(instanceMatrix[0].x,instanceMatrix[1].y);gl_Position=projectionMatrix*mvPosition;');};fm.customProgramCacheKey=()=>'nv-fogcard';
 const fog=new T.InstancedMesh(fg,fm,N);fog.frustumCulled=false;fog.renderOrder=4;group.add(fog);const cards=Array.from({length:N},(_,i)=>({x:0,z:0,y:0,w:0,h:0,init:false,i}));
 // Levels: lamps 0..1 (how lit the surviving lamps are), cards 0..1 (ground fog), fog colour tint for daytime haze.
 let lamps=0,cardLv=0;const nightCard=new T.Color(0x56606e),tint=new T.Color();
 // Ground fog is part of the ruin: thinner in 2026.
 const setLevels=(l,c,fogRGB)=>{lamps=l;cardLv=c;uniforms.uNight.value=l;lantern.visible=halo.visible=l>.01;for(const L of pool)L.visible=l>.01;fog.visible=c>.01;fm.opacity=.32*Math.min(1,c*1.15)*(.3+.7*DECAY.value);
  if(fogRGB){tint.setRGB(fogRGB[0]*1.08,fogRGB[1]*1.08,fogRGB[2]*1.08);fm.color.copy(tint).lerp(nightCard,Math.min(1,c));}else fm.color.copy(nightCard);};
 return {group,live,all,setLevels,setNight(v){setLevels(v?1:0,v?1:0);},
  update(time,camera){uniforms.uTime.value=time;if(lamps<=.01&&cardLv<=.01)return;const cx=camera.position.x,cz=camera.position.z;
   // Nearest live lamps get the real lights.
   const t=DECAY.value,near=(t>.5?live:all).map(l=>({l,d:(l.p[0]-cx)**2+(-l.p[1]-cz)**2})).sort((a,b)=>a.d-b.d).slice(0,pool.length);
   pool.forEach((L,i)=>{const e=near[i];if(!e||e.d>90*90||lamps<=.01){L.intensity=0;return;}L.position.set(e.l.head[0],CURB_HEIGHT+e.l.head[1]-.25,-e.l.head[2]);L.intensity=55*lamps*(1+(e.l.alive*flicker(time,e.l.seed)-1)*t);});
   // Fog cards wrap round the camera and drift slowly east.
   cards.forEach(c=>{let dx=c.x-cx,dz=c.z-cz;if(!c.init||Math.hypot(dx,dz)>75){const a=hash(c.i*7.1+Math.floor(time))*6.28,r=18+hash(c.i*3.3+time)*55;c.x=cx+Math.cos(a)*r;c.z=cz+Math.sin(a)*r;c.y=.8+hash(c.i)*2.5;c.w=14+hash(c.i*2)*18;c.h=3+hash(c.i*5)*3;c.init=true;}
    c.x+=.012;c.z+=.004;o3.position.set(c.x,c.y,c.z);o3.rotation.set(0,0,0);o3.scale.set(c.w,c.h,1);o3.updateMatrix();fog.setMatrixAt(c.i,o3.matrix);});fog.instanceMatrix.needsUpdate=true;}};}
