// Bleecker St between LaGuardia Pl and Sullivan St (Step 4B, Tier B). Observed on Google Street View
// (capture dates per record; looked at only, not saved). Names as signed, plain lettering, no logos.
const B='bleecker';
export const BLEECKER=[
 // South side, east to west.
 {bin:1008267,street:B,addr:'144 Bleecker St',seen:'Google Street View, Bleecker St at LaGuardia Pl, Sep 2024',shops:[
  {id:'nyu-pen-stationery',name:'New University Pen & Stationery Inc',frac:[0,.48],frame:'#2d3f8f',sign:{lines:['NEW UNIVERSITY PEN','& STATIONERY INC.'],bg:'#2b3c8c',fg:'#f2efe6',font:'sans-bold'},door:{at:.5,w:1.0}},
  {id:'smacked',name:'Smacked',frac:[.48,1],frame:'#e9e6df',bulkheadStone:true,sign:{lines:['SMACKED'],bg:'#f1efe9',fg:'#1c1b1a',font:'serif-bold'},door:{at:.3,w:1.2}}]},
 {bin:1083503,street:B,addr:'156 Bleecker St (Mill House)',seen:'Google Street View, Bleecker St between Thompson and Sullivan, Sep 2024',shops:[
  {id:'cvs-bleecker',name:'CVS Pharmacy',frac:[0,.34],frame:'#2a2726',awning:{type:'flat',color:'#c8202b',depth:1.0},sign:{lines:['CVS/pharmacy'],bg:'#ece5d6',fg:'#b01e2a',font:'serif-bold'},door:{at:.12,w:1.6}},
  {id:'cookie-dough-bleecker',name:'Cookie Dough',frac:[.6,.68],frame:'#33383d',awning:{type:'slope',color:'#1e2124',depth:.9},sign:{lines:['Cookie Dough'],bg:'#1e2124',fg:'#f2efe6',font:'serif',mount:'awning'},door:{at:.5,w:1.4}},
  {id:'mill-house-vacant',name:'(vacant, retail for lease)',frac:[.68,.78],frame:'#33383d',door:{at:.5,w:1.4}}]},
 {bin:1077804,street:B,addr:'172 Bleecker St',seen:'Google Street View, Bleecker St at Sullivan St, Sep 2024',shops:[{id:'cafe-espanol',name:'Cafe Español',frame:'#5a1e22',awning:{type:'slope',color:'#6b1f26',depth:1.1},sign:{lines:['CAFE ESPAÑOL','Authentic Spanish Restaurant'],bg:'#6b1f26',fg:'#f2efe6',font:'serif',mount:'awning'},door:{at:.75,w:1.0}}]},
 {bin:1008323,street:B,addr:'174 Bleecker St',seen:'Google Street View, Bleecker St at Sullivan St, Sep 2024',shops:[{id:'old-tbilisi-garden',name:'Old Tbilisi Garden',frame:'#1d1c1b',awning:{type:'slope',color:'#1c1c1c',depth:1.2},sign:{lines:['OLD TBILISI GARDEN','AUTHENTIC GEORGIAN CUISINE'],bg:'#1c1c1c',fg:'#d8b45a',font:'serif-bold',mount:'awning'},door:{at:.2,w:1.0}}]},
 // North side.
 {bin:1008648,street:B,addr:'147 Bleecker St',seen:'Google Street View, Bleecker St at LaGuardia Pl, Apr 2026',shops:[{id:'bitter-end',name:'The Bitter End',frame:'#6b4a2e',awning:{type:'barrel',color:'#1f4d9a',depth:1.0},sign:{lines:['Paul Colby\'s','THE BITTER END'],bg:'#1f4d9a',fg:'#f4f2ee',font:'sans-bold',mount:'awning'},door:{at:.55,w:1.1}}]},
];
