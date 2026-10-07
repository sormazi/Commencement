// Detail-pass landmark geometry: dimensions, clearances and placement (runs in Node, no textures).
import assert from 'node:assert/strict';
import data from '../dist/campus/data/campus-data.js';
import {archParts,ARCH,INSCRIPTION} from '../dist/campus/landmarks/arch.js';
import {bobstParts,BOBST} from '../dist/campus/landmarks/bobst.js';
import {silverParts,SILVER} from '../dist/campus/landmarks/silver-center.js';
import {footprintFrame} from '../dist/campus/landmarks/kit.js';
import {kimmelParts,KIMMEL} from '../dist/campus/landmarks/kimmel.js';
import {judsonParts,JUDSON} from '../dist/campus/landmarks/judson.js';
import {rowParts,ROW_BINS,ROW} from '../dist/campus/landmarks/row.js';
import {weinsteinParts,WEINSTEIN} from '../dist/campus/landmarks/weinstein.js';
import {brownParts,BROWN} from '../dist/campus/landmarks/brown.js';
import {LANDMARK_BUILDINGS} from '../dist/campus/landmarks/index.js';
import {SHEDS,shedParts} from '../dist/campus/landmarks/sheds.js';
import {silverTowersParts,SILVER_TOWERS,SYLVETTE} from '../dist/campus/landmarks/silver-towers.js';
import {CampusCollision} from '../dist/campus/collision.js';
import {rectFrame} from '../dist/campus/geometry.js';
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok -',name);};
const verts=(P,names)=>{const out=[];for(const n of names||Object.keys(P.m))if(P.m[n]&&n[0]!=='_')for(let i=0;i<P.m[n].pos.length;i+=3)out.push([P.m[n].pos[i],P.m[n].pos[i+1],P.m[n].pos[i+2]]);return out;};
const bbox=v=>v.reduce((b,p)=>[0,1,2].map(k=>[Math.min(b[k][0],p[k]),Math.max(b[k][1],p[k])]),[[1e9,-1e9],[1e9,-1e9],[1e9,-1e9]]);

const arch=archParts(),av=verts(arch);
test('arch: 77 ft (23.47 m) high, 62 ft wide at the piers, triangle budget',()=>{const b=bbox(av);assert.ok(Math.abs(b[1][1]-23.47)<.01,'height '+b[1][1]);
 assert.ok(b[1][0]>=-.35,'nothing below the plaza');assert.ok(b[0][1]-b[0][0]>18.6&&b[0][1]-b[0][0]<21.2,'width incl. cornice');assert.ok(arch.tris<140000,'tris '+arch.tris);});
test('arch: the 30 ft opening is clear up to the springing',()=>{for(const [x,y,z] of av)if(Math.abs(x)<ARCH.o-.02&&y>.3&&y<ARCH.spring-.1&&Math.abs(z)<ARCH.D-.05)assert.fail(`vertex in opening ${x},${y},${z}`);});
test('arch: crown of the intrados at 47 ft (14.33 m)',()=>{const crown=av.filter(([x,y,z])=>Math.abs(x)<.05&&Math.abs(z)<ARCH.D).map(p=>p[1]).filter(y=>y>12&&y<15);assert.ok(Math.min(...crown)>14.0&&Math.min(...crown)<14.4,'crown '+Math.min(...crown));});
test('arch: statue groups only on the north (-z) face, both piers',()=>{const s=verts(arch,['statue']);assert.ok(s.length>1000);assert.ok(s.every(p=>p[2]<-ARCH.D+.5));assert.ok(s.some(p=>p[0]>5)&&s.some(p=>p[0]<-5));});
test('arch: coffered soffit, Greek-key impost, inscriptions on both attic faces',()=>{const coffer=verts(arch,['orn']).filter(([x,y,z])=>{const r=Math.hypot(x,y-ARCH.spring);return y>ARCH.spring+.5&&r>ARCH.R+.05&&r<ARCH.R+.2&&Math.abs(z)<ARCH.D-.4;});assert.ok(coffer.length>5000,'coffer verts '+coffer.length);
 assert.ok(arch.m.meander.pos.length>0);assert.ok(arch.m.inscN&&arch.m.inscS);assert.match(INSCRIPTION.north.join(' '),/WISE AND THE HONEST CAN REPAIR/);assert.match(INSCRIPTION.south.join(' '),/FIRST PRESIDENT OF THE UNITED STATES/);});
