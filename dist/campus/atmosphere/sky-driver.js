import * as T from '../../vendor/three.module.js';
import {skyAt,makeClock,describe} from './sky.js?v=24';
// Drives the renderer's lights, sky, fog and post grade from the real New York sun (sky.js).
// The sky is recomputed every five seconds (every half second in a time-lapse preview) and every value
// glides toward the new target with a three-second time constant, so nothing ever jumps.
const NUM=['sun','density','hemi','exposure','desat','cards','lamps','moonGlow','vignette'],COL=['sunC','bg','fog','sky','ground'];
// Hex colours are sRGB; three.js lights and setRGB work in linear space, so convert once here.
const rgb=h=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
function moonTexture(){const c=document.createElement('canvas');c.width=c.height=128;const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return {c,t};}
// Draws the lit part of the disc: the terminator is an ellipse whose half-width follows the illuminated fraction.
function drawMoon({c,t},illum,waxing){const g=c.getContext('2d'),r=50,cx=64,cy=64;g.clearRect(0,0,128,128);
 const glow=g.createRadialGradient(cx,cy,r*.9,cx,cy,64);glow.addColorStop(0,'rgba(210,214,200,.18)');glow.addColorStop(1,'rgba(210,214,200,0)');g.fillStyle=glow;g.fillRect(0,0,128,128);
 g.fillStyle='rgba(40,44,52,.55)';g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
 const k=1-2*illum,side=waxing?1:-1;g.fillStyle='#d9dccd';g.beginPath();
 g.arc(cx,cy,r,-Math.PI/2,Math.PI/2,side<0);g.ellipse(cx,cy,Math.abs(k)*r,r,0,Math.PI/2,-Math.PI/2,(k>0)===(side>0));g.fill();
 // A few soft maria so it reads as the moon, not a lamp.
 g.globalCompositeOperation='source-atop';g.fillStyle='rgba(120,124,118,.35)';for(const [x,y,s] of [[-14,-12,13],[10,-18,9],[4,6,15],[-18,14,8],[18,16,7]]){g.beginPath();g.arc(cx+x,cy+y,s,0,7);g.fill();}g.globalCompositeOperation='source-over';t.needsUpdate=true;}
export class SkyDriver{
 constructor(renderer,search=globalThis.location?.search||''){this.r=renderer;this.clock=makeClock(search);this.speed=+new URLSearchParams(search).get('speed')||0;this.nextAt=0;this.cur=null;this.target=null;this.sky=null;this.shadows=null;
  this.moonTex=moonTexture();this.moonIllum=-1;this.moon=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:this.moonTex.t,transparent:true,depthWrite:false,fog:false,opacity:1}));this.moon.renderOrder=-1;this.moon.visible=false;renderer.scene.add(this.moon);}
 sample(){const s=skyAt(this.clock.now()),L=s.look;this.sky=s;
  // The moon washes out by day and glows by night.
  const moonGlow=s.moon.altitude>-1?(s.sun.elevation>0?.35:s.sun.elevation>-6?.7:1):0;
  const tg={};for(const k of NUM)tg[k]=k==='moonGlow'?moonGlow:L[k];for(const k of COL)tg[k]=rgb(L[k]);tg.dir=[s.light.x,s.light.y,s.light.n];tg.moonDir=(()=>{const r=Math.PI/180,a=s.moon.azimuth*r,e=s.moon.altitude*r;return [Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)];})();
  this.target=tg;if(!this.cur)this.cur=structuredClone(tg);
  if(Math.abs(s.moon.illumination-this.moonIllum)>.01){this.moonIllum=s.moon.illumination;drawMoon(this.moonTex,s.moon.illumination,s.moon.waxing);}}
 snap(){this.cur=null;this.nextAt=0;}
 // Called each frame on the Washington Square map. X,Z: car position in three coordinates.
 update(dt,X,Z,world){const now=performance.now();if(now>=this.nextAt){this.sample();this.nextAt=now+(this.speed?500:5000);}
  const c=this.cur,tg=this.target,k=1-Math.exp(-Math.min(dt,.25)/(this.speed>200?.6:3));
  for(const n of NUM)c[n]+=(tg[n]-c[n])*k;for(const n of COL)for(let i=0;i<3;i++)c[n][i]+=(tg[n][i]-c[n][i])*k;
  for(const n of ['dir','moonDir']){const v=c[n];for(let i=0;i<3;i++)v[i]+=(tg[n][i]-v[i])*k;const l=Math.hypot(...v)||1;for(let i=0;i<3;i++)v[i]/=l;}
  const r=this.r;r.scene.background.setRGB(...c.bg);r.scene.fog.color.setRGB(...c.fog);r.scene.fog.density=c.density;
  r.hemi.intensity=c.hemi;r.hemi.color.setRGB(...c.sky);r.hemi.groundColor.setRGB(...c.ground);
  r.sun.intensity=c.sun;r.sun.color.setRGB(...c.sunC);r.renderer.toneMappingExposure=c.exposure;r.postMat.uniforms.desat.value=c.desat;r.postMat.uniforms.vignette.value=c.vignette;r.postMat.uniforms.uNight.value=c.lamps;
  // Key light from the real sun (or moon). The shadow box stays centred on the car, so shadows fall as they
  // really do at this hour; they switch off with a little hysteresis around the horizon.
  const [dx,dy,dn]=c.dir;r.sun.position.set(X+dx*150,dy*150,Z-dn*150);r.sun.target.position.set(X,0,Z);
  const want=this.shadows?this.sky.sun.elevation>-.5:this.sky.sun.elevation>.5;if(want!==this.shadows){this.shadows=want;r.sun.castShadow=want;}
  world?.setSky?.(c.lamps,c.cards,c.fog);
  // The chase camera's fill light (it keeps the car readable) is turned down after dark so it stops floodlighting facades.
  if(r.fill){r.fill.userData.base??=r.fill.intensity;r.fill.intensity=r.fill.userData.base*(1-.75*c.lamps);}
  // Headlights carry the night: brighter as the lamps come on.
  for(const h of r.headlights||[]){h.userData.base??=h.intensity;h.intensity=h.userData.base*(1+1.4*c.lamps);}}
 // Moon disc, placed after the camera has moved.
 place(camera){const g=this.cur?.moonGlow||0;this.moon.visible=g>.02;if(!this.moon.visible)return;const [x,y,n]=this.cur.moonDir,D=900;
  this.moon.position.set(camera.position.x+x*D,camera.position.y+y*D,camera.position.z-n*D);this.moon.scale.setScalar(D*.0095*1.3);this.moon.quaternion.copy(camera.quaternion);this.moon.material.opacity=g;}
 hide(){this.moon.visible=false;}
 info(){const s=this.sky;return s?{text:describe(s),nyTime:`${s.ny.y}-${String(s.ny.m).padStart(2,'0')}-${String(s.ny.d).padStart(2,'0')} ${String(s.ny.hh).padStart(2,'0')}:${String(s.ny.mm).padStart(2,'0')}`,utcOffset:s.offset,preview:this.clock.preview,sun:{elevation:+s.sun.elevation.toFixed(2),azimuth:+s.sun.azimuth.toFixed(2)},moon:{altitude:+s.moon.altitude.toFixed(1),azimuth:+s.moon.azimuth.toFixed(1),illumination:+s.moon.illumination.toFixed(3),waxing:s.moon.waxing},lamps:+this.cur.lamps.toFixed(2),shadows:this.shadows,keyLight:{intensity:+this.r.sun.intensity.toFixed(2),castShadow:this.r.sun.castShadow,from:this.cur.dir.map(v=>+v.toFixed(3))}}:null;}}
