// Builds dist/campus/data/campus-data.js from the raw open-data extracts in RESEARCH/data/raw.
// Usage: node tools/build-campus-data.mjs
// Inputs (see RESEARCH/data/SOURCES.md for queries, dates and licences):
//   nightview-osm-washington-square.json   OpenStreetMap via Overpass API (ODbL 1.0)
//   nightview-nyc-footprints.json          NYC Building Footprints, 5zhs-2jue (NYC Open Data)
//   nightview-nyc-pluto.json               MapPLUTO / PLUTO, 64uk-42ks (NYC Open Data)
//   nightview-nyc-planimetrics.json        NYC Planimetric Database layers, Centerline, Forestry Tree Points etc.
import fs from 'node:fs';
import {makeProjection} from '../dist/campus/projection.js';
const root=new URL('../',import.meta.url),raw=f=>JSON.parse(fs.readFileSync(new URL('RESEARCH/data/raw/'+f,root)));
const osm=raw('nightview-osm-washington-square.json'),fp=raw('nightview-nyc-footprints.json'),pluto=raw('nightview-nyc-pluto.json'),plan=raw('nightview-nyc-planimetrics.json');
const els=osm.elements,nodes=new Map(els.filter(e=>e.type==='node').map(e=>[e.id,e])),ways=new Map(els.filter(e=>e.type==='way').map(e=>[e.id,e]));
// Origin: centroid of the four corners of OSM way 248166269 (Washington Square Arch).
const arch=ways.get(248166269),archPts=arch.nodes.slice(0,-1).map(id=>nodes.get(id));
const origin={lat:archPts.reduce((a,n)=>a+n.lat,0)/archPts.length,lon:archPts.reduce((a,n)=>a+n.lon,0)/archPts.length};
const P=makeProjection(origin),q=v=>Math.round(v*100)/100,pt=(lon,lat)=>P.toLocal(lat,lon).map(q);
const [minX,minN]=P.toLocal(40.7228,-74.0030),[maxX,maxN]=P.toLocal(40.7392,-73.9860);const bounds={minX:q(minX),maxX:q(maxX),minN:q(minN),maxN:q(maxN)};
const inside=([x,n],m=0)=>x>=bounds.minX-m&&x<=bounds.maxX+m&&n>=bounds.minN-m&&n<=bounds.maxN+m;
function dp(points,eps){if(points.length<3)return points;const [a,b]=[points[0],points.at(-1)];let best=0,idx=0;for(let i=1;i<points.length-1;i++){const p=points[i],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1e-9,d=Math.abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/L;if(d>best){best=d;idx=i;}}if(best<=eps)return [a,b];return dp(points.slice(0,idx+1),eps).slice(0,-1).concat(dp(points.slice(idx),eps));}
const ring=(coords,eps=.12)=>{let r=coords.map(([lon,lat])=>pt(lon,lat));if(r.length>1&&r[0][0]===r.at(-1)[0]&&r[0][1]===r.at(-1)[1])r=r.slice(0,-1);if(r.length>6){let far=0,fd=0;r.forEach((p,i)=>{const d=Math.hypot(p[0]-r[0][0],p[1]-r[0][1]);if(d>fd){fd=d;far=i;}});r=dp(r.slice(0,far+1),eps).slice(0,-1).concat(dp([...r.slice(far),r[0]],eps).slice(0,-1));}return r;};
const line=(coords,eps=.15)=>dp(coords.map(([lon,lat])=>pt(lon,lat)),eps);
const polys=g=>{if(!g)return [];const geo=typeof g==='string'?JSON.parse(g):g;return geo.type==='Polygon'?[geo.coordinates]:geo.type==='MultiPolygon'?geo.coordinates:[];};
const lines=g=>{const geo=typeof g==='string'?JSON.parse(g):g;return geo.type==='LineString'?[geo.coordinates]:geo.type==='MultiLineString'?geo.coordinates:[];};
const area=r=>{let a=0;for(let i=0;i<r.length;i++){const p=r[i],n=r[(i+1)%r.length];a+=p[0]*n[1]-n[0]*p[1];}return a/2;};
const pip=(p,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const wayPts=w=>w.nodes.map(id=>nodes.get(id)).filter(Boolean).map(n=>pt(n.lon,n.lat));
const closed=w=>w.nodes.length>3&&w.nodes[0]===w.nodes.at(-1);
const ft=v=>Number(v)*.3048;
// ---- Street labels in NYC street-sign style.
const special={'LA GUARDIA PL':'LaGuardia Pl','MAC DOUGAL ST':'MacDougal St','MAC DOUGAL ALY':'MacDougal Alley','AVE OF THE AMERICAS':'6 Av · Av of the Americas','WASHINGTON MEWS':'Washington Mews','W  BROADWAY':'W Broadway','7 AVE S':'7 Av S'};
const label=s=>special[s]||s.replace(/\s+/g,' ').split(' ').map(w=>/^\d/.test(w)?w:w==='AVE'?'Av':w==='ST'?'St':w==='PL'?'Pl':w==='SQ'?'Sq':w==='ALY'?'Alley':w==='E'||w==='W'||w==='N'||w==='S'?w:w[0]+w.slice(1).toLowerCase()).join(' ');
// ---- Street centerlines and graph (NYC LION-derived Centerline, rw_type 1 = street).
const streetNames=[],streetIndex=new Map(),segments=[],gnodes=[],gkey=new Map(),edges=[];
const node=p=>{const k=Math.round(p[0]*2)+','+Math.round(p[1]*2);if(!gkey.has(k)){gkey.set(k,gnodes.length);gnodes.push(p);}return gkey.get(k);};
for(const r of plan.centerline){if(r.rw_type!=='1')continue;const name=label(r.full_street_name||r.stname_label||'');if(!streetIndex.has(name)){streetIndex.set(name,streetNames.length);streetNames.push(name);}
 for(const c of lines(r.the_geom)){const pts=line(c);if(!pts.some(p=>inside(p,60)))continue;const s={street:streetIndex.get(name),width:q(ft(r.streetwidth||30)),lanes:+r.number_travel_lanes||1,park:+r.number_park_lanes||0,dir:r.trafdir,bike:r.bike_lane||null,id:+r.physicalid,pts};segments.push(s);const a=node(pts[0]),b=node(pts.at(-1));let len=0;for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);edges.push([a,b,segments.length-1,q(len)]);}}
