// Broadway from Houston St to E 9th St (Step 4B, Tier B), first pass. Google Street View, Apr 2026 captures
// (looked at only, not saved). Much of the east side was behind scaffolding or parked trucks; gaps are listed
// in RESEARCH/storefronts/broadway.md. Names as signed, plain lettering, no logos.
const S='^Broadway',seen='Google Street View, Broadway, Apr 2026 capture';
export const BROADWAY=[
 // West side, south to north.
 {bin:1008239,street:S,addr:'623 Broadway',seen,shops:[{id:'chipotle-broadway',name:'Chipotle Mexican Grill',frame:'#1d1b1a',sign:{lines:['CHIPOTLE'],bg:'#1b1a19',fg:'#c8352b',font:'sans-bold'},door:{at:.5,w:1.2}}]},
 {bin:1008237,street:S,addr:'627 Broadway',seen,shops:[{id:'casper-broadway',name:'Casper',frame:'#e6e3dc',bulkheadStone:true,sign:{lines:['Casper'],bg:'#eeece6',fg:'#1f2d4d',font:'sans'},door:{at:.3,w:1.4}}]},
 {bin:1008622,street:S,addr:'643 Broadway',seen,shops:[{id:'hans-deli',name:'Han\'s Deli Grocery',frame:'#2e6b3a',awning:{type:'slope',color:'#2f7a40',depth:1.1},sign:{lines:['HAN\'S DELI GROCERY'],bg:'#2f7a40',fg:'#f4f2ee',font:'sans-bold',mount:'awning'},door:{at:.7,w:1.0}}]},
 {bin:1008621,street:S,addr:'645 Broadway',seen,shops:[{id:'broadway-645',name:'(vacant, shutter down, for rent)',frame:'#3a3633',shutter:true,awning:{type:'slope',color:'#8a6d55',depth:.9},door:{at:.5,w:1.2}}]},
 {bin:1008620,street:S,addr:'647 Broadway',seen,shops:[{id:'gregorys-coffee-broadway',name:'Gregorys Coffee',frame:'#1c1c1c',awning:{type:'slope',color:'#1c1c1c',depth:1.0},sign:{lines:['GREGORYS COFFEE'],bg:'#1c1c1c',fg:'#f2efe6',font:'sans-bold',mount:'awning'},door:{at:.4,w:1.0}}]},
 // East side.
 {bin:1008418,street:S,addr:'644 Broadway',seen,shops:[{id:'kith-broadway',name:'Kith',frame:'#2a2a2a',bulkheadStone:true,sign:{lines:['Kith'],bg:'#1f2226',fg:'#f4f2ee',font:'serif'},door:{at:.5,w:1.6}}]},
 {bin:1008800,street:S,addr:'738 Broadway',seen,shops:[{id:'t-mobile-broadway',name:'T-Mobile',frame:'#e8e5df',sign:{lines:['T-Mobile'],bg:'#e20074',fg:'#ffffff',font:'sans-bold'},door:{at:.5,w:1.2}}]},
];
