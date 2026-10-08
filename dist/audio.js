// The van's sound, synthesized (original, no samples): a quiet electric motor (a faint whine that rises with
// speed, a soft inverter hum underneath), tyre roll on the paving, and the small ticks and creaks of an old
// body: a tick from the cooling motor housing now and then, a creak of the suspension over bumps and when
// braking or turning hard. No combustion engine and no idling. Starts only after a player gesture.
export class DriveAudio{
 constructor(){this.ctx=null;this.enabled=true;this.nextTick=0;this.nextCreak=0;this.lastSpeed=0;}
 unlock(){if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=this.ctx=new C();this.out=ctx.createGain();this.out.gain.value=0;this.out.connect(ctx.destination);
   // Motor whine: two detuned sines through a band-pass, very quiet.
   this.whine=ctx.createOscillator();this.whine.type='sine';this.whine2=ctx.createOscillator();this.whine2.type='sine';this.whineGain=ctx.createGain();this.whineGain.gain.value=0;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=900;bp.Q.value=4;this.whineFilter=bp;
   this.whine.connect(bp);this.whine2.connect(bp);bp.connect(this.whineGain);this.whineGain.connect(this.out);this.whine.start();this.whine2.start();
   // Inverter hum: a low triangle, barely there.
   this.hum=ctx.createOscillator();this.hum.type='triangle';this.hum.frequency.value=100;this.humGain=ctx.createGain();this.humGain.gain.value=0;this.hum.connect(this.humGain);this.humGain.connect(this.out);this.hum.start();
   // Tyre roll and wind: filtered noise.
   const n=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.noiseBuf=n;
   this.roll=ctx.createBufferSource();this.roll.buffer=n;this.roll.loop=true;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;this.rollGain=ctx.createGain();this.rollGain.gain.value=0;this.roll.connect(lp);lp.connect(this.rollGain);this.rollGain.connect(this.out);this.roll.start();}
  this.ctx.resume().catch(()=>{});}
 // A short filtered noise or tone burst: ticks (bright, tiny) and creaks (a slow pitch glide).
 burst(kind,level){const ctx=this.ctx,t=ctx.currentTime,g=ctx.createGain();g.connect(this.out);
  if(kind==='tick'){const s=ctx.createBufferSource();s.buffer=this.noiseBuf;const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=3200+Math.random()*1800;f.Q.value=12;s.connect(f);f.connect(g);g.gain.setValueAtTime(level,t);g.gain.exponentialRampToValueAtTime(.0001,t+.03);s.start(t,Math.random());s.stop(t+.05);}
  else{const o=ctx.createOscillator();o.type='sawtooth';const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=18;const f0=180+Math.random()*120;f.frequency.setValueAtTime(f0,t);f.frequency.linearRampToValueAtTime(f0*1.35,t+.35);o.frequency.setValueAtTime(70+Math.random()*30,t);o.frequency.linearRampToValueAtTime(95+Math.random()*30,t+.35);
   o.connect(f);f.connect(g);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(level,t+.08);g.gain.linearRampToValueAtTime(0,t+.42);o.start(t);o.stop(t+.45);}}
 update(state,controls,paused,enabled=true){if(!this.ctx)return;const t=this.ctx.currentTime,active=!paused&&enabled,v=Math.abs(state.speed||0),load=controls.throttle?1:0;
  this.out.gain.setTargetAtTime(active?1:0,t,.08);
  const f=240+v*95;this.whine.frequency.setTargetAtTime(f,t,.06);this.whine2.frequency.setTargetAtTime(f*1.503,t,.06);this.whineFilter.frequency.setTargetAtTime(500+v*160,t,.1);
  this.whineGain.gain.setTargetAtTime(v>.05||load?.004+.0016*v+.004*load:0,t,.12);this.humGain.gain.setTargetAtTime(.0025+.002*load,t,.2);this.rollGain.gain.setTargetAtTime(Math.min(.03,.0045*v),t,.15);
  if(!active){this.lastSpeed=v;return;}
  // Ticks: every few seconds at rest, more often after a run. Creaks: over bumps, hard braking, tight turns.
  if(t>this.nextTick){this.burst('tick',.006+Math.random()*.01);this.nextTick=t+1.5+Math.random()*(v>.5?3:5);}
  const decel=this.lastSpeed-v,bump=Math.abs(state.orientation?.pitch||0)+Math.abs(state.orientation?.roll||0);
  if(t>this.nextCreak&&((decel>.05&&v>1.5)||(bump>.06&&Math.random()<.05)||(Math.abs(state.steeringAngle||0)>.45&&v>2&&Math.random()<.03))){this.burst('creak',.01+Math.random()*.01);this.nextCreak=t+1.2+Math.random()*2;}
  this.lastSpeed=v;}}
