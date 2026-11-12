import {test} from 'node:test';import assert from 'node:assert/strict';
import {Session} from '../src/game/session.ts';import {createGame} from '../src/game/model.ts';
test('import suspends game commands until the imported snapshot is committed',async()=>{
 let finish!:()=>void;const store={load:async()=>({state:null,recovered:false}),save:async()=>{},rawBackup:async()=>'{}',replace:()=>new Promise<void>(r=>{finish=r;})};
 const session=new Session(store);session.writable=true;const imported=createGame(1000);imported.coins=900;
 const job=session.import(JSON.stringify(imported));await Promise.resolve();
 const result=session.send({type:'produce',cell:0});assert.equal(result.ok,false);finish();await job;assert.equal(session.state.coins,900);
});
