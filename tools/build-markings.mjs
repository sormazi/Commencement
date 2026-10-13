// Builds dist/campus/data/street-markings.js: every street's lane markings, worked out from open data
// (roads survey, 11 Oct 2026). Usage: node tools/build-markings.mjs
// Inputs:
//   dist/campus/data/campus-data.js            centrelines (travel lanes, parking lanes, direction, width), curbs
//                                              (sidewalk, plaza and raised-median outlines), painted medians
//   RESEARCH/data/raw/nightview-nyc-streets.json  NYC DOT bike routes and bus lanes
//   RESEARCH/data/raw/nightview-osm-washington-square.json  OSM: which side the bike lane is on, signals, stop signs
// Method, per centreline piece, sampled every 4 m: cast a ray left and right to the curb (the nearest sidewalk,
// plaza, park or raised-median edge); painted medians (hatched buffers) inside that span split it. The widest
// open span is the carriageway: parking lanes (2.4 m) go against its edges, then a conventional bike lane
// (1.5 m) on the side OSM gives, then a bus lane where NYC DOT has one, and the travel lanes share the rest.
// Lines: double yellow between opposing traffic, white dashes (3 m on, 9 m off, NYC's 10 ft / 30 ft) between
// lanes going the same way, solid white along bike and bus lanes, green paint in protected bike lanes and red in
// bus lanes; everything stops short of the intersections, where stop lines cross the approach lanes at
// signals and stop signs. Output stripes are rectangles [x, n, length, width, angle, colour].
import fs from 'node:fs';
import data from '../dist/campus/data/campus-data.js';
import {makeProjection} from '../dist/campus/projection.js';
const root=new URL('../',import.meta.url),raw=f=>JSON.parse(fs.readFileSync(new URL('RESEARCH/data/raw/'+f,root)));
const streets=raw('nightview-nyc-streets.json'),osm=raw('nightview-osm-washington-square.json');
// Green paint is drawn only where the orthoimagery shows it (RESEARCH/roads/green-paint.json, written by
// tools/check-green-paint.py: the share of each bike lane's samples that read as green). Unmeasured lanes keep it.
const greenFile=new URL('RESEARCH/roads/green-paint.json',root),GREEN=fs.existsSync(greenFile)?JSON.parse(fs.readFileSync(greenFile)):{};
const P=makeProjection(data.meta.origin),pt=(lon,lat)=>P.toLocal(lat,lon);
const q=v=>Math.round(v*100)/100;
// ---- Curbs: every edge of a raised surface, in a grid for ray casting.
const curbRings=[...data.sidewalk.map(p=>p[0]),...data.plazas.map(p=>p[0]),...data.median.filter((m,i)=>data.medianKind[i]!=='painted').map(p=>p[0]),
 ...data.areas.filter(a=>a.kind==='park').map(a=>a.ring)];
const painted=data.median.filter((m,i)=>data.medianKind[i]==='painted').map(p=>p[0]);
class Grid{constructor(c){this.c=c;this.m=new Map();}add(item,x0,n0,x1,n1){for(let i=Math.floor(x0/this.c);i<=Math.floor(x1/this.c);i++)for(let j=Math.floor(n0/this.c);j<=Math.floor(n1/this.c);j++){const k=i+','+j;(this.m.get(k)||this.m.set(k,[]).get(k)).push(item);}}
 near(x0,n0,x1,n1){const out=new Set();for(let i=Math.floor(x0/this.c);i<=Math.floor(x1/this.c);i++)for(let j=Math.floor(n0/this.c);j<=Math.floor(n1/this.c);j++)for(const it of this.m.get(i+','+j)||[])out.add(it);return out;}}
const edgeGrid=(rings)=>{const g=new Grid(10);for(const r of rings)for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];g.add([a,b],Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]));}return g;};
const curbG=edgeGrid(curbRings),paintG=edgeGrid(painted);
// Distance along a ray from p in direction d to the nearest edge in the grid (or Infinity).
function hits(g,p,d,max){const x1=p[0]+d[0]*max,n1=p[1]+d[1]*max,out=[];
 for(const [a,b] of g.near(Math.min(p[0],x1),Math.min(p[1],n1),Math.max(p[0],x1),Math.max(p[1],n1))){const ex=b[0]-a[0],en=b[1]-a[1],den=d[0]*en-d[1]*ex;if(Math.abs(den)<1e-9)continue;
  const t=((a[0]-p[0])*en-(a[1]-p[1])*ex)/den,u=((a[0]-p[0])*d[1]-(a[1]-p[1])*d[0])/den;if(t>.05&&t<=max&&u>=0&&u<=1)out.push(t);}return out.sort((x,y)=>x-y);}
