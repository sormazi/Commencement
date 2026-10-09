// Founders Hall and the St. Ann's facade. Status: observed. 120 E 12th St, 2006 (Perkins Eastman), 26 storeys, built
// behind the retained 1847 facade of St. Ann's Church. User panorama 2017 on Google Maps: dark brownstone Gothic front
// with a pointed-arch doorway and lancets, a square tower, and a black iron fence with an arched gate. The facade's
// distance in front of the hall is an estimate. Counted on Street View: n 6 bays (E 12th, Apr 2026: tan-grey brick tower
// with dark window strips, a glass box over the lower storeys at the front, St. Ann's dark stone front), 26 storeys.
// Wall material corrected to buff/grey brick.
import {Face} from '../../landmarks/kit.js?v=24';
export default {slug:"founders",name:"Founders Hall and the St. Ann's facade",status:"observed",bin:1087924,also:[],source:"120 E 12th St, 2006 (Perkins Eastman), 26 storeys, built behind the retained 1847 facade of St. Ann's Church. User panorama 2017 on Google Maps: dark brownstone Gothic front with a pointed-arch doorway and lancets, a square tower, and a black iron fence with an arched gate. The facade's distance in front of the hall is an estimate. Counted on Street View: n 6 bays (E 12th, Apr 2026: tan-grey brick tower with dark window strips, a glass box over the lower storeys at the front, St. Ann's dark stone front), 26 storeys. Wall material corrected to buff/grey brick.",wall:'brickBuff',bays:{n:6},storeys:26,trim:'precast',ground:{h:4.6,style:'glass',pitch:2.4},floor:2.9,pitch:3.0,win:[1.2,1.5],cornice:'band',doors:[{rank:0,at:.5,w:2.4,h:3}],flags:{rank:0,n:2,y:5},
 extra:K=>{const w=K.ranked[0];if(!w)return;const f0=w.face,P=K.P,c=w.len/2,set=9;// St. Ann's front stands free in the courtyard, `set` m in front of the hall.
  const f=f0.offset(set);const W=13,H=11,G=5.5,hole=[];for(let k=0;k<=10;k++){const t=Math.PI*k/10;hole.push([c+Math.cos(t)*1.4,3.4+Math.sin(t)*1.6]);}hole.unshift([c+1.4,0],[c+1.4,3.4]);hole.push([c-1.4,3.4],[c-1.4,0]);
  const outline=[[c-W/2,0],[c+W/2,0],[c+W/2,H],[c,H+G],[c-W/2,H]];P.poly('brownstone',f,outline,[hole.slice().reverse()],0);P.poly('brownstone',new Face(f.at(0,0,-.8),f.u.map(x=>-x),f.v),outline.map(([u,v])=>[-u,v]),[],0);
  P.block('brownstone',f,c-W/2,c-W/2+.8,0,H,-.8,0);P.block('brownstone',f,c+W/2-.8,c+W/2,0,H,-.8,0);P.rect('iron',f,c-1.4,c+1.4,0,3.4,-.6);
  for(const s of [-1,1]){const lc=c+s*3.6,lh=[];for(let k=0;k<=8;k++){const t=Math.PI*k/8;lh.push([lc+Math.cos(t)*.55,5.2+Math.sin(t)*.7]);}lh.unshift([lc+.55,2.4]);lh.push([lc-.55,2.4]);P.poly('glass',f,lh,[],-.3);P.block('brownstone',f,lc-.7,lc+.7,2.2,2.4,0,.15);}
  // Square tower to one side, a little taller.
  P.block('brownstone',f,c+W/2,c+W/2+4.2,0,H+7,-4.2,0,{skip:['bottom']});
  // Iron fence along the street with an arched gate.
  const fz=f0.offset(set+4);for(let u=c-W/2-4;u<=c+W/2+4;u+=.35){if(Math.abs(u-c)<1.3)continue;P.block('iron',fz,u-.02,u+.02,0,2.0,0,.04);}P.block('iron',fz,c-W/2-4,c+W/2+4,1.85,1.95,0,.05);P.block('iron',fz,c-W/2-4,c+W/2+4,.25,.32,0,.05);
  for(let k=0;k<12;k++){const a=Math.PI*k/12,b=Math.PI*(k+1)/12;P.quad('iron',fz.at(c+Math.cos(a)*1.3,2.0+Math.sin(a)*1.1,0),fz.at(c+Math.cos(b)*1.3,2.0+Math.sin(b)*1.1,0),fz.at(c+Math.cos(b)*1.2,2.0+Math.sin(b)*1.0,0),fz.at(c+Math.cos(a)*1.2,2.0+Math.sin(a)*1.0,0),fz.n);}
  K.doors.push({bin:K.spec.bin,name:"St. Ann's facade",label:"St. Ann's gate",pos:fz.at(c,1.0,.1),normal:fz.n,w:2.4,h:2.0,dir:w.dir});}};
