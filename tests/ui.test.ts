import {test} from 'node:test';import assert from 'node:assert/strict';import {JSDOM} from 'jsdom';
import {createGame} from '../src/game/model.ts';
import {Session} from '../src/game/session.ts';import {GameUI} from '../src/game/ui.ts';
test('actual controls complete three orders and keyboard merging, storage and settings work in a DOM simulation',async()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'https://tiantian.test',pretendToBeVisual:true});const w=dom.window;
 const original=new Map<string,PropertyDescriptor|undefined>();
 for(const [name,value] of Object.entries({window:w,document:w.document,navigator:w.navigator,localStorage:w.localStorage,Image:w.Image,requestAnimationFrame:w.requestAnimationFrame.bind(w),ResizeObserver:class{observe(){}},devicePixelRatio:1})){original.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});}
 const context=new Proxy({},{get:()=>()=>{},set:()=>true});w.HTMLCanvasElement.prototype.getContext=()=>context as any;w.HTMLCanvasElement.prototype.setPointerCapture=()=>{};
 w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:744,bottom:950,width:744,height:950,toJSON(){return {};}});
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 Object.defineProperty(w.navigator,'locks',{value:{request:async(_name:unknown,_opts:unknown,callback:any)=>callback({})},configurable:true});
 let saved=createGame(Date.now());const store={load:async()=>({state:saved,recovered:false}),save:async(s:any)=>{saved=structuredClone(s);},replace:async(s:any)=>{saved=structuredClone(s);},rawBackup:async()=>JSON.stringify(saved)};
 try{
  const session=new Session(store);const ui=new GameUI(w.document.querySelector('#app')!,session);await ui.start();
  const click=(selector:string)=>{const el=w.document.querySelector<HTMLElement>(selector);assert.ok(el,selector);el.click();};
  click('[data-action="start"]');click('#orders .order-submit');
  // Submit the second original order explicitly.
  const second=w.document.querySelectorAll<HTMLElement>('#orders .order-submit')[1];second.click();
  const canvas=w.document.querySelector('canvas')!;
  const key=(value:string)=>canvas.dispatchEvent(new w.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true}));
  key('ArrowDown');key('ArrowDown');key('ArrowRight');key('ArrowRight');key('ArrowRight');key('Enter');key('ArrowRight');key('Enter');
  assert.equal(session.state.cells[17].item,null);assert.equal(session.state.cells[18].item?.definition,'fruit-2');
  w.document.querySelectorAll<HTMLElement>('#orders .order-submit')[2].click();assert.equal(session.state.completed,3);assert.equal(w.document.querySelector('#order-count')!.textContent,'3');
  click('[data-action="home"]');click('[data-action="renovate"]');assert.equal(session.state.renovated,1);click('[data-action="close"]');
  click('[data-action="settings"]');click('[data-action="sound"]');assert.equal(session.state.settings.sound,false);click('[data-action="close"]');
  key('ArrowLeft');key('ArrowLeft');key('ArrowLeft');key('ArrowLeft');key('ArrowUp');key('Enter');
  // Also check a canceled pointer drag never changes persisted item identities.
  const before=JSON.stringify(session.state.cells);for(const [type,x,y] of [['pointerdown',165,165],['pointermove',268,165],['pointercancel',268,165]] as const){const e=new w.Event(type,{bubbles:true});Object.assign(e,{pointerId:1,button:0,clientX:x,clientY:y});canvas.dispatchEvent(e);}assert.equal(JSON.stringify(session.state.cells),before);
  await new Promise(r=>setTimeout(r,0));assert.equal(saved.completed,3);
  const fresh=createGame(Date.now());fresh.tutorialDone=true;await session.import(JSON.stringify(fresh));
  for(const [type,pointerId,x,y] of [['pointerdown',1,165,165],['pointerdown',2,372,165],['pointermove',1,268,165],['pointerup',1,268,165]] as const){const e=new w.Event(type,{bubbles:true});Object.assign(e,{pointerId,button:0,clientX:x,clientY:y});canvas.dispatchEvent(e);}
  assert.equal(session.state.cells[8].item,null);assert.equal(session.state.cells[9].item?.definition,'cake-2');
 }finally{await new Promise(r=>setTimeout(r,0));w.close();for(const [name,descriptor] of original){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete (globalThis as any)[name];}}
});
test('newly acquired ownership reloads progress before saving or accepting commands',async()=>{
 const dom=new JSDOM('',{url:'https://tiantian.test'});const original=new Map<string,PropertyDescriptor|undefined>();for(const [name,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator})){original.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true});}
 Object.defineProperty(dom.window.navigator,'locks',{value:{request:async(_n:unknown,_o:unknown,cb:any)=>cb({})}});
 try{let reads=0;let persisted=0;const s=new Session({load:async()=>{const state=createGame(Date.now());state.coins=++reads===1?120:999;return {state,recovered:false};},save:async state=>{persisted=state.coins;},replace:async()=>{},rawBackup:async()=>'{}'});await s.start();assert.equal(s.state.coins,999);assert.equal(persisted,999);}finally{dom.window.close();for(const [name,d] of original){if(d)Object.defineProperty(globalThis,name,d);else delete (globalThis as any)[name];}}
});
test('browsers without Web Locks stay read only instead of taking over stale state',async()=>{
 const dom=new JSDOM('',{url:'https://tiantian.test'});const original=new Map<string,PropertyDescriptor|undefined>();for(const [name,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator})){original.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true});}
 try{const s=new Session({load:async()=>({state:createGame(1),recovered:false}),save:async()=>{},replace:async()=>{},rawBackup:async()=>'{}'});await s.start();assert.equal(s.writable,false);assert.equal(s.send({type:'produce',cell:0}).ok,false);}finally{dom.window.close();for(const [name,d] of original){if(d)Object.defineProperty(globalThis,name,d);else delete (globalThis as any)[name];}}
});
