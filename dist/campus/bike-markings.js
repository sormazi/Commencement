import * as T from '../vendor/three.module.js';
// Bike lane stencils and flexible delineators (roads survey, 14 Oct 2026; positions from tools/build-markings.mjs).
// The stencil is New York's: a white bicycle in side view with a white arrow ahead of it pointing the way of travel,
// about 1.8 m long in all (NYC Street Design Manual). Delineators are white flexible posts, about 0.9 m tall, with
// two reflective bands, standing every 6 m down a painted buffer that has no parked cars beyond it.
function stencilTexture(){const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');g.clearRect(0,0,128,256);g.strokeStyle='#fff';g.fillStyle='#fff';g.lineWidth=7;g.lineCap='round';g.lineJoin='round';
 // Bicycle, travelling up the canvas (front wheel at the top), seen from above as painted: wheels as rings.
 g.beginPath();g.arc(64,196,30,0,Math.PI*2);g.stroke();g.beginPath();g.arc(64,116,30,0,Math.PI*2);g.stroke();
 g.beginPath();g.moveTo(64,196);g.lineTo(44,150);g.lineTo(70,150);g.lineTo(64,116);g.moveTo(44,150);g.lineTo(38,140);g.moveTo(70,150);g.lineTo(64,196);g.moveTo(64,116);g.lineTo(80,110);g.stroke();
 // Arrow ahead.
 g.beginPath();g.moveTo(64,10);g.lineTo(92,48);g.lineTo(74,48);g.lineTo(74,74);g.lineTo(54,74);g.lineTo(54,48);g.lineTo(36,48);g.closePath();g.fill();
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
export function buildBikeMarkings(M,{groundY=0}={}){const g=new T.Group();g.name='bike-markings';const own=[];const o=new T.Object3D();
 const sym=M.symbols||[],posts=M.posts||[];
 if(sym.length){const tex=stencilTexture(),mat=new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:.4,roughness:.7,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5,depthWrite:false});
  const geo=new T.PlaneGeometry(.9,1.8).rotateX(-Math.PI/2);own.push(tex,mat,geo);const im=new T.InstancedMesh(geo,mat,sym.length);im.frustumCulled=false;im.receiveShadow=true;
  sym.forEach(([x,n,a],k)=>{o.position.set(x,groundY+.016,-n);o.rotation.set(0,a-Math.PI/2,0);o.updateMatrix();im.setMatrixAt(k,o.matrix);});g.add(im);}
 if(posts.length){const geo=new T.CylinderGeometry(.04,.05,.9,8).translate(0,.45,0),band=new T.CylinderGeometry(.043,.043,.07,8).translate(0,.78,0),base=new T.CylinderGeometry(.11,.12,.05,10).translate(0,.025,0);
  const white=new T.MeshStandardMaterial({color:0xf2f2ee,roughness:.5}),refl=new T.MeshStandardMaterial({color:0xd8dde0,roughness:.2,metalness:.6}),blk=new T.MeshStandardMaterial({color:0x222222,roughness:.8});own.push(geo,band,base,white,refl,blk);
  for(const [G,Mt] of [[geo,white],[band,refl],[base,blk]]){const im=new T.InstancedMesh(G,Mt,posts.length);im.frustumCulled=false;im.castShadow=true;posts.forEach(([x,n],k)=>{o.position.set(x,groundY,-n);o.rotation.set(0,0,0);o.updateMatrix();im.setMatrixAt(k,o.matrix);});g.add(im);}}
 return {group:g,dispose(){for(const x of own)x.dispose();}};}
