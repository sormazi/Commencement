import assert from 'node:assert/strict';
import {fromCode,describe,Weather,MANUAL,fetchOpenMeteo} from '../dist/campus/atmosphere/weather.js';
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++;};
// WMO codes
ok(fromCode(0).cloud<.1,'clear');ok(fromCode(3).cloud>.9,'overcast');ok(fromCode(45).fog>.5,'fog');
ok(fromCode(65).rain>.9&&fromCode(61).rain<.5,'rain intensities');ok(fromCode(75).snow>.9,'heavy snow');ok(fromCode(95).storm===1,'thunderstorm');
// Manual choice and the URL override
const w=new Weather({search:'?weather=snow',fetchers:[]});ok(w.choice==='snow'&&w.urlChoice==='snow','url override');
for(let i=0;i<600;i++)w.update(.5);ok(Math.abs(w.cur.snow-MANUAL.snow.snow)<.02,'glides to the manual sky');ok(/snow/.test(describe(w.cur)),'described');
// Live with both sources failing: silent overcast, a retry is scheduled, nothing throws
let t=0;const failing=async()=>{throw new Error('offline');};
const lw=new Weather({search:'',fetchers:[failing,failing],now:()=>t});lw.update(.016);await new Promise(r=>setTimeout(r,0));await new Promise(r=>setTimeout(r,0));
ok(lw.failed&&!lw.source,'both sources failed');ok(lw.cur.cloud>.6&&lw.cur.rain===0,'overcast fallback');ok(lw.nextAt>t,'retry scheduled');
// Fallback order: the second source is used when the first fails
const second=async()=>({state:{...MANUAL.rain},source:'National Weather Service'});
const fw=new Weather({search:'',fetchers:[failing,second],now:()=>t});fw.update(.016);await new Promise(r=>setTimeout(r,0));await new Promise(r=>setTimeout(r,0));await new Promise(r=>setTimeout(r,0));
ok(fw.source==='National Weather Service'&&fw.target.rain>.3,'falls back to NWS');
// Open-Meteo parsing (fetch stubbed with a sample reply)
globalThis.fetch=async()=>({ok:true,json:async()=>({current:{temperature_2m:-3,precipitation:.4,rain:0,snowfall:.5,weather_code:73,cloud_cover:100,wind_speed_10m:6,wind_direction_10m:300,visibility:2000},hourly:{precipitation:[0,0,.2,.3,.4,.4,.4],snowfall:[0,0,.1,.2,.3,.3,.3],snow_depth:[0,0,0,.01,.02,.03,.03]}})});
const r=await fetchOpenMeteo();ok(r.state.snow>.5&&r.state.rain===0,'snow from code 73');ok(r.state.fog>.5,'low visibility reads as fog');ok(r.state.snowCover>.5,'snow depth covers the ground');ok(r.state.windFrom===300&&r.state.temp===-3,'wind and temperature');
// Lightning is never a strobe: flashes at least 7 s apart
const sw=new Weather({search:'?weather=storm',fetchers:[]});for(let i=0;i<200;i++)sw.update(.1);let starts=[],prev=0;for(let i=0;i<6000;i++){sw.update(.05);if(sw.flash>.5&&prev<=.5)starts.push(i*.05);prev=sw.flash;}
ok(starts.length>2,'storm flashes');ok(starts.every((s,i)=>!i||s-starts[i-1]>=6.9),'flashes at least 7 s apart');
sw.lightning='off';sw.update(.05);ok(sw.flash===0,'lightning off');
console.log(`weather: ${n} passed`);
