const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync('stadium-catalog.js','utf8')+'\nthis.catalog=stadiumCatalog;',context);
const {catalog,findStadiumDetails,enrichStadium}=context;

test('catalog entries have unique country/name identities and valid sourced coordinates',()=>{
 const identities=catalog.map(v=>v.iso+'|'+v.name);
 assert.equal(new Set(identities).size,identities.length);
 for(const v of catalog){
  assert.match(v.iso,/^[A-Z]{3}$/);
  if(v.lat!==undefined){assert(v.lat>=-90&&v.lat<=90);assert(v.lng>=-180&&v.lng<=180);assert.match(v.coordinateSource,/^https:\/\//)}
  if(v.photo){for(const k of ['url','originalUrl','source'])assert.match(v.photo[k],/^https:\/\//);assert(v.photo.author);assert(v.photo.license)}
 }
});

test('accent-insensitive lookup requires the country and an exact name',()=>{
 assert.equal(findStadiumDetails({stadium:'  VILA BELMIRO ',iso:'bra'}).name,'Vila Belmiro');
 assert.equal(findStadiumDetails({stadium:'Santiago Bernabeu',iso:'ESP'}).name,'Santiago Bernabéu');
 assert.equal(findStadiumDetails({stadium:'Vila Belmiro',iso:'ARG'}),undefined);
 assert.equal(findStadiumDetails({stadium:'Monumental',iso:'ARG'}),undefined);
});

test('fills an empty coordinate pair while preserving personal fields and the original record',()=>{
 const visit={stadium:'Vila Belmiro',iso:'BRA',lat:'',lng:'',visitCount:7,photoUrl:'data:image/jpeg;base64,personal',notes:'Minhas memórias',date:'2020-01-01'};
 const enriched=enrichStadium(visit);
 assert.equal(enriched.lat,-23.951111);assert.equal(enriched.lng,-46.338889);
 for(const k of ['visitCount','photoUrl','notes','date'])assert.equal(enriched[k],visit[k]);
 assert.equal(visit.lat,'');assert.equal(visit.lng,'');
 assert.equal(enrichStadium(enriched),enriched);
});

test('preserves user coordinates, zero values, partial pairs and unknown stadiums',()=>{
 for(const pair of [[0,0],[-23.9,-46.3],['',-46.3],[-23.9,'']]){
  const visit={stadium:'Vila Belmiro',iso:'BRA',lat:pair[0],lng:pair[1]};assert.equal(enrichStadium(visit),visit);
 }
 const unknown={stadium:'Outro estádio',iso:'BRA',lat:'',lng:''};assert.equal(enrichStadium(unknown),unknown);
});
