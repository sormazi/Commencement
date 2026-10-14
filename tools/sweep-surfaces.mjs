// Road surface sweep (Avi, 14 Oct 2026). Finds, across the study area:
//  overlaps  - two raised slabs (sidewalk, plaza, raised median) that overlap: their tops z-fight;
//  inroad    - a slab that a drivable street's centre line runs through (a stray piece of sidewalk or median);
//  gaps      - ground that is neither roadbed, slab, building nor park: bare asphalt where a sidewalk is missing.
// Writes RESEARCH/roads/sweep.json (clusters with their 2 m cells); findings and fixes are logged in RESEARCH/roads/sweep.md.
import fs from 'node:fs';
import data from '../dist/campus/data/campus-data.js';
const pip=(p,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const bb=r=>{const a=[1e9,1e9,-1e9,-1e9];for(const p of r){a[0]=Math.min(a[0],p[0]);a[1]=Math.min(a[1],p[1]);a[2]=Math.max(a[2],p[0]);a[3]=Math.max(a[3],p[1]);}return a;};
const area=r=>{let s=0;for(let i=0,j=r.length-1;i<r.length;j=i++)s+=(r[j][0]+r[i][0])*(r[j][1]-r[i][1]);return Math.abs(s/2);};
const slabs=[...data.sidewalk.map((p,i)=>({kind:'sidewalk',i,r:p[0]})),...data.plazas.map((p,i)=>({kind:'plaza',i,r:p[0]})),...data.median.map((p,i)=>({kind:'median-'+(data.medianKind[i]||'raised'),i,r:p[0]})).filter(s=>s.kind!=='median-painted')];
for(const s of slabs){s.b=bb(s.r);s.A=area(s.r);}
// Point-in-polygon against a list, through a 25 m grid index built on first use.
const IDX=new WeakMap();const index=list=>{let g=IDX.get(list);if(g)return g;g=new Map();for(const s of list){if(!s.b)s.b=bb(s.r);for(let i=Math.floor(s.b[0]/25);i<=Math.floor(s.b[2]/25);i++)for(let j=Math.floor(s.b[1]/25);j<=Math.floor(s.b[3]/25);j++){const k=i+','+j;(g.get(k)||g.set(k,[]).get(k)).push(s);}}IDX.set(list,g);return g;};
const hitIn=(list,p)=>(index(list).get(Math.floor(p[0]/25)+','+Math.floor(p[1]/25))||[]).find(s=>p[0]>=s.b[0]&&p[0]<=s.b[2]&&p[1]>=s.b[1]&&p[1]<=s.b[3]&&pip(p,s.r));
// Overlaps: sample a 1 m grid inside each smaller slab's box; points inside both slabs.
const overlaps=[];for(let i=0;i<slabs.length;i++)for(let j=i+1;j<slabs.length;j++){const a=slabs[i],b=slabs[j];if(a.b[0]>b.b[2]||b.b[0]>a.b[2]||a.b[1]>b.b[3]||b.b[1]>a.b[3])continue;
 const s=a.A<b.A?a:b,o=s===a?b:a;let n=0,cx=0,cn=0;for(let x=Math.max(a.b[0],b.b[0]);x<=Math.min(a.b[2],b.b[2]);x+=1)for(let y=Math.max(a.b[1],b.b[1]);y<=Math.min(a.b[3],b.b[3]);y+=1){const p=[x,y];if(pip(p,s.r)&&pip(p,o.r)){n++;cx+=x;cn+=y;}}
 if(n>=2&&!(n>=s.A*.95))overlaps.push({a:a.kind+'#'+a.i,b:b.kind+'#'+b.i,m2:n,at:[Math.round(cx/n),Math.round(cn/n)]});}
// Slabs crossed by drivable centre lines (excluding the slab's own ends: sample the centre line every 2 m).
const inroad=new Map();for(const s of data.streets.segments){for(let k=1;k<s.pts.length;k++){const a=s.pts[k-1],b=s.pts[k],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=1;t<L-1;t+=2){const p=[a[0]+(b[0]-a[0])*t/L,a[1]+(b[1]-a[1])*t/L];const h=hitIn(slabs,p);if(h&&h.kind!=='median-raised'&&h.kind!=='median-island'){const key=h.kind+'#'+h.i;const e=inroad.get(key)||{slab:key,street:data.streets.names[s.street]||s.street,m:0,at:p.map(Math.round)};e.m+=2;inroad.set(key,e);}}}}
// Gaps: 2 m grid over the core; ground not in roadbed, slabs, buildings or areas.
const road=data.roadbed.map(p=>({r:p[0],b:bb(p[0])})),blds=data.buildings.map(b=>({r:b.rings[0],b:bb(b.rings[0])})),areas=data.areas.map(a=>({r:a.ring,b:bb(a.ring)}));
// Only ground touching the roadbed counts (a missing sidewalk strip), not the yards inside blocks.
const BB=data.meta.bounds,X0=Math.ceil(BB.minX/2)*2,X1=BB.maxX,Y0=Math.ceil(BB.minN/2)*2,Y1=BB.maxN,gaps=[];for(let x=X0;x<=X1;x+=2)for(let y=Y0;y<=Y1;y+=2){const p=[x,y];if(hitIn(road,p)||hitIn(slabs,p)||hitIn(blds,p)||hitIn(areas,p))continue;if(![[2,0],[-2,0],[0,2],[0,-2]].some(([dx,dy])=>hitIn(road,[x+dx,y+dy])))continue;gaps.push(p);}
// Cluster gap points (4-neighbour flood on the 2 m grid) and keep clusters over 12 m2.
// (gap clusters join through 4 m so a missing strip along a block stays one cluster)
const key=p=>p[0]+','+p[1],G=new Set(gaps.map(key)),seen=new Set(),clusters=[];
for(const p of gaps){const k=key(p);if(seen.has(k))continue;const q=[p];seen.add(k);const pts=[];while(q.length){const c=q.pop();pts.push(c);for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2],[4,0],[-4,0],[0,4],[0,-4],[2,2],[-2,2],[2,-2],[-2,-2]]){const n=[c[0]+dx,c[1]+dy],nk=key(n);if(G.has(nk)&&!seen.has(nk)){seen.add(nk);q.push(n);}}}
 if(pts.length*4>=12){const b=bb(pts);clusters.push({m2:pts.length*4,at:[Math.round((b[0]+b[2])/2),Math.round((b[1]+b[3])/2)],box:b,cells:pts});}}
