import {DriveAudio} from './audio.js?v=24';
import {Soundtrack} from './soundtrack.js?v=24';
import {CityRenderer} from './renderer3d.js?v=24';
import * as THREE from './vendor/three.module.js';
import {VEHICLE,FixedVehicleLoop,inputFromKeys,resolveContact} from './physics.js?v=24';
import {campus,snapToStreet} from './campus/campus.js?v=24';
import {CampusMinimap} from './campus/minimap.js?v=24';
import {assetState} from './preload.js?v=24';
import {migrateStorage,store} from './storage.js?v=24';
migrateStorage();
// Commencement: one place (Washington Square) and one vehicle (NYU Campus Safety unit 4, see vehicle.js).
const $=id=>document.getElementById(id),canvas=$('world'),city=new CityRenderer(canvas),mini=$('mini').getContext('2d');
const audio=new DriveAudio(),soundtrack=new Soundtrack();
// Sound starts on the first key press, click or tap (browsers require a gesture).
const unlockAudio=()=>{audio.unlock();if(audio.ctx)soundtrack.init(audio.ctx);};window.addEventListener('pointerdown',unlockAudio);
let simulation=new FixedVehicleLoop(VEHICLE),state=simulation.state,renderState=state,playing=false,paused=false,optionsOpen=false,introActive=true,mph=true,keys={},last=0,controls={},time=0,optionSnapshot=null,optionsReturnPaused=false,minimap=null;
// The car sits at a real map position and the solver queries the campus surface (curbs, grass).
function placeVehicle(at){const c=campus(),p=at||c.spawn,s=simulation.state;s.position.x=p.x;s.position.z=p.z;s.orientation.yaw=p.yaw;simulation.surface=c.surface;simulation.previous=structuredClone(s);state=s;renderState=s;if(!minimap)minimap=new CampusMinimap(c.data,c.streets);}
function start(){playing=true;paused=false;optionsOpen=false;simulation=new FixedVehicleLoop(VEHICLE);state=simulation.state;renderState=state;placeVehicle();time=0;controls={};keys={};$('garage').hidden=true;$('hud').hidden=false;$('pauseDialog').hidden=true;document.body.classList.remove('options-open');document.body.classList.add('playing');}
function reset(){const at=snapToStreet(campus(),state.position.x,state.position.z,state.orientation.yaw);simulation=new FixedVehicleLoop(VEHICLE);state=simulation.state;renderState=state;placeVehicle(at);time=0;controls={};keys={};}
function pause(value=!paused){if(!playing||introActive||optionsOpen)return;paused=value;keys={};$('pauseDialog').hidden=!value;if(value)$('resume').focus();}
const OPTION_IDS=['preset','sound','music','fpsToggle'];
function openOptions(){if(introActive||optionsOpen)return;optionsReturnPaused=paused;paused=true;keys={};controls={};optionsOpen=true;optionSnapshot=Object.fromEntries(OPTION_IDS.map(id=>[id,$(id).value]));$('pauseDialog').hidden=true;$('garage').hidden=false;document.body.classList.add('options-open');$('closeOptions').focus();}
function closeOptions(apply=false){if(!optionsOpen)return;if(!apply){for(const [id,v] of Object.entries(optionSnapshot||{}))$(id).value=v;setFps($('fpsToggle').value==='on');}
 optionsOpen=false;$('garage').hidden=true;document.body.classList.remove('options-open');paused=optionsReturnPaused;keys={};$('pauseDialog').hidden=!paused;(paused?$('resume'):$('menuBtn')).focus();}
$('drive').onclick=()=>closeOptions(true);$('closeOptions').onclick=$('cancelOptions').onclick=()=>closeOptions(false);$('reset').onclick=reset;$('pause').onclick=()=>pause();$('resume').onclick=()=>pause(false);$('restart').onclick=()=>{reset();pause(false);};$('back').onclick=openOptions;$('menuBtn').onclick=openOptions;$('units').onclick=()=>{mph=!mph;$('units').textContent=mph?'MPH':'KPH';};$('about').onclick=()=>$('aboutDialog').showModal();$('closeAbout').onclick=()=>$('aboutDialog').close();
// The opening: the publisher splash, then the Commencement title card, which is also the loading screen.
// The game renders behind the card the whole time, so geometry, textures and shaders are ready before it
// lifts. The card stays at least MIN_TITLE ms, and longer if anything is still loading, with a thin violet
// ink line under the title filling as it goes. Then the card fades into the (paused) game and a quiet
// prompt asks for a click or tap, which also unlocks audio in every browser.
const MIN_TITLE=4000;let phase='splash',titleAt=0,steady=0,readySince=0,compiled=false,compiling=false;
function showTitle(){if(phase!=='splash')return;phase='title';titleAt=performance.now();$('boot').classList.add('fading');setTimeout(()=>{$('boot').hidden=true;},850);$('title').hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>$('title').classList.add('shown')));}
function openingTick(now){if(phase!=='title')return;const w=city.world,r=city.renderer;
 if(w&&!compiling){compiling=true;if(r.compileAsync)r.compileAsync(city.scene,city.camera).then(()=>{compiled=true;},()=>{compiled=true;});else compiled=true;}
 const a=assetState(),assets=a.done/Math.max(1,a.done+a.pending),ready=!!w&&compiled&&a.pending===0;steady=ready?steady+1:0;if(!ready)readySince=0;else if(!readySince)readySince=now;
 const load=(w?.3:0)+(compiled?.3:0)+assets*.4,t=Math.min(1,(now-titleAt)/MIN_TITLE);$('ink').style.transform=`scaleX(${Math.max(.02,Math.min(load,t)).toFixed(3)})`;
 if(t>=1&&steady>=6&&now-readySince>=400)leaveTitle();}
