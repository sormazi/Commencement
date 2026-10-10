import * as T from '../../vendor/three.module.js';
import {Parts,smooth,circle,grainTextures} from './kit.js?v=24';
// The edge of Union Square (Step 4B, Tier A): the park's public-domain statues, each on its own granite
// pedestal at the position the NYC data gives, carved at the level a passer-by reads from the path.
//  - George Washington, equestrian (Henry Kirke Brown, 1856), on the south plaza. Bronze; Barre granite
//    pedestal by Richard Upjohn, 12'2" x 7'9" in plan and 15' high, rounded at both ends; overall 26'4".
//    Washington is bareheaded, right arm raised and reaching forward, left hand holding the reins and his
//    hat, sword at his left side; the horse walks with its near (left) foreleg lifted. Faces south.
//  - Marquis de Lafayette (Frederic Auguste Bartholdi, cast 1873, dedicated 1876), pedestal by
//    H. W. DeStuckle: right hand clasping his sword hilt to his chest, the blade across his body, a cloak
//    over the left shoulder gathered in the left hand; a bronze base like a ship's bow; a square granite
//    pedestal with a frieze and laurel garlands.
//  - Abraham Lincoln (Henry Kirke Brown, 1870): a long cloak to the ankles, right hand at the chest, left
//    hand down with a scroll, on a tall tapering granite pedestal with stepped base.
//  - Mohandas Gandhi (Kantilal B. Patel, 1986) is a copyrighted work: only its granite plinth is modelled,
//    as with the other recent sculptures (PROGRESS.md, 8 Oct).
// Sources (looked at only, not saved): Wikimedia Commons photographs "Washington equestrian statue Union
// Square" (CC0, Jul 2026 and Nov 2024), "Lafayette statue Union Square" (CC BY-SA 4.0), "Abraham Lincoln
// Statue (36430213985)" (CC BY-SA 2.0); Wikipedia, George Washington (Brown) for dimensions and makers.
// Facing directions other than Washington's are estimates (Lincoln faces south down the park's axis;
// Lafayette is taken to face west into the park); see RESEARCH/union-square.md.
export const UNION_SQUARE={
 washington:{p:[541.28,459.91],face:'south'},
 lafayette:{p:[600.95,494.77],face:'west'},
 lincoln:{p:[594.35,556.36],face:'south'},
 gandhi:{p:[488.08,479.36],face:'south'}};
export const HANDLED=/^(George Washington|Marquis de Lafayette|Abraham Lincoln|Mohandas Gandhi)$/;
const M=(x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=sx,sz=sx)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
// Tapered cylinder between two points in a local frame, with a ball at the far joint.
function limb(P,name,base,a,b,r0,r1,seg=8,ball=true){const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),L=d.length();
 const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());P.cyl(name,r0,r1,L,base.clone().multiply(new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),q,new T.Vector3(1,1,1))),seg);
 if(ball)P.sphere(name,r1*1.02,base.clone().multiply(M(...b)),seg,5);}
const blob=(P,name,base,x,y,z,sx,sy,sz,rx=0)=>P.sphere(name,1,base.clone().multiply(M(x,y,z,rx,0,0,sx,sy,sz)),14,10);
// Horizontal slab of a stadium plan (straight sides, half-round ends), length along local z.
function stadium(P,name,base,len,wid,y0,y1){const r=wid/2,s=len/2-r,pts=[];for(let i=0;i<=10;i++){const a=-Math.PI/2+i/10*Math.PI;pts.push([Math.cos(a)*r,s+Math.sin(a)*r]);}
 for(let i=0;i<=10;i++){const a=Math.PI/2+i/10*Math.PI;pts.push([Math.cos(a)*r,-s+Math.sin(a)*r]);}
 const g=new T.ExtrudeGeometry(new T.Shape(pts.map(([x,z])=>new T.Vector2(x,z))),{depth:y1-y0,bevelEnabled:false,curveSegments:2});P.geo(name,g,base.clone().multiply(M(0,y1,0,Math.PI/2,0,0)));}
const slab=(P,name,base,w,d,y0,y1,top=null)=>{if(top==null){P.geo(name,new T.BoxGeometry(w,y1-y0,d),base.clone().multiply(M(0,(y0+y1)/2,0)));return;}
 // A tapering slab (frustum of a square pyramid) from w x d at y0 to top x top*d/w at y1.
 const g=new T.CylinderGeometry(top/Math.SQRT2,w/Math.SQRT2,y1-y0,4,1);g.rotateY(Math.PI/4);g.scale(1,1,d/w);P.geo(name,g,base.clone().multiply(M(0,(y0+y1)/2,0)));};

