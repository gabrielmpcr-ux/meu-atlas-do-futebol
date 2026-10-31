const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context=vm.createContext({});vm.runInContext(fs.readFileSync('stadium-catalog.js','utf8')+'\n'+fs.readFileSync('collection.js','utf8'),context);
const data=[{stadium:'Morumbi',city:'São Paulo',country:'Brasil',iso:'BRA',visitCount:3},{stadium:'Allianz Arena',city:'Munique',country:'Alemanha',iso:'DEU'},{stadium:'Arena Corinthians',city:'São Paulo',country:'Brasil',iso:'BRA',visitCount:7},{stadium:'',city:'Bogotá',country:'Colômbia',iso:'COL'},{stadium:'Maracanã',city:'Rio de Janeiro',country:'Brasil',iso:'BRA'}];
const state=extra=>({iso:'',city:'',query:'',sort:'name',...extra});
test('combines country, city and accent-insensitive multi-word search',()=>{
 const entries=context.collectionEntries(data,state({iso:'BRA',city:'sao paulo',query:'arena sao'}));assert.equal(entries.length,1);assert.equal(entries[0].stadium,'Arena Corinthians');assert.equal(entries[0]._index,2);
 assert.equal(context.collectionEntries(data,state({query:'maracana'}))[0]._index,4);
 assert.equal(context.collectionEntries(data,state({iso:'DEU',query:'maracana'})).length,0);
});
test('sorts without mutating records or losing the original edit index',()=>{
 const before=JSON.stringify(data);const alphabetical=context.collectionEntries(data,state());assert.equal(alphabetical[0]._index,1);const frequent=context.collectionEntries(data,state({sort:'visits'}));assert.equal(frequent[0]._index,2);assert.equal(JSON.stringify(data),before);
});
test('country counts omit city-only records but retain those countries in the selector',()=>{
 const countries=context.collectionCountries(data);assert.equal(countries.find(c=>c.iso==='BRA').count,3);assert.equal(countries.find(c=>c.iso==='COL').count,0);assert.equal(context.collectionEntries(data,state()).length,4);
});
