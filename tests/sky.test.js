import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sunTimes,sunPosition,moonPosition,nyDate,nyOffset,nyParts,lookAt,skyAt,makeClock,KEYS} from '../dist/campus/atmosphere/sky.js';
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
// Minutes past midnight on New York's clock.
const wall=d=>{const p=nyParts(d);return p.hh*60+p.mm+p.ss/60;};
const hm=s=>{const [h,m]=s.split(':').map(Number);return h*60+m;};
const near=(got,want,tol,label)=>assert.ok(Math.abs(got-want)<=tol,`${label}: got ${(got/60|0)}:${String(Math.round(got%60)).padStart(2,'0')}, published ${(want/60|0)}:${String(Math.round(want%60)).padStart(2,'0')}`);
// Published New York City times (local clock, 24 h). Sources differ by a minute or so because each uses a
// slightly different point in the city, so the check allows three minutes.
//  sunrise-sunset.org/us/new-york-ny, October 2026 table (EDT)
//  solarwatch.app/en/sunrise-sunset/united-states/new-york-city (Nov 5 2026, EST; June/December milestones)
//  sunrisesunset.io/us/new-york/new-york-city/ (Oct 31 2026, earliest sunset Dec 7)
const PUBLISHED=[
 ['2026-06-10','05:25',null,'solarwatch: earliest sunrise'],
 ['2026-06-22',null,'20:32','solarwatch: latest sunset'],
 ['2026-10-06','06:57:45','18:29:47','sunrise-sunset.org'],
 ['2026-10-13','07:05:07','18:18:40','sunrise-sunset.org'],
 ['2026-10-31','07:25:14','17:53:24','sunrise-sunset.org, last day of EDT'],
 ['2026-11-05','06:32','16:49','solarwatch, EST after the clocks went back'],
 ['2026-12-07',null,'16:28','sunrisesunset.io: earliest sunset']];
test('sunrise and sunset match published New York times within three minutes, both sides of the November DST change',()=>{
 for(const [date,rise,set,src] of PUBLISHED){const [y,m,d]=date.split('-').map(Number),t=sunTimes(y,m,d);
  if(rise)near(wall(t.sunrise),hm(rise)+(+rise.split(':')[2]||0)/60,3,`${date} sunrise (${src})`);
  if(set)near(wall(t.sunset),hm(set)+(+set.split(':')[2]||0)/60,3,`${date} sunset (${src})`);}});
test('the shortest day is about 9 h 15 m (solarwatch: December 22)',()=>{const t=sunTimes(2026,12,22);near((t.sunset-t.sunrise)/60000,9*60+15,3,'day length');});
test('clocks jump an hour on the March DST change and the sun does not',()=>{
 assert.equal(nyOffset(nyDate(2026,3,7,12)),-300);assert.equal(nyOffset(nyDate(2026,3,8,12)),-240);
 assert.equal(nyOffset(nyDate(2026,10,31,12)),-240);assert.equal(nyOffset(nyDate(2026,11,1,12)),-300);
 const a=sunTimes(2026,3,7),b=sunTimes(2026,3,8);
 // On the clock, sunrise moves about an hour later overnight (an hour of DST less a minute and a half of spring).
 near(wall(b.sunrise)-wall(a.sunrise),58.5,1.5,'March 7 to 8 sunrise shift');near(wall(b.sunset)-wall(a.sunset),61,1.5,'March 7 to 8 sunset shift');
 // In absolute time the change is only the seasonal minute or two.
 near((b.sunrise-a.sunrise)/60000-1440,-1.5,1,'absolute sunrise shift');
 const c=sunTimes(2026,10,31),d=sunTimes(2026,11,1);near(wall(c.sunrise)-wall(d.sunrise),59,1.5,'Oct 31 to Nov 1 sunrise shift');});
test('New York wall time is independent of the computer clock\'s own time zone',()=>{
 const t=nyDate(2026,7,4,21,30);assert.equal(t.toISOString(),'2026-07-05T01:30:00.000Z');const p=nyParts(new Date('2026-01-15T17:00:00Z'));assert.deepEqual([p.hh,p.mm],[12,0]);});
