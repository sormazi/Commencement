// Wilf Hall and the Provincetown Playhouse. 139 MacDougal St, 2011 (Morris Adjmi), with the Provincetown Playhouse front
// at 133 MacDougal. Google Street View (looked at, not saved), Apr 2024: red brick with large rectangular windows in a
// regular grid and violet flags; to the south the Playhouse front, cream-painted brick, three storeys, double glass
// doors between two porthole windows.
export default {slug:"wilf",name:"Wilf Hall and the Provincetown Playhouse",bin:1008760,also:[],source:"139 MacDougal St, 2011 (Morris Adjmi), with the Provincetown Playhouse front at 133 MacDougal. Google Street View (looked at, not saved), Apr 2024: red brick with large rectangular windows in a regular grid and violet flags; to the south the Playhouse front, cream-painted brick, three storeys, double glass doors between two porthole windows.",wall:'brickRed',trim:'brickRed',ground:{h:4.2,style:'base',mat:'brickRed',win:[1.6,2.4],pitch:3.4},floor:3.6,pitch:3.4,win:[1.6,2.2],cornice:'coping',doors:[{rank:0,at:.6,w:2.2,h:3}],flags:{rank:0,n:2,y:6},signs:{sign_provincetown:{text:['PROVINCETOWN PLAYHOUSE'],opt:{bg:'#e6e0d2',ink:'#2b2b2b',h:96}}},
 extra:K=>{const w=K.ranked[0];if(!w)return;const f=w.face,P=K.P,u1=Math.min(7.5,w.len*.3);
  // Provincetown Playhouse front: cream paint over the brick, porthole windows, double doors, name board.
  P.block('brickPainted',f,0,u1,0,11.2,0,.08,{skip:['bottom']});const c=u1/2;
  for(const s of [-1,1]){const cx=c+s*1.9;for(let k=0;k<12;k++){const a=k/12*Math.PI*2,b=(k+1)/12*Math.PI*2;P.quad('frame',f.at(cx+Math.cos(a)*.45,1.9+Math.sin(a)*.45,.1),f.at(cx+Math.cos(b)*.45,1.9+Math.sin(b)*.45,.1),f.at(cx,1.9,.1),f.at(cx,1.9,.1),f.n);}}
  P.rect('glassClear',f,c-1.0,c+1.0,0,2.7,.1);P.block('frame',f,c-1.1,c+1.1,2.7,2.85,.08,.16);P.panel('sign_provincetown',f,c-2.6,c+2.6,3.1,3.7,.12);
  K.doors.push({bin:K.spec.bin,name:'Provincetown Playhouse',label:'Provincetown Playhouse',pos:f.at(c,1.35,.2),normal:f.n,w:2,h:2.7,dir:w.dir});}};
