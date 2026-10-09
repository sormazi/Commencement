import * as T from '../../vendor/three.module.js';
import {Face,reveal} from './kit.js?v=24';
// Gothic Revival kit for the neighbourhood churches (Grace Church, Church of the Ascension, First
// Presbyterian, Jefferson Market). Everything is authored in a local plan frame (u along the church's
// axis, v to its left looking along u, metres) and converted to world coordinates by a Frame.
export class Frame{
 // origin: map point; bearing: compass bearing of +u in degrees.
 constructor(origin,bearing){const r=bearing*Math.PI/180;this.o=origin;this.U=[Math.sin(r),Math.cos(r)];this.V=[-this.U[1],this.U[0]];}
 map(u,v){return [this.o[0]+u*this.U[0]+v*this.V[0],this.o[1]+u*this.U[1]+v*this.V[1]];}
 w(u,v,y=0){const m=this.map(u,v);return [m[0],y,-m[1]];}
 dir(du,dv){const x=du*this.U[0]+dv*this.V[0],n=du*this.U[1]+dv*this.V[1];return [x,0,-n];}
 // Wall face from plan point a to b (each [u,v]); its outward normal is on the right of a->b.
 face(a,b,y=0){return new Face(this.w(a[0],a[1],y),this.dir(b[0]-a[0],b[1]-a[1]),[0,1,0]);}
 matrix(u,v,y,rotY=0){const m=new T.Matrix4(),x=this.dir(1,0),z=this.dir(0,1);// local x along u, z along -v... build basis: X=u, Y=up, Z = X × Y
  const X=new T.Vector3(...x).normalize(),Y=new T.Vector3(0,1,0),Z=new T.Vector3().crossVectors(X,Y);m.makeBasis(X,Y,Z);m.setPosition(...this.w(u,v,y));if(rotY)m.multiply(new T.Matrix4().makeRotationY(rotY));return m;}
}
const len=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
// Pointed (equilateral-ish) arch outline in face coordinates: width w, springing at v=spring, sides from
// v0. k scales the radius (1 = equilateral, <1 drop arch, >1 lancet).
export function pointed(cu,w,v0,spring,{k=1,seg=8}={}){const r=w*k,h=Math.sqrt(Math.max(0,r*r-(r-w/2)**2)),p=[[cu-w/2,v0],[cu+w/2,v0],[cu+w/2,spring]];
 for(let i=1;i<=seg;i++){const t=i/seg,a=Math.acos((r-w/2)/r)*t;p.push([cu+w/2-r+r*Math.cos(a),spring+r*Math.sin(a)]);}
 for(let i=seg-1;i>=1;i--){const t=i/seg,a=Math.acos((r-w/2)/r)*t;p.push([cu-w/2+r-r*Math.cos(a),spring+r*Math.sin(a)]);}
 p.push([cu-w/2,spring]);return p;}
export const apexOf=(w,{k=1}={})=>{const r=w*k;return Math.sqrt(Math.max(0,r*r-(r-w/2)**2));};
// A wall panel between v0 and v1 (or up to a gable apex) with openings; each opening {hole, depth,
// glass, frame}. The wall polygon is cut, the reveals drawn and the opening backed with glass.
export function wall(P,f,L,v0,v1,openings=[],{mat='stone',gable=0,hood='trim'}={}){const outer=gable?[[0,v0],[L,v0],[L,v1],[L/2,v1+gable],[0,v1]]:[[0,v0],[L,v0],[L,v1],[0,v1]];
 P.poly(mat,f,outer,openings.map(o=>o.hole));
 for(const o of openings){reveal(P,mat,f,o.hole,o.depth??.35,o.glass??'glass');
  if(hood&&o.hood!==false){// Hood mould: a thin raised band following the arch.
   const h=o.hole,top=h.slice(2);for(let i=0;i<top.length-1;i++){const a=top[i],b=top[i+1];const d=[b[0]-a[0],b[1]-a[1]],l=Math.hypot(...d),n=[-d[1]/l*.12,d[0]/l*.12];
    P.quad(hood,f.at(a[0],a[1],.0),f.at(b[0],b[1],.0),f.at(b[0]+n[0],b[1]+n[1],.1),f.at(a[0]+n[0],a[1]+n[1],.1),f.n);}}
  if(o.mullion){const xs=o.hole.map(p=>p[0]),c=(Math.min(...xs)+Math.max(...xs))/2,vs=o.hole.map(p=>p[1]);P.block(hood,f,c-.07,c+.07,Math.min(...vs),Math.max(...vs)-.3,-(o.depth??.35)+.05,-(o.depth??.35)+.2);}}}
