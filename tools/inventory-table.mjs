// Generates RESEARCH/data/nyu-buildings.json and a markdown table of measured data for the inventory.
import fs from 'node:fs';
import data from '../dist/campus/data/campus-data.js';
const pluto=JSON.parse(fs.readFileSync(new URL('../RESEARCH/data/raw/nightview-nyc-pluto.json',import.meta.url)));
const area=r=>{let a=0;for(let i=0;i<r.length;i++){const p=r[i],n=r[(i+1)%r.length];a+=p[0]*n[1]-n[0]*p[1];}return Math.abs(a/2);};
const byBbl=new Map();for(const b of data.buildings){if(!byBbl.has(b.bbl))byBbl.set(b.bbl,[]);byBbl.get(b.bbl).push(b);}
// Targets: [label, regex on PLUTO address, optional block]
const T=JSON.parse(fs.readFileSync(new URL('../RESEARCH/data/inventory-targets.json',import.meta.url)));
const rows=[];for(const t of T){const re=new RegExp(t.match,'i');const lots=pluto.filter(r=>re.test(r.address||'')&&(!t.block||r.block===String(t.block)));
 if(!lots.length){rows.push({label:t.label,note:'NO PLUTO MATCH for '+t.match});continue;}
 for(const lot of lots){const bbl=String(lot.bbl).slice(0,10),fps=byBbl.get(bbl)||[];const h=Math.max(0,...fps.map(f=>f.h)),fa=fps.reduce((s,f)=>s+area(f.rings[0]),0),c=fps.length?fps[0].rings[0].reduce((s,p,i,r)=>[s[0]+p[0]/r.length,s[1]+p[1]/r.length],[0,0]):null;
  rows.push({label:t.label,address:lot.address,block:lot.block,lot:lot.lot,bbl,owner:lot.ownername,floors:lot.numfloors?+lot.numfloors:null,yearBuilt:+lot.yearbuilt||null,yearAlter:[lot.yearalter1,lot.yearalter2].filter(y=>y&&y!=='0').join('/')||null,bldgClass:lot.bldgclass,landmark:lot.landmark||null,histDist:lot.histdist||null,bins:fps.map(f=>f.bin),roofHeightM:fps.length?+h.toFixed(1):null,roofHeightFt:fps.length?Math.round(h/.3048):null,partHeightsM:fps.length>1?fps.map(f=>+f.h.toFixed(1)):undefined,footprintM2:Math.round(fa),centroid:c&&c.map(v=>Math.round(v)),osmNames:[...new Set(fps.flatMap(f=>f.names||[]))]});}}
fs.writeFileSync(new URL('../RESEARCH/data/nyu-buildings.json',import.meta.url),JSON.stringify(rows,null,1));
const md=['| Building | PLUTO address | Block/Lot | Owner (PLUTO) | Floors | Roof ht (m / ft) | Parts (m) | Footprint m² | Built / altered | Map x,n (m) | Landmark / district |','|---|---|---|---|---|---|---|---|---|---|---|'];
for(const r of rows){if(r.note){md.push(`| ${r.label} | ${r.note} |||||||||||`);continue;}md.push(`| ${r.label} | ${r.address} | ${r.block}/${r.lot} | ${r.owner} | ${r.floors??'?'} | ${r.roofHeightM??'?'} / ${r.roofHeightFt??'?'} | ${r.partHeightsM?r.partHeightsM.join(', '):''} | ${r.footprintM2} | ${r.yearBuilt??''}${r.yearAlter?' / '+r.yearAlter:''} | ${r.centroid?r.centroid.join(', '):''} | ${[r.landmark,r.histDist].filter(Boolean).join('; ')} |`);}
fs.writeFileSync(new URL('../RESEARCH/data/nyu-buildings-table.md',import.meta.url),md.join('\n')+'\n');console.log(md.join('\n'));
