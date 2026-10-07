// Third-tier (non-NYU) buildings, Phase 2 Step 3: the right material, colour and window rhythm, no
// individual detail. Each building is classified from its NYC data (PLUTO building class, year built,
// floors and height, landmark district) into an upper-floor facade type, a ground-storey type and a
// material colour. The facade is a texture cell (one bay by one floor) from a small atlas, mapped on the
// existing massing walls, so it costs no extra triangles or draw calls. Pure functions here; the atlas
// and the shader patch are browser-only.
import {TIER3_BLOCKS} from './blocks.js?v=21';
export const CELLS={tenement:0,loft:1,apartment:2,postwar:3,curtain:4,townhouse:5,solid:6,castiron:7,storefront:8,residential:9,stoop:10,generic:11};
// Bay width (m) per upper type: the horizontal window rhythm.
export const BAY={tenement:2.6,loft:4.2,apartment:3.0,postwar:3.4,curtain:1.6,townhouse:2.5,solid:4.5,castiron:4.4};
// Material colours (sRGB hex), chosen per building by a stable hash so neighbours vary.
export const PALETTE={brickRed:[0x9c5a44,0x8f4d3a,0xa8634b,0x86503f],brickBrown:[0x74513f,0x6a4a3c,0x7d5a45],brickBuff:[0xc4ab86,0xb89f7c,0xcdb795],brownstone:[0x7a5644,0x6e4d3d],
 limestone:[0xcfc6b2,0xc4bba6],castIron:[0xd6cfbf,0xc9c1ae,0xb9b3a6],whiteBrick:[0xd7d2c6,0xcfcac0,0xbfb9ac],glass:[0x8c979c,0x7f8b92,0x9aa2a2],stucco:[0xd8ccb2,0xc9b99a],concrete:[0xb9b4aa,0xaaa59b]};
const hash=n=>{const v=Math.sin(n*127.1+31.7)*43758.5453;return v-Math.floor(v);};
export const blockOf=b=>b.bbl?+b.bbl.slice(1,6):null;
export function tier3Enabled(b){const k=blockOf(b);return k!=null&&TIER3_BLOCKS.has(k);}
// Classification. Returns {upper, ground, material, color, bay}.
export function classify(b){const cls=(b.cls||'').toUpperCase(),c=cls[0]||'',yr=b.yr||1900,h=b.h||10,fl=b.floors||Math.max(1,Math.round(h/3.4)),seed=b.bin||h;
 const pick=k=>{const p=PALETTE[k];return p[Math.floor(hash(seed*1.7)*p.length)%p.length];};
 let upper,ground,material;
 const shops=/^(S|K|O)/.test(cls)||cls==='C7'||cls==='D6'||cls==='D7'||cls==='R5'||cls==='R7'||cls==='R8';
 if(/^(M)/.test(cls)){upper='solid';ground='residential';material=hash(seed)<.6?'brownstone':'limestone';}
 else if(/^(G|E|F|Z)/.test(cls)||(h<7&&yr>=1930)){upper='solid';ground='storefront';material=hash(seed)<.5?'brickRed':'concrete';}
 else if(yr>=1995&&h>18){upper='curtain';ground='storefront';material=hash(seed)<.6?'glass':'brickBrown';}
 else if(yr>=1946){upper=h>14?'postwar':'apartment';ground=shops?'storefront':'residential';material=hash(seed)<.45?'whiteBrick':hash(seed+1)<.5?'brickRed':'brickBrown';}
 else if(/^(A|B)/.test(cls)||(fl<=4&&h<15&&yr<1880&&!shops)){upper='townhouse';ground='stoop';material=hash(seed)<.3?'brownstone':'brickRed';}
 else if(/^(K|O|L|H|W|P)/.test(cls)&&h>14){upper=yr<1890?'castiron':'loft';ground='storefront';material=yr<1890?'castIron':(hash(seed)<.5?'brickBuff':'brickRed');}
 else if(c==='D'||(fl>=7&&!shops)){upper='apartment';ground=shops?'storefront':'residential';material=hash(seed)<.5?'brickBuff':'brickRed';}
 else{upper='tenement';ground=shops?'storefront':'residential';material=hash(seed)<.6?'brickRed':hash(seed+3)<.5?'brickBrown':'brickBuff';}
 return {upper,ground,material,color:pick(material),bay:BAY[upper]};}
// Packed attribute: upper cell + 16 * ground cell.
export const facadeCode=f=>CELLS[f.upper]+16*CELLS[f.ground];
export const GENERIC_CODE=CELLS.generic+16*CELLS.generic;