// Washington on horseback; local frame: horse faces +z, ground at y=0 (top of the pedestal).
function equestrian(P,base){const b='bronze';
 // Horse: barrel, chest and quarters, arched neck, head bowed towards the chest, ears, mane and tail.
 blob(P,b,base,0,1.68,0,.55,.6,1.12);blob(P,b,base,0,1.78,.88,.5,.62,.52);blob(P,b,base,0,1.8,-.88,.58,.62,.6);
 limb(P,b,base,[0,2.0,1.0],[0,2.55,1.42],.36,.27,10);limb(P,b,base,[0,2.55,1.42],[0,2.82,1.62],.27,.21,10);
 limb(P,b,base,[0,2.84,1.66],[0,2.35,2.06],.2,.13,10);blob(P,b,base,0,2.28,2.1,.13,.14,.16);
 for(const s of [-1,1])P.cyl(b,.06,.01,.22,base.clone().multiply(M(s*.09,3.0,1.6,-.3,0,s*.2)),5);
 P.geo(b,new T.BoxGeometry(.08,.22,.95),base.clone().multiply(M(0,2.72,1.3,-.95,0,0)));
 limb(P,b,base,[0,2.0,-1.38],[0,1.4,-1.72],.17,.13,8);limb(P,b,base,[0,1.4,-1.72],[0,.82,-1.62],.13,.07,8);
 // Legs: shoulder or hip, knee or hock, fetlock, hoof. The near (left) foreleg is lifted and folded.
 const leg=(pts,r)=>{for(let i=1;i<pts.length;i++)limb(P,b,base,pts[i-1],pts[i],r[i-1],r[i],8);P.cyl(b,.11,.09,.12,base.clone().multiply(M(...pts[pts.length-1])),8);};
 leg([[.27,1.55,.95],[.27,.9,1.02],[.27,.32,1.0],[.27,.07,1.04]],[.17,.09,.07,.07]);
 leg([[-.27,1.55,.95],[-.27,1.12,1.42],[-.27,.72,1.26],[-.27,.6,1.12]],[.17,.09,.07,.07]);
 leg([[.3,1.55,-1.0],[.3,.95,-1.32],[.3,.3,-1.16],[.3,.07,-1.12]],[.2,.1,.07,.07]);
 leg([[-.3,1.55,-1.0],[-.3,.98,-1.25],[-.3,.36,-.98],[-.3,.12,-.9]],[.2,.1,.07,.07]);
 // Saddle cloth and saddle, breast strap, bridle reins.
 P.geo(b,new T.CylinderGeometry(.64,.64,.95,14,1,true,-Math.PI*.45,Math.PI*.9).rotateZ(Math.PI/2).rotateY(Math.PI/2),base.clone().multiply(M(0,1.72,-.05,0,0,0,1,1,1)));
 blob(P,b,base,0,2.26,-.08,.42,.12,.55);
 // Rider: thighs over the barrel, boots in the stirrups, coat skirts, torso, epaulettes, bare head with
 // queue, the right arm raised and reaching forward, the left hand low with reins and hat, sword at left.
 for(const s of [-1,1]){limb(P,b,base,[s*.2,2.42,-.12],[s*.5,2.12,.32],.17,.14,8);limb(P,b,base,[s*.5,2.12,.32],[s*.54,1.42,.18],.13,.1,8);
  P.geo(b,new T.BoxGeometry(.15,.13,.38),base.clone().multiply(M(s*.55,1.33,.26)));P.torus(b,.09,.015,base.clone().multiply(M(s*.55,1.26,.22,0,Math.PI/2,0)),Math.PI*2,10);}
 P.lathe(b,[[.3,2.3],[.44,2.1],[.52,1.88]],base.clone().multiply(M(0,0,-.12)),14,Math.PI*.55,Math.PI*.9);
 P.lathe(b,[[0,2.36],[.28,2.38],[.3,2.6],[.33,2.9],[.36,3.12],[.28,3.2],[.1,3.24],[0,3.25]],base.clone().multiply(M(0,0,-.08,0,0,0,1,1,.78)),14);
 for(const s of [-1,1])blob(P,b,base,s*.31,3.12,-.06,.12,.06,.12);
 P.cyl(b,.08,.09,.14,base.clone().multiply(M(0,3.28,-.06)),8);blob(P,b,base,0,3.46,-.04,.16,.2,.18);blob(P,b,base,0,3.44,.12,.04,.06,.05);blob(P,b,base,0,3.42,-.2,.09,.12,.07);
 limb(P,b,base,[.33,3.08,-.04],[.48,3.24,.36],.11,.09,8);limb(P,b,base,[.48,3.24,.36],[.56,3.5,.78],.09,.07,8);P.geo(b,new T.BoxGeometry(.06,.2,.13),base.clone().multiply(M(.57,3.6,.86,-.6,0,0)));
 limb(P,b,base,[-.33,3.08,-.04],[-.44,2.66,.12],.11,.09,8);limb(P,b,base,[-.44,2.66,.12],[-.3,2.5,.48],.09,.07,8);
 const hat=new T.ExtrudeGeometry(new T.Shape(smooth(circle(.26,3),5).map(p=>new T.Vector2(...p))),{depth:.1,bevelEnabled:false,curveSegments:3});P.geo(b,hat,base.clone().multiply(M(-.48,2.36,.42,0,Math.PI/2,0)));
 for(const s of [-1,1])limb(P,b,base,[s*.08,2.45,.58],[s*.18,2.58,1.55],.012,.012,4,false);
 P.geo(b,new T.BoxGeometry(.04,1.15,.05),base.clone().multiply(M(-.5,1.86,-.02,.22,0,0)));P.torus(b,.07,.012,base.clone().multiply(M(-.5,2.48,.1,0,Math.PI/2,0)),Math.PI*1.4,8);}

