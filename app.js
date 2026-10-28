// OmniFuse Document Workspace — built on the original OmniFuse Studio, with credited contributors.
const $=s=>document.querySelector(s),uid=()=>Math.random().toString(36).slice(2,9),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={g(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const SZ={a4:[595.28,841.89],letter:[612,792],legal:[612,1008]},MG={none:0,compact:24,standard:48,wide:72},THEMES=['paper','ink','mint','sky'];
const fsz=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(1)+' MB';
let items=[],sel=null,hist=[],future=[],exps=[],q='',cat='all',busy=false,seq=0,dragId=null;
const MAX_FILES=50;let projectBusy=false;
let S=Object.assign({name:'OmniFuse-Merged',title:'Merged document',author:'OmniFuse Studio',fmt:'pdf',size:'a4',ori:'portrait',margin:'standard',nums:true,toc:false,wm:'',q:.92,dir:'vertical',gap:16,bg:'#ffffff'},LS.g('of_s',{}));
let theme=LS.g('of_pro_theme',matchMedia('(prefers-color-scheme: dark)').matches?'ink':'paper');if(!THEMES.includes(theme))theme='paper';document.documentElement.dataset.theme=theme;
const PRE=[
 ['Standard PDF',{fmt:'pdf',size:'a4',ori:'portrait',margin:'standard',nums:true,toc:false,wm:''}],
 ['Report binder',{fmt:'pdf',size:'a4',ori:'portrait',margin:'standard',nums:true,toc:true,wm:''}],
 ['Image strip',{fmt:'png',dir:'vertical',gap:12,bg:'#ffffff'}],
 ['Contact sheet',{fmt:'jpeg',dir:'grid',gap:20,q:.9,bg:'#ffffff'}],
 ['Archive ZIP',{fmt:'zip',toc:true}]
];
const O=(...a)=>a.map(x=>[x,x[0].toUpperCase()+x.slice(1)]);
const F=[['name','File name','t'],['title','Document title','t'],['author','Author','t'],['fmt','Export format','s',[['pdf','PDF document'],['png','Stitched PNG'],['jpeg','Stitched JPEG'],['zip','ZIP package']]],['size','Page size','s',[['a4','A4'],['letter','US Letter'],['legal','Legal'],['auto','Auto-fit']]],['ori','Orientation','s',O('portrait','landscape','auto')],['margin','Page margins','s',O('none','compact','standard','wide')],['dir','Image layout','s',[['vertical','Vertical'],['horizontal','Horizontal'],['grid','2-column grid']]],['gap','Spacing (px)','n'],['q','Image quality','r'],['bg','Background','c'],['wm','Watermark','t'],['nums','Page numbers','b'],['toc','Contents page','b']];
// Notification helper is deliberately quiet: no animated character interrupts the work.
function say(message){toast(message)}
function range(s,n){s=(s||'all').trim().toLowerCase();const all=[...Array(n).keys()];if(!s||s==='all')return all;const o=[];for(const p of s.split(',')){const m=p.trim().match(/^(\d+)(?:-(\d+))?$/);if(!m)continue;let a=+m[1],b=+(m[2]||m[1]);if(a>b)[a,b]=[b,a];for(let i=Math.max(1,a);i<=Math.min(n,b);i++)o.push(i-1)}return o.length?o:all}
const pgs=i=>i.cat==='pdf'?range(i.range,i.pages).length:i.cat==='text'?Math.max(1,Math.ceil(i.text.split('\n').length/46)):1;
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
function cardCv(name,tag,col){const c=cv(240,300),x=c.getContext('2d'),g=x.createLinearGradient(0,0,240,300);g.addColorStop(0,'#fff');g.addColorStop(1,col+'66');x.fillStyle=g;x.fillRect(0,0,240,300);x.fillStyle=col;x.font='700 64px sans-serif';x.textAlign='center';x.fillText(tag,120,150);x.fillStyle='#333';x.font='600 15px sans-serif';x.fillText(name.length>26?name.slice(0,24)+'…':name,120,200);return c}
function small(img,n){const k=Math.min(1,n/Math.max(img.width,img.height)),c=cv(img.width*k,img.height*k),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.8)}
function rot(i){const r=i.rot,s=i.img,w=r%180?s.height:s.width,h=r%180?s.width:s.height,c=cv(w,h),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.translate(w/2,h/2);x.rotate(r*Math.PI/180);x.drawImage(s,-s.width/2,-s.height/2);return c}
function crop(c,ar){let w=c.width,h=c.height;if(w/h>ar)w=h*ar;else h=w/ar;const o=cv(w,h);o.getContext('2d').drawImage(c,(c.width-w)/2,(c.height-h)/2,w,h,0,0,o.width,o.height);return o}
async function parse(f){const ext=(f.name.split('.').pop()||'').toLowerCase(),b={id:uid(),name:f.name,size:f.size,ext,range:'all',rot:0,fit:'contain',note:'',file:f,at:++seq};
if(f.type==='application/pdf'||ext==='pdf'){
if(!window.PDFLib)throw new Error('PDF engine unavailable');
const bytes=new Uint8Array(await f.arrayBuffer()),d=await PDFLib.PDFDocument.load(bytes);
const o={...b,cat:'pdf',bytes,pages:d.getPageCount(),thumb:cardCv(f.name,'PDF','#ff4f7b').toDataURL()};
try{if(window.pdfjsLib){const c=await renderPdfPage(bytes,1,320);o.thumb=c.toDataURL('image/jpeg',.78)}}catch(e){console.warn('PDF cover preview unavailable',e)}return o}

if(f.type.startsWith('image/')){const img=await createImageBitmap(f);return{...b,cat:'image',img,pages:1,thumb:small(img,360)}}
if(f.type.startsWith('text/')||/^(txt|md|csv|log|json)$/.test(ext)){const text=await f.text();return{...b,cat:'text',text,pages:1,thumb:cardCv(f.name,'TXT','#6c5ce7').toDataURL()}}throw 0}
async function ingest(files,quiet){const add=[];for(const f of files){if(items.length+add.length>=MAX_FILES){say('The queue holds 50 files max.','think');break}
try{const it=await parse(f);if(!quiet&&[...items,...add].some(x=>x.name===it.name&&x.size===it.size)&&!confirm(it.name+' is already in the queue. Add it again?'))continue;add.push(it)}catch(e){console.warn('Cannot add file',f.name,e);toast('Could not read '+f.name+'. Check the format or password.');say('I could not read '+f.name+'. Try a PDF, image or text file.','think')}}
if(add.length){snap();items.push(...add);sel=sel||add[0].id;refresh();say(add.length+' file'+(add.length>1?'s':'')+' added. Nice!','wow')}}
const capture=()=>items.map(x=>({...x}));
const snap=()=>{hist.push(capture());future=[];if(hist.length>30)hist.shift()};
function undo(){if(!hist.length)return say('Nothing to undo.','think');future.push(capture());items=hist.pop();if(!items.some(x=>x.id===sel))sel=items[0]?.id||null;refresh();say('Undone!','wink')}
function redo(){if(!future.length)return say('Nothing to redo.','think');hist.push(capture());items=future.pop();if(!items.some(x=>x.id===sel))sel=items[0]?.id||null;refresh();say('Redone!','wink')}
const vis=()=>items.filter(i=>(cat==='all'||i.cat===cat)&&i.name.toLowerCase().includes(q));
function refresh(){renderQ();renderPrev();const pages=items.reduce((a,i)=>a+pgs(i),0)+(S.toc&&(S.fmt==='pdf'||S.fmt==='zip')?1:0),bytes=items.reduce((a,i)=>a+i.size,0);
$('#meta').textContent=items.length?`${items.length} files · ${pages} pages · ${fsz(bytes)}`:'No files added';
$('#count').textContent=items.length;$('#mobileCount').textContent=items.length;$('#statFiles').textContent=String(items.length).padStart(2,'0');$('#statPages').textContent=String(pages).padStart(2,'0');$('#statSize').textContent=fsz(bytes);$('#statFormat').textContent={pdf:'PDF',png:'PNG',jpeg:'JPEG',zip:'ZIP'}[S.fmt]||'PDF';
$('#undo').disabled=hist.length===0;$('#redo').disabled=future.length===0;const active=items.length>0;
$('#mobileExport').disabled=!active;$('#expBottom').disabled=!active;$('#exp').disabled=!active;markPreset();toggleFields()}
const iconSvg=(name)=>({up:'<path d="m6 14 6-6 6 6"/>',down:'<path d="m6 10 6 6 6-6"/>',rotate:'<path d="M20 11a8 8 0 1 1-2.5-5.8M20 4v5h-5"/>',note:'<path d="M4 4h16v16H4zM7 9h10M7 13h7"/>',trash:'<path d="M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/>',file:'<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/>'}[name]||'');
const rowIcon=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${iconSvg(name)}</svg>`;
function renderQ(){const v=vis();$('#chips').innerHTML=[['all','All'],['pdf','PDF'],['image','Images'],['text','Text']].map(([k,l])=>`<button class="b${cat===k?' on':''}" data-c="${k}" aria-pressed="${cat===k}">${l}</button>`).join('');
$('#list').innerHTML=v.length?v.map(i=>`<div class="row${i.id===sel?' sel':''}" draggable="true" data-id="${i.id}" tabindex="0" aria-label="${esc(i.name)}"><img class="th" src="${i.thumb}" alt=""><div class="inf"><b class="nm" data-a="ren" title="Double click to rename">${esc(i.name)}</b><small>${i.cat.toUpperCase()} · ${pgs(i)} ${pgs(i)===1?'page':'pages'} · ${fsz(i.size)}${i.note?' · note added':''}</small><div class="ctl"><button data-a="up" aria-label="Move ${esc(i.name)} up" title="Move up">${rowIcon('up')}</button><button data-a="dn" aria-label="Move ${esc(i.name)} down" title="Move down">${rowIcon('down')}</button><button data-a="rot" aria-label="Rotate ${esc(i.name)}" title="Rotate 90°">${rowIcon('rotate')} ${i.rot}°</button>${i.cat==='image'?`<select data-a="fit" aria-label="Image fit for ${esc(i.name)}">${['contain','cover','original'].map(f=>`<option${f===i.fit?' selected':''}>${f}</option>`).join('')}</select>`:''}${i.cat==='pdf'?`<input data-a="rng" value="${esc(i.range)}" placeholder="1-3,5" title="PDF page range" aria-label="Page range for ${esc(i.name)}">`:''}<button data-a="note" aria-label="Add note to ${esc(i.name)}" title="File note">${rowIcon('note')}</button><button class="danger" data-a="del" aria-label="Remove ${esc(i.name)}" title="Remove file">${rowIcon('trash')}</button></div></div></div>`).join(''):`<div class="empty">${rowIcon('file')}<strong>${items.length?'No matching files':'Your queue is empty'}</strong><p>${items.length?'Try another filter or search term.':'Add a PDF, image or text file to start assembling your document.'}</p></div>`}
function sheet(i,big){if(!i)return`<div class="empty">${rowIcon('file')}<strong>Nothing to preview yet</strong><p>Add a file to see its first page here. Choose any item in your queue to inspect it.</p></div>`;const m=MG[S.margin],pdf=i.cat==='pdf';let R;
if(i.cat==='image'&&(S.size==='auto'||S.ori==='auto')){const w=i.rot%180?i.img.height:i.img.width,h=i.rot%180?i.img.width:i.img.height;if(S.size==='auto')R=w/h;else{const[a,b]=SZ[S.size];R=w>h?b/a:a/b}}else{const[a,b]=SZ[S.size]||SZ.a4;R=S.ori==='landscape'?b/a:a/b}
const[pa]=SZ[S.size]||SZ.a4,mi=pdf?0:m/pa*100,fit={contain:'contain',cover:'cover',original:'scale-down'}[i.fit],h=big?640:380;
const body=i.cat==='text'?`<pre>${esc(i.text.slice(0,1400))}</pre>`:`<img alt="" style="object-fit:${i.cat==='image'?fit:'contain'}" src="${pvUrl(i)}">`;
return`<div class="sheet" style="aspect-ratio:${R};width:min(100%,${Math.round(h*R)}px)"><div class="in" style="inset:${mi*R}% ${mi}%">${body}</div>${S.wm?`<div class="wm">${esc(S.wm)}</div>`:''}${S.nums?`<div class="pn">1 / ${pgs(i)}</div>`:''}</div>`}
function pvUrl(i){if(i.cat!=='image')return i.thumb;const c=rot(i),k=Math.min(1,700/Math.max(c.width,c.height)),o=cv(c.width*k,c.height*k);o.getContext('2d').drawImage(c,0,0,o.width,o.height);return o.toDataURL('image/jpeg',.8)}
function renderPrev(){const i=items.find(x=>x.id===sel);$('#prev').innerHTML=`<div class="preview-head"><div><div class="section-eyebrow">DOCUMENT VIEWER</div><h2>Live preview</h2></div><span class="preview-label">${i?`${pgs(i)} ${pgs(i)===1?'page':'pages'}`:'NO SELECTION'}</span></div><div class="preview-stage" id="sh" tabindex="${i?'0':'-1'}" role="${i?'button':'group'}" aria-label="${i?'Enlarge document preview':'Document preview'}" title="${i?'Click to enlarge':''}">${sheet(i)}</div><div class="preview-bottom"><small>${i?esc(i.name):'Selected document will appear here'}</small><span class="preview-hint">${i?'View first page · Click to zoom':'Preview updates as you work'}</span></div>`}
function dlg(h){const d=document.createElement('div');d.className='ov';d.innerHTML=`<div class="md c" role="dialog" aria-modal="true">${h}</div>`;d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-x]'))d.remove()});document.body.append(d);return d}
function mkSet(){
$('#pre').innerHTML=PRE.map((p,k)=>`<button class="b" data-p="${k}">${p[0]}</button>`).join('');
const makeField=([k,l,t,o])=>`<label data-key="${k}" class="${t==='b'?'ck':''}">${t==='b'?`<input data-k="${k}" type="checkbox">${l}`:l+(t==='s'?`<select data-k="${k}">${o.map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select>`:`<input data-k="${k}" type="${{t:'text',n:'number',r:'range',c:'color'}[t]}"${t==='r'?' min=".5" max="1" step=".01"':''}${t==='n'?' min="0" max="100"':''}>`)}</label>`;
const group=(keys,extra='')=>`<div class="field-group ${extra}" data-group="${keys.join('-')}">${F.filter(f=>keys.includes(f[0])).map(makeField).join('')}</div>`;
$('#fields').innerHTML=group(['fmt','name'])+group(['title','author'])+group(['size','ori'])+group(['margin','wm'])+group(['nums','toc'])+group(['dir','gap'])+group(['q','bg']);syncSet();toggleFields();markPreset()}
function syncSet(){document.querySelectorAll('[data-k]').forEach(e=>{const v=S[e.dataset.k];e.type==='checkbox'?e.checked=v:e.value=v})}
function toggleFields(){const img=S.fmt==='png'||S.fmt==='jpeg';document.querySelectorAll('#fields label[data-key]').forEach(el=>{const k=el.dataset.key,hidden=img?['title','author','size','ori','margin','nums','toc'].includes(k):['dir','gap','q','bg'].includes(k);el.hidden=hidden});
// Hide groups with no relevant inputs while retaining all preferences.
document.querySelectorAll('#fields .field-group').forEach(g=>g.hidden=![...g.querySelectorAll('label')].some(l=>!l.hidden))}
function markPreset(){document.querySelectorAll('#pre [data-p]').forEach(b=>{const conf=PRE[+b.dataset.p][1];b.classList.toggle('on',Object.entries(conf).every(([k,v])=>S[k]===v))})}
function dims(w,h,m){if(S.size==='auto'&&w)return[w*.75+2*m,h*.75+2*m];const[a,b]=SZ[S.size]||SZ.a4,land=S.ori==='landscape'||(S.ori==='auto'&&w>h);return land?[b,a]:[a,b]}
async function buildPdf(){if(!window.PDFLib)throw Error('PDF engine unavailable. Reload with an internet connection.');const out=await PDFLib.PDFDocument.create(),font=await out.embedFont(PDFLib.StandardFonts.Helvetica),bold=await out.embedFont(PDFLib.StandardFonts.HelveticaBold),{rgb,degrees}=PDFLib,m=MG[S.margin],starts=[],clean=s=>String(s).replace(/\t/g,'    ').replace(/[^\x20-\x7E\u00A0-\u00FF]/g,'?');
out.setTitle(S.title);out.setAuthor(S.author);out.setProducer('OmniFuse Studio');
for(const it of items){starts.push(out.getPageCount());
if(it.cat==='pdf'){const src=await PDFLib.PDFDocument.load(it.bytes,{ignoreEncryption:true});(await out.copyPages(src,range(it.range,it.pages))).forEach(p=>{if(it.rot)p.setRotation(degrees((p.getRotation().angle+it.rot)%360));out.addPage(p)})}
else if(it.cat==='image'){const c=rot(it),[pw,ph]=dims(c.width,c.height,m),bw=pw-2*m,bh=ph-2*m;let c2=c,dw,dh;
if(it.fit==='cover'){c2=crop(c,bw/bh);dw=bw;dh=bh}else{const k=it.fit==='original'?Math.min(.75,bw/c.width,bh/c.height):Math.min(bw/c.width,bh/c.height);dw=c.width*k;dh=c.height*k}
const bl=await new Promise(r=>c2.toBlob(r,'image/jpeg',S.q)),im=await out.embedJpg(new Uint8Array(await bl.arrayBuffer())),p=out.addPage([pw,ph]);p.drawImage(im,{x:(pw-dw)/2,y:(ph-dh)/2,width:dw,height:dh})}
else{const[pw,ph]=dims(0,0,m),mm=Math.max(m,40),fs=11,lh=15,mw=pw-2*mm,L=[];
clean(it.text).split('\n').forEach(par=>{let ln='';for(const w of par.split(' ')){const t=ln?ln+' '+w:w;if(font.widthOfTextAtSize(t,fs)>mw&&ln){L.push(ln);ln=w}else ln=t}L.push(ln)});
const per=Math.floor((ph-2*mm-30)/lh);for(let k=0;k===0||k<L.length;k+=per){const p=out.addPage([pw,ph]);let y0=ph-mm;if(k===0){p.drawText(clean(it.name),{x:mm,y:y0-4,size:15,font:bold});y0-=30}L.slice(k,k+per).forEach((t,j)=>p.drawText(t,{x:mm,y:y0-j*lh,size:fs,font}))}}}
if(S.toc){const p=out.insertPage(0,SZ.a4);p.drawText(clean(S.title),{x:50,y:790,size:22,font:bold});items.slice(0,44).forEach((it,k)=>{p.drawText(clean(`${k+1}. ${it.name}${it.note?' - '+it.note:''}`).slice(0,78),{x:50,y:750-k*16,size:10.5,font});const t='p. '+(starts[k]+2);p.drawText(t,{x:545-font.widthOfTextAtSize(t,10.5),y:750-k*16,size:10.5,font})})}
const ps=out.getPages(),n=ps.length;ps.forEach((p,i)=>{const{width:w,height:h}=p.getSize();
if(S.nums){const t=`${i+1} / ${n}`;p.drawText(t,{x:w/2-font.widthOfTextAtSize(t,9)/2,y:16,size:9,font,color:rgb(.45,.45,.5)})}
if(S.wm){const t=clean(S.wm),sz=Math.min(w,h)/8,tw=bold.widthOfTextAtSize(t,sz),k=Math.SQRT1_2;p.drawText(t,{x:w/2-tw/2*k,y:h/2-tw/2*k-sz/3,size:sz,font:bold,color:rgb(.75,.1,.1),opacity:.15,rotate:degrees(45)})}});
return{bytes:await out.save(),pages:n}}
async function renderPdfPage(bytes,pageNumber=1,targetWidth=1000){
const pdfjs=window.pdfjsLib;if(!pdfjs)throw new Error('PDF preview engine could not load. Connect to the internet and reload.');
if(pdfjs.GlobalWorkerOptions)pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const doc=await pdfjs.getDocument({data:new Uint8Array(bytes),disableFontFace:false}).promise;
try{const page=await doc.getPage(pageNumber),base=page.getViewport({scale:1}),scale=Math.min(3,targetWidth/base.width),v=page.getViewport({scale}),c=cv(v.width,v.height);c.getContext('2d').fillStyle='#fff';c.getContext('2d').fillRect(0,0,c.width,c.height);await page.render({canvasContext:c.getContext('2d'),viewport:v}).promise;return c}
finally{await doc.destroy()}}
function wrapCanvasText(text,name){const frames=[],width=900,height=1200,pad=67,maxY=height-pad,x=pad,lh=25;let c=cv(width,height),ctx=c.getContext('2d'),y=pad;
const start=()=>{ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);ctx.fillStyle='#1c2540';ctx.font='700 27px sans-serif';ctx.fillText(name.slice(0,40),x,y);y+=55;ctx.fillStyle='#283048';ctx.font='17px monospace'};
const next=()=>{frames.push(c);c=cv(width,height);ctx=c.getContext('2d');y=pad;start()};start();
for(const para of text.replace(/\t/g,'    ').split('\n')){let line='';for(const word of para.split(/\s+/)){const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width>width-pad*2&&line){if(y+lh>=maxY)next();ctx.fillText(line,x,y);y+=lh;line=word}else line=candidate}if(y+lh>=maxY)next();ctx.fillText(line,x,y);y+=lh}frames.push(c);return frames}
async function prepareFrames(){const frames=[];for(const i of items){
if(i.cat==='image'){frames.push(rot(i));continue}
if(i.cat==='text'){frames.push(...wrapCanvasText(i.text,i.name));continue}
if(i.cat==='pdf'){for(const p of range(i.range,i.pages)){const page=await renderPdfPage(i.bytes,p+1,1000);frames.push(i.rot?rot({img:page,rot:i.rot}):page)}}
}return frames}
async function stitch(){const fr=await prepareFrames(),g=+S.gap||0,pos=[];let tw,th;
if(!fr.length)throw new Error('No pages to stitch');

if(S.dir==='vertical'){let y=0;fr.forEach(c=>{const h=c.height*1200/c.width;pos.push([0,y,1200,h]);y+=h+g});tw=1200;th=y-g}
else if(S.dir==='horizontal'){let x=0;fr.forEach(c=>{const w=c.width*1000/c.height;pos.push([x,0,w,1000]);x+=w+g});tw=x-g;th=1000}
else{const cw=800;let y=0;for(let i=0;i<fr.length;i+=2){const row=fr.slice(i,i+2).map(c=>c.height*cw/c.width),rh=Math.max(...row);row.forEach((h,j)=>pos.push([j*(cw+g),y,cw,h]));y+=rh+g}tw=2*cw+g;th=y-g}
const k=Math.min(1,Math.sqrt(30000000/(tw*th)),10000/th,10000/tw),c=cv(tw*k,th*k),x=c.getContext('2d');x.fillStyle=S.bg;x.fillRect(0,0,c.width,c.height);fr.forEach((f,i)=>x.drawImage(f,pos[i][0]*k,pos[i][1]*k,pos[i][2]*k,pos[i][3]*k));
if(S.wm.trim()){x.save();x.translate(c.width/2,c.height/2);x.rotate(-Math.PI/4);x.globalAlpha=.12;x.fillStyle='#bf3c64';x.textAlign='center';x.font=`900 ${Math.max(28,Math.min(c.width,c.height)/12)}px sans-serif`;x.fillText(S.wm.slice(0,70),0,0);x.restore()}
return c}
async function doExport(){if(busy)return;if(!items.length)return toast('Add at least one file to export');busy=true;const btn=$('#exp'),saveLabel=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span>Preparing…</span>';toast('Processing document…');
try{const base=(S.name.trim()||'omnifuse').replace(/[^\w-]+/g,'-');let blob,fn,pages=1;
if(S.fmt==='png'||S.fmt==='jpeg'){const c=await stitch(),mt=S.fmt==='png'?'image/png':'image/jpeg';blob=await new Promise(r=>c.toBlob(r,mt,S.q));if(!blob)throw new Error('Image export failed');fn=base+(S.fmt==='png'?'.png':'.jpg')}
else{const r=await buildPdf();pages=r.pages;if(S.fmt==='zip'){if(!window.JSZip)throw new Error('ZIP library unavailable');const z=new JSZip();z.file(base+'-merged.pdf',r.bytes);z.file('MANIFEST.md',[`# ${S.title}`,`By ${S.author} · ${new Date().toISOString()}`,`Files: ${items.length} · Pages: ${pages}`,'',...items.map((i,k)=>`${k+1}. **${i.name}** (${i.cat}, ${pgs(i)} pages, ${fsz(i.size)})${i.note?' - '+i.note:''}`)].join('\n'));const folder=z.folder('source-files');items.forEach((i,k)=>folder.file(String(k+1).padStart(2,'0')+'_'+i.name.replace(/[\/\\]/g,'_'),i.file));blob=await z.generateAsync({type:'blob'});fn=base+'.zip'}else{blob=new Blob([r.bytes],{type:'application/pdf'});fn=base+'.pdf'}}
const h={fn,blob,size:blob.size,pages,n:items.length};exps.unshift(h);showExp(h);toast('Export ready')}
catch(e){console.error('Export failed',e);toast('Export failed: '+(e?.message||'Please try again'))}
finally{busy=false;btn.disabled=false;btn.innerHTML=saveLabel;refresh()}}
async function save(h){downloadBlob(h.blob,h.fn)}
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)}
function showExp(h){const d=dlg(`<div class="ex"><span class="result-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></span><div><h2>Export complete</h2><div class="result-name">${esc(h.fn)}</div><span class="result-details">${h.n} source files · ${fsz(h.size)} · ready to download</span><button class="b p" id="dl">Download file</button><button class="b secondary" data-x>Close</button></div></div>${exps.length>1?'<div class="session-history"><h3>Previous exports this session</h3>'+exps.slice(1,6).map((x,k)=>`<div><button class="b secondary" data-e="${k+1}">${esc(x.fn)}</button> <small>${fsz(x.size)}</small></div>`).join('')+'</div>':''}`);
d.querySelector('#dl').onclick=()=>save(h);d.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>save(exps[+b.dataset.e]));}
async function demo(){if(!window.PDFLib){toast('PDF engine is loading. Check your connection.');return}
const d=await PDFLib.PDFDocument.create(),f=await d.embedFont(PDFLib.StandardFonts.HelveticaBold),normal=await d.embedFont(PDFLib.StandardFonts.Helvetica);
for(let i=1;i<=3;i++){const p=d.addPage(SZ.a4);p.drawText('PROJECT STATUS REPORT',{x:54,y:755,size:19,font:f});p.drawText('Page '+i+'  |  October 2026  |  Operations',{x:54,y:726,size:10,font:normal});p.drawLine({start:{x:54,y:708},end:{x:540,y:708},thickness:1});p.drawText('A sample report for testing PDF merging and page selection.',{x:54,y:665,size:11,font:normal})}
const note=new File(['Project meeting notes\n\n- Review the report\n- Arrange the files\n- Export the final document\n'],'Meeting-notes.txt',{type:'text/plain'});
await ingest([new File([await d.save()],'Project-report.pdf',{type:'application/pdf'}),note],true);toast('Sample documents added to the queue')}
// Focused onboarding for first-time users. Replay from Help at any time.
const TS=[
 {title:'Welcome to OmniFuse',x:'This is a focused workspace for combining PDFs, images and text into professional deliverables. Take a short guided tour or skip straight to work.'},
 {t:'#drop',title:'Import your documents',x:'Add PDFs, images or text files. You can also drag files onto the page, paste from your clipboard, or open sample documents.'},
 {t:'#list',title:'Organize your file queue',x:'Select, reorder, rotate and rename files. For PDFs, enter a page range such as 1-3,5 to include only the pages you need.'},
 {t:'#prev',title:'Check the preview',x:'Select a file to see its first page. Click the preview to enlarge it before exporting.'},
 {t:'#settings',title:'Set your output',x:'Choose a preset or adjust document format, page size, margins, metadata, watermark and numbering. You can also save the full project to continue later.'},
 {t:'#exp',title:'Export confidently',x:'Export to PDF, a stitched image or a ZIP archive. Your files are processed locally in the browser and are not uploaded to an OmniFuse server.'}
];
let ti=0;
function tut(n=0){ti=n;if(!$('#tut')){const e=document.createElement('div');e.id='tut';document.body.append(e)}tstep()}
function tstep(){const step=TS[ti];document.querySelectorAll('.spot').forEach(e=>e.classList.remove('spot'));
const target=step.t==='#exp'&&matchMedia('(max-width:790px)').matches?'#mobileExport':step.t;
const focus=target&&$(target);if(focus){focus.classList.add('spot');if(!focus.closest('.topbar,.mobile-dock'))focus.scrollIntoView({block:'nearest',behavior:'auto'})}
$('#tut').innerHTML=`<div class="tbg"></div><div class="tc" role="dialog" aria-modal="true" aria-label="OmniFuse product tour"><div class="tour-top"><span class="tour-badge">QUICK PRODUCT TOUR</span><span class="tour-count">${ti+1} of ${TS.length}</span></div><h2>${step.title}</h2><p>${step.x}</p><div class="tour-progress"><div style="width:${(ti+1)/TS.length*100}%"></div></div><div class="tour-actions"><button class="tour-skip" data-t="x">Skip tour</button>${ti?'<button class="b secondary" data-t="b">Back</button>':''}<button class="b p" data-t="n">${ti===TS.length-1?'Finish':'Next'} →</button></div></div>`}
function endTut(){document.querySelector('#tut')?.remove();document.querySelectorAll('.spot').forEach(e=>e.classList.remove('spot'));LS.s('of_pro_seen',1)}
const tnext=()=>ti<TS.length-1?(ti++,tstep()):endTut(),tback=()=>{if(ti){ti--;tstep()}};
document.addEventListener('click',e=>{const t=e.target.closest('[data-t]');if(t){const a=t.dataset.t;a==='x'?endTut():a==='b'?tback():tnext()}});
function mv(id,d){const i=items.findIndex(x=>x.id===id),j=i+d;if(j<0||j>=items.length)return;snap();[items[i],items[j]]=[items[j],items[i]];refresh()}
function rotSel(id){const i=items.find(x=>x.id===id);if(!i)return;snap();i.rot=(i.rot+90)%360;refresh()}
function delItem(id){snap();items=items.filter(x=>x.id!==id);if(sel===id)sel=items[0]?.id||null;refresh()}
const L=$('#list');
L.addEventListener('click',e=>{const r=e.target.closest('.row');if(!r)return;const id=r.dataset.id,a=e.target.closest('[data-a]')?.dataset.a;if(a==='up')mv(id,-1);else if(a==='dn')mv(id,1);else if(a==='rot')rotSel(id);else if(a==='del')delItem(id);else if(a==='note'){const i=items.find(x=>x.id===id),v=prompt('Note for '+i.name,i.note);if(v!==null){snap();i.note=v.trim();refresh()}}else if(a!=='fit'&&a!=='rng'&&a!=='ren'&&sel!==id){sel=id;renderQ();renderPrev()}else if(a==='ren'&&sel!==id){sel=id;renderQ();renderPrev()}});
L.addEventListener('change',e=>{const r=e.target.closest('.row'),a=e.target.dataset.a;if(!r)return;const i=items.find(x=>x.id===r.dataset.id);snap();if(a==='fit')i.fit=e.target.value;if(a==='rng')i.range=e.target.value.trim()||'all';sel=i.id;refresh()});
L.addEventListener('dblclick',e=>{const n=e.target.closest('[data-a=ren]');if(!n)return;const id=n.closest('.row').dataset.id,i=items.find(x=>x.id===id);n.contentEditable='plaintext-only';n.focus();getSelection().selectAllChildren(n);const done=()=>{n.contentEditable='false';const v=n.textContent.trim();if(v&&v!==i.name){snap();i.name=v}refresh()};n.onblur=done;n.onkeydown=k=>{if(k.key==='Enter'){k.preventDefault();n.blur()}if(k.key==='Escape'){n.textContent=i.name;n.blur()}}});
L.addEventListener('dragstart',e=>{dragId=e.target.closest('.row')?.dataset.id;e.target.closest('.row')?.classList.add('drag');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','row')});
L.addEventListener('dragend',()=>{dragId=null;renderQ()});
L.addEventListener('dragover',e=>{if(dragId)e.preventDefault()});
L.addEventListener('drop',e=>{const t=e.target.closest('.row');if(!dragId||!t||t.dataset.id===dragId)return;e.preventDefault();e.stopPropagation();snap();const from=items.findIndex(x=>x.id===dragId),to=items.findIndex(x=>x.id===t.dataset.id),[x]=items.splice(from,1);items.splice(to,0,x);dragId=null;refresh()});
$('#chips').addEventListener('click',e=>{const c=e.target.dataset.c;if(c){cat=c;renderQ()}});
$('#srch').oninput=e=>{q=e.target.value.toLowerCase();renderQ()};
$('#sort').onchange=e=>{const k=e.target.value,f={n:(a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}),s:(a,b)=>b.size-a.size,t:(a,b)=>a.cat.localeCompare(b.cat),d:(a,b)=>b.at-a.at};if(k){snap();k==='r'?items.reverse():items.sort(f[k]);refresh()}e.target.value=''};
$('#clr').onclick=()=>{if(items.length&&confirm('Remove all files from the queue? You can still undo.')){snap();items=[];sel=null;refresh()}};
$('#browse').onclick=()=>$('#file').click();$('#file').onchange=e=>{ingest([...e.target.files]);e.target.value=''};
$('#demo').onclick=demo;$('#undo').onclick=undo;$('#exp').onclick=doExport;$('#help').onclick=()=>tut(0);$('#guideInline').onclick=()=>tut(0);$('#footerHelp').onclick=()=>tut(0);
$('#theme').onclick=()=>{theme=THEMES[(THEMES.indexOf(theme)+1)%THEMES.length];document.documentElement.dataset.theme=theme;LS.s('of_pro_theme',theme);toast(({paper:'Light',ink:'Dark',mint:'Forest',sky:'Slate'})[theme]+' theme')};
$('#note').onclick=()=>{const d=dlg(`<h2>New text note</h2><p><input type="text" id="nt" placeholder="Title" aria-label="Note title"></p><p><textarea id="nb" rows="8" placeholder="Write your note…" aria-label="Note text"></textarea></p><button class="b p" id="na">Add to queue</button> <button class="b" data-x>Cancel</button>`);d.querySelector('#na').onclick=()=>{const t=d.querySelector('#nt').value.trim()||'Note',b=d.querySelector('#nb').value;if(!b.trim())return;d.remove();ingest([new File([b],t.replace(/\.txt$/i,'')+'.txt',{type:'text/plain'})],true)};d.querySelector('#nt').focus()};
$('#pre').addEventListener('click',e=>{const k=e.target.closest('[data-p]')?.dataset.p;if(k==null)return;Object.assign(S,PRE[k][1]);LS.s('of_s',S);syncSet();refresh();toast(PRE[k][0]+' preset applied')});
$('#fields').addEventListener('input',e=>{const t=e.target,k=t.dataset.k;if(!k)return;S[k]=t.type==='checkbox'?t.checked:t.type==='number'||t.type==='range'?+t.value:t.value;LS.s('of_s',S);refresh()});
$('#prev').addEventListener('click',e=>{if(e.target.closest('#sh')&&sel){const i=items.find(x=>x.id===sel);dlg(sheet(i,true)+'<p style="text-align:center"><button class="b" data-x>Close</button></p>')}});
addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files')){e.preventDefault();$('#drop').classList.add('on')}});
addEventListener('dragleave',e=>{if(!e.relatedTarget)$('#drop').classList.remove('on')});
addEventListener('drop',e=>{$('#drop').classList.remove('on');if(e.dataTransfer?.files.length){e.preventDefault();ingest([...e.dataTransfer.files])}});
addEventListener('paste',e=>{if(e.clipboardData?.files.length&&!/INPUT|TEXTAREA/.test(e.target.tagName)){ingest([...e.clipboardData.files])}});
addEventListener('keydown',e=>{const t=e.target,typing=/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable;
if(e.key==='Escape'){if($('#tut'))endTut();else document.querySelector('.ov:last-of-type')?.remove();return}
if($('#tut')){if(e.key==='ArrowRight')tnext();if(e.key==='ArrowLeft')tback();return}
if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();doExport();return}
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return}if(typing)return;
else if(e.key==='?')tut(0);else if((e.key==='r'||e.key==='R')&&sel&&!e.ctrlKey&&!e.metaKey)rotSel(sel);else if((e.key==='Delete'||e.key==='Backspace')&&sel)delItem(sel)});

