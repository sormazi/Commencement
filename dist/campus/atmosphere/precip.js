import * as T from '../../vendor/three.module.js';
import {WIND,WIND_DIR} from './foliage.js?v=24';
// Rain and snow (Step B). One instanced draw of thin quads in a box that wraps round the camera (like the
// grass field), so drops keep their places in the world and nothing pops as you drive. Rain falls at about
// 9 m/s as faint streaks stretched along their motion and slanted by the wind; snow falls at about 1 m/s
// as small soft flakes that wander. How many are drawn follows the intensity, up to the preset's limit:
// Low 2,500, Medium 7,000, High 16,000. Lit by the scene's fog colour and the lamps' night level, so drops
// read pale by day and catch light at night.
export const PRECIP_LIMITS={low:2500,medium:7000,high:16000};
export function buildPrecip(){const MAX=PRECIP_LIMITS.high;
 const g=new T.InstancedBufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-.5,0,0,.5,0,0,.5,1,0,-.5,1,0],3));g.setIndex([0,1,2,0,2,3]);
 const a=new Float32Array(MAX*4);let s=777;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<MAX*4;i++)a[i]=rnd();
 g.setAttribute('aSeed',new T.InstancedBufferAttribute(a,4));g.instanceCount=0;
 const U={uTime:{value:0},uSnow:{value:0},uBox:{value:new T.Vector3(44,26,44)},uWind:WIND,uWindDir:WIND_DIR,uCol:{value:new T.Color(.8,.82,.85)},uAlpha:{value:.3},uCam:{value:new T.Vector3()}};
 const m=new T.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,fog:false,vertexShader:`
uniform float uTime;uniform float uSnow;uniform vec3 uBox;uniform float uWind;uniform vec2 uWindDir;uniform vec3 uCam;attribute vec4 aSeed;varying vec2 vUv;varying float vFade;
void main(){vUv=position.xy+vec2(.5,0.);
 float speed=mix(8.5+3.*aSeed.w,.9+.5*aSeed.w,uSnow);vec3 vel=vec3(uWindDir.x*uWind*mix(4.,2.2,uSnow),-speed,uWindDir.y*uWind*mix(4.,2.2,uSnow));
 vec3 p0=aSeed.xyz*uBox+vel*uTime;
 // Snow wanders as it falls.
 p0.xz+=uSnow*vec2(sin(uTime*.7+aSeed.w*40.),cos(uTime*.53+aSeed.x*31.))*.6;
 // Wrap into the box centred on the camera (each flake keeps a fixed place in the world).
 vec3 lo=uCam-uBox*vec3(.5,.35,.5);vec3 p=lo+mod(p0-lo,uBox);
 float d=length(p-uCam);vFade=smoothstep(uBox.x*.5,uBox.x*.32,d)*smoothstep(.6,2.,d);
 vec3 dir=normalize(vel);vec3 toCam=normalize(uCam-p);vec3 side=normalize(cross(dir,toCam));
 float len=mix(.55+.3*aSeed.y,.045,uSnow),wid=mix(.012,.045,uSnow)*(1.+d*.025);
 vec3 up=mix(dir,normalize(cross(toCam,side)),uSnow);
 vec3 w=p+side*(position.x*wid)+up*(position.y-.5)*len;gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}`,
  fragmentShader:`uniform vec3 uCol;uniform float uAlpha;uniform float uSnow;varying vec2 vUv;varying float vFade;
void main(){float x=abs(vUv.x-.5)*2.;float a=mix((1.-x)*smoothstep(0.,.3,vUv.y)*smoothstep(1.,.6,vUv.y),1.-smoothstep(.4,1.,length(vUv-.5)*2.),uSnow);
 gl_FragColor=vec4(uCol,a*uAlpha*vFade);if(gl_FragColor.a<.004)discard;}`});
 const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=6;mesh.name='precipitation';mesh.visible=false;
 let limit=PRECIP_LIMITS.medium;
 return {mesh,setLevel(l){limit=PRECIP_LIMITS[l]||PRECIP_LIMITS.medium;},
  // amount 0..1 rain and snow; fogCol: the scene's fog colour this frame; night: lamp level 0..1.
  update(time,camera,rain,snow,fogCol,night){const amt=Math.max(rain,snow);const n=Math.round(limit*Math.min(1,amt*1.1));g.instanceCount=n;mesh.visible=n>10;if(!mesh.visible)return;
   U.uTime.value=time;U.uCam.value.copy(camera.position);U.uSnow.value=snow>rain?1:0;
   const c=U.uCol.value;c.copy(fogCol).multiplyScalar(1.6).addScalar(.18+.25*night);if(U.uSnow.value)c.lerp(new T.Color(1,1,1),.6);
   U.uAlpha.value=(U.uSnow.value?.85:.22+.12*rain)*(night>.5?.75:1);},dispose(){g.dispose();m.dispose();}};}