const median=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)];};
// ---- OSM: road ways with their tags, signals and stop signs.
const els=osm.elements,nodes=new Map(els.filter(e=>e.type==='node').map(e=>[e.id,e]));
const ROADS=new Set(['primary','secondary','tertiary','residential','unclassified','living_street','primary_link','secondary_link','tertiary_link','trunk']);
const oways=els.filter(e=>e.type==='way'&&ROADS.has(e.tags?.highway)).map(w=>({tags:w.tags,pts:w.nodes.map(id=>nodes.get(id)).filter(Boolean).map(n=>pt(n.lon,n.lat))}));
const owayG=new Grid(20);oways.forEach((w,wi)=>{for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];owayG.add([wi,a,b],Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]));}});
const signals=els.filter(e=>e.type==='node'&&e.tags?.highway==='traffic_signals').map(n=>pt(n.lon,n.lat));
const stops=els.filter(e=>e.type==='node'&&e.tags?.highway==='stop').map(n=>pt(n.lon,n.lat));
// The OSM way matching a centreline piece: parallel, within 8 m of its middle. Returns tags and whether the
// way runs the same direction as the piece (so its left/right can be mapped).
function osmFor(a,b){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn);let best=null,bd=8;
 for(const [wi,p,r] of owayG.near(m[0]-8,m[1]-8,m[0]+8,m[1]+8)){const ex=r[0]-p[0],en=r[1]-p[1],EL=Math.hypot(ex,en);if(EL<.5)continue;const cos=(dx*ex+dn*en)/(L*EL);if(Math.abs(cos)<.94)continue;
  const t=Math.max(0,Math.min(1,((m[0]-p[0])*ex+(m[1]-p[1])*en)/(EL*EL))),d=Math.hypot(m[0]-p[0]-ex*t,m[1]-p[1]-en*t);if(d<bd){bd=d;best={tags:oways[wi].tags,same:cos>0};}}return best;}
// ---- NYC DOT bike routes and bus lanes as buffered lines.
const lineRows=(rows,f)=>rows.flatMap(r=>{const g=typeof r.the_geom==='string'?JSON.parse(r.the_geom):r.the_geom;const cs=g.type==='LineString'?[g.coordinates]:g.coordinates;return cs.map(c=>({row:r,pts:c.map(([lo,la])=>pt(lo,la))}));}).filter(f);
const bikes=lineRows(streets.bike_routes,x=>x.row.status==='Current'&&x.row.onoffst!=='OFF'),buses=lineRows(streets.bus_lanes,()=>true);
const lineG=(list)=>{const g=new Grid(20);list.forEach((l,li)=>{for(let i=1;i<l.pts.length;i++){const a=l.pts[i-1],b=l.pts[i];g.add([li,a,b],Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1]));}});return g;};
const bikeG=lineG(bikes),busG=lineG(buses);
function along(g,list,a,b,r=6){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn);const out=new Set();
 for(const [li,p,s] of g.near(m[0]-r,m[1]-r,m[0]+r,m[1]+r)){const ex=s[0]-p[0],en=s[1]-p[1],EL=Math.hypot(ex,en);if(EL<.5)continue;if(Math.abs((dx*ex+dn*en)/(L*EL))<.9)continue;
  const t=Math.max(0,Math.min(1,((m[0]-p[0])*ex+(m[1]-p[1])*en)/(EL*EL)));if(Math.hypot(m[0]-p[0]-ex*t,m[1]-p[1]-en*t)<r)out.add(list[li].row);}return [...out];}
