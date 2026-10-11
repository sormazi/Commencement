import * as T from '../../vendor/three.module.js';
import {DECAY} from './decay.js?v=24';
import {WIND,WIND_DIR} from './foliage.js?v=24';
// Manhole steam (Step B). On cold days Manhattan's street vents breathe steam. There is no open dataset of
// the actual vents in the study area, so plumes rise from a fixed, deterministic set of manholes in the
// roadway near about one intersection in six (an approximation, recorded as unchecked). Each plume is a
// loop of soft puffs in one instanced draw: they rise, swell and thin, and bend with the wind. Strength
// grows as the temperature drops below about 6 C and when the street is wet; fainter in 2126, when much
// of the steam system has failed.
const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
function puffTexture(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,2,32,32,31);
 r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(.5,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);const t=new T.CanvasTexture(c);return t;}
export function steamVents(data){const S=data.streets,deg=new Map();for(const [a,b] of S.edges){deg.set(a,(deg.get(a)||0)+1);deg.set(b,(deg.get(b)||0)+1);}
 const out=[];for(const [n,k] of deg){if(k<3||hash(n*1.37+.5)>.17)continue;const p=S.nodes[n];// a few metres into one of the streets meeting here
  const e=S.edges.find(([a,b])=>a===n||b===n);if(!e)continue;const q=S.nodes[e[0]===n?e[1]:e[0]],L=Math.hypot(q[0]-p[0],q[1]-p[1])||1,d=Math.min(L*.4,7+hash(n)*5);
  out.push([p[0]+(q[0]-p[0])/L*d,p[1]+(q[1]-p[1])/L*d]);}return out;}
export function buildSteam(data,{groundY=.02,perVent=12}={}){const vents=steamVents(data),N=vents.length*perVent;
 const g=new T.InstancedBufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3));g.setIndex([0,1,2,0,2,3]);
 const a=new Float32Array(N*4);vents.forEach((v,i)=>{for(let k=0;k<perVent;k++){const j=(i*perVent+k)*4;a[j]=v[0];a[j+1]=-v[1];a[j+2]=k/perVent;a[j+3]=hash(i*31+k);}});
 g.setAttribute('aVent',new T.InstancedBufferAttribute(a,4));g.instanceCount=N;
 const U={uTime:{value:0},uMap:{value:puffTexture()},uAmt:{value:0},uCol:{value:new T.Color(1,1,1)},uWind:WIND,uWindDir:WIND_DIR,uY:{value:groundY}};
 const m=new T.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,vertexShader:`uniform float uTime;uniform float uWind;uniform vec2 uWindDir;uniform float uY;attribute vec4 aVent;varying vec2 vUv;varying float vA;
void main(){vUv=position.xy+.5;float life=4.5+aVent.w*1.5;float t=fract(uTime/life+aVent.z);
 float h=t*6.5;vec3 c=vec3(aVent.x,uY+h,aVent.y)+vec3(uWindDir.x,0.,uWindDir.y)*uWind*h*h*.35+vec3(sin(aVent.w*40.+uTime*.6),0.,cos(aVent.w*23.+uTime*.5))*.25*t;
 float size=.5+t*2.6;vA=smoothstep(0.,.12,t)*(1.-t)*(1.-t);
 vec4 mv=viewMatrix*vec4(c,1.);mv.xy+=position.xy*size;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform sampler2D uMap;uniform float uAmt;uniform vec3 uCol;varying vec2 vUv;varying float vA;void main(){float a=texture2D(uMap,vUv).a*vA*uAmt;if(a<.004)discard;gl_FragColor=vec4(uCol,a);}`});
 const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=5;mesh.name='steam';mesh.visible=false;
 return {mesh,vents,update(time,w,fogCol,night){const cold=Math.min(1,Math.max(0,(6-w.temp)/10)),amt=cold*(.55+.45*Math.max(w.wet,w.rain))*(1-.6*DECAY.value);
  U.uAmt.value=amt*.55;mesh.visible=amt>.02;if(!mesh.visible)return;U.uTime.value=time;U.uCol.value.copy(fogCol).multiplyScalar(1.3).addScalar(.25+.1*night);},dispose(){g.dispose();m.dispose();U.uMap.value.dispose();}};}
