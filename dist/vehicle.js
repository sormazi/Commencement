import * as T from './vendor/three.module.js';
import {decayMaterial,DECAY} from './campus/atmosphere/decay.js?v=22';
import {VEHICLE} from './physics.js?v=22';
import {LIVERY,SIDE_PROFILE,liveryPixels} from './assets/signage/livery.js?v=22';
// NYU Campus Safety unit 4: the player's car. A compact electric crossover with the size, proportions, ride
// height and stance of the Campus Safety car in Avi's reference photos (about 4.6 m long, 1.85 m wide,
// 1.62 m tall, 2.8 m wheelbase, 0.72 m wheels), modelled from simple shapes as an original design: no real
// maker's body lines, badges or logos. White body, black lower cladding, wheel arches and roof, a full-width
// light bar front and rear, and the Campus Safety livery as separate decals from the signage manifest.
// Local frame: x right, y up, -z forward, metres; ground at y = 0. Side shapes are drawn in (u, v): u metres
// back from the nose, v metres up. The 2026 and 2126 states come from the campus decay layer (DECAY.value):
// paint rusts at the seams and dents, the livery fades and peels, moss grows in the window seals, the
// windshield cracks, and the left headlamp burns dimmer.
export const CAR={length:4.58,width:1.85,height:1.63,wheelR:VEHICLE.wheelRadius,wheelX:VEHICLE.track/2,wheelU:[.86,3.66]};
const L=CAR.length,W=CAR.width,R=CAR.wheelR,ARCH=.44,AY=.36;
const Z=u=>u-L/2;
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
// Shallow dents: a vertex displacement that grows with the decay layer (object-space noise, so it is fixed).
function dents(m,depth=.035){const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{prev?.(sh,r);sh.uniforms.uDecay=DECAY;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uDecay;\nfloat nvDent(vec3 p){vec3 q=p*vec3(2.3,2.9,1.7);return max(0.,sin(q.x+1.7)*sin(q.y*1.3+.4)*sin(q.z*1.1+2.1))*step(.35,fract(sin(dot(floor(p*1.6),vec3(12.9,78.2,37.7)))*43758.5));}').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed-=normal*nvDent(position)*'+depth.toFixed(3)+'*uDecay;');};
 const key=m.customProgramCacheKey?.()||'';m.customProgramCacheKey=()=>key+'|dent';return m;}
// Livery decals fade (the cloth decay greys and bleaches them) and peel: patches of vinyl lift away from
// the edges inward as the layer comes in, showing the paint underneath.
function peel(m){const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{prev?.(sh,r);sh.uniforms.uPeel=DECAY;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uPeel;\nfloat nvPh(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}\nfloat nvPn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(nvPh(i),nvPh(i+vec2(1,0)),f.x),mix(nvPh(i+vec2(0,1)),nvPh(i+vec2(1,1)),f.x),f.y);}')
 .replace('#include <alphatest_fragment>','#ifdef USE_MAP\n{vec2 q=vMapUv*vec2(9.,3.);float n=nvPn(q)*.6+nvPn(q*3.1)*.4;float edge=min(min(vMapUv.x,1.-vMapUv.x),min(vMapUv.y,1.-vMapUv.y));if(n*.75+min(edge*4.,1.)*.5<uPeel*.62)discard;}\n#endif\n#include <alphatest_fragment>');};
 const key=m.customProgramCacheKey?.()||'';m.customProgramCacheKey=()=>key+'|peel';return m;}
