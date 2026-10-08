import * as T from '../../vendor/three.module.js';
import {Parts,stoneTextures} from './kit.js?v=23';
import {Frame,gothicChurch} from './gothic.js?v=23';
// First Presbyterian Church, 48 Fifth Avenue between W 11th and W 12th Sts (Joseph C. Wells, 1844-46; LPC
// Greenwich Village Historic District). Gothic Revival in brownstone, its tower on Fifth Avenue modelled on
// the tower of Magdalen College, Oxford: buttressed, with tall paired belfry lights, a battlemented top and
// octagonal corner turrets. The NYC 3D Building Model has no roof for this lot, so the plan comes from the
// building footprint (BIN 1009582; the tower is the 7.5 m projection on Fifth Avenue) and the heights are
// estimates checked on Street View; see RESEARCH/checklists/firstpres.md.
export const FIRSTPRES={bin:1009582,origin:[175.4,356.9],axis:299};
export function firstpresParts(){const P=new Parts(),F=new Frame(FIRSTPRES.origin,FIRSTPRES.axis);
 gothicChurch(P,F,{mat:'stone',tower:{u0:-3.75,u1:3.75,v0:-3.75,v1:3.75,top:33,style:'battlement',pinnacles:3.4,turret:1.3,spirelet:2.6},nave:{u0:3.75,u1:21,v0:-6,v1:6,eave:11,ridge:18.3,bay:3.6},
  aisles:[{u0:3.75,u1:21,v0:-10.9,v1:-6,eave:6.2,high:9},{u0:3.75,u1:21,v0:6,v1:10.6,eave:6.2,high:9}]});
 return {P};}
export function buildFirstPres(){const {P}=firstpresParts();const s=stoneTextures({base:'#806052',course:.42,block:1.0,tileW:3.0,seed:37});
 const m={stone:new T.MeshStandardMaterial({map:s.map,normalMap:s.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.9}),trim:new T.MeshStandardMaterial({color:0x8d6a58,roughness:.85}),slate:new T.MeshStandardMaterial({color:0x4b5055,roughness:.75}),
  glass:new T.MeshStandardMaterial({color:0x2c3138,roughness:.3,metalness:.3}),louvre:new T.MeshStandardMaterial({color:0x2a2724,roughness:.8}),door:new T.MeshStandardMaterial({color:0x3a2a1e,roughness:.7}),metal:new T.MeshStandardMaterial({color:0x3d3f40,roughness:.5,metalness:.6})};
 const g=P.build(m);g.name='First Presbyterian Church';g.position.y=.15;g.userData.tris=P.tris;g.userData.materials=Object.values(m);return g;}