// ---- Browser only ----
// 4 x 3 atlas of 128 px cells. Walls are drawn mid-grey (the vertex colour brings the material),
// trim lighter, glass dark so windows stay dark under any tint.
export function facadeAtlas(T){const S=128,c=document.createElement('canvas');c.width=S*4;c.height=S*3;const g=c.getContext('2d');
 const WALL='#c9c9c9',TRIM='#f4f2ee',GLASS='#3d444a',DARK='#2a2d30',SASH='#e8e6e0';
 const cell=(i,draw)=>{const x0=(i%4)*S,y0=Math.floor(i/4)*S;g.save();g.translate(x0,y0);g.fillStyle=WALL;g.fillRect(0,0,S,S);
  // Helper in cell units, v from the bottom.
  const R=(u0,v0,u1,v1,col)=>{g.fillStyle=col;g.fillRect(u0*S,(1-v1)*S,(u1-u0)*S,(v1-v0)*S);};draw(R);g.restore();};
 const win=(R,u0,u1,v0,v1,{lintel=0,sill=1,sash=1}={})=>{R(u0,v0,u1,v1,GLASS);if(sash){R(u0,v0+(v1-v0)*.48,u1,v0+(v1-v0)*.52,SASH);R(u0,v0,u0+.02,v1,SASH);R(u1-.02,v0,u1,v1,SASH);R(u0,v1-.02,u1,v1,SASH);}if(sill)R(u0-.03,v0-.04,u1+.03,v0,TRIM);if(lintel)R(u0-.04,v1,u1+.04,v1+lintel,TRIM);};
 cell(0,R=>win(R,.29,.71,.22,.78,{lintel:.07}));// tenement
 cell(1,R=>{R(0,0,.08,1,'#bdbdbd');R(.92,0,1,1,'#bdbdbd');win(R,.13,.87,.12,.86);R(.49,.12,.51,.86,SASH);});// loft
 cell(2,R=>win(R,.27,.73,.25,.75));// apartment
 cell(3,R=>{win(R,.19,.81,.3,.72,{sill:0,sash:0});R(.5,.3,.51,.72,'#8a8f93');});// postwar
 cell(4,R=>{R(0,0,1,1,'#55606a');R(0,0,1,.2,'#9aa1a6');R(0,0,.03,1,'#c7cbcc');});// curtain wall
 cell(5,R=>win(R,.28,.72,.18,.85,{lintel:.08}));// townhouse
 cell(6,R=>{R(0,0,1,.04,TRIM);win(R,.41,.59,.32,.7,{sash:0});});// solid (church, garage, institution)
 cell(7,R=>{R(0,0,.11,1,TRIM);R(.89,0,1,1,TRIM);win(R,.15,.85,.1,.9,{sill:0});R(0,.9,1,1,TRIM);});// cast iron
 cell(8,R=>{R(0,.8,1,1,'#7a746c');R(0,.78,1,.81,TRIM);R(0,0,1,.1,'#a9a9a9');R(.06,.1,.94,.78,'#66737a');R(.06,.5,.94,.52,'#8c969a');R(.48,.1,.52,.78,'#4a4f53');R(0,0,.06,1,'#d0d0d0');R(.94,0,1,1,'#d0d0d0');});// storefront
 cell(9,R=>{R(0,0,1,.12,'#b8b8b8');win(R,.28,.72,.3,.75,{sash:1});});// residential ground
 cell(10,R=>{R(0,0,1,.1,TRIM);R(.3,.1,.7,.8,DARK);R(.27,.8,.73,.86,TRIM);R(.25,0,.75,.1,TRIM);});// stoop door
 cell(11,R=>{R(0,0,1,.09,'#ece9e2');R(.24,.24,.76,.8,'#4b5157');R(.24,.21,.76,.26,'#e2ded6');R(0,0,1,1,'rgba(255,255,255,0)');});// generic (old massing)
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
// Shader patch: pick the atlas cell per fragment from the packed attribute and the floor index.
export function patchFacadeMaterial(m){m.onBeforeCompile=sh=>{
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aFacade;\nvarying float vFacade;').replace('#include <begin_vertex>','#include <begin_vertex>\nvFacade=aFacade;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFacade;').replace('#include <map_fragment>',`
#ifdef USE_MAP
 float code=floor(vFacade+.5),upperC=mod(code,16.),groundC=floor(code/16.);
 vec2 wuv=vMapUv;float cellI=wuv.y<1.?groundC:upperC;
 // Townhouse ground: a door every third bay, windows between.
 if(cellI==10.&&mod(floor(wuv.x),3.)!=0.)cellI=9.;
 vec2 org=vec2(mod(cellI,4.),floor(cellI/4.)),f=fract(wuv);f.y=1.-f.y;
 vec2 auv=(org+.015+f*.97)/vec2(4.,3.);auv.y=1.-auv.y;
 vec4 sampledDiffuseColor=textureGrad(map,auv,dFdx(wuv)/vec2(4.,3.),dFdy(wuv)/vec2(4.,3.));
 diffuseColor*=sampledDiffuseColor;
#endif`);};
 m.customProgramCacheKey=()=>'nv-facade-atlas';m.needsUpdate=true;return m;}
