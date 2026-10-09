import * as T from '../../vendor/three.module.js';
import {Face,stack,out,up,ovolo,cymaRecta} from './kit.js?v=24';
// Facade kit for landmarks whose volume comes from the NYC 3D Building Model: every roof piece is
// turned into walls, and each wall gets a facade (punched windows, curtain wall or storefront)
// chosen by a callback. Works in world coordinates (x east, y up, z = -north).
export const v3=(p,y=0)=>[p[0],y,-p[1]];
const ringArea=r=>{let A=0;for(let i=0;i<r.length;i++){const j=(i+1)%r.length;A+=r[i][0]*r[j][1]-r[j][0]*r[i][1];}return A/2;};
const inside=(p,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
// Roof pieces of a 3D-model entry as {ring (CCW, map), z}. Pieces under 0.4 m² are dropped.
export function pieces(entry){const out=[];for(const f of entry.roofs){const k=f.length/3,ring=[];let z=0;for(let i=0;i<k;i++){ring.push([f[3*i],f[3*i+1]]);z=Math.max(z,f[3*i+2]);}
 const A=ringArea(ring);if(Math.abs(A)<.4)continue;out.push({ring:A>0?ring:ring.reverse(),z});}return out;}
// Walls of every piece with the height from which each is exposed (hidden below a taller or equal
// neighbouring piece). Each wall: {a, b, len, n (map outward), y0, y1, piece, face}.
export function walls(ps,{minLen=.3}={}){const W=[];for(const [pi,p] of ps.entries()){const r=p.ring;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b[0]-a[0],dn=b[1]-a[1],len=Math.hypot(dx,dn);if(len<minLen)continue;
  const n=[dn/len,-dx/len],m=[(a[0]+b[0])/2+n[0]*.5,(a[1]+b[1])/2+n[1]*.5];let y0=0;for(const [qi,q] of ps.entries())if(qi!==pi&&inside(m,q.ring))y0=Math.max(y0,q.z);
  if(y0>=p.z-.05)continue;W.push({a,b,len,n,y0,y1:p.z,piece:p,face:new Face(v3(a),[dx,0,-dn],[0,1,0])});}}return W;}
export function roofs(P,ps,name='roof'){for(const p of ps)P.poly(name,new Face([0,p.z,0],[1,0,0],[0,0,-1]),p.ring);}
// Plain wall strip.
export function plain(P,w,y0,y1,name){P.rect(name,w.face,0,w.len,y0,y1,0);}
// Punched-window facade: bays of `pitch` metres, one or two lights per bay, floors of `floor` m
// from `first` (sill of the lowest row measured from y0) to a parapet. Windows are real recesses
// with glass, sills and optional projecting surrounds.
export function punched(P,w,y0,y1,s){const {wall='stone',glass='glass',trim=wall,pitch=3.2,floor=3.6,first=1.0,win=[1.5,2.2],pair=0,parapet=1.0,reveal=.25,sill=.08,surround=0,mullion=.12,frames='frame',margin=.6,rowsFrom=0}=s;
 const L=w.len;if(L<pitch*.8){P.rect(wall,w.face,0,L,y0,y1,0);return;}const nb=Math.max(1,Math.floor((L-2*margin)/pitch)),p0=(L-nb*pitch)/2,holes=[],wins=[];
 const ww=pair?win[0]*2+mullion:win[0];for(let r=0;;r++){const ys=y0+first+(rowsFrom+r)*floor;if(ys+win[1]>y1-parapet)break;if(ys<y0+.3)continue;for(let i=0;i<nb;i++){const c=p0+(i+.5)*pitch;if(ww>pitch-.3)continue;wins.push([c-ww/2,ys,c+ww/2,ys+win[1]]);}}
 for(const [u0,v0,u1,v1] of wins)holes.push([[u0,v0],[u1,v0],[u1,v1],[u0,v1]]);P.poly(wall,w.face,[[0,y0],[L,y0],[L,y1],[0,y1]],holes,0);
 const back=new Face(w.face.at(0,0,0),w.face.u,w.face.v);
 for(const [u0,v0,u1,v1] of wins){P.recess(wall,back,u0,u1,v0,v1,reveal,glass);if(pair)P.block(frames,w.face,(u0+u1)/2-mullion/2,(u0+u1)/2+mullion/2,v0,v1,-reveal,-reveal+.06);
  P.block(frames,w.face,u0,u1,v0+(v1-v0)*.62,v0+(v1-v0)*.62+.05,-reveal,-reveal+.04);if(s.louvre)P.block(s.louvre,w.face,u0,u1,v0,v0+(v1-v0)*.24,-reveal,-reveal+.03,{skip:['left','right','bottom']});if(sill)P.block(trim,w.face,u0-.08,u1+.08,v0-sill,v0,0,.1);
  if(surround){P.block(trim,w.face,u0-surround,u0,v0,v1,0,.06);P.block(trim,w.face,u1,u1+surround,v0,v1,0,.06);P.block(trim,w.face,u0-surround,u1+surround,v1,v1+surround,0,.06);}}}
