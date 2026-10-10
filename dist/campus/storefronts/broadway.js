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
 // T-Mobile corrected in the second pass: it is at 732, magenta lettering on a white fascia.
 {bin:1008797,street:S,addr:'732 Broadway',seen,shops:[{id:'t-mobile-broadway',name:'T-Mobile',frame:'#e8e5df',sign:{lines:['T-Mobile'],bg:'#f4f2ee',fg:'#e20074',font:'sans-bold'},door:{at:.3,w:1.2}}]},
 // Second pass (10 Oct), Apr 2026 captures. East side, south to north; on the east side left to right as seen
 // from the street runs north to south, so frac 0 is the north end of each lot.
 {bin:1008209,street:S,addr:'610 Broadway',seen,shops:[{id:'bway-610-shop',name:'(shoe shop behind black window panels under the cream cast-iron arcade; a Google listing here names Journeys)',frac:[.25,.9],frame:'#1a1a1a',door:{at:.5,w:1.4}}]},
 {bin:1080049,street:S,addr:'622 Broadway',seen,shops:[{id:'bway-622-vacant',name:'(empty shop, green RETAIL SPACE AVAILABLE banner)',frac:[.2,.85],frame:'#3a3e42',bulkhead:.3}]},
 {bin:1008211,street:S,addr:'628 Broadway',seen,shops:[{id:'urban-outfitters-628',name:'Urban Outfitters',frame:'#2a2622',sign:{lines:['URBAN OUTFITTERS'],bg:'#2a2622',fg:'#d6c08a',font:'serif-bold'},door:{at:.5,w:1.6}}]},
 {bin:1008212,street:S,addr:'632 Broadway',seen,shops:[{id:'mount-sinai-632',name:'Mount Sinai Doctors (under a decorative sidewalk shed, not modelled)',frame:'#3a3530',sign:{lines:['Mount Sinai Doctors'],bg:'#f2f2f2',fg:'#221f72',font:'sans'},door:{at:.5,w:1.6}}]},
 {bin:1008213,street:S,addr:'636 Broadway',seen,shops:[{id:'bway-636-shop',name:'(clothing shop with orange diagonal stripes on the glass; name not legible)',frac:[.55,1],frame:'#2a2a2a',door:{at:.7,w:1.2}}]},
 {bin:1008214,street:S,addr:'640 Broadway',seen,shops:[{id:'van-leeuwen-640',name:'Van Leeuwen Ice Cream',frame:'#1d1d22',sign:{lines:['VAN LEEUWEN ICE CREAM'],bg:'#1d1d22',fg:'#f2c9d8',font:'sans-bold'},door:{at:.6,w:1.0}}]},
 {bin:1008420,street:S,addr:'650 Broadway',seen,shops:[{id:'liberty-bagels-650',name:'Liberty Bagels',frame:'#5a3a28',sign:{lines:['LIBERTY BAGELS'],bg:'#1f2a5a',fg:'#ffffff',font:'sans-bold'},door:{at:.3,w:1.2}}]},
 {bin:1008421,street:S,addr:'652 Broadway',seen,shops:[{id:'spear-652',name:'Spear (sign white on black)',frame:'#1a1a1a',sign:{lines:['spear'],bg:'#1a1a1a',fg:'#f2f2f0',font:'sans'},door:{at:.8,w:1.0}}]},
 {bin:1008422,street:S,addr:'654 Broadway',seen,shops:[{id:'citymd-654',name:'CityMD',frame:'#2a2a2a',sign:{lines:['CITYMD'],bg:'#ece8e2',fg:'#d0202a',font:'sans-bold'},door:{at:.5,w:1.2}}]},
 {bin:1008455,street:S,addr:'658 Broadway',seen,shops:[{id:'bway-658-shop',name:'(corner shop at Bond St with black metal screens behind the glass; name not legible)',frac:[.1,1],frame:'#1a1a1a',door:{at:.6,w:1.4}}]},
 {bin:1008470,street:S,addr:'678-680 Broadway',seen,shops:[
  {id:'eyes-on-broadway',name:'Eyes on Broadway (optician)',frac:[0,.55],frame:'#1a1a1a',awning:{type:'flat',color:'#1a1a1a',depth:.8},sign:{lines:['Eyes on Broadway'],bg:'#1a1a1a',fg:'#f2f2f0',font:'sans',mount:'awning'},door:{at:.85,w:1.0}}]},
 {bin:1008469,street:S,addr:'678 Broadway',seen,shops:[{id:'cleopatra-ink-678',name:'Cleopatra Ink (tattoo and piercing), under a red UMG sign band',frame:'#1e1a1a',sign:{lines:['UMG'],bg:'#2a2424',fg:'#d0202a',font:'sans-bold'},door:{at:.3,w:1.0}}]},
 {bin:1008471,street:S,addr:'682 Broadway',seen,shops:[{id:'kickclusive-682',name:'Kickclusive (sneakers), at Great Jones St',frame:'#1a1a1a',sign:{lines:['KICKCLUSIVE'],bg:'#1a1a1a',fg:'#f2f2f0',font:'sans-bold'},door:{at:.8,w:1.0}}]},
 {bin:1008506,street:S,addr:'686 Broadway',seen,shops:[{id:'great-jones-distilling',name:'Great Jones Distilling Co.',frame:'#1c1c1c',sign:{lines:['GREAT JONES DISTILLING Co'],bg:'#1c1c1c',fg:'#d6b46a',font:'serif'},door:{at:.4,w:1.4}}]},
 // West side at Bleecker St.
 {bin:1083504,street:S,addr:'661-665 Broadway',seen,shops:[
  {id:'starbucks-661',name:'Starbucks, at the Bleecker St corner',frac:[0,.3],frame:'#1f3a2e',sign:{lines:['STARBUCKS'],bg:'#1f3a2e',fg:'#f2f2f0',font:'sans-bold'},door:{at:.5,w:1.0}},
  {id:'bway-665-vacant',name:'(empty shop, red RETAIL SPACE FOR LEASE banner)',frac:[.55,1],frame:'#2a2a2a',bulkhead:.4}]},
 // East side, E 4th St to E 8th St (second pass, Apr 2026). 696 (offices) and 708 and 726 (NYU) have no shops.
 {bin:1008790,street:S,addr:'704 Broadway',seen,shops:[{id:'bright-horizons-704',name:'Bright Horizons (child care)',frac:[.3,1],frame:'#1a1a1a',sign:{lines:['Bright Horizons'],bg:'#1a1a1a',fg:'#f2f2f0',font:'sans'},door:{at:.25,w:1.4}}]},
 {bin:1008792,street:S,addr:'716 Broadway',seen,shops:[{id:'bway-716-shuttered',name:'(empty shop, grille down, SPACE FOR SALE OR LEASE sign)',frame:'#d8d2c4',shutter:true}]},
 {bin:1008794,street:S,addr:'722 Broadway',seen,shops:[{id:'bway-722-neon',name:'(shop with neon signs in the window; name hidden by a truck on the imagery)',frame:'#1a1a1a',door:{at:.6,w:1.0}}]},
 {bin:1008798,street:S,addr:'734 Broadway',seen,shops:[{id:'re-shop-734',name:'The Re-Shop (second-hand clothes)',frame:'#2a2a2a',sign:{lines:['The Re-Shop'],bg:'#2f5a4a',fg:'#f2f2f0',font:'sans-bold'},door:{at:.6,w:1.0}}]},
 {bin:1008799,street:S,addr:'736 Broadway',seen,shops:[{id:'caffeina-736',name:'Caffeina (coming soon banners in the windows)',frame:'#ece8e0',boarded:'#7a2a3a',bulkhead:.4,door:{at:.15,w:1.0}}]},
];
