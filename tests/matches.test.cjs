const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context=vm.createContext({visits:[{stadium:'Estádio',matches:[null,'invalid',{id:'one',homeTeam:'Santos'}]}]});
vm.runInContext(fs.readFileSync('matches.js','utf8'),context);
const {validateMatchFields:validate,matchScore,matchDateLabel,getRecordMatches,findRecordMatch}=context;

test('allows partial memories and preserves zero scores without inventing missing fields',()=>{
 const partial=validate({notes:'  Minha primeira partida  '});assert.equal(partial.notes,'Minha primeira partida');assert.equal(partial.date,'');assert.equal(partial.homeScore,null);assert.equal(partial.awayScore,null);
 const draw=validate({homeScore:'0',awayScore:'0'});assert.equal(draw.homeScore,0);assert.equal(draw.awayScore,0);
 const remembered=validate({homeTeam:'Santos',homeScore:'2'});assert.equal(remembered.awayScore,null);
});
test('rejects empty memories, invalid scores and invalid dates',()=>{
 assert.throws(()=>validate({}),/lembrança/);
 for(const score of ['-1','2.5','abc'])assert.throws(()=>validate({homeScore:score}),/placar/);
 for(const date of ['2023-02-29','2025-13-01','ontem'])assert.throws(()=>validate({date}),/data/);
 assert.equal(validate({date:'2024-02-29'}).date,'2024-02-29');
});
test('formats unknown scores and dates honestly and finds saved memories safely',()=>{
 assert.equal(matchScore(null),null);assert.equal(matchScore(''),null);assert.equal(matchScore(0),0);assert.equal(matchScore('<img>'),null);
 assert.equal(matchDateLabel('2024-01-02'),'02/01/2024');assert.equal(matchDateLabel(''),'Data não informada');
 assert.equal(getRecordMatches(0).length,1);assert.equal(findRecordMatch(0,'one').game.homeTeam,'Santos');assert.equal(getRecordMatches(3).length,0);
});
