// "Closed Campus Waltz": Commencement's original soundtrack for Washington Square, synthesized live with
// Web Audio. It is meant to feel like a big brassy New York standard heard a century late: a slow
// waltz on detuned, sagging horns over an oom-pah tuba, brushes and tape hiss. The melody, harmony and
// arrangement are original; nothing is taken from "New York, New York" or any other copyrighted song.
// Two paths: a muffled, echoing version heard everywhere in the location, and a clearer, tinny one
// from a broken loudspeaker on a pole just south of the Arch, louder the closer the car gets.
export const SPEAKER={x:9,z:-14};// map metres (x east, z north)
const BPM=54,BEAT=60/BPM,BAR=3*BEAT;
const N=n=>440*Math.pow(2,(n-69)/12);// MIDI note number to Hz
// Sixteen bars, one chord a bar (MIDI notes for the pad) and the tune as [note, beats].
const CHORDS=[[50,57,62,65],[46,53,58,62],[43,50,58,64],[45,52,61,67],[50,57,62,65],[48,53,57,60],[46,53,57,62],[45,52,57,61],
 [41,53,57,60],[40,52,55,60],[50,57,62,65],[46,53,58,62],[43,50,55,58],[39,51,55,58],[45,52,61,67],[50,57,62,65]];
const TUNE=[[[69,2],[65,1]],[[74,3]],[[72,1],[70,1],[67,1]],[[69,3]],[[65,1],[64,1],[62,1]],[[69,2],[72,1]],[[74,1],[76,1],[77,1]],[[76,3]],
 [[77,2],[72,1]],[[67,3]],[[69,1],[65,1],[62,1]],[[70,3]],[[67,2],[70,1]],[[75,3]],[[73,2],[64,1]],[[62,3]]];