// ---- Planimetric surfaces.
const surf=(rows,eps=.15)=>rows.flatMap(r=>polys(r.the_geom).map(p=>p.map(c=>ring(c,eps)))).filter(p=>p[0].length>=3&&p[0].some(v=>inside(v,40)));
const roadbed=surf(plan.roadbed),sidewalk=surf(plan.sidewalk),median=surf(plan.median),plazas=surf(plan.plazas);
// ---- Buildings: NYC footprints joined to PLUTO by BBL and to OSM names by centroid containment.
const plutoBy=new Map(pluto.map(r=>[String(r.bbl).slice(0,10),r]));
const buildings=[];
for(const f of fp){const bbl=String(f.mappluto_bbl||f.base_bbl||'').slice(0,10),pl=plutoBy.get(bbl);for(const p of polys(f.the_geom)){const rings=p.map(c=>ring(c,.1));if(rings[0].length<3||!rings[0].some(v=>inside(v,30)))continue;if(area(rings[0])<0)rings[0].reverse();
 buildings.push({bin:+f.bin,bbl,h:q(ft(f.height_roof||0)),ge:q(ft(f.ground_elevation||0)),yr:+f.construction_year||null,addr:pl?.address||null,owner:pl?.ownername||null,floors:pl?.numfloors?Math.round(+pl.numfloors*10)/10:null,landmark:pl?.landmark||null,district:pl?.histdist||null,cls:pl?.bldgclass||null,rings,name:null,osm:null});}}