test('at solar noon the sun is due south, so the Arch throws its shadow due north',()=>{
 // Search the day for the highest sun.
 let best=null;for(let m=11*60;m<14*60;m++){const s=sunPosition(nyDate(2026,10,7,0,m));if(!best||s.elevation>best.elevation)best=s;}
 assert.ok(Math.abs(best.azimuth-180)<1,'azimuth '+best.azimuth);near(best.elevation*60,(90-40.7308+best.declination)*60,6,'noon elevation (deg x60)');
 // Morning sun from the east-southeast, evening from the west-southwest in October.
 const am=sunPosition(nyDate(2026,10,7,9)),pm=sunPosition(nyDate(2026,10,7,16));assert.ok(am.azimuth>100&&am.azimuth<150);assert.ok(pm.azimuth>210&&pm.azimuth<260);});
test('moon phase and position: full on 25 Jan 2024, new and in front of the sun at the 8 Apr 2024 eclipse',()=>{
 assert.ok(moonPosition(new Date('2024-01-25T17:54Z')).illumination>.98);
 const e=new Date('2024-04-08T19:25Z'),m=moonPosition(e),s=sunPosition(e);assert.ok(m.illumination<.01);
 const r=Math.PI/180,sep=Math.acos(Math.sin(m.altitude*r)*Math.sin(s.elevation*r)+Math.cos(m.altitude*r)*Math.cos(s.elevation*r)*Math.cos((m.azimuth-s.azimuth)*r))/r;
 assert.ok(sep<2,'moon-sun separation '+sep.toFixed(2)+' deg (geocentric moon, no parallax)');});
test('lighting: night is exactly Dead of night, lamps come on through dusk, day is hazy with shadows',()=>{
 const n=lookAt(-20);assert.equal(n.bg,0x020305);assert.equal(n.fog,0x06080c);assert.equal(n.density,.026);assert.equal(n.hemi,.07);assert.equal(n.vignette,1);assert.equal(n.lamps,1);assert.equal(n.cards,1);
 assert.equal(lookAt(10).lamps,0);assert.ok(lookAt(-1).lamps>.2&&lookAt(-1).lamps<.9,'lamps half on at sunset');
 const day=lookAt(40);assert.ok(day.density>0&&day.density<n.density/3,'thinner fog by day');assert.ok(day.desat>.25,'washed-out grade');
 // Values change continuously with the sun: no step bigger than a small fraction between 0.1 degree samples.
 for(let e=-25;e<60;e+=.1){const a=lookAt(e),b=lookAt(e+.1);for(const k of ['sun','hemi','density','lamps','cards','exposure'])assert.ok(Math.abs(a[k]-b[k])<=.05*Math.max(1,Math.abs(a[k])),`${k} jumps at ${e.toFixed(1)}`);}
 assert.ok(KEYS.every((k,i)=>!i||k.e>KEYS[i-1].e));
 const noon=skyAt(nyDate(2026,6,21,13)),midnight=skyAt(nyDate(2026,6,21,1));assert.ok(noon.shadows);assert.ok(!midnight.shadows);});
test('URL preview: ?time and ?date pick a New York moment and hold it; ?speed runs a time-lapse',()=>{
 let fake=Date.UTC(2026,0,1,12);const now=()=>new Date(fake);
 const c=makeClock('?date=2026-12-21&time=19:30',now);assert.ok(c.preview);const p=nyParts(c.now());assert.deepEqual([p.y,p.m,p.d,p.hh,p.mm],[2026,12,21,19,30]);
 fake+=60000;assert.equal(nyParts(c.now()).mm,30,'held still');
 const l=makeClock('?date=2026-03-08&time=01:30&speed=60',now);fake+=60000;const q=nyParts(l.now());assert.deepEqual([q.hh,q.mm],[3,30],'an hour later on the clock is 03:30 after spring-forward');
 assert.equal(makeClock('',now).preview,false);});
test('the Dead of night preset in the renderer uses the same values as the real-time night',()=>{const src=readFileSync(new URL('../dist/renderer3d.js',import.meta.url),'utf8');const line=src.slice(src.indexOf("if(preset==='night')"));const n=KEYS[0];
 const hex=v=>'0x'+v.toString(16).padStart(6,'0');for(const frag of [`background.set(${hex(n.bg)})`,`fog.color.set(${hex(n.fog)})`,`fog.density=${String(n.density).replace(/^0/,'')}`,`sun.intensity=${String(n.sun).replace(/^0/,'')}`,`hemi.intensity=${String(n.hemi).replace(/^0/,'')}`])assert.ok(line.slice(0,900).includes(frag),'renderer night has '+frag);});
console.log(`${passed} sky tests passed`);
