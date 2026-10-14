// The sound of the Washington Square fountain (Avi, 14 Oct 2026): falling water as filtered noise, a steady rush
// with a lighter splashing layer, loud near the basin and fading with distance, panned by where it is relative to
// the player's heading. Silent when the fountain is off (schedule in campus/atmosphere/fountain-water.js).
export class FountainAudio{
 init(ctx){if(this.ctx||!ctx)return;this.ctx=ctx;const n=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),d=n.getChannelData(0);let b=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;b=.97*b+.03*w;d[i]=w*.6+b*2.2;}
  const mk=(type,f,q)=>{const x=ctx.createBiquadFilter();x.type=type;x.frequency.value=f;x.Q.value=q;return x;};
  const src=ctx.createBufferSource();src.buffer=n;src.loop=true;const rush=mk('lowpass',900,.5),splash=mk('bandpass',3200,.8),gr=ctx.createGain(),gs=ctx.createGain();gr.gain.value=.8;gs.gain.value=.35;
  this.gain=ctx.createGain();this.gain.gain.value=0;this.pan=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();
  src.connect(rush);rush.connect(gr);src.connect(splash);splash.connect(gs);gr.connect(this.gain);gs.connect(this.gain);this.gain.connect(this.pan);this.pan.connect(ctx.destination);src.start();this.splash=gs;}
 // listener {x,z} in map metres (z north), yaw of the view; source {c:[x,n], level 0..1}.
 update(enabled,listener,yaw,source){if(!this.ctx)return;const t=this.ctx.currentTime;let v=0,p=0;
  if(enabled&&source&&source.level>0){const dx=source.c[0]-listener.x,dz=source.c[1]-listener.z,d=Math.hypot(dx,dz);v=source.level*.32*Math.min(1,Math.pow(14/Math.max(14,d),1.6));if(d>160)v=0;
   const a=Math.atan2(dx,dz)-yaw;p=Math.max(-.85,Math.min(.85,Math.sin(a)));this.splash.gain.setTargetAtTime(.25+.25*Math.min(1,14/Math.max(1,d)),t,.4);}
  this.gain.gain.setTargetAtTime(v,t,.35);if(this.pan.pan)this.pan.pan.setTargetAtTime(p,t,.2);}}
