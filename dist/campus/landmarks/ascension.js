import * as T from '../../vendor/three.module.js';
import {Parts,stoneTextures} from './kit.js?v=23';
import {pieces,walls,roofs,punched} from './facade.js?v=23';
import {Frame,gothicChurch} from './gothic.js?v=23';
import model3d from '../data/campus-3d.js?v=23';
// Church of the Ascension, Fifth Avenue at W 10th St (Richard Upjohn, 1840-41; LPC Greenwich Village Historic
// District). Gothic Revival in brownstone: a square tower on Fifth Avenue with buttresses and a battlemented
// top with corner pinnacles, a nave running west under a steep roof with an aisle on the south side, and the
// parish buildings behind. Plan and heights from the NYC 3D Building Model (BIN 1009540): tower 7.5 m square
// to 28.1 m, nave 12.3 m wide to an 18.1 m ridge, south aisle to 10.8 m. Axis bearing 299 (west from Fifth).
// See RESEARCH/checklists/ascension.md for what was observed on Street View and what is still an estimate.
export const ASCENSION={bin:1009540,origin:[128.7,272.6],axis:299};
export function ascensionParts(b){const P=new Parts(),F=new Frame(ASCENSION.origin,ASCENSION.axis);
 gothicChurch(P,F,{mat:'stone',tower:{u0:-4.4,u1:3.1,v0:-3.5,v1:3.4,top:28.1,style:'battlement',pinnacles:2.4},nave:{u0:3.1,u1:33.2,v0:-6.2,v1:6.1,eave:11.6,ridge:18.1,bay:3.8},
  aisles:[{u0:3.1,u1:33.2,v0:-11.5,v1:-6.2,eave:7.2,high:10.8}]});
 const rest=pieces(model3d[b.bin]).filter(p=>p.z<8);for(const w of walls(rest)){if(w.y1-w.y0<2.5)continue;punched(P,w,w.y0,w.y1,{wall:'stone',glass:'glass',pitch:2.8,floor:3.4,win:[1.0,1.9],parapet:.8,reveal:.25,first:1.0,margin:.8});}roofs(P,rest,'slate');
 return {P};}
export function buildAscension(b){const {P}=ascensionParts(b);const s=stoneTextures({base:'#7d5a48',course:.42,block:1.0,tileW:3.0,seed:31});
 const m={stone:new T.MeshStandardMaterial({map:s.map,normalMap:s.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.9}),trim:new T.MeshStandardMaterial({color:0x8a6654,roughness:.85}),slate:new T.MeshStandardMaterial({color:0x4b5055,roughness:.75}),
  glass:new T.MeshStandardMaterial({color:0x2c3138,roughness:.3,metalness:.3}),louvre:new T.MeshStandardMaterial({color:0x2a2724,roughness:.8}),door:new T.MeshStandardMaterial({color:0x3a2a1e,roughness:.7}),metal:new T.MeshStandardMaterial({color:0x3d3f40,roughness:.5,metalness:.6}),frame:new T.MeshStandardMaterial({color:0x3d3f40,roughness:.5,metalness:.4})};
 const g=P.build(m);g.name='Church of the Ascension';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(m);return g;}
