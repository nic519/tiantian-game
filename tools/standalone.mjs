import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();const dist=path.join(root,'dist');
let html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const sources=new Map();
for(const file of fs.readdirSync(path.join(root,'public/assets/original'))){const abs=path.join(root,'public/assets/original',file);const mime=file.endsWith('.png')?'image/png':'image/svg+xml';sources.set('/assets/original/'+file,`data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`);}
const inline=s=>{for(const [key,value] of sources)s=s.replaceAll(key,value);return s;};
html=html.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g,(_,src)=>{const js=inline(fs.readFileSync(path.join(dist,src.replace(/^\//,'')),'utf8'));return '<script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script>';});
html=html.replace(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,(_,src)=>'<style>'+fs.readFileSync(path.join(dist,src.replace(/^\//,'')),'utf8')+'</style>');
html=inline(html);fs.writeFileSync(path.join(dist,'tiantian-play.html'),html);
console.log(`Standalone: dist/tiantian-play.html (${Buffer.byteLength(html)} bytes)`);
