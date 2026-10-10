// Street name signs (Step 4B): the standard New York blade signs, two boards crossed at the corner of every
// intersection in the study area, one parallel to each street, lettered on both faces with a white border.
// Green as standard, brown inside the city's historic districts. Mounted on the lamp post at that corner when
// there is one within 4 m, otherwise on their own pole. Which corner carries the signs, and which signs are
// really brown, follow these rules for now and are checked corner by corner on Street View as the survey goes
// (see RESEARCH/storefronts/street-signs.md). Each board is a decal (kind 'street') in the signage manifest
// with its own PNG; they are drawn here rather than in signage.js because they weather individually in 2126:
// faded and rusted, some bent, some hanging by one bracket, some gone.
import * as T from '../vendor/three.module.js';
import {pointInRing} from './geometry.js?v=24';
const GREEN='#0b6b45',BROWN='#5b3a26',H=.24,Y0=3.05,GAP=.3;
const hash=x=>{const s=Math.sin(x*12.9898)*43758.5453;return s-Math.floor(s);};
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
// The name as lettered on the sign: the city's short form (the data already uses it), first name only.
export const signName=n=>n.split('·')[0].trim();
function dirAt(seg,node){const p=seg.pts,a=p[0],z=p[p.length-1];const fromStart=Math.hypot(a[0]-node[0],a[1]-node[1])<Math.hypot(z[0]-node[0],z[1]-node[1]);
 const q=fromStart?p[1]:p[p.length-2],o=fromStart?a:z,d=[q[0]-o[0],q[1]-o[1]],L=Math.hypot(...d)||1;return [d[0]/L,d[1]/L];}
// Intersections: graph nodes where two or more named streets meet; one sign assembly per intersection.
export function streetSignAssemblies(data){const S=data.streets,brown=data.buildings.find(b=>b.bin===1008823),out=[];
 const lamps=data.lamps.map(l=>l.p),near=(p,r)=>{let best=null,bd=r;for(const q of lamps){const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<bd){bd=d;best=q;}}return best;};
 const byNode=new Map();for(const [a,b,si] of S.edges){const seg=S.segments[si];if(!seg)continue;for(const n of [a,b]){if(!byNode.has(n))byNode.set(n,[]);byNode.get(n).push(seg);}}
 const districtAt=p=>{let best=null,bd=40;for(const b of data.buildings){if(!b.district||!/historic district/i.test(b.district))continue;const r=b.rings[0],c=r[0];const d=Math.hypot(c[0]-p[0],c[1]-p[1]);if(d<bd){bd=d;best=b.district;}}return best;};
 for(const [n,segs] of byNode){const node=S.nodes[n],named=new Map();for(const s of segs){const nm=S.names[s.street];if(!nm||named.has(nm))continue;named.set(nm,s);}
  if(named.size<2)continue;const [[n1,s1],[n2,s2]]=[...named.entries()];const d1=dirAt(s1,node),d2=dirAt(s2,node);if(Math.abs(d1[0]*d2[0]+d1[1]*d2[1])>.97)continue;
  const w1=(s1.width||8)/2+1.1,w2=(s2.width||8)/2+1.1;
  // The four corners; prefer one with a lamp post, never one by the Brown Building.
  const corners=[];for(const a of [1,-1])for(const b of [1,-1]){const p=[node[0]+a*d1[0]*w2+b*d2[0]*w1,node[1]+a*d1[1]*w2+b*d2[1]*w1];
   if(brown&&(pointInRing(p,brown.rings[0])||Math.min(...brown.rings[0].map(q=>Math.hypot(q[0]-p[0],q[1]-p[1])))<6))continue;corners.push({p,lamp:near(p,4)});}
  if(!corners.length)continue;const c=corners.find(k=>k.lamp)||corners[0],p=c.lamp?[c.lamp[0],c.lamp[1]]:c.p;
  const dist=districtAt(p);out.push({p,onLamp:!!c.lamp,district:dist,color:dist?'brown':'green',boards:[{name:signName(n1),dir:d1},{name:signName(n2),dir:d2}],node:n});}
 return out;}
