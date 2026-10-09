import * as T from '../../vendor/three.module.js';
import {Parts,Face} from './kit.js?v=24';
import {buildKit,volumePieces,tier2Materials} from '../tier2/kit.js?v=24';
import data from '../data/campus-data.js?v=24';
// Tier A neighbourhood landmarks that the facade kit can carry (Step 4B): commercial and institutional
// buildings whose character is their wall, window rhythm, base and cornice. Volumes from the NYC 3D
// Building Model; materials from the shared second-tier palette; each has its own extras. Entrance doors
// come back from the kit as separate records (group.userData.doors). Every spec cites its sources and says
// what was observed on Street View; see RESEARCH/checklists/<slug>.md.
export const TIERA_KIT=[
 {slug:'onefifth',name:'One Fifth Avenue',bin:1008847,status:'observed',seen:'Street View from Fifth Ave at Washington Sq N, Apr 2026: pale buff brick (not brown), unbroken vertical piers with dark recessed window columns and spandrels, stepped and chamfered crown, two-storey stone base with a dark entrance canopy on Fifth Ave',
  source:'1 Fifth Avenue at Washington Square North, 1927 (Helmle, Corbett & Harrison with Sugarman & Berger). Art Deco apartment-hotel tower of 27 storeys with setbacks and chamfered upper corners, brick piers running unbroken to the crown, a stone base of two storeys; 85 m in the NYC data.',
  wall:'brickBuff',trim:'limestone',style:'piers',pitch:2.4,pier:.62,depth:.5,floor:3.0,storeys:27,ground:{h:7.0,style:'base',mat:'limestone',win:[1.6,3.4],pitch:3.6},cornice:'band',doors:[{rank:0,at:.5,w:2.4,h:3.2,canopy:2.2}]},
 {slug:'wanamaker',name:'770 Broadway (Wanamaker Annex)',bin:1008952,status:'observed',seen:'Photo sphere at Lafayette St and Astor Pl (Jan 2023) on Street View: pale cream terracotta, an even grid of wide windows, partly under scaffolding at the time',
  source:'770 Broadway, the block between Broadway, Lafayette St, Astor Pl and E 9th St; 1903-07 (D. H. Burnham & Co.) as the Wanamaker department store annex. Fifteen storeys of pale terracotta-faced steel frame with wide three-part windows, a tall glazed base (Wegmans since 2023) and a heavy cornice; 65 m in the NYC data.',
  wall:'terracotta',trim:'limestone',style:'punched',pitch:3.1,win:[2.3,2.3],floor:3.95,storeys:15,ground:{h:6.0,style:'storefront',mat:'limestone',pitch:5.2},cornice:'modillion',doors:[{rank:0,at:.5,w:3.2,h:3.2,canopy:2.4},{rank:1,at:.5,w:2.4,h:3.0}]},
 {slug:'cable',name:'The Cable Building (Angelika Film Center)',bin:1008240,status:'estimate',
  source:'611 Broadway / 18 W Houston St, 1892-94 (McKim, Mead & White) for the Broadway Cable Railroad; the Angelika Film Center since 1989 at the Houston and Mercer corner. Beaux-Arts: rusticated stone base, buff brick and terracotta above, round-arched top storey, cornice; 41 m in the NYC data.',
  wall:'brickBuff',trim:'limestone',style:'punched',pitch:2.9,win:[1.4,2.2],floor:3.9,storeys:9,base:{to:9,mat:'limestone'},ground:{h:5.0,style:'storefront',mat:'limestone',pitch:4.4},cornice:'modillion',doors:[{rank:0,at:.5,w:2.6,h:3.2,canopy:1.8}]},
 {slug:'strand',name:'826 Broadway (the Strand)',bin:1009208,status:'observed',seen:'Photo sphere across Broadway at 12th St on Street View (about 2018): pale cream upper storeys with an even grid of windows over the red awnings of the shop; changed from red brick',
  source:'826-828 Broadway at E 12th St, 1902 (William H. Birkmire); the Strand Book Store since 1957; LPC 2019 (826 Broadway). Eleven storeys of red brick and terracotta over a cast-iron storefront base, with the red awnings and sidewalk book carts of the shop.',
  wall:'brickWhite',trim:'limestone',style:'punched',pitch:2.8,win:[1.5,2.2],floor:3.7,storeys:11,ground:{h:4.6,style:'storefront',mat:'castIron',pitch:3.6},cornice:'modillion',doors:[{rank:0,at:.35,w:2.2,h:3.0}]},
 {slug:'cooperunion',name:'The Cooper Union Foundation Building',bin:1008788,status:'observed',seen:'Street View from Cooper Square at Astor Place, Apr 2026: warm reddish-brown stone (lighter than dark brownstone), deep round-arched ground arcade, paired round-arched windows on every floor, heavy cornice',
  source:'7 E 7th St at Cooper Square, 1853-59 (Frederick A. Peterson); LPC 1965; Abraham Lincoln spoke in the Great Hall in 1860. Italianate brownstone over one of the first wrought-iron beam frames: a round-arched arcade at the ground storey, round-arched windows in pairs above, a bracketed cornice; 32 m in the NYC data.',
  wall:'sandstone',trim:'sandstone',style:'punched',pitch:3.2,win:[1.3,2.6],pair:1,arch:1,floor:4.6,storeys:6,ground:{h:5.6,style:'base',mat:'sandstone',win:[2.4,4.2],pitch:3.6,arch:1,first:.3},cornice:'modillion',corniceMat:'sandstone',doors:[{rank:0,at:.5,w:2.6,h:3.4}]}];
export const TIERA_KIT_BINS=new Map(TIERA_KIT.map(s=>[s.bin,s]));
const byBin=new Map(data.buildings.map(b=>[b.bin,b]));
export function buildTierAKit(b){const spec=TIERA_KIT_BINS.get(b.bin),P=new Parts(),bb=byBin.get(b.bin)||b;const r=buildKit(P,spec,volumePieces(bb,[]),{bins:new Set([b.bin])});
 const mats=tier2Materials(),g=P.build(mats);g.name=spec.name;g.position.y=.15;g.userData.tris=P.tris;g.userData.doors=r.doors;
 // Doors as their own mesh (one per entrance), at their real positions.
 if(r.doors.length){const geo=new T.BoxGeometry(1,1,.12),dm=new T.MeshStandardMaterial({color:0x2b2621,roughness:.55,metalness:.35}),im=new T.InstancedMesh(geo,dm,r.doors.length),o=new T.Object3D();
  r.doors.forEach((d,i)=>{o.position.set(d.pos[0],d.pos[1]-.15,d.pos[2]);o.position.addScaledVector(new T.Vector3(...d.normal),-.12);o.rotation.set(0,Math.atan2(d.normal[0],d.normal[2]),0);o.scale.set(d.w,d.h,1);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
  im.name='doors';g.add(im);g.userData.materials=[dm];}
 return g;}
