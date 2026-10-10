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
 // Second pass (10 Oct): 40 University Pl, west side, E 9th to E 10th St (left to right runs south to north).
 // Only Sep 2024 imagery north of E 9th St: older imagery, a business may have changed. A row of arched
 // shop bays with matching dark fascias; positions estimated from one viewpoint, to about three metres.
 {bin:1009238,street:'^University Pl',addr:'40 University Pl',seen:'Google Street View, University Pl at E 10th St, Sep 2024 (older imagery; a business may have changed)',shops:[
  {id:'univ-40-restaurant',name:'(restaurant, dark fascia; name not legible on the imagery)',frac:[.1,.22],frame:'#1f1f1f',door:{at:.5,w:1.0}},
  {id:'univ-40-shuttered-a',name:'(shop with the grille down)',frac:[.22,.34],frame:'#1f1f1f',shutter:true},
  {id:'univ-40-shuttered-b',name:'(shop with the grille down)',frac:[.34,.46],frame:'#1f1f1f',shutter:true},
  {id:'naturale-cleaners',name:'Naturale Cleaners',frac:[.46,.58],frame:'#1f1f1f',sign:{lines:['NATURALE CLEANERS'],bg:'#1f1f1f',fg:'#f2f2f0',font:'sans'},door:{at:.3,w:1.0}},
  {id:'whitney-chemists',name:'Whitney Chemists',frac:[.58,.72],frame:'#1f1f1f',sign:{lines:['WHITNEY CHEMISTS'],bg:'#1f1f1f',fg:'#f2f2f0',font:'sans'},door:{at:.5,w:1.0}},
  {id:'univ-40-sustainable',name:'(shop signed SUSTAINABLE..., the rest hidden by a lattice dining shed)',frac:[.74,.9],frame:'#1f1f1f',sign:{lines:['SUSTAINABLE'],bg:'#1f1f1f',fg:'#f2f2f0',font:'sans'},shed:{color:'#c8a26a',roof:'#8a8a8a',from:0,to:1.1,d0:3.6,d1:6.0},door:{at:.5,w:1.0}}]},
 // 41 University Pl, east side at E 9th St: Epicurean Market, behind sidewalk scaffolding in Sep 2024
 // (older imagery; a business may have changed). The scaffolding is not modelled.
 {bin:1009093,street:'^University Pl',addr:'41 University Pl',seen:'Google Street View, University Pl at E 9th St, Sep 2024 (older imagery; a business may have changed); name from a 2018 photo sphere inside',shops:[
  {id:'epicurean-market',name:'Epicurean Market',frame:'#1f2a24',sign:{lines:['EPICUREAN MARKET'],bg:'#1f2a24',fg:'#f2efe6',font:'serif'},door:{at:.3,w:1.0}}]},
 // Second pass (10 Oct): W 8th St between Fifth and Sixth Ave, both sides. Sep 2024 imagery only (older
 // imagery; a business may have changed). Lots are about 7.5 m wide; each shop is placed on the lot its
 // viewpoint faced.
 {bin:1009437,street:'^W 8 St',addr:'17 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'analogue-w8',name:'Analogue (bar)',frame:'#3a2a24',awning:{type:'slope',color:'#151515',depth:1.1},sign:{lines:['Analogue'],bg:'#151515',fg:'#c9a24a',font:'script',mount:'awning'},bulkhead:.7,door:{at:.85,w:1.0}}]},
 {bin:1009441,street:'^W 8 St',addr:'31 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'w8-31-arepas',name:'Arepa restaurant (window lettering reads Classic Arepa; behind scaffolding)',frac:[0,.6],frame:'#d9d2c4',door:{at:.8,w:1.0}}]},
 {bin:1009444,street:'^W 8 St',addr:'35 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'solidcore-w8',name:'[solidcore]',frame:'#1a1a1a',sign:{lines:['[solidcore]'],bg:'#1a1a1a',fg:'#f2f2f0',font:'sans'},door:{at:.8,w:1.0}}]},
 {bin:1077923,street:'^W 8 St',addr:'39 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'w8-39-restaurant',name:'(restaurant with a dark awning and a lattice dining shed; name not legible)',frame:'#2a2a2a',awning:{type:'flat',color:'#2a2a2a',depth:.9},shed:{color:'#c8a26a',roof:'#6a6a6a',from:0,to:1,d0:3.6,d1:6.0},door:{at:.5,w:1.0}}]},
 {bin:1009446,street:'^W 8 St',addr:'43 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'w8-43-boutique',name:'(boutique in a glass box front, no sign legible)',frame:'#e8e6e0',bulkhead:.3,door:{at:.85,w:1.0}}]},
 {bin:1080138,street:'^W 8 St',addr:'45 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'w8-45-shuttered',name:'(shop with the grille down)',frame:'#3a3a3a',shutter:true}]},
 {bin:1009447,street:'^W 8 St',addr:'49 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'w8-49-shuttered',name:'(shop with the grille down; black fascia lettered NEW YORK, blue awning)',frame:'#1a1a1a',awning:{type:'flat',color:'#3a4aa0',depth:.8},sign:{lines:['NEW YORK'],bg:'#1a1a1a',fg:'#f2f2f0',font:'sans'},shutter:true}]},
 {bin:1009448,street:'^W 8 St',addr:'51 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'renew-w8',name:'Renew (nail salon)',frame:'#8a2a24',sign:{lines:['RENEW'],bg:'#8a2a24',fg:'#f2f2f0',font:'serif'},door:{at:.85,w:1.0}}]},
 // South side (left to right runs east to west).
 {bin:1008859,street:'^W 8 St',addr:'20-22 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'amelie-w8',name:'Amelie (wine bar)',frac:[.7,1],frame:'#3a2a24',awning:{type:'slope',color:'#c8202a',depth:1.3},sign:{lines:['Amélie'],bg:'#c8202a',fg:'#ffffff',font:'script',mount:'awning'},seating:{color:'#c8202a',depth:1.6,from:0,to:1,tables:3},door:{at:.5,w:1.0}}]},
 {bin:1008858,street:'^W 8 St',addr:'24 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'paragon-security-w8',name:'Paragon Security (locksmith)',frame:'#1a1a1a',sign:{lines:['PARAGON SECURITY'],bg:'#1a1a1a',fg:'#f2f2f0',font:'sans-bold'},door:{at:.7,w:1.0}}]},
 {bin:1077822,street:'^W 8 St',addr:'48 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'w8-48-shuttered',name:'(shop with the grille down)',frame:'#d8d2c4',shutter:true}]},
 {bin:1077889,street:'^W 8 St',addr:'48 W 8th St (west)',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'w8-48-restaurant',name:'(restaurant in a dark wood front; name not legible)',frame:'#2a2420',door:{at:.4,w:1.0}}]},
 {bin:1077275,street:'^W 8 St',addr:'58 W 8th St',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'pane-pasta-w8',name:'Pane Pasta (Sicilian restaurant)',frame:'#e8e4da',awning:{type:'slope',color:'#2f5a3a',depth:1.0},sign:{lines:['Pane Pasta'],bg:'#2f5a3a',fg:'#f2efe6',font:'serif',mount:'awning'},door:{at:.7,w:1.0}}]},
 {bin:1077277,street:'^W 8 St',addr:'58 W 8th St (west)',seen:'Google Street View, W 8th St, Sep 2024 (older imagery; a business may have changed)',shops:[{id:'w8-58-shuttered',name:'(shop with the grille down, an empty glass front beside it)',frame:'#5a4030',shutter:true}]},
];