// Curtain wall: glass with vertical mullions every `mw` m and spandrel bands every `floor` m.
export function curtain(P,w,y0,y1,{glass='glass',frames='frame',mw=1.5,floor=3.6,spandrel=0,depth=.12,spandrelName=frames}={}){const L=w.len;P.rect(glass,w.face,0,L,y0,y1,0);
 const n=Math.max(1,Math.round(L/mw));for(let i=0;i<=n;i++){const u=L*i/n;P.block(frames,w.face,Math.max(0,u-.04),Math.min(L,u+.04),y0,y1,0,depth,{skip:['top','bottom']});}
 for(let y=y0;y<=y1+.01;y+=floor){P.block(spandrel?spandrelName:frames,w.face,0,L,Math.max(y0,y-(spandrel||.05)),Math.min(y1,y+.05),0,depth,{skip:['left','right']});}}
// Storefront: glazing between piers set back `set` m, a fascia above.
export function storefront(P,w,y0,y1,{wall='stone',glass='glassClear',frames='frame',pier=.6,pitch=4,set=.3,head=y1}={}){const L=w.len,nb=Math.max(1,Math.round(L/pitch)),p=L/nb;
 for(let i=0;i<=nb;i++){const u=i*p;P.block(wall,w.face,Math.max(0,u-pier/2),Math.min(L,u+pier/2),y0,head,-set,0,{skip:['top','bottom']});}
 P.rect(glass,w.face,0,L,y0,head,-set);for(let i=0;i<nb;i++){const c=(i+.5)*p;P.block(frames,w.face,c-.03,c+.03,y0,head,-set,-set+.08);}P.block(frames,w.face,0,L,y0+2.6,y0+2.66,-set,-set+.08);
 P.rect(wall,new Face(w.face.at(0,head,0),w.face.u,w.face.n),0,L,-set,0);if(head<y1)P.rect(wall,w.face,0,L,head,y1,0);}
// Compass direction a wall faces: 'n','e','s','w' (map).
export function facing(w){const [x,n]=w.n;return Math.abs(n)>=Math.abs(x)?(n>0?'n':'s'):(x>0?'e':'w');}
// Simple cornice/coping along a wall top.
export function coping(P,w,y,{name='stone',proj=.25,h=.35}={}){P.block(name,w.face,-.0,w.len,y-h,y,0,proj,{skip:[]});}
export function signPanel(lines,{w=512,h=128,bg='#2a2522',ink='#d9c79a',font='"Helvetica Neue", Arial, sans-serif',weight=600}={}){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h);}else g.clearRect(0,0,w,h);g.fillStyle=ink;g.textAlign='center';
 const lh=h/(lines.length+.4);lines.forEach((l,i)=>{let s=lh*.7;g.font=`${weight} ${s}px ${font}`;while(g.measureText(l).width>w*.92&&s>6){s*=.95;g.font=`${weight} ${s}px ${font}`;}g.fillText(l,w/2,lh*(i+.85));});const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