// The worn campus map that lies on the passenger seat (drawn from the real street data).
export function campusMapTexture(data){return canvasTex(512,384,(g,w,h)=>{g.fillStyle='#e6dcc3';g.fillRect(0,0,w,h);
 for(let i=0;i<2600;i++){g.fillStyle=`rgba(120,96,60,${Math.random()*.05})`;g.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*6,1+Math.random()*3);}
 const s=w/1500,ox=w/2+60*s,oy=h/2-40*s,P=(x,n)=>[ox+x*s,oy-n*s];
 if(data){g.fillStyle='rgba(120,110,90,.35)';for(const b of data.buildings){const r=b.rings[0];g.beginPath();r.forEach((p,i)=>{const q=P(...p);i?g.lineTo(...q):g.moveTo(...q);});g.fill();}
  const park=data.areas.find(a=>a.kind==='park'&&a.ring.length>20);if(park){g.fillStyle='rgba(96,120,72,.45)';g.beginPath();park.ring.forEach((p,i)=>{const q=P(...p);i?g.lineTo(...q):g.moveTo(...q);});g.fill();}
  g.strokeStyle='rgba(70,60,48,.55)';g.lineWidth=2.2;for(const sg of data.streets.segments){g.beginPath();sg.pts.forEach((p,i)=>{const q=P(...p);i?g.lineTo(...q):g.moveTo(...q);});g.stroke();}}
 g.fillStyle='rgba(87,6,140,.55)';g.fillRect(0,0,w,34);g.fillStyle='rgba(240,236,226,.9)';g.font='bold 22px Helvetica, Arial, sans-serif';g.fillText('NYU  CAMPUS  MAP',14,24);
 g.strokeStyle='rgba(90,70,40,.25)';g.lineWidth=2;for(const x of [w/3,2*w/3]){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();
 g.strokeStyle='rgba(110,70,30,.3)';g.lineWidth=5;g.beginPath();g.arc(w*.78,h*.7,28,0,6.1);g.stroke();g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(w,h);g.lineTo(w-46,h);g.lineTo(w,h-30);g.fill();});}
// A side shape in (u, v) extruded across the car: `depth` wide, centred on x = xc.
function sideShape(pts,arches=[]){const s=new T.Shape();pts.forEach(([u,v],i)=>i?s.lineTo(u,v):s.moveTo(u,v));for(const a of arches){if(a.line)s.lineTo(...a.line);else s.absarc(a.u,AY,ARCH,a.from,a.to,false);}s.closePath();return s;}
function extrude(shape,depth,xc,bevel=0){const g=new T.ExtrudeGeometry(shape,{depth,curveSegments:14,bevelEnabled:bevel>0,bevelThickness:bevel*.6,bevelSize:bevel,bevelSegments:3});g.rotateY(-Math.PI/2);g.translate(xc+depth/2,0,-L/2);g.computeVertexNormals();return g;}
// Merge geometries that share a material into one (fewer draw calls); position, normal and uv only.
function merge(geos){const parts=geos.map(g=>g.index?g.toNonIndexed():g),out=new T.BufferGeometry();
 for(const [k,n] of [['position',3],['normal',3],['uv',2]]){const len=parts.reduce((a,g)=>a+g.attributes.position.count*n,0),arr=new Float32Array(len);let o=0;for(const g of parts){const a=g.attributes[k];if(a)arr.set(a.array,o);o+=g.attributes.position.count*n;}out.setAttribute(k,new T.BufferAttribute(arr,n));}return out;}
