/* Export every page of the open notebook as one PDF (no outside library). */
async function exportPDF(){
  if(!nb)return;toast('Making PDF…');await new Promise(r=>setTimeout(r,40));
  const S=2.5,W=PW*S,H=PH*S,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),jpgs=[];
  for(const pg of pages){
    x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.fillStyle='#F2ECDE';x.fillRect(0,0,W,H);
    drawPaper(x,nb.bg,{z:1,x:0,y:0},S);
    x.save();x.scale(S,S);pg.s.forEach(st=>render(st,x));x.restore();
    const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));jpgs.push(new Uint8Array(await blob.arrayBuffer()));
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