// ---- Intersections: graph nodes where three or more pieces meet; trim distance from the widest crossing street.
const S=data.streets,deg=new Map();for(const [a,b] of S.edges){deg.set(a,(deg.get(a)||0)+1);deg.set(b,(deg.get(b)||0)+1);}
const nodeAt=new Map();S.nodes.forEach((p,i)=>nodeAt.set(Math.round(p[0]*2)+','+Math.round(p[1]*2),i));
const nid=p=>nodeAt.get(Math.round(p[0]*2)+','+Math.round(p[1]*2));
const nodeWidth=new Map();for(const s of S.segments){for(const p of [s.pts[0],s.pts.at(-1)]){const i=nid(p);if(i==null)continue;nodeWidth.set(i,Math.max(nodeWidth.get(i)||0,s.width));}}
const near=(list,p,r)=>list.some(s=>Math.hypot(s[0]-p[0],s[1]-p[1])<r);
// ---- Build.
const out=[],stats={pieces:0,lanes:0,bike:0,bus:0,stop:0,osm:0},C={w:0,y:1,g:2,r:3};
const rect=(a,b,off,w,c,dir)=>{const dx=b[0]-a[0],dn=b[1]-a[1],L=Math.hypot(dx,dn);if(L<.2)return;const nx=dn/L,nn=-dx/L;/* offsets are measured to the right of the direction a->b */out.push([q((a[0]+b[0])/2+nx*off),q((a[1]+b[1])/2+nn*off),q(L),q(w),Math.round(Math.atan2(dn,dx)*1000)/1000,C[c]]);};
const dashes=(a,b,off,w,c,on=3,gap=9)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=(L%(on+gap))/2;s<L;s+=on+gap){const e=Math.min(L,s+on);if(e-s<.6)continue;const A=[a[0]+(b[0]-a[0])*s/L,a[1]+(b[1]-a[1])*s/L],B=[a[0]+(b[0]-a[0])*e/L,a[1]+(b[1]-a[1])*e/L];rect(A,B,off,w,c);}};
for(const s of S.segments){const pts=s.pts;for(let i=1;i<pts.length;i++){let a=pts[i-1],b=pts[i];let L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<4)continue;
  const ux=(b[0]-a[0])/L,un=(b[1]-a[1])/L,left=[-un,ux],right=[un,-ux];
  // Trim at intersections (only at the segment's true ends).
  const ia=i===1?nid(pts[0]):null,ib=i===pts.length-1?nid(pts.at(-1)):null;
  const tA=ia!=null&&(deg.get(ia)||0)>=3?(nodeWidth.get(ia)||10)/2+4.6:0,tB=ib!=null&&(deg.get(ib)||0)>=3?(nodeWidth.get(ib)||10)/2+4.6:0;
  if(L-tA-tB<4)continue;const A=[a[0]+ux*tA,a[1]+un*tA],B=[b[0]-ux*tB,b[1]-un*tB];L=L-tA-tB;stats.pieces++;
  // Cross-section: curb distances and painted buffers, sampled.
  const Ls=[],Rs=[],paints=[];for(let s2=1;s2<L;s2+=4){const p=[A[0]+ux*s2,A[1]+un*s2];const l=hits(curbG,p,left,30)[0],r=hits(curbG,p,right,30)[0];if(l!=null&&r!=null&&l+r<40){Ls.push(l);Rs.push(r);
   const pl=hits(paintG,p,left,l),pr=hits(paintG,p,right,r);paints.push({l:pl,r:pr});}}
  if(Ls.length<1)continue;const Lw=median(Ls),Rw=median(Rs);
  // Painted buffers near a curb (within 3.5 m): the open span starts past them. Take the median sample's hits.
  const pm=paints[Math.floor(paints.length/2)];let lo=-Lw,hi=Rw,bufL=null,bufR=null;
  if(pm.l.length>=2&&pm.l[1]<=Lw&&Lw-pm.l[1]<3.6){bufL=[-pm.l[1],-pm.l[0]];lo=-pm.l[0];}// [curb side edge, inner edge]
  if(pm.r.length>=2&&pm.r[1]<=Rw&&Rw-pm.r[1]<3.6){bufR=[pm.r[0],pm.r[1]];hi=pm.r[0];}
  // Lanes that live outside a buffer, between it and the curb: a protected bike lane.
  const o=osmFor(a,b);if(o)stats.osm++;const tg=o?.tags||{};const side=k=>o?(o.same?k:k==='left'?'right':'left'):null;
  const bikeRows=along(bikeG,bikes,a,b),busRows=along(busG,buses,a,b);
  const facility=bikeRows.map(r=>(r.ft_facilit||'')+' '+(r.tf_facilit||'')).join(' ');
  const protectedBike=/Protected/.test(facility),conventional=/Conventional|Curbside/.test(facility);
  const cyc={left:tg['cycleway:left']||(tg['cycleway:both']||tg.cycleway),right:tg['cycleway:right']||(tg['cycleway:both']||tg.cycleway)};
  const cycSide=s0=>cyc[s0==='left'?(o?.same?'left':'right'):(o?.same?'right':'left')];// cycleway tag on our left/right
  const anyBike=protectedBike||/Curbside|Buffered|Protected/.test(facility);
  // A bike lane between the curb and a painted buffer (protected or curbside-buffered): green where it is green.
  const bikePaint=(x0,x1)=>{const before=out.length;rect(A,B,(x0+x1)/2,(x1-x0)-.3,'g');const st=out[before];if(!st)return;const key=st[0]+','+st[1];const f=GREEN[key];if(f!=null&&f<.2)out.pop();stats.bike++;};
  if(bufL&&(anyBike||/track|lane/.test(cycSide('left')||''))){const x0=-Lw,x1=bufL[0];if(x1-x0>1.0)bikePaint(x0,x1);}
  if(bufR&&(anyBike||/track|lane/.test(cycSide('right')||''))){const x0=bufR[1],x1=Rw;if(x1-x0>1.0)bikePaint(x0,x1);}
  // The carriageway [lo, hi]: parking, conventional bike lane, bus lane, travel lanes.
  let parkL=0,parkR=0,np=s.park||0;if(np>=2){parkL=parkR=1;}else if(np===1){if(bufL)parkL=1;else if(bufR)parkR=1;else{const pl=tg['parking:left']||tg['parking:lane:left'],pr=tg['parking:right']||tg['parking:lane:right'];if(o&&/no/.test((o.same?pl:pr)||''))parkR=1;else if(o&&/no/.test((o.same?pr:pl)||''))parkL=1;else parkR=1;}}
  let x0=lo+parkL*2.4,x1=hi-parkR*2.4;
  const laneLine=(x)=>rect(A,B,x,.15,'w');
  if(conventional&&!bufL&&!bufR&&!protectedBike){const sideL=/lane/.test(cycSide('left')||''),sideR=/lane/.test(cycSide('right')||'');const sd=sideL&&!sideR?'L':sideR?'R':(s.dir==='TW'?null:'R');
   const curbside=/Curbside/.test(facility);
   if(sd&&x1-x0>5.5){// curbside lanes run along the curb with parking outside them; conventional ones between parking and traffic
    if(curbside){if(sd==='L'){if(parkL){x0-=2.4;}bikePaint(x0,x0+1.5);laneLine(x0+1.5);x0+=1.5;if(parkL)x0+=2.4;}else{if(parkR){x1+=2.4;}bikePaint(x1-1.5,x1);laneLine(x1-1.5);x1-=1.5;if(parkR)x1-=2.4;}}
    else if(sd==='L'){laneLine(x0);bikePaint(x0,x0+1.5);laneLine(x0+1.5);x0+=1.5;}else{laneLine(x1);bikePaint(x1-1.5,x1);laneLine(x1-1.5);x1-=1.5;}}}
  if(busRows.length&&x1-x0>6){const typ=busRows[0].lane_type||'';const w=3.3;// NYC bus lanes: 11 ft
   rect(A,B,x1-w/2,w-.15,'r');laneLine(x1-w);x1-=w;stats.bus++;}
  const n=Math.max(1,Math.min(s.lanes||1,Math.floor((x1-x0)/2.7)));const lw=(x1-x0)/n;stats.lanes+=n;
  if(s.dir==='TW'&&n>=2){const k=Math.floor(n/2);for(let j=1;j<n;j++){const x=x0+lw*j;if(j===k){rect(A,B,x-.1,.1,'y');rect(A,B,x+.1,.1,'y');}else dashes(A,B,x,.1,'w');}}
  else if(s.dir==='TW'&&n===1&&x1-x0>5.5){const x=(x0+x1)/2;rect(A,B,x-.1,.1,'y');rect(A,B,x+.1,.1,'y');}
  else for(let j=1;j<n;j++)dashes(A,B,x0+lw*j,.1,'w');
  // Stop lines at signals and stop signs, across the lanes that approach the intersection (traffic towards B
  // for 'FT', towards A for 'TF'; both for two-way). 0.6 m wide (NYC's 24 in), just behind the crosswalk.
  const stopAt=(end,toward)=>{const node=end==='B'?ib:ia;if(node==null||(deg.get(node)||0)<3)return;const np2=S.nodes[node];const sig=near(signals,np2,22),stp=near(stops,np2,30);if(!sig&&!stp)return;
   const P0=end==='B'?B:A,d=end==='B'?1:-1;const lineA=[P0[0]+ux*d*.3,P0[1]+un*d*.3],lineB=[P0[0]-ux*d*.3,P0[1]-un*d*.3];
   // Lanes towards this end are on the right of the direction of travel.
   let xa,xb;if(s.dir==='TW'){const mid=n>=2?x0+lw*Math.floor(n/2):(x0+x1)/2;[xa,xb]=end==='B'?[mid,hi]:[lo,mid];}else{[xa,xb]=[lo,hi];}
   const cx=(xa+xb)/2,w=xb-xa;if(w<2)return;const ex=ux,en=un;const c=[P0[0]+en*cx,P0[1]-ex*cx];out.push([q(c[0]),q(c[1]),.6,q(w),Math.round(Math.atan2(en,ex)*1000)/1000+0,C.w]);stats.stop++;};
  // A stripe of length .6 along the street and width w across it.
  if(i===pts.length-1&&(s.dir==='FT'||s.dir==='TW'))stopAt('B');if(i===1&&(s.dir==='TF'||s.dir==='TW'))stopAt('A');
 }}
