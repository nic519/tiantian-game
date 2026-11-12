import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, dispatch, recoverEnergy, validateGame } from '../src/game/model.ts';

const now = 1_000_000;
const game = () => createGame(now);
test('a pair merges into one higher item without changing the source state', () => {
 const s=game(); const before=structuredClone(s); const r=dispatch(s,{type:'move',from:8,to:9},now);
 assert.equal(r.ok,true);assert.equal(r.state.cells[8].item,null);assert.equal(r.state.cells[9].item?.definition,'cake-2');assert.deepEqual(s,before);
});
test('different movable items swap instead of disappearing',()=>{
 const s=game();const a=s.cells[8].item,b=s.cells[10].item;const r=dispatch(s,{type:'move',from:8,to:10},now);
 assert.equal(r.state.cells[8].item?.id,b?.id);assert.equal(r.state.cells[10].item?.id,a?.id);
});
test('locked or invalid destinations do not change the board',()=>{
 const s=game();for(const to of [-1,100,62]){const r=dispatch(s,{type:'move',from:8,to},now);assert.equal(r.ok,false);assert.deepEqual(r.state,s);}
});
test('maximum level pairs cannot merge',()=>{
 const s=game();s.cells[8].item!.definition='cake-7';s.cells[9].item!.definition='cake-7';const r=dispatch(s,{type:'move',from:8,to:9},now);assert.equal(r.ok,false);assert.deepEqual(r.state,s);
});
test('successful production costs one energy and puts an item on the board',()=>{
 const s=game();const count=s.cells.filter(c=>c.item).length;const r=dispatch(s,{type:'produce',cell:0},now);
 assert.equal(r.ok,true);assert.equal(r.state.energy,s.energy-1);assert.equal(r.state.cells.filter(c=>c.item).length,count+1);
});
test('full board production does not spend energy or random state',()=>{
 const s=game();s.cells.forEach((c,i)=>{if(!c.locked&&!c.item)c.item={id:'fill-'+i,definition:'cake-1'};});const r=dispatch(s,{type:'produce',cell:0},now);assert.equal(r.ok,false);assert.deepEqual(r.state,s);
});
test('insufficient energy and cooling producers have no production side effects',()=>{
 const s=game();s.energy=0;assert.deepEqual(dispatch(s,{type:'produce',cell:0},now).state,s);
 const t=game();t.cells[0].item!.readyAt=now+5000;assert.deepEqual(dispatch(t,{type:'produce',cell:0},now).state,t);
});
test('production is deterministic for identical saved states',()=>{
 const s=game();assert.deepEqual(dispatch(s,{type:'produce',cell:0},now),dispatch(structuredClone(s),{type:'produce',cell:0},now));
});
test('an order consumes distinct matching items and grants reward only once',()=>{
 const s=game();const id=s.orders[0].id;const r=dispatch(s,{type:'submit',orderId:id},now);
 assert.equal(r.ok,true);assert.equal(r.state.completed,1);assert.ok(r.state.coins>s.coins);assert.equal(r.state.orders.length,3);
 const replay=dispatch(r.state,{type:'submit',orderId:id},now);assert.equal(replay.ok,false);assert.deepEqual(replay.state,r.state);
});
test('duplicate order requirements need two separate items',()=>{
 const s=game();s.cells[9].item=null;s.cells[23].item=null;s.orders[0].needs=[{definition:'cake-1',count:1},{definition:'cake-1',count:1}];assert.equal(dispatch(s,{type:'submit',orderId:s.orders[0].id},now).ok,false);
});
test('storage preserves the unique instance and refuses producers',()=>{
 const s=game(),id=s.cells[8].item!.id;const stored=dispatch(s,{type:'store',cell:8},now);assert.equal(stored.ok,true);assert.equal(stored.state.storage[0]?.id,id);
 const restored=dispatch(stored.state,{type:'retrieve',slot:0},now);assert.equal(restored.ok,true);assert.equal(restored.state.storage[0],null);assert.equal(restored.state.cells.filter(c=>c.item?.id===id).length,1);
 assert.equal(dispatch(s,{type:'store',cell:0},now).ok,false);
});
test('recovery uses elapsed time, caps energy, and does not bank time while full',()=>{
 const s=game();s.energy=98;const r=recoverEnergy(s,now+900_000);assert.equal(r.energy,100);
 const spent=dispatch(r,{type:'produce',cell:0},now+900_000).state;assert.equal(recoverEnergy(spent,now+900_001).energy,99);
});
test('backwards clocks do not grant energy',()=>{
 const s=game();s.energy=50;assert.equal(recoverEnergy(s,now-60_000).energy,50);
});
test('exported saves validate but foreign item ids, duplicates and invalid quantities do not',()=>{
 const s=game();assert.deepEqual(validateGame(JSON.parse(JSON.stringify(s))),s);
 for(const bad of [()=>{const x=game();x.energy=-1;return x;},()=>{const x=game();x.cells[8].item!.definition='bad';return x;},()=>{const x=game();x.cells[10].item=structuredClone(x.cells[8].item);return x;},()=>{const x=game();x.orders[0].needs[0].count=0;return x;}])assert.throws(()=>validateGame(bad()));
});
test('non-string discovered entries cannot become HTML through save import',()=>{const s=game();(s.discovered as unknown[])=[['cake-1']];assert.throws(()=>validateGame(s));});
test('inherited property names are never accepted as item definitions',()=>{const s=game();s.cells[8].item!.definition='toString';assert.throws(()=>validateGame(s));});
