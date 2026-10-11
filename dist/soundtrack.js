import {DECAY} from './campus/atmosphere/decay.js?v=24';
import {trackPromise} from './preload.js?v=24';
// Commencement's soundtrack (Step 7): "Washington Square, After Hours", an original medium-swing ballad in F
// (32-bar AABA, 100 bpm), composed for the game. One take in two arrangements that play in sync:
//  - 2026: orchestral New York jazz (muted trumpet, a four-way brass soli of trumpet, alto, tenor and
//    trombone, strings, piano, vibraphone, upright bass, brushes), written as MIDI by tools/music/compose.py
//    and rendered with FluidSynth and the FluidR3_GM soundfont (MIT licence, credits.html).
//  - 2126: the same recording on a worn cassette (tools/music/master.py): muffled highs, narrow stereo,
//    wow and flutter, saturation and hiss, with a few rare faults baked in at fixed points: a pitch sag, a
//    bar that drags and catches up, three dropouts, and a faint second voice of print-through.
// Both files hold the 172.8 s loop plus a one-second overrun that repeats the loop's start, and both loop
// from 0.1 s to 172.9 s, so the loop is seamless whatever the decoder's start-up padding. Both sources start
// on the same audio-clock instant and never stop, so a switch between 2026 and 2126 (DECAY, 0 to 1) is a
// crossfade at the same point in the piece. Near the old loudspeaker south of the Arch the music also plays
// through it, band-limited and overdriven; the speaker matters most in 2126.
export const SPEAKER={x:9,z:-14};// map metres (x east, z north)
export const LOOP={start:.1,length:172.8};
const URL26='assets/music/commencement-2026.mp3?v=24',URL21='assets/music/commencement-2126.mp3?v=24';
// Fetch early, during the title: the opening waits for the 2026 file, the 2126 file follows in the background.
const fetchBuf=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+' '+r.status);return r.arrayBuffer();});
const BYTES26=typeof fetch==='function'?trackPromise(fetchBuf(URL26)).catch(()=>null):Promise.resolve(null);
let BYTES21=null;
export class Soundtrack{
 constructor(){this.ctx=null;this.on=false;this.started=false;}
 // Built on first use, after a player gesture (browsers require it).
 init(ctx){if(this.ctx)return;this.ctx=ctx;const c=ctx;
  this.master=c.createGain();this.master.gain.value=0;this.master.connect(c.destination);
  this.g26=c.createGain();this.g21=c.createGain();this.g21.gain.value=0;this.mix=c.createGain();this.g26.connect(this.mix);this.g21.connect(this.mix);
  // Everywhere: the recording as it is.
  this.air=c.createGain();this.air.gain.value=.8;this.mix.connect(this.air);this.air.connect(this.master);
  // The loudspeaker: band-limited horn, a little overdrive, dropouts, panned toward the pole, a short echo.
  this.spk=c.createGain();this.spk.gain.value=0;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=420;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3400;
  const pk=c.createBiquadFilter();pk.type='peaking';pk.frequency.value=1400;pk.Q.value=1.2;pk.gain.value=7;
  const sh=c.createWaveShaper(),curve=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;curve[i]=Math.tanh(x*2.6)*.8;}sh.curve=curve;
  this.drop=c.createGain();this.pan=c.createStereoPanner?c.createStereoPanner():c.createGain();
  const echo=c.createDelay(1),fb=c.createGain();echo.delayTime.value=.19;fb.gain.value=.28;echo.connect(fb);fb.connect(echo);
  this.mix.connect(hp);hp.connect(lp);lp.connect(pk);pk.connect(sh);sh.connect(this.drop);this.drop.connect(this.pan);this.drop.connect(echo);echo.connect(this.pan);this.pan.connect(this.spk);this.spk.connect(this.master);
  BYTES21=fetchBuf(URL21).catch(()=>null);
  const dec=p=>p.then(b=>b?c.decodeAudioData(b):null).catch(()=>null);
  Promise.all([dec(BYTES26),dec(BYTES21)]).then(([b26,b21])=>this.start(b26,b21));}
 start(b26,b21){if(!b26&&!b21)return;const c=this.ctx,t=c.currentTime+.05;
  const src=(buf,out)=>{if(!buf)return null;const s=c.createBufferSource();s.buffer=buf;s.loop=true;s.loopStart=LOOP.start;s.loopEnd=Math.min(buf.duration,LOOP.start+LOOP.length);s.connect(out);s.start(t,LOOP.start);return s;};
  this.s26=src(b26,this.g26);this.s21=src(b21,this.g21);this.started=true;}
 // Called every frame. playing: Washington Square with sound and music on and the game not paused.
 update(playing,car,yaw){if(!this.ctx)return;const c=this.ctx,t=c.currentTime;this.on=playing;
  this.master.gain.setTargetAtTime(playing?.9:0,t,playing?1.5:.4);if(!playing)return;
  // Era crossfade (equal power). If one file is missing, the other plays in both eras.
  const d=Math.min(1,Math.max(0,DECAY.value));let a=Math.cos(d*Math.PI/2),b=Math.sin(d*Math.PI/2);
  if(!this.s21){a=1;b=0;}else if(!this.s26){a=0;b=1;}
  this.g26.gain.setTargetAtTime(a,t,.08);this.g21.gain.setTargetAtTime(b,t,.08);
  const dx=SPEAKER.x-car.x,dz=SPEAKER.z-car.z,dist=Math.hypot(dx,dz),near=Math.min(1,Math.max(0,1-(dist-6)/70));
  this.spk.gain.setTargetAtTime(Math.pow(near,1.6)*(.35+.75*d),t,.25);this.air.gain.setTargetAtTime(.8-.35*near*d,t,.4);
  // The loudspeaker cuts out now and then (more often in 2126).
  const cut=Math.sin(t*.7)+Math.sin(t*1.93)>1.75-.3*d?.15:1;this.drop.gain.setTargetAtTime(cut,t,.03);
  if(this.pan.pan){const rel=Math.atan2(dx,dz)-yaw;this.pan.pan.setTargetAtTime(Math.max(-.8,Math.min(.8,Math.sin(rel))),t,.1);}}}