const A0=Math.atan2(.25-AY,Math.sqrt(ARCH*ARCH-(.25-AY)**2)),A1=Math.PI-A0;// where an arch meets the sill line
export function makeVehicle(data=null){const g=new T.Group();g.name='NYU Campus Safety car';const keep=[];const M=(o,kind,opt)=>{const m=new T.MeshStandardMaterial(o);keep.push(m);return kind?decayMaterial(m,kind,{local:true,...opt}):m;};
 const paint=dents(M({color:0xf2f2ef,roughness:.32,metalness:.15},'paint'));const clad=M({color:0x232427,roughness:.75},'light'),gloss=M({color:0x16171a,roughness:.25,metalness:.3},'light');
 const seal=M({color:0x151617,roughness:.9},'masonry'),chrome=M({color:0xb9bcbf,metalness:.85,roughness:.25},'metal');
 const glass=M({color:0x1d2429,roughness:.06,metalness:.4,transparent:true,opacity:.62,depthWrite:false,side:T.DoubleSide},'glass');
 const rubber=M({color:0x19191a,roughness:.95}),rim=M({color:0xc6c8cb,metalness:.75,roughness:.3},'metal'),rimDark=M({color:0x2a2b2e,metalness:.4,roughness:.5},'metal');
 const add=(geo,mat,x=0,y=0,z=0,parent=g)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const bx=(w,h,d,mat,x,y,z)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z);
 // A beam between two (u, v) points at lateral offset x (pillars, seals).
 const beam=(p0,p1,x,th,mat,wd=th)=>{const len=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),m=add(new T.BoxGeometry(wd,th,len),mat,x,(p0[1]+p1[1])/2,Z((p0[0]+p1[0])/2));m.rotation.x=-Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);return m;};
 const frontArch={u:CAR.wheelU[0],from:A0,to:A1},rearArch={u:CAR.wheelU[1],from:A0,to:A1};
 const rS=[CAR.wheelU[1]+Math.cos(A0)*ARCH,.25],rE=[CAR.wheelU[1]-Math.cos(A0)*ARCH,.25],fS=[CAR.wheelU[0]+Math.cos(A0)*ARCH,.25];
 // Body sides: two thin panels with the full outline and both wheel arches. Between them the cabin is open
 // (floor, seats, dashboard), closed at the front by the bonnet block and at the back by the boot block.
 const side=sideShape(SIDE_PROFILE,[{line:rS},rearArch,{line:fS},frontArch]);
 for(const s of [-1,1])add(extrude(side,.05,s*(W/2-.035),.02),paint);
 const nose=sideShape([[.1,.22],[0,.4],[-.01,.6],[.03,.77],[.11,.87],[.28,.94],[1.16,1.15],[1.22,1.0],[1.32,.45],fS],[frontArch]);add(extrude(nose,W-.1,0,.04),paint);
 const ra=.85,tail=sideShape([[3.95,1.22],[4.25,1.23],[4.5,1.2],[4.57,1.05],[4.58,.6],[4.52,.3],[4.42,.24],rS],[{u:CAR.wheelU[1],from:A0,to:ra}]);add(extrude(tail,W-.1,0,.04),paint);
 // White rear quarter (the sail behind the rear side window).
 for(const s of [-1,1])add(extrude(sideShape([[3.98,1.21],[4.17,1.53],[4.44,1.34],[4.5,1.21]]),.03,s*(W/2-.05)),paint);
 // Black lower cladding: sills between the arches, arch flares, and the lower bumpers front and back.
 for(const s of [-1,1]){const x=s*(W/2+.022);const sill=bx(.03,.17,rE[0]-fS[0]+.02,clad,x,.335,Z((rE[0]+fS[0])/2));
  for(const u of CAR.wheelU){const fl=add(new T.RingGeometry(ARCH-.045,ARCH+.085,26,1,A0-.02,A1-A0+.04),clad,x,AY,Z(u));fl.rotation.y=s*Math.PI/2;
   const liner=add(new T.CylinderGeometry(ARCH-.005,ARCH-.005,.36,20,1,true,0,Math.PI),M({color:0x0d0d0e,roughness:1,side:T.BackSide}),s*(W/2-.18),AY,Z(u));liner.rotation.z=Math.PI/2;liner.rotation.x=0;liner.castShadow=false;}}
 bx(W-.06,.24,.36,clad,0,.34,Z(.16));bx(1.1,.07,.04,gloss,0,.55,Z(-.03));bx(W-.04,.4,.34,clad,0,.42,Z(4.44));bx(1.3,.025,.04,chrome,0,.3,Z(4.62));
 // Glass: windscreen, side windows (one pane each side, with the B pillar laid over), rear window.
 const ws=beam([1.18,1.16],[1.93,1.52],0,.012,glass,W-.2);ws.name='windshield';
 const crackTex=canvasTex(512,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(235,240,240,.9)';c.lineWidth=1.6;const ox=w*.3,oy=h*.45;for(let i=0;i<13;i++){let a=i/13*Math.PI*2+Math.sin(i*7)*.3,x=ox,y=oy;c.beginPath();c.moveTo(x,y);for(let k=0;k<7;k++){a+=Math.sin(i*3+k)*.35;const L=10+Math.abs(Math.sin(i*5+k))*30;x+=Math.cos(a)*L;y+=Math.sin(a)*L;c.lineTo(x,y);}c.stroke();}c.beginPath();c.arc(ox,oy,6,0,7);c.stroke();c.beginPath();c.arc(ox,oy,20,.4,2.6);c.stroke();});
 const crackMat=new T.MeshBasicMaterial({map:crackTex,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});keep.push(crackMat);
 const crack=add(new T.PlaneGeometry(W-.22,.82),crackMat,0,1.345,Z(1.545));crack.rotation.x=-2.017;crack.position.y+=.011;crack.position.z-=.006;crack.castShadow=false;
 for(const s of [-1,1]){const sw=add(extrude(sideShape([[1.2,1.17],[1.93,1.52],[2.6,1.585],[3.4,1.6],[4.15,1.53],[4.44,1.33],[4.48,1.22],[2.6,1.19]]),.012,s*(W/2-.075)),glass);sw.name='side window';sw.castShadow=false;
  bx(.03,.4,.09,gloss,s*(W/2-.06),1.38,Z(2.62));beam([1.18,1.16],[1.93,1.52],s*(W/2-.1),.07,gloss,.09);
  // Window seals: where the moss gets in.
  beam([1.2,1.185],[4.46,1.235],s*(W/2-.04),.035,seal,.04);beam([1.95,1.535],[4.15,1.545],s*(W/2-.07),.03,seal,.04);}
 bx(W-.16,.035,.05,seal,0,1.165,Z(1.19));
 beam([4.15,1.53],[4.46,1.3],0,.012,glass,W-.3).name='rear window';
 // Roof: black, with silver rails, and a short spoiler over the rear window.
 add(extrude(sideShape([[1.91,1.505],[2.6,1.585],[3.4,1.61],[4.17,1.535],[4.17,1.585],[3.4,1.655],[2.6,1.635],[1.93,1.555]]),W-.2,0),gloss);
 for(const s of [-1,1])beam([2.15,1.665],[3.95,1.655],s*(W/2-.16),.035,chrome,.04);bx(W-.34,.03,.2,gloss,0,1.57,Z(4.2));
 // Front: slim headlamps joined by a light bar, a black intake and a small grille slot; mirrors.
 const lampMats=[];for(const s of [-1,1]){const lm=M({color:0xe8eef2,emissive:0xf4f8ff,emissiveIntensity:1.8,roughness:.2});lampMats.push(lm);const l=bx(.36,.035,.02,lm,s*.56,.86,Z(.025));l.rotation.x=.67;bx(.44,.11,.02,gloss,s*.55,.85,Z(.035)).rotation.x=.67;bx(.08,.14,.22,gloss,s*(W/2+.07),1.22,Z(1.38));bx(.04,.12,.18,M({color:0x9aa6ad,metalness:.9,roughness:.1}),s*(W/2+.11),1.22,Z(1.38));
  bx(.12,.04,.04,M({color:0xd28a2a,emissive:0xd28a2a,emissiveIntensity:.3}),s*.78,.5,Z(.0));}
 bx(.7,.012,.02,M({color:0xf2f6fa,emissive:0xf4f8ff,emissiveIntensity:.8}),0,.862,Z(.022)).rotation.x=.67;bx(.68,.07,.02,gloss,0,.85,Z(.032)).rotation.x=.67;
 // Rear: a full-width tail light bar with wrap-round corners, red reflectors in the bumper.
 const tailMat=M({color:0x6a0e12,emissive:0xff2a24,emissiveIntensity:.9,roughness:.25});bx(1.5,.06,.04,tailMat,0,1.085,Z(4.57));
 for(const s of [-1,1]){bx(.28,.09,.06,tailMat,s*.76,1.08,Z(4.55));bx(.05,.05,.03,M({color:0x8a1010,emissive:0x501010}),s*.78,.56,Z(4.62));}
 bx(1.62,.12,.02,gloss,0,1.085,Z(4.58));
 // Door seams (rust gets in here) and handles.
 const seam=M({color:0x3a3a3c,roughness:.6},'paint');for(const s of [-1,1]){for(const u of [1.36,2.6,3.7])bx(.004,.72,.012,seam,s*(W/2+.012),.82,Z(u));for(const u of [2.15,3.3])bx(.01,.025,.16,gloss,s*(W/2+.014),1.06,Z(u));}
 // Livery: each part a decal from the signage manifest, drawn now and replaced by its PNG when it loads.
 const decals=[];for(const spec of LIVERY){const [pw,ph]=liveryPixels(spec.size);let tex=null;const mat=()=>{if(tex)return tex.mat;const t=canvasTex(pw,ph,(c,w,h)=>spec.draw(c,w,h,spec));
   if(typeof Image!=='undefined'){const img=new Image();img.onload=()=>{const c=t.image.getContext('2d');c.clearRect(0,0,pw,ph);c.drawImage(img,0,0,pw,ph);t.needsUpdate=true;};img.onerror=()=>{};img.src=spec.file;}
   const m=peel(decayMaterial(new T.MeshStandardMaterial({map:t,transparent:true,roughness:.4,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),'cloth',{local:true}));keep.push(m);tex={mat:m};return m;};
  for(const p of spec.placements){const k=p.scale||1,m=add(new T.PlaneGeometry(spec.size[0]*k,spec.size[1]*k,Math.ceil(spec.size[0]*k/.12),1),mat());m.castShadow=false;m.name=spec.id;m.renderOrder=spec.id.startsWith('livery-band')?1:2;const lift=spec.id.startsWith('livery-band')?.016:.02;
   if(p.side==='right'||p.side==='left'){const s=p.side==='right'?1:-1;m.position.set(s*(W/2+lift),p.v,Z(p.u));m.rotation.set(0,s*Math.PI/2,p.rot||0,'YXZ');}
   else if(p.side==='rear'){m.position.set(p.h,p.v,Z(4.615+lift));m.rotation.z=p.rot||0;}
   else{const t=Math.atan2(.31,.23),u=4.15+(1.53-p.v)/.23*.31;m.position.set(p.h,p.v+Math.sin(t)*.008,Z(u+Math.cos(t)*.008));m.rotation.x=-t;}
   decals.push(m);}}
 // Wheels: 18-inch-look tyres with five twin silver spokes on a dark centre.
 const wheels=[];for(const x of [-CAR.wheelX,CAR.wheelX])for(const u of CAR.wheelU){const w=new T.Group();w.position.set(x,R,Z(u));const s=Math.sign(x);
  const tire=new T.Mesh(new T.CylinderGeometry(R,R,.235,28),rubber);tire.rotation.z=Math.PI/2;w.add(tire);const disc=new T.Mesh(new T.CylinderGeometry(.255,.255,.24,24),rimDark);disc.rotation.z=Math.PI/2;w.add(disc);
  const spokes=[];for(let k=0;k<10;k++){const a=k*Math.PI/5+(k%2?.13:0),sp=new T.BoxGeometry(.03,.035,.21);sp.rotateX(-a);sp.translate(s*.122,Math.sin(a)*.13,Math.cos(a)*.13);spokes.push(sp);}
  const hub=new T.CylinderGeometry(.05,.05,.03,12);hub.rotateZ(Math.PI/2);hub.translate(s*.125,0,0);spokes.push(hub);w.add(new T.Mesh(merge(spokes),rim));
  for(const c of w.children){c.castShadow=true;}g.add(w);wheels.push(w);}
 // Interior: floor, dashboard with a small driver display and a centre screen, steering wheel on the left,
 // two front seats and a bench, door trims, and the campus map lying on the passenger seat.
 const inner=new T.Group();inner.name='interior';g.add(inner);const ia=(geo,mat,x,y,u,rx=0,ry=0)=>{const m=add(geo,mat,x,y,Z(u),inner);m.rotation.set(rx,ry,0);m.castShadow=false;return m;};
 const cloth=M({color:0x3c3d40,roughness:.9},'light'),dash=M({color:0x26272a,roughness:.7},'light'),floor=M({color:0x1e1f21,roughness:.95},'light'),trimM=M({color:0x4a4b4e,roughness:.8},'light');
 const screenMat=M({color:0x10161c,emissive:0x5a7f9a,emissiveIntensity:.35,roughness:.3});
 ia(new T.BoxGeometry(W-.14,.05,2.75),floor,0,.43,2.6);ia(new T.BoxGeometry(W-.14,.26,.4),dash,0,.98,1.42);ia(new T.BoxGeometry(W-.14,.45,.04),floor,0,.66,1.36);ia(new T.BoxGeometry(W-.14,.04,.42),dash,0,1.11,1.45,-.12);
 ia(new T.BoxGeometry(.22,.11,.03),screenMat,-.38,1.17,1.6,-.25);ia(new T.BoxGeometry(.3,.19,.025),screenMat,0,1.2,1.56,-.3);
 const swh=ia(new T.TorusGeometry(.18,.022,10,28),dash,-.38,1.02,1.78,-.4);ia(new T.CylinderGeometry(.025,.025,.3,8),dash,-.38,.98,1.66,-.4+Math.PI/2);
 for(const s of [-1,1]){ia(new T.BoxGeometry(.5,.14,.52),cloth,s*.38,.55,2.25);ia(new T.BoxGeometry(.5,.62,.11),cloth,s*.38,.9,2.55,.16);ia(new T.BoxGeometry(.28,.18,.1),cloth,s*.38,1.29,2.61,.16);
  ia(new T.BoxGeometry(.02,.7,2.6),trimM,s*(W/2-.075),.82,2.6);}
 ia(new T.BoxGeometry(.2,.16,.8),dash,0,.56,2.0);ia(new T.BoxGeometry(W-.24,.14,.5),cloth,0,.55,3.35);ia(new T.BoxGeometry(W-.24,.56,.11),cloth,0,.88,3.62,.14);
 const mapMat=M({map:campusMapTexture(data),roughness:.95,transparent:true,alphaTest:.1,side:T.DoubleSide},'light');const map=ia(new T.PlaneGeometry(.42,.32),mapMat,.38,.625,2.22,-Math.PI/2,.2);map.name='campus map';
 // Round the body in plan: everything on the shell is drawn in toward the centre line near the nose and the
 // tail, so the corners are curved rather than square (baked into the geometry once).
 const pinch=u=>1-(u<.6?.11*(1-u/.6)**2:0)-(u>4.15?.085*((u-4.15)/.45)**2:0);
 for(const m of [...g.children]){if(!m.isMesh)continue;m.updateMatrix();const geo=m.geometry.clone();geo.applyMatrix4(m.matrix);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)*pinch(p.getZ(i)+L/2));geo.computeVertexNormals();m.geometry=geo;m.position.set(0,0,0);m.rotation.set(0,0,0);m.scale.set(1,1,1);}
 const byMat=new Map();for(const m of [...g.children]){if(!m.isMesh||m.name.startsWith('livery')||m===crack)continue;if(!byMat.has(m.material))byMat.set(m.material,[]);byMat.get(m.material).push(m);}
 for(const [mat,ms] of byMat){if(ms.length<2)continue;const mm=new T.Mesh(merge(ms.map(m=>m.geometry)),mat);mm.castShadow=ms.some(m=>m.castShadow);mm.receiveShadow=true;mm.name=ms.map(m=>m.name).filter(Boolean).join(',');for(const m of ms)g.remove(m);g.add(mm);}
 {const by=new Map();for(const m of [...inner.children]){if(m===map)continue;m.updateMatrix();const geo=m.geometry.clone();geo.applyMatrix4(m.matrix);if(!by.has(m.material))by.set(m.material,[]);by.get(m.material).push(geo);inner.remove(m);}
  for(const [mat,geos] of by){const mm=new T.Mesh(merge(geos),mat);mm.receiveShadow=true;inner.add(mm);}}
 g.userData={paint,wheels,tail:tailMat,flame:[],lampMats,interior:inner,map,mapMaterial:mapMat,decals,materials:keep,wheelY:R,
  headlampOffsets:[[-.6,.9,Z(.05)],[.6,.9,Z(.05)]],eye:[-.38,1.22,Z(2.3)]};
 // 2126: the left headlamp at 35%, the screens dead, the windscreen cracked.
 g.userData.updateDecay=()=>{const t=DECAY.value;lampMats[0].emissiveIntensity=1.8*(1-.65*t);lampMats[1].emissiveIntensity=1.8;screenMat.emissiveIntensity=.35*(1-t);crackMat.opacity=t;crack.visible=t>.01;};
 return g;}
