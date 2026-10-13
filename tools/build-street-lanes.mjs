// Builds dist/campus/data/street-lanes.js: painted bike lanes and red bus lanes on the roadway (roads survey (b)).
// Usage: node tools/build-street-lanes.mjs   (after tools/build-campus-data.mjs; needs its roadbed and origin)
// Inputs in RESEARCH/data/raw (git-ignored; see RESEARCH/data/SOURCES.md):
//   nightview-osm-washington-square.json  OSM cycleway:left/right tags give the side and kind of each bike lane
//   nightview-nyc-streets.json            NYC DOT Bus Lanes (ycrg-ses3): direction, curbside or offset, colour
// Each lane follows its street's centreline, offset to the real curb: rays across the street are traced through
// the NYC planimetric roadbed (campus-data roadbed) every 3 m, so the lane sits on the actual kerb line. Where the
// ray runs much further than the street's usual half-width the sample is inside an intersection (flag 1).
// Widths and insets are NYC DOT Street Design Manual typical values, not measured per street (see CAMPUS.md).
import fs from 'node:fs';
import {makeProjection} from '../dist/campus/projection.js';
import data from '../dist/campus/data/campus-data.js';
const root=new URL('../',import.meta.url),raw=f=>JSON.parse(fs.readFileSync(new URL('RESEARCH/data/raw/'+f,root)));
const osm=raw('nightview-osm-washington-square.json'),dot=raw('nightview-nyc-streets.json');
const P=makeProjection(data.meta.origin),q=v=>Math.round(v*100)/100,pt=(lon,lat)=>P.toLocal(lat,lon);
const B=data.meta.bounds,inside=([x,n])=>x>=B.minX&&x<=B.maxX&&n>=B.minN&&n<=B.maxN;
// Roadbed point-in-polygon with a 20 m grid.
const G=20,grid=new Map();
data.roadbed.forEach((poly,i)=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const [x,n] of poly[0]){a=Math.min(a,x);b=Math.min(b,n);c=Math.max(c,x);d=Math.max(d,n);}
 for(let gx=Math.floor(a/G);gx<=Math.floor(c/G);gx++)for(let gn=Math.floor(b/G);gn<=Math.floor(d/G);gn++){const k=gx+','+gn;(grid.get(k)||grid.set(k,[]).get(k)).push(i);}});
const pip=(p,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const onRoad=p=>(grid.get(Math.floor(p[0]/G)+','+Math.floor(p[1]/G))||[]).some(i=>{const poly=data.roadbed[i];return pip(p,poly[0])&&!poly.slice(1).some(h=>pip(p,h));});
// Distance from p along unit normal u to the curb: the end of the first run of roadbed (max 30 m), or null.
function curb(p,u){let d=0,started=false;for(;d<=30;d+=.2){const r=onRoad([p[0]+u[0]*d,p[1]+u[1]*d]);if(r)started=true;else if(started)return d-.1;}return null;}
// Resample a polyline every 3 m with the curb distance on one side (+1 left of the line's direction, -1 right).
function along(pts,side){const out=[];let next=0,run=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.01)continue;const t=[(b[0]-a[0])/L,(b[1]-a[1])/L],u=[-t[1]*side,t[0]*side];
 for(;next<=run+L;next+=3){const s=next-run,p=[a[0]+t[0]*s,a[1]+t[1]*s];out.push({p,u,c:curb(p,u)});}run+=L;}return out;}
const median=v=>{const s=v.filter(x=>x!=null).sort((a,b)=>a-b);return s.length?s[s.length>>1]:null;};
// Offset the samples to the lane centre (inset from the curb); samples in an intersection keep the typical curb.
function laneLine(samples,inset){const typ=median(samples.map(s=>s.c));if(typ==null)return null;
 return samples.map(s=>{const x=s.c==null||s.c>typ*1.5+2;const c=x?typ:s.c;return [q(s.p[0]+s.u[0]*(c-inset)),q(s.p[1]+s.u[1]*(c-inset)),x?1:0];}).filter(p=>inside(p));}
