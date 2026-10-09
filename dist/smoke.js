// The Commencement title: a wisp of smoke drifts in from the lower left and gathers into the word, in a
// pale bone serif on near-black. Once formed the letters stay legible but keep curling at the edges. On
// begin, the letters loosen back into smoke that drifts outward and thins while the game shows through.
// Plain 2D canvas, a few thousand soft sprites, one pre-rendered puff texture: light enough not to slow
// the loading it covers. No flashing: every change in brightness is a slow ease.
const BONE='226,220,207';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>t*t*(3-2*t);
function puff(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
 r.addColorStop(0,`rgba(${BONE},.9)`);r.addColorStop(.3,`rgba(${BONE},.42)`);r.addColorStop(.65,`rgba(${BONE},.12)`);r.addColorStop(1,`rgba(${BONE},0)`);g.fillStyle=r;g.fillRect(0,0,64,64);return c;}
// A smooth, cheap flow field (sums of sines) that stands in for curl noise.
const flow=(x,y,t)=>[Math.sin(y*.011+t*.55)+.6*Math.sin((x+y)*.006-t*.37),Math.cos(x*.013-t*.45)+.6*Math.cos((x-y)*.007+t*.31)];
export class SmokeTitle{
 constructor(canvas,{text='Commencement',font='"Commencement Serif","IM Fell English",Georgia,serif'}={}){this.c=canvas;this.g=canvas.getContext('2d');this.text=text;this.font=font;this.sprite=puff();
  this.t=0;this.state='idle';this.progress=0;this.dissolveAt=0;this.parts=[];this.form=0;this.resize();addEventListener('resize',()=>this.resize());}
 resize(){const dpr=Math.min(1.25,devicePixelRatio||1),w=innerWidth,h=innerHeight;this.c.width=Math.round(w*dpr);this.c.height=Math.round(h*dpr);this.c.style.width=w+'px';this.c.style.height=h+'px';
  this.g.setTransform(dpr,0,0,dpr,0,0);this.w=w;this.h=h;this.size=Math.min(w*.105,h*.2);this.layout();}
 // Sample points inside the letters; each becomes the home of one particle.
 layout(){const w=this.w,h=this.h,s=this.size,o=document.createElement('canvas');o.width=Math.ceil(w);o.height=Math.ceil(s*1.6);const g=o.getContext('2d');
  g.font=`${s}px ${this.font}`;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(this.text,w/2,o.height/2);
  const d=g.getImageData(0,0,o.width,o.height).data,step=Math.max(2,Math.round(s/34)),pts=[],y0=h*.46-o.height/2;
  for(let y=0;y<o.height;y+=step)for(let x=0;x<o.width;x+=step)if(d[(y*o.width+x)*4+3]>140)pts.push([x+(Math.random()-.5)*step,y0+y+(Math.random()-.5)*step]);
  const N=Math.min(pts.length,2600),keep=pts.sort(()=>Math.random()-.5).slice(0,N),minX=Math.min(...keep.map(p=>p[0])),maxX=Math.max(...keep.map(p=>p[0]));
  const old=this.parts;this.parts=keep.map(([tx,ty],i)=>{const p=old[i]||{};const u=(tx-minX)/Math.max(1,maxX-minX);
   return Object.assign(p,{tx,ty,u,delay:p.delay??(.25+u*1.9+Math.random()*.6),seed:p.seed??Math.random()*1000,size:(Math.random()<.18?(1.6+Math.random()*1.4):(.45+Math.random()*.7))*s/9,
    x:p.x??-.12*w,y:p.y??h*(.78+Math.random()*.08),vx:p.vx??0,vy:p.vy??0,loose:p.loose??0,a:p.a??0});});
  this.textY=h*.46;this.minX=minX;this.maxX=maxX;}
 start(){this.state='forming';this.t=0;}
 setProgress(p){this.progress=clamp(p,0,1);}
 dissolve(){if(this.state==='dissolving')return;this.state='dissolving';this.dissolveAt=this.t;for(const p of this.parts){const dx=p.tx-this.w/2,dy=p.ty-this.textY,l=Math.hypot(dx,dy)||1;p.vx+=dx/l*(18+Math.random()*30);p.vy+=dy/l*(10+Math.random()*20)-12;}}
 get formed(){return this.form;}
 frame(dt){dt=Math.min(.05,dt);this.t+=dt;const t=this.t,w=this.w,h=this.h,g=this.g,P=this.parts,dis=this.state==='dissolving',dk=dis?ease(clamp((t-this.dissolveAt)/3,0,1)):0;
  g.clearRect(0,0,w,h);if(this.state==='idle')return;
  // Formation: how many letters have gathered (drives the solid-ish text layer under the smoke).
  this.form=dis?1-dk:ease(clamp((t-1.4)/2.4,0,1));
  const density=.62+.38*this.progress;
  g.globalCompositeOperation='source-over';
  for(const p of P){let a=0;
   if(!dis&&t<p.delay){// Still part of the drifting wisp: a slow S-curve in from the lower left.
    const k=clamp((t-p.delay+2.4)/2.4,0,1),s=k*.9;const bx=-.12*w+s*(p.tx+.12*w),by=h*.8-s*(h*.8-p.ty)+Math.sin(s*3.4+p.seed)*h*.05*(1-s);
    p.x+=(bx-p.x)*Math.min(1,dt*3);p.y+=(by-p.y)*Math.min(1,dt*3);a=k*.5;}
   else{const [fx,fy]=flow(p.x,p.y,t+p.seed*.001);
    if(dis){p.vx+=fx*16*dt;p.vy+=(fy*12-14)*dt;p.vx*=1-.6*dt;p.vy*=1-.6*dt;a=1-dk;p.size*=1+dt*.35;}
    else{// Spring home, with a little turbulence that never quite settles; a few particles break loose at the edges.
     if(p.loose<=0&&Math.random()<dt*.08)p.loose=1.4+Math.random()*2;
     const loose=p.loose>0;if(loose)p.loose-=dt;const k=loose?1.2:7,damp=loose?.8:3.6;
     p.vx+=((p.tx-p.x)*k+fx*(loose?26:9))*dt;p.vy+=((p.ty-p.y)*k+fy*(loose?22:7)-(loose?10:0))*dt;p.vx*=1-damp*dt;p.vy*=1-damp*dt;
     a=clamp((t-p.delay)/1.4,0,1);}
    p.x+=p.vx*dt;p.y+=p.vy*dt;}
   p.a+=(a-p.a)*Math.min(1,dt*4);if(p.a<.01)continue;
   g.globalAlpha=p.a*(p.loose>0?.05:.075)*density;const z=p.size*(1.4+.5*Math.sin(t*.7+p.seed))*(p.loose>0?1.5:1);g.drawImage(this.sprite,p.x-z,p.y-z,z*2,z*2);}
  // A soft lettering layer so the word reads clearly once it has formed.
  if(this.form>.01){g.save();const rev=dis?1:clamp((t-.9)/3,0,1),x0=this.minX-this.size*.3,x1=this.maxX+this.size*.3;g.beginPath();g.rect(0,0,x0+(x1-x0)*rev,h);g.clip();
   g.font=`${this.size}px ${this.font}`;g.textAlign='center';g.textBaseline='middle';g.shadowColor=`rgba(${BONE},.35)`;g.shadowBlur=this.size*.06;
   g.fillStyle=`rgba(${BONE},${(.5*this.form*(dis?1-dk:1)).toFixed(3)})`;g.fillText(this.text,w/2,this.textY);g.restore();}
  g.globalAlpha=1;}
}
