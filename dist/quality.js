// Graphics quality presets (Step A). Every visual effect reads its settings from the active preset, so
// Low / Medium / High / Auto change the whole picture at once. Auto starts at Medium, watches the frame
// rate, and steps down when frames are slow or up when there is headroom, at most once each way per
// minute so it never flickers between presets.
//   ?quality=low|medium|high|auto in the URL overrides the saved choice (for testing, like ?time=).
import {AO} from './campus/atmosphere/ao.js?v=24';
import {setPBR} from './campus/atmosphere/pbr.js?v=24';
import {perfOn} from './perf.js?v=24';
export const PRESETS={
 low:{label:'Low',grass:'off',ssr:0,probe:'off',shafts:0,bloomLevels:0,grain:0,ao:.75,ssao:false,pbr:false,pixelRatio:1,shadows:false,shadowSize:512,bloom:false,far:650,trees:{near:35,mid:150}},
 medium:{label:'Medium',grass:'medium',ssr:12,probe:'medium',shafts:12,bloomLevels:4,grain:.016,ao:1,ssao:false,pbr:true,pixelRatio:1.25,shadows:true,shadowSize:1024,bloom:true,far:1100,trees:{near:55,mid:220}},
 high:{label:'High',grass:'high',ssr:24,probe:'high',shafts:24,bloomLevels:5,grain:.018,ao:1,ssao:true,pbr:true,pixelRatio:2,dynamic:{start:1.5,min:1},shadows:true,shadowSize:2048,bloom:true,far:1600,trees:{near:80,mid:280}}};
export const ORDER=['low','medium','high'];
// Dynamic resolution for High (performance fix 13). High was GPU-bound by pixel count: about 43 ms per frame at
// a 2x pixel ratio on an M3, where frame time followed the number of pixels drawn. Instead of one fixed ratio,
// High picks the 3D render's pixel ratio from a ladder (2, 1.75, 1.5, 1.35, 1.2, 1.1, 1.0, never above the
// screen's) once a second: a step down when the last second averaged slower than 52 fps or its slow frames
// (95th percentile) were slower than 38 fps; a step up only after three seconds in a row comfortably at 60, and
// a ratio that failed waits 20 s before it is tried again, then 40, 80 and so on up to 5 minutes, so it settles
// instead of see-sawing. It starts at 1.5.
// Only the 3D canvas changes: the interface is HTML and text stays at full sharpness. ?perf-off=dynres pins
// High at its old fixed 2x; ?dynres=1.5 (or any ratio) pins it at that ratio for testing.
const LADDER=[2,1.75,1.5,1.35,1.2,1.1,1];
export class DynamicResolution{
 constructor(city){this.city=city;this.on=false;this.ratio=1;this.samples=[];this.good=0;this.lastChange=0;this.failed=new Map();
  const pin=(globalThis.location?.search||'').match(/[?&]dynres=([0-9.]+)/);this.pin=pin?Math.max(.5,Math.min(3,+pin[1])):0;}
 get ladder(){const max=globalThis.devicePixelRatio||1;const l=LADDER.filter(x=>x<=max+1e-6);return l.length?l:[max];}
 reset(spec){this.on=!!spec;if(!this.on)return;this.spec=spec;this.samples=[];this.good=0;this.failed.clear();this.lastChange=performance.now();
  const L=this.ladder;this.ratio=this.pin||L.reduce((b,x)=>Math.abs(x-spec.start)<Math.abs(b-spec.start)?x:b,L[0]);}
 set(ratio,now){if(ratio===this.ratio)return;this.ratio=ratio;this.lastChange=now;this.samples=[];this.good=0;const c=this.city;c.renderer.setPixelRatio(ratio);c.resize();}
 tick(t,dt){if(!this.on||this.pin||this.city.dynPaused||!(dt>0)||dt>.5)return;this.samples.push(dt);const now=performance.now();
  if(now-this.lastChange<1500||this.samples.length<30)return;const n=this.samples.length,span=this.samples.reduce((a,b)=>a+b,0);if(span<1)return;
  const mean=span/n,p95=[...this.samples].sort((a,b)=>a-b)[Math.floor(n*.95)];this.samples=[];
  const L=this.ladder,i=Math.max(0,L.indexOf(this.ratio)),floor=this.spec.min||1;
  if((1/mean<52||1/p95<38)&&i<L.length-1&&L[i+1]>=floor-1e-6){{const f=this.failed.get(this.ratio);this.failed.set(this.ratio,{at:now,wait:f?Math.min(300000,f.wait*2):20000});}const k=1/mean<36&&i+2<L.length&&L[i+2]>=floor-1e-6?2:1;this.good=0;this.set(L[i+k],now);return;}
  if(1/mean>59&&1/p95>50){this.good++;if(this.good>=3&&i>0){const up=L[i-1];const f=this.failed.get(up);if(!f||now-f.at>f.wait)this.set(up,now);else this.good=0;}}else this.good=0;}}
