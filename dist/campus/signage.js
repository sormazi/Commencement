import * as T from '../vendor/three.module.js';
import {SIGNAGE} from '../assets/signage/manifest.js?v=21';
// Signage decals (see assets/signage/manifest.js). Every decal has its own texture file. Two ways to draw:
// - Banners and flags: one material per decal and one instanced plane for all its placements.
// - Shop signs and plaques (kinds 'sign' and 'plaque', which can run to hundreds): packed into shared
//   texture atlases, 128 cells of 512 x 256 px per 4096 px page, all drawn as one instanced plane per page.
//   Each decal is fitted into its cell keeping its aspect ratio, and the instance carries its cell's UV
//   rectangle, so a page of signs costs one draw call.
// Each texture starts as a canvas drawing of the manifest's fallback (plain lettering) and is replaced by
// the PNG of the same name once that loads, so dropping in a new PNG changes the sign.
export {SIGNAGE};
const FONTS={'sans-bold':'bold {px}px Helvetica, Arial, sans-serif','serif':'{px}px Georgia, "Times New Roman", serif','serif-bold':'bold {px}px Georgia, "Times New Roman", serif','sans':'{px}px Helvetica, Arial, sans-serif',
 'script':'italic {px}px Georgia, serif','condensed':'bold {px}px "Arial Narrow", "Helvetica Neue", Arial, sans-serif','slab':'bold {px}px Rockwell, "Courier New", serif','neon':'{px}px "Brush Script MT", "Segoe Script", cursive'};
export const ATLAS_KINDS=new Set(['sign','plaque']);
// Pixel size for a decal: 256 px per metre on the long side, capped at 1024.
export function decalPixels(size){const k=Math.min(256,1024/Math.max(...size));return [Math.max(8,Math.round(size[0]*k)),Math.max(8,Math.round(size[1]*k))];}
// Draws the fallback onto a 2D context (also used by tools/make-signage.py to make the PNGs).
export function drawDecal(g,spec,w,h){g.fillStyle=spec.bg||'#ffffff';g.fillRect(0,0,w,h);
 if(spec.band){g.fillStyle=spec.band;g.fillRect(0,h*.88,w,h*.12);}
 if(spec.border){g.strokeStyle=spec.border;g.lineWidth=Math.max(2,Math.min(w,h)*.05);g.strokeRect(g.lineWidth/2+w*.02,g.lineWidth/2+h*.04,w*.96-g.lineWidth,h*.92-g.lineWidth);}
 const lines=spec.lines||[];if(!lines.length)return;const vertical=h>w*1.3,font=FONTS[spec.font]||FONTS['sans-bold'];
 const area=vertical?[w*.86,h*.6]:[w*.9,h*.74];let px=Math.floor(area[1]/lines.length*.8);
 g.font=font.replace('{px}',px);const widest=Math.max(...lines.map(l=>g.measureText(l).width));if(widest>area[0]){px=Math.floor(px*area[0]/widest);g.font=font.replace('{px}',px);}
 g.fillStyle=spec.fg||'#000000';g.textAlign='center';g.textBaseline='middle';const lh=px*1.15,top=(vertical?h*.4:h/2)-lh*(lines.length-1)/2;lines.forEach((l,i)=>g.fillText(l,w/2,top+i*lh));}