const lanes=[];
// ---- Bike lanes from OSM street ways.
const nodes=new Map(osm.elements.filter(e=>e.type==='node').map(e=>[e.id,e]));
const ROADS=/^(primary|secondary|tertiary|residential|unclassified|living_street|primary_link|secondary_link)$/;
for(const w of osm.elements){if(w.type!=='way'||!w.tags||!ROADS.test(w.tags.highway||''))continue;const t=w.tags;
 const pts=w.nodes.map(id=>nodes.get(id)).filter(Boolean).map(n=>pt(n.lon,n.lat));if(pts.length<2)continue;
 for(const [sideName,side] of [['left',1],['right',-1]]){const kind=t['cycleway:'+sideName]||t['cycleway:both']||(sideName==='right'&&t.cycleway!=='opposite'?t.cycleway:null);
  if(kind!=='lane'&&kind!=='track')continue;const k='cycleway:'+sideName+':';
  const buffered=t[k+'buffer']==='yes'||t['cycleway:both:buffer']==='yes',parking=t['parking:'+sideName]||t['parking:both']||t['parking:lane:'+sideName]||t['parking:lane:both'];
  // Protected (track): 1.8 m at the curb, parking floats outside it behind a 0.9 m buffer.
  // Painted (lane): 1.5 m outside a 2.4 m parking lane unless OSM says there is no parking on that side.
  const noParking=parking==='no'||/no_/.test(parking||''),style=kind==='track'?'protected':buffered?'buffered':'painted',w2=kind==='track'?1.8:1.5;
  const inset=kind==='track'?w2/2+.1:(noParking?0:2.4)+w2/2+.1;
  const line=laneLine(along(pts,side),inset);if(!line||line.length<2)continue;
  lanes.push({kind:'bike',style,side:-side,w:w2,buffer:kind==='track'||buffered?.9:0,street:t.name||'',osm:w.id,pts:line});}}
// ---- Bus lanes from NYC DOT (curbside at the curb, offset one parking lane out; 14 St busway lanes are offset).
const GRID=29*Math.PI/180,DIR={NB:[Math.sin(GRID),Math.cos(GRID)],SB:[-Math.sin(GRID),-Math.cos(GRID)],EB:[Math.cos(GRID),-Math.sin(GRID)],WB:[-Math.cos(GRID),Math.sin(GRID)]};
const seenBus=new Set();
for(const r of dot.bus_lanes){if(r.lane_color!=='Red'||!DIR[r.direction])continue;const g=r.the_geom,cs=g.type==='LineString'?[g.coordinates]:g.coordinates;
 for(const c of cs){const pts=c.map(([lon,lat])=>pt(lon,lat));if(!pts.some(inside))continue;const key=r.direction+pts[0].map(Math.round)+pts.at(-1).map(Math.round);if(seenBus.has(key))continue;seenBus.add(key);const d=[pts.at(-1)[0]-pts[0][0],pts.at(-1)[1]-pts[0][1]],v=DIR[r.direction];
  const side=d[0]*v[0]+d[1]*v[1]>0?-1:1;// buses keep right: right of travel
  const inset=(r.lane_type==='Curbside'?0:2.4)+3.3/2;const line=laneLine(along(pts,side),inset);if(!line||line.length<2)continue;
  lanes.push({kind:'bus',style:r.lane_type.toLowerCase(),side:-side,w:3.3,street:r.street,dir:r.direction,hours:r.hours,pts:line});}}
const js='// Generated by tools/build-street-lanes.mjs. Do not edit by hand.\n// Contains data © OpenStreetMap contributors (ODbL 1.0) and NYC Open Data (NYC DOT Bus Lanes). See CAMPUS.md.\n'
 +'// pts: [east, north, inIntersection] at the lane centre, every 3 m. w: lane width in metres. side: +1 if the street centre is to the left of the line direction.\nexport const STREET_LANES='+JSON.stringify(lanes)+';\n';
fs.writeFileSync(new URL('dist/campus/data/street-lanes.js',root),js);
const n=k=>lanes.filter(l=>l.kind===k).length;console.log('bike',n('bike'),'bus',n('bus'),'bytes',js.length);
for(const s of ['protected','buffered','painted'])console.log(s,lanes.filter(l=>l.style===s).length);
