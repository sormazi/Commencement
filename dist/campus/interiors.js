// Shop interiors seen through the windows (2026). Every storefront's glass is drawn with interior mapping:
// a ray from the eye through each glass pixel is traced into an imaginary room behind it (floor, ceiling, back
// and side walls, plus counters, shelving, aisles, tables or fridges by kind), so a lit shop reads as a real
// room from any angle at the cost of one quad. Bigger stores (inside.depth) get deeper rooms with aisles.
// Day: the room shows behind a reflective pane. Night in 2026: rooms glow like the real street. 2126 (DECAY):
// the rooms go dark, dusty and dead, and panes break.
// Each record's `inside` gives {kind, wall, floor, light, accent, depth}; kinds: vacant, shop, cafe,
// restaurant, bar, grocery, pharmacy, bank, venue, deli, apparel, hardware. Colours follow what each
// business looks like inside where known; otherwise the kind's usual fit-out (see RESEARCH/storefronts/).
import * as T from '../vendor/three.module.js';
import {DECAY} from './atmosphere/decay.js?v=24';
import {INSIDES} from './storefronts/insides.js?v=24';
export const KINDS={vacant:0,shop:1,cafe:2,restaurant:2,bar:3,grocery:4,pharmacy:4,bank:5,venue:6,deli:7,apparel:8,hardware:9};
const DEF={vacant:{wall:'#8c8780',floor:'#6b665f',light:'#a9a49a'},shop:{wall:'#e8e4dc',floor:'#9b8f80',light:'#fff3dc'},cafe:{wall:'#c9a57e',floor:'#6e4c34',light:'#ffd9a0'},
 restaurant:{wall:'#a8735a',floor:'#5a3c2c',light:'#ffcf8a'},bar:{wall:'#4a2e24',floor:'#2e211b',light:'#ffb766'},grocery:{wall:'#f2f0ea',floor:'#cfcac0',light:'#f4fbff'},
 pharmacy:{wall:'#f4f4f2',floor:'#d8d6d0',light:'#f5fbff'},bank:{wall:'#e9ecef',floor:'#b7b9bb',light:'#eef6ff'},venue:{wall:'#1e1a26',floor:'#151217',light:'#6f7dff'},
 deli:{wall:'#e9e6df',floor:'#c4bdb0',light:'#f2fbff'},apparel:{wall:'#f3f2ef',floor:'#c9c3b8',light:'#fff6e8'},hardware:{wall:'#eceae4',floor:'#a9a59c',light:'#fbfbf4'}};
export function insideOf(r){const i=r.inside||INSIDES[r.id]||{},kind=i.kind||(r.shutter||/vacant/i.test(r.name||'')?'vacant':'shop'),d=DEF[kind]||DEF.shop;
 return {kind,k:KINDS[kind]??1,wall:i.wall||d.wall,floor:i.floor||d.floor,light:i.light||d.light,accent:i.accent||r.frame||'#444444',depth:i.depth||(kind==='grocery'?14:kind==='pharmacy'?10:5.5)};}
