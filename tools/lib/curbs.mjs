// Curb geometry shared by the build tools and the tests (pole audit, 14 Oct 2026).
// Walkable surfaces are the planimetric sidewalks, plazas and raised (curbed) medians; the roadway is the roadbed
// minus those. inRoad(p) says whether a point stands in a traffic or parking lane. snap(p, offset) moves a point
// out of the roadway onto the nearest walkable surface, `offset` metres in from its curb.
const pip=(p,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
export function curbIndex(data){
 const prep=rs=>rs.map(r=>{const a=[1e9,1e9,-1e9,-1e9];for(const p of r){a[0]=Math.min(a[0],p[0]);a[1]=Math.min(a[1],p[1]);a[2]=Math.max(a[2],p[0]);a[3]=Math.max(a[3],p[1]);}return {r,a};});
 const walkRings=[...data.sidewalk.map(p=>p[0]),...data.plazas.map(p=>p[0]),...data.median.filter((m,i)=>data.medianKind?.[i]!=='painted').map(p=>p[0])];
 const road=prep(data.roadbed.map(r=>r[0])),walk=prep(walkRings);
 const hit=(L,p)=>L.some(({r,a})=>p[0]>=a[0]&&p[0]<=a[2]&&p[1]>=a[1]&&p[1]<=a[3]&&pip(p,r));
 const onWalk=p=>hit(walk,p),inRoad=p=>hit(road,p)&&!onWalk(p);
 const C=8,grid=new Map(),key=(i,j)=>i+','+j;
 walkRings.forEach((r,ri)=>{for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];for(let gi=Math.floor(Math.min(a[0],b[0])/C);gi<=Math.floor(Math.max(a[0],b[0])/C);gi++)for(let gj=Math.floor(Math.min(a[1],b[1])/C);gj<=Math.floor(Math.max(a[1],b[1])/C);gj++){const k=key(gi,gj);(grid.get(k)||grid.set(k,[]).get(k)).push([a,b,ri]);}}});
 // Nearest curb edge: {c: closest point, d, along: edge angle, out: unit vector from the curb into the road}.
 // accept(c,out) can reject candidates (e.g. the wrong side of the street).
 function curb(p,R=14,accept){let best=null;const gi=Math.floor(p[0]/C),gj=Math.floor(p[1]/C),s=Math.ceil(R/C);
  for(let i=gi-s;i<=gi+s;i++)for(let j=gj-s;j<=gj+s;j++)for(const [a,b,ri] of grid.get(key(i,j))||[]){const ex=b[0]-a[0],en=b[1]-a[1],L2=ex*ex+en*en;if(L2<.01)continue;const t=Math.max(0,Math.min(1,((p[0]-a[0])*ex+(p[1]-a[1])*en)/L2));
   const c=[a[0]+ex*t,a[1]+en*t],d=Math.hypot(p[0]-c[0],p[1]-c[1]);if(d>R||best&&d>=best.d)continue;const L=Math.sqrt(L2);let o=[en/L,-ex/L];if(pip([c[0]+o[0]*.3,c[1]+o[1]*.3],walkRings[ri]))o=[-o[0],-o[1]];
   // Edges whose outside is not roadway (building lines, park edges) are not curbs.
   if(!inRoad([c[0]+o[0]*.6,c[1]+o[1]*.6]))continue;if(accept&&!accept(c,o))continue;best={c,d,along:Math.atan2(en,ex),out:o};}
  return best;}
 const snap=(p,offset=.5,R=25,accept)=>{const c=curb(p,R,accept);return c?[c.c[0]-c.out[0]*offset,c.c[1]-c.out[1]*offset]:null;};
 return {inRoad,onWalk,curb,snap};}
