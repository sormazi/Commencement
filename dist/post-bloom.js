import * as T from './vendor/three.module.js';
// Soft bloom (Step A.3). Replaces the old 25-tap full-resolution glow with a mip chain at half resolution
// and below: a soft-threshold bright pass picks out what is really brighter than white in the HDR frame
// (working lamps, lit shop windows and signs, headlights, the sun on glass), then a dual-filter blur goes
// down `levels` halvings and back up, adding each level, so the glow is tight near the source and wide and
// faint further out. Cost is a handful of small passes; the number of levels comes from the graphics preset
// (dist/quality.js): off on Low, 4 on Medium, 5 on High.
const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const mat=(fs,uniforms)=>new T.ShaderMaterial({uniforms,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false,toneMapped:false});
export class Bloom{
 constructor(renderer){this.renderer=renderer;this.levels=5;this.down=[];this.up=[];this.w=0;this.h=0;
  this.scene=new T.Scene();this.camera=new T.OrthographicCamera(-1,1,1,-1,0,1);this.quad=new T.Mesh(new T.PlaneGeometry(2,2));this.scene.add(this.quad);
  // Bright pass with a soft knee, and a 4-tap box downsample whose taps are weighted by 1/(1+luma) so a
  // single very bright pixel cannot flicker as a big square.
  this.pre=mat(`uniform sampler2D src;uniform vec2 texel;uniform float threshold;uniform float knee;varying vec2 vUv;
vec4 tap(vec2 o){vec3 c=texture2D(src,vUv+o*texel).rgb;float l=max(c.r,max(c.g,c.b));float rq=clamp(l-threshold+knee,0.,2.*knee);rq=rq*rq/(4.*knee+1e-4);float k=max(rq,l-threshold)/max(l,1e-4);float w=1./(1.+dot(c,vec3(.2126,.7152,.0722)));return vec4(min(c*k,vec3(40.))*w,w);}
void main(){vec4 s=tap(vec2(-1.,-1.))+tap(vec2(1.,-1.))+tap(vec2(-1.,1.))+tap(vec2(1.,1.));gl_FragColor=vec4(s.rgb/s.a,1.);}`,{src:{value:null},texel:{value:new T.Vector2()},threshold:{value:1},knee:{value:.4}});
  // Dual-filter (Kawase) down and up passes.
  this.dn=mat(`uniform sampler2D src;uniform vec2 texel;varying vec2 vUv;void main(){vec2 h=texel*.5;
vec3 s=texture2D(src,vUv).rgb*4.+texture2D(src,vUv-h).rgb+texture2D(src,vUv+h).rgb+texture2D(src,vUv+vec2(h.x,-h.y)).rgb+texture2D(src,vUv-vec2(h.x,-h.y)).rgb;gl_FragColor=vec4(s/8.,1.);}`,{src:{value:null},texel:{value:new T.Vector2()}});
  this.upm=mat(`uniform sampler2D low;uniform sampler2D cur;uniform vec2 texel;varying vec2 vUv;void main(){vec2 h=texel*.5;vec3 s=vec3(0.);
s+=texture2D(low,vUv+vec2(-h.x*2.,0.)).rgb+texture2D(low,vUv+vec2(h.x*2.,0.)).rgb+texture2D(low,vUv+vec2(0.,h.y*2.)).rgb+texture2D(low,vUv+vec2(0.,-h.y*2.)).rgb;
s+=(texture2D(low,vUv+vec2(-h.x,h.y)).rgb+texture2D(low,vUv+vec2(h.x,h.y)).rgb+texture2D(low,vUv+vec2(h.x,-h.y)).rgb+texture2D(low,vUv+vec2(-h.x,-h.y)).rgb)*2.;
gl_FragColor=vec4(s/12.+texture2D(cur,vUv).rgb,1.);}`,{low:{value:null},cur:{value:null},texel:{value:new T.Vector2()}});
  this.black=new T.DataTexture(new Uint8Array([0,0,0,255]),1,1);this.black.needsUpdate=true;}
 get texture(){return this.on&&this.up[0]?this.up[0].texture:this.black;}
 setSize(w,h){w=Math.max(1,w>>1);h=Math.max(1,h>>1);if(w===this.w&&h===this.h)return;this.w=w;this.h=h;for(const t of [...this.down,...this.up])t.dispose();this.down=[];this.up=[];
  for(let i=0;i<6;i++){const o={type:T.HalfFloatType,depthBuffer:false};const a=Math.max(1,w>>i),b=Math.max(1,h>>i);this.down.push(new T.WebGLRenderTarget(a,b,o));this.up.push(new T.WebGLRenderTarget(a,b,o));}}
 pass(m,target){this.quad.material=m;this.renderer.setRenderTarget(target);this.renderer.render(this.scene,this.camera);}
 // src: the HDR scene target. Leaves the summed glow in this.texture (half resolution).
 render(src){if(!this.on)return;const r=this.renderer,prevAuto=r.autoClear,n=Math.min(this.levels,this.down.length);r.autoClear=false;
  // Threshold in scene light (before exposure): at night lamps, windows and signs are the brightest things
  // and sit around 0.6 to 2; by day sunlit pale stone reaches 2, so only real highlights should pass.
  {const e=r.toneMappingExposure||1,k=this.night||0;this.pre.uniforms.threshold.value=(2.4+(.42-2.4)*k)/e;this.pre.uniforms.knee.value=.9+(.2-.9)*k;}
  this.pre.uniforms.src.value=src.texture;this.pre.uniforms.texel.value.set(1/src.width,1/src.height);this.pass(this.pre,this.down[0]);
  for(let i=1;i<n;i++){this.dn.uniforms.src.value=this.down[i-1].texture;this.dn.uniforms.texel.value.set(1/this.down[i-1].width,1/this.down[i-1].height);this.pass(this.dn,this.down[i]);}
  let low=this.down[n-1];for(let i=n-2;i>=0;i--){const u=this.upm.uniforms;u.low.value=low.texture;u.cur.value=this.down[i].texture;u.texel.value.set(1/low.width,1/low.height);this.pass(this.upm,this.up[i]);low=this.up[i];}
  if(n===1){this.dn.uniforms.src.value=this.down[0].texture;this.dn.uniforms.texel.value.set(0,0);this.pass(this.dn,this.up[0]);}
  r.setRenderTarget(null);r.autoClear=prevAuto;}}