// ---- Masonry kit (brick and limestone buildings) ----
// Round-arched opening outline in face coordinates: sill v0, springing line `spring`, width w.
export const archHole=(cu,w,v0,spring,seg=10)=>{const r=w/2,p=[[cu-r,v0],[cu+r,v0]];for(let k=0;k<=seg;k++){const t=Math.PI*k/seg;p.push([cu+r*Math.cos(t),spring+r*Math.sin(t)]);}return p;};
// Sash windows punched in a wall: returns the window rectangles. Each window gets a reveal, a sash
// panel (texture with 0..1 UVs, e.g. six-over-six), a stone sill and optionally a stone lintel.
// rows: list of window-bottom heights; bays: list of bay centres (u) or {pitch, margin} to space them;
// skip(i,r) leaves a bay solid (blind) and may return 'panel' for a recessed blind panel.
export function sashWindows(P,w,y0,y1,{wall='brick',trim='stone',sash='sash',rows,bays,win=[1.25,2.3],reveal=.18,sill=.1,lintel=0,skip=null,panelInset=.1}={}){
 const L=w.len,f=w.face;let cs=Array.isArray(bays)?bays:null;if(!cs){const {pitch=3.2,margin=.6}=bays||{};const nb=Math.max(0,Math.floor((L-2*margin)/pitch));const p0=(L-nb*pitch)/2;cs=[];for(let i=0;i<nb;i++)cs.push(p0+(i+.5)*pitch);}
 const holes=[],wins=[],panels=[];rows.forEach((ys,r)=>{const wh=Array.isArray(win[0])?win[r]:win;cs.forEach((c,i)=>{if(ys<y0-.01||ys+wh[1]>y1)return;const k=skip?skip(i,r):false;const q=[c-wh[0]/2,ys,c+wh[0]/2,ys+wh[1]];if(k==='panel'){panels.push(q);holes.push([[q[0],q[1]],[q[2],q[1]],[q[2],q[3]],[q[0],q[3]]]);}else if(!k){wins.push(q);holes.push([[q[0],q[1]],[q[2],q[1]],[q[2],q[3]],[q[0],q[3]]]);}});});
 P.poly(wall,f,[[0,y0],[L,y0],[L,y1],[0,y1]],holes,0);
 for(const [u0,v0,u1,v1] of wins){P.recess(wall,f,u0,u1,v0,v1,reveal,'_none');P.panel(sash,f,u0,u1,v0,v1,-reveal);if(sill)P.block(trim,f,u0-.1,u1+.1,v0-sill,v0,0,.12);if(lintel)P.block(trim,f,u0-.12,u1+.12,v1,v1+lintel,0,.04);}
 for(const [u0,v0,u1,v1] of panels){P.recess(wall,f,u0,u1,v0,v1,panelInset,wall);}
 return wins;}