// Stepped buttress on a face at u: width w, projecting d at the base, two set-offs, sloped top.
export function buttress(P,f,u,v0,v1,{w=.9,d=1.2,name='stone',steps=2}={}){const hs=(v1-v0)/(steps+1);
 for(let s=0;s<=steps;s++){const dd=d*(1-s/(steps+1.5)),a=v0+s*hs,b=a+hs;P.block(name,f,u-w/2,u+w/2,a,b-.2,0,dd,{skip:['bottom']});
  // Weathering: a sloped cap from the front edge back to the next stage.
  const nd=d*(1-(s+1)/(steps+1.5));P.quad(name,f.at(u-w/2,b-.2,dd),f.at(u+w/2,b-.2,dd),f.at(u+w/2,b,nd),f.at(u-w/2,b,nd),[f.n[0],1,f.n[2]]);
  for(const [x,sg] of [[u-w/2,-1],[u+w/2,1]])P.tri(name,f.at(x,b-.2,dd),f.at(x,b,nd),f.at(x,b-.2,nd),f.u.map(c=>c*sg));}}
// Gabled roof over a plan rectangle (u0..u1 along the ridge, v0..v1 across), eave y0, ridge y1.
export function gableRoof(P,F,u0,u1,v0,v1,y0,y1,{name='slate',over=.3,ends=true,endMat='stone',axis='u'}={}){
 // axis 'u': ridge along u at v=(v0+v1)/2; axis 'v': ridge along v at u=(u0+u1)/2.
 const A=axis==='u'?(a,b,y)=>F.w(a,b,y):(a,b,y)=>F.w(b,a,y);const [a0,a1,b0,b1]=axis==='u'?[u0,u1,v0,v1]:[v0,v1,u0,u1],bm=(b0+b1)/2;
 P.quad(name,A(a0-over,b0-over,y0-.15),A(a1+over,b0-over,y0-.15),A(a1+over,bm,y1),A(a0-over,bm,y1),[0,1,0]);P.quad(name,A(a0-over,b1+over,y0-.15),A(a1+over,b1+over,y0-.15),A(a1+over,bm,y1),A(a0-over,bm,y1),[0,1,0]);
 if(ends){const d=axis==='u'?[F.dir(-1,0),F.dir(1,0)]:[F.dir(0,-1),F.dir(0,1)];P.tri(endMat,A(a0,b0,y0),A(a0,b1,y0),A(a0,bm,y1),d[0]);P.tri(endMat,A(a1,b0,y0),A(a1,b1,y0),A(a1,bm,y1),d[1]);}}
// Lean-to (shed) roof from a wall line at v=vHigh (height yHigh) down to v=vLow (yLow), u0..u1.
export function leanTo(P,F,u0,u1,vHigh,vLow,yHigh,yLow,{name='slate'}={}){P.quad(name,F.w(u0,vHigh,yHigh),F.w(u1,vHigh,yHigh),F.w(u1,vLow,yLow),F.w(u0,vLow,yLow),[0,1,0]);}
// Square pinnacle: shaft s x s from y0 to y1, then a four-sided spirelet of height h, with a finial.
export function pinnacle(P,F,u,v,y0,y1,{s=.7,h=2.4,name='stone'}={}){P.geo(name,new T.BoxGeometry(s,y1-y0,s),F.matrix(u,v,(y0+y1)/2));P.geo(name,new T.ConeGeometry(s*.72,h,4,1).rotateY(Math.PI/4),F.matrix(u,v,y1+h/2));
 P.geo(name,new T.SphereGeometry(s*.16,6,4),F.matrix(u,v,y1+h+.05));}
