// Washington Square Village. Status: observed. 1-4 Washington Square Village, 1959-60, two 17-storey slabs (S. J.
// Kessler & Sons with Paul Lester Wiener) over a raised garden deck (Hideo Sasaki). Google Street View (looked at, not
// saved), Apr 2024: long pale slabs with continuous window bands and a grid of concrete balcony fronts; the garden deck
// behind a concrete retaining wall with a pergola; vertical panels of glazed coloured brick on the end walls. Counted on
// Street View: long fronts (W 3rd St and Bleecker St, Apr 2026): each building has a central vertical band of coloured
// glazed brick about six bays wide over a drive-through portal (building 1 blue), pale brick wings with grids of
// balconies either side; 17 storeys. Panels moved from the end walls to the long fronts.
export default {slug:"wsv",name:"Washington Square Village",status:"observed",bin:1077833,also:[1077834, 1077835, 1077836, 1085656],source:"1-4 Washington Square Village, 1959-60, two 17-storey slabs (S. J. Kessler & Sons with Paul Lester Wiener) over a raised garden deck (Hideo Sasaki). Google Street View (looked at, not saved), Apr 2024: long pale slabs with continuous window bands and a grid of concrete balcony fronts; the garden deck behind a concrete retaining wall with a pergola; vertical panels of glazed coloured brick on the end walls. Counted on Street View: long fronts (W 3rd St and Bleecker St, Apr 2026): each building has a central vertical band of coloured glazed brick about six bays wide over a drive-through portal (building 1 blue), pale brick wings with grids of balconies either side; 17 storeys. Panels moved from the end walls to the long fronts.",wall:'concrete',trim:'concrete',ground:{h:4.0,style:'glass',pitch:3},floor:2.8,pitch:3.0,win:[2.55,1.45],reveal:.35,sill:0,cornice:'none',storeys:17,doors:[{rank:0,at:.5,w:2.6,h:2.8,canopy:1.8},{rank:1,at:.5,w:2.6,h:2.8,canopy:1.8}],
 extra:K=>{/* Each building's long fronts (W 3rd St and Bleecker St): a central band of glazed coloured brick about six bays wide over a
  drive-through portal, pale brick wings with a balcony band at every floor either side. */const GU=[.837,-.547],cols={1077833:'glazedBlue',1077834:'glazedRed',1077835:'glazedYellow',1077836:'glazedBlue'};
  const fronts=K.W.filter(w=>!w.party&&w.y0<5&&w.piece.z>30&&Math.abs(w.n[0]*.547+w.n[1]*.837)>.9),pr=p=>p[0]*GU[0]+p[1]*GU[1];
  const bins=[...new Set(fronts.map(w=>w.piece.bin))];
  for(const bin of bins){const ws=fronts.filter(w=>w.piece.bin===bin);for(const side of [1,-1]){const sw=ws.filter(w=>Math.sign(w.n[0]*.547+w.n[1]*.837)===side);if(!sw.length)continue;
    const ts=sw.flatMap(w=>[pr(w.a),pr(w.b)]),c=(Math.min(...ts)+Math.max(...ts))/2,half=6.2;
    for(const w of sw){const ta=pr(w.a),tb=pr(w.b),dir=Math.sign(tb-ta)||1,toU=t=>(t-ta)*dir,u0=Math.max(0,Math.min(toU(c-half),toU(c+half))),u1=Math.min(w.len,Math.max(toU(c-half),toU(c+half))),f=w.face;
     if(u1-u0>.5){K.P.block(cols[bin]||'glazedBlue',f,u0,u1,4.0,w.piece.z-.8,0,.06);K.P.rect('iron',f,u0+1,u1-1,0,3.9,.05);}
     // Balcony bands on the wings only.
     for(const [a0,a1] of [[0,u0],[u1,w.len]])if(a1-a0>2)for(let y=4.0+2.8;y<w.piece.z-.5;y+=2.8)K.P.block('concrete',f,a0+.3,a1-.3,y-.15,y+.85,0,.22,{skip:['left','right']});}}}}};
