import {VEHICLE} from './physics.js?v=24';
import * as T from './vendor/three.module.js';
import {createWorld} from './locations.js?v=24';
import {makeVehicle} from './vehicle.js?v=24';
import {DECAY} from './campus/atmosphere/decay.js?v=24';
import {SkyDriver} from './campus/atmosphere/sky-driver.js?v=24';
import {initPBR} from './campus/atmosphere/pbr.js?v=24';
import {Bloom} from './post-bloom.js?v=24';
import {HeightFog} from './campus/atmosphere/heightfog.js?v=24';
const rand=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function texture(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;}
const glowMap=texture(128,128,c=>{let g=c.createRadialGradient(64,64,1,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.15,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,128,128);});
const boxGeo=new T.BoxGeometry(1,1,1),metal=new T.MeshStandardMaterial({color:0x34404a,metalness:.8,roughness:.32}),black=new T.MeshStandardMaterial({color:0x080b0f,roughness:.45}),rubber=new T.MeshStandardMaterial({color:0x0a0b0d,roughness:.88});
function box(group,x,y,z,w,h,d,mat){let m=new T.Mesh(boxGeo,mat);m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function lampGlow(group,color,x,y,z,size){const s=new T.Sprite(new T.SpriteMaterial({map:glowMap,color,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));s.position.set(x,y,z);s.scale.set(size,size,1);group.add(s);return s;}
export class CityRenderer{
constructor(canvas){this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.scene=new T.Scene();this.scene.background=new T.Color(0x070e1d);this.scene.fog=new HeightFog(0x101d30,.0029,0);this.camera=new T.PerspectiveCamera(63,innerWidth/innerHeight,.1,1600);this.camera.position.set(0,3,8);this.camera.lookAt(0,1,-20);this.hemi=new T.HemisphereLight(0xbdc8a2,0x424a2f,2.7);this.scene.add(this.hemi);this.sun=new T.DirectionalLight(0xc7ddff,2.3);this.sun.position.set(-40,80,-80);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);Object.assign(this.sun.shadow.camera,{left:-55,right:55,top:55,bottom:-55,near:1,far:220});this.sun.shadow.bias=-.0004;this.sun.shadow.normalBias=.06;this.scene.add(this.sun);
// Original reflection environment: large luminous city panels and a cool sky.
const envScene=new T.Scene();envScene.background=new T.Color(0x263e5c);for(let i=0;i<14;i++){let panel=new T.Mesh(new T.PlaneGeometry(8,30),new T.MeshBasicMaterial({color:i%3===0?0xe7b881:0xa7cbdc}));panel.position.set(Math.cos(i)*30,10,Math.sin(i)*30);panel.lookAt(0,10,0);envScene.add(panel);}const cubeTarget=new T.WebGLCubeRenderTarget(128,{type:T.HalfFloatType});const cubeCam=new T.CubeCamera(.1,100,cubeTarget);cubeCam.update(this.renderer,envScene);const pm=new T.PMREMGenerator(this.renderer);this.scene.environment=pm.fromCubemap(cubeTarget.texture).texture;pm.dispose();cubeTarget.dispose();
this.player=null;
this.contact=new T.Mesh(new T.PlaneGeometry(2.4,5.0),new T.MeshBasicMaterial({map:glowMap,color:0x000000,transparent:true,opacity:.7,depthWrite:false}));this.contact.rotation.x=-Math.PI/2;this.contact.position.y=.04;this.scene.add(this.contact);
this.headlights=[];for(let x of [-.6,.6]){const l=new T.SpotLight(0xccedff,75,75,.34,.5,1.1);l.position.set(x,.7,-2.2);l.target.position.set(x,.1,-38);this.scene.add(l,l.target);this.headlights.push(l);}
this.fill=new T.PointLight(0xb4d1ed,24,16,1.2);this.fill.position.set(-4,3,4);this.scene.add(this.fill);
const smokeGeo=new T.SphereGeometry(1,8,6);this.smoke=Array.from({length:35},()=>{let m=new T.Mesh(smokeGeo,new T.MeshBasicMaterial({color:0xc0c7d1,transparent:true,opacity:0,depthWrite:false}));this.scene.add(m);return {m,life:0,x:0,z:0};});this.smokeIndex=0;
this.skidIndex=0;this.skids=Array.from({length:100},()=>{const m=new T.Mesh(new T.PlaneGeometry(.23,1.7),new T.MeshBasicMaterial({color:0x171c16,transparent:true,opacity:.6,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;this.scene.add(m);return {m,s:0,x:0,life:0};});
this.sparks=Array.from({length:28},()=>{const m=new T.Mesh(new T.BoxGeometry(.025,.025,.17),new T.MeshBasicMaterial({color:0xffc776}));m.visible=false;this.scene.add(m);return {m,life:0,v:new T.Vector3(),p:new T.Vector3()};});this.previousImpact=0;

this.target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthTexture:new T.DepthTexture(1,1)});this.postScene=new T.Scene();this.postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);this.postMat=new T.ShaderMaterial({uniforms:{image:{value:this.target.texture},resolution:{value:new T.Vector2(1,1)},amount:{value:0},motion:{value:0},clock:{value:0},desat:{value:0},vignette:{value:0},bloomOn:{value:1},tDepth:{value:null},camNear:{value:.1},camFar:{value:1600},ssaoOn:{value:0},ssaoStrength:{value:1},tBloom:{value:null},bloomStrength:{value:.9},uDecay:DECAY,uNight:{value:0},gradeOn:{value:1},grainAmt:{value:.018},vigAmt:{value:.22},sunUv:{value:new T.Vector2(.5,.5)},sunVis:{value:0},sunCol:{value:new T.Color(1,.8,.6)},shaftN:{value:24},shaftOn:{value:1}},vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D image;uniform vec2 resolution;uniform float amount;uniform float motion;uniform float clock;uniform float desat;uniform float vignette;uniform float bloomOn;uniform sampler2D tDepth;uniform float camNear;uniform float camFar;uniform float ssaoOn;uniform float ssaoStrength;uniform sampler2D tBloom;uniform float bloomStrength;uniform float uDecay;uniform float uNight;uniform float gradeOn;uniform float grainAmt;uniform float vigAmt;uniform vec2 sunUv;uniform float sunVis;uniform vec3 sunCol;uniform float shaftN;uniform float shaftOn;
float linDepth(vec2 uv){float z=texture2D(tDepth,uv).r*2.-1.;return 2.*camNear*camFar/(camFar+camNear-z*(camFar-camNear));}varying vec2 uv0;void main(){vec2 delta=(uv0-.5)*amount*.003;vec3 col=vec3(texture2D(image,uv0+delta).r,texture2D(image,uv0).g,texture2D(image,uv0-delta).b);
// Screen-space ambient occlusion (High preset only): eight depth taps in a spiral around the pixel, about
// 0.6 m across in the world, darkening creases, contact points and anything the baked AO cannot know
// about (cars, people, moving things). Range-limited so distant edges do not halo.
if(ssaoOn>.5){float dc=linDepth(uv0);if(dc<180.){float ruv=.6*.85/dc;vec2 asp=vec2(resolution.y/resolution.x,1.);float occ=0.;float rot=fract(sin(dot(uv0*resolution,vec2(12.9898,78.233)))*43758.5453)*6.2832;
 for(int i=0;i<8;i++){float a=float(i)*2.39996+rot,rr=ruv*(.25+.75*fract(float(i)*.618+.13));float ds=linDepth(uv0+vec2(cos(a),sin(a))*asp*rr);float df=dc-ds;occ+=step(.06,df)*(1.-smoothstep(.4,2.,df));}
 col*=1.-occ/8.*.65*ssaoStrength*(1.-smoothstep(90.,180.,dc));}}// Radial shutter smear follows the road perspective; shield the player car.
vec2 travel=(uv0-vec2(.5,.53))*motion*.055;
float carShield=1.-smoothstep(.12,.25,abs(uv0.x-.5));carShield*=1.-smoothstep(.35,.49,uv0.y);
vec3 smear=vec3(0.);for(int i=0;i<8;i++){float phase=float(i)/7.-.5;smear+=texture2D(image,clamp(uv0+travel*phase,vec2(.001),vec2(.999))).rgb/8.;}
col=mix(col,smear,clamp(motion*.8,0.,.9)*(1.-carShield));
// Light shafts (Step A.4): when the sun is low, march from each pixel towards the sun across the depth
// buffer and count open sky (or anything past about 300 m, which the haze has already turned to sky);
// trees, the Arch and near buildings block it, so beams fan out through the gaps.
// Jittered start per pixel hides the banding; 24 steps on High, 12 on Medium, off on Low.
if(shaftOn>.5&&sunVis>.001){vec2 asp2=vec2(resolution.x/resolution.y,1.);vec2 d=(sunUv-uv0);float len=length(d*asp2);
 if(len<1.1){float N=shaftN;vec2 st=d/N;float j=fract(sin(dot(uv0*resolution,vec2(41.3,289.1)))*43758.5453);vec2 p=uv0+st*j;float acc=0.,w=1.,wsum=0.;
  for(int i=0;i<24;i++){if(float(i)>=N)break;p+=st;vec2 q=clamp(p,vec2(.001),vec2(.999));acc+=smoothstep(220.,420.,linDepth(q))*w;wsum+=w;w*=.94;}
  float open=acc/wsum;float fall=pow(1.-clamp(len/1.1,0.,1.),2.2);
  // Only where the pixel itself is not open sky (the beams show against the scene, not the sky behind).
  float self=1.-smoothstep(220.,420.,linDepth(uv0))*.8;
  col+=sunCol*open*fall*sunVis*self*1.1;}}
// Soft bloom (post-bloom.js): the half-resolution glow of everything brighter than white. 2126 lamps are
// mostly dead, so what is left glows a little less.
if(bloomOn>.5)col+=texture2D(tBloom,uv0).rgb*bloomStrength*.16*(1.-.3*uDecay);
// Colour grade (Step A.3), before tone mapping, in linear light: white balance and saturation. 2026 is warm
// and rich; 2126 is drained, yellow-green and sickly. uDecay blends the two, so the grade crossfades with the
// world during the shift. At night 2026 keeps cool shadows under warm lamps; 2126 goes cold green.
float lum0=dot(col,vec3(.2126,.7152,.0722));
vec3 wb26=mix(vec3(1.045,1.,.93),vec3(.97,.99,1.06),uNight),wb21=mix(vec3(1.02,1.03,.82),vec3(.9,1.04,.92),uNight);
float sat=mix(mix(1.12,1.05,uNight),.52,uDecay);
vec3 gc=col*mix(wb26,wb21,uDecay);gc=mix(vec3(dot(gc,vec3(.2126,.7152,.0722))),gc,sat);col=mix(col,max(gc,0.),gradeOn);
// The sky's daytime desaturation (sky.js) is halved in 2026 so its colour stays rich; 2126 keeps all of it.
col=mix(col,vec3(dot(col,vec3(.2126,.7152,.0722))),desat*mix(1.,.5,gradeOn*(1.-uDecay)));gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
// After tone mapping (0..1): contrast and toe. 2026 gets a gentle S-curve; 2126 loses contrast and its
// blacks lift towards a murky olive, the washed-out look of an old print. Then the vignette.
{vec3 g=gl_FragColor.rgb;vec3 s26=g*g*(3.-2.*g);vec3 g26=mix(g,s26,.22);
 vec3 g21=mix(vec3(.045,.05,.035)*(1.-.75*uNight),vec3(.92,.93,.86),g);g21=mix(g21,g21*g21*(3.-2.*g21),-.05);
 vec3 gr=mix(g26,g21,uDecay);
 // Split tone at night in 2026: shadows lean blue, lamp-lit highlights stay warm.
 float l=dot(gr,vec3(.2126,.7152,.0722));gr*=mix(vec3(1.),mix(vec3(.93,.98,1.08),vec3(1.05,1.,.94),smoothstep(.15,.6,l)),uNight*(1.-uDecay)*.8);
 g=mix(g,gr,gradeOn);
 float vig=1.-smoothstep(.3,.85,length((uv0-.5)*vec2(1.,.85)));g*=mix(1.,vig,vigAmt);
 // Night: the screen edges fall away into near-darkness so the headlights and the few live lamps carry the picture.
 float edge=length((uv0-vec2(.5,.47))*vec2(1.,.9));g*=mix(1.,.04+.96*(1.-smoothstep(.2,.66,edge)),vignette);
 gl_FragColor.rgb=g;}
#include <colorspace_fragment>
// Film grain in display space, strongest in the mid-tones, a new pattern every frame.
{float n=fract(sin(dot(uv0*resolution+fract(clock*.37)*vec2(113.,71.),vec2(12.9898,78.233)))*43758.5453)-.5;float m=gl_FragColor.g;gl_FragColor.rgb+=n*grainAmt*(.5+2.*m*(1.-m));}
}`});this.postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.postMat));this.bloom=new Bloom(this.renderer);this.bloom.on=true;this.resize();window.addEventListener('resize',()=>this.resize());this.preset='';this.sky=new SkyDriver(this);initPBR(this.renderer);}
// Free-roam rendering: the car moves through a static world in map space (three z = -north).
updateFreeRoam(state,controls,time,dt,playing){
const yaw=state.orientation?.yaw||0,X=state.position.x,Z=-state.position.z,fx=Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=Math.sin(yaw);
if(this.camYaw===undefined||this.camReset!==this.world)this.camYaw=yaw,this.camReset=this.world,this.camera.position.set(X-fx*8.4,3.2,Z-fz*8.4);
let dy=yaw-this.camYaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));this.camYaw+=dy*(1-Math.exp(-dt*5));const cfx=Math.sin(this.camYaw),cfz=-Math.cos(this.camYaw);
const ground=this.world.collision.surface(state.position.x,state.position.z).height;
this.player.position.set(X,.025+(state.position.y-VEHICLE.rideHeight),Z);this.player.rotation.set(state.orientation?.pitch||0,-yaw,state.orientation?.roll||0,'YXZ');
this.player.userData.wheels.forEach((w,i)=>{const simulationWheel=state.wheels?.[i===0?0:i===1?2:i===2?1:3];w.rotation.x=simulationWheel?-simulationWheel.rotation:0;w.rotation.y=simulationWheel?-simulationWheel.steeringAngle:0;const config=VEHICLE,front=(i===0||i===2),preload=config.mass*9.81*(front?config.frontWeight:1-config.frontWeight)/2/config.springRate;w.position.y=this.player.userData.wheelY+(simulationWheel?simulationWheel.suspension.compression-preload:0);});
this.player.userData.updateDecay?.();
this.contact.visible=true;this.contact.position.set(X,ground+.04,Z);this.contact.rotation.z=-yaw;
for(let i=0;i<2;i++){const side=i?.6:-.6,hx=X+rx*side+fx*2.25,hz=Z+rz*side+fz*2.25;this.headlights[i].position.set(hx,ground+.9,hz);this.headlights[i].target.position.set(hx+fx*30,ground,hz+fz*30);}
this.fill.position.set(X-rx*4-fx*4,ground+3,Z-rz*4-fz*4);
if(!this.sun.target.parent)this.scene.add(this.sun.target);if(this.preset==='realtime')this.sky.update(dt,X,Z,this.world);else{this.sun.position.set(X-40,80,Z-80);this.sun.target.position.set(X,0,Z);}
// The car's left headlamp burns dimmer as the decay layer comes in.
this.headlights[0].intensity=this.headlights[1].intensity*(1-.65*DECAY.value);
if((controls.drifting||controls.burnout||state.damage>.6)&&playing){let p=this.smoke[this.smokeIndex++%this.smoke.length];p.life=1;const side=this.smokeIndex%2?1:-1;p.x=X+rx*side-fx*1.8;p.z=Z+rz*side-fz*1.8;p.y=ground;}
for(let p of this.smoke){p.life=Math.max(0,p.life-dt*.9);p.m.visible=p.life>0;if(p.life){p.m.position.set(p.x+(1-p.life)*Math.sin(time)*2,(p.y||0)+.4+(1-p.life)*1.8,p.z);p.m.scale.setScalar(.15+(1-p.life)*1.8);p.m.material.opacity=p.life*.25;p.m.material.color.set(state.damage>.6?0x343a30:0xa3a390);}}
if((controls.drifting||controls.burnout)&&playing){for(let side of [-1,1]){const mark=this.skids[this.skidIndex++%this.skids.length];mark.life=18;mark.x=X+rx*side*.95-fx*1.4;mark.z=Z+rz*side*.95-fz*1.4;mark.y=ground+.035;mark.m.rotation.z=-yaw;}}
for(const mark of this.skids){mark.life=Math.max(0,mark.life-dt);mark.m.visible=mark.life>0;if(mark.m.visible)mark.m.position.set(mark.x,mark.y??.035,mark.z);}
if(state.impact>this.previousImpact+.1){for(let i=0;i<this.sparks.length;i++){const p=this.sparks[i];p.life=.4+rand(i+time)*.5;p.p.set(X+fx*1.8,ground+.7,Z+fz*1.8);p.v.set((rand(i+2)-.5)*12,rand(i+6)*7,(rand(i+12)-.5)*10);}}this.previousImpact=state.impact;
for(const p of this.sparks){p.life=Math.max(0,p.life-dt);p.m.visible=p.life>0;if(p.life){p.v.y-=dt*9.8;p.p.addScaledVector(p.v,dt);p.m.position.copy(p.p);p.m.rotation.set(time*13,time*7,time*11);}}
const speed=Math.abs(state.speed),shake=playing?(speed>45?.012*speed/80:0)+state.hit*.035:0;this.camera.fov=playing?62+speed*.14+(controls.boosting?5:0):55;this.camera.updateProjectionMatrix();
const back=playing?9.4:8.2,height=playing?3.4:2.6,desired=new T.Vector3(X-cfx*back+Math.sin(time*43)*shake*4+(playing?0:rx*5),ground+height+Math.cos(time*37)*shake,Z-cfz*back+(playing?0:rz*5));
this.camera.position.lerp(desired,1-Math.exp(-dt*7));this.camera.lookAt(X+cfx*14,ground+1.05,Z+cfz*14);
// Developer/review camera: fixed viewpoint in map metres (x east, n north), used for skyline checks.
const o=this.cameraOverride;if(o){this.camera.fov=o.fov||55;this.camera.updateProjectionMatrix();this.camera.position.set(o.x,o.y,-o.n);this.camera.lookAt(o.lx,o.ly??o.y,-o.ln);this.scene.fog.density=o.fog??this.scene.fog.density;}
if(this.preset==='realtime')this.sky.place(this.camera);this.world.viewDistance=o?.view;this.world.update(state,time,this.camera);
this.postMat.uniforms.amount.value=controls.boosting?1:speed/100;this.postMat.uniforms.motion.value=controls.motionActive?Math.min(1.5,Math.max(0,(speed-9)/55)+(controls.boosting?.3:0)):0;this.postMat.uniforms.clock.value=time;this.renderer.setRenderTarget(this.target);this.renderer.render(this.scene,this.camera);this.renderer.setRenderTarget(null);this.updateSunShafts();this.bloom.night=this.postMat.uniforms.uNight.value;this.bloom.render(this.target);{const pu=this.postMat.uniforms;pu.tBloom.value=this.bloom.texture;pu.tDepth.value=this.target.depthTexture;pu.camNear.value=this.camera.near;pu.camFar.value=this.camera.far;}this.renderer.render(this.postScene,this.postCamera);}
// Sun position on screen and how strongly the shafts show: only a low sun (below about 30 degrees), fading in
// above the horizon, and fading as the sun leaves the frame.
updateSunShafts(){const pu=this.postMat.uniforms,el=this.sky?.sky?.sun?.elevation;if(el==null||!(this.sky.cur)||this.preset!=='realtime'){pu.sunVis.value=0;return;}
 const v=this._sv||(this._sv=new T.Vector3()),dir=v.copy(this.sun.position).sub(this.sun.target.position).normalize();const p=dir.multiplyScalar(1000).add(this.camera.position).project(this.camera);
 const fwd=this._sf||(this._sf=new T.Vector3());this.camera.getWorldDirection(fwd);const facing=fwd.dot(dir.copy(this.sun.position).sub(this.sun.target.position).normalize());
 pu.sunUv.value.set(p.x*.5+.5,p.y*.5+.5);const off=Math.max(Math.abs(p.x),Math.abs(p.y));
 const low=Math.min(1,Math.max(0,el/3))*(1-Math.min(1,Math.max(0,(el-12)/18)));pu.sunVis.value=facing>0?low*(1-Math.min(1,Math.max(0,(off-1)/.6)))*(1-.5*DECAY.value):0;pu.sunCol.value.copy(this.sun.color);}
resize(){this.renderer.setSize(innerWidth,innerHeight,false);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();const v=new T.Vector2();this.renderer.getDrawingBufferSize(v);this.target.setSize(v.x,v.y);this.bloom?.setSize(v.x,v.y);this.postMat.uniforms.resolution.value.copy(v);}
setLocation(id){if(this.locationId===id)return;if(this.world){this.scene.remove(this.world.group);this.world.dispose();}this.world=createWorld(id);this.locationId=id;this.scene.add(this.world.group);this.world.setPreset?.(this.preset);this.skids.forEach(k=>{k.life=0;k.m.visible=false;});}
applyPreset(preset){// Real NYC time drives the campus every frame (SkyDriver).
 if(preset===this.preset)return;this.preset=preset;this.world?.setPreset?.(preset);this.postMat.uniforms.desat.value=0;this.postMat.uniforms.vignette.value=0;this.postMat.uniforms.uNight.value=preset==='night'?1:0;
  if(preset==='realtime'){this.sky.snap();this.sky.shadows=null;return;}this.sky.hide();if(this.fill.userData.base)this.fill.intensity=this.fill.userData.base;for(const h of this.headlights)if(h.userData.base)h.intensity=h.userData.base*(preset==='night'?2.4:1);const storm=preset==='storm',dawn=preset==='dawn';
  // Dead of night: moonlight only, no sun shadows (also saves the shadow pass), dense cold fog.
  if(preset==='night'){this.scene.background.set(0x020305);this.scene.fog.color.set(0x06080c);this.scene.fog.density=.026;this.sun.intensity=.06;this.sun.color.set(0x9fb4d6);this.sun.castShadow=false;this.hemi.intensity=.07;this.hemi.color.set(0x3c4a64);this.hemi.groundColor.set(0x15130f);this.renderer.toneMappingExposure=.95;this.postMat.uniforms.vignette.value=1;if(this.fill.userData.base)this.fill.intensity=this.fill.userData.base*.25;return;}
  this.sun.castShadow=true;this.scene.background.set(storm?0x66747b:dawn?0xaaa291:0x96a3a7);this.scene.fog.color.copy(this.scene.background);this.scene.fog.density=storm?.014:.0065;this.sun.intensity=storm?1.2:dawn?3.2:2.6;this.sun.color.set(dawn?0xffd2a0:0xffe6ca);this.hemi.intensity=storm?1.4:1.8;this.hemi.color.set(0xc6d8e1);this.hemi.groundColor.set(0x514a3d);this.renderer.toneMappingExposure=1.05;}
update(state,controls,time,dt,playing,preset){
this.setLocation('washington-square');if(!this.player){this.player=makeVehicle(this.world.data);this.scene.add(this.player);}
this.applyPreset(preset);return this.updateFreeRoam(state,controls,time,dt,playing);}
}