// Downloadable local workspaces (.omnifuse is a ZIP container), no account required.
async function saveProject(){if(!items.length){toast('Add some files before saving a project');return}if(!window.JSZip){toast('ZIP library unavailable. Please reload online.','error');return}
const z=new JSZip(),manifest={format:'OmniFuse-Nova-Project',version:1,settings:S,files:[]};
items.forEach((i,k)=>{const filename='source/'+String(k+1).padStart(3,'0')+'_'+i.name.replace(/[^\w.\- ]/g,'_');z.file(filename,i.file);manifest.files.push({filename,name:i.name,range:i.range,rot:i.rot,fit:i.fit,note:i.note})});z.file('project.json',JSON.stringify(manifest,null,2));
try{toast('Packing your project...');const blob=await z.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:4}});downloadBlob(blob,(S.name||'OmniFuse-Project').replace(/[^\w-]/g,'-')+'.omnifuse');toast('Project saved')}
catch(e){console.error(e);toast('Could not save project: '+e.message,'error')}}
async function openProject(f){if(!f)return;if(!window.JSZip){toast('ZIP library unavailable. Please reload online.','error');return}if(projectBusy)return;projectBusy=true;
try{const z=await JSZip.loadAsync(f),entry=z.file('project.json');if(!entry)throw Error('Not a valid OmniFuse project');const data=JSON.parse(await entry.async('string'));if(data.format!=='OmniFuse-Nova-Project'||!Array.isArray(data.files)||data.files.length>MAX_FILES)throw Error('Invalid or unsupported project');
if(items.length&&!confirm('Replace the current file queue with this saved project?'))return;
const loaded=[];for(const record of data.files){const packed=z.file(record.filename);if(!packed)throw Error('A project file is missing');const b=await packed.async('blob');const ext=(record.name.split('.').pop()||'').toLowerCase(),mime=ext==='pdf'?'application/pdf':/^(png|jpg|jpeg|webp|gif|bmp)$/.test(ext)?'image/'+(ext==='jpg'?'jpeg':ext):'text/plain';const i=await parse(new File([b],record.name,{type:mime}));i.range=record.range||'all';i.rot=[0,90,180,270].includes(record.rot)?record.rot:0;i.fit=['contain','cover','original'].includes(record.fit)?record.fit:'contain';i.note=String(record.note||'');loaded.push(i)}
snap();items=loaded;sel=items[0]?.id||null;if(data.settings&&typeof data.settings==='object')Object.assign(S,data.settings);LS.s('of_s',S);syncSet();refresh();toast('Project restored: '+items.length+' files')}
catch(e){console.error(e);toast('Could not open project: '+e.message,'error')}
finally{projectBusy=false;$('#projectFile').value=''}}
let toastTimer;
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3600)}
$('#saveProject').onclick=saveProject;$('#loadProject').onclick=()=>$('#projectFile').click();$('#projectFile').onchange=e=>openProject(e.target.files?.[0]);
$('#redo').onclick=redo;$('#expBottom').onclick=doExport;$('#mobileExport').onclick=doExport;
$('#prev').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.id==='sh'){e.preventDefault();e.target.click()}});

mkSet();refresh();if(!LS.g('of_pro_seen',0))setTimeout(()=>tut(0),650);
