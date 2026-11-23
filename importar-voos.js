/* Private-fragment flight import. Opening the page never saves or publishes a batch. */
(async()=>{
'use strict';const $=s=>document.querySelector(s),key='my-football-atlas-aviation-v1',esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let previous,preview,batch,busy=false,loaded=false;
const button=$('#importFlights');$('.manager-entry').onclick=()=>AtlasCloud.login();
function render(){
 previous=localStorage.getItem(key);if(!previous)throw Error('Não foi possível carregar seus voos atuais. Atualize a página.');
 preview=AtlasFlightImport.plan(JSON.parse(previous),batch);
 $('#tripTitle').textContent=batch.trips?.[0]?.name||'Incluir viagem e voos';
 $('#tripSummary').textContent=batch.flights.length+' trechos · '+batch.flights.map((f,i)=>(i?'':f.origin+' → ')+f.destination).join(' → ');
 $('#flightRows').innerHTML=batch.flights.map(f=>'<tr><td>'+esc(f.dayMonth)+(f.year?'/'+esc(f.year):'')+'</td><td>'+esc(f.code)+'</td><td>'+esc(f.origin)+' → '+esc(f.destination)+'</td><td>'+esc(f.departureTime)+'</td><td>'+esc(f.arrivalTime)+'</td><td>'+esc(f.dateNote||'')+'</td></tr>').join('');
 $('#importCount').textContent=preview.added+' novos voos · '+preview.existing+' já cadastrados'+(preview.updated?' · '+preview.updated+' para completar':'');
 button.disabled=!AtlasCloud.isAdmin||!preview.changed||busy;button.textContent=preview.changed?'Incluir viagem e voos':'Viagem já incluída';
}
button.onclick=async()=>{
 if(!loaded||busy||!AtlasCloud.isAdmin||!preview?.changed)return;busy=true;button.disabled=true;$('#importStatus').textContent='Salvando a viagem…';
 try{await AtlasCloud.commit({[key]:preview.data},{[key]:previous});$('#importStatus').textContent='Viagem incluída com sucesso. Os trechos foram agrupados na sua coleção.';render()}
 catch(error){$('#importStatus').textContent=error.message||'Não foi possível confirmar o salvamento.'}
 finally{busy=false;button.disabled=!AtlasCloud.isAdmin||!preview?.changed}
};
try{
 const encoded=new URLSearchParams(location.hash.slice(1)).get('dados');
 if(!encoded||encoded.length>100000||!/^[A-Za-z0-9_-]+$/.test(encoded))throw Error('Abra o link completo enviado no chat para carregar os voos.');
 try{const bytes=Uint8Array.from(atob(encoded.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(encoded.length/4)*4,'=')),c=>c.charCodeAt(0));batch=JSON.parse(new TextDecoder().decode(bytes))}catch{throw Error('Não foi possível ler os voos do link. Abra o link completo enviado no chat.')}
 if(!Array.isArray(batch.flights)||!batch.flights.length)throw Error('O link não contém voos para incluir.');
 if(!AtlasCloud.enabled)throw Error('O salvamento na nuvem precisa estar ativo para incluir estes voos.');
 await AtlasCloud.ready;
 AtlasCloud.mount();if(AtlasCloud.isAdmin)$('.manager-entry').hidden=true;$('#loginHelp').hidden=AtlasCloud.isAdmin;render();loaded=true;
}catch(error){$('#importStatus').textContent=error.message||'Não foi possível carregar a inclusão.';button.disabled=true}
})();