// Atlas cell layout: where a decal of this size sits inside a 512 x 256 cell (fit, centred), in cell pixels.
export const CELL=[512,256],PAGE=4096,PER_ROW=PAGE/CELL[0],PER_PAGE=PER_ROW*(PAGE/CELL[1]);
export function fitInCell(size){const a=size[0]/size[1],ca=CELL[0]/CELL[1];const w=a>=ca?CELL[0]:Math.round(CELL[1]*a),h=a>=ca?Math.round(CELL[0]/a):CELL[1];return {x:(CELL[0]-w)/2,y:(CELL[1]-h)/2,w,h};}
export function buildSignage(world,{base=''}={}){const group=new T.Group();group.name='signage';const keep=x=>{world.disposables.add(x);return x;},o3=new T.Object3D(),loader=new T.TextureLoader(),y0=world.curbHeight??.15;
 const mats={},pages=[];
 const placeAll=(im,list)=>{list.forEach(([pl,spec],i)=>{o3.position.set(pl.p[0],y0+pl.y,-pl.p[1]);o3.rotation.set(0,Math.atan2(pl.normal[0],-pl.normal[1]),0);const s=pl.size||spec.size;o3.scale.set(s[0],s[1],1);o3.updateMatrix();im.setMatrixAt(i,o3.matrix);});im.computeBoundingSphere();};
 const unit=keep(new T.PlaneGeometry(1,1).translate(0,.5,0));
 // Banners and flags.
 for(const spec of SIGNAGE){if(ATLAS_KINDS.has(spec.kind)||!spec.placements?.length)continue;const [w,h]=decalPixels(spec.size),c=document.createElement('canvas');c.width=w;c.height=h;drawDecal(c.getContext('2d'),spec,w,h);
  const tex=keep(new T.CanvasTexture(c));tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
  const mat=keep(new T.MeshStandardMaterial({map:tex,side:T.DoubleSide,roughness:.9,alphaTest:.5}));mat.name='signage:'+spec.id;mats[spec.id]=mat;
  loader.load(base+spec.file,img=>{img.colorSpace=T.SRGBColorSpace;img.anisotropy=4;keep(img);mat.map=img;mat.needsUpdate=true;world.onSignage?.(spec.id,mat);},undefined,()=>{});
  const im=new T.InstancedMesh(unit,mat,spec.placements.length);placeAll(im,spec.placements.map(pl=>[pl,spec]));im.name='signage '+spec.id;im.userData.decal=spec.id;im.userData.kind=spec.kind;im.castShadow=false;im.receiveShadow=true;group.add(im);}
 // Shop signs and plaques, in atlas pages.
 const atlasSpecs=SIGNAGE.filter(s=>ATLAS_KINDS.has(s.kind)&&s.placements?.length);
 for(let p0=0;p0<atlasSpecs.length;p0+=PER_PAGE){const specs=atlasSpecs.slice(p0,p0+PER_PAGE),c=document.createElement('canvas');c.width=c.height=PAGE;const g=c.getContext('2d');
  const tex=keep(new T.CanvasTexture(c));tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;tex.generateMipmaps=true;
  const rects=specs.map((spec,i)=>{const cx=(i%PER_ROW)*CELL[0],cy=Math.floor(i/PER_ROW)*CELL[1],f=fitInCell(spec.size),r={x:cx+f.x,y:cy+f.y,w:f.w,h:f.h};
   const cc=document.createElement('canvas');cc.width=r.w;cc.height=r.h;drawDecal(cc.getContext('2d'),spec,r.w,r.h);g.drawImage(cc,r.x,r.y);
   const img=new Image();img.onload=()=>{g.drawImage(img,r.x,r.y,r.w,r.h);tex.needsUpdate=true;};img.onerror=()=>{};img.src=base+spec.file;return r;});
  const list=[],uv=[];specs.forEach((spec,i)=>{const r=rects[i],inset=1;for(const pl of spec.placements){list.push([pl,spec]);uv.push((r.x+inset)/PAGE,1-(r.y+r.h-inset)/PAGE,(r.w-2*inset)/PAGE,(r.h-2*inset)/PAGE);}});
  const geo=keep(unit.clone());geo.setAttribute('aUvRect',new T.InstancedBufferAttribute(new Float32Array(uv),4));
  const mat=keep(new T.MeshStandardMaterial({map:tex,side:T.DoubleSide,roughness:.8}));mat.name='signage atlas '+pages.length;
  mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aUvRect;').replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv=aUvRect.xy+uv*aUvRect.zw;\n#endif');};mat.customProgramCacheKey=()=>'nv-sign-atlas';
  const im=new T.InstancedMesh(geo,mat,list.length);placeAll(im,list);im.name='signage atlas '+pages.length;im.userData.kind='atlas';im.castShadow=false;im.receiveShadow=true;group.add(im);pages.push({tex,specs,rects});}
 world.signage={group,materials:mats,pages};return group;}
