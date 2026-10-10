// Astor Place (Broadway to Lafayette St), both sides, and the Lafayette and Broadway fronts of 770 Broadway
// (Wegmans), second pass of Step 4B. Google Street View, Apr 2026 captures (looked at only, not saved).
// Plain lettering, no logos: each business's logo is an empty slot in the signage manifest.
const SV='Google Street View, Astor Pl and Lafayette St, Apr 2026';
export const ASTOR=[
 // North side, Broadway to Lafayette. 752 Broadway: the brick corner building (residential entrance lettered
 // ASTOR PLACE, no shop on this front) and the dark terracotta building with Pret.
 {bin:1008806,street:'^Astor Pl',addr:'752 Broadway / 4 Astor Pl',seen:SV,shops:[
  {id:'pret-astor',name:'Pret A Manger',frac:[.42,.95],h:3.9,frame:'#4a3f33',awning:{type:'flat',color:'#4b4d4f',depth:1.3},
   sign:{lines:['Freshly prepared  ★  Astor Place'],bg:'#4b4d4f',fg:'#f2f2f0',font:'serif',mount:'awning'},door:{at:.62,w:1.6},bulkhead:.35}]},
 // Clinton Hall: its own arched entrance at the west end, Dash Mart behind white-papered windows under red
 // striped bands, and the one-storey glass pavilion at the Lafayette end, empty and boarded.
 {bin:1008807,street:'^Astor Pl',addr:'21 Astor Pl (Clinton Hall)',seen:SV,shops:[
  {id:'dash-mart-astor',name:'DashMart',frac:[.13,.62],frame:'#3a3a3a',mullions:3,boarded:'#e9e8e3',
   sign:{lines:['DASH MART'],bg:'#c8322f',fg:'#f6f1ea',font:'sans-bold'},door:{at:.12,w:1.6}},
  {id:'clinton-hall-pavilion',name:'(empty glass pavilion, boarded)',frac:[.7,1],frame:'#5d6261',boarded:true,bulkhead:.25}]},
 // South side, Lafayette to Broadway (left to right as seen from the street). 740 Broadway: Raising Cane's
 // at the Lafayette corner with a red corner awning, an empty glass shop, the office lobby, then Juice
 // Generation and TMPL Fitness at the Broadway corner.
 {bin:1080094,street:'^Astor Pl',addr:'740 Broadway (Astor Pl front)',seen:SV,shops:[
  {id:'raising-canes-astor',name:"Raising Cane's",frac:[0,.32],h:4.2,frame:'#d8d2c4',bulkheadStone:true,awning:{type:'slope',color:'#c8102e',depth:1.1},
   sign:{lines:["RAISING CANE'S"],bg:'#c8102e',fg:'#ffffff',font:'sans-bold'},door:{at:.5,w:1.2}},
  {id:'astor-740-vacant',name:'(empty shop, bare glass)',frac:[.36,.72],h:4.2,frame:'#d8d2c4',bulkheadStone:true,door:{at:.5,w:1.2}}]},
 {bin:1080092,street:'^Astor Pl',addr:'740 Broadway (Broadway corner)',seen:SV,shops:[
  {id:'juice-generation-astor',name:'Juice Generation',frac:[.08,.48],frame:'#1c1c1c',sign:{lines:['juice GENERATION'],bg:'#1c1c1c',fg:'#f2f2f0',font:'serif'},door:{at:.5,w:1.0}},
  {id:'tmpl-astor',name:'TMPL Fitness',frac:[.5,1],frame:'#1c1c1c',sign:{lines:['TMPL FITNESS'],bg:'#1c1c1c',fg:'#d9b44a',font:'condensed'},door:{at:.4,w:1.4}}]},
 // 770 Broadway, the old Wanamaker Annex. Lafayette front (left = south): Wegmans along the whole front,
 // dark green framed glazing under the arches, gold lettering over the glass, and a green entrance
 // vestibule with gold trim. The sign is plain italic lettering; the Wegmans wordmark is a logo slot.
 {bin:1008952,street:'^Lafayette',addr:'770 Broadway (Lafayette St front)',seen:SV,shops:[
  {id:'wegmans-astor',name:'Wegmans',frac:[0,1],h:4.7,band:.35,frame:'#1f3a30',mullions:14,bulkhead:.45,
   sign:{lines:['Wegmans'],bg:'rgba(0,0,0,0)',fg:'#c9a24a',font:'script',size:[4.2,1.0],y:4.8},
   vestibule:{from:.56,to:.7,depth:2.2,h:3.0,color:'#1f3a30',trim:'#c9a24a'},door:{at:.63,w:2.0}}]},
 // Broadway front (left = north): the 770 Broadway lobby under a purple name panel, NYU's science building
 // windows, and Bank of America at the south end in dark teal frames.
 {bin:1008952,street:'^Broadway',addr:'770 Broadway (Broadway front)',seen:'Google Street View, Broadway at E 9th St, Apr 2026',shops:[
  {id:'lobby-770-broadway',name:'770 Broadway (office lobby)',logo:false,frac:[.06,.2],h:4.4,frame:'#5a2a24',sign:{lines:['770 BROADWAY'],bg:'#57068c',fg:'#ffffff',font:'sans-bold'},door:{at:.5,w:2.0}},
  {id:'nyu-770-windows',name:'NYU 770 Broadway (purple window graphics)',logo:false,frac:[.22,.6],h:4.4,frame:'#5a2a24',boarded:'#4b0a78',bulkhead:.6},
  {id:'boa-770-broadway',name:'Bank of America',frac:[.62,1],h:4.6,frame:'#1f3a3a',bulkhead:.4,sign:{lines:['BANK OF AMERICA'],bg:'#f2f2f2',fg:'#012169',font:'sans-bold'},door:{at:.3,w:1.6}}]},
];
