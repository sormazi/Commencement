import * as T from '../vendor/three.module.js';
import {SIGNAGE} from '../assets/signage/manifest.js?v=21';
// Signage decals (see assets/signage/manifest.js). Each decal is one material with its own texture slot,
// and all placements of a decal are one instanced plane, so a sign costs one draw call however often it
// appears. The texture starts as a canvas drawing of the manifest's fallback (plain lettering) and is
// replaced by the PNG of the same name once that loads, so dropping in a new PNG changes the sign.
export {SIGNAGE};
const FONTS={'sans-bold':'bold {px}px Helvetica, Arial, sans-serif','serif':'{px}px Georgia, "Times New Roman", serif','serif-bold':'bold {px}px Georgia, "Times New Roman", serif','sans':'{px}px Helvetica, Arial, sans-serif','script':'italic {px}px Georgia, serif'};
// Pixel size for a decal: 256 px per metre on the long side, capped.
export function decalPixels(size){const k=Math.min(256,1024/Math.max(...size));return [Math.round(size[0]*k),Math.round(size[1]*k)];}
// Draws the fallback onto a 2D context (also used by tools/make-signage.mjs to make the PNGs).
export function drawDecal(g,spec,w,h){g.fillStyle=spec.bg||'#ffffff';g.fillRect(0,0,w,h);
 if(spec.band){g.fillStyle=spec.band;g.fillRect(0,h*.88,w,h*.12);}
 if(spec.border){g.strokeStyle=spec.border;g.lineWidth=Math.max(2,w*.03);g.strokeRect(w*.04,h*.04,w*.92,h*.92);}
 const lines=spec.lines||[];if(!lines.length)return;const vertical=h>w*1.3,font=FONTS[spec.font]||FONTS['sans-bold'];
 const area=vertical?[w*.86,h*.6]:[w*.9,h*.72];let px=Math.floor(area[1]/lines.length*.8);
 g.font=font.replace('{px}',px);const widest=Math.max(...lines.map(l=>g.measureText(l).width));if(widest>area[0]){px=Math.floor(px*area[0]/widest);g.font=font.replace('{px}',px);}
 g.fillStyle=spec.fg||'#000000';g.textAlign='center';g.textBaseline='middle';const lh=px*1.15,top=(vertical?h*.4:h/2)-lh*(lines.length-1)/2;lines.forEach((l,i)=>g.fillText(l,w/2,top+i*lh));}
export function buildSignage(world,{base=''}={}){const group=new T.Group();group.name='signage';const keep=x=>{world.disposables.add(x);return x;},o3=new T.Object3D(),loader=new T.TextureLoader(),y0=world.curbHeight??.15;
 const mats={};
 for(const spec of SIGNAGE){if(!spec.placements?.length)continue;const [w,h]=decalPixels(spec.size),c=document.createElement('canvas');c.width=w;c.height=h;drawDecal(c.getContext('2d'),spec,w,h);
  const tex=keep(new T.CanvasTexture(c));tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
  const mat=keep(new T.MeshStandardMaterial({map:tex,side:T.DoubleSide,roughness:.9,alphaTest:.5}));mat.name='signage:'+spec.id;mats[spec.id]=mat;
  loader.load(base+spec.file,img=>{img.colorSpace=T.SRGBColorSpace;img.anisotropy=4;keep(img);mat.map=img;mat.needsUpdate=true;world.onSignage?.(spec.id,mat);},undefined,()=>{});
  const geo=keep(new T.PlaneGeometry(spec.size[0],spec.size[1]).translate(0,spec.size[1]/2,0)),im=new T.InstancedMesh(geo,mat,spec.placements.length);
  spec.placements.forEach((pl,i)=>{o3.position.set(pl.p[0],y0+pl.y,-pl.p[1]);o3.rotation.set(0,Math.atan2(pl.normal[0],-pl.normal[1]),0);o3.updateMatrix();im.setMatrixAt(i,o3.matrix);});
  im.computeBoundingSphere();im.name='signage '+spec.id;im.userData.decal=spec.id;im.userData.kind=spec.kind;im.castShadow=false;im.receiveShadow=true;group.add(im);}
 world.signage={group,materials:mats};return group;}
