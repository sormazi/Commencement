import * as T from '../../vendor/three.module.js';
import {Parts,Face,footprintFrame,placeOnFrame,canvas,stoneTextures,normalMap} from './kit.js?v=22';
// Elmer Holmes Bobst Library, 70 Washington Square South (Philip Johnson & Richard Foster, 1967–73).
// Twelve storeys of red sandstone over a recessed, fully glazed ground floor. Every face has the
// same grammar: square piers at the base, a continuous spandrel band, then round-fronted stone
// piers running to the roof between deeply recessed bays, and a top band of deep square openings.
// The park (north) and LaGuardia (west) faces are glazed in every bay; the West 3rd Street (south)
// and east faces have narrow slot windows in solid stone bays (Commons photos, 2011–2026).
// Local frame: x along the north face (west → east), z into the building (north → south), y up.
export const BOBST={bin:1008626,H:47.36,ground:6.3,band:8.0,attic:44.5,cornerPier:2.3,pier:2.0,finProj:.24,bayDepth:.9,
 groundSet:2.4,bays:{north:11,south:11,east:12,west:12},glazed:{north:true,west:true,south:false,east:false},
 entrance:{face:'north',bays:[4,5]},atrium:{x0:14,x1:43.2,z0:17,z1:46.2}};
export function bobstParts(lx,lz){const B=BOBST,P=new Parts(),floors=10,fh=(B.attic-B.band)/floors;
 const faces={north:new Face([lx,0,0],[-1,0,0],[0,1,0]),south:new Face([0,0,lz],[1,0,0],[0,1,0]),east:new Face([lx,0,lz],[0,0,-1],[0,1,0]),west:new Face([0,0,0],[0,0,1],[0,1,0])};
 const lens={north:lx,south:lx,east:lz,west:lz};
 for(const [k,f] of Object.entries(faces)){const L=lens[k],nb=B.bays[k],cw=B.cornerPier,pw=B.pier,bay=(L-2*cw-(nb-1)*pw)/nb;
  // Pier and bay positions along u (bay i spans bx[i]..bx[i]+bay).
  const bx=[];for(let i=0;i<nb;i++)bx.push(cw+i*(bay+pw));const piers=[[0,cw]];for(let i=0;i<nb-1;i++)piers.push([bx[i]+bay,bx[i]+bay+pw]);piers.push([L-cw,L]);
  // ---- ground floor: square piers in the face plane, glazing set back, soffit over the recess ----
  for(const [u0,u1] of piers)P.block('stone',f,u0,u1,0,B.ground,-B.groundSet,0,{skip:['bottom','top']});
  for(let i=0;i<nb;i++){const u0=bx[i],u1=u0+bay,entrance=k===B.entrance.face&&B.entrance.bays.includes(i);
   P.rect('glassClear',f,u0,u1,0,B.ground,-B.groundSet);P.rect('stone',new Face(f.at(0,B.ground,0),f.u,f.n),u0,u1,-B.groundSet,0);
   // Mullions: one centre post and a transom (and the revolving door frame at the entrance).
   for(const u of [u0+bay/2])P.block('metal',f,u-.04,u+.04,0,B.ground,-B.groundSet,-B.groundSet+.12);
   P.block('metal',f,u0,u1,B.ground-1.6,B.ground-1.52,-B.groundSet,-B.groundSet+.1);P.block('metal',f,u0,u1,2.7,2.76,-B.groundSet,-B.groundSet+.1);
   if(entrance){const c=f.at(u0+bay/2,0,-B.groundSet+.2);const drum=new T.Matrix4().makeTranslation(c[0],1.2,c[2]);
    P.cyl('glassClear',1.15,1.15,2.4,drum,20);P.cyl('metal',1.2,1.2,.12,new T.Matrix4().makeTranslation(c[0],2.46,c[2]),20);
    if(i===B.entrance.bays[0])P.panel('number',f,u0+bay/2-.5,u0+bay/2+.5,3.0,3.7,-B.groundSet+.02);
    for(let w=0;w<3;w++)P.geo('metal',new T.BoxGeometry(2.2,2.3,.05),new T.Matrix4().makeTranslation(c[0],1.18,c[2]).multiply(new T.Matrix4().makeRotationY(w*Math.PI/3)));}}
  // ---- spandrel band over the ground floor ----
  P.rect('stone',f,0,L,B.ground,B.band,0);
  // ---- upper storeys: recessed bays between round-fronted piers ----
  for(let i=0;i<nb;i++){const u0=bx[i],u1=u0+bay,dd=-B.bayDepth;
   if(B.glazed[k]){// Two window columns per bay with a stone mullion and a stone spandrel at each floor.
    for(let fl=0;fl<floors;fl++){const y0=B.band+fl*fh;P.rect('stone',f,u0,u1,y0,y0+.42,dd);P.rect('glass',f,u0,u1,y0+.42,y0+fh,dd-.12);
     P.block('stone',f,u0,u1,y0+.36,y0+.42,dd-.12,dd,{skip:['top']});P.block('stone',f,u0,u1,y0+fh-.02,y0+fh,dd-.12,dd,{skip:['bottom']});
     // Thin transom bar at mid-height of each window, as in the photographs.
     P.block('metal',f,u0,u1,y0+.42+(fh-.42)*.5,y0+.42+(fh-.42)*.5+.06,dd-.12,dd-.06);}
    P.block('stone',f,u0+bay/2-.17,u0+bay/2+.17,B.band,B.attic,dd-.12,dd+.12,{skip:['top','bottom']});}
   else{// Solid stone bay with one deep slot window up the middle.
    const s0=u0+bay/2-.42,s1=u0+bay/2+.42;P.poly('stone',f,[[u0,B.band],[u1,B.band],[u1,B.attic],[u0,B.attic]],[[[s0,B.band+.6],[s1,B.band+.6],[s1,B.attic-.6],[s0,B.attic-.6]]],dd+.5);
    P.recess('stone',f,s0,s1,B.band+.6,B.attic-.6,.55,'glass');for(let fl=1;fl<floors;fl++){const y=B.band+fl*fh;P.block('stone',f,s0,s1,y-.25,y+.25,dd-.05,dd+.4);}}
   // Bay reveals (the sides of the neighbouring piers) are part of the pier solids below.
   // Attic: deep square opening per bay under the roofline.
   P.poly('stone',f,[[u0,B.attic],[u1,B.attic],[u1,B.H],[u0,B.H]],[[[u0+.55,B.attic+.7],[u1-.55,B.attic+.7],[u1-.55,B.H-.55],[u0+.55,B.H-.55]]],-B.bayDepth);
   P.recess('stone',new Face(f.at(0,0,-B.bayDepth),f.u,f.v),u0+.55,u1-.55,B.attic+.7,B.H-.55,1.4,'dark');}
  // Piers: square corner piers; interior piers with a round (half-elliptic) front.
  for(const [pi,[u0,u1]] of piers.entries()){const corner=pi===0||pi===piers.length-1;
   if(corner){P.block('stone',f,u0,u1,B.band,B.H,-B.bayDepth-.2,.0,{skip:['bottom','top']});continue;}
   const w=u1-u0,sh=new T.Shape();sh.moveTo(-w/2,-B.bayDepth-.2);sh.lineTo(w/2,-B.bayDepth-.2);sh.lineTo(w/2,0);
   for(let a=0;a<=12;a++){const t=a/12*Math.PI;sh.lineTo(w/2*Math.cos(t),B.finProj*Math.sin(t));}sh.lineTo(-w/2,-B.bayDepth-.2);
   const top=B.H,bot=B.band+.6,g=new T.ExtrudeGeometry(sh,{depth:top-bot,bevelEnabled:false,curveSegments:12});
   const m=new T.Matrix4().makeBasis(new T.Vector3(...f.u),new T.Vector3(...f.n),new T.Vector3(...f.v).negate());m.setPosition(...f.at((u0+u1)/2,top,0));P.geo('stone',g,m);
   // The pier's rounded foot: a quarter-dome springing from the spandrel band.
   const dome=new T.SphereGeometry(1,14,6,0,Math.PI,Math.PI/2,Math.PI/2);P.geo('stoneLight',dome,f.matrix((u0+u1)/2,bot,0,0,[w/2,.6,B.finProj]));}
  if(k==='north')for(let pi=1;pi<piers.length-1;pi++){const [u0,u1]=piers[pi],cu=(u0+u1)/2;P.block('planter',f,cu-.5,cu+.5,0,.75,.4,1.25);P.cyl('plant',.12,.12,.5,f.matrix(cu,.95,.82),6);P.cyl('plant',.58,.05,1.9,f.matrix(cu,2.05,.82),9);}}
 // Roof and coping.
 P.rect('roof',new Face([0,BOBST.H,lz],[1,0,0],[0,0,-1]),0,lx,0,lz);
 // ---- interior seen through the lobby glass: op-art marble floor, ceiling, atrium screens ----
 const g=B.groundSet,at=B.atrium;P.rect('floor',new Face([0,.03,lz],[1,0,0],[0,0,-1]),g,lx-g,g,lz-g);
 const ceil=new Face([0,B.ground,0],[1,0,0],[0,0,1]);P.poly('ceiling',ceil,[[g,g],[lx-g,g],[lx-g,lz-g],[g,lz-g]],[[[at.x0,at.z0],[at.x1,at.z0],[at.x1,at.z1],[at.x0,at.z1]]]);
 const atF=[new Face([at.x0,0,at.z0],[1,0,0],[0,1,0]),new Face([at.x1,0,at.z1],[-1,0,0],[0,1,0]),new Face([at.x1,0,at.z0],[0,0,1],[0,1,0]),new Face([at.x0,0,at.z1],[0,0,-1],[0,1,0])];
 const atL=[at.x1-at.x0,at.x1-at.x0,at.z1-at.z0,at.z1-at.z0];
 // The atrium faces inward; its walls above the lobby carry the perforated metal screen (Joel Sanders
 // Architect, 2012) and the floor-edge balustrades. Faces point into the void.
 atF.forEach((f,i)=>{P.panel('screen',f,0,atL[i],B.ground,B.attic-1.5,0);for(let fl=0;fl<=floors;fl++){const y=B.band+fl*fh;P.block('metal',f,0,atL[i],y-.1,y+.05,0,.3);}});
 P.rect('skylight',new Face([at.x0,B.attic-1.5,at.z0],[1,0,0],[0,0,1]),0,at.x1-at.x0,0,at.z1-at.z0);
 return P;}

