/* Export every page of the open notebook as one PDF (no outside library). */
const CVX={'var(--wine)':'#6E201E','var(--raise)':'#3B3835','var(--linen)':'#F2ECDE','var(--graphite)':'#2D2A28'},hx=v=>CVX[v]||v;
function wrapText(x,t,max){const L=[];let l='';for(const s of t.split(/\s+/)){const n=l?l+' '+s:s;if(x.measureText(n).width>max&&l){L.push(l);l=s}else l=n}L.push(l);return L}
async function drawCover(x,S){
  const F="'Plus Jakarta Sans',system-ui,sans-serif";await document.fonts.load("600 100px "+F);await document.fonts.load("500 30px "+F);
  const bg=hx(nb.cv[0]),ink=hx(nb.cv[1]);
  x.setTransform(S,0,0,S,0,0);x.globalAlpha=1;x.fillStyle=bg;x.fillRect(0,0,PW,PH);
  x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,0,90,PH);
  x.fillStyle=ink;x.font='600 104px '+F;
  const L=wrapText(x,nb.name||'Notebook',1150).slice(0,3),lh=124,y0=PH/2-(L.length-1)*lh/2-20;
  L.forEach((t,i)=>x.fillText(t,190,y0+i*lh));
  x.globalAlpha=.7;x.font='500 36px '+F;
  x.fillText(`${pages.length} ${pages.length==1?'page':'pages'}  ·  ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`,190,y0+(L.length-1)*lh+84);
  x.globalAlpha=1;
  const ic=await new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.onerror=()=>r(null);im.src='icon-192.png'});
  if(ic){x.save();x.beginPath();x.roundRect?x.roundRect(190,PH-170,84,84,18):x.rect(190,PH-170,84,84);x.clip();x.drawImage(ic,190,PH-170,84,84);x.restore()}
  x.fillStyle=ink;x.font='700 40px '+F;x.fillText('JustMath',296,PH-112)}
async function exportPDF(){
  if(!nb)return;toast('Making PDF…');await new Promise(r=>setTimeout(r,40));
  await Promise.all(pages.flatMap(p=>p.s).filter(s=>s.t==='img').map(s=>ensureImg(s.i)));
  const S=2.5,W=PW*S,H=PH*S,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),jpgs=[];
  const snap=async()=>new Uint8Array(await(await new Promise(r=>c.toBlob(r,'image/jpeg',.92))).arrayBuffer());
  await drawCover(x,S);jpgs.push(await snap());
  for(const pg of pages){
    x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.fillStyle='#F2ECDE';x.fillRect(0,0,W,H);
    drawPaper(x,nb.bg,{z:1,x:0,y:0},S);
    x.save();x.scale(S,S);pg.s.forEach(st=>render(st,x));x.restore();jpgs.push(await snap());
  }
  const a=document.createElement('a');a.href=URL.createObjectURL(buildPdf(jpgs,W,H));
  a.download=((nb.name||'notebook').replace(/[\\/:*?"<>|]/g,'').trim()||'notebook')+'.pdf';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast('PDF saved');
}
function buildPdf(jpgs,W,H){
  const enc=new TextEncoder(),chunks=[],offs=[],n=jpgs.length;let len=0;
  const put=d=>{const u=typeof d==='string'?enc.encode(d):d;chunks.push(u);len+=u.length};
  const obj=(id,fn)=>{offs[id]=len;put(`${id} 0 obj\n`);fn();put('\nendobj\n')};
  put('%PDF-1.4\n');
  obj(1,()=>put('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2,()=>put(`<< /Type /Pages /Kids [${jpgs.map((_,i)=>`${3+3*i} 0 R`).join(' ')}] /Count ${n} >>`));
  jpgs.forEach((j,i)=>{const p=3+3*i,cs='q 960 0 0 540 0 0 cm /Im Do Q';
    obj(p,()=>put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 960 540] /Resources << /XObject << /Im ${p+2} 0 R >> >> /Contents ${p+1} 0 R >>`));
    obj(p+1,()=>put(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
    obj(p+2,()=>{put(`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.length} >>\nstream\n`);put(j);put('\nendstream')})});
  const xr=len,total=3+3*n;
  put(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for(let i=1;i<total;i++)put(String(offs[i]).padStart(10,'0')+' 00000 n \n');
  put(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);
  return new Blob(chunks,{type:'application/pdf'});
}