const boardSize=name=>[Math.min(1.7,Math.max(.75,.22+.085*name.length)),H];
// Decals for the manifest: one per sign name and colour, a placement on each face of each board.
export function streetSignDecals(data){const map=new Map();
 for(const a of streetSignAssemblies(data))a.boards.forEach((b,i)=>{const col=a.color,id='street-'+slug(b.name)+'-'+(col==='brown'?'b':'g');
  if(!map.has(id))map.set(id,{id,file:'assets/signage/'+id+'.png',kind:'street',size:boardSize(b.name),bg:col==='brown'?BROWN:GREEN,fg:'#ffffff',border:'#ffffff',lines:[b.name],font:'sans-bold',
   seen:'Standard NYC street name sign ('+(col==='brown'?'brown, historic district':'green')+'); corner chosen by rule (lamp post first), to be checked on Street View',placements:[]});
  const spec=map.get(id),nrm=[-b.dir[1],b.dir[0]],y=Y0+i*GAP,where=`${a.boards[0].name} & ${a.boards[1].name}`+(a.onLamp?' (on the lamp post)':' (own pole)');
  for(const s of [1,-1])spec.placements.push({p:[a.p[0]+nrm[0]*s*.012,a.p[1]+nrm[1]*s*.012],y,normal:[nrm[0]*s,nrm[1]*s],where,assembly:a.node});});
 return [...map.values()];}
