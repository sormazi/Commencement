import * as T from '../vendor/three.module.js';
import {setPBR} from '../campus/atmosphere/pbr.js?v=24';
// Performance benchmark and frame profiler (performance pass, after Step B). Developer tool, not part of play.
// Open the game with ?bench=auto: it starts real play (past the title), then for Low, Medium and High measures
// the four review views, heavy rain and snow at the Arch, and a 30 s camera loop round the park. Per frame it
// records CPU time in the frame callback, GPU time (EXT_disjoint_timer_query_webgl2, sampled), draw calls,
// program switches, texture binds, uploads, shader compiles and JS heap growth (garbage collection shows as a
// drop). It only measures while the page is visible (a hidden window draws nothing) and redoes any
// interrupted view. Results: window.__Q.results, the console, and a panel on screen when done.
export function runBench(G,{levels}={}){if(window.__Q)return window.__Q;
const Q=window.__Q={status:'installed',frames:[],cur:null,results:{},meta:{}};
const gl=document.querySelector('canvas#world').getContext('webgl2');const tq=gl.getExtension('EXT_disjoint_timer_query_webgl2');
const count=(name,key)=>{const f=gl[name];gl[name]=function(...a){if(Q.cur)Q.cur[key]++;return f.apply(gl,a);};};
for(const n of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced','drawRangeElements'])count(n,'draws');
count('useProgram','programs');count('bindTexture','binds');
for(const n of ['bufferData','bufferSubData','texImage2D','texSubImage2D','compressedTexImage2D','texImage3D','texStorage2D'])count(n,'uploads');
count('compileShader','compiles');count('linkProgram','links');
const pending=[];const raf=window.requestAnimationFrame;
window.requestAnimationFrame=function(cb){return raf.call(window,t=>{
  const c=Q.cur={draws:0,programs:0,binds:0,uploads:0,compiles:0,links:0,t0:performance.now(),heap0:performance.memory?.usedJSHeapSize||0};let q=null;
  if(tq&&pending.length<8){q=gl.createQuery();gl.beginQuery(tq.TIME_ELAPSED_EXT,q);}
  try{cb(t);}finally{if(q)gl.endQuery(tq.TIME_ELAPSED_EXT);c.cpu=performance.now()-c.t0;c.heap1=performance.memory?.usedJSHeapSize||0;c.t=t;Q.cur=null;
   if(c.draws>0){if(q){c.q=q;pending.push(c);}Q.frames.push(c);if(Q.frames.length>9000)Q.frames.splice(0,3000);}else if(q){gl.deleteQuery(q);}
   for(let i=pending.length-1;i>=0;i--){const f=pending[i];if(gl.getQueryParameter(f.q,gl.QUERY_RESULT_AVAILABLE)){const dis=gl.getParameter(tq.GPU_DISJOINT_EXT);f.gpu=dis?null:gl.getQueryParameter(f.q,gl.QUERY_RESULT)/1e6;gl.deleteQuery(f.q);delete f.q;pending.splice(i,1);}}}
 });};

const VIEWS=[['Arch',{x:0,y:1.7,n:-48,lx:0,ly:9,ln:0,fov:63}],['Bobst',{x:-8,y:1.7,n:-122,lx:-5,ly:18,ln:-200,fov:70}],['The Row',{x:25,y:1.7,n:-28,lx:78,ly:7,ln:15,fov:63}],['Astor Place',{x:512,y:1.7,n:-141,lx:531,ly:4,ln:-123,fov:63}]];
const vis=()=>new Promise(r=>{const c=()=>document.visibilityState==='visible'?r():setTimeout(c,400);c();});
const frame=()=>new Promise(r=>requestAnimationFrame(r));
const pct=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(s.length*p))];};
const avg=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
const stats=(F)=>{const dts=[];for(let i=1;i<F.length;i++)dts.push(F[i].t-F[i-1].t);const cpu=F.map(f=>f.cpu),gpu=F.map(f=>f.gpu).filter(x=>x!=null);
 let gc=0,alloc=0;for(let i=0;i<F.length;i++){const d=F[i].heap1-F[i].heap0;if(d>0)alloc+=d;if(i&&F[i].heap0<F[i-1].heap1-1e6)gc++;}
 const long=F.slice(1).map((f,i)=>({dt:+(f.t-F[i].t).toFixed(1),cpu:+f.cpu.toFixed(1),gpu:f.gpu!=null?+f.gpu.toFixed(1):null,compiles:f.compiles+f.links,uploads:f.uploads,draws:f.draws,gcBefore:F[i].heap1-f.heap0>1e6})).filter(x=>x.dt>25).slice(0,15);
 const secs=(F[F.length-1].t-F[0].t)/1000;
 return {fps:+(1000/avg(dts)).toFixed(1),low1:+(1000/pct(dts,.99)).toFixed(1),cpuMean:+avg(cpu).toFixed(2),cpuP95:+pct(cpu,.95).toFixed(1),cpuMax:+Math.max(...cpu).toFixed(1),gpuMean:gpu.length?+avg(gpu).toFixed(2):null,gpuP95:gpu.length?+pct(gpu,.95).toFixed(1):null,gpuN:gpu.length,draws:Math.round(avg(F.map(f=>f.draws))),programs:Math.round(avg(F.map(f=>f.programs))),binds:Math.round(avg(F.map(f=>f.binds))),uploadsPerFrame:+avg(F.map(f=>f.uploads)).toFixed(1),compiles:F.reduce((a,f)=>a+f.compiles+f.links,0),allocKBperFrame:Math.round(alloc/1024/F.length),gcPerSec:+(gc/secs).toFixed(2),longFrames:F.slice(1).filter((f,i)=>f.t-F[i].t>25).length,frames:F.length,long};};
