// Small 2D helpers shared by collision, streets and the world builder. Points are [east, north].
export function pointInRing(p,r){let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
export function pointInPolygon(p,rings){if(!pointInRing(p,rings[0]))return false;for(let i=1;i<rings.length;i++)if(pointInRing(p,rings[i]))return false;return true;}
export function ringArea(r){let a=0;for(let i=0;i<r.length;i++){const p=r[i],n=r[(i+1)%r.length];a+=p[0]*n[1]-n[0]*p[1];}return a/2;}
export function centroid(r){let x=0,n=0;for(const p of r){x+=p[0];n+=p[1];}return [x/r.length,n/r.length];}
export function closestOnSegment(px,pn,ax,an,bx,bn){const dx=bx-ax,dn=bn-an,L=dx*dx+dn*dn;let t=L>0?((px-ax)*dx+(pn-an)*dn)/L:0;t=t<0?0:t>1?1:t;return {x:ax+dx*t,n:an+dn*t,t};}
export function bboxOf(points){let a=Infinity,b=Infinity,c=-Infinity,d=-Infinity;for(const p of points){if(p[0]<a)a=p[0];if(p[1]<b)b=p[1];if(p[0]>c)c=p[0];if(p[1]>d)d=p[1];}return [a,b,c,d];}
// Minimal uniform grid: insert(item,bbox), query(minX,minN,maxX,maxN) -> unique items.
export class Grid{
 constructor(cell=10){this.cell=cell;this.map=new Map();this.stamp=0;}
 key(i,j){return i*73856093^j*19349663;}
 insert(item,[a,b,c,d]){const s=this.cell;item._stamp=0;for(let i=Math.floor(a/s);i<=Math.floor(c/s);i++)for(let j=Math.floor(b/s);j<=Math.floor(d/s);j++){const k=this.key(i,j);let l=this.map.get(k);if(!l)this.map.set(k,l=[]);l.push(item);}}
 query(a,b,c,d,out=[]){const s=this.cell,st=++this.stamp;for(let i=Math.floor(a/s);i<=Math.floor(c/s);i++)for(let j=Math.floor(b/s);j<=Math.floor(d/s);j++){const l=this.map.get(this.key(i,j));if(!l)continue;for(const it of l)if(it._stamp!==st){it._stamp=st;out.push(it);}}return out;}
}
// Oriented rectangle from four corner points: centre, unit long axis, half extents.
export function rectFrame(r){const c=centroid(r);const e1=[r[1][0]-r[0][0],r[1][1]-r[0][1]],e2=[r[2][0]-r[1][0],r[2][1]-r[1][1]];const l1=Math.hypot(...e1),l2=Math.hypot(...e2);const long=l1>=l2?e1:e2,L=Math.max(l1,l2),S=Math.min(l1,l2);const u=[long[0]/L,long[1]/L];return {c,u,v:[-u[1],u[0]],halfLong:L/2,halfShort:S/2};}
export function rectRing(f,u0,u1,v0,v1){const p=(a,b)=>[f.c[0]+f.u[0]*a+f.v[0]*b,f.c[1]+f.u[1]*a+f.v[1]*b];return [p(u0,v0),p(u1,v0),p(u1,v1),p(u0,v1)];}
