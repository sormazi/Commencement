// Lists the buildings fronting a street inside a box, by side and in order along the street, with
// address, BIN, frontage and a Street View viewpoint opposite each (on the centreline, looking at it),
// for the storefront survey. Usage: node tools/blockface.mjs "<street regex>" x0 n0 x1 n1
// (map metres from the Arch, x east, n north; the box selects the stretch of street).
import data from '../dist/campus/data/campus-data.js';
const re=new RegExp(process.argv[2],'i'),[x0,n0,x1,n1]=process.argv.slice(3,7).map(Number);
const inBox=p=>p[0]>=Math.min(x0,x1)&&p[0]<=Math.max(x0,x1)&&p[1]>=Math.min(n0,n1)&&p[1]<=Math.max(n0,n1);
const segs=[];for(const s of data.streets.segments){if(!re.test(data.streets.names[s.street]))continue;for(let i=1;i<s.pts.length;i++){const a=s.pts[i-1],b=s.pts[i];if(inBox(a)||inBox(b))segs.push([a,b]);}}
if(!segs.length){console.log('no street segments');process.exit(1);}
// Overall direction of the stretch (for ordering and naming sides).
let dx=0,dn=0;for(const [a,b] of segs){const ex=b[0]-a[0],en=b[1]-a[1],s=Math.sign(ex*(segs[0][1][0]-segs[0][0][0])+en*(segs[0][1][1]-segs[0][0][1]))||1;dx+=ex*s;dn+=en*s;}const D=Math.hypot(dx,dn),t=[dx/D,dn/D],left=[-t[1],t[0]];
const ll=p=>[(40.731234725+p[1]/111030).toFixed(6),(-73.9971025+p[0]/84380).toFixed(6)];
const near=p=>{let best=null;for(const [a,b] of segs){const ex=b[0]-a[0],en=b[1]-a[1],L=ex*ex+en*en;let k=L?((p[0]-a[0])*ex+(p[1]-a[1])*en)/L:0;k=Math.max(0,Math.min(1,k));const q=[a[0]+ex*k,a[1]+en*k],d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(!best||d<best.d)best={q,d};}return best;};
const rows=[];
for(const b of data.buildings){const r=b.rings[0],A=r.reduce((s,p,k)=>{const q=r[(k+1)%r.length];return s+p[0]*q[1]-q[0]*p[1];},0);for(let i=0;i<r.length;i++){const a=r[i],c=r[(i+1)%r.length],el=Math.hypot(c[0]-a[0],c[1]-a[1]);if(el<2)continue;const m=[(a[0]+c[0])/2,(a[1]+c[1])/2];if(!inBox(m))continue;
 const nb=near(m);if(nb.d<3||nb.d>28)continue;const et=[(c[0]-a[0])/el,(c[1]-a[1])/el];if(Math.abs(et[0]*t[0]+et[1]*t[1])<.85)continue;
 const on=A>0?[et[1],-et[0]]:[-et[1],et[0]],toSt=[(nb.q[0]-m[0])/nb.d,(nb.q[1]-m[1])/nb.d];if(on[0]*toSt[0]+on[1]*toSt[1]<.8)continue;
 const side=(m[0]-nb.q[0])*left[0]+(m[1]-nb.q[1])*left[1]>0?'L':'R',s=m[0]*t[0]+m[1]*t[1],h=(Math.atan2(-toSt[0],-toSt[1])*180/Math.PI+360)%360;
 rows.push({side,s,el,b,sv:ll(nb.q),h,a,c});}}
rows.sort((p,q)=>p.side.localeCompare(q.side)||p.s-q.s);
for(const o of rows)console.log(`${o.side} ${o.s.toFixed(0).padStart(5)} ${o.b.bin} ${(o.b.addr||'').padEnd(26)} ${(o.b.name||'').slice(0,26).padEnd(26)} front ${o.el.toFixed(1).padStart(5)} h ${(o.b.h||0).toFixed(0).padStart(3)} sv ${o.sv.join(',')} h${o.h.toFixed(0)}`);
