// University Pl (Washington Sq N to 13th St) and W 8th St (Fifth to Sixth Ave), first pass (Step 4B, Tier B).
// Google Street View, Apr 2026 and Sep 2024 captures (looked at only, not saved). Plain lettering, no logos.
export const UNIV8TH=[
 {bin:1009223,street:'^University Pl',addr:'20 University Pl',seen:'Google Street View, University Pl at E 8th St, Apr 2026',shops:[
  {id:'univ-20-vacant',name:'(vacant retail space, leasing banners in the windows)',frac:[0,.5],frame:'#3c3c3c',bulkhead:.3,door:{at:.75,w:1.2}},
  {id:'chase-university',name:'Chase bank',frac:[.74,1],frame:'#d9d9d6',bulkheadStone:true,sign:{lines:['CHASE'],bg:'#f3f3f1',fg:'#1a5fa8',font:'sans-bold'},door:{at:.3,w:1.4}}]},
 {bin:1009263,street:'^University Pl',addr:'70 University Pl',seen:'Google Street View, University Pl at E 11th St, Sep 2024',shops:[{id:'reservoir-bar',name:'Reservoir',frame:'#2a2523',sign:{lines:['RESERVOIR'],bg:'#1d1b1a',fg:'#d23a2e',font:'sans-bold'},shed:{color:'#2a2a2a',roof:'#2a2a2a',from:0,to:1,d0:4.2,d1:6.4},door:{at:.5,w:1.0}}]},
 {bin:1009438,street:'^W 8 St',addr:'19 W 8th St',seen:'Google Street View, W 8th St, Sep 2024',shops:[{id:'vitsoe',name:'Vitsoe',frame:'#2b2b2b',sign:{lines:['VITSOE'],bg:'#262626',fg:'#f2f2f0',font:'sans'},door:{at:.3,w:1.0}}]},
 {bin:1009441,street:'^W 8 St',addr:'29 W 8th St',seen:'Google Street View, W 8th St, Sep 2024',shops:[{id:'atelier-new-york',name:'Atelier New York',frame:'#1e1e1e',sign:{lines:['ATELIER NEW YORK'],bg:'#1c1c1c',fg:'#f2f2f0',font:'serif'},door:{at:.4,w:1.0}}]},
];
