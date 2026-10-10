import * as T from '../../vendor/three.module.js';
// Live reflection probe (Step A.5). The scene's environment map was a fixed set of generic city panels;
// now a small cube camera follows the view and renders the real surroundings, one face at a time, so the
// glass on Kimmel, the Paulson Center, storefront vestibules and the car's paint reflect the actual square,
// its sky, its lamps at night and its lit windows. After the sixth face the cube is marked for three.js to
// re-filter (PMREM) into the roughness levels that MeshStandardMaterial reads.
// Only shiny materials get it (glass, polished metal, car paint: roughness under 0.35 with some metalness,
// or transmissive glass). Everything else keeps the static environment, whose soft light the night look was
// tuned on: a truthful night cube is nearly black and would leave stone and brick unlit.
// Cost: one 128 px face every `every` frames, with shadows frozen and a short far plane. High refreshes the
// whole cube about three times a second, Medium about once every two seconds; Low keeps the static panels.
export class EnvProbe{
 constructor(renderer,scene,{size=128}={}){this.renderer=renderer;this.scene=scene;this.on=false;this.every=3;this.frame=0;this.face=0;
  this.target=new T.WebGLCubeRenderTarget(size,{type:T.HalfFloatType,generateMipmaps:false});this.target.texture.mapping=T.CubeReflectionMapping;
  this.cam=new T.CubeCamera(.5,260,this.target);this.cam.layers.enableAll();this.ready=false;this.shiny=new Set();this.lastScan=0;}
 shinyTest(m){return m&&m.isMeshStandardMaterial&&!m.envMap&&((m.roughness<.35&&m.metalness>=.2)||m.transmission>0);}
 scan(){this.scene.traverse(o=>{if(!o.isMesh)return;for(const m of [].concat(o.material)){if(this.shiny.has(m)||!this.shinyTest(m))continue;m.envMap=this.target.texture;m.needsUpdate=true;this.shiny.add(m);}});}
 setMode(mode){// 'off' | 'medium' | 'high'
  this.on=mode!=='off';this.every=mode==='high'?3:20;if(!this.on){for(const m of this.shiny){m.envMap=null;m.needsUpdate=true;}this.shiny.clear();this.ready=false;this.face=0;}}
 update(position){if(!this.on)return;if(++this.frame%this.every)return;const r=this.renderer,cam=this.cam;
  if(this.face===0){cam.position.copy(position);cam.position.y=Math.max(cam.position.y,1.8);cam.updateMatrixWorld(true);}
  // CubeCamera's children are the six face cameras, in the order of the cube's faces.
  const c=cam.children[this.face];const prevT=r.getRenderTarget(),prevShadow=r.shadowMap.autoUpdate,prevXR=r.xr.enabled,prevTone=r.toneMapping;
  r.shadowMap.autoUpdate=false;r.xr.enabled=false;r.toneMapping=T.NoToneMapping;
  r.setRenderTarget(this.target,this.face);r.clear();r.render(this.scene,c);
  r.setRenderTarget(prevT);r.shadowMap.autoUpdate=prevShadow;r.xr.enabled=prevXR;r.toneMapping=prevTone;
  if(++this.face===6){this.face=0;this.target.texture.needsPMREMUpdate=true;this.ready=true;
   // New tiles stream in as the car moves, so look for new shiny materials every few seconds.
   const now=performance.now();if(now-this.lastScan>3000){this.lastScan=now;this.scan();}}}}
