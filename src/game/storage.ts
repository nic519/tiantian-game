import { validateGame } from './model.ts';
import type { GameState } from './model.ts';
export const encodeSave=(state:GameState)=>JSON.stringify(validateGame(state),null,2);
export function decodeSave(text:string):GameState { if(text.length>1_000_000)throw new Error('存档文件过大');return validateGame(JSON.parse(text)); }
export function chooseSnapshot(current:unknown,previous:unknown):{state:GameState|null;recovered:boolean} {
 if(current==null&&previous==null)return {state:null,recovered:false};
 try{return {state:validateGame(current),recovered:false};}catch{try{return {state:validateGame(previous),recovered:true};}catch{throw new Error('存档暂时无法读取，请先导出备份，再选择新的存档');}}
}
export function planSnapshotWrite(current:unknown,snapshot:GameState){let valid:GameState|null=null;try{valid=validateGame(current);}catch{}return {skip:!!valid&&valid.revision>snapshot.revision,previous:valid,current:snapshot};}
export class SaveStore {
 private database?: Promise<IDBDatabase>;
 private queue:Promise<void>=Promise.resolve();
 private open():Promise<IDBDatabase> {return this.database??=new Promise((resolve,reject)=>{const r=indexedDB.open('tiantian-web',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('请关闭其他旧版本游戏页面后重试'));});}
 async load(){const db=await this.open();return new Promise<ReturnType<typeof chooseSnapshot>>((resolve,reject)=>{const tx=db.transaction('snapshots');const store=tx.objectStore('snapshots');const current=store.get('current'),previous=store.get('previous');tx.oncomplete=()=>{try{resolve(chooseSnapshot(current.result,previous.result));}catch(e){reject(e);}};tx.onerror=()=>reject(tx.error);});}
 save(state:GameState):Promise<void> {
  const snapshot=validateGame(state);
  const job=this.queue.catch(()=>{}).then(async()=>{const db=await this.open();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite'),store=tx.objectStore('snapshots'),get=store.get('current');get.onsuccess=()=>{const plan=planSnapshotWrite(get.result,snapshot);if(plan.skip)return;if(plan.previous)store.put(plan.previous,'previous');store.put(snapshot,'current');};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??new Error('保存中断'));});});this.queue=job;return job;
 }
 async replace(state:GameState):Promise<void> {
  const snapshot=validateGame(state);const job=this.queue.catch(()=>{}).then(async()=>{const db=await this.open();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite'),store=tx.objectStore('snapshots');const get=store.get('current');get.onsuccess=()=>{try{store.put(validateGame(get.result),'previous');}catch{}store.put(snapshot,'current');};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??new Error('导入中断'));});});this.queue=job;return job;
 }
 async rawBackup():Promise<string> {const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('snapshots'),r=tx.objectStore('snapshots').get('current');tx.oncomplete=()=>resolve(JSON.stringify(r.result??{},null,2));tx.onerror=()=>reject(tx.error);});}
}