// Octagonal spire from y0 (base half-width r) to y0+h, with four gabled lucarnes at the base.
export function spire(P,F,u,v,y0,h,{r=3,name='stone',lucarnes=true,sides=8,finial=1.6}={}){P.geo(name,new T.ConeGeometry(r/Math.cos(Math.PI/sides),h,sides,1,true).rotateY(Math.PI/sides),F.matrix(u,v,y0+h/2));
 if(lucarnes)for(let i=0;i<4;i++){const a=i*Math.PI/2,du=Math.cos(a),dv=Math.sin(a),f=new Face(F.w(u+du*r*.8-dv*.6,v+dv*r*.8+du*.6,y0+1.2),F.dir(dv,-du),[0,1,0]);
  P.poly(name,f,[[0,0],[1.2,0],[1.2,1.6],[.6,2.6],[0,1.6]]);}
 P.geo('metal',new T.CylinderGeometry(.04,.06,finial,6),F.matrix(u,v,y0+h+finial/2));P.geo('metal',new T.BoxGeometry(.6,.06,.06),F.matrix(u,v,y0+h+finial*.75));}
// Battlemented parapet along a wall face, from u0 to u1 at height y (merlons every 1.2 m).
export function battlements(P,f,u0,u1,y,{h=.9,name='stone',pitch=1.2}={}){P.block(name,f,u0,u1,y,y+h*.45,0,.25,{skip:['bottom']});for(let u=u0;u<u1-pitch*.4;u+=pitch)P.block(name,f,u,Math.min(u1,u+pitch*.55),y+h*.45,y+h,0,.25,{skip:['bottom']});}
// A whole Gothic Revival church from a plan spec, in its local frame (u along the axis from the tower into
// the nave, v to the left): tower {u0,u1,v0,v1,top,style: 'battlement' | 'spire', spireTop, pinnacles},
// nave {u0,u1,v0,v1,eave,ridge,bay}, aisles [{u0,u1,v0,v1,eave,high}], east end window, entrance in the tower.
export function gothicChurch(P,F,S){const t=S.tower,n=S.nave,bay=n.bay||3.6,mat=S.mat||'stone';
 // Aisles: outer wall with a lancet per bay and buttresses, lean-to roof up to the nave wall.
 for(const a of S.aisles||[]){const north=a.v1>n.v1-.01,vOut=north?a.v1:a.v0,vIn=north?n.v1:n.v0,L=a.u1-a.u0,cnt=Math.max(1,Math.round(L/bay));
  const f=north?F.face([a.u1,vOut],[a.u0,vOut]):F.face([a.u0,vOut],[a.u1,vOut]);wall(P,f,L,0,a.eave,Array.from({length:cnt},(_,i)=>({hole:pointed((i+.5)*L/cnt,1.3,1.6,a.eave-2.4),depth:.35})),{mat});
  for(let i=1;i<cnt;i++)buttress(P,f,i*L/cnt,0,a.eave+.4,{w:.7,d:.8,steps:1,name:mat});leanTo(P,F,a.u0,a.u1,vIn,vOut+(north?.3:-.3),a.high,a.eave-.1);
  for(const [u,front] of [[a.u0,true],[a.u1,false]]){const fe=front?(north?F.face([u,vOut],[u,vIn]):F.face([u,vIn],[u,vOut])):(north?F.face([u,vIn],[u,vOut]):F.face([u,vOut],[u,vIn])),wl=Math.abs(vOut-vIn);
   wall(P,fe,wl,0,a.eave,[{hole:pointed(wl/2,Math.min(1.6,wl*.4),1.8,a.eave-2),depth:.35}],{mat});const hiAt0=front?!north:north;P.poly(mat,fe,hiAt0?[[0,a.eave],[wl,a.eave],[0,a.high]]:[[0,a.eave],[wl,a.eave],[wl,a.high]]);}}
 // Nave: clerestory or full walls with tall lancets, buttresses, gable roof, east gable with a great window.
 const hasAisle=v=>(S.aisles||[]).some(a=>v>0?a.v1>n.v1-.01:a.v0<n.v0+.01),L=n.u1-n.u0,cnt=Math.max(1,Math.round(L/bay));
 for(const north of [true,false]){const v=north?n.v1:n.v0,f=north?F.face([n.u1,v],[n.u0,v]):F.face([n.u0,v],[n.u1,v]),a=hasAisle(north?1:-1),y0=a?Math.max(...(S.aisles||[]).map(x=>x.high)):0;
  wall(P,f,L,y0,n.eave,Array.from({length:cnt},(_,i)=>({hole:pointed((i+.5)*L/cnt,a?1.0:1.5,y0+(a?.8:2.0),n.eave-1.6),depth:.35,mullion:!a})),{mat});if(!a)for(let i=1;i<cnt;i++)buttress(P,f,i*L/cnt,0,n.eave-.6,{w:.8,d:1.0,name:mat});}
 gableRoof(P,F,n.u0,n.u1,n.v0,n.v1,n.eave,n.ridge,{ends:false});
 {const W=n.v1-n.v0,f=F.face([n.u1,n.v0],[n.u1,n.v1]);wall(P,f,W,0,n.eave,[{hole:pointed(W/2,Math.min(4.2,W*.4),2.6,n.eave-1.4),depth:.5,mullion:1}],{mat,gable:n.ridge-n.eave});
  for(const u of [.3,W-.3])buttress(P,f,u,0,n.eave-.5,{w:.8,d:1.2,name:mat});}
 // The west (entrance) gable beside the tower, above the aisles, where the nave is wider than the tower.
 {const W=n.v1-n.v0,f=F.face([n.u0,n.v1],[n.u0,n.v0]);P.poly(mat,f,[[0,n.eave],[W,n.eave],[W/2,n.ridge]]);P.poly(mat,f,[[0,0],[(W-(t.v1-t.v0))/2,0],[(W-(t.v1-t.v0))/2,n.eave],[0,n.eave]]);P.poly(mat,f,[[W-(W-(t.v1-t.v0))/2,0],[W,0],[W,n.eave],[W-(W-(t.v1-t.v0))/2,n.eave]]);}
 // Tower.
 const tw=t.u1-t.u0,td=t.v1-t.v0,stage=t.top/4,faces=[[F.face([t.u0,t.v1],[t.u0,t.v0]),td,0],[F.face([t.u0,t.v0],[t.u1,t.v0]),tw,1],[F.face([t.u1,t.v1],[t.u0,t.v1]),tw,2],[F.face([t.u1,t.v0],[t.u1,t.v1]),td,3]];
 for(const [f,W,i] of faces){const y0=i===3?n.ridge-.6:0,ops=[];if(i===0){ops.push({hole:pointed(W/2,Math.min(2.6,W*.38),0,3.8),depth:.9,glass:'door'},{hole:pointed(W/2,Math.min(2.2,W*.32),stage*1.3,stage*2.2),depth:.45,mullion:1});}
  ops.push({hole:pointed(W/2-W*.14,Math.min(.9,W*.13),stage*3.05,stage*3.75),depth:.6,glass:'louvre'},{hole:pointed(W/2+W*.14,Math.min(.9,W*.13),stage*3.05,stage*3.75),depth:.6,glass:'louvre'});
  wall(P,f,W,y0,t.top,ops,{mat});for(const y of [stage,stage*2,stage*2.9])if(y>y0)P.block('trim',f,0,W,y,y+.25,0,.18,{skip:['left','right']});
  if(i<3)for(const u of [0,W])buttress(P,f,u,y0,t.top-1.5,{w:.9,d:.9,steps:3,name:mat});
  if(t.style==='battlement')battlements(P,f,-.2,W+.2,t.top,{name:mat});else P.block('trim',f,-.2,W+.2,t.top-.5,t.top,0,.35);}
 for(const [u,v] of [[t.u0,t.v0],[t.u0,t.v1],[t.u1,t.v0],[t.u1,t.v1]])pinnacle(P,F,u,v,t.top-.4,t.top+(t.pinnacles||2.2),{s:t.turret||.9,h:t.spirelet||2.8,name:mat});
 if(t.style==='spire')spire(P,F,(t.u0+t.u1)/2,(t.v0+t.v1)/2,t.top,t.spireTop-t.top,{r:Math.min(tw,td)*.4,name:mat});
 // A plain roof over the tower.
 P.poly('slate',new Face(F.w(t.u0,t.v0,t.top-.02),F.dir(1,0),F.dir(0,1)),[[0,0],[tw,0],[tw,td],[0,td]]);}
