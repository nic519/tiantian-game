import {COLS,ROWS,ITEMS} from './content.ts';
import type {GameState,Result} from './model.ts';
import {itemUrl} from './art.ts';
const W=744,H=950,PAD=10,CW=(W-PAD*2)/COLS,CH=(H-PAD*2)/ROWS;
export class Board {
 selected:number|null=null;onSelect:(index:number)=>void=()=>{};onMove:(from:number,to:number)=>void=()=>{};private focused=0;
 private state:GameState;private ctx:CanvasRenderingContext2D;private images=new Map<string,HTMLImageElement>();private background=new Image();
 private pointer:{id:number;index:number;x:number;y:number;startX:number;startY:number;drag:boolean}|null=null;private hover=-1;private effects:{index:number;at:number;merge:boolean}[]=[];private frame=0;
 private canvas:HTMLCanvasElement;
 constructor(canvas:HTMLCanvasElement,state:GameState){this.canvas=canvas;this.state=state;this.ctx=canvas.getContext('2d')!;this.background.src='/assets/original/board-mint.png';this.background.onload=()=>this.draw();
  new ResizeObserver(()=>this.resize()).observe(canvas);this.resize();
  canvas.addEventListener('pointerdown',e=>{if(this.pointer||e.button!==0)return;const p=this.point(e),index=this.index(p.x,p.y);if(index<0)return;this.focused=index;this.pointer={id:e.pointerId,index,x:p.x,y:p.y,startX:p.x,startY:p.y,drag:false};canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});});
  canvas.addEventListener('pointermove',e=>{const p=this.pointer;if(!p||p.id!==e.pointerId)return;const q=this.point(e);p.x=q.x;p.y=q.y;p.drag||=Math.hypot(p.x-p.startX,p.y-p.startY)>12;this.hover=this.index(p.x,p.y);this.draw();});
  canvas.addEventListener('pointerup',e=>{const p=this.pointer;if(!p||p.id!==e.pointerId)return;this.pointer=null;this.hover=-1;const q=this.point(e),index=this.index(q.x,q.y);if(p.drag){if(index>=0&&index!==p.index)this.onMove(p.index,index);}else if(index===p.index)this.onSelect(index);this.draw();});
  const cancel=()=>{this.pointer=null;this.hover=-1;this.draw();};canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',cancel);window.addEventListener('blur',cancel);
  canvas.addEventListener('keydown',e=>{const step:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-COLS,ArrowDown:COLS};if(e.key in step){e.preventDefault();this.focused=Math.max(0,Math.min(COLS*ROWS-1,this.focused+step[e.key]));this.draw();canvas.setAttribute('aria-label',this.label(this.focused));}else if(e.key==='Enter'||e.key===' '){e.preventDefault();this.onSelect(this.focused);}else if(e.key==='Escape'){this.selected=null;this.draw();}});
 }
 private point(e:PointerEvent){const r=this.canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
 private index(x:number,y:number){if(x<PAD||y<PAD||x>=W-PAD||y>=H-PAD)return -1;return Math.floor((y-PAD)/CH)*COLS+Math.floor((x-PAD)/CW);}
 private resize(){const r=this.canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.max(1,Math.round(r.width*dpr));this.canvas.height=Math.max(1,Math.round(r.height*dpr));this.draw();}
 update(state:GameState,result?:Result){this.state=state;if(result?.ok&&result.target!==undefined&&['merge','produce'].includes(result.event??'')){this.effects.push({index:result.target,at:performance.now(),merge:result.event==='merge'});this.animate();}this.draw();}
 private animate(){if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=0;this.draw();if(this.effects.length)this.animate();});}
 private image(id:string){let img=this.images.get(id);if(!img){img=new Image();img.src=itemUrl(id);img.onload=()=>this.draw();this.images.set(id,img);}return img;}
 label(i:number){const c=this.state.cells[i];return `第${Math.floor(i/COLS)+1}行第${i%COLS+1}列，${c.locked?'待整理的位置':c.item?ITEMS[c.item.definition].name:'空位'}`;}
 draw(){const c=this.ctx;if(!c||!this.canvas.width)return;c.setTransform(this.canvas.width/W,0,0,this.canvas.height/H,0,0);c.clearRect(0,0,W,H);
  if(this.background.complete&&this.background.naturalWidth)c.drawImage(this.background,0,0,W,H);else{c.fillStyle='#acc9ad';c.fillRect(0,0,W,H);}
  const now=Date.now(),time=performance.now();this.effects=this.effects.filter(e=>time-e.at<650);
  for(let i=0;i<this.state.cells.length;i++){
   const cell=this.state.cells[i],x=PAD+(i%COLS+.5)*CW,y=PAD+(Math.floor(i/COLS)+.5)*CH;
   if(cell.locked){c.save();c.translate(x,y);c.fillStyle='#b2c8b0';c.beginPath();c.roundRect(-CW/2+2,-CH/2+2,CW-4,CH-4,10);c.fill();c.fillStyle='#e3d5ad';c.strokeStyle='#a9a383';c.lineWidth=2;c.beginPath();c.roundRect(-30,-28,60,58,9);c.fill();c.stroke();c.strokeStyle='#c6b889';c.lineWidth=4;for(const off of [-15,0,15]){c.beginPath();c.moveTo(off,-24);c.lineTo(off,25);c.stroke();}c.strokeStyle='#efdcb6';c.lineWidth=7;c.beginPath();c.moveTo(-24,20);c.lineTo(24,-20);c.stroke();c.fillStyle='#f9f1d6';c.beginPath();c.roundRect(-10,-6,20,19,4);c.fill();c.strokeStyle='#b4a37d';c.lineWidth=3;c.beginPath();c.arc(0,-7,6,Math.PI,0);c.stroke();c.fillStyle='#9f9474';c.fillRect(-1,1,2,5);c.restore();}
   const selected=this.selected===i,hovered=this.hover===i,focused=this.focused===i&&document.activeElement===this.canvas;if(selected||hovered||focused){c.strokeStyle=hovered?'#ffffff':selected?'#e5b751':'#7f9f8a';c.lineWidth=selected?5:3;c.beginPath();c.roundRect(PAD+i%COLS*CW+3,PAD+Math.floor(i/COLS)*CH+3,CW-6,CH-6,13);c.stroke();}
   if(cell.item&&!(this.pointer?.drag&&this.pointer.index===i)){
    const image=this.image(cell.item.definition);const pulse=this.effects.find(e=>e.index===i);const progress=pulse?(time-pulse.at)/650:1;const scale=pulse?1+Math.sin(progress*Math.PI)*.16:1;
    if(image.complete&&image.naturalWidth)c.drawImage(image,x-45*scale,y-48*scale,90*scale,90*scale);
    if(ITEMS[cell.item.definition].producer){c.fillStyle='#ffe3a1';c.strokeStyle='#b5a06b';c.lineWidth=1;c.beginPath();c.arc(x+30,y-30,12,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#ad7b31';c.font='bold 17px sans-serif';c.textAlign='center';c.fillText('ϟ',x+30,y-24);if((cell.item.readyAt??0)>now){c.fillStyle='#557265df';c.beginPath();c.roundRect(x-29,y+20,58,25,9);c.fill();c.fillStyle='white';c.font='bold 16px sans-serif';c.fillText(`${Math.ceil((cell.item.readyAt!-now)/1000)}s`,x,y+38);}}
    else{c.fillStyle='#ffffffaa';c.beginPath();c.arc(x+32,y+31,10,0,Math.PI*2);c.fill();c.fillStyle='#668371';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText(String(ITEMS[cell.item.definition].level),x+32,y+36);}
   }
  }
  for(const effect of this.effects){if(!effect.merge)continue;const p=(time-effect.at)/650,x=PAD+(effect.index%COLS+.5)*CW,y=PAD+(Math.floor(effect.index/COLS)+.5)*CH;c.globalAlpha=1-p;for(let i=0;i<9;i++){const a=i*Math.PI*2/9;c.fillStyle=i%2?'#fff7d2':'#f9cb69';c.beginPath();c.arc(x+Math.cos(a)*(15+p*75),y+Math.sin(a)*(15+p*75),4*(1-p)+1,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
  const p=this.pointer;if(p?.drag){const item=this.state.cells[p.index]?.item;if(item){const img=this.image(item.definition);if(img.complete)c.drawImage(img,p.x-54,p.y-62,108,108);}}
 }
}