// ---- Signal poles: at every intersection with an OSM traffic signal within 22 m, one pole on each corner, set
// 0.6 m back from the curb on the bisector between two neighbouring streets. Each pole carries, facing back along
// both of its streets, a vehicle signal (for traffic coming through the intersection towards it) and a
// pedestrian signal (for people crossing the other street towards it). Phase: the two axes alternate; every
// intersection gets its own offset in the cycle.
const poles=[];const hashN=k=>{const v=Math.sin(k*127.1+311.7)*43758.5453;return v-Math.floor(v);};
S.nodes.forEach((np,ni)=>{if((deg.get(ni)||0)<3||!near(signals,np,22))return;
 const dirs=[];for(const [a,b] of S.edges){if(a!==ni&&b!==ni)continue;const o=S.nodes[a===ni?b:a];dirs.push(Math.atan2(o[1]-np[1],o[0]-np[0]));}
 dirs.sort((x,y)=>x-y);const axis0=dirs[0];const off=Math.round(hashN(ni)*90);
 for(let k=0;k<dirs.length;k++){const a1=dirs[k],a2=k+1<dirs.length?dirs[k+1]:dirs[0]+2*Math.PI;if(a2-a1>Math.PI*1.25||a2-a1<.35)continue;const bis=(a1+a2)/2,d=[Math.cos(bis),Math.sin(bis)];
  const h=hits(curbG,np,d,30)[0];if(h==null)continue;const p=[np[0]+d[0]*(h+.6),np[1]+d[1]*(h+.6)];
  // Which axis a street belongs to: within 45 degrees of the first street's line, or not.
  const ax=a=>{const t=Math.abs(((a-axis0)%Math.PI+Math.PI)%Math.PI);return Math.min(t,Math.PI-t)<Math.PI/4?0:1;};
  poles.push([q(p[0]),q(p[1]),Math.round(a1*1000)/1000,Math.round(a2*1000)/1000,ax(a1),ax(a2),off]);}});
stats.poles=poles.length;
const header=`// Lane markings for every street in the study area, generated by tools/build-markings.mjs (${new Date().toISOString().slice(0,10)}).
// Sources: NYC Planimetric Database and Centerline (NYC Open Data), NYC DOT Bike Routes and Bus Lanes (NYC Open Data),
// OpenStreetMap (ODbL 1.0). Each stripe: [x, n, length, width, angle, colour 0 white 1 yellow 2 green 3 red].\n// Each signal pole: [x, n, street angle 1, street angle 2, axis of street 1, axis of street 2, cycle offset s].
`;
fs.writeFileSync(new URL('dist/campus/data/street-markings.js',root),header+'export default '+JSON.stringify({stats,stripes:out,poles})+';\n');
console.log(stats,out.length);