// Drawn as one atlas page (the PNGs replace the canvas drawings as they load) plus instanced poles.
export function buildStreetSigns(world,specs,{drawDecal,decalPixels,trackImage}){const group=new T.Group();group.name='street signs';const keep=x=>{world.disposables.add(x);return x;},y0=world.curbHeight??.15;
 const cellW=256,cellH=64,per=16,rows=Math.ceil(specs.length/per),c=document.createElement('canvas');c.width=cellW*per;c.height=cellH*Math.max(1,rows);const g=c.getContext('2d');
 const tex=keep(new T.CanvasTexture(c));tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;const list=[],uv=[];
 specs.forEach((spec,i)=>{const x=(i%per)*cellW,y=Math.floor(i/per)*cellH,cc=document.createElement('canvas');cc.width=cellW;cc.height=cellH;drawDecal(cc.getContext('2d'),spec,cellW,cellH);g.drawImage(cc,x,y);
  const img=trackImage(new Image());img.onload=()=>{g.drawImage(img,x,y,cellW,cellH);tex.needsUpdate=true;};img.onerror=()=>{};img.src=spec.file;
  for(const pl of spec.placements){list.push({pl,spec,seed:hash(pl.p[0]*3.1+pl.p[1]*7.7+pl.y)});uv.push((x+1)/c.width,1-(y+cellH-1)/c.height,(cellW-2)/c.width,(cellH-2)/c.height);}});
 const unit=keep(new T.PlaneGeometry(1,1).translate(0,.5,0));unit.setAttribute('aUvRect',new T.InstancedBufferAttribute(new Float32Array(uv),4));
 const seeds=new Float32Array(list.map(l=>l.seed));unit.setAttribute('aSeed',new T.InstancedBufferAttribute(seeds,1));
 const uDecay={value:0};const mat=keep(new T.MeshStandardMaterial({map:tex,roughness:.6,metalness:.2}));mat.name='street signs';
 mat.onBeforeCompile=sh=>{sh.uniforms.uDecay=uDecay;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aUvRect;attribute float aSeed;varying float vSeed;varying vec2 vLocal;').replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv=aUvRect.xy+uv*aUvRect.zw;\n#endif\nvSeed=aSeed;vLocal=uv;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uDecay;varying float vSeed;varying vec2 vLocal;').replace('#include <map_fragment>',`#include <map_fragment>
 { float k=uDecay*(.55+.45*vSeed); vec3 c=diffuseColor.rgb; float l=dot(c,vec3(.3,.59,.11));
   c=mix(c,vec3(l)*vec3(1.05,1.0,.92)+.08,k*.7);
   float n=fract(sin(dot(floor(vLocal*vec2(40.,10.))+vSeed*31.,vec2(12.9898,78.233)))*43758.5453);
   float rust=smoothstep(.72,.95,n+.25*vLocal.y*0.+.2*vSeed)*k; c=mix(c,vec3(.42,.24,.12),rust);
   diffuseColor.rgb=c; }`);};mat.customProgramCacheKey=()=>'nv-street-signs';
 const im=new T.InstancedMesh(unit,mat,list.length);im.name='street sign boards';im.castShadow=false;im.receiveShadow=true;group.add(im);
 // Poles for the corners without a lamp post: a plain galvanised post to just above the top board.
 const poles=new Map();for(const {pl} of list)if(!/lamp post/.test(pl.where))poles.set(pl.assembly,pl.p);
 const pg=keep(new T.CylinderGeometry(.045,.05,1,8).translate(0,.5,0)),pm=keep(new T.MeshStandardMaterial({color:0x8d9296,roughness:.5,metalness:.6}));
 const pim=new T.InstancedMesh(pg,pm,poles.size);pim.name='street sign poles';const o3=new T.Object3D();let k=0;for(const p of poles.values()){o3.position.set(p[0],y0,-p[1]);o3.scale.set(1,Y0+GAP+H+.15,1);o3.rotation.set(0,0,0);o3.updateMatrix();pim.setMatrixAt(k++,o3.matrix);}group.add(pim);
 // Placement for era t: from about halfway to 2126, some boards bend, some hang by one bracket, a few are gone.
 const q=new T.Quaternion(),q0=new T.Quaternion(),e=new T.Euler(),pos=new T.Vector3(),scl=new T.Vector3(),mtx=new T.Matrix4(),m0=new T.Matrix4(),a0=new T.Vector3(),a1=new T.Vector3();
 function place(t){const s=Math.max(0,Math.min(1,(t-.35)/.5)),sm=s*s*(3-2*s);
  list.forEach(({pl,spec,seed},i)=>{const yaw=Math.atan2(pl.normal[0],-pl.normal[1]),w=spec.size[0],h=spec.size[1];let roll=0,yawOff=0,drop=0,gone=false;
   // Both faces of a board share a seed so they move together.
   const bs=hash(Math.round(pl.p[0]*20)*.37+Math.round(pl.p[1]*20)*.11+pl.y);
   if(bs<.12)gone=sm>.6;else if(bs<.27){roll=sm*1.25*(bs<.2?1:-1);drop=sm*.05;}else if(bs<.5){roll=sm*.22*(bs<.38?1:-1);yawOff=sm*.3*(bs-.38);}
   pos.set(pl.p[0],y0+pl.y-drop,-pl.p[1]);e.set(0,yaw+yawOff,roll);q.setFromEuler(e);scl.set(gone?0:w,gone?0:h,1);
   // Hanging boards pivot about their outer end (the bracket that held).
   mtx.compose(pos,q,scl);if(roll){e.set(0,yaw+yawOff,0);q0.setFromEuler(e);m0.compose(pos,q0,scl);const sx=-.5*Math.sign(roll);a0.set(sx,1,0).applyMatrix4(m0);a1.set(sx,1,0).applyMatrix4(mtx);mtx.elements[12]+=a0.x-a1.x;mtx.elements[13]+=a0.y-a1.y;mtx.elements[14]+=a0.z-a1.z;}
   im.setMatrixAt(i,mtx);});im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();uDecay.value=t;}
 place(0);(world.decayHooks||(world.decayHooks=[])).push(place);world.streetSigns={group,count:list.length/2,poles:poles.size,place};return group;}