const VS=`attribute vec2 aUV;attribute vec3 aSize;attribute vec3 aT;attribute vec3 aN;attribute vec3 aWall;attribute vec3 aFloor;attribute vec3 aLight;attribute vec3 aAccent;attribute vec2 aKS;
varying vec2 vUV;varying vec3 vSize;varying vec3 vT;varying vec3 vN;varying vec3 vWall;varying vec3 vFloor;varying vec3 vLight;varying vec3 vAccent;varying vec2 vKS;varying vec3 vWorld;
#include <common>
#include <fog_pars_vertex>
void main(){vUV=aUV;vSize=aSize;vT=aT;vN=aN;vWall=aWall;vFloor=aFloor;vLight=aLight;vAccent=aAccent;vKS=aKS;vec4 wp=modelMatrix*vec4(position,1.);vWorld=wp.xyz;
 vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
const FS=`uniform float uNight;uniform float uDecay;uniform float uTime;uniform samplerCube uEnv;uniform float uEnvOn;
varying vec2 vUV;varying vec3 vSize;varying vec3 vT;varying vec3 vN;varying vec3 vWall;varying vec3 vFloor;varying vec3 vLight;varying vec3 vAccent;varying vec2 vKS;varying vec3 vWorld;
#include <common>
#include <fog_pars_fragment>
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 prod(vec2 c,float s){float r=h21(c+s),g=h21(c+s+7.1);vec3 h=clamp(abs(fract(r+vec3(0.,.667,.333))*6.-3.)-1.,0.,1.);return mix(vec3(.8),h,.65+.3*g)*(.4+.4*g);}
void main(){
 vec3 V=normalize(vWorld-cameraPosition);vec3 B=vec3(0.,1.,0.);vec3 d=vec3(dot(V,vT),dot(V,B),dot(V,vN));
 float W=vSize.x,H=vSize.y,D=vSize.z;vec3 p=vec3(vUV.x*W,vUV.y*H,0.);if(d.z>-.02)d.z=-.02;
 float tx=d.x>0.?(W-p.x)/d.x:-p.x/min(d.x,-1e-4);float ty=d.y>0.?(H-p.y)/d.y:-p.y/min(d.y,-1e-4);float tz=-D/d.z;
 float t=min(tx,min(ty,tz));vec3 q=p+d*t;int kind=int(vKS.x+.5);float seed=floor(vKS.y+.5)*.1031;
 vec3 col;float ceilLight=0.;
 if(t==tz){// back wall
  col=vWall;
  if(kind==1||kind==8||kind==9){float sh=fract(q.y/.55);col=mix(col,vWall*.55,step(.9,sh)*step(q.y,2.2));if(q.y<2.2&&sh<.85)col=mix(col,prod(floor(vec2(q.x/.35,q.y/.55)),seed),kind==8?.35:.55);}
  else if(kind==3){if(q.y>1.1&&q.y<2.3){float sh=fract(q.y/.4);col=mix(vWall*.6,mix(vec3(.55,.35,.1),vec3(.2,.5,.3),h21(floor(vec2(q.x/.12,q.y/.4))+seed)),step(.25,sh)*.8);}col=mix(col,vAccent,step(q.y,1.05)*.8);}
  else if(kind==4){float sh=fract(q.y/.5);col=mix(col,prod(floor(vec2(q.x/.3,q.y/.5)),seed),step(q.y,2.0)*step(.15,sh)*.6);}
  else if(kind==7){if(q.y<2.1&&q.y>.2){float cell=fract(q.x/.8);col=mix(vec3(.85,.92,.95),prod(floor(vec2(q.x/.2,q.y/.35)),seed),.45);col=mix(col,vec3(.15),step(.94,cell));}}
  else if(kind==2){col=mix(col,vAccent*.8,step(q.y,1.0));if(q.y>1.6&&q.y<2.3&&abs(q.x-W*.5)<W*.3)col=vec3(.12,.12,.1)+.6*step(.5,fract(q.y*10.))*step(fract(q.x*3.),.7);}
  else if(kind==5){col=mix(col,vAccent,step(abs(q.y-2.2),.25)*.7);}
  else if(kind==6){col=mix(col,vLight*.6,.3*step(.5,fract(q.x*1.5+uTime*.2)));}
 }else if(t==ty){
  if(d.y<0.){col=vFloor*(.85+.15*step(.5,fract(q.x*1.6)+fract(q.z*1.6)-floor(fract(q.x*1.6)+fract(q.z*1.6))));}
  else{col=vWall*.8;vec2 g=fract(vec2(q.x/1.2,q.z/1.2));ceilLight=step(.3,g.x)*step(g.x,.7)*step(.35,g.y)*step(g.y,.65);if(kind==3||kind==6)ceilLight=step(length(g-.5),.08);col=mix(col,vLight*1.4,ceilLight);}
 }else{col=vWall*.82;if(kind==1||kind==4||kind==8||kind==9){float sh=fract(q.y/.55);if(q.y<2.2&&sh<.85)col=mix(col,prod(floor(vec2(q.z/.35,q.y/.55)),seed+3.),.45);}}
 // Things in the room, front to back: a counter, tables, aisles.
 if(kind==2||kind==3||kind==5||kind==7){float zc=-D*(kind==3?.7:.6);float tc=zc/d.z;vec3 c=p+d*tc;if(tc<t&&c.y<1.05&&c.x>W*.12&&c.x<W*.88){col=vAccent*(kind==5?1.1:.9);t=tc;}}
 if(kind==2){for(int i=1;i<3;i++){float zc=-float(i)*D*.25;float tc=zc/d.z;vec3 c=p+d*tc;if(tc<t&&abs(c.y-.75)<.04&&fract(c.x/1.4)<.55){col=vFloor*1.3;t=tc;}}}
 if(kind==4){for(int i=1;i<13;i++){float zc=-float(i)*2.2;if(-zc>D-.5)break;float tc=zc/d.z;vec3 c=p+d*tc;if(tc<t&&c.y<1.8&&fract((c.x+.4)/2.4)<.42){float sh=fract(c.y/.45);col=mix(vWall*.7,prod(floor(vec2(c.x/.25,c.y/.45)+float(i)*7.),seed),step(.15,sh)*.7);t=tc;}}}
 if(kind==8){for(int i=1;i<3;i++){float zc=-float(i)*D*.3;float tc=zc/d.z;vec3 c=p+d*tc;if(tc<t&&c.y>.9&&c.y<1.7&&fract(c.x/1.1)<.08){col=vec3(.2);t=tc;}if(tc<t&&c.y>.5&&c.y<1.6&&fract(c.x/1.1+.3)<.2){col=prod(floor(vec2(c.x/.2,c.y/.3)),seed+float(i));t=tc;}}}
 // Light falloff with depth, the kind's light colour.
 float fall=mix(1.,.55,clamp(t/(D*1.2),0.,1.));vec3 lit=col*vLight*fall;
 float dead=smoothstep(.3,.8,uDecay);float on=(kind==0?.25:1.);
 float bright=mix(.42,.95,uNight)*on;vec3 room=lit*bright+vLight*ceilLight*.6*uNight*on;
 // A dead room is plain dark: built from nothing traced, so it stays clean even where the trace is degenerate.
 vec3 deadRoom=vec3(.05,.045,.04)*(.8+.4*abs(d.y));room=dead>.99?deadRoom:mix(clamp(room,0.,4.),deadRoom,dead);
 // The pane: reflection of a pale sky by day, faint at night; grime and breaks in 2126.
 float fres=pow(1.-abs(d.z),3.)*.85+.12;vec3 refl=mix(vec3(.62,.67,.71),vec3(.05,.06,.08),uNight);
 // With the live probe (Step A.5, Medium and High) the pane reflects the real street instead of a flat sky tone.
 if(uEnvOn>.5){vec3 Rw=reflect(V,normalize(vN));refl=mix(refl,textureCube(uEnv,Rw).rgb*.9,.85);}
 float broken=step(.55,h21(floor(vUV*vec2(2.,1.5))+seed*13.))*dead;
 vec3 c=mix(room,refl,fres*(1.-broken)*mix(1.,.6,uNight)*(1.-.45*dead));c=mix(c,vec3(.17,.155,.13),dead*.4*(1.-broken));
 gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
#include <fog_fragment>
}`;
export function interiorMaterial(world){if(world.shopUniforms)return world.shopMaterial;const u=world.shopUniforms={uNight:{value:0},uDecay:DECAY,uTime:{value:0},uEnv:{value:null},uEnvOn:{value:0}};
 const m=world.shopMaterial=new T.ShaderMaterial({uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{}]),vertexShader:VS,fragmentShader:FS,fog:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 Object.assign(m.uniforms,u);world.disposables.add(m);return m;}
// One quad of glass with its room; `out` collects arrays per tile.
export function addPane(out,f,u0,u1,v0,v1,d,r){const ins=insideOf(r),c=x=>{const k=new T.Color(x);return [k.r,k.g,k.b];},W=u1-u0,H=v1-v0;
 const P=[f.at(u0,v0,d),f.at(u1,v0,d),f.at(u1,v1,d),f.at(u0,v0,d),f.at(u1,v1,d),f.at(u0,v1,d)],UV=[[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]];
 const seed=(r.id||'').split('').reduce((s,ch)=>s+ch.charCodeAt(0),0)%97;// a whole number: the shader rounds it, so interpolation error never reaches the hash
 for(let i=0;i<6;i++){out.pos.push(...P[i]);out.uv.push(...UV[i]);out.size.push(W,H,ins.depth);out.t.push(...f.u);out.n.push(...f.n);out.wall.push(...c(ins.wall));out.floor.push(...c(ins.floor));out.light.push(...c(ins.light));out.accent.push(...c(ins.accent));out.ks.push(ins.k,seed);}}
export function paneMesh(out,mat){const g=new T.BufferGeometry(),A=(n,a,s)=>g.setAttribute(n,new T.Float32BufferAttribute(a,s));
 A('position',out.pos,3);A('aUV',out.uv,2);A('aSize',out.size,3);A('aT',out.t,3);A('aN',out.n,3);A('aWall',out.wall,3);A('aFloor',out.floor,3);A('aLight',out.light,3);A('aAccent',out.accent,3);A('aKS',out.ks,2);
 g.computeBoundingSphere();const m=new T.Mesh(g,mat);m.name='shop interiors';m.userData.ownDecay=true;m.receiveShadow=false;m.castShadow=false;return m;}
export const newPanes=()=>({pos:[],uv:[],size:[],t:[],n:[],wall:[],floor:[],light:[],accent:[],ks:[]});
