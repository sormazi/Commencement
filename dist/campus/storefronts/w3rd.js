// W 3rd St between MacDougal St and Sixth Ave (Step 4B, Tier B), first pass. Google Street View, Apr 2026
// captures (looked at only, not saved). Names as signed, plain lettering, no logos.
const S='^W 3 St',seen='Google Street View, W 3rd St west of MacDougal, Apr 2026 capture';
export const W3RD=[
 // North side, west to east.
 {bin:1008767,street:S,addr:'125-129 W 3rd St',seen,shops:[
  {id:'brickmans-ace',name:'Brickmans 3rd St. ACE (ACE Hardware)',frac:[0,.58],frame:'#2b3f8a',sign:{lines:['ACE Hardware','Brickmans 3rd St. ACE'],bg:'#c8202b',fg:'#f4f2ee',font:'sans-bold'},door:{at:.6,w:1.2}},
  {id:'benjamin-moore-w3rd',name:'Benjamin Moore paint store',frac:[.62,1],frame:'#2a2726',shutter:true,sign:{lines:['Benjamin Moore'],bg:'#c8202b',fg:'#f4f2ee',font:'sans-bold'},door:{at:.15,w:1.0}}]},
 {bin:1008768,street:S,addr:'131 W 3rd St',seen,shops:[{id:'blue-note',name:'Blue Note',frame:'#141414',awning:{type:'barrel',color:'#a8adb2',depth:1.6},sign:{lines:['Blue Note'],bg:'#151515',fg:'#c9a54e',font:'serif-bold',mount:'awning'},door:{at:.15,w:1.1}}]},
 // South side.
 {bin:1008741,street:S,addr:'134 W 3rd St',seen,shops:[{id:'3-sheets',name:'3 Sheets',frame:'#3b3a38',sign:{lines:['3 SHEETS'],bg:'#1f2a44',fg:'#dfe6f2',font:'slab'},door:{at:.85,w:1.0}}]},
];
