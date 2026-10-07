import * as T from './vendor/three.module.js';
import {adAssets,adSettings,chooseAd,surfacePolicy,adRandom} from './ad-catalog.js?v=17';
const SIZE=2048,COLS=4,ROWS=2;
function canvas(){const c=document.createElement('canvas');c.width=SIZE;c.height=SIZE;return c;}
function tile(asset){return adAssets.indexOf(asset);}
function tileRect(i){return {x:i%COLS*512,y:Math.floor(i/COLS)*1024,w:512,h:1024};}
function drawTile(ctx,asset,image){const r=tileRect(tile(asset));ctx.save();ctx.fillStyle='#a79d7e';ctx.fillRect(r.x,r.y,r.w,r.h);
 if(image){const ratio=Math.min((r.w-16)/image.width,(r.h-16)/image.height),w=image.width*ratio,h=image.height*ratio;ctx.drawImage(image,r.x+(r.w-w)/2,r.y+(r.h-h)/2,w,h);}
 else{ctx.fillStyle=asset.language==='ja'?'#493d37':'#313a35';ctx.fillRect(r.x+20,r.y+20,r.w-40,r.h-40);ctx.fillStyle='#b5ac91';ctx.textAlign='center';ctx.font='48px sans-serif';ctx.fillText(asset.language==='ja'?'文化 / 音楽':'ARTS / FILM',r.x+256,r.y+170);ctx.strokeStyle='#8a795c';ctx.lineWidth=14;for(let j=0;j<6;j++){ctx.beginPath();ctx.arc(r.x+256,r.y+510,80+j*30,.2,5.5);ctx.stroke();}}
 ctx.restore();}