export class Quality{
 constructor(city,store){this.city=city;this.store=store;this.dyn=new DynamicResolution(city);this.choice='auto';this.level='medium';this.listeners=[];this.samples=[];this.lastStep=-1e9;
  let saved=null;try{saved=store.get('quality');}catch{}const url=(location.search.match(/[?&]quality=(low|medium|high|auto)/)||[])[1];
  this.set(url||saved||'auto',{save:false});}
 // choice: 'low' | 'medium' | 'high' | 'auto'.
 set(choice,{save=true}={}){this.choice=PRESETS[choice]||choice==='auto'?choice:'auto';if(save){try{this.store.set('quality',this.choice);}catch{}}
  this.apply(this.choice==='auto'?(this.level||'medium'):this.choice);}
 get preset(){return PRESETS[this.level];}
 apply(level){this.level=level;const q=PRESETS[level],c=this.city,r=c.renderer;
  // High uses dynamic resolution (below); every other preset a fixed pixel ratio.
  this.dyn.reset(q.dynamic&&perfOn('dynres')?q.dynamic:null);r.setPixelRatio(Math.min(window.devicePixelRatio||1,this.dyn.on?this.dyn.ratio:q.pixelRatio));c.resize();
  // Tree detail distances (campus-world TREE_LOD): full models near, lighter ones in the middle, billboards beyond.
  if(c.world&&q.trees)c.world.treeLod=q.trees;
  r.shadowMap.enabled=q.shadows;c.sun.castShadow=q.shadows;
  if(c.sun.shadow.mapSize.x!==q.shadowSize){c.sun.shadow.mapSize.set(q.shadowSize,q.shadowSize);c.sun.shadow.map?.dispose();c.sun.shadow.map=null;}
  c.postMat.uniforms.bloomOn.value=q.bloom?1:0;
  // Post shader variants: compile only the effects this preset uses (fewer registers, faster on every pixel).
  {const d={};if(perfOn('post')){if(q.ssao)d.POST_SSAO='';if(q.ssr)d.POST_SSR='';if(q.shafts)d.POST_SHAFTS='';if(q.bloom)d.POST_BLOOM='';}else Object.assign(d,{POST_SSAO:'',POST_SSR:'',POST_SHAFTS:'',POST_BLOOM:''});
   // Half-resolution AO and shafts (performance fix 11): the post pass reads them from the small FX target.
   const fx=perfOn('halfres')&&perfOn('post')&&(q.ssao||q.shafts);c.fxOn=fx;if(c.fxMat){const fd={};if(q.ssao)fd.POST_SSAO='';if(q.shafts)fd.POST_SHAFTS='';const fk=Object.keys(fd).join();if(c.fxMat.userData.defKey!==fk){c.fxMat.defines=fd;c.fxMat.userData.defKey=fk;c.fxMat.needsUpdate=true;}}if(fx)d.POST_FX='';
   const key=Object.keys(d).join();if(c.postMat.userData.defKey!==key){c.postMat.defines=d;c.postMat.userData.defKey=key;c.postMat.needsUpdate=true;}}if(c.bloom){c.bloom.on=q.bloom;c.bloom.levels=q.bloomLevels||1;}c.postMat.uniforms.grainAmt.value=q.grain;c.postMat.uniforms.shaftOn.value=q.shafts?1:0;c.postMat.uniforms.ssrN.value=q.ssr;c.probe?.setMode(q.probe);c.precip?.setLevel(level);c.grassLevel=q.grass;if(c.world){c.world.grassLevel=q.grass;c.world.grassField?.setLevel(q.grass);}c.postMat.uniforms.shaftN.value=q.shafts||1;AO.strength.value=q.ao;c.postMat.uniforms.ssaoOn.value=q.ssao?1:0;setPBR(q.pbr);c.camera.far=q.far;c.camera.updateProjectionMatrix();
  // Materials compiled with or without shadows need a rebuild when shadows switch, and only then: marking every
  // material on every preset change recompiled the whole scene, a freeze of several seconds each time Auto
  // stepped (performance fix 8).
  if(!perfOn('recompile')||this.shadowsOn!==q.shadows){this.shadowsOn=q.shadows;c.scene.traverse(o=>{if(o.material){for(const m of [].concat(o.material))m.needsUpdate=true;}});}
  for(const f of this.listeners)f(level,q);}
 onChange(f){this.listeners.push(f);f(this.level,this.preset);}
 // Called every frame with the frame time in seconds; only acts in Auto.
 tick(t,dt){this.dyn.tick(t,dt);if(this.choice!=='auto'||!(dt>0)||dt>.5)return;this.samples.push(dt);if(this.samples.length<240)return;
  const s=this.samples.sort((a,b)=>a-b),mean=this.samples.reduce((a,b)=>a+b,0)/this.samples.length,p90=s[Math.floor(s.length*.9)];this.samples=[];
  if(t-this.lastStep<60000)return;const i=ORDER.indexOf(this.level);
  if((1/mean<42||1/p90<30)&&i>0){this.lastStep=t;this.apply(ORDER[i-1]);}
  else if(1/mean>58&&1/p90>50&&i<ORDER.length-1){this.lastStep=t;this.apply(ORDER[i+1]);}}}