// A standing figure in eighteenth-century or nineteenth-century dress, about 3.3 m tall, facing +z.
function standing(P,base,{who}){const b='bronze',L=m=>base.clone().multiply(m);
 for(const s of [-1,1]){blob(P,b,base,s*.13,.06,.07,.1,.07,.2);limb(P,b,base,[s*.13,.08,0],[s*.12,1.0,0],.1,.11);limb(P,b,base,[s*.12,1.0,0],[s*.12,1.56,0],.11,.13);}
 if(who==='lincoln'){// Frock coat under a long cloak that falls to the ankles.
  P.lathe(b,[[.5,.15],[.47,.8],[.42,1.6],[.38,2.3],[.42,2.62],[.3,2.72]],L(M(0,0,-.04,0,0,0,1,1,.78)),16,Math.PI*.2,Math.PI*1.6);}
 else{P.lathe(b,[[.27,1.78],[.31,1.6],[.38,1.2],[.44,.86]],L(M()),16,.5,Math.PI*2-1);}
 P.lathe(b,[[0,1.5],[.25,1.52],[.27,1.75],[.3,2.1],[.33,2.38],[.34,2.58],[.28,2.68],[.1,2.75],[0,2.76]],L(M(0,0,0,0,0,0,1,1,.74)),14);
 P.cyl(b,.08,.09,.18,L(M(0,2.8,0)),8);blob(P,b,base,0,3.0,.01,.17,.22,.19);blob(P,b,base,0,2.98,.18,.04,.06,.05);
 if(who==='lafayette'){blob(P,b,base,0,2.98,-.16,.1,.13,.07);for(const s of [-1,1])P.cyl(b,.045,.045,.16,L(M(s*.16,3.02,-.02,Math.PI/2,0,0)),6);
  // Right hand clasping the hilt at the chest, the blade running down across the body to the left.
  limb(P,b,base,[.33,2.58,0],[.28,2.12,.2],.11,.09);limb(P,b,base,[.28,2.12,.2],[-.02,2.32,.28],.09,.08);
  P.geo(b,new T.BoxGeometry(.035,1.55,.02),L(M(-.22,1.62,.3,0,0,-.42)));P.geo(b,new T.BoxGeometry(.26,.04,.05),L(M(.02,2.36,.3,0,0,-.42)));
  // Cloak over the left shoulder, gathered in the left hand.
  limb(P,b,base,[-.33,2.58,0],[-.4,2.05,.08],.11,.09);limb(P,b,base,[-.4,2.05,.08],[-.46,1.7,.32],.09,.08);
  P.lathe(b,[[.36,2.66],[.42,2.2],[.5,1.4],[.56,.5],[.58,.22]],L(M(-.08,0,-.04)),14,Math.PI*1.05,Math.PI*.95);}
 else{blob(P,b,base,0,3.12,-.02,.18,.08,.19);// Lincoln: the hair, the beard along the jaw.
  blob(P,b,base,0,2.88,.1,.13,.1,.08);
  limb(P,b,base,[.33,2.58,0],[.3,2.12,.18],.11,.09);limb(P,b,base,[.3,2.12,.18],[.06,2.34,.3],.09,.08);
  limb(P,b,base,[-.33,2.58,0],[-.38,2.02,.04],.11,.09);limb(P,b,base,[-.38,2.02,.04],[-.36,1.5,.14],.09,.08);P.cyl(b,.05,.05,.42,L(M(-.36,1.38,.18,.25,0,0)),8);
  P.lathe(b,[[.36,2.66],[.46,2.3],[.52,1.5],[.55,.6],[.56,.18]],L(M(0,0,-.03,0,0,0,1,1,.86)),16,Math.PI*1.12,Math.PI*1.25);}}