export class AdvertisingSystem{
 constructor(world){this.world=world;this.records=[];this.materials=new Map();this.images=new Map();this.alive=true;this.lastEnabled=adSettings.enabled;this.atlasCanvas=canvas();const ctx=this.atlasCanvas.getContext('2d');ctx.fillStyle='#141a1b';ctx.fillRect(0,0,SIZE,SIZE);for(const a of adAssets)drawTile(ctx,a);this.texture=new T.CanvasTexture(this.atlasCanvas);this.texture.colorSpace=T.SRGBColorSpace;this.texture.minFilter=T.LinearMipmapLinearFilter;this.texture.anisotropy=4;
 this.addStreetSurfaces();let n=0;world.group.traverse(o=>{if(o.userData.adSurface)this.register(o,n++);});
 if(typeof Image!=='undefined')for(const a of adAssets.filter(a=>a.file)){const image=new Image();image.onload=()=>{if(!this.alive)return;this.images.set(a.id,image);drawTile(ctx,a,image);this.texture.needsUpdate=true;this.refresh();};image.onerror=()=>{if(this.alive){this.images.set(a.id,null);this.refresh();}};image.src=new URL(a.file,import.meta.url).href;}
 }
 addStreetSurfaces(){const w=this.world,edge=w.config.halfWidth;
 for(let i=0;i<12;i++){const g=new T.Group(),side=i%2?1:-1,kind=i%4===0?'shelter':i%4===2?'hoarding':'poster',width=kind==='shelter'?1.7:kind==='hoarding'?3.2:2,height=kind==='shelter'?2.6:3;
 const mount=new T.Group();mount.position.set(0,2.1,0);mount.rotation.y=-side*.35;
 const frame=new T.Mesh(new T.BoxGeometry(width+.2,height+.2,.16),new T.MeshStandardMaterial({color:0x554b3e,metalness:.35,roughness:.85}));frame.position.z=-.1;mount.add(frame);
 const panel=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshStandardMaterial({color:0x847d6a}));panel.userData.adSurface={kind,width,height,original:'Empty authored '+kind+' panel',sheltered:kind==='shelter'||kind==='storefront'};mount.add(panel);g.add(mount);
 if(kind==='shelter'){const metal=frame.material;for(const x of [-1.7,1.7]){const post=new T.Mesh(new T.BoxGeometry(.12,3.7,.12),metal);post.position.set(x,1.85,-.8);g.add(post);}const roof=new T.Mesh(new T.BoxGeometry(3.7,.12,2.5),metal);roof.position.set(0,3.7,-.8);g.add(roof);const bench=new T.Mesh(new T.BoxGeometry(2.4,.12,.6),metal);bench.position.set(0,.65,-1);g.add(bench);}
 w.add(g,27+i*66,side*(edge+2.6));
 }
 // Storefront posters sit on actual building fronts, clear of the road.
 for(const prop of [...w.props]){const body=prop.g.children.find(o=>o.isMesh&&o.scale.y>15&&o.scale.x>5);if(!body)continue;const side=Math.sign(prop.x),panel=new T.Mesh(new T.PlaneGeometry(1.6,2.3),new T.MeshStandardMaterial({color:0x8d846d,roughness:.9}));panel.position.set(-side*(body.scale.x/2+.27),2,body.scale.z*.28);panel.rotation.y=-side*Math.PI/2;panel.userData.adSurface={kind:'storefront',width:1.6,height:2.3,original:'Empty authored storefront poster recess',sheltered:true};prop.g.add(panel);if(prop.s>210)break;}
 }
 register(mesh,index){const original=mesh.material,meta=mesh.userData.adSurface,policy=surfacePolicy(index,meta.kind,this.world.config.id);const rec={id:this.world.config.id+'-'+index,index,mesh,meta,...policy,original:meta.original,originalMap:original.map,override:null,distance:0,lod:'near',asset:null,visible:true};
 // Retain original texture for inspector; dispose original material during system cleanup.
 rec.originalMaterial=original;this.records.push(rec);this.apply(rec);
 if(['powered','flicker'].includes(rec.state)){const mount=mesh.parent;const panel=new T.Mesh(new T.BoxGeometry(3,.12,2),new T.MeshStandardMaterial({color:0x20344b,metalness:.6,roughness:.28}));panel.position.set(0,meta.height/2+1,-1);panel.rotation.x=.32;mount.add(panel);const battery=new T.Mesh(new T.BoxGeometry(.9,1.3,.65),new T.MeshStandardMaterial({color:0x54584b,roughness:.8}));battery.position.set(meta.width/2+.8,-meta.height/2+.65,-.3);mount.add(battery);const wire=new T.Mesh(new T.CylinderGeometry(.025,.025,meta.height,6),new T.MeshStandardMaterial({color:0x242622}));wire.position.set(meta.width/2+.3,0,-.2);mount.add(wire);const light=new T.PointLight(0xf5d3a1,0,22,2);light.position.z=2;mount.add(light);rec.light=light;}
 if(index%4===1){const leaves=new T.InstancedMesh(new T.PlaneGeometry(.28,.38),new T.MeshStandardMaterial({color:0x4f663a,roughness:1,side:T.DoubleSide}),24),o=new T.Object3D();for(let j=0;j<24;j++){o.position.set(-meta.width*.48+adRandom(j+index)*meta.width*.23,(adRandom(j+67)-.5)*meta.height,.06);o.rotation.z=adRandom(j)*2;o.updateMatrix();leaves.setMatrixAt(j,o.matrix);}mesh.add(leaves);}
 }
 apply(rec){let asset=chooseAd(this.world.config.id,rec.index,rec.meta.kind,adSettings.enabled);if(asset.file&&this.images.has(asset.id)&&!this.images.get(asset.id))asset=chooseAd(this.world.config.id,rec.index,rec.meta.kind,false);rec.asset=asset;const idx=tile(asset),r=tileRect(idx),geometry=rec.mesh.geometry;
 const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++){const x=i%2,y=i<2?1:0;uv.setXY(i,(r.x+4+x*(r.w-8))/SIZE,1-(r.y+4+(1-y)*(r.h-8))/SIZE);}uv.needsUpdate=true;
 const state=rec.override||rec.state,bucket=Math.round(rec.weather*5),aspect=Math.round(rec.meta.width/rec.meta.height*4)/4,key=asset.id+':'+state+':'+bucket+':'+aspect;
 if(!this.materials.has(key)){const material=new T.MeshStandardMaterial({map:this.texture,color:0xc5bc9f,roughness:.82,metalness:rec.meta.kind==='digital'?.2:0,emissiveMap:this.texture,emissive:0xffffff,emissiveIntensity:0,side:T.DoubleSide});material.userData.adState=state;material.onBeforeCompile=sh=>{sh.uniforms.adAge={value:bucket/5};sh.uniforms.adAspect={value:aspect};sh.uniforms.adTile={value:new T.Vector4(r.x/SIZE,1-(r.y+r.h)/SIZE,r.w/SIZE,r.h/SIZE)};sh.uniforms.adMode={value:['dark','shattered'].includes(state)?1:state==='corrupted'?2:state==='flicker'?3:0};sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float adAge;uniform vec4 adTile;uniform float adMode;uniform float adAspect;');sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`vec2 adLocal=(vMapUv-adTile.xy)/adTile.zw;adLocal.x=(adLocal.x-.5)*adAspect/.5+.5;vec2 adSample=adTile.xy+clamp(adLocal,vec2(.005),vec2(.995))*adTile.zw;vec4 adTex=texture2D(map,adSample);if(adLocal.x<0.||adLocal.x>1.)adTex.rgb=vec3(.018);diffuseColor*=adTex;`);sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 au=(vMapUv-adTile.xy)/adTile.zw;float grain=fract(sin(dot(floor(au*230.),vec2(17.1,91.7)))*43758.5);
float stain=sin(au.x*41.+sin(au.y*6.))*sin(au.y*13.);float rip=step(.87,grain)*step(.68,sin(au.y*57.+au.x*14.))*adAge;
float edge=pow(abs(au.x-.5)*2.,5.);float crack=1.-smoothstep(.008,.02,abs(au.x-.4-.12*sin(au.y*12.)));
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.54,.50,.40),adAge*.37);diffuseColor.rgb*=1.-adAge*(.18+max(0.,stain)*.34+edge*.3);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.20,.21,.18),rip);diffuseColor.rgb*=1.-crack*adAge*.7;
float signal=adMode==1.?0.:adMode==2.?step(.72,fract(au.y*9.))*step(.22,au.x):1.;
if(adMode==1.)diffuseColor.rgb=vec3(.018,.025,.028)*(1.-crack*.8);
`);sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','totalEmissiveRadiance*=adTex.rgb;\ntotalEmissiveRadiance*=signal*(1.-adAge*.5)*(1.-crack*.7);');};material.customProgramCacheKey=()=> 'nightview-ad-weather-v1';this.materials.set(key,material);}
 rec.mesh.material=this.materials.get(key);
 }
 refresh(){for(const rec of this.records)this.apply(rec);}
 setEnabled(value){adSettings.enabled=Boolean(value);this.lastEnabled=adSettings.enabled;this.refresh();}
 configure(id,{weather,state}={}){const r=this.records.find(r=>r.id===id);if(!r)return;if(Number.isFinite(weather))r.weather=Math.max(0,Math.min(1,weather));if(state!==undefined)r.override=state==='auto'?null:state;this.apply(r);}
 update(time){if(this.lastEnabled!==adSettings.enabled){this.lastEnabled=adSettings.enabled;this.refresh();}for(const m of this.materials.values()){const state=m.userData.adState;m.emissiveIntensity=state==='powered'?.65:state==='frozen'?0:state==='corrupted'?0:state==='flicker'?(Math.sin(time*13)> .85?.06:0):0;}
 for(const r of this.records){const p=new T.Vector3();r.mesh.getWorldPosition(p);r.distance=p.length();r.lod=r.distance<85?'near':r.distance<180?'mipmapped':'distant';r.mesh.visible=r.distance<300;r.visible=r.mesh.visible&&r.mesh.parent.visible;if(r.light)r.light.intensity=r.distance<100?12*r.mesh.material.emissiveIntensity:0;}
 }
 snapshot(){return this.records.map(r=>({id:r.id,kind:r.meta.kind,original:r.original,brand:r.asset.brand,asset:r.asset.id,source:r.asset.source,license:r.asset.license,status:r.asset.status,relevance:r.asset.relevance,weather:r.weather,state:r.override||r.state,power:r.power,lod:r.lod,distance:Math.round(r.distance),loaded:!r.asset.file||this.images.has(r.asset.id)&&!!this.images.get(r.asset.id)}));}
 preview(id,original=false){const r=this.records.find(r=>r.id===id);if(!r)return null;if(original&&r.originalMap?.image?.toDataURL)return r.originalMap.image.toDataURL('image/jpeg');const c=document.createElement('canvas');c.width=256;c.height=512;const ctx=c.getContext('2d'),t=tileRect(tile(r.asset));ctx.drawImage(this.atlasCanvas,t.x,t.y,t.w,t.h,0,0,256,512);if(!original){ctx.fillStyle=`rgba(45,43,32,${r.weather*.4})`;ctx.fillRect(0,0,256,512);if(['dark','shattered'].includes(r.override||r.state)){ctx.fillStyle='#11191b';ctx.fillRect(0,0,256,512);}}return c.toDataURL('image/jpeg');}
 dispose(){this.alive=false;for(const r of this.records){r.originalMaterial.dispose();r.originalMap?.dispose();}for(const m of this.materials.values())m.dispose();this.texture.dispose();}
}
