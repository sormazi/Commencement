// E 8th St, University Pl to Mercer St, both sides, second pass of Step 4B. Google Street View, Apr 2026
// captures (looked at only, not saved). Positions along each front are estimated from the viewpoints, to
// about two metres. Plain lettering, no logos.
const SV='Google Street View, E 8th St between University Pl and Mercer St, Apr 2026';
export const E8TH=[
 // South side, 50 E 8th St (the brick apartment block from Greene St to Mercer St). Left to right as seen
 // from the street runs east to west: LaoMa Spicy at the Mercer corner, a planted court in front of the
 // apartments, the orange-awning shop, Rokstar Chicken, Mr. Bubbly, the nail salon, the apartment lobby,
 // Choji and Heavenly Market & Cafe at the Greene corner.
 {bin:1008837,street:'^E 8 St',addr:'50 E 8th St',seen:SV,shops:[
  {id:'laoma-spicy-e8',name:'LaoMa Spicy',frac:[0,.12],frame:'#1a1a1a',sign:{lines:['LaoMa Spicy'],bg:'#1a1a1a',fg:'#f2f2f0',font:'script'},door:{at:.7,w:1.0}},
  {id:'e8-orange-awning',name:'(orange awning, name not legible on the imagery)',frac:[.32,.42],frame:'#2a2a2a',awning:{type:'slope',color:'#e8662a',depth:1.0},door:{at:.3,w:1.0}},
  {id:'rokstar-chicken-e8',name:'Rokstar Chicken',frac:[.42,.5],frame:'#c8263a',sign:{lines:['ROKSTAR CHICKEN'],bg:'#d22f3f',fg:'#ffffff',font:'condensed'},door:{at:.3,w:1.0}},
  {id:'mr-bubbly-e8',name:'Mr. Bubbly (closed, retail space for lease)',frac:[.5,.58],frame:'#1c1c1c',awning:{type:'flat',color:'#1c1c1c',depth:.8},sign:{lines:['MR. BUBBLY'],bg:'#f4f4f2',fg:'#2a6fb0',font:'sans-bold'},door:{at:.2,w:1.0}},
  {id:'nails-e8',name:'Nail salon (blue awning)',frac:[.58,.66],frame:'#2a2a2a',awning:{type:'slope',color:'#2d3f9a',depth:1.0},sign:{lines:['NAILS'],bg:'#f4f4f2',fg:'#2a2a2a',font:'sans-bold'},door:{at:.7,w:1.0}},
  {id:'choji-e8',name:'Choji',frac:[.74,.86],frame:'#1a1a1a',sign:{lines:['CHOJÍ'],bg:'#1a1a1a',fg:'#f2f2f0',font:'sans-bold'},door:{at:.3,w:1.0}},
  {id:'heavenly-market-e8',name:'Heavenly Market & Cafe',frac:[.87,1],frame:'#1f3a2a',awning:{type:'flat',color:'#1f3a2a',depth:.7},sign:{lines:['Heavenly Market & Café'],bg:'#1f3a2a',fg:'#9fd04a',font:'serif-bold'},door:{at:.15,w:1.0}}]},
 // North side, the University Village era apartment blocks whose addresses are on E 9th St. Left to right
 // runs west to east.
 {bin:1009090,street:'^E 8 St',addr:'30 E 9th St (E 8th St front)',seen:SV,shops:[
  {id:'subway-e8',name:'Subway',frac:[.79,.9],frame:'#2a2a2a',sign:{lines:['SUBWAY'],bg:'#2a2a2a',fg:'#f6c400',font:'sans-bold'},door:{at:.5,w:1.0}},
  {id:'e8-coffee',name:'(coffee shop, sign partly hidden by a tree)',frac:[.9,1],frame:'#2a2a2a',sign:{lines:['COFFEE'],bg:'#3a3a3a',fg:'#f2f2f0',font:'sans-bold'},door:{at:.5,w:1.0}}]},
 {bin:1009091,street:'^E 8 St',addr:'40 E 9th St (E 8th St front)',seen:SV,shops:[
  {id:'urgent-care-e8',name:'Urgent care clinic (red sign)',frac:[0,.2],frame:'#3a3a3a',sign:{lines:['URGENT CARE'],bg:'#c8202a',fg:'#ffffff',font:'sans-bold'},door:{at:.5,w:1.0}},
  {id:'e8-40-vacant-a',name:'(retail space for lease, blue banner)',frac:[.25,.48],frame:'#5a4a3e',boarded:'#1f3f9a',bulkhead:.4},
  {id:'e8-40-vacant-b',name:'(empty shop, tinted glass)',frac:[.48,.64],frame:'#5a4a3e',bulkhead:.4},
  {id:'e8-tea-shop',name:'(tea shop, green sign)',frac:[.64,.77],frame:'#2a2a2a',sign:{lines:['TEA'],bg:'#1f7a4a',fg:'#f2f2f0',font:'sans-bold'},door:{at:.4,w:1.0}},
  {id:'just-salad-e8',name:'Just Salad',frac:[.78,1],frame:'#4a3a30',sign:{lines:['just salad'],bg:'#4a3a30',fg:'#e8e4da',font:'sans'},door:{at:.85,w:1.0}}]},
 {bin:1009092,street:'^E 8 St',addr:'60 E 9th St (E 8th St front)',seen:SV,shops:[
  {id:'e8-60-vacant',name:'(retail space for lease, blue panels)',frac:[.2,.33],frame:'#3a3a3a',boarded:'#1f3f9a',bulkhead:.3},
  {id:'brooklyn-bagel-e8',name:'Brooklyn Bagel & Coffee Company',frac:[.36,.53],frame:'#2a2a2a',sign:{lines:['BROOKLYN BAGEL & COFFEE COMPANY'],bg:'#f2efe8',fg:'#1f7a3a',font:'condensed'},door:{at:.4,w:1.0}}]},
];
