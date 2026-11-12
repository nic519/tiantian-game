import {createGame,dispatch,recoverEnergy,validateGame} from './model.ts';
import type {GameState,Command,Result} from './model.ts';
import {SaveStore,decodeSave,encodeSave} from './storage.ts';
export class Session {
 state:GameState=createGame(Date.now());writable=false;saveStatus='正在读取';notice='';recoveryNeeded=false;
 private store:Pick<SaveStore,'load'|'save'|'replace'|'rawBackup'>;private listeners=new Set<(result?:Result)=>void>();private importing=false;
 constructor(store:Pick<SaveStore,'load'|'save'|'replace'|'rawBackup'>=new SaveStore()){this.store=store;}
 async start(){
  try{const saved=await this.store.load();if(saved.state)this.state=recoverEnergy(saved.state,Date.now());if(saved.recovered)this.notice='已从上一份有效备份恢复进度';}catch(e){this.notice=(e as Error).message;this.saveStatus='存档读取失败';this.recoveryNeeded=true;}
  if(navigator.locks){await new Promise<void>(resolve=>{void navigator.locks.request('tiantian-single-writer',{ifAvailable:true},lock=>{this.writable=!!lock;resolve();if(lock)return new Promise<void>(()=>{});}).catch(()=>{this.writable=false;resolve();});});}
  else{this.writable=false;this.notice='此浏览器不支持安全保存，请使用较新版本的 Chrome 或 Safari';}
  if(this.writable){try{const fresh=await this.store.load();if(fresh.state)this.state=recoverEnergy(fresh.state,Date.now());this.recoveryNeeded=false;if(fresh.recovered)this.notice='已从上一份有效备份恢复进度';}catch(e){this.recoveryNeeded=true;this.notice=(e as Error).message;}}
  this.saveStatus=this.writable?'进度已保存':'另一个页面正在游戏';
  if(this.writable&&!this.recoveryNeeded)await this.persist();this.emit();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&this.writable&&!this.recoveryNeeded&&!this.importing){this.state=recoverEnergy(this.state,Date.now());void this.persist();}this.emit();});
  window.setInterval(()=>{if(this.writable&&!this.recoveryNeeded&&!this.importing){const next=recoverEnergy(this.state,Date.now());if(next.energy!==this.state.energy){this.state=next;void this.persist();}}this.emit();},1000);
 }
 subscribe(listener:(result?:Result)=>void){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
 private emit(result?:Result){this.listeners.forEach(l=>l(result));}
 send(command:Command):Result {if(!this.writable||this.recoveryNeeded||this.importing){const result:Result={ok:false,state:this.state,message:this.importing?'正在导入进度，请稍等':this.recoveryNeeded?'请先处理存档恢复':'这个页面只读，请关闭其他游戏页面后刷新'};this.emit(result);return result;}const result=dispatch(this.state,command,Date.now());if(result.ok){this.state=result.state;void this.persist();}this.emit(result);return result;}
 private async persist(){this.saveStatus='正在保存';try{await this.store.save(this.state);this.saveStatus='进度已保存';}catch{this.saveStatus='保存失败，请导出备份';}this.emit();}
 export(){return encodeSave(this.state);}
 async backup(){return this.store.rawBackup();}
 async import(text:string){if(!this.writable)throw new Error('只读页面不能导入存档');if(this.importing)throw new Error('正在导入进度，请稍等');const candidate=decodeSave(text);this.importing=true;try{candidate.revision=Math.max(candidate.revision,this.state.revision)+1;const checked=validateGame(candidate);await this.store.replace(checked);this.state=recoverEnergy(checked,Date.now());this.recoveryNeeded=false;this.saveStatus='进度已保存';}finally{this.importing=false;this.emit();}}
}
