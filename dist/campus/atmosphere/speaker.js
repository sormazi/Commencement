import * as T from '../../vendor/three.module.js';
import {CURB_HEIGHT} from '../collision.js?v=21';
import {SPEAKER} from '../../soundtrack.js?v=21';
import {decayMaterial} from './decay.js?v=21';
// The broken loudspeaker the soundtrack plays through: an old horn speaker on a pole just south of the
// Arch, knocked askew, its cable hanging loose. Three meshes.
export function buildSpeaker(world){const g=new T.Group();g.name='broken loudspeaker';const keep=x=>{world.disposables.add(x);return x;};
 const metal=keep(decayMaterial(new T.MeshStandardMaterial({color:0x6b6f6a,roughness:.6,metalness:.5}),'metal'));
 const pole=new T.Mesh(keep(new T.CylinderGeometry(.07,.1,5.2,8)),metal);pole.position.y=2.6;
 const horn=new T.Mesh(keep(new T.CylinderGeometry(.42,.1,.85,12,1,true).rotateX(Math.PI/2)),metal);horn.position.set(.15,4.6,.35);horn.rotation.set(.45,.5,.15);
 const back=new T.Mesh(keep(new T.CylinderGeometry(.16,.16,.3,10).rotateX(Math.PI/2)),metal);back.position.set(.05,4.75,-.05);back.rotation.copy(horn.rotation);
 const cable=new T.Mesh(keep(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,4.9,0),new T.Vector3(.4,4.0,.3),new T.Vector3(.3,2.4,.6),new T.Vector3(.7,.4,.9)]),16,.015,4)),keep(new T.MeshStandardMaterial({color:0x111111,roughness:.8})));
 g.add(pole,horn,back,cable);g.position.set(SPEAKER.x,CURB_HEIGHT,-SPEAKER.z);g.rotation.y=.8;return g;}
