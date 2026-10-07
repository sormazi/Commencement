import {Grid,closestOnSegment,pointInRing,bboxOf,rectFrame,rectRing,centroid} from './geometry.js';
import {SHEDS} from './landmarks/sheds.js?v=19';
import {SYLVETTE} from './landmarks/silver-towers.js?v=19';
// Static collision and surface queries for the free-roam campus, in physics/map space
// (x = east, z = north). Contacts are returned in the format physics.resolveContact expects.
export const CAR_CIRCLES=[1.32,0,-1.32],CAR_RADIUS=.98;
export const CURB_HEIGHT=.15;
const treeRadius=dbh=>Math.max(.22,Math.min(1.1,dbh*.0254/2+.06));
export function archPiers(arch){const f=rectFrame(arch.ring),o=arch.openingWidth/2;return [rectRing(f,-f.halfLong,-o,-f.halfShort,f.halfShort),rectRing(f,o,f.halfLong,-f.halfShort,f.halfShort)];}
// Statue pedestals project 1.05 m from the north face of each pier (landmarks/arch.js ARCH.pedestal).
export function archPedestals(arch){const f=rectFrame(arch.ring);return [rectRing(f,-8.92,-4.95,-4.25,-3.2),rectRing(f,4.95,8.92,-4.25,-3.2)];}
export class CampusCollision{
 constructor(data){this.data=data;this.segGrid=new Grid(8);this.ringGrid=new Grid(16);this.circleGrid=new Grid(8);this.roadGrid=new Grid(20);this.grassGrid=new Grid(20);this.counts={segments:0,rings:0,circles:0};
  const addRing=(ring,kind,thick=0)=>{const rec={ring,kind};this.ringGrid.insert(rec,bboxOf(ring));this.counts.rings++;for(let i=0;i<ring.length;i++)this.addSegment(ring[i],ring[(i+1)%ring.length],kind,thick);};
  for(const b of data.buildings){addRing(b.rings[0],'building');for(let h=1;h<b.rings.length;h++){const r=b.rings[h];for(let i=0;i<r.length;i++)this.addSegment(r[i],r[(i+1)%r.length],'building',0);}}
  this.piers=archPiers(data.arch);for(const p of this.piers)addRing(p,'arch');this.pedestals=archPedestals(data.arch);for(const p of this.pedestals)addRing(p,'arch');
  // Sidewalk sheds: the curb-side line of posts is solid.
  for(const sh of SHEDS){const dx=sh.b[0]-sh.a[0],dn=sh.b[1]-sh.a[1],L=Math.hypot(dx,dn),nx=dn/L,nn=-dx/L,d=.3+sh.depth-.1;this.addSegment([sh.a[0]+nx*d,sh.a[1]+nn*d],[sh.b[0]+nx*d,sh.b[1]+nn*d],'shed',.08);}
  // Bust of Sylvette placeholder plinth, placed from LPC 2300 (the OSM node is misplaced; see silver-towers.js).
  {const S=SYLVETTE,t=[S.facing[1],-S.facing[0]],hw=S.plinth[0]/2,hd=S.plinth[1]/2,q=(a,b)=>[S.p[0]+t[0]*a+S.facing[0]*b,S.p[1]+t[1]*a+S.facing[1]*b];addRing([q(-hw,-hd),q(hw,-hd),q(hw,hd),q(-hw,hd)],'monument');}
  for(const a of data.areas)if(a.kind==='fountain')addRing(a.ring,'fountain');
  for(const b of data.barriers)if(b.kind!=='retaining_wall')for(let i=1;i<b.pts.length;i++)this.addSegment(b.pts[i-1],b.pts[i],b.kind,.06);
  for(const t of data.trees)this.addCircle(t.p,t.landmark?1.1:treeRadius(t.dbh),'tree');
  for(const m of data.monuments){if(/plaque/.test(m.kind)||m.kind==='memorial'&&!m.name||m.name==='Bust of Sylvette')continue;const r=m.kind==='flagpole'?.3:/Garibaldi/.test(m.name||'')?2.1:/Holley/.test(m.name||'')?1.4:.9;this.addCircle(m.p,r,m.kind);}
  const B=data.meta.bounds,c=[[B.minX,B.minN],[B.maxX,B.minN],[B.maxX,B.maxN],[B.minX,B.maxN]];for(let i=0;i<4;i++)this.addSegment(c[i],c[(i+1)%4],'boundary',0);
  for(const r of data.roadbed)this.roadGrid.insert({rings:r},bboxOf(r[0]));
  for(const a of data.areas)if(a.kind==='grass'||a.kind==='dogrun')this.grassGrid.insert({ring:a.ring,kind:a.kind},bboxOf(a.ring));
  this.streetPieces=new Grid(20);for(const s of data.streets.segments)for(let i=1;i<s.pts.length;i++){const a=s.pts[i-1],b=s.pts[i];this.streetPieces.insert({a,b,half:s.width/2},bboxOf([a,b]));}
 }
 addSegment(a,b,kind,thick){const s={a,b,kind,thick};this.segGrid.insert(s,[Math.min(a[0],b[0])-thick,Math.min(a[1],b[1])-thick,Math.max(a[0],b[0])+thick,Math.max(a[1],b[1])+thick]);this.counts.segments++;}
 addCircle(p,r,kind){const c={p,r,kind};this.circleGrid.insert(c,[p[0]-r,p[1]-r,p[0]+r,p[1]+r]);this.counts.circles++;}
 // Point query: is this map point inside solid geometry?
 solidAt(x,n){for(const r of this.ringGrid.query(x,n,x,n))if(pointInRing([x,n],r.ring))return r.kind;for(const c of this.circleGrid.query(x,n,x,n))if(Math.hypot(c.p[0]-x,c.p[1]-n)<c.r)return c.kind;return null;}
 isRoad(x,n){for(const r of this.roadGrid.query(x,n,x,n))if(pointInRing([x,n],r.rings[0]))return true;for(const s of this.streetPieces.query(x-1,n-1,x+1,n+1)){const c=closestOnSegment(x,n,s.a[0],s.a[1],s.b[0],s.b[1]);if(Math.hypot(c.x-x,c.n-n)<s.half-.6)return true;}return false;}
 surface(x,n){if(this.isRoad(x,n))return {height:0,grip:1,kind:'road'};for(const g of this.grassGrid.query(x,n,x,n))if(pointInRing([x,n],g.ring))return {height:CURB_HEIGHT,grip:.62,kind:g.kind};return {height:CURB_HEIGHT,grip:.92,kind:'paving'};}
 // Car as three circles along its axis. Returns deepest contact per circle.
 contacts(x,n,yaw,out=[]){const si=Math.sin(yaw),co=Math.cos(yaw),R=CAR_RADIUS;
  for(const oz of CAR_CIRCLES){const cx=x+si*oz,cn=n+co*oz;let best=null;
   const consider=(nx,nn,pen,kind)=>{if(pen>0&&(!best||pen>best.penetration))best={nx,nn,pen,penetration:pen,kind};};
   for(const s of this.segGrid.query(cx-R,cn-R,cx+R,cn+R)){const c=closestOnSegment(cx,cn,s.a[0],s.a[1],s.b[0],s.b[1]);const dx=cx-c.x,dn=cn-c.n,d=Math.hypot(dx,dn),reach=R+s.thick;if(d<reach&&d>1e-6)consider(dx/d,dn/d,reach-d,s.kind);}
   for(const c of this.circleGrid.query(cx-R,cn-R,cx+R,cn+R)){const dx=cx-c.p[0],dn=cn-c.p[1],d=Math.hypot(dx,dn),reach=R+c.r;if(d<reach)consider(d>1e-6?dx/d:1,d>1e-6?dn/d:0,reach-d,c.kind);}
   // Circle centre inside a solid ring (tunnelled or spawned inside): push out through the nearest edge.
   for(const r of this.ringGrid.query(cx,cn,cx,cn)){if(!pointInRing([cx,cn],r.ring))continue;let bd=Infinity,bn=null;for(let i=0;i<r.ring.length;i++){const a=r.ring[i],b=r.ring[(i+1)%r.ring.length],c=closestOnSegment(cx,cn,a[0],a[1],b[0],b[1]),d=Math.hypot(c.x-cx,c.n-cn);if(d<bd){bd=d;bn=[(c.x-cx)/(d||1),(c.n-cn)/(d||1)];}}if(bn)consider(bn[0],bn[1],bd+R,r.kind);}
   if(!best)continue;const wx=cx-best.nx*R-x,wn=cn-best.nn*R-n;
   out.push({normal:{x:best.nx,z:best.nn},point:{x:wx*co-wn*si,z:wx*si+wn*co},penetration:best.penetration,restitution:.1,kind:best.kind});}
  return out;}
}
export {centroid};
