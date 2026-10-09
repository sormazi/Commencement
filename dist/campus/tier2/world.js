import * as T from '../../vendor/three.module.js';
import {Parts} from '../landmarks/kit.js?v=24';
import {centroid} from '../geometry.js?v=24';
import {buildKit,volumePieces,FootprintIndex,tier2Materials,signMaterial} from './kit.js?v=24';
import {TIER2} from './registry.js?v=24';
// Builds every second-tier building into the campus world: geometry merged per tile and material,
// doors as one instanced mesh, door records in world.doors.
export const TIER2_BINS=new Set(TIER2.flatMap(s=>[s.bin,...(s.also||[])]));
export function buildTier2Geometry(buildings,tileOf){const by=new Map(buildings.map(b=>[b.bin,b])),index=new FootprintIndex(buildings),tiles=new Map(),doors=[],stats=[];
 for(const spec of TIER2){const b=by.get(spec.bin);if(!b)continue;const extra=(spec.also||[]).map(x=>by.get(x)).filter(Boolean);
  const key=tileOf(...centroid(b.rings[0]));let P=tiles.get(key);if(!P){P=new Parts();tiles.set(key,P);}
  const r=buildKit(P,spec,volumePieces(b,extra),{index,bins:new Set([spec.bin,...(spec.also||[])])});doors.push(...r.doors);stats.push({slug:spec.slug,windows:r.windows,tris:r.tris,doors:r.doors.length});}
 return {tiles,doors,stats};}
export function buildTier2(world){const mats={...tier2Materials()};
 for(const s of TIER2)for(const [k,lines] of Object.entries(s.signs||{}))mats[k]=signMaterial(lines.text,lines.opt);
 const tileFor=new Map();const {tiles,doors,stats}=buildTier2Geometry(world.data.buildings,(x,n)=>{const t=world.tile(x,n);const k=t.i+','+t.j;tileFor.set(k,t);return k;});
 for(const [k,P] of tiles){const g=P.build(mats);g.name='tier2';for(const m of g.children){if(m.material.transparent){m.castShadow=false;m.renderOrder=2;}if(m.material===mats.flag)m.castShadow=false;world.disposables.add(m.geometry);}tileFor.get(k).group.add(g);tileFor.get(k).tier2Group=g;}
 // Doors: one instanced mesh for all of them.
 const geo=new T.BoxGeometry(1,1,.12),mat=new T.MeshStandardMaterial({color:0x2b2621,roughness:.55,metalness:.35}),im=new T.InstancedMesh(geo,mat,Math.max(1,doors.length)),o=new T.Object3D();
 doors.forEach((d,i)=>{o.position.set(...d.pos);o.position.addScaledVector(new T.Vector3(...d.normal),-.12);o.rotation.set(0,Math.atan2(d.normal[0],d.normal[2]),0);o.scale.set(d.w,d.h,1);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
 im.count=doors.length;im.name='tier2 doors';im.castShadow=false;im.receiveShadow=true;im.computeBoundingSphere();world.group.add(im);world.disposables.add(geo);world.disposables.add(mat);
 for(const k of Object.keys(mats))if(!tier2Materials()[k])world.disposables.add(mats[k]);
 world.doors=(world.doors||[]).concat(doors);world.tier2Stats=stats;return {doors,stats};}