function opArtFloor(){// Rhombille cube pattern in white, grey and black marble (Johnson's lobby floor).
 const c=canvas(512,512),g=c.getContext('2d'),s=64,h=s*Math.sqrt(3)/2,cols=['#f2f0ea','#8d8c88','#1d1d1f'];g.fillStyle=cols[1];g.fillRect(0,0,512,512);
 for(let row=-1;row<512/(s*1.5)+2;row++)for(let col=-1;col<512/(2*h)+2;col++){const cx=col*2*h+(row%2?h:0),cy=row*s*1.5;
  const top=[[cx,cy-s],[cx+h,cy-s/2],[cx,cy],[cx-h,cy-s/2]],left=[[cx-h,cy-s/2],[cx,cy],[cx,cy+s],[cx-h,cy+s/2]],right=[[cx+h,cy-s/2],[cx,cy],[cx,cy+s],[cx+h,cy+s/2]];
  for(const [pts,ci] of [[top,0],[left,1],[right,2]]){g.fillStyle=cols[ci];g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1/2.4,1/2.4);return t;}
function screenTexture(){// Perforated screen read as a field of short vertical bars in gold and white.
 const c=canvas(512,1024),g=c.getContext('2d');g.fillStyle='#2a2620';g.fillRect(0,0,512,1024);let r=7;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
 for(let y=0;y<1024;y+=10)for(let x=0;x<512;x+=7){const v=rnd();if(v<.62){const w=4+rnd()*3,h=6+Math.floor(rnd()*3)*8;g.fillStyle=v<.25?'#efe9da':v<.45?'#d9c08a':'#b59a62';g.fillRect(x,y,w,Math.min(h,9));}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,2);return t;}

function numberTexture(){const c=canvas(256,180),g=c.getContext('2d');g.clearRect(0,0,256,180);g.fillStyle='#e9e4d8';g.font='600 150px "Helvetica Neue", Arial, sans-serif';g.textAlign='center';g.fillText('70',128,150);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
export function buildBobst(b){const frame=footprintFrame(b.rings[0]),P=bobstParts(frame.lx,frame.lz);
 const st=stoneTextures({base:'#a85b48',vary:.06,course:.52,courses:8,block:.72,tileW:4.32,joint:.005,grain:1.6,seed:7,px:512,jointAlpha:.12,jointDepth:.5});
 const stone=new T.MeshStandardMaterial({map:st.map,normalMap:st.normalMap,normalScale:new T.Vector2(.5,.5),roughness:.86});
 const materials={stone,stoneLight:new T.MeshStandardMaterial({color:0xbf8a7a,roughness:.88}),
  glass:new T.MeshStandardMaterial({color:0x2c3540,roughness:.18,metalness:.55}),
  glassClear:new T.MeshStandardMaterial({color:0x9fb3bd,roughness:.08,metalness:.2,transparent:true,opacity:.28,depthWrite:false}),
  number:new T.MeshStandardMaterial({map:numberTexture(),transparent:true,roughness:.4,metalness:.6}),
  planter:new T.MeshStandardMaterial({color:0xc08a80,roughness:.8}),plant:new T.MeshStandardMaterial({color:0x2f4a2a,roughness:1,flatShading:true}),
  metal:new T.MeshStandardMaterial({color:0x2a2c2e,roughness:.45,metalness:.6}),dark:new T.MeshStandardMaterial({color:0x14110f,roughness:1}),
  roof:new T.MeshStandardMaterial({color:0x6d5a52,roughness:.95}),floor:new T.MeshStandardMaterial({map:opArtFloor(),roughness:.35}),
  ceiling:new T.MeshStandardMaterial({color:0x8e8a82,roughness:.9,side:T.DoubleSide}),
  screen:new T.MeshStandardMaterial({map:screenTexture(),roughness:.4,metalness:.5,emissive:0x2a2214,side:T.DoubleSide}),
  skylight:new T.MeshStandardMaterial({color:0xd7dde0,emissive:0x5a6064,side:T.DoubleSide})};
 const g=P.build(materials);for(const m of g.children)if(['floor','ceiling','screen','skylight','glassClear'].includes(m.name))m.castShadow=false;
 const glassMesh=g.children.find(m=>m.name==='glassClear');if(glassMesh)glassMesh.renderOrder=2;
 g.name='Bobst Library';g.userData.tris=P.tris;g.userData.materials=Object.values(materials);return placeOnFrame(g,frame,.15);}
