import type { GameState,Result } from './model.ts';
export class AudioEngine {
 private context?:AudioContext;private timer?:number;private note=0;
 unlock(){try{this.context??=new AudioContext();void this.context.resume().catch(()=>{});}catch{}}
 private play(frequency:number,duration=.15,volume=.04){const c=this.context;if(!c||c.state!=='running')return;const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(volume,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration);}
 effect(event:Result['event'],enabled:boolean){if(!enabled||document.hidden)return;this.unlock();if(event==='merge'){this.play(659);setTimeout(()=>this.play(880,.23),75);}else if(event==='order'||event==='reward'){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.play(f,.24),i*80));}else if(event==='produce')this.play(440,.08,.018);}
 sync(settings:GameState['settings']){if(this.timer){clearInterval(this.timer);this.timer=undefined;}if(settings.music&&!document.hidden){const notes=[523,659,784,659,587,698,880,698];this.timer=window.setInterval(()=>this.play(notes[this.note++%notes.length],.55,.012),650);}}
}
