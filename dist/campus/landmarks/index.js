import {buildBobst,BOBST} from './bobst.js?v=24';
import {buildSilver,SILVER} from './silver-center.js?v=24';
import {buildKimmel,KIMMEL} from './kimmel.js?v=24';
import {buildJudson,JUDSON} from './judson.js?v=24';
import {buildRow,ROW_BINS} from './row.js?v=24';
import {buildWeinstein,WEINSTEIN} from './weinstein.js?v=24';
import {buildBrown,BROWN} from './brown.js?v=24';
import {buildSilverTowers,SILVER_TOWERS} from './silver-towers.js?v=24';
import {buildVanderbilt,VANDERBILT} from './vanderbilt.js?v=24';
import {buildStern,STERN} from './stern.js?v=24';
import {buildPaulson,PAULSON} from './paulson.js?v=24';
import {buildGrace,GRACE} from './grace.js?v=24';
import {buildJefferson,JEFFERSON} from './jefferson.js?v=24';
import {buildAscension,ASCENSION} from './ascension.js?v=24';
import {buildFirstPres,FIRSTPRES} from './firstpres.js?v=24';
import {TIERA_KIT,buildTierAKit} from './tiera-kit.js?v=24';
import {buildCooper41,COOPER41} from './cooper41.js?v=24';
// Registry of detailed landmark buildings, keyed by NYC BIN. Each entry builds a Three.js group in
// world coordinates (x east, y up, z = -north) that replaces the footprint massing.
export const LANDMARK_BUILDINGS={[BOBST.bin]:{name:'Bobst Library',build:buildBobst},[SILVER.bin]:{name:'Silver Center',build:buildSilver},[KIMMEL.bin]:{name:'Kimmel Center',build:buildKimmel},[JUDSON.bin]:{name:'Judson Memorial Church',build:buildJudson,also:[JUDSON.hallBin]},[ROW_BINS[0]]:{name:'The Row, Washington Square North',build:buildRow,also:ROW_BINS.slice(1)},[WEINSTEIN.bin]:{name:'Weinstein Hall',build:buildWeinstein},[BROWN.bin]:{name:'Brown Building and Triangle Fire Memorial',build:buildBrown,preserve:true},[SILVER_TOWERS.bins[0]]:{name:'Silver Towers and 505 LaGuardia Place',build:buildSilverTowers,also:SILVER_TOWERS.bins.slice(1)},[VANDERBILT.bin]:{name:'Vanderbilt Hall',build:buildVanderbilt},[STERN.kmc]:{name:'Kaufman Management Center and Tisch Hall',build:buildStern,also:[STERN.tisch]},[PAULSON.bin]:{name:'John A. Paulson Center',build:buildPaulson},
 // Neighbourhood landmarks (Step 4B, Tier A).
 [GRACE.bin]:{name:'Grace Church',build:buildGrace,tierA:true},[JEFFERSON.bin]:{name:'Jefferson Market Library',build:buildJefferson,tierA:true},
 [ASCENSION.bin]:{name:'Church of the Ascension',build:buildAscension,tierA:true},[FIRSTPRES.bin]:{name:'First Presbyterian Church',build:buildFirstPres,tierA:true}};
// Kit-based Tier A landmarks (tiera-kit.js).
LANDMARK_BUILDINGS[COOPER41.bin]={name:'41 Cooper Square',build:buildCooper41,tierA:true};
for(const s of TIERA_KIT)LANDMARK_BUILDINGS[s.bin]={name:s.name,build:buildTierAKit,tierA:true};
