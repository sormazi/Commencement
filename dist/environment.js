import * as T from './vendor/three.module.js';
export const reclamationProfiles={
 'times-square':{seed:41,age:.7,moisture:.65,vegetation:.72,story:'evacuation'},
 'soho':{seed:93,age:.56,moisture:.8,vegetation:.95,story:'shelter'},
 'shibuya':{seed:157,age:.64,moisture:.72,vegetation:.82,story:'checkpoint'}
};
export const seeded=n=>{const v=Math.sin(n*127.1+14.7)*43758.5453;return v-Math.floor(v);};
// Object-relative metric masks remain attached when a district recycles around the camera.
export function weatherMaterial(material,{age=.6,moisture=.7,height=0,seed=0}={}){
 const m=material.clone();m.roughness=Math.max(.65,m.roughness);m.metalness=Math.min(.18,m.metalness);m.emissiveIntensity=Math.min(.018,m.emissiveIntensity||0);
 m.onBeforeCompile=shader=>{Object.assign(shader.uniforms,{ageStrength:{value:age},ageMoisture:{value:moisture},ageHeight:{value:height/2},ageSeed:{value:seed}});
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 agePosition;varying vec3 ageNormal;uniform float ageHeight;').replace('#include <begin_vertex>','#include <begin_vertex>\nagePosition=mat3(modelMatrix)*position+vec3(0.,ageHeight,0.);ageNormal=normalize(mat3(modelMatrix)*normal);');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 agePosition;varying vec3 ageNormal;uniform float ageStrength;uniform float ageMoisture;uniform float ageSeed;
float ageHash(vec3 p){return fract(sin(dot(p,vec3(12.71,39.17,71.93))+ageSeed)*43758.5453);}
float ageNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(ageHash(i),ageHash(i+vec3(1,0,0)),f.x),mix(ageHash(i+vec3(0,1,0)),ageHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(ageHash(i+vec3(0,0,1)),ageHash(i+vec3(1,0,1)),f.x),mix(ageHash(i+vec3(0,1,1)),ageHash(i+vec3(1,1,1)),f.x),f.y),f.z);}`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 ap=agePosition;float broad=ageNoise(ap*.38),fine=ageNoise(ap*19.);
float damp=(1.-smoothstep(0.,7.,ap.y))*ageMoisture;
float streak=pow(ageNoise(vec3(ap.x*3.,ap.y*.05,ap.z*3.)),5.)*ageStrength;
float moss=smoothstep(.47,.72,broad+damp*.32)*damp;
float crack=1.-smoothstep(.015,.04,abs(ageNoise(ap*2.4)-.51));crack*=smoothstep(.43,.68,broad)*ageStrength;
diffuseColor.rgb*=mix(.72,1.08,fine);diffuseColor.rgb*=1.-streak*.55-crack*.5;
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.13,.19,.075),moss*.64);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.23,.19,.13),smoothstep(.67,.84,broad)*ageStrength*.3);`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(mix(roughnessFactor,.35,damp*.4)+fine*.08-streak*.1,.3,1.);');
 };m.customProgramCacheKey=()=> 'nightview-weather-v1';return m;
}
function mesh(g,x,y,z,w,h,d,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);return m;}
function atlas(draw){const c=document.createElement('canvas');c.width=512;c.height=512;draw(c.getContext('2d'));const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
export class EnvironmentTransformation{
 constructor(world){this.world=world;this.profile=reclamationProfiles[world.config.id];this.windMaterials=[];this.applyStructure();this.groundLayers();this.storyLayers();}
 applyStructure(){const {world,profile:p}=this;let index=0;for(const prop of [...world.props]){const body=prop.g.children.find(o=>o.isMesh&&o.scale.y>15&&o.scale.x>5);if(!body)continue;const seed=p.seed+index++,side=Math.sign(prop.x),front=-side*(body.scale.x/2+.16),height=body.scale.y,width=body.scale.z;
 const original=body.material;body.material=weatherMaterial(original,{...p,height,seed});original.dispose();
 // Recessed shop shutters and damaged glazing contrast with intact upper stories.
 const shop=new T.MeshStandardMaterial({color:seed%3?0x686758:0x816f5a,roughness:.94});const count=Math.floor(width/4),inst=new T.InstancedMesh(new T.BoxGeometry(.12,2.6,3.1),weatherMaterial(shop,{...p,height:3,seed}),count);const o=new T.Object3D();for(let i=0;i<count;i++){o.position.set(front,1.45,(i-(count-1)/2)*4);o.updateMatrix();inst.setMatrixAt(i,o.matrix);}prop.g.add(inst);shop.dispose();
 // Architectural ledges give silhouettes physical depth without individual draw calls.
 const rows=Math.min(18,Math.floor(height/4)),sills=new T.InstancedMesh(new T.BoxGeometry(.45,.16,width+.5),new T.MeshStandardMaterial({color:0x898778,roughness:.9}),rows);for(let i=0;i<rows;i++){o.position.set(front,4+i*4,0);o.updateMatrix();sills.setMatrixAt(i,o.matrix);}prop.g.add(sills);
 // Ivy follows the actual facade plane; it does not float in a roadside volume.
 const ivyCount=Math.floor(180*p.vegetation),ivy=new T.InstancedMesh(new T.PlaneGeometry(.36,.46),new T.MeshStandardMaterial({color:0x61784a,roughness:1,side:T.DoubleSide}),ivyCount);for(let i=0;i<ivyCount;i++){const y=seeded(i+seed)*Math.min(height*.7,22),z=Math.sin(y*.25+seed)*2+(seeded(i+seed+99)-.5)*5;o.position.set(front-side*.15,y,z);o.rotation.set(0,Math.PI/2,(seeded(i+5)-.5)*1.5);o.scale.setScalar(.7+seeded(i+seed+29));o.updateMatrix();ivy.setMatrixAt(i,o.matrix);}prop.g.add(ivy);
 }
 }
 groundLayers(){const {world:w,profile:p}=this;const mossTex=atlas(c=>{c.clearRect(0,0,512,512);for(let i=0;i<1500;i++){const x=seeded(i+p.seed)*512,y=seeded(i+187)*512;c.fillStyle=`rgba(${45+Math.floor(seeded(i)*30)},${57+Math.floor(seeded(i+14)*32)},35,${.15+seeded(i+61)*.45})`;c.beginPath();c.ellipse(x,y,2+seeded(i+44)*13,1+seeded(i+55)*7,seeded(i)*6,0,Math.PI*2);c.fill();}});
 const mossMat=new T.MeshStandardMaterial({map:mossTex,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-2});
 for(let i=0;i<44;i++){const side=i%2?1:-1,g=new T.Group(),edge=w.config.halfWidth,seed=i+p.seed;
 const moss=new T.Mesh(new T.PlaneGeometry(4,14),mossMat);moss.userData.noShadow=true;moss.rotation.x=-Math.PI/2;moss.position.set(side*(edge-.2),.041,0);g.add(moss);
 // Grasses rooted along pavement seams, with tapering blades and shader wind.
 const blades=Math.floor(640*p.vegetation),geometry=new T.BufferGeometry(),verts=[-.035,0,0,.035,0,0,.012,.65,0,0,.9,.04];geometry.setAttribute('position',new T.Float32BufferAttribute(verts,3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();const material=new T.MeshStandardMaterial({color:0x889666,roughness:1,side:T.DoubleSide});material.onBeforeCompile=sh=>{sh.uniforms.windTime={value:0};this.windMaterials.push(sh);sh.vertexShader='uniform float windTime;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x+=sin(windTime*1.4+instanceMatrix[3].x*.9+instanceMatrix[3].z*.4)*position.y*position.y*.1;');};
 const grass=new T.InstancedMesh(geometry,material,blades),o=new T.Object3D(),color=new T.Color();for(let b=0;b<blades;b++){o.position.set(side*(edge-.5+seeded(b+seed)*2.8),.035,(seeded(b+seed+65)-.5)*18);o.rotation.set(0,seeded(b+80)*6.28,0);o.scale.setScalar(.3+seeded(b+seed+9)*.9);o.updateMatrix();grass.setMatrixAt(b,o.matrix);color.setHSL(.18+seeded(b)*.08,.23,.22+seeded(b+41)*.2);grass.setColorAt(b,color);}g.add(grass);
 // Dark, reflective puddles collect next to curbs, clear of the racing line.
 if(i%3===0){const puddle=new T.Mesh(new T.CircleGeometry(1,28),new T.MeshPhysicalMaterial({color:0x53615d,roughness:.06,metalness:.32,clearcoat:1,transparent:true,opacity:.7}));puddle.userData.noShadow=true;puddle.rotation.x=-Math.PI/2;puddle.scale.set(1.2,3.4,1);puddle.position.set(side*(edge-1.3),.045,2);g.add(puddle);}w.add(g,20+i*20);
 }
 }
 storyLayers(){const {world:w,profile:p}=this,metal=new T.MeshStandardMaterial({color:0x675a48,metalness:.3,roughness:.88}),concrete=new T.MeshStandardMaterial({color:0x8c8876,roughness:1});
 for(let i=0;i<8;i++){const g=new T.Group(),side=i%2?1:-1;mesh(g,0,.45,0,1.1,.9,4,concrete);for(let j=0;j<4;j++){const plank=mesh(g,side*.7,1+j*.55,0,.12,.15,4.3,metal);plank.rotation.x=j%2?.16:-.18;}if(p.story==='shelter'){const tarp=new T.Mesh(new T.PlaneGeometry(4,3),new T.MeshStandardMaterial({color:0x6a6f59,roughness:1,side:T.DoubleSide}));tarp.rotation.x=-1.2;tarp.position.set(side*2,2.5,0);g.add(tarp);}else{for(let j=0;j<3;j++)mesh(g,side*2,.3,2+j*.8,.7,.6,.6,metal);}w.add(g,140+i*95,side*(w.config.halfWidth+3));}
 }
 update(time){for(const sh of this.windMaterials)sh.uniforms.windTime.value=time;}
}
