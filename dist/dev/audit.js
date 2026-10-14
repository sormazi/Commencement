// Developer: ?audit=poles walks the whole scene after load and lists every upright object (a pole, post, sign, hydrant,
// bollard, rack, box or trunk: taller than 0.5 m and under 1.6 m across) whose footing stands in the roadway, i.e. in
// the planimetric roadbed but not on a sidewalk, plaza or raised median (campus/curbs.js). Results go to
// window.__audit and the console; tools/audit-scene.py runs it headless and fails if anything is found.
import * as T from '../vendor/three.module.js';
import data from '../campus/data/campus-data.js?v=24';
import {curbIndex,isKnownGap} from '../campus/curbs.js?v=24';
// Things that really stand in the roadway, or are not street furniture: in-street Citi Bike stations (in the parking
// lane, as NYC DOT places them), flexible delineators in painted bike-lane buffers, people, cars, ground plants.
export const ROADWAY_OK=/^(citibike|bike-markings|crowd|meadow|ivy|NYU Campus Safety car|steam)/;
export function auditPoles(scene,{allow=[]}={}){const {inRoad}=curbIndex(data);const hits=new Map(),m=new T.Matrix4(),w=new T.Matrix4(),box=new T.Box3(),v=new T.Vector3();let checked=0;
 scene.updateMatrixWorld(true);
 const label=o=>{let s=[];for(let p=o;p&&s.length<4;p=p.parent)if(p.name)s.push(p.name);return (s.join(' < ')||o.type)+(o.material?.name?' ['+o.material.name+']':'');};
 const test=(o,mat)=>{if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();box.copy(o.geometry.boundingBox).applyMatrix4(mat);const sx=box.max.x-box.min.x,sz=box.max.z-box.min.z,sy=box.max.y-box.min.y;
  if(sy<.5||Math.max(sx,sz)>1.6||box.min.y>1.2)return;checked++;const p=[(box.min.x+box.max.x)/2,-(box.min.z+box.max.z)/2];// clearly in the roadway: the footing and points 0.2 m round it
  if(!inRoad(p)||![[.2,0],[-.2,0],[0,.2],[0,-.2]].every(([a,b])=>inRoad([p[0]+a,p[1]+b])))return;if(allow.some(a=>a(o,p)))return;
  const k=label(o);if(ROADWAY_OK.test(k))return;if(/^trunk/.test(k)&&isKnownGap(p))return;const e=hits.get(k)||{object:k,count:0,at:[]};e.count++;if(e.at.length<8)e.at.push(p.map(x=>Math.round(x*10)/10));hits.set(k,e);};
 scene.traverse(o=>{if(!o.isMesh||!o.geometry)return;if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);w.multiplyMatrices(o.matrixWorld,m);if(Math.abs(w.elements[0])+Math.abs(w.elements[5])+Math.abs(w.elements[10])<1e-6)continue;test(o,w);}}else test(o,o.matrixWorld);});
 const out={checked,objects:[...hits.values()].sort((a,b)=>b.count-a.count)};return out;}
