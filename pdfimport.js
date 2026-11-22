/* Import a PDF: every page becomes a picture on its own page of a new notebook, ready to write over. */
async function importPdf(file){
  toast('Opening PDF…');
  const lib=await import('./pdf.min.mjs');lib.GlobalWorkerOptions.workerSrc='pdf.worker.min.mjs';
  const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise,out=[],n=doc.numPages;
  for(let i=1;i<=n;i++){
    toast(`Importing page ${i} of ${n}…`);
    const page=await doc.getPage(i),v1=page.getViewport({scale:1}),f=Math.min(PW/v1.width,PH/v1.height),uw=v1.width*f,uh=v1.height*f,
      q=Math.min(2.2,3000/uw),vp=page.getViewport({scale:f*q}),c=document.createElement('canvas');
    c.width=Math.round(vp.width);c.height=Math.round(vp.height);
    const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
    await page.render({canvasContext:x,viewport:vp}).promise;
    const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.85)),id='i'+(++uid);await putBlob(id,blob);
    const X=(PW-uw)/2,Y=(PH-uh)/2,P=(u,v)=>({x:Math.round(u*10)/10,y:Math.round(v*10)/10,p:.5}),pg=mk();
    pg.s.push({id:++uid,t:'img',i:id,p:[P(X,Y),P(X+uw,Y),P(X,Y+uh),P(X+uw,Y+uh)]});out.push(pg);page.cleanup();
  }
  const k=nbs.length;
  nbs.push({id:Date.now(),name:file.name.replace(/\.pdf$/i,'').slice(0,40)||'PDF',cv:covers[k%covers.length],bg:'blank',pages:out,t:Date.now()});
  flush();openNb(nbs.at(-1).id);
}
$('#pdffile').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)importPdf(f).catch(()=>toast('Could not open that PDF'))};
