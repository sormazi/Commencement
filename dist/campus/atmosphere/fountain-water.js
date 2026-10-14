import * as T from '../../vendor/three.module.js';
// The Washington Square fountain running (Avi, 14 Oct 2026, from his photo): a tall central jet from the pedestal and
// a ring of smaller jets arcing in from the rim, the water falling back into the basin with ripples and foam.
// Particles move on the GPU along ballistic paths (one draw call); the jets ease on and off over a few seconds.
// When it runs: fountainSchedule() below. In 2126 the basin is dry (decay.js dryFountain).
const G=9.81;
// Season and hours. NYC Parks turns the fountain on in late April (the park blog and Time Out report 17 to 27
// April most years) and off in mid-October (the park blog: "mid-October ... the most typical time in recent
// years"). Daily hours are not published; the game runs it from 8 am to 9 pm and keeps it off at night.
export const FOUNTAIN_SEASON={on:[4,25],off:[10,15],hours:[8,21]};
export function fountainSchedule(ny){if(!ny)return false;const md=ny.m*100+ny.d,on=FOUNTAIN_SEASON.on[0]*100+FOUNTAIN_SEASON.on[1],off=FOUNTAIN_SEASON.off[0]*100+FOUNTAIN_SEASON.off[1];
 if(md<on||md>off)return false;const h=ny.hh+(ny.mm||0)/60;return h>=FOUNTAIN_SEASON.hours[0]&&h<FOUNTAIN_SEASON.hours[1];}
export function buildFountainWater(r,keep){const g=new T.Group();g.name='fountain water (running)';
 const U={uTime:{value:0},uOn:{value:0}};
 // Particles: 1600 for the central jet, 200 for each of the eight rim jets.
 const NC=1600,NR=200,N=NC+8*NR,jet=new Float32Array(N),ph=new Float32Array(N),rnd=new Float32Array(N*3);let k=0;const h=x=>{const v=Math.sin(x*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 for(let i=0;i<N;i++){jet[i]=i<NC?0:1+Math.floor((i-NC)/NR);ph[i]=h(i*.37);rnd[k++]=h(i*1.3)*2-1;rnd[k++]=h(i*2.9)*2-1;rnd[k++]=h(i*4.1);}
 const geo=keep(new T.BufferGeometry());geo.setAttribute('position',new T.BufferAttribute(new Float32Array(N*3),3));geo.setAttribute('aJet',new T.BufferAttribute(jet,1));geo.setAttribute('aPh',new T.BufferAttribute(ph,1));geo.setAttribute('aRnd',new T.BufferAttribute(rnd,3));
 geo.boundingSphere=new T.Sphere(new T.Vector3(0,2.5,0),r+3);
 const mat=keep(new T.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,vertexShader:`
uniform float uTime;uniform float uOn;attribute float aJet;attribute float aPh;attribute vec3 aRnd;varying float vA;
const float G=${G.toFixed(2)};const float R=${(r-.5).toFixed(2)};
void main(){vec3 o;vec3 v;float life;
 if(aJet<.5){o=vec3(aRnd.x*.08,.82,aRnd.y*.08);float up=10.2+aRnd.z*1.1;v=vec3(aRnd.x*.45,up,aRnd.y*.45);life=(up+sqrt(up*up+2.*G*.68))/G;}
 else{float a=(aJet-1.)*.7854+.3927;vec3 d=vec3(sin(a),0.,cos(a));o=d*R+vec3(0.,.78,0.);float up=5.2+aRnd.z*.4;v=-d*(1.75+aRnd.x*.12)+vec3(cross(d,vec3(0.,1.,0.)).x,0.,cross(d,vec3(0.,1.,0.)).z)*aRnd.y*.12+vec3(0.,up,0.);life=(up+sqrt(up*up+2.*G*.64))/G;}
 float t=fract(uTime/life+aPh)*life;
 // Easing on: a jet that is starting reaches only part of its height.
 v.y*=mix(.25,1.,uOn);vec3 p=o+v*t+vec3(0.,-.5*G*t*t,0.);p.y=max(p.y,.14);
 vA=uOn*smoothstep(0.,.08,t)*(1.-smoothstep(life*.85,life,t))*(aJet<.5?.8:.85);
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(aJet<.5?.32:.2)*${'900.'}/max(1.,-mv.z);}`,
  fragmentShader:`varying float vA;void main(){vec2 c=gl_PointCoord-.5;float d=dot(c,c);if(d>.25)discard;gl_FragColor=vec4(.9,.95,1.,vA*(1.-d*4.)*.8);}`}));
 const pts=new T.Points(geo,mat);pts.frustumCulled=false;pts.renderOrder=4;g.add(pts);
 // The jet's solid core, rising and falling with it.
 const coreMat=keep(new T.MeshStandardMaterial({color:0xeef4f6,roughness:.15,transparent:true,opacity:.62,depthWrite:false}));
 const core=new T.Mesh(keep(new T.CylinderGeometry(.1,.3,1,12,1,true).translate(0,.5,0)),coreMat);core.position.y=.82;g.add(core);
 // Ripples and foam on the water: rings spreading from where the central jet falls and from each rim jet's landing.
 const ripMat=keep(new T.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,vertexShader:`varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uTime;uniform float uOn;varying vec2 vP;const float R=${(r-2.5).toFixed(2)};
float ring(vec2 p,vec2 c,float sp,float f){float d=length(p-c);return pow(max(0.,sin(d*f-uTime*sp)),6.)*exp(-d*.55);}
void main(){float a=ring(vP,vec2(0.),3.2,5.)*1.4;for(int i=0;i<8;i++){float an=float(i)*.7854+.3927;a+=ring(vP,vec2(sin(an),-cos(an))*R,4.,7.)*.9;}
 float foam=smoothstep(1.6,.2,length(vP))*(.55+.45*sin(uTime*7.+vP.x*9.)*sin(vP.y*11.-uTime*5.));
 gl_FragColor=vec4(.92,.96,1.,(a*.35+foam*.5)*uOn);}`}));
 const rip=new T.Mesh(keep(new T.CircleGeometry(r-1.95,64)),ripMat);rip.rotation.x=-Math.PI/2;rip.position.y=.155;rip.renderOrder=3;g.add(rip);
 let on=0;
 return {group:g,running:false,tick(time,want,decay){const dt=Math.min(.5,Math.max(0,time-(this.last??time)));this.last=time;on+=((want&&decay<.5?1:0)-on)*Math.min(1,dt*.6);if(Math.abs(on)<1e-3)on=0;
  U.uTime.value=time;U.uOn.value=on;this.running=on>.02;g.visible=on>.002;core.scale.set(1,Math.max(.01,4.2*on*(.92+.08*Math.sin(time*2.3))),1);this.level=on;}};}