const measure=async(ms,each)=>{for(let tries=0;tries<80;tries++){await vis();let broke=false;const onh=()=>{if(document.visibilityState==='hidden')broke=true;};document.addEventListener('visibilitychange',onh);
  for(let i=0;i<60&&!broke;i++){if(each)each(-1);await frame();}const start=Q.frames.length,t0=performance.now();while(!broke&&performance.now()-t0<ms){if(each)each((performance.now()-t0)/1000);await frame();}
  document.removeEventListener('visibilitychange',onh);const F=Q.frames.slice(start);if(broke||F.length<30){Q.status+=' (interrupted, redoing)';continue;}return stats(F);}return null;};
Q.run=(async()=>{Q.status='waiting for visible window';await vis();
 // Start real play (past the title, which blurs the canvas and animates the smoke).
 for(let i=0;i<120&&G.getState().opening!=='prompt';i++)await new Promise(r=>setTimeout(r,500));
 document.getElementById('begin')?.click();document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));document.body.click();window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));
 for(let i=0;i<20&&G.getState().opening!=='done';i++)await new Promise(r=>setTimeout(r,500));
 Q.meta={w:innerWidth,h:innerHeight,dpr:devicePixelRatio,opening:G.getState().opening,booting:document.body.classList.contains('booting'),chrome:navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0]};
 // Settle first: just after the title the first view ran at half speed while tiles, textures and the probe
 // finished loading, then the same view ran at 60 later. Wait about six seconds and 300 frames before measuring.
 {const t0=performance.now();for(let i=0;i<300||performance.now()-t0<6000;i++)await frame();}
 Q.measure=measure;Q.frame=frame;
 Q.levels=levels||['low','medium','high'];for(const level of Q.levels){Q.status='switching to '+level;G.quality(level);G.weather('clear');await vis();for(let i=0;i<150;i++)await frame();
  const R=Q.results[level]={};
  for(const [name,cam] of VIEWS){Q.status=`${level}: ${name}`;G.viewFrom(cam);R[name]=await measure(6000);}
  G.viewFrom(VIEWS[0][1]);for(const w of ['heavyrain','snow']){Q.status=`${level}: Arch ${w}`;G.weather(w);for(let i=0;i<60;i++)await frame();R['Arch '+w]=await measure(6000);}
  G.weather('clear');Q.status=`${level}: park loop`;
  R['Park loop']=await measure(30000,(s)=>{const T=s<0?0:s;const a=T*12/95,cn=-110;const x=110*Math.cos(a),n=cn+70*Math.sin(a);const tx=-Math.sin(a)*110,tn=Math.cos(a)*70,l=Math.hypot(tx,tn);G.viewFrom({x,y:1.7,n,lx:x+tx/l*30,ly:2,ln:n+tn/l*30,fov:63});});}
 G.viewFrom(null);G.weather('live');G.quality('auto');Q.status='done';if(Q.levels.length){console.log('bench',JSON.stringify({meta:Q.meta,results:Q.results}));showResults(Q);}})().catch(e=>{Q.status='error '+e.message;});
return Q;}
function showResults(Q){const el=document.createElement('pre');Object.assign(el.style,{position:'fixed',left:'8px',top:'8px',zIndex:99,background:'#000c',color:'#cfe',font:'11px/1.35 monospace',padding:'10px',maxHeight:'90vh',overflow:'auto',pointerEvents:'auto'});
 const rows=[];for(const [lv,R] of Object.entries(Q.results))for(const [k,v] of Object.entries(R))if(v)rows.push(`${lv.padEnd(7)}${k.padEnd(15)}${String(v.fps).padStart(6)} fps  1%low ${String(v.low1).padStart(5)}  cpu ${v.cpuMean}ms  gpu ${v.gpuMean}ms  draws ${v.draws}  alloc ${v.allocKBperFrame}KB/f  long ${v.longFrames}`);
 el.textContent=`${Q.meta.w}x${Q.meta.h} dpr ${Q.meta.dpr} ${Q.meta.chrome}\n`+rows.join('\n');document.body.appendChild(el);}

