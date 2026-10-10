// W 4th St between MacDougal St and Sixth Ave (Step 4B, Tier B), first pass. Mostly row houses and
// apartments; the few shopfronts, from Google Street View, Apr 2026 (looked at only, not saved).
const S='^W 4 St',seen='Google Street View, W 4th St west of the park, Apr 2026 capture';
export const W4TH=[
 {bin:1008755,street:S,addr:'140 W 4th St',seen,shops:[{id:'w4th-140',name:'(shop with a striped awning, name not fully legible)',frac:[0,.7],frame:'#2b2724',awning:{type:'slope',color:'#3f7a3a',depth:.9},door:{at:.5,w:1.0}}]},
 {bin:1008883,street:S,addr:'147 W 4th St',seen,shops:[{id:'w4th-147',name:'(vacant restaurant, wood front, paper over the windows)',frame:'#8a5a34',bulkhead:.6,door:{at:.15,w:1.0}}]},
 {bin:1083512,street:S,addr:'149 W 4th St',seen,shops:[{id:'w4th-149',name:'(restaurant with a blue awning, name too small to read)',frac:[.1,.8],frame:'#2a2726',awning:{type:'slope',color:'#1f3f8a',depth:1.1},door:{at:.7,w:1.0}}]},
];
