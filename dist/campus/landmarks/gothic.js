import * as T from '../../vendor/three.module.js';
import {Face,reveal} from './kit.js?v=22';
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
