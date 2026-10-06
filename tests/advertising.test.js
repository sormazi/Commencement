import assert from 'node:assert/strict';
import {chooseAd,surfacePolicy,adAssets} from '../dist/ad-catalog.js';
import fs from 'node:fs';import crypto from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync(new URL('../dist/assets/ads/manifest.json',import.meta.url)));
for(const a of manifest.assets.filter(a=>a.file)){assert(a.source.startsWith('https://commons.wikimedia.org/'));assert(a.license&&a.author&&a.usageBasis);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../dist/'+a.file,import.meta.url))).digest('hex'),a.sha256);}
for(const city of ['times-square','soho','shibuya'])for(let i=0;i<80;i++){const a=chooseAd(city,i);assert(a.regions.includes(city));assert.equal(chooseAd(city,i,'digital',false).status,'original-fictional');assert.deepEqual(surfacePolicy(i,'digital',city),surfacePolicy(i,'digital',city));}
assert(chooseAd('soho',1).brand.includes('Kodak'));assert.equal(chooseAd('shibuya',1).language,'ja');
const digital=Array.from({length:32},(_,i)=>surfacePolicy(i,'digital','times-square'));assert.equal(digital.filter(p=>p.state==='powered').length,1);assert(digital.filter(p=>['dark','shattered'].includes(p.state)).length>16);assert(surfacePolicy(2,'shelter','soho').weather<surfacePolicy(2,'poster','soho').weather);
assert.equal(adAssets.filter(a=>a.status==='reviewed-archival').length,3);
console.log('PASS: ad provenance hashes, geographic eligibility, Japanese artwork, global fallback, deterministic weathering and digital power budget');