const osmBuildings=els.filter(e=>e.type==='way'&&e.tags?.building&&closed(e));
for(const w of osmBuildings){const r=wayPts(w).slice(0,-1);const c=[r.reduce((a,p)=>a+p[0],0)/r.length,r.reduce((a,p)=>a+p[1],0)/r.length];const b=buildings.find(b=>pip(c,b.rings[0]));if(!b)continue;const t=w.tags;if(t.name){(b.names||(b.names=[])).push(t.name);if(!b.name||t.building==='university')b.name=t.name;}b.osm=b.osm&&!t.name?b.osm:{id:w.id,building:t.building,operator:t.operator||null,height:t.height?+t.height:null,levels:t['building:levels']?+t['building:levels']:null,architect:t.architect||null,start:t.start_date||null,wikidata:t.wikidata||null};}
for(const b of buildings){b.nyu=/NEW YORK UNIV|^NY UNIVERSITY/.test(b.owner||'')||b.osm?.building==='university'&&/NYU|New York University/i.test((b.name||'')+(b.osm.operator||''))||/NYU/i.test(b.osm?.operator||'');}
// ---- OSM areas, barriers, furniture.
const areaKinds=t=>t.amenity==='fountain'||t.natural==='water'?'fountain':t.leisure==='playground'?'playground':t.leisure==='dog_park'?'dogrun':t.leisure==='pitch'?'pitch':t.landuse==='grass'||t.leisure==='garden'?'grass':t.leisure==='park'?'park':t.highway==='pedestrian'&&t.area==='yes'?'plaza':t.man_made==='courtyard'?'courtyard':null;
const areas=[];for(const w of ways.values()){if(!w.tags||!closed(w))continue;const kind=areaKinds(w.tags);if(!kind)continue;const r=wayPts(w).slice(0,-1);if(!r.some(v=>inside(v,20)))continue;areas.push({kind,name:w.tags.name||null,surface:w.tags.surface||null,id:w.id,ring:r});}
const gates=new Set(els.filter(e=>e.type==='node'&&e.tags?.barrier&&/gate|entrance|bollard/.test(e.tags.barrier)).map(e=>e.id));
const barriers=[];for(const w of ways.values()){const b=w.tags?.barrier;if(!b||!/fence|wall|railing|hedge/.test(b))continue;if(w.tags.indoor)continue;const pts=[];let run=[];for(const id of w.nodes){const n=nodes.get(id);if(!n)continue;if(gates.has(id)){if(run.length>1)pts.push(run);run=[];continue;}run.push(pt(n.lon,n.lat));}if(run.length>1)pts.push(run);for(const r of pts)if(r.some(v=>inside(v,10)))barriers.push({kind:b,name:w.tags.name||null,height:w.tags.height?+w.tags.height:null,id:w.id,pts:r});}
const paths=[];for(const w of ways.values()){const t=w.tags;if(!t?.highway||!/footway|pedestrian|path|steps|cycleway|living_street|service/.test(t.highway))continue;if(t.footway==='sidewalk')continue;const p=wayPts(w);if(!p.some(v=>inside(v,10)))continue;paths.push({kind:t.highway,sub:t.footway||t.service||null,surface:t.surface||null,name:t.name||null,id:w.id,width:t.width?+t.width:null,area:t.area==='yes',pts:p});}
const pointsOf=(test)=>els.filter(e=>e.type==='node'&&e.tags&&test(e.tags)).map(e=>({id:e.id,p:pt(e.lon,e.lat),t:e.tags})).filter(o=>inside(o.p,5));
const lamps=pointsOf(t=>t.highway==='street_lamp').map(o=>({p:o.p,mount:o.t.lamp_mount||null,support:o.t.support||null}));
const benches=pointsOf(t=>t.amenity==='bench').map(o=>({p:o.p,backrest:o.t.backrest||null}));
const benchLines=[...ways.values()].filter(w=>w.tags?.amenity==='bench').map(w=>wayPts(w));
const monuments=pointsOf(t=>t.historic||t.tourism==='artwork'||t.man_made==='flagpole'||t.memorial).map(o=>({p:o.p,name:o.t.name||null,kind:o.t.historic||o.t.tourism||o.t.man_made||'memorial',artist:o.t.artist_name||null,date:o.t.start_date||null,wikidata:o.t.wikidata||null,id:o.id}));
const misc=pointsOf(t=>['drinking_water','bicycle_rental','waste_basket','post_box','bicycle_parking'].includes(t.amenity)||t.highway==='bus_stop'||t.highway==='traffic_signals'||t.man_made==='surveillance').map(o=>({p:o.p,kind:o.t.amenity||o.t.highway||o.t.man_made,name:o.t.name||null}));
const crossings=[...ways.values()].filter(w=>w.tags?.footway==='crossing').map(w=>({pts:wayPts(w),marking:w.tags['crossing:markings']||w.tags.crossing||null})).filter(c=>c.pts.some(v=>inside(v,5)));
// ---- Trees: NYC Parks Forestry Tree Points (living "Full" structures) + OSM trees not already present.
const trees=[];for(const r of plan.forestry_trees){if(r.tpstructure!=='Full')continue;const m=/POINT\(([-\d.]+) ([-\d.]+)\)/.exec(r.geometry||'');if(!m)continue;const p=pt(+m[1],+m[2]);if(!inside(p,5))continue;trees.push({p,dbh:+r.dbh||6,sp:(r.genusspecies||'').split(' - ').at(-1)||null,src:'forestry'});}
for(const o of pointsOf(t=>t.natural==='tree')){if(trees.some(t=>Math.hypot(t.p[0]-o.p[0],t.p[1]-o.p[1])<2.5))continue;trees.push({p:o.p,dbh:o.t.circumference?+o.t.circumference/.0254/Math.PI:14,sp:o.t['species:en']||o.t.species||o.t.genus||null,src:'osm',name:o.t.name||null,height:o.t.height?+o.t.height:null});}
const hangman=trees.find(t=>t.name==="Hangman's Elm");if(hangman){hangman.dbh=56;hangman.landmark=true;}
const hydrants=plan.hydrants.map(r=>pt(+r.longitude,+r.latitude)).filter(p=>inside(p,2));
const shelters=plan.shelters.map(r=>({p:pt(+r.longitude,+r.latitude),on:r.on_street,cross:r.cross_stre,corner:r.corner})).filter(s=>inside(s.p,2));
// Arch: NYC footprints include the Arch as a structure; take it out of the building set and keep its outline.
const archIdx=buildings.findIndex(b=>pip([0,0],b.rings[0]));const archFootprint=archIdx>=0?buildings.splice(archIdx,1)[0]:null;
// OSM gives the overall plan rectangle; the opening is 30 ft (9.14 m) wide (LPC / NYC Parks).
const archRing=wayPts(arch).slice(0,-1);
const out={meta:{generated:new Date().toISOString().slice(0,10),origin,metresPerDegree:P.m,units:'metres; points are [east, north] from the centre of the Washington Square Arch',bounds,
 sources:[{name:'OpenStreetMap contributors',url:'https://www.openstreetmap.org/copyright',licence:'ODbL 1.0',retrieved:osm.osm3s?.timestamp_osm_base},{name:'NYC Open Data: Building Footprints (5zhs-2jue)',url:'https://data.cityofnewyork.us/d/5zhs-2jue',licence:'NYC Open Data Terms of Use'},{name:'NYC Open Data: PLUTO (64uk-42ks)',url:'https://data.cityofnewyork.us/d/64uk-42ks',licence:'NYC Open Data Terms of Use'},...Object.entries(plan._meta.datasets).map(([k,v])=>({name:'NYC Open Data: '+k+' ('+v.id+')',url:'https://data.cityofnewyork.us/d/'+v.id,licence:'NYC Open Data Terms of Use'}))]},
 streets:{names:streetNames,segments,nodes:gnodes,edges},roadbed,sidewalk,median,plazas,buildings,areas,barriers,paths,crossings,trees,lamps,benches,benchLines,monuments,misc,hydrants,shelters,arch:{ring:archFootprint&&archFootprint.rings[0].length===4?archFootprint.rings[0]:archRing,osmRing:archRing,footprint:archFootprint&&{bin:archFootprint.bin,h:archFootprint.h,ring:archFootprint.rings[0]},openingWidth:9.14,height:23.47}};
const js='// Generated by tools/build-campus-data.mjs. Do not edit by hand.\n// Contains data © OpenStreetMap contributors (ODbL 1.0) and NYC Open Data. See CAMPUS.md and credits.html.\nexport default '+JSON.stringify(out)+';\n';
fs.writeFileSync(new URL('dist/campus/data/campus-data.js',root),js);
console.log('origin',origin,'bounds',bounds);
console.log({streets:streetNames.length,segments:segments.length,nodes:gnodes.length,roadbed:roadbed.length,sidewalk:sidewalk.length,median:median.length,buildings:buildings.length,nyu:buildings.filter(b=>b.nyu).length,named:buildings.filter(b=>b.name).length,areas:areas.length,barriers:barriers.length,paths:paths.length,trees:trees.length,lamps:lamps.length,benches:benches.length,monuments:monuments.length,bytes:js.length});
