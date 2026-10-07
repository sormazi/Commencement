// Detail-pass landmark geometry: dimensions, clearances and placement (runs in Node, no textures).
import assert from 'node:assert/strict';
import data from '../dist/campus/data/campus-data.js';
import {archParts,ARCH,INSCRIPTION} from '../dist/campus/landmarks/arch.js';
import {bobstParts,BOBST} from '../dist/campus/landmarks/bobst.js';
import {silverParts,SILVER} from '../dist/campus/landmarks/silver-center.js';
import {footprintFrame} from '../dist/campus/landmarks/kit.js';
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
console.log(`landmarks: ${passed} passed`);
