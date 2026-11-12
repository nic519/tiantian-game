import {ITEMS} from './content.ts';
const strawberry=(x=50,y=46,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-15-10 Q-26 2-11 19 Q0 32 12 18 Q28 1 15-10 Q0-17-15-10" fill="#ed627d" stroke="#c83d61" stroke-width="2"/><path d="m-14-11 8-7 6 6 7-9 4 9 9 2-14 5Z" fill="#6f9d60"/><g fill="#ffe6ad"><ellipse cx="-8" cy="2" rx="1.4" ry="2"/><ellipse cx="6" cy="4" rx="1.4" ry="2"/><ellipse cx="0" cy="15" rx="1.4" ry="2"/></g><path d="M-14-2q-4 7 2 12" fill="none" stroke="#ffa4b2" stroke-width="3" stroke-linecap="round"/></g>`;
const cherry=(x=50,y=22)=>`<path d="M${x} ${y}q-1-12 10-15" fill="none" stroke="#608958" stroke-width="2.5"/><circle cx="${x}" cy="${y+3}" r="7" fill="#d94f67"/><circle cx="${x-2}" cy="${y}" r="2" fill="#ffb0b9"/>`;
const wrapper=(body:string)=>`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="b" x2=".8" y2="1"><stop stop-color="#ffe6b7"/><stop offset="1" stop-color="#cc8a4f"/></linearGradient><linearGradient id="pink" x2=".8" y2="1"><stop stop-color="#fff4f6"/><stop offset="1" stop-color="#f4a4b6"/></linearGradient><linearGradient id="coffee" x2="0" y2="1"><stop stop-color="#d8b493"/><stop offset="1" stop-color="#9d654d"/></linearGradient><filter id="s" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="2" flood-color="#507167" flood-opacity=".19"/></filter></defs><ellipse cx="50" cy="86" rx="30" ry="5" fill="#69816c" opacity=".12"/><g filter="url(#s)" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
export function itemSvg(id:string):string {
 const def=ITEMS[id];if(!def)return wrapper('');const n=def.level;let body='';
 if(def.producer==='bakery')body=`<rect x="14" y="22" width="72" height="62" rx="14" fill="#ebcead" stroke="#c39172" stroke-width="2"/><path d="M16 39h68V29q0-10-10-10H26q-10 0-10 10Z" fill="#f6e6d2"/><rect x="22" y="44" width="56" height="31" rx="7" fill="#845d52"/><rect x="27" y="48" width="46" height="21" rx="5" fill="#cfa779"/><path d="M31 65q5-17 15 0m6 0q7-20 16 0" fill="url(#b)"/><circle cx="28" cy="30" r="4" fill="#cc8469"/><circle cx="40" cy="30" r="4" fill="#739f8b"/><path d="m61 8-5 9h7l-3 10 12-14h-8l4-5" fill="#ffd862" stroke="#e3a43f"/>`;
 else if(def.producer==='cafe')body=`<rect x="18" y="19" width="64" height="65" rx="12" fill="#8bbeb2" stroke="#5b9489" stroke-width="2"/><rect x="23" y="24" width="54" height="17" rx="6" fill="#cde8d6"/><circle cx="37" cy="32" r="4" fill="#f8db9a"/><path d="M62 30h7" stroke="#6a9d8a" stroke-width="4"/><rect x="29" y="45" width="43" height="31" rx="4" fill="#527c71"/><path d="M40 54h18v14q-9 9-18 0Z" fill="#fff3d7"/><path d="M47 41v10" stroke="#ccae76" stroke-width="5"/><rect x="28" y="77" width="46" height="4" rx="2" fill="#dfd9b9"/>`;
 else if(def.chain==='cake'){
  if(n===1)body=`<path d="M25 32q20-15 43 0 19 18 4 37-20 21-44 2-17-14-3-39Z" fill="url(#b)" stroke="#bf8e5b" stroke-width="2"/><path d="m34 42 3 3m25-6 3 2m-8 22 2 3m-27-8 3 1m14-25 2 3" stroke="#7d5141" stroke-width="5"/><path d="M29 36q-10 14-2 24" fill="none" stroke="#ffe7b8" stroke-width="4"/>`;
  else if(n===2)body=`<path d="m25 53 8 30q17 8 35 0l8-30" fill="#e3a778" stroke="#bd835f" stroke-width="2"/><path d="m37 60 3 22m10-22v24m13-24-3 22" stroke="#f9d6a4" stroke-width="3"/><path d="M26 55q-11-15 7-18-3-15 12-15 5-17 15-5l-6 8q18-1 15 14 18 2 8 17Z" fill="url(#pink)" stroke="#d693a3" stroke-width="1.5"/>${cherry(51,15)}`;
  else if(n===3)body=`<ellipse cx="50" cy="56" rx="34" ry="27" fill="url(#b)" stroke="#bc895b" stroke-width="2"/><path d="M20 51q3-22 30-22 28 1 32 23l-7 12-9-5-8 8-9-6-11 4-8-8-8 5Z" fill="#f197af" stroke="#d06d8e" stroke-width="1.5"/><ellipse cx="50" cy="48" rx="12" ry="8" fill="#aa724e"/><path d="m30 44 4 2m29-3 4 3m-31 16 4-2m23-3 1 4" stroke="#fff3b7" stroke-width="3"/>`;
  else if(n===4)body=`<path d="m18 43 43-18 23 23-42 25Z" fill="#795245"/><path d="M18 43v25l24 17V62Z" fill="#a46f57"/><path d="m42 62 42-14v24L42 85Z" fill="#714a40"/><path d="m21 56 21 14 39-13" fill="none" stroke="#edc093" stroke-width="5"/><path d="m21 42 24 15 34-10-20-17Z" fill="#9c6251"/>${strawberry(52,31,.55)}`;
  else body=`<ellipse cx="50" cy="76" rx="36" ry="12" fill="#f1e8d3"/><path d="M20 43v28q30 22 60 0V43Z" fill="${n===5?'#e9a5b2':'#f4d0ab'}" stroke="#c59485" stroke-width="1.5"/><path d="M21 59q30 18 58 0" fill="none" stroke="#fff3dd" stroke-width="7"/><ellipse cx="50" cy="43" rx="30" ry="12" fill="url(#pink)"/><path d="M21 45v10q3 7 6 0v-6l6 4v7q5 8 8-1v-3q17 5 27-3v7q6 6 8-5v-8" fill="#fff0e9"/>${n===5?strawberry(50,33,.65):`${cherry(35,30)}${cherry(60,26)}<path d="M46 17v13" stroke="#f0c05a" stroke-width="4"/>`}${n===7?'<path d="m26 16 3-7 3 7 8 1-6 5 1 8-6-4-7 4 2-8-6-5Z" fill="#ffda72"/><path d="M70 9v22" stroke="#91b8c4" stroke-width="4"/>':''}`;
 }else if(def.chain==='drink'){
  if(n===1)body=`<path d="M26 37h41v31q-20 19-41 0Z" fill="#fff6e7" stroke="#cbb69a" stroke-width="2"/><path d="M67 44q24-2 17 17-3 9-17 5" fill="none" stroke="#d2bda1" stroke-width="7"/><ellipse cx="47" cy="38" rx="20" ry="7" fill="#885841"/><ellipse cx="47" cy="39" rx="14" ry="4" fill="#c18f5e"/><path d="m38 26-2-9m16 8 2-10" stroke="#fff5e8" stroke-width="3"/>`;
  else body=`<path d="m27 33 7 48q16 7 32 0l8-48Z" fill="${n<4?'url(#coffee)':n===4?'#946353':n===5?'#eca1b6':n===6?'#f0c29d':'#a4d0b7'}" stroke="#b6a58d" stroke-width="2"/><path d="m32 57 36-1m-34 9h31" stroke="${n<4?'#f7dbb5':'#f8dfcb'}" stroke-width="7"/><ellipse cx="50" cy="33" rx="24" ry="8" fill="#fff0da"/>${n>=3?'<path d="M28 31q-2-13 12-13 3-15 14-8l-2 6q19-1 15 13Z" fill="url(#pink)"/>':''}<path d="m58 10-5 30" stroke="${n%2?'#cf7996':'#87b3a2'}" stroke-width="4"/>${n>=5?strawberry(36,29,.43):'<path d="M39 34q10-7 20 0" fill="none" stroke="#bf9669" stroke-width="2"/>'}`;
 }else{
  if(n===1)body=strawberry(50,48,1.2);
  else if(n===2)body=`${strawberry(37,54,.9)}${strawberry(64,40,.85)}`;
  else if(n===3)body=`<path d="M19 52h64q-4 30-32 30-27-1-32-30" fill="#e7dbed" stroke="#a9a0c0" stroke-width="2"/>${[32,48,64,39,57].map((x,i)=>`<circle cx="${x}" cy="${42+i%2*10}" r="11" fill="${i%2?'#8794be':'#7281b0'}"/><path d="m${x-3} ${40+i%2*10} 3-3 3 3-3 3Z" fill="#bdc5d9"/>`).join('')}`;
  else body=`<ellipse cx="50" cy="75" rx="35" ry="9" fill="#eee3d0"/>${n===5?'<path d="m30 45 9 35h23l9-35Z" fill="#b5d8d7" stroke="#86b5b2" stroke-width="2"/>':'<path d="M18 53q4 30 32 30t32-30Z" fill="url(#b)" stroke="#cda278" stroke-width="2"/>'}<ellipse cx="50" cy="51" rx="29" ry="12" fill="#fff2d5"/>${strawberry(37,41,.66)}${strawberry(61,38,.7)}<circle cx="48" cy="53" r="8" fill="#8494bd"/><circle cx="69" cy="56" r="6" fill="#7f8ab4"/>${n>=6?'<path d="m44 21 6-12 6 12-6-3Z" fill="#87aa6a"/>':''}`;
 }
 return wrapper(body);
}
export const itemUrl=(id:string)=>`data:image/svg+xml;charset=utf-8,${encodeURIComponent(itemSvg(id))}`;
export const icons:Record<string,string>={
 gear:'<path d="m9 3 1-2h4l1 2 2 1 2-1 2 3-1 2v3l1 2-2 3-2-1-2 1-1 2h-4l-1-2-2-1-2 1-2-3 1-2V8L3 6l2-3 2 1Z"/><circle cx="12" cy="9" r="3"/>',
 home:'<path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7"/>',
 merge:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="m14 18 3 3 5-6"/>',
 book:'<path d="M3 4q5-2 9 1 4-3 9-1v15q-5-2-9 1-4-3-9-1ZM12 5v15"/>',
 bag:'<path d="M4 8h16l-1 13H5ZM8 8V6a4 4 0 0 1 8 0v2M8 13h8"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 arrow:'<path d="m8 4 8 8-8 8"/>',
 star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
 lightning:'<path d="m14 2-9 12h6l-1 8 9-12h-6Z"/>',
 music:'<path d="M9 17V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M14 7h-4v10h4M8 10h6M8 14h6"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 help:'<circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5M12 17h.01"/>',
 leaf:'<path d="M20 3c-9-1-17 2-16 10s14 9 16-10ZM5 19 16 8"/>'
};
export const icon=(name:string,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]??icons.star}</svg>`;
