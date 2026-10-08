// Puck Building. Status: observed. 295 Lafayette St, 1885-86 with an 1892-93 annex, Albert Wagner, Rundbogenstil. Not
// NYU-owned (condominium); NYU Wagner occupies space in it. Google Street View (looked at, not saved), Jul 2022
// (Mulberry St): red brick, tall round-arched windows grouped in bays between brick piers, cast-iron storefronts with
// name fascias at the ground storey. The gilded Puck figures (Henry Baerer, 1880s, public domain) are shown as small
// gilt placeholders.
import * as T from '../../../vendor/three.module.js';
export default {slug:"puck",name:"Puck Building",status:"observed",bin:1007941,also:[],source:"295 Lafayette St, 1885-86 with an 1892-93 annex, Albert Wagner, Rundbogenstil. Not NYU-owned (condominium); NYU Wagner occupies space in it. Google Street View (looked at, not saved), Jul 2022 (Mulberry St): red brick, tall round-arched windows grouped in bays between brick piers, cast-iron storefronts with name fascias at the ground storey. The gilded Puck figures (Henry Baerer, 1880s, public domain) are shown as small gilt placeholders.",wall:'brickRed',trim:'brickRed',ground:{h:4.8,style:'storefront',mat:'castIron',pitch:4.2},floor:3.9,pitch:4.2,win:[1.25,2.6],pair:1,arch:1,cornice:'band',doors:[{rank:0,at:.5,w:2.6,h:3.4}],signs:{sign_puck:{text:['PUCK BUILDING'],opt:{bg:'#7a3a2a',ink:'#e2c98a',h:80}}},
 extra:K=>{const w=K.ranked[0];if(!w)return;const f=w.face,P=K.P,c=w.len/2;P.panel('sign_puck',f,c-4,c+4,5.1,5.8,.18);
  /* Gilt figure placeholder on a bracket over the entrance: a plain standing form, not a likeness. */const m=new T.Matrix4().makeTranslation(...f.at(c,6.6,.6));P.cyl('gold',.28,.22,1.2,m,8);P.sphere('gold',.2,new T.Matrix4().makeTranslation(...f.at(c,7.4,.6)),8,6);P.block('limestone',f,c-.6,c+.6,5.9,6.05,0,.8);}};
