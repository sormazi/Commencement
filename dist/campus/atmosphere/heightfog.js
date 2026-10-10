import * as T from '../../vendor/three.module.js';
// Height fog (Step A.4). Replaces three.js's fog chunks once, at load, so every lit and unlit material gets
// it with no per-material work: the old exponential-squared distance haze stays, and on top of it a layer
// of fog that is densest at street level and thins with height (about 9 m to fall to a third), so streets
// and the park sit in mist while upper floors and the skyline stay clear. The amount along each view ray is
// the exact integral of that profile between the camera and the surface.
// Uniforms: three.js only uploads fogNear/fogFar for linear fog, so HeightFog is a linear Fog object whose
// two numbers carry the distance density (`density`, as FogExp2 had) and the ground density (`height`).
export const FOG_FALLOFF=9.0;
T.ShaderChunk.fog_pars_vertex='#ifdef USE_FOG\n varying float vFogDepth;\n varying float vFogY;\n#endif';
// World height of the vertex from the view-space position: the view matrix is rigid (mv = R w + t), so
// world y = camera y + dot(column 1 of R, mv).
T.ShaderChunk.fog_vertex='#ifdef USE_FOG\n vFogDepth=-mvPosition.z;\n vFogY=cameraPosition.y+dot(viewMatrix[1].xyz,mvPosition.xyz);\n#endif';
T.ShaderChunk.fog_pars_fragment='#ifdef USE_FOG\n uniform vec3 fogColor;\n varying float vFogDepth;\n varying float vFogY;\n uniform float fogNear;\n uniform float fogFar;\n#endif';
T.ShaderChunk.fog_fragment=`#ifdef USE_FOG
 {float dist=vFogDepth;float dd=fogNear*dist;float H=${FOG_FALLOFF.toFixed(1)};
  float yc=cameraPosition.y,yf=vFogY,dy=yf-yc;
  float avg=abs(dy)>.05?H*(exp(-max(yc,0.)/H)-exp(-max(yf,0.)/H))/(yf-yc):exp(-max(yf,0.)/H);
  float fogFactor=1.-exp(-(dd*dd+fogFar*dist*max(avg,0.)));
  gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,clamp(fogFactor,0.,1.));}
#endif`;
export class HeightFog extends T.Fog{
 constructor(color,density=.0029,height=0){super(color,density,height);this.isHeightFog=true;}
 get density(){return this.near;}set density(v){this.near=v;}
 get height(){return this.far;}set height(v){this.far=v;}
 clone(){return new HeightFog(this.color,this.near,this.far);}}
