import * as T from '../../vendor/three.module.js';
import {Parts,Face,canvas} from './kit.js?v=23';
import {pieces,walls,roofs,curtain} from './facade.js?v=23';
import model3d from '../data/campus-3d.js?v=23';
// 41 Cooper Square, the Cooper Union's academic building (Morphosis, Thom Mayne, 2009). A glass box wrapped
// in a skin of perforated stainless-steel panels held off the glass on a frame, the skin torn open in a
// tall, twisting cut on the Cooper Square (west) front that reveals the curved glass atrium wall behind.
// Volume from the NYC 3D Building Model (BIN 1006642): the main block to 37.3 m and a lower east part to
// 29.6 m. See RESEARCH/checklists/cooper41.md for the Street View check.
export const COOPER41={bin:1006642,skin:1.1};
function perforated(){const c=canvas(128,128),g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,128,128);g.fillStyle='#000';for(let y=4;y<128;y+=8)for(let x=(y/8)%2?8:4;x<128;x+=8){g.beginPath();g.arc(x,y,3.1,0,7);g.fill();}
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1/1.2,1/1.2);return t;}
export function cooper41Parts(b){const P=new Parts(),ps=pieces(model3d[b.bin]),C=COOPER41;
 for(const w of walls(ps)){curtain(P,w,w.y0,w.y1,{glass:'glass',frames:'frame',mw:1.5,floor:3.9,spandrel:.5});
  // Skin: perforated panels on a frame, 1.1 m out; the west front is cut open by the twisting tear.
  const west=w.n[0]<-.5&&w.len>40,f=new Face(w.face.at(0,0,C.skin),w.face.u,w.face.v),y0=Math.max(w.y0,4.2),y1=w.y1+.6;
  if(west){const L=w.len,cut=[];for(let i=0;i<=12;i++){const t=i/12,y=y0+(y1-y0)*t;cut.push([L*.38+Math.sin(t*3.2)*3.5+t*4,y]);}for(let i=12;i>=0;i--){const t=i/12,y=y0+(y1-y0)*t;cut.push([L*.38+Math.sin(t*3.2)*3.5+t*4+6+Math.sin(t*5)*2.2,y]);}
   P.poly('skin',f,[[0,y0],[L,y0],[L,y1],[0,y1]],[cut.map(([u,v])=>[u,Math.min(y1-.2,Math.max(y0+.2,v))])]);
   // The atrium wall seen through the tear: a bulging curve of clear glass.
   for(let i=0;i<10;i++){const v0=y0+(y1-y0)*i/10,v1=y0+(y1-y0)*(i+1)/10,u=L*.38+i*.4;P.quad('glassClear',w.face.at(u,v0,.6+Math.sin(i/9*Math.PI)*.8),w.face.at(u+4,v0,.6+Math.sin(i/9*Math.PI)*.8),w.face.at(u+4,v1,.6+Math.sin((i+1)/9*Math.PI)*.8),w.face.at(u,v1,.6+Math.sin((i+1)/9*Math.PI)*.8),w.face.n);}}
  else if(w.len>3)P.rect('skin',f,0,w.len,y0,y1,0);
  // Struts from the glass to the skin every 3 m.
  for(let u=1.5;u<w.len;u+=3)for(let y=y0+1;y<y1;y+=3.9)P.block('frame',w.face,u-.04,u+.04,y-.04,y+.04,0,C.skin);}
 roofs(P,ps,'roof');return {P};}
export function buildCooper41(b){const {P}=cooper41Parts(b);const perf=perforated();
 const m={skin:new T.MeshStandardMaterial({color:0xaeb3b6,metalness:.45,roughness:.55,alphaMap:perf,alphaTest:.5,side:T.DoubleSide}),glass:new T.MeshStandardMaterial({color:0x34414a,roughness:.15,metalness:.5}),
  glassClear:new T.MeshStandardMaterial({color:0x8fa2a8,roughness:.08,metalness:.3,transparent:true,opacity:.45,depthWrite:false,side:T.DoubleSide}),frame:new T.MeshStandardMaterial({color:0x8a8f93,roughness:.4,metalness:.6}),roof:new T.MeshStandardMaterial({color:0x6a6a66,roughness:.9})};
 const g=P.build(m);g.name='41 Cooper Square';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=[...Object.values(m),perf];return g;}