function leaveTitle(){phase='leaving';$('ink').style.transform='scaleX(1)';document.body.classList.remove('booting');document.body.classList.add('awaiting-start');$('title').classList.add('leaving');
 setTimeout(()=>{$('title').hidden=true;phase='prompt';$('startPrompt').hidden=false;requestAnimationFrame(()=>$('startPrompt').classList.add('shown'));},1500);}
function beginPlay(){if(phase!=='prompt')return;phase='playing';unlockAudio();introActive=false;document.body.classList.remove('awaiting-start');$('startPrompt').classList.remove('shown');setTimeout(()=>{$('startPrompt').hidden=true;},600);paused=document.hidden;$('pauseDialog').hidden=!paused;}
const dismissIntro=()=>{if(phase==='splash')showTitle();else if(phase==='prompt')beginPlay();};
$('boot').onclick=showTitle;$('boot').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showTitle();}};
$('startPrompt').onclick=beginPlay;window.addEventListener('pointerdown',()=>{if(phase==='prompt')beginPlay();});
window.addEventListener('keydown',e=>{unlockAudio();const k=e.key.toLowerCase();if(introActive){if(phase==='prompt'&&!['shift','control','alt','meta','tab'].includes(k)){e.preventDefault();beginPlay();}else if(phase==='splash'&&(k==='enter'||k===' ')){e.preventDefault();showTitle();}return;}
if($('aboutDialog').open)return;
if(optionsOpen){if(k==='escape'){e.preventDefault();closeOptions(false);}if(k==='tab'){const focus=[...$('garage').querySelectorAll('button,input,select,a')].filter(x=>!x.disabled&&x.getClientRects().length);const first=focus[0],last=focus.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;}
if(!playing||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(k==='escape'){e.preventDefault();pause();return;}if(paused)return;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(k==='r'){reset();return;}keys[k]=true;});
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);window.addEventListener('blur',()=>pause(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{if(paused||introActive)return;audio.unlock();e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true;};b.onpointerup=b.onpointercancel=()=>keys[b.dataset.key]=false;});
function render(dt){
 city.update(renderState,{...controls,motionActive:!paused&&!optionsOpen&&!introActive,braking:keys.s||keys.arrowdown},time,dt,playing&&!optionsOpen,$('preset').value);
 if(minimap){const s=renderState;minimap.draw(mini,180,150,s.position.x,s.position.z,s.orientation.yaw);const c=campus(),street=c.streets.streetAt(s.position.x,s.position.z),park=c.collision.surface(s.position.x,s.position.z).kind!=='road'&&Math.hypot(s.position.x+30,s.position.z+40)<170;$('checkpoint').textContent=(street||(park?'Washington Square Park':'—')).toUpperCase();}}
function contacts(s){for(const c of campus().collision.contacts(s.position.x,s.position.z,s.orientation.yaw))resolveContact(s,VEHICLE,c);}
// On-screen FPS counter (Options > FPS counter, or ?fps=1 in the URL): frames per second averaged over half
// a second, the slowest frame in that window, and the last frame's draw calls and triangles (shadows included).
const fpsMeter={on:false,frames:0,t0:0,worst:0,el:null};
function setFps(on){fpsMeter.on=on;city.renderer.info.autoReset=!on;fpsMeter.el=fpsMeter.el||$('fps');fpsMeter.el.hidden=!on;fpsMeter.frames=0;fpsMeter.t0=0;fpsMeter.worst=0;try{store.set('fps',on?'on':'off');}catch{}}
{let saved=null;try{saved=store.get('fps');}catch{}const on=/[?&]fps=1/.test(location.search)||saved==='on';$('fpsToggle').value=on?'on':'off';setFps(on);$('fpsToggle').addEventListener('change',e=>setFps(e.target.value==='on'));}
function fpsTick(t,dt){if(!fpsMeter.on)return;const info=city.renderer.info;info.autoReset=false;const calls=info.render.calls,tris=info.render.triangles;info.reset();if(!fpsMeter.t0){fpsMeter.t0=t;return;}fpsMeter.frames++;fpsMeter.worst=Math.max(fpsMeter.worst,dt*1000);const span=t-fpsMeter.t0;if(span<500)return;
 const fps=fpsMeter.frames*1000/span;fpsMeter.el.textContent=`${fps.toFixed(0)} fps · worst ${fpsMeter.worst.toFixed(1)} ms · ${calls} calls · ${(tris/1000).toFixed(0)}k tris`;fpsMeter.el.classList.toggle('slow',fps<55);fpsMeter.frames=0;fpsMeter.t0=t;fpsMeter.worst=0;}
// Options note under Atmosphere: what Real NYC time is showing right now (refreshed about once a second).
let skyNoteAt=0;function skyNote(t){if(t<skyNoteAt)return;skyNoteAt=t+1000;const on=$('preset').value==='realtime',note=$('skyNote');if(!on){note.hidden=true;return;}note.hidden=false;const i=city.sky.info();note.textContent=i?i.text+(i.preview?' (preview)':''):'';}
function tick(t){const dt=Math.max(0,(t-last)/1000||0);last=t;fpsTick(t,dt);skyNote(t);openingTick(t);
 if(playing&&!paused){renderState=simulation.advance(dt,inputFromKeys(keys),(s,h,simTime)=>{time=simTime;contacts(s);});state=simulation.state;controls=simulation.controls;}else{simulation.accumulator=0;simulation.previous=structuredClone(simulation.state);renderState=simulation.state;}
 render(dt);audio.update(state,controls,paused||optionsOpen||introActive,$('sound').value==='on');soundtrack.update(!paused&&!optionsOpen&&!introActive&&$('sound').value==='on'&&$('music').value==='on',{x:state.position?.x||0,z:state.position?.z||0},state.orientation?.yaw||0);
 $('speed').textContent=String(Math.round(Math.abs(state.speed)*(mph?2.237:3.6))).padStart(2,'0');$('gear').textContent=state.speed<-.3?'R':'D';$('damageBar').style.width=state.damage*100+'%';requestAnimationFrame(tick);}
requestAnimationFrame(tick);
window.Commencement={start,pause,reset,openOptions,closeOptions,
// Developer helpers for review screenshots (map metres: x east, z north; yaw 0 = north).
teleport:(x,z,yaw=0)=>{simulation=new FixedVehicleLoop(VEHICLE);state=simulation.state;placeVehicle({x,z,yaw});return true;},
viewFrom:o=>{city.cameraOverride=o||null;if(!o)city.preset='';},
// The decay layer: 0 = clean 2026, 1 = ruined 2126; fades over `seconds` (0 = jump). A review tool until Step 10's shift.
era:(t,seconds=1)=>{const w=city.world;if(!w?.eraTo)return false;if(seconds<=0)w.setDecay(t);else w.eraTo(t,seconds);return true;},
sky:()=>city.sky.info(),
renderInfo:()=>{let meshes=0,tris=0;const cam=city.camera,fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
 city.scene.traverseVisible(o=>{if(!o.isMesh||!o.geometry)return;if(o.geometry.boundingSphere==null)o.geometry.computeBoundingSphere();const s=o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld);if(!fr.intersectsSphere(s))return;meshes++;const g=o.geometry,n=(g.index?g.index.count:g.attributes.position.count)/3;tris+=n*(o.isInstancedMesh?o.count:1);});return {drawCalls:meshes,triangles:Math.round(tris)};},
getState:()=>({...state,playing,paused,optionsOpen,intro:introActive})};
if(document.modelContext?.registerTool){try{document.modelContext.registerTool({name:'read_driving_session',description:'Read the current vehicle state on Washington Square.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>window.Commencement.getState()});document.modelContext.registerTool({name:'start_drive',description:'Start a fresh drive on Washington Square.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:()=>{start();return window.Commencement.getState();}});}catch(e){console.warn('WebMCP unavailable',e);}}
// Old name kept as an alias for review scripts written before the rename.
window.NightView=window.Commencement;
start();paused=true;document.body.classList.add('booting');setTimeout(showTitle,2400);
// Era option: the decay layer fades between 2126 and 2026 (a review tool until Step 10).
{const e=$('era');if(e){const q=new URLSearchParams(location.search).get('era');if(q==='2026')e.value='2026';e.addEventListener('change',()=>city.world?.eraTo?.(e.value==='2026'?0:1));}}