export class Soundtrack{
 constructor(){this.ctx=null;this.on=false;this.bar=0;this.nextBar=0;this.timer=null;}
 // Built on first use, after a player gesture (browsers require it).
 init(ctx){if(this.ctx)return;this.ctx=ctx;const c=ctx;
  this.master=c.createGain();this.master.gain.value=0;this.master.connect(c.destination);
  // Shared reverb: a long decaying noise impulse.
  const len=Math.floor(c.sampleRate*4.5),ir=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
  this.verb=c.createConvolver();this.verb.buffer=ir;
  // Air path: muffled and far away.
  this.air=c.createGain();this.air.gain.value=.5;const airLp=c.createBiquadFilter();airLp.type='lowpass';airLp.frequency.value=620;const airWet=c.createGain();airWet.gain.value=.9;const airDry=c.createGain();airDry.gain.value=.25;
  this.bus=c.createGain();this.bus.connect(airLp);airLp.connect(airDry);airLp.connect(this.verb);this.verb.connect(airWet);airDry.connect(this.air);airWet.connect(this.air);this.air.connect(this.master);
  // Speaker path: band-limited horn, a little overdrive, dropouts, panned toward the pole.
  this.spk=c.createGain();this.spk.gain.value=0;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=380;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3600;const pk=c.createBiquadFilter();pk.type='peaking';pk.frequency.value=1400;pk.Q.value=1.2;pk.gain.value=7;
  const sh=c.createWaveShaper(),curve=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;curve[i]=Math.tanh(x*2.2)*.8;}sh.curve=curve;this.drop=c.createGain();this.pan=c.createStereoPanner?c.createStereoPanner():c.createGain();
  this.bus.connect(hp);hp.connect(lp);lp.connect(pk);pk.connect(sh);sh.connect(this.drop);this.drop.connect(this.pan);this.pan.connect(this.spk);const spkVerb=c.createGain();spkVerb.gain.value=.25;this.drop.connect(spkVerb);spkVerb.connect(this.verb);this.spk.connect(this.master);
  // Tape wow: one slow wobble applied to every voice's detune.
  this.wow=c.createOscillator();this.wow.frequency.value=.37;this.wowAmt=c.createGain();this.wowAmt.gain.value=16;this.wow.connect(this.wowAmt);this.wow.start();
  // Hiss and crackle.
  const nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=(Math.random()*2-1)*.35+(Math.random()<.0007?(Math.random()*2-1)*3:0);
  const hiss=c.createBufferSource();hiss.buffer=nb;hiss.loop=true;const hf=c.createBiquadFilter();hf.type='highpass';hf.frequency.value=2500;const hg=c.createGain();hg.gain.value=.05;hiss.connect(hf);hf.connect(hg);hg.connect(this.bus);hiss.start();
  this.nextBar=c.currentTime+.3;if(!c.startRendering)this.timer=setInterval(()=>this.schedule(),120);}
 voice(freq,t,dur,{type='sawtooth',gain=.1,lp=1800,attack=.12,sag=30,vib=0,detune=[-9,0,11]}={}){const c=this.ctx,g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.Q.value=.7;
  f.frequency.setValueAtTime(lp*.35,t);f.frequency.linearRampToValueAtTime(lp,t+attack*1.6);f.frequency.setTargetAtTime(lp*.6,t+attack*2,dur*.5);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+attack);g.gain.setTargetAtTime(gain*.7,t+attack,dur*.4);g.gain.setTargetAtTime(0,t+dur,.18);
  f.connect(g);g.connect(this.bus);const oscs=[];
  for(const d of detune){const o=c.createOscillator();o.type=type;o.frequency.value=freq;o.detune.setValueAtTime(d-sag+(Math.random()-.5)*14,t);o.detune.linearRampToValueAtTime(d+(Math.random()-.5)*8,t+.35);this.wowAmt.connect(o.detune);
   if(vib){const v=c.createOscillator(),vg=c.createGain();v.frequency.value=4.6+Math.random()*.6;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(vib,t+Math.min(dur,1.2));v.connect(vg);vg.connect(o.detune);v.start(t);v.stop(t+dur+.8);}
   o.connect(f);o.start(t);o.stop(t+dur+.8);oscs.push(o);}
  return oscs;}
 brush(t){const c=this.ctx,b=c.createBuffer(1,c.sampleRate*.25|0,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=3200;const g=c.createGain();g.gain.value=.05;s.connect(f);f.connect(g);g.connect(this.bus);s.start(t);}
 // Schedule bars a little ahead of the audio clock.
 schedule(horizon=1.2){if(!this.ctx||!this.on)return;const c=this.ctx;while(this.nextBar<c.currentTime+horizon){const t=this.nextBar,i=this.bar%16,ch=CHORDS[i];
  // Pad: muted horns holding the chord; the whole band drifts a little flat as the tune goes on.
  const flat=-((this.bar%32)/32)*35;for(const n of ch.slice(1))this.voice(N(n),t,BAR*.96,{type:'triangle',gain:.022,lp:900,attack:.5,sag:10,detune:[-14+flat,7+flat]});
  // Tuba oom-pah-pah: root on one, fifth on two and three (soft).
  this.voice(N(ch[0]-12),t,BEAT*.8,{type:'triangle',gain:.11,lp:420,attack:.04,sag:20,detune:[0,5]});for(const k of [1,2])this.voice(N(ch[0]-5),t+k*BEAT,BEAT*.5,{type:'triangle',gain:.04,lp:380,attack:.05,sag:10,detune:[0]});
  for(const k of [1,2])this.brush(t+k*BEAT+(Math.random()-.5)*.03);
  // The tune on three sagging, detuned horns (every other chorus an octave down, like someone else picked it up).
  let b=0;const down=Math.floor(this.bar/16)%2?-12:0;for(const [n,len] of TUNE[i]){const lag=(Math.random()-.3)*.06;this.voice(N(n+down),t+b*BEAT+lag,len*BEAT*.95,{gain:.06,lp:2200,attack:.14,sag:38,vib:14,detune:[-11+flat,0+flat,13+flat]});b+=len;}
  this.bar++;this.nextBar+=BAR;if(this.bar%16===0)this.nextBar+=BAR;}}// a bar's rest between choruses
 // Called every frame. playing: Washington Square with sound and music on and the game not paused.
 update(playing,car,yaw){if(!this.ctx)return;const c=this.ctx,t=c.currentTime;if(playing&&!this.on){this.on=true;this.nextBar=Math.max(this.nextBar,t+.2);}
  this.master.gain.setTargetAtTime(playing?.9:0,t,playing?1.5:.4);if(!playing){this.on=false;return;}
  const dx=SPEAKER.x-car.x,dz=SPEAKER.z-car.z,d=Math.hypot(dx,dz),near=Math.min(1,Math.max(0,1-(d-6)/70));
  this.spk.gain.setTargetAtTime(Math.pow(near,1.6)*1.1,t,.25);this.air.gain.setTargetAtTime(.45-.25*near,t,.4);
  // The loudspeaker cuts out now and then.
  const cut=Math.sin(t*.7)+Math.sin(t*1.93)>1.55?.15:1;this.drop.gain.setTargetAtTime(cut,t,.03);
  if(this.pan.pan){const rel=Math.atan2(dx,dz)-yaw;this.pan.pan.setTargetAtTime(Math.max(-.8,Math.min(.8,Math.sin(rel))),t,.1);}}}
