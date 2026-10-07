import {buildBobst,BOBST} from './bobst.js?v=19';
import {buildSilver,SILVER} from './silver-center.js?v=19';
import {buildKimmel,KIMMEL} from './kimmel.js?v=19';
import {buildJudson,JUDSON} from './judson.js?v=19';
import {buildRow,ROW_BINS} from './row.js?v=19';
import {buildWeinstein,WEINSTEIN} from './weinstein.js?v=19';
import {buildBrown,BROWN} from './brown.js?v=19';
import {buildSilverTowers,SILVER_TOWERS} from './silver-towers.js?v=19';
import {buildVanderbilt,VANDERBILT} from './vanderbilt.js?v=19';
// Registry of detailed landmark buildings, keyed by NYC BIN. Each entry builds a Three.js group in
// world coordinates (x east, y up, z = -north) that replaces the footprint massing.
export const LANDMARK_BUILDINGS={[BOBST.bin]:{name:'Bobst Library',build:buildBobst},[SILVER.bin]:{name:'Silver Center',build:buildSilver},[KIMMEL.bin]:{name:'Kimmel Center',build:buildKimmel},[JUDSON.bin]:{name:'Judson Memorial Church',build:buildJudson,also:[JUDSON.hallBin]},[ROW_BINS[0]]:{name:'The Row, Washington Square North',build:buildRow,also:ROW_BINS.slice(1)},[WEINSTEIN.bin]:{name:'Weinstein Hall',build:buildWeinstein},[BROWN.bin]:{name:'Brown Building and Triangle Fire Memorial',build:buildBrown,preserve:true},[SILVER_TOWERS.bins[0]]:{name:'Silver Towers and 505 LaGuardia Place',build:buildSilverTowers,also:SILVER_TOWERS.bins.slice(1)},[VANDERBILT.bin]:{name:'Vanderbilt Hall',build:buildVanderbilt}};
