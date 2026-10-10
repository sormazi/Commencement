// University Pl (Washington Sq N to 13th St) and W 8th St (Fifth to Sixth Ave), first pass (Step 4B, Tier B).
// Google Street View, Apr 2026 and Sep 2024 captures (looked at only, not saved). Plain lettering, no logos.
export const UNIV8TH=[
 {bin:1009223,street:'^University Pl',addr:'20 University Pl',seen:'Google Street View, University Pl at E 8th St, Apr 2026',shops:[
  {id:'univ-20-vacant',name:'(vacant retail space, leasing banners in the windows)',frac:[0,.5],frame:'#3c3c3c',bulkhead:.3,door:{at:.75,w:1.2}},
  {id:'chase-university',name:'Chase bank',frac:[.74,1],frame:'#d9d9d6',bulkheadStone:true,sign:{lines:['CHASE'],bg:'#f3f3f1',fg:'#1a5fa8',font:'sans-bold'},door:{at:.3,w:1.4}}]},
 {bin:1009263,street:'^University Pl',addr:'70 University Pl',seen:'Google Street View, University Pl at E 11th St, Sep 2024',shops:[{id:'reservoir-bar',name:'Reservoir',frame:'#2a2523',sign:{lines:['RESERVOIR'],bg:'#1d1b1a',fg:'#d23a2e',font:'sans-bold'},shed:{color:'#2a2a2a',roof:'#2a2a2a',from:0,to:1,d0:4.2,d1:6.4},door:{at:.5,w:1.0}}]},
 {bin:1009438,street:'^W 8 St',addr:'19 W 8th St',seen:'Google Street View, W 8th St, Sep 2024',shops:[{id:'vitsoe',name:'Vitsoe',frame:'#2b2b2b',sign:{lines:['VITSOE'],bg:'#262626',fg:'#f2f2f0',font:'sans'},door:{at:.3,w:1.0}}]},
 {bin:1009441,street:'^W 8 St',addr:'29 W 8th St',seen:'Google Street View, W 8th St, Sep 2024',shops:[{id:'atelier-new-york',name:'Atelier New York',frame:'#1e1e1e',sign:{lines:['ATELIER NEW YORK'],bg:'#1c1c1c',fg:'#f2f2f0',font:'serif'},door:{at:.4,w:1.0}}]},
 // Second pass (10 Oct, Street View Apr 2026): the University Pl front of 30 E 9th St, E 9th St to E 8th St
 // (left to right runs north to south). Positions estimated from the viewpoints to about two metres.
 {bin:1009090,street:'^University Pl',addr:'30 E 9th St (University Pl front)',seen:'Google Street View, University Pl between E 8th and E 9th St, Apr 2026',shops:[
  {id:'univ-e9-corner-restaurant',name:'(restaurant at the E 9th St corner, maroon awning; name not legible on the imagery)',frac:[0,.14],frame:'#8a1f22',awning:{type:'slope',color:'#7a1c22',depth:1.2},door:{at:.6,w:1.0}},
  {id:'univ-30-boutique',name:'(clothing boutique, mannequins in the window, no sign)',frac:[.25,.36],frame:'#2a2a2a',door:{at:.1,w:1.0}},
  {id:'univ-30-shop',name:'(shop, plain glass front, no sign legible)',frac:[.36,.5],frame:'#2a2a2a',door:{at:.85,w:1.0}},
  {id:'univ-30-vacant',name:'(empty shop, blue University Village leasing banner)',frac:[.62,.7],frame:'#3a3a3a',boarded:'#1f3f9a',bulkhead:.4},
  {id:'univ-30-corner-vacant',name:'(corner retail space for lease, blue panels)',frac:[.8,1],frame:'#3a3a3a',boarded:'#1f3f9a',bulkhead:.4}]},
];
