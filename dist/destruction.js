import * as T from './vendor/three.module.js';
const rnd=n=>{const v=Math.sin(n*17.31+4.13)*17419.9;return v-Math.floor(v);};
const geo=new T.BoxGeometry(1,1,1);
const masonry=new T.MeshStandardMaterial({color:0x807968,roughness:1}),voidMat=new T.MeshStandardMaterial({color:0x222b27,roughness:1});
// Breakable facade panels expose a dark cavity and eject finite, pooled masonry.
export class FacadeDestruction{
 constructor(world){this.world=world;this.panels=[];this.chunks=[];this.lastTime=0;this.lastPosition=0;this.emitted=0;this.group=new T.Group();world.group.add(this.group);
 for(const p of world.props){const body=p.g.children.find(o=>o.isMesh&&o.scale.y>15&&o.scale.x>5);if(!body||Math.abs(p.x)<10)continue;const side=Math.sign(p.x),face=-side*(body.scale.x/2+.14);
 for(let i=0;i<3;i++){const y=6+i*3.5,z=(i-1)*Math.min(6,body.scale.z*.22),panel=new T.Mesh(geo,masonry);panel.position.set(face,y,z);panel.scale.set(.32,2.6,2.8);panel.castShadow=true;p.g.add(panel);const cavity=new T.Mesh(geo,voidMat);cavity.position.set(face+side*.1,y,z);cavity.scale.set(.04,2.5,2.7);cavity.visible=false;p.g.add(cavity);this.panels.push({panel,cavity,p,side,y,z,cycle:null});}
 }
 for(let i=0;i<72;i++){const m=new T.Mesh(geo,masonry);m.castShadow=true;m.visible=false;this.group.add(m);this.chunks.push({m,life:0,x:0,y:0,s:0,vx:0,vy:0,vz:0,seed:i});}this.cursor=0;
 }
 break(panel,position,time){panel.panel.visible=false;panel.cavity.visible=true;this.emitted++;for(let i=0;i<6;i++){const c=this.chunks[this.cursor++%this.chunks.length],seed=this.emitted*21+i;c.life=8;c.x=panel.p.x+panel.panel.position.x;c.y=panel.y+(rnd(seed)-.5)*2;c.s=panel.p.s-panel.z+(Math.floor((position-panel.p.s+70)/this.world.config.length))*this.world.config.length;c.vx=-panel.side*(1.7+rnd(seed+1)*3);c.vy=1+rnd(seed+2)*2;c.vz=(rnd(seed+3)-.5)*3;c.m.scale.set(.3+rnd(seed)*.5,.3+rnd(seed+7)*.6,.3+rnd(seed+12)*.6);c.m.rotation.set(rnd(seed)*3,rnd(seed+1)*3,rnd(seed+2)*3);}}
 update(position,time){const dt=Math.max(0,Math.min(.05,time-this.lastTime)),moving=Math.abs(position-this.lastPosition)>.025;this.lastTime=time;this.lastPosition=position;const length=this.world.config.length;
 for(let i=0;i<this.panels.length;i++){const p=this.panels[i],z=-p.p.g.position.z,cycle=Math.floor((position-p.p.s+70)/length);if(p.cycle!==cycle){p.cycle=cycle;p.panel.visible=true;p.cavity.visible=false;}if(moving&&p.panel.visible&&z>10&&z<55&&Math.sin(time*1.7+i)>.92)this.break(p,position,time);}
 for(const c of this.chunks){c.life=Math.max(0,c.life-dt);c.m.visible=c.life>0;if(!c.life)continue;c.vy-=9.8*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.s+=c.vz*dt;if(c.y<.22){c.y=.22;c.vy=Math.abs(c.vy)*.22;c.vx*=.85;c.vz*=.85;}c.m.position.set(c.x,c.y,position-c.s);if(c.y>.23){c.m.rotation.x+=dt*(c.seed%3+1);c.m.rotation.z+=dt*2;}c.m.visible=Math.abs(c.m.position.z)<180;}
 }
}
