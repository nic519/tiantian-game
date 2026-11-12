import { ITEMS, COLS, ROWS, ENERGY_MAX, ENERGY_INTERVAL, STORAGE_SIZE, CONTENT_VERSION, ORDER_TEMPLATES, CUSTOMERS } from './content.ts';
import type { Need } from './content.ts';
export interface Item { id: string; definition: string; charges?: number; readyAt?: number }
export interface Cell { locked: boolean; item: Item | null }
export interface Order { id: string; template: number; customer: string; needs: Need[]; coins: number; xp: number }
export interface GameState { schemaVersion: 1; contentVersion: string; revision: number; cells: Cell[]; storage: (Item|null)[]; orders: Order[]; coins: number; gems: number; energy: number; energyAnchor: number; xp: number; completed: number; renovated: number; sequence: number; rng: number; discovered: string[]; settings: { music: boolean; sound: boolean }; tutorialDone: boolean }
export type Command = {type:'move';from:number;to:number} | {type:'produce';cell:number} | {type:'submit';orderId:string} | {type:'store';cell:number} | {type:'retrieve';slot:number} | {type:'unlock';cell:number} | {type:'energy'} | {type:'renovate'} | {type:'settings';music:boolean;sound:boolean} | {type:'tutorial'};
export interface Result { ok: boolean; state: GameState; message: string; event?: 'merge'|'produce'|'order'|'move'|'reward'; target?: number }
const integer=(v:unknown,min=0,max=Number.MAX_SAFE_INTEGER):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
const makeItem=(s:GameState,definition:string):Item=>({id:`item-${++s.sequence}`,definition,...(ITEMS[definition].producer?{charges:12,readyAt:0}:{})});
function makeOrder(s:GameState,template:number):Order { const i=template%ORDER_TEMPLATES.length;return {id:`order-${++s.sequence}`,template:i,customer:CUSTOMERS[template%CUSTOMERS.length],needs:structuredClone(ORDER_TEMPLATES[i]),coins:18+ORDER_TEMPLATES[i].reduce((n,v)=>n+ITEMS[v.definition].level*v.count*7,0),xp:8}; }
export function createGame(now:number):GameState {
 const s:GameState={schemaVersion:1,contentVersion:CONTENT_VERSION,revision:0,cells:Array.from({length:COLS*ROWS},(_,i)=>({locked:i>=42,item:null})),storage:Array(STORAGE_SIZE).fill(null),orders:[],coins:120,gems:20,energy:100,energyAnchor:now,xp:0,completed:0,renovated:0,sequence:0,rng:5192026,discovered:['cake-1','cake-2','drink-1','fruit-1'],settings:{music:false,sound:true},tutorialDone:false};
 const initial:Record<number,string>={0:'producer-bakery',1:'producer-cafe',8:'cake-1',9:'cake-1',10:'drink-1',15:'cake-2',16:'cake-2',17:'fruit-1',18:'fruit-1',22:'drink-1',23:'cake-1'};
 for(const [i,id] of Object.entries(initial))s.cells[Number(i)].item=makeItem(s,id);
 s.orders=[0,1,2].map(i=>makeOrder(s,i));return s;
}
export const playerLevel=(s:GameState)=>1+Math.floor(s.xp/25);
export const availableStars=(s:GameState)=>Math.floor(s.completed/3)-s.renovated;
export function recoverEnergy(state:GameState,now:number):GameState {
 const s=structuredClone(state);if(now<s.energyAnchor)return s;
 if(s.energy>=ENERGY_MAX){s.energyAnchor=now;return s;}
 const count=Math.floor((now-s.energyAnchor)/ENERGY_INTERVAL);
 if(count>0){s.energy=Math.min(ENERGY_MAX,s.energy+count);s.energyAnchor=s.energy===ENERGY_MAX?now:s.energyAnchor+count*ENERGY_INTERVAL;}return s;
}
export function matchingItems(s:GameState,order:Order):number[]|null {
 const used=new Set<number>();for(const need of order.needs){let remaining=need.count;for(let i=0;i<s.cells.length&&remaining>0;i++)if(!used.has(i)&&!s.cells[i].locked&&s.cells[i].item?.definition===need.definition){used.add(i);remaining--;}
  if(remaining)return null;}return [...used];
}
export function dispatch(state:GameState,command:Command,now:number):Result {
 const s=recoverEnergy(state,now);const fail=(message:string):Result=>({ok:false,state,message});let message='',event:Result['event'],target:number|undefined;
 const valid=(i:number)=>integer(i,0,s.cells.length-1);
 const discover=(id:string)=>{if(!s.discovered.includes(id))s.discovered.push(id);};
 switch(command.type){
 case 'move': {
  const {from,to}=command;if(!valid(from)||!valid(to)||from===to||s.cells[from].locked||s.cells[to].locked||!s.cells[from].item)return fail('这里暂时不能放置物品');
  const a=s.cells[from].item!,b=s.cells[to].item;const def=ITEMS[a.definition];
  if(b?.definition===a.definition&&!def.producer){if(!def.next)return fail('已经是最高等级了');s.cells[to].item=makeItem(s,def.next);s.cells[from].item=null;s.xp++;discover(def.next);message=`发现了${ITEMS[def.next].name}！`;event='merge';}
  else{s.cells[from].item=b;s.cells[to].item=a;event='move';message='';}target=to;break;
 }
 case 'produce': {
  if(!valid(command.cell))return fail('没有找到生产器');const source=s.cells[command.cell].item;const def=source&&ITEMS[source.definition];
  if(!source||!def?.producer||s.cells[command.cell].locked)return fail('请选择一个生产器');
  if((source.readyAt??0)>now)return fail('正在准备下一批，请稍等片刻');if(s.energy<1)return fail('体力不足，稍作休息或去补给站');
  const empty=s.cells.findIndex(c=>!c.locked&&!c.item);if(empty<0)return fail('棋盘满啦，先合成或放入仓库吧');
  let x=s.rng;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;const value=s.rng/4294967296;
  const chain=def.producer==='bakery'?'cake':value<.65?'drink':'fruit';const level=value>.88?2:1;const id=`${chain}-${level}`;
  s.cells[empty].item=makeItem(s,id);discover(id);if(s.energy===ENERGY_MAX)s.energyAnchor=now;s.energy--;
  source.charges=(source.charges??12)-1;if(source.charges<=0){source.charges=12;source.readyAt=now+12_000;}else source.readyAt=0;
  target=empty;event='produce';message='';break;
 }
 case 'submit': {
  const i=s.orders.findIndex(o=>o.id===command.orderId);if(i<0)return fail('这个订单已经完成');const order=s.orders[i],matches=matchingItems(s,order);if(!matches)return fail('还差一点，继续合成订单需要的物品吧');
  matches.forEach(i=>{s.cells[i].item=null;});s.coins+=order.coins;s.xp+=order.xp;s.completed++;s.orders[i]=makeOrder(s,s.completed+2);event='order';message=`订单完成，获得 ${order.coins} 金币！`;break;
 }
 case 'store': {
  if(!valid(command.cell))return fail('请选择物品');const item=s.cells[command.cell].item;if(!item||s.cells[command.cell].locked||ITEMS[item.definition].producer)return fail('生产器需要留在棋盘上');const slot=s.storage.indexOf(null);if(slot<0)return fail('仓库已经满啦');s.storage[slot]=item;s.cells[command.cell].item=null;message='已收进仓库';event='move';break;
 }
 case 'retrieve': {
  if(!integer(command.slot,0,STORAGE_SIZE-1)||!s.storage[command.slot])return fail('这个位置是空的');const i=s.cells.findIndex(c=>!c.locked&&!c.item);if(i<0)return fail('棋盘没有空位了');s.cells[i].item=s.storage[command.slot];s.storage[command.slot]=null;target=i;event='move';message='已取出物品';break;
 }
 case 'unlock': {
  if(!valid(command.cell)||!s.cells[command.cell].locked)return fail('这个格子已经开放');if(s.coins<30)return fail('需要 30 金币才能整理这个位置');s.coins-=30;s.cells[command.cell].locked=false;message='新的位置整理好啦';event='reward';target=command.cell;break;
 }
 case 'energy': if(s.energy>=ENERGY_MAX)return fail('体力已经满啦');if(s.coins<60)return fail('需要 60 金币补充体力');s.coins-=60;s.energy=Math.min(ENERGY_MAX,s.energy+30);s.energyAnchor=now;message='元气满满，继续制作吧';event='reward';break;
 case 'renovate': if(s.renovated>=3)return fail('花园已经焕然一新啦');if(availableStars(s)<1)return fail('完成 3 个订单，即可获得一颗装扮星星');s.renovated++;event='reward';message='小店又变漂亮了一点！';break;
 case 'settings':s.settings={music:command.music,sound:command.sound};message='设置已保存';break;
 case 'tutorial':s.tutorialDone=true;break;
 }
 s.revision=state.revision+1;return {ok:true,state:s,message,event,target};
}
export function validateGame(value:unknown):GameState {
 const bad=()=>{throw new Error('存档格式不正确，或包含不兼容的数据');};
 const known=(id:unknown):id is string=>typeof id==='string'&&Object.hasOwn(ITEMS,id);
 if(!value||typeof value!=='object')return bad();const s=value as GameState;
 if(s.schemaVersion!==1||s.contentVersion!==CONTENT_VERSION||!integer(s.revision)||!integer(s.sequence)||!integer(s.rng,0,4294967295)||!integer(s.energy,0,100)||!integer(s.energyAnchor)||!integer(s.coins)||!integer(s.gems)||!integer(s.xp)||!integer(s.completed)||!integer(s.renovated,0,3)||s.renovated>Math.floor(s.completed/3))return bad();
 if(!Array.isArray(s.cells)||s.cells.length!==COLS*ROWS||!Array.isArray(s.storage)||s.storage.length!==STORAGE_SIZE||!Array.isArray(s.orders)||s.orders.length!==3||!Array.isArray(s.discovered)||s.discovered.some(id=>!known(id))||!s.settings||typeof s.settings.music!=='boolean'||typeof s.settings.sound!=='boolean'||typeof s.tutorialDone!=='boolean')return bad();
 const ids=new Set<string>();const check=(item:Item|null)=>{if(item===null)return;if(!item||typeof item.id!=='string'||!/^item-\d+$/.test(item.id)||!known(item.definition)||ids.has(item.id))bad();ids.add(item.id);const n=Number(item.id.slice(5));if(!integer(n,1,s.sequence))bad();if(ITEMS[item.definition].producer&&(!integer(item.charges,1,12)||!integer(item.readyAt)))bad();};
 for(const c of s.cells){if(!c||typeof c.locked!=='boolean'||c.locked&&c.item!==null)bad();check(c.item);}s.storage.forEach(item=>{check(item);if(item&&ITEMS[item.definition].producer)bad();});
 const orderIds=new Set<string>();for(const o of s.orders){if(!o||typeof o.id!=='string'||!/^order-\d+$/.test(o.id)||orderIds.has(o.id)||!integer(Number(o.id.slice(6)),1,s.sequence)||!integer(o.template,0,19)||!CUSTOMERS.includes(o.customer)||!integer(o.coins,1,10000)||!integer(o.xp,1,1000)||!Array.isArray(o.needs)||o.needs.length<1||o.needs.length>4)bad();orderIds.add(o.id);for(const n of o.needs)if(!known(n.definition)||ITEMS[n.definition].producer||!integer(n.count,1,10))bad();}
 return structuredClone(s);
}