// GPU breakdown (?bench=gpu): where High's frame time goes, on the machine that runs it. At the Arch on High it
// measures 4 s with everything on, then 4 s with one thing changed at a time (and restored), so each line's
// difference from the baseline is roughly that feature's cost. Results: window.__Q.gpu, the console, a panel.
export async function runGpuBreakdown(G){const Q=runBench(G,{levels:[]});await Q.run;const c=window.__city,r=c.renderer,frame=Q.frame;
 const settle=async n=>{for(let i=0;i<n;i++)await frame();};
 const relit=()=>c.scene.traverse(o=>{if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true;});
 const post=fn=>{const d={...c.postMat.defines};fn(d);c.postMat.defines=d;c.postMat.needsUpdate=true;};
 let keep;const pr=v=>[()=>{keep=r.getPixelRatio();r.setPixelRatio(v);c.resize();},()=>{r.setPixelRatio(keep);c.resize();}];
 const LINES=[['baseline (High)',()=>{},()=>{}],['pixel ratio 1.5',...pr(1.5)],['pixel ratio 1.25',...pr(1.25)],['pixel ratio 1.0',...pr(1)],
  ['no shadows',()=>{r.shadowMap.enabled=false;c.sun.castShadow=false;relit();},()=>{r.shadowMap.enabled=true;c.sun.castShadow=true;relit();}],
  ['PCF (not soft) shadows',()=>{r.shadowMap.type=T.PCFShadowMap;relit();},()=>{r.shadowMap.type=T.PCFSoftShadowMap;relit();}],
  ['shadow map 1024',()=>{c.sun.shadow.mapSize.set(1024,1024);c.sun.shadow.map?.dispose();c.sun.shadow.map=null;},()=>{c.sun.shadow.mapSize.set(2048,2048);c.sun.shadow.map?.dispose();c.sun.shadow.map=null;}],
  ['no PBR textures',()=>setPBR(false),()=>setPBR(true)],
  ['no SSAO',()=>{c.postMat.uniforms.ssaoOn.value=0;},()=>{c.postMat.uniforms.ssaoOn.value=1;}],
  ['no bloom',()=>{c.bloom.on=false;c.postMat.uniforms.bloomOn.value=0;},()=>{c.bloom.on=true;c.postMat.uniforms.bloomOn.value=1;}],
  ['no shafts',()=>{c.postMat.uniforms.shaftOn.value=0;},()=>{c.postMat.uniforms.shaftOn.value=1;}],
  ['no reflection probe',()=>c.probe.setMode('off'),()=>c.probe.setMode('high')],
  ['no grass field',()=>{keep=c.grassLevel;c.grassLevel='off';},()=>{c.grassLevel=keep;}],
  ['material-first sort',()=>r.setOpaqueSort(null),()=>r.setOpaqueSort((a,b)=>a.groupOrder-b.groupOrder||a.renderOrder-b.renderOrder||a.z-b.z||a.id-b.id)],
  ['no post effects',()=>{keep={...c.postMat.defines};post(d=>{for(const k of Object.keys(d))delete d[k];});c.fxOn=false;},()=>{c.postMat.defines=keep;c.postMat.needsUpdate=true;G.quality('high');}],
  ['baseline again',()=>{},()=>{}]];
 G.quality('high');G.weather('clear');G.viewFrom({x:0,y:1.7,n:-48,lx:0,ly:9,ln:0,fov:63});await settle(240);
 const out=Q.gpu=[];for(const [name,on,off] of LINES){Q.status='gpu: '+name;on();await settle(120);const m=await Q.measure(4000);off();await settle(30);
  out.push({name,fps:m.fps,ms:+(1000/m.fps).toFixed(1),low1:m.low1,gpu:m.gpuMean,cpu:m.cpuMean,draws:m.draws});}
 G.viewFrom(null);G.quality('auto');G.weather('live');Q.status='gpu done';console.log('gpu',JSON.stringify({meta:Q.meta,gpu:out}));
 const base=out[0].ms,el=document.createElement('pre');Object.assign(el.style,{position:'fixed',left:'8px',top:'8px',zIndex:99,background:'#000c',color:'#cfe',font:'11px/1.35 monospace',padding:'10px',maxHeight:'90vh',overflow:'auto'});
 el.textContent=`${Q.meta.w}x${Q.meta.h} dpr ${Q.meta.dpr} ${Q.meta.chrome}  (High, Arch)\n`+out.map(o=>`${o.name.padEnd(24)}${String(o.fps).padStart(6)} fps ${String(o.ms).padStart(6)} ms (${(o.ms-base>=0?'+':'')+(o.ms-base).toFixed(1)})  gpu ${o.gpu}  cpu ${o.cpu}  draws ${o.draws}`).join('\n');document.body.appendChild(el);return out;}
