import * as T from './vendor/three.module.js';
import {decayMaterial,DECAY} from './campus/atmosphere/decay.js?v=21';
import {VEHICLE} from './physics.js?v=21';
// NYU Facilities Fleet unit 07: the last working vehicle on campus. An original design (no real make or
// model): a small boxy electric utility van of the kind that runs along park paths and between buildings,
// a short cab with an upright windshield and a cargo box behind, faded NYU violet with "NYU" and the fleet
// number in plain lettering (no torch or other logo artwork), an amber roof bar, round headlamps.
// Local frame: x right, y up, -z forward (front at z = -1.5), metres. The 2026 and 2126 states come from the
// same decay layer as the campus (DECAY.value): paint fades and rusts in streaks, panels dent, moss grows in
// the window seals, the windshield cracks, and the left headlamp burns dimmer.
export const VAN={length:3.0,width:1.36,height:1.92,cab:-.32,wheelR:VEHICLE.wheelRadius,wheelX:.6,wheelZ:[-.98,.97]};
const V=VAN;
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
// Shallow dents: a vertex displacement that grows with the decay layer (object-space noise, so it is fixed).
function dents(m,depth=.06){const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{prev?.(sh,r);sh.uniforms.uDecay=DECAY;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uDecay;\nfloat nvDent(vec3 p){vec3 q=p*vec3(2.3,2.9,1.7);return max(0.,sin(q.x+1.7)*sin(q.y*1.3+.4)*sin(q.z*1.1+2.1))*step(.35,fract(sin(dot(floor(p*1.6),vec3(12.9,78.2,37.7)))*43758.5));}').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed-=normal*nvDent(position+vec3(0.,0.,0.))*'+depth.toFixed(3)+'*uDecay;');};
 const key=m.customProgramCacheKey?.()||'';m.customProgramCacheKey=()=>key+'|dent';return m;}
function lettering(lines,{w=512,h=256,fg='rgba(236,232,224,.92)',font='bold',sizes=[120,40]}={}){return canvasTex(w,h,(g,W,H)=>{g.clearRect(0,0,W,H);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
 lines.forEach((l,i)=>{g.font=`${font} ${sizes[i]||40}px Helvetica, Arial, sans-serif`;g.fillText(l,W/2,i===0?H*.42:H*.42+sizes[0]*.62+i*sizes[1]*.4);});});}
// The worn campus map that lies on the passenger seat (drawn from the real street data).
export function campusMapTexture(data){return canvasTex(512,384,(g,w,h)=>{g.fillStyle='#e6dcc3';g.fillRect(0,0,w,h);
 for(let i=0;i<2600;i++){g.fillStyle=`rgba(120,96,60,${Math.random()*.05})`;g.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*6,1+Math.random()*3);}
 const s=w/1500,ox=w/2+60*s,oy=h/2-40*s,P=(x,n)=>[ox+x*s,oy-n*s];
 if(data){g.fillStyle='rgba(120,110,90,.35)';for(const b of data.buildings){const r=b.rings[0];g.beginPath();r.forEach((p,i)=>{const q=P(...p);i?g.lineTo(...q):g.moveTo(...q);});g.fill();}
  const park=data.areas.find(a=>a.kind==='park'&&a.ring.length>20);if(park){g.fillStyle='rgba(96,120,72,.45)';g.beginPath();park.ring.forEach((p,i)=>{const q=P(...p);i?g.lineTo(...q):g.moveTo(...q);});g.fill();}
  g.strokeStyle='rgba(70,60,48,.55)';g.lineWidth=2.2;for(const sg of data.streets.segments){g.beginPath();sg.pts.forEach((p,i)=>{const q=P(...p);i?g.lineTo(...q):g.moveTo(...q);});g.stroke();}}
 g.fillStyle='rgba(87,6,140,.55)';g.fillRect(0,0,w,34);g.fillStyle='rgba(240,236,226,.9)';g.font='bold 22px Helvetica, Arial, sans-serif';g.fillText('NYU  CAMPUS  MAP',14,24);
 // Folds, a coffee ring and a torn corner.
 g.strokeStyle='rgba(90,70,40,.25)';g.lineWidth=2;for(const x of [w/3,2*w/3]){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();
 g.strokeStyle='rgba(110,70,30,.3)';g.lineWidth=5;g.beginPath();g.arc(w*.78,h*.7,28,0,6.1);g.stroke();g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(w,h);g.lineTo(w-46,h);g.lineTo(w,h-30);g.fill();});}
