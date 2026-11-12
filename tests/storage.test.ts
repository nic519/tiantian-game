import {test} from 'node:test';import assert from 'node:assert/strict';
import {createGame} from '../src/game/model.ts';
import {decodeSave,encodeSave,chooseSnapshot,planSnapshotWrite} from '../src/game/storage.ts';
test('save export and import preserve the complete game',()=>{const s=createGame(1000);assert.deepEqual(decodeSave(encodeSave(s)),s);});
test('a malformed save is rejected before replacing the active state',()=>{assert.throws(()=>decodeSave('{bad'));assert.throws(()=>decodeSave('{"schemaVersion":99}'));});
test('a corrupt current snapshot falls back to the previous valid one',()=>{const s=createGame(1000);const r=chooseSnapshot({bad:true},s);assert.equal(r.recovered,true);assert.deepEqual(r.state,s);});
test('no valid snapshots reports the corruption rather than silently resetting',()=>{assert.throws(()=>chooseSnapshot({bad:true},{bad:true}));});
test('a corrupt high revision cannot prevent a recovered game from saving',()=>{const s=createGame(1000);const result=planSnapshotWrite({revision:999999},s);assert.equal(result.skip,false);assert.equal(result.previous,null);assert.deepEqual(result.current,s);});
test('a valid newer snapshot cannot be overwritten by an older queued save',()=>{const current=createGame(1000);current.revision=8;assert.equal(planSnapshotWrite(current,createGame(1000)).skip,true);});
