// Builds the physically based texture set (Step A.2) from CC0 materials on ambientCG (ambientcg.com), as
// GPU-compressed KTX2 files in dist/assets/pbr/. Run once after changing the list below:
//   npm i --no-save ktx2-encoder@0.6.0 sharp && node tools/build-pbr.mjs
// The source zips are downloaded to tools/.pbr-cache/ (git-ignored); only the KTX2 outputs are committed.
// Outputs
//  walls-normal.ktx2  2048x1024 atlas of 512 px tiles (4 x 2) of tangent-space normal maps, UASTC
//  walls-params.ktx2  the same atlas: R roughness, G albedo detail (0.5 = unchanged), B ambient occlusion, ETC1S
//  asphalt-normal / asphalt-params, sidewalk-normal / sidewalk-params: 1024 px, mipmapped (pass {color:true}
//  to groundSet for an sRGB colour map too; the game keeps its own ground colours, so none is shipped)
// Tile order in the wall atlas must match WALL_TILES in dist/campus/atmosphere/pbr.js.
import fs from 'node:fs';import path from 'node:path';import {execSync} from 'node:child_process';
import sharp from 'sharp';import {encodeToKTX2} from 'ktx2-encoder';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'),CACHE=path.join(ROOT,'tools/.pbr-cache'),OUT=path.join(ROOT,'dist/assets/pbr');
fs.mkdirSync(CACHE,{recursive:true});fs.mkdirSync(OUT,{recursive:true});
export const WALL_TILES=['Concrete034','Bricks101','Bricks105','Concrete012','Travertine009','Metal027','flat','Concrete047A'];
const GROUND={asphalt:'Asphalt033',sidewalk:'Concrete047A'};
async function fetchSet(id){const dir=path.join(CACHE,id);if(!fs.existsSync(dir)){const zip=path.join(CACHE,id+'.zip');
  execSync(`curl -s -L -m 120 -o "${zip}" "https://ambientcg.com/get?file=${id}_1K-JPG.zip"`);fs.mkdirSync(dir);execSync(`unzip -o -q "${zip}" -d "${dir}"`);}
 const f=k=>{const m=fs.readdirSync(dir).find(n=>n.endsWith(`_${k}.jpg`));return m?path.join(dir,m):null;};return {color:f('Color'),normal:f('NormalGL'),rough:f('Roughness'),ao:f('AmbientOcclusion')};}
const raw=async(file,size)=>(await sharp(file).resize(size,size).removeAlpha().raw().toBuffer());
const gray=async(file,size,fill)=>file?(await sharp(file).resize(size,size).greyscale().raw().toBuffer()):Buffer.alloc(size*size,fill);
// Albedo detail: the colour map's luminance around its own mean, so a tinted material keeps its tint.
async function detail(file,size){const g=await gray(file,size,128);let m=0;for(const v of g)m+=v;m/=g.length;const out=Buffer.alloc(g.length);for(let i=0;i<g.length;i++)out[i]=Math.max(0,Math.min(255,Math.round(128+(g[i]-m)*1.15)));return out;}
const encode=async(rgba,w,h,{uastc=false,normal=false,srgb=false}={})=>encodeToKTX2(new Uint8Array(await sharp(rgba,{raw:{width:w,height:h,channels:4}}).png().toBuffer()),
 {isUASTC:uastc,isNormalMap:normal,isSetKTX2SRGBTransferFunc:srgb,generateMipmap:true,qualityLevel:230,compressionLevel:2,uastcLDRQualityLevel:2,
  imageDecoder:async b=>{const {data,info}=await sharp(b).ensureAlpha().raw().toBuffer({resolveWithObject:true});return {data:new Uint8Array(data),width:info.width,height:info.height};}});
// Wall atlas: each 512 tile is the 1K map scaled down to 496 and wrapped by 8 px on every side, so mip
// levels down to 32 px never bleed into a neighbour.
const T=512,G=8,I=T-2*G,AW=4*T,AH=2*T;
async function wallAtlas(){const N=Buffer.alloc(AW*AH*4),P=Buffer.alloc(AW*AH*4);
 for(const [k,id] of WALL_TILES.entries()){const ox=(k%4)*T,oy=Math.floor(k/4)*T;
  let n,r,d,a;if(id==='flat'){n=Buffer.alloc(I*I*3);for(let i=0;i<I*I;i++){n[i*3]=128;n[i*3+1]=128;n[i*3+2]=255;}r=Buffer.alloc(I*I,40);d=Buffer.alloc(I*I,128);a=Buffer.alloc(I*I,255);}
  else{const s=await fetchSet(id);n=await raw(s.normal,I);r=await gray(s.rough,I,180);d=await detail(s.color,I);a=await gray(s.ao,I,255);}
  for(let y=0;y<T;y++)for(let x=0;x<T;x++){const sx=((x-G)%I+I)%I,sy=((y-G)%I+I)%I,si=sy*I+sx,di=((oy+y)*AW+ox+x)*4;
   N[di]=n[si*3];N[di+1]=n[si*3+1];N[di+2]=n[si*3+2];N[di+3]=255;P[di]=r[si];P[di+1]=d[si];P[di+2]=a[si];P[di+3]=255;}}
 fs.writeFileSync(path.join(OUT,'walls-normal.ktx2'),await encode(N,AW,AH,{uastc:true,normal:true}));
 fs.writeFileSync(path.join(OUT,'walls-params.ktx2'),await encode(P,AW,AH));}
async function groundSet(name,id,{color=false}={}){const s=await fetchSet(id),S=1024,px=S*S;
 const n=await raw(s.normal,S),r=await gray(s.rough,S,200),d=await detail(s.color,S),a=await gray(s.ao,S,255),N=Buffer.alloc(px*4),P=Buffer.alloc(px*4);
 for(let i=0;i<px;i++){N[i*4]=n[i*3];N[i*4+1]=n[i*3+1];N[i*4+2]=n[i*3+2];N[i*4+3]=255;P[i*4]=r[i];P[i*4+1]=d[i];P[i*4+2]=a[i];P[i*4+3]=255;}
 fs.writeFileSync(path.join(OUT,name+'-normal.ktx2'),await encode(N,S,S,{uastc:true,normal:true}));fs.writeFileSync(path.join(OUT,name+'-params.ktx2'),await encode(P,S,S));
 if(color){const c=await raw(s.color,S),C=Buffer.alloc(px*4);for(let i=0;i<px;i++){C[i*4]=c[i*3];C[i*4+1]=c[i*3+1];C[i*4+2]=c[i*3+2];C[i*4+3]=255;}
  fs.writeFileSync(path.join(OUT,name+'-color.ktx2'),await encode(C,S,S,{srgb:true}));}}
await wallAtlas();await groundSet('asphalt',GROUND.asphalt);await groundSet('sidewalk',GROUND.sidewalk);
for(const f of fs.readdirSync(OUT))console.log(f,fs.statSync(path.join(OUT,f)).size);