// Pedestals. All granite; heights from the sources where given, otherwise read off the photographs.
function washingtonPedestal(P,base){const g='granite';
 stadium(P,g,base,4.7,3.3,0,.32);stadium(P,g,base,4.35,3.0,.32,.62);stadium(P,g,base,3.95,2.6,.62,.8);
 stadium(P,g,base,3.71,2.36,.8,2.35);stadium(P,g,base,3.8,2.45,2.35,2.5);stadium(P,g,base,3.71,2.36,2.5,4.0);
 stadium(P,g,base,3.95,2.6,4.0,4.3);stadium(P,g,base,3.82,2.47,4.3,4.57);
 // The raised tablet on each long side.
 for(const s of [-1,1])P.geo(g,new T.BoxGeometry(.08,1.0,1.6),base.clone().multiply(M(s*1.2,1.5,0)));return 4.57;}
function lafayettePedestal(P,base){const g='granite';
 slab(P,g,base,2.5,2.5,0,.3);slab(P,g,base,2.2,2.2,.3,.5);slab(P,g,base,1.85,1.85,.5,1.75);
 slab(P,g,base,1.95,1.95,1.75,2.1);slab(P,g,base,1.85,1.85,2.1,2.4);slab(P,g,base,2.15,2.15,2.4,2.68);
 // Bronze base like a ship's bow, with a scroll at the front corners.
 P.geo('bronze',new T.BoxGeometry(1.25,.42,1.05),base.clone().multiply(M(0,2.89,0)));for(const s of [-1,1])P.cyl('bronze',.12,.12,.5,base.clone().multiply(M(s*.55,2.8,.48,0,0,Math.PI/2)),8);return 3.1;}
function lincolnPedestal(P,base){const g='granite';
 slab(P,g,base,3.4,3.4,0,.3);slab(P,g,base,2.9,2.9,.3,.6);slab(P,g,base,2.2,2.2,.6,1.4);
 slab(P,g,base,1.8,1.8,1.4,3.55,1.45);slab(P,g,base,1.75,1.75,3.55,3.75);slab(P,g,base,1.55,1.55,3.75,3.92);return 3.92;}
function gandhiPlinth(P,base){slab(P,'granite',base,1.6,1.6,0,.25);slab(P,'granite',base,1.25,1.25,.25,1.2);return 1.2;}

const ROT={south:0,north:Math.PI,east:Math.PI/2,west:-Math.PI/2};
// Builds all four in world coordinates; ground height y0 is the park floor.
export function unionSquareParts(y0){const P=new Parts();
 const at=(k)=>{const s=UNION_SQUARE[k];return new T.Matrix4().compose(new T.Vector3(s.p[0],y0,-s.p[1]),new T.Quaternion().setFromEuler(new T.Euler(0,ROT[s.face],0)),new T.Vector3(1,1,1));};
 {const b=at('washington'),h=washingtonPedestal(P,b);equestrian(P,b.clone().multiply(M(0,h,0)));}
 {const b=at('lafayette'),h=lafayettePedestal(P,b);standing(P,b.clone().multiply(M(0,h,0)),{who:'lafayette'});}
 {const b=at('lincoln'),h=lincolnPedestal(P,b);standing(P,b.clone().multiply(M(0,h,0,0,0,0,1.02)),{who:'lincoln'});}
 gandhiPlinth(P,at('gandhi'));return P;}
export function buildUnionSquare(y0){const P=unionSquareParts(y0),grain=grainTextures({base:'#b9b6b0',size:1.4,seed:11});
 const materials={granite:new T.MeshStandardMaterial({color:0xb4b2ac,map:grain.map,normalMap:grain.normalMap,normalScale:new T.Vector2(.4,.4),roughness:.78}),
  bronze:new T.MeshStandardMaterial({color:0x3e4f45,roughness:.5,metalness:.55})};
 const g=P.build(materials);g.name='Union Square statues';g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return g;}