export function makeVehicle(data=null){const g=new T.Group();g.name='NYU utility van';const keep=[];const M=(o,kind,opt)=>{const m=new T.MeshStandardMaterial(o);keep.push(m);return kind?decayMaterial(m,kind,{local:true,...opt}):m;};
 const paint=dents(M({color:0x8c7ba4,roughness:.6,metalness:.2},'paint'));const trim=M({color:0x2b2c2e,roughness:.8},'light'),seal=M({color:0x1c1d1e,roughness:.9},'masonry');
 const glass=M({color:0x6f8088,roughness:.08,metalness:.3,transparent:true,opacity:.32,depthWrite:false,side:T.DoubleSide},'glass'),chrome=M({color:0xa9adb0,metalness:.7,roughness:.35},'metal');
 const rubber=M({color:0x1a1a1b,roughness:.95}),rim=M({color:0x8d9094,metalness:.5,roughness:.45},'metal');
 const add=(geo,mat,x,y,z,ry=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
 const bx=(w,h,d,mat,x,y,z,seg=1)=>add(new T.BoxGeometry(w,h,d,seg,seg,seg),mat,x,y,z);
 const L=V.length,W=V.width,zF=-L/2,zR=L/2,zc=V.cab;
 // Cargo box (solid): lower body and the taller box. The cab is open inside: a floor, a short nose under the
 // windshield, door panels below the side windows, pillars and a roof.
 bx(W,.66,zR-zc,paint,0,.67,(zc+zR)/2,6);bx(W+.02,.94,zR-zc,paint,0,1.47,(zc+zR)/2,6);
 const cz=(zF+zc)/2,cl=zc-zF;bx(W,.28,cl,paint,0,.48,cz,4);bx(W-.04,.04,cl,trim,0,.64,cz);
 bx(W,.66,.24,paint,0,.67,zF+.12,4);for(const s of [-1,1]){bx(.04,.56,cl-.2,paint,s*(W/2-.02),.9,cz+.1,4);bx(.06,.7,.06,paint,s*(W/2-.03),1.5,zF+.24);bx(.06,.7,.08,paint,s*(W/2-.03),1.5,zc-.04);}
 bx(W,.08,cl-.18,paint,0,1.87,cz+.09,4);bx(W,.06,.06,paint,0,1.03,zF+.25);
 // Windshield (upright, slightly raked), side windows, partition window; dark seals round each.
 const ws=add(new T.PlaneGeometry(W-.12,.8),glass,0,1.45,zF+.26);ws.rotation.x=-.1;ws.name='windshield';
 // The crack across the windshield: a star of fractures from a stone strike, drawn in as the decay layer comes in.
 const crackTex=canvasTex(256,160,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(235,240,240,.9)';c.lineWidth=1.4;const ox=w*.68,oy=h*.38;for(let i=0;i<11;i++){let a=i/11*Math.PI*2+Math.sin(i*7)*.3,x=ox,y=oy;c.beginPath();c.moveTo(x,y);for(let k=0;k<6;k++){a+=Math.sin(i*3+k)*.35;const L=8+Math.abs(Math.sin(i*5+k))*22;x+=Math.cos(a)*L;y+=Math.sin(a)*L;c.lineTo(x,y);}c.stroke();}c.beginPath();c.arc(ox,oy,5,0,7);c.stroke();c.beginPath();c.arc(ox,oy,16,.4,2.6);c.stroke();});
 const crackMat=new T.MeshBasicMaterial({map:crackTex,transparent:true,opacity:0,depthWrite:false});keep.push(crackMat);const crack=add(new T.PlaneGeometry(W-.14,.78),crackMat,0,1.45,zF+.255);crack.rotation.x=-.1;crack.castShadow=false;
 for(const s of [-1,1]){const sw=add(new T.PlaneGeometry(.78,.62),glass,s*(W/2+.006),1.5,zF+.7,s*Math.PI/2);sw.name='side window';
  for(const [w,h,y,z] of [[.04,.66,1.5,zF+.3],[.04,.66,1.5,zF+1.1],[.84,.04,1.18,zF+.7],[.84,.04,1.82,zF+.7]])bx(.03,h,w===.04?.04:w,seal,s*(W/2+.012),y,z);}
 bx(W-.1,.05,.06,seal,0,1.08,zF+.2);bx(W-.1,.05,.06,seal,0,1.84,zF+.3);for(const s of [-1,1])bx(.05,.78,.06,seal,s*(W/2-.05),1.46,zF+.25);
 // Rear doors with a seam, small windows and handles; bumper, tail lamps, plate.
 bx(.012,.88,.02,trim,0,1.47,zR+.012);for(const s of [-1,1]){add(new T.PlaneGeometry(.42,.3),glass,s*.3,1.66,zR+.012,Math.PI);bx(.12,.03,.03,chrome,s*.12,1.3,zR+.02);
  bx(.1,.34,.03,M({color:0x9a1a1e,emissive:0xff2a2a,emissiveIntensity:.6,roughness:.4}),s*(W/2-.09),.92,zR+.012);}
 bx(W+.06,.2,.16,trim,0,.42,zR+.02);bx(W+.06,.2,.16,trim,0,.42,zF-.02);
 // Front: round lamps in square bezels, amber indicators, a slatted grille, the bumper; mirrors.
 const lampMats=[];for(const s of [-1,1]){bx(.26,.26,.04,trim,s*.47,.8,zF-.005);const lm=M({color:0xf2efe0,emissive:0xfff0cc,emissiveIntensity:1.6,roughness:.3});lampMats.push(lm);const lamp=add(new T.CylinderGeometry(.095,.095,.04,20),lm,s*.47,.8,zF-.03);lamp.rotation.x=Math.PI/2;
  bx(.1,.06,.03,M({color:0xd28a2a,emissive:0xd28a2a,emissiveIntensity:.3}),s*.47,.62,zF-.02);bx(.04,.16,.12,trim,s*(W/2+.06),1.5,zF+.18);bx(.03,.16,.12,M({color:0x9aa6ad,metalness:.8,roughness:.15}),s*(W/2+.085),1.5,zF+.18);}
 for(let i=0;i<4;i++)bx(.5,.025,.03,trim,0,.7+i*.055,zF-.015);
 // Amber roof bar (steady, never flashing) and roof rails.
 bx(.7,.08,.18,trim,0,1.94,zF+.55);const beacon=bx(.62,.07,.14,M({color:0xc98a2a,emissive:0xe09030,emissiveIntensity:.25,roughness:.4}),0,1.99,zF+.55);beacon.name='roof bar';
 for(const s of [-1,1])bx(.04,.04,zR-zc-.2,chrome,s*(W/2-.08),1.96,(zc+zR)/2);
 // Lettering: "NYU" and the fleet number on both doors and the rear, plain sans-serif in off-white.
 const door=lettering(['NYU','FACILITIES  07'],{sizes:[150,44]}),rear=lettering(['NYU  07'],{sizes:[110]});const lmat=decayMaterial(new T.MeshStandardMaterial({map:door,transparent:true,roughness:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),'light');
 const rmat=decayMaterial(new T.MeshStandardMaterial({map:rear,transparent:true,roughness:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),'light');keep.push(lmat,rmat);
 for(const s of [-1,1])add(new T.PlaneGeometry(.9,.45),lmat,s*(W/2+.012),.82,zF+.75,s*Math.PI/2);add(new T.PlaneGeometry(.7,.35),rmat,0,1.18,zR+.024,0);
 add(new T.PlaneGeometry(.36,.12),M({color:0xd9dcd2,roughness:.5},'light'),0,.6,zR+.022);
 // Wheels: small tyres, plain steel rims, arches.
 const wheels=[];for(const x of [-V.wheelX,V.wheelX])for(const z of V.wheelZ){const w=new T.Group();w.position.set(x,V.wheelR,z);const tire=new T.Mesh(new T.CylinderGeometry(V.wheelR,V.wheelR,.19,20),rubber);tire.rotation.z=Math.PI/2;w.add(tire);
  const r=new T.Mesh(new T.CylinderGeometry(.15,.15,.2,14),rim);r.rotation.z=Math.PI/2;w.add(r);g.add(w);wheels.push(w);bx(.06,.05,.62,trim,Math.sign(x)*(W/2+.02),V.wheelR*2+.02,z);}
 // Interior: floor, a worn dashboard with a single round gauge, a steering wheel on the left, two seats,
 // the partition, and the campus map lying on the passenger seat.
 const inner=new T.Group();inner.name='interior';g.add(inner);const ia=(geo,mat,x,y,z,rx=0,ry=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,0);inner.add(m);return m;};
 const vinyl=M({color:0x4a4644,roughness:.85},'light'),dash=M({color:0x2e2f31,roughness:.8},'light'),floor=M({color:0x232425,roughness:.95},'light');
 ia(new T.BoxGeometry(W-.1,.04,1.0),floor,0,.67,zF+.75);ia(new T.BoxGeometry(W-.12,.32,.34),dash,0,.98,zF+.36);ia(new T.BoxGeometry(W-.12,.05,.3),dash,0,1.15,zF+.4,.25);
 const gauge=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#141516';c.fillRect(0,0,w,h);c.strokeStyle='#d9d4c4';c.lineWidth=4;c.beginPath();c.arc(64,64,50,Math.PI*.8,Math.PI*2.2);c.stroke();c.fillStyle='#d9d4c4';c.font='bold 18px Helvetica';c.textAlign='center';c.fillText('km/h',64,96);c.lineWidth=5;c.strokeStyle='#e0b050';c.beginPath();c.moveTo(64,64);c.lineTo(28,78);c.stroke();});
 ia(new T.CircleGeometry(.07,20),M({map:gauge,roughness:.4},'light'),-.33,1.19,zF+.535,-.3);
 const sw=ia(new T.TorusGeometry(.15,.02,8,24),dash,-.33,1.12,zF+.62,-.75);ia(new T.CylinderGeometry(.02,.02,.32,6),dash,-.33,1.05,zF+.5,-.75+Math.PI/2);
 for(const s of [-1,1]){ia(new T.BoxGeometry(.5,.2,.46),vinyl,s*.33,.79,zF+1.02);ia(new T.BoxGeometry(.5,.58,.08),vinyl,s*.33,1.18,zF+1.27,.12);}
 ia(new T.BoxGeometry(W-.06,1.0,.03),M({color:0x4a4a4c,roughness:.8},'light'),0,1.25,zc+.03);
 const mapMat=M({map:campusMapTexture(data),roughness:.95,transparent:true,alphaTest:.1,side:T.DoubleSide},'light');const map=ia(new T.PlaneGeometry(.44,.33),mapMat,.33,.895,zF+1.0,-Math.PI/2+.05,.18);map.name='campus map';
 for(const m of inner.children){m.castShadow=false;m.receiveShadow=true;}
 // Ground shadow under the body.
 g.userData={paint,wheels,tail:{emissiveIntensity:3},flame:[],lampMats,interior:inner,map,mapMaterial:mapMat,beacon,materials:keep,wheelY:V.wheelR,
  headlampOffsets:[[-.47,.8,zF-.05],[.47,.8,zF-.05]],eye:[-.33,1.48,zF+.95]};
 // One headlamp dims as the decay layer comes in (the left one, at 35%).
 g.userData.updateDecay=()=>{const t=DECAY.value;lampMats[0].emissiveIntensity=1.6*(1-.65*t);lampMats[1].emissiveIntensity=1.6;crackMat.opacity=t;crack.visible=t>.01;};
 return g;}
