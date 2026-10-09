import assert from 'node:assert/strict';
import fs from 'node:fs';
import data from '../dist/campus/data/campus-data.js';
import {pointInRing} from '../dist/campus/geometry.js';
import {chessLayout,lampLayout,fountainProfile,PLAZA_RADIUS} from '../dist/campus/park.js';
import {SIGNAGE,LIVERY,BRANDING} from '../dist/assets/signage/manifest.js';
import {migrateStorage} from '../dist/storage.js';
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok - '+name);};
const park=data.areas.find(a=>a.kind==='park'&&pointInRing([-30,-46],a.ring)).ring,fountain=data.areas.find(a=>a.kind==='fountain'&&pointInRing(a.ring[0],park));
const fc=fountain.ring.reduce((s,p)=>[s[0]+p[0]/fountain.ring.length,s[1]+p[1]/fountain.ring.length],[0,0]);
test('thirteen chess tables, all in the park, on paving, clear of trees and of each other',()=>{const T=chessLayout();assert.equal(T.length,13);
 for(const t of T){assert.ok(pointInRing(t.p,park));assert.ok(!data.areas.some(a=>a.kind==='grass'&&pointInRing(t.p,a.ring)),'on a lawn '+t.p);assert.ok(!data.trees.some(x=>Math.hypot(x.p[0]-t.p[0],x.p[1]-t.p[1])<1.2),'tree at '+t.p);}
 for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++)assert.ok(Math.hypot(T[i].p[0]-T[j].p[0],T[i].p[1]-T[j].p[1])>2.5);});
test('every lamp gets a kind: globe clusters round the fountain plaza, lanterns on the paths, poles on the streets',()=>{const L=lampLayout(data,park,fc),n=k=>L.filter(l=>l.kind===k).length;
 assert.equal(L.length,data.lamps.length);assert.equal(n('plaza'),16);assert.equal(n('park')+n('plaza'),132);for(const l of L){if(l.kind==='plaza')assert.ok(Math.hypot(l.p[0]-fc[0],l.p[1]-fc[1])<PLAZA_RADIUS);if(l.kind==='street')assert.ok(Math.abs(Math.hypot(...l.dir)-1)<1e-6);}});
test('the fountain profile rises to a coping and steps down inside to the basin floor',()=>{const P=fountainProfile(11.7),top=Math.max(...P.map(p=>p[1]));assert.ok(top>.55&&top<.7);assert.ok(P[0][1]<.1);for(const p of P)assert.ok(p[0]>=0);});
test('signage manifest: every decal has its own PNG, a size, a source note and placed copies; no logo artwork',()=>{const ids=new Set();
 for(const s of SIGNAGE){assert.ok(!ids.has(s.id),'id twice '+s.id);ids.add(s.id);assert.match(s.file,/^assets\/signage\/[a-z0-9-]+\.png$/);assert.ok(fs.existsSync(new URL('../dist/'+s.file,import.meta.url)),s.file+' exists');
  assert.ok(s.size.length===2&&s.size.every(v=>v>0&&v<20));assert.ok(s.seen&&s.seen.length>10,s.id+' seen');assert.ok(s.placements.length>0);
  for(const p of s.placements){assert.ok(p.where&&Number.isFinite(p.y)&&Math.abs(Math.hypot(...p.normal)-1)<.01,s.id+' placement');}
  assert.ok(!/torch|logo/i.test(JSON.stringify(s.lines||[])),'no logo text');}});
test('nothing in the signage names or sits on the Brown Building or the Triangle Fire memorial',()=>{const brown=data.buildings.find(b=>b.bin===1008823);
 for(const s of SIGNAGE){assert.ok(!/brown building|triangle/i.test(s.id+' '+(s.lines||[]).join(' ')));for(const p of s.placements)assert.ok(!pointInRing(p.p,brown.rings[0])&&Math.min(...brown.rings[0].map(q=>Math.hypot(q[0]-p.p[0],q[1]-p.p[1])))>3,s.id+' near Brown');}});
test('car livery: every part is its own decal with a PNG, a size, a source note and placements on the car; plain lettering only',()=>{const ids=new Set(SIGNAGE.map(s=>s.id));
 for(const s of LIVERY){assert.ok(!ids.has(s.id));ids.add(s.id);assert.equal(s.kind,'livery');assert.match(s.file,/^assets\/signage\/livery-[a-z0-9-]+\.png$/);assert.ok(fs.existsSync(new URL('../dist/'+s.file,import.meta.url)),s.file);
  assert.ok(s.size[0]>0&&s.size[1]>0&&s.seen&&typeof s.draw==='function'&&s.placements.length);for(const p of s.placements)assert.ok(['right','left','rear','rear-window'].includes(p.side));assert.ok(!/torch|logo|badge\.png/i.test(s.file));}
 for(const part of ['band','campus-safety','phone','nyu','unit-4','electric','tailgate-strip'])assert.ok(LIVERY.some(s=>s.id.includes(part)),part);});
test('branding slot: the NYU torch is an optional file Avi supplies, listed in the manifest and placed on the title card, never drawn',()=>{const t=BRANDING.find(b=>b.id==='nyu-torch');assert.ok(t&&t.optional&&t.file==='assets/branding/nyu-torch.png');
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(html.includes('src="assets/branding/nyu-torch.png"')&&html.includes('onerror="this.remove()"'));});
test('saved settings move from the old nightview keys to commencement keys without losing newer values',()=>{const m=new Map([['nightview.fps','on'],['nightview.shifted','1'],['commencement.shifted','2'],['other','x']]);
 const ls={get length(){return m.size},key:i=>[...m.keys()][i],getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};
 assert.equal(migrateStorage(ls),2);assert.equal(m.get('commencement.fps'),'on');assert.equal(m.get('commencement.shifted'),'2');assert.ok(!m.has('nightview.fps')&&!m.has('nightview.shifted'));assert.equal(m.get('other'),'x');});
console.log(`park: ${passed} passed`);