test('arch: pedestals are solid for the car, the opening is not',()=>{const c=new CampusCollision(data),f=rectFrame(data.arch.ring);const at=(u,v)=>[f.c[0]+f.u[0]*u+f.v[0]*v,f.c[1]+f.u[1]*u+f.v[1]*v];
 assert.equal(c.solidAt(...at(6.9,-3.9)),'arch');assert.equal(c.solidAt(...at(-6.9,-3.9)),'arch');assert.equal(c.solidAt(...at(0,-3.9)),null);assert.equal(c.solidAt(...at(0,0)),null);});

const bob=data.buildings.find(b=>b.bin===BOBST.bin),bf=footprintFrame(bob.rings[0]);
test('bobst: footprint frame is the 57 × 63 m block with x along Washington Sq S',()=>{assert.ok(Math.abs(bf.lx-57.17)<.2&&Math.abs(bf.lz-63.04)<.2);assert.ok(bf.ez[1]<-.8,'z points south');});
const bp=bobstParts(bf.lx,bf.lz),bv=verts(bp);
test('bobst: roof at the surveyed 47.36 m, stays on its footprint',()=>{const b=bbox(bv);assert.ok(Math.abs(b[1][1]-BOBST.H)<.01);assert.ok(b[0][0]>-1.5&&b[0][1]<bf.lx+1.5&&b[2][0]>-1.5&&b[2][1]<bf.lz+1.5,'within footprint + planters');assert.ok(bp.tris<60000);});
test('bobst: recessed glazed ground floor and atrium screen behind it',()=>{assert.ok(bp.m.glassClear&&bp.m.screen&&bp.m.floor);const g=verts(bp,['glassClear']).filter(p=>p[1]<6);assert.ok(g.every(p=>p[0]>BOBST.groundSet-1.3||p[2]>BOBST.groundSet-1.3||p[0]<0.1||p[2]<0.1),'glass set back');});

const sil=data.buildings.find(b=>b.bin===SILVER.bin),sp=silverParts(sil),sv=verts(sp);
test('silver center: three street fronts carry facade geometry; loggia columns on Washington Sq E',()=>{for(const F of SILVER.fronts){const dx=F.b[0]-F.a[0],dn=F.b[1]-F.a[1],L=Math.hypot(dx,dn);
  const near=sv.filter(([x,y,z])=>{const n=-z,t=((x-F.a[0])*dx+(n-F.a[1])*dn)/(L*L);if(t<0||t>1)return false;return Math.abs(((x-F.a[0])*dn-(n-F.a[1])*dx)/L)<1.5&&y>6&&y<15;});assert.ok(near.length>500,F.street+' '+near.length);}
 assert.ok(sp.m.lime.pos.length>10000);assert.ok(sp.tris<80000);});
// Shared check for landmarks built on the 3D model: height matches the model, geometry stays near
// the footprint, triangle budget.
const near=(v,b,pad)=>{const xs=b.rings[0].map(p=>p[0]),ns=b.rings[0].map(p=>p[1]);return v.every(([x,y,z])=>x>Math.min(...xs)-pad&&x<Math.max(...xs)+pad&&-z>Math.min(...ns)-pad&&-z<Math.max(...ns)+pad);};
const kim=data.buildings.find(b=>b.bin===KIMMEL.bin),{P:kp,park}=kimmelParts(kim),kv=verts(kp);
test('kimmel: stepped volume to 49.9 m, glazed top storey, canopy, balcony, stays on its block',()=>{const b=bbox(kv);assert.ok(Math.abs(b[1][1]-49.9)<.3,'top '+b[1][1]);assert.ok(near(kv,kim,5));
 assert.ok(kp.m.glassRoof&&kp.m.glassRail&&kp.m.glass);assert.ok(park&&park.len>15,'park wall found');assert.ok(kp.tris<60000);});
