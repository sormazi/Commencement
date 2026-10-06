// Only reviewed archival art enters the real-brand pool. Never synthesize brand campaigns.
export const adAssets=[
 {id:'coca-cola-1900',brand:'Coca-Cola',category:'beverage',year:'c. 1900',language:'en',file:'assets/ads/coca-cola-1900.jpg',regions:['times-square','soho'],source:'https://commons.wikimedia.org/wiki/File:Cocacola-5cents-1900_edit1.jpg',author:'Coca-Cola; Library of Congress scan, edited by Trialsanderrors',license:'Public domain in the US — published before 1931',status:'reviewed-archival',relevance:'Historic American beverage artwork; Times Square beverage-sign context. Archival reuse, not a surveyed installation.'},
 {id:'kodak-1909',brand:'Eastman Kodak',category:'photography',year:'1909',language:'en',file:'assets/ads/kodak-1909.jpg',regions:['soho','times-square'],source:'https://commons.wikimedia.org/wiki/File:Eastman_Kodak_Company_advertisement_1909.jpg',author:'Eastman Kodak Company / unknown photographer',license:'Public domain in the US — published 1909',status:'reviewed-archival',relevance:'Published in The Independent (New York), May 6, 1909; photography/arts retail context in SoHo. Placement is fictional.'},
 {id:'mitsukoshi-1911',brand:'三越 / Mitsukoshi',category:'fashion retail',year:'1911',language:'ja',file:'assets/ads/mitsukoshi-1911.jpg',regions:['shibuya'],source:'https://commons.wikimedia.org/wiki/File:Goy%C5%8D_Hashiguchi-poster.jpg',author:'Goyō Hashiguchi (1880–1921)',license:'Public domain — PD-Japan and PD-old; published 1911',status:'reviewed-archival',relevance:'Japanese department-store poster with original Japanese typography. Tokyo retail context; not evidence of a Mitsukoshi storefront in this corridor.'},
 {id:'local-us',brand:'Fictional fallback',category:'local culture',language:'en',regions:['times-square','soho'],status:'original-fictional',license:'Original NightView artwork',source:null,relevance:'Unbranded local arts poster; used when assets are unavailable or real brands are disabled.'},
 {id:'local-jp',brand:'Fictional fallback',category:'local culture',language:'ja',regions:['shibuya'],status:'original-fictional',license:'Original NightView artwork',source:null,relevance:'Unbranded Japanese-language local culture poster.'}
];
export const adSettings={enabled:true};
export function chooseAd(location,index,kind='poster',enabled=true){
 if(!enabled||index%5===4)return adAssets.find(a=>a.id===(location==='shibuya'?'local-jp':'local-us'));
 const pool=adAssets.filter(a=>a.status==='reviewed-archival'&&a.regions.includes(location));
 // Arts retail favors camera art; avenue beverage signs favor Coke. No global random-brand mix.
 if(location==='soho')return pool.find(a=>a.id===(index%3?'kodak-1909':'coca-cola-1900'));
 return pool[index%pool.length];
}
export const adRandom=n=>{const x=Math.sin(n*71.3+9.17)*47321.71;return x-Math.floor(x);};
export function surfacePolicy(index,kind,location){
 const digital=kind==='digital';const shelter=kind==='shelter'||kind==='storefront';
 const weather=Math.min(.9,(shelter?.2:.42)+adRandom(index+5)*.38+(location==='shibuya'?.06:0));
 const states=['dark','dark','shattered','dark','frozen','corrupted','dark','flicker'];
 return {weather,state:digital?(index===0?'powered':states[index%states.length]):'physical',power:digital&&(index===0||states[index%states.length]==='flicker')?'Local solar array and battery cabinet':digital&&states[index%states.length]==='frozen'?'Unlit retained frame / printed maintenance skin':'No sustained power'};
}