clusters.sort((a,b)=>b.m2-a.m2);
// Roadbed far from any centre line (more than half the street's width plus 2 m): sidewalk drawn as road.
const segs=[];for(const s of data.streets.segments)for(let k=1;k<s.pts.length;k++)segs.push({a:s.pts[k-1],b:s.pts[k],w:s.width||10});
const sg=new Map();for(const g of segs){for(let i=Math.floor(Math.min(g.a[0],g.b[0])/20)-1;i<=Math.floor(Math.max(g.a[0],g.b[0])/20)+1;i++)for(let j=Math.floor(Math.min(g.a[1],g.b[1])/20)-1;j<=Math.floor(Math.max(g.a[1],g.b[1])/20)+1;j++){const k=i+','+j;(sg.get(k)||sg.set(k,[]).get(k)).push(g);}}
const wideP=[];for(let x=X0;x<=X1;x+=2)for(let y=Y0;y<=Y1;y+=2){const p=[x,y];if(!hitIn(road,p)||hitIn(slabs,p))continue;let ok=false;for(const g of sg.get(Math.floor(x/20)+','+Math.floor(y/20))||[]){const ex=g.b[0]-g.a[0],en=g.b[1]-g.a[1],L2=ex*ex+en*en||1;const t=Math.max(0,Math.min(1,((x-g.a[0])*ex+(y-g.a[1])*en)/L2));if(Math.hypot(x-g.a[0]-ex*t,y-g.a[1]-en*t)<=g.w/2+2){ok=true;break;}}if(!ok)wideP.push(p);}
const W=new Set(wideP.map(key)),wseen=new Set(),wide=[];for(const p of wideP){const k=key(p);if(wseen.has(k))continue;const q=[p];wseen.add(k);const pts=[];while(q.length){const c=q.pop();pts.push(c);for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2],[2,2],[-2,2],[2,-2],[-2,-2]]){const n=[c[0]+dx,c[1]+dy],nk=key(n);if(W.has(nk)&&!wseen.has(nk)){wseen.add(nk);q.push(n);}}}if(pts.length*4>=40){const b=bb(pts);wide.push({m2:pts.length*4,at:[Math.round((b[0]+b[2])/2),Math.round((b[1]+b[3])/2)],box:b,cells:pts});}}
wide.sort((a,b)=>b.m2-a.m2);
const out={overlaps,wide,inroad:[...inroad.values()].filter(e=>e.m>=4),gaps:clusters};
fs.writeFileSync(new URL('../RESEARCH/roads/sweep.json',import.meta.url),JSON.stringify(out));
console.log({wide:wide.length,wideM2:wide.reduce((s,c)=>s+c.m2,0),overlaps:overlaps.length,inroad:out.inroad.length,gaps:clusters.length,gapM2:clusters.reduce((s,c)=>s+c.m2,0)});
