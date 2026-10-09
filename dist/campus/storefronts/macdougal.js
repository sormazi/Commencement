// MacDougal Street between Bleecker and W 3rd Sts, both sides (Step 4B, Tier B). Observed on Google Street
// View, Apr 2026 captures, from the centreline opposite each lot (looked at only, not saved). Names as signed,
// plain lettering, no logos. Where a lot holds two shops the split (frac) is judged from the imagery.
const SV='Google Street View, MacDougal St, Apr 2026 capture';
const W='macdougal',seen=SV;
export const MACDOUGAL=[
 // West side (odd numbers), south to north.
 {bin:1008731,street:W,addr:'103 MacDougal St',seen,shops:[{id:'macdougal-103',name:'(red shopfront, name not legible)',frame:'#a3242a',awning:{type:'flat',color:'#b3262c',depth:.9},door:{at:.5,w:1.0}}]},
 {bin:1008730,street:W,addr:'105 MacDougal St',seen,shops:[{id:'pappas',name:'Pappas',frame:'#1e1d1c',sign:{lines:['PAPPAS'],bg:'#1b1a19',fg:'#e6dfcf',font:'serif'},door:{at:.75,w:1.0}}]},
 {bin:1077802,street:W,addr:'107 MacDougal St',seen,shops:[{id:'grisly-pear',name:'The Grisly Pear',frame:'#1f2a24',sign:{lines:['the Grisly Pear'],bg:'#1d2621',fg:'#f2efe6',font:'serif'},door:{at:.3,w:1.0}}]},
 {bin:1008729,street:W,addr:'109 MacDougal St',seen,shops:[{id:'off-the-wagon',name:'Off the Wagon',frame:'#2a2420',sign:{lines:['OFF the WAGON'],bg:'#2b2520',fg:'#d9c9a2',font:'serif-bold'},door:{at:.6,w:1.0}}]},
 {bin:1008728,street:W,addr:'111-113 MacDougal St',seen,shops:[
  {id:'artichoke',name:'Artichoke Basille\'s Pizza',frac:[0,.5],frame:'#161514',sign:{lines:['Artichoke'],bg:'#141312',fg:'#d8b45a',font:'serif-bold',border:'#c9a54e'},door:{at:.5,w:1.2}},
  {id:'minetta-tavern',name:'Minetta Tavern',frac:[.5,1],frame:'#1f2a22',sign:{lines:['MINETTA TAVERN'],bg:'#1e2820',fg:'#e2d6b0',font:'serif'},door:{at:.3,w:1.0}}]},
 {bin:1008748,street:W,addr:'115 MacDougal St',seen,shops:[
  {id:'cafe-wha',name:'Cafe Wha?',frac:[0,.38],frame:'#8f1f22',sign:{lines:['CAFE WHA?','LIVE MUSIC'],bg:'#151413',fg:'#f2efe6',font:'sans-bold'},door:{at:.5,w:1.0}},
  {id:'players-theatre',name:'Players Theatre',frac:[.38,1],frame:'#8f1f22',sign:{lines:['PLAYERS THEATRE'],bg:'#f1eee6',fg:'#151413',font:'serif-bold'},door:{at:.4,w:1.6}}]},
 {bin:1008747,street:W,addr:'117 MacDougal St',seen,shops:[{id:'olive-tree-cafe',name:'Olive Tree Cafe & Bar (the Comedy Cellar is downstairs)',frame:'#7a1d1e',sign:{lines:['OLIVE TREE CAFE & BAR'],bg:'#1c1a19',fg:'#f2efe6',font:'sans-bold'},door:{at:.55,w:1.0}}]},
 {bin:1008745,street:W,addr:'119 MacDougal St',seen,shops:[
  {id:'mamouns',name:'Mamoun\'s Falafel',frac:[0,.28],frame:'#5b3b22',sign:{lines:['MAMOUN\'S FALAFEL'],bg:'#efe9dc',fg:'#2a1d14',font:'serif-bold'},door:{at:.5,w:1.0}},
  {id:'caffe-reggio',name:'Caffe Reggio',frac:[.28,.58],frame:'#1f4a32',awning:{type:'slope',color:'#1f4433',depth:1.3},sign:{lines:['CAFFE REGGIO ORIGINAL CAPPUCCINO'],bg:'#1f4433',fg:'#f2efe6',font:'serif',mount:'awning'},door:{at:.5,w:1.0}}]},
 // East side (even numbers), south to north.
 {bin:1008689,street:W,addr:'104 MacDougal St',seen,shops:[{id:'nyc-smoke-shop',name:'NYC Smoke Shop & More',frame:'#2a2826',sign:{lines:['NYC SMOKE SHOP & MORE'],bg:'#222120',fg:'#e9e6df',font:'sans-bold'},door:{at:.5,w:1.0}}]},
 {bin:1008690,street:W,addr:'106 MacDougal St',seen,shops:[{id:'crepes-waffles',name:'Crepes & Waffles',frame:'#1b1a19',sign:{lines:['CREPES & WAFFLES'],bg:'#1a1918',fg:'#f2efe6',font:'sans-bold'},door:{at:.3,w:1.0}}]},
 {bin:1008691,street:W,addr:'108 MacDougal St',seen,shops:[{id:'butter-108',name:'butter',frame:'#24272c',sign:{lines:['butter'],bg:'#1c1d22',fg:'#f4f2ee',font:'sans-bold'},door:{at:.6,w:1.0}}]},
 {bin:1008692,street:W,addr:'112 MacDougal St',seen,shops:[{id:'thelewala',name:'Thelewala',frame:'#1d1c1b',sign:{lines:['THELEWALA'],bg:'#2a2928',fg:'#ece8de',font:'sans-bold'},door:{at:.4,w:1.0}}]},
 {bin:1008693,street:W,addr:'114 MacDougal St',seen,shops:[{id:'saigon-shack',name:'Saigon Shack',frame:'#8b8778',sign:{lines:['SAIGON ★ SHACK'],bg:'#2b2a28',fg:'#ece8de',font:'sans-bold'},door:{at:.5,w:1.0}}]},
 {bin:1008697,street:W,addr:'122 MacDougal St',seen,shops:[{id:'macdougal-ale-house',name:'MacDougal Street Ale House',frame:'#1e3a2a',awning:{type:'barrel',color:'#1f3d2c',depth:1.0},sign:{lines:['MACDOUGAL STREET','ALE HOUSE'],bg:'#1f3d2c',fg:'#e8dfc4',font:'serif-bold'},door:{at:.5,w:1.2}}]},
 {bin:1008698,street:W,addr:'124 MacDougal St',seen,shops:[{id:'meskerem',name:'Meskerem Ethiopian Restaurant',frame:'#1b1a19',sign:{lines:['MESKEREM','ETHIOPIAN RESTAURANT'],bg:'#1a1918',fg:'#f2efe6',font:'sans-bold'},door:{at:.5,w:1.0}}]},
 {bin:1008699,street:W,addr:'126 MacDougal St',seen,shops:[{id:'macdougal-126',name:'(vacant, shutter down)',frame:'#2a2826',shutter:true,door:{at:.8,w:1.0}}]},
 {bin:1008700,street:W,addr:'128 MacDougal St',seen,shops:[{id:'pommes-frites',name:'Pommes Frites',frame:'#2a2420',sign:{lines:['POMMES FRITES'],bg:'#1f1b18',fg:'#d9b45e',font:'serif-bold'},door:{at:.5,w:1.0}}]},
];