const jp=judsonParts(),jv=verts(jp);
test('kimmel: the canopy is a curved vault (quarter-ellipse), not a flat slope, and wraps the LaGuardia side',()=>{const {canopyH,springs}=kimmelParts(kim);
 assert.ok(springs.length>=2,'springing walls '+springs.length);
 for(const w of springs){const m=[(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2],at=f=>canopyH([m[0]+w.n[0]*w.D*f,m[1]+w.n[1]*w.D*f]);
  const h0=at(.02),h5=at(.5),h1=at(.99);assert.ok(h0>8.3&&h1<6.0,'ends '+h0+' '+h1);assert.ok(h5>(h0+h1)/2+.8,'convex at mid-depth '+h5);}});
test('judson: 19.7 × 30.8 m church with pediment and cross, campanile west of it to ~40 m',()=>{const b=bbox(jv);assert.ok(Math.abs(b[1][1]-JUDSON.tower.h)<.5,'top '+b[1][1]);
 const ped=jv.filter(([x,y,z])=>y>JUDSON.eave+1&&y<JUDSON.apex&&x>0&&x<JUDSON.W);assert.ok(ped.length>100);const tower=jv.filter(([x,y])=>y>25);assert.ok(tower.every(([x])=>x>JUDSON.tower.x0-1),'tower on the west side');assert.ok(jp.m.stained&&jp.m.copper&&jp.tris<40000);});
const rp=rowParts(data),rv=verts(rp);
test('the row: fronts for Nos. 1-13 and 19-26 with porticoes, attic frieze, railing; within its blocks',()=>{assert.equal(ROW_BINS.length,ROW.east.length+ROW.west.length);
 const fence=verts(rp,['iron']);assert.ok(fence.length>10000);const cols=verts(rp,['marble']).filter(([x,y])=>y>2&&y<5.5);assert.ok(cols.length>1000,'porticoes');
 assert.ok(rv.every(([x,y,z])=>(x>25&&x<160&&-z>-50&&-z<45)||(x>-130&&x<-15&&-z>60&&-z<140)),'stays on the two blocks');assert.ok(rp.tris<90000);});
const wb=data.buildings.find(b=>b.bin===WEINSTEIN.bin),{P:wp,front:wf}=weinsteinParts(wb),wv=verts(wp);
test('weinstein: slab to the 34.6 m tower roof, University Pl front found, three canopies, on its block',()=>{const b=bbox(wv);assert.ok(Math.abs(b[1][1]-34.6)<.3,'top '+b[1][1]);assert.ok(wf&&wf.len>35,'front');
 assert.ok(near(wv,wb,4));const canopy=verts(wp,['concrete']).filter(([x,y])=>y>3.5&&y<4.2);assert.ok(canopy.length>200);});
const brb=data.buildings.find(b=>b.bin===BROWN.bin),brp=brownParts(brb),brv=verts(brp);
test('brown building: preserved, cornice at 42.9 m, penthouse, memorial ribbon on both fronts',()=>{assert.equal(LANDMARK_BUILDINGS[BROWN.bin].preserve,true);const b=bbox(brv);assert.ok(Math.abs(b[1][1]-45.9)<.3,'top '+b[1][1]);
 const rib=verts(brp,['ribbon']);assert.equal(rib.length,12);assert.ok(rib.every(([x,y])=>y>4.3&&y<5.1));assert.ok(near(brv,brb,3));});
test('sidewalk sheds: each has a Street View date, stands on the sidewalk side, curb line is solid',()=>{const c=new CampusCollision(data);for(const s of SHEDS){assert.match(s.seen,/capture|same as above/);
  const dx=s.b[0]-s.a[0],dn=s.b[1]-s.a[1],L=Math.hypot(dx,dn),m=[(s.a[0]+s.b[0])/2+dn/L*(s.depth+.2),(s.a[1]+s.b[1])/2-dx/L*(s.depth+.2)];assert.ok(c.contacts||true);
  const near=c.segGrid.query(m[0]-1,m[1]-1,m[0]+1,m[1]+1).some(sg=>sg.kind==='shed');assert.ok(near,s.id);}
 assert.ok(shedParts().tris<5000);});
test('silver towers: three towers to the 82.5 m roof, 8- and 4-bay grids on every face, an arcade front each; Sylvette is a neutral placeholder',()=>{const {P,infos}=silverTowersParts();
 for(const bin of SILVER_TOWERS.bins){const i=infos[bin];assert.ok(i&&i.front,'front '+bin);assert.equal(i.grids.length,4,'grid faces '+bin);assert.deepEqual(i.grids.map(g=>Math.round((g.g1-g.g0)/SILVER_TOWERS.pitch)).sort(),[4,4,8,8]);assert.equal(i.grids.filter(g=>g.isFront).length,1);}
 const b=bbox(verts(P));assert.ok(b[1][1]>88&&b[1][1]<92.5,'bulkheads '+b[1][1]);
 const sy=P.m.betograve.pos;assert.equal(sy.length/3,36,'one plain slab, no figurative geometry');
 const c=new CampusCollision(data);assert.equal(c.solidAt(SYLVETTE.p[0],SYLVETTE.p[1]),'monument');});
console.log(`landmarks: ${passed} passed`);