// Benchmark (?bench=1): holds the camera at fixed review views for a few seconds each and reports the mean
// frame rate and the 1% low per view, for the preset in use. Results show in the FPS line and the console,
// and are kept on window.Commencement.bench for scripts.
export const BENCH_VIEWS=[
 {name:'Arch',cam:{x:0,y:1.7,n:-48,lx:0,ly:9,ln:0,fov:63}},
 {name:'Bobst',cam:{x:-8,y:1.7,n:-122,lx:-5,ly:18,ln:-200,fov:70}},
 {name:'The Row',cam:{x:25,y:1.7,n:-28,lx:78,ly:7,ln:15,fov:63}},
 {name:'Astor Place',cam:{x:512,y:1.7,n:-141,lx:531,ly:4,ln:-123,fov:63}}];
export async function runBench(game,{seconds=6,warm=60,frame=()=>new Promise(r=>requestAnimationFrame(r))}={}){const out=[];
 for(const v of BENCH_VIEWS){game.viewFrom(v.cam);for(let i=0;i<warm;i++)await frame();const dts=[];let t0=performance.now(),last=t0;
  while(performance.now()-t0<seconds*1000){await frame();const now=performance.now();dts.push(now-last);last=now;}
  const s=[...dts].sort((a,b)=>b-a),mean=dts.reduce((a,b)=>a+b,0)/dts.length;out.push({view:v.name,fps:+(1000/mean).toFixed(1),low1:+(1000/s[Math.max(0,Math.floor(s.length*.01))]).toFixed(1),frames:dts.length});}
 game.viewFrom(null);return out;}
