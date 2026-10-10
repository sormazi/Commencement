// Graphics quality presets (Step A). Every visual effect reads its settings from the active preset, so
// Low / Medium / High / Auto change the whole picture at once. Auto starts at Medium, watches the frame
// rate, and steps down when frames are slow or up when there is headroom, at most once each way per
// minute so it never flickers between presets.
//   ?quality=low|medium|high|auto in the URL overrides the saved choice (for testing, like ?time=).
import {AO} from './campus/atmosphere/ao.js?v=24';
import {setPBR} from './campus/atmosphere/pbr.js?v=24';
export const PRESETS={
 low:{label:'Low',grass:'off',ssr:0,probe:'off',shafts:0,bloomLevels:0,grain:0,ao:.75,ssao:false,pbr:false,pixelRatio:1,shadows:false,shadowSize:512,bloom:false,far:650},
 medium:{label:'Medium',grass:'medium',ssr:12,probe:'medium',shafts:12,bloomLevels:4,grain:.016,ao:1,ssao:false,pbr:true,pixelRatio:1.25,shadows:true,shadowSize:1024,bloom:true,far:1100},
 high:{label:'High',grass:'high',ssr:24,probe:'high',shafts:24,bloomLevels:5,grain:.018,ao:1,ssao:true,pbr:true,pixelRatio:2,shadows:true,shadowSize:2048,bloom:true,far:1600}};
export const ORDER=['low','medium','high'];
export class Quality{
 constructor(city,store){this.city=city;this.store=store;this.choice='auto';this.level='medium';this.listeners=[];this.samples=[];this.lastStep=-1e9;
  let saved=null;try{saved=store.get('quality');}catch{}const url=(location.search.match(/[?&]quality=(low|medium|high|auto)/)||[])[1];
  this.set(url||saved||'auto',{save:false});}
 // choice: 'low' | 'medium' | 'high' | 'auto'.
 set(choice,{save=true}={}){this.choice=PRESETS[choice]||choice==='auto'?choice:'auto';if(save){try{this.store.set('quality',this.choice);}catch{}}
  this.apply(this.choice==='auto'?(this.level||'medium'):this.choice);}
 get preset(){return PRESETS[this.level];}
 apply(level){this.level=level;const q=PRESETS[level],c=this.city,r=c.renderer;
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,q.pixelRatio));c.resize();
  r.shadowMap.enabled=q.shadows;c.sun.castShadow=q.shadows;
  if(c.sun.shadow.mapSize.x!==q.shadowSize){c.sun.shadow.mapSize.set(q.shadowSize,q.shadowSize);c.sun.shadow.map?.dispose();c.sun.shadow.map=null;}
  c.postMat.uniforms.bloomOn.value=q.bloom?1:0;if(c.bloom){c.bloom.on=q.bloom;c.bloom.levels=q.bloomLevels||1;}c.postMat.uniforms.grainAmt.value=q.grain;c.postMat.uniforms.shaftOn.value=q.shafts?1:0;c.postMat.uniforms.ssrN.value=q.ssr;c.probe?.setMode(q.probe);c.grassLevel=q.grass;if(c.world){c.world.grassLevel=q.grass;c.world.grassField?.setLevel(q.grass);}c.postMat.uniforms.shaftN.value=q.shafts||1;AO.strength.value=q.ao;c.postMat.uniforms.ssaoOn.value=q.ssao?1:0;setPBR(q.pbr);c.camera.far=q.far;c.camera.updateProjectionMatrix();
  // Materials compiled with or without shadows need a rebuild when shadows switch.
  c.scene.traverse(o=>{if(o.material){for(const m of [].concat(o.material))m.needsUpdate=true;}});
  for(const f of this.listeners)f(level,q);}
 onChange(f){this.listeners.push(f);f(this.level,this.preset);}
 // Called every frame with the frame time in seconds; only acts in Auto.
 tick(t,dt){if(this.choice!=='auto'||!(dt>0)||dt>.5)return;this.samples.push(dt);if(this.samples.length<240)return;
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