// Six-over-six (or n-over-n) sash texture: white frames and muntins over dark glass with a little sky.
export function sashTexture({cols=3,rows=2,frame='#ecebe6',glass='#26313a',px=128}={}){const c=document.createElement('canvas');c.width=px;c.height=px*2;const g=c.getContext('2d');
 g.fillStyle=frame;g.fillRect(0,0,c.width,c.height);const W=c.width,H=c.height,b=W*.08;
 for(const [y0,y1] of [[b,H/2-b*.4],[H/2+b*.4,H-b]]){const gr=g.createLinearGradient(0,y0,W,y1);gr.addColorStop(0,'#53636e');gr.addColorStop(.5,glass);gr.addColorStop(1,'#1b2329');g.fillStyle=gr;g.fillRect(b,y0,W-2*b,y1-y0);
  g.fillStyle=frame;for(let i=1;i<cols;i++)g.fillRect(b+(W-2*b)*i/cols-2,y0,4,y1-y0);for(let j=1;j<rows;j++)g.fillRect(b,y0+(y1-y0)*j/rows-2,W-2*b,4);}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
// Modillion cornice along a wall top: crown, corona, bed moulding and modillion blocks.
export function modillionCornice(P,w,y,{name='stone',proj=.75,h=.75,spacing=.6,mod=[.14,.2,.55]}={}){const f=w.face,L=w.len;
 P.block(name,f,-proj*.0,L,y-h*.35,y,0,proj,{skip:[]});P.block(name,f,0,L,y-h*.55,y-h*.35,0,proj*.75);P.block(name,f,0,L,y-h,y-h*.55,0,.18);
 for(let u=spacing/2;u<L;u+=spacing)P.block(name,f,u-mod[0]/2,u+mod[0]/2,y-h*.55-mod[1],y-h*.55,0,mod[2],{skip:['top']});}
// Triangular pediment on top of a wall from u0 to u1 at height y with rise `rise`: brick tympanum
// (with an optional oculus), horizontal and raking cornices.
export function pediment(P,w,u0,u1,y,rise,{wall='brick',name='stone',glass='glass',oculus=0,proj=.6,t=.35}={}){const f=w.face,c=(u0+u1)/2;
 const tri=[[u0,y],[u1,y],[c,y+rise]];const holes=oculus?[Array.from({length:16},(_,i)=>{const a=-i/16*Math.PI*2;return [c+Math.cos(a)*oculus,y+rise*.5+Math.sin(a)*oculus];})]:[];
 P.poly(wall,f,tri,holes,0);if(oculus){reveal2(P,name,f,holes[0],.25,glass);}
 // Back of the tympanum (seen from above/behind) and the two roof slopes.
 const back=new Face(f.at(u1,0,-.3),f.u.map(x=>-x),f.v);P.poly(wall,back,[[0,y],[u1-u0,y],[(u1-u0)/2,y+rise]],[],0);
 for(const [a,b] of [[[u0,y],[c,y+rise]],[[c,y+rise],[u1,y]]]){const p=(u,v,d)=>f.at(u,v,d),du=b[0]-a[0],dv=b[1]-a[1],l=Math.hypot(du,dv),nu=-dv/l*t*(du>0?1:-1),nv=Math.abs(du)/l*t;
  const A0=p(a[0],a[1],-.3),B0=p(b[0],b[1],-.3),A1=p(a[0],a[1],proj),B1=p(b[0],b[1],proj),A2=p(a[0]+nu,a[1]+nv,proj),B2=p(b[0]+nu,b[1]+nv,proj),A3=p(a[0]+nu,a[1]+nv,-.3),B3=p(b[0]+nu,b[1]+nv,-.3);
  P.quad(name,A1,B1,B2,A2,f.n);P.quad(name,A3,B3,B2,A2,[0,1,0]);P.quad(name,A0,B0,B1,A1,[0,-1,0]);}
 P.block(name,f,u0-proj*.3,u1+proj*.3,y-.35,y,0,proj);}
function reveal2(P,name,f,hole,depth,back){let cu=0,cv=0;for(const p of hole){cu+=p[0];cv+=p[1];}cu/=hole.length;cv/=hole.length;
 for(let k=0;k<hole.length;k++){const p=hole[k],q=hole[(k+1)%hole.length],mu=(p[0]+q[0])/2-cu,mv=(p[1]+q[1])/2-cv,h=[-(f.u[0]*mu+f.v[0]*mv),-(f.u[1]*mu+f.v[1]*mv),-(f.u[2]*mu+f.v[2]*mv)];
  P.quad(name,f.at(p[0],p[1],0),f.at(q[0],q[1],0),f.at(q[0],q[1],-depth),f.at(p[0],p[1],-depth),h);}
 if(back)P.poly(back,new Face(f.at(0,0,-depth),f.u,f.v),hole);}
// Merge colinear consecutive walls of the same piece and exposure (the 3D model splits many faces).
export function mergeWalls(W,{gap=.3,dot=.995,off=.45}={}){const out=[];for(const w of W){const p=out[out.length-1];
  if(p&&p.piece===w.piece&&Math.abs(p.y0-w.y0)<.05&&Math.hypot(p.b[0]-w.a[0],p.b[1]-w.a[1])<gap&&p.n[0]*w.n[0]+p.n[1]*w.n[1]>dot&&Math.abs((w.b[0]-p.a[0])*p.n[0]+(w.b[1]-p.a[1])*p.n[1])<off){
   p.b=w.b;p.len=Math.hypot(p.b[0]-p.a[0],p.b[1]-p.a[1]);continue;}out.push({...w});}
 for(const w of out){const dx=w.b[0]-w.a[0],dn=w.b[1]-w.a[1];w.face=new Face(v3(w.a),[dx,0,-dn],[0,1,0]);}return out;}
