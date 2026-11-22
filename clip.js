/* Copy, cut and paste of selected writing and pictures (works across pages and notebooks). */
let clip=null,pn=0;
function copySel(){const it=cp().s.filter(st=>sel.has(st.id));if(!it.length)return;clip=JSON.parse(JSON.stringify(it));pn=0;sync();toast('Copied')}
function delSel(){commit();cp().s=cp().s.filter(st=>!sel.has(st.id));sel=new Set();redraw();sync();save()}
function pasteClip(){if(!clip)return;const pg=cp();let a=1e9,b=1e9,c=-1e9,d=-1e9;
  clip.forEach(st=>st.p.forEach(q=>{a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x);d=Math.max(d,q.y)}));
  const cx=(main.clientWidth/2-view.x)/view.z+pn*24,cy=(main.clientHeight/2-view.y)/view.z+pn*24,dx=cx-(a+c)/2,dy=cy-(b+d)/2;pn++;
  const items=clip.map(st=>({...st,id:++uid,p:st.p.map(q=>({x:Math.round((q.x+dx)*10)/10,y:Math.round((q.y+dy)*10)/10,p:q.p}))}));
  commit();const ti=imgTop(pg.s);pg.s=[...pg.s.slice(0,ti),...items.filter(s=>s.t==='img'),...pg.s.slice(ti),...items.filter(s=>s.t!=='img')];
  sel=new Set(items.map(s=>s.id));tool='select';preloadImgs();redraw();sync();save()}
const inEditor=e=>document.body.dataset.view==='editor'&&!/INPUT|TEXTAREA/.test(e.target.tagName);
addEventListener('keydown',e=>{if(!inEditor(e))return;const m=e.ctrlKey||e.metaKey;
  if(m&&e.key==='c'&&sel.size){copySel();e.preventDefault()}
  else if(m&&e.key==='x'&&sel.size){copySel();delSel();e.preventDefault()}
  else if((e.key==='Delete'||e.key==='Backspace')&&sel.size){delSel();e.preventDefault()}});
addEventListener('paste',e=>{if(!inEditor(e))return;
  const f=[...(e.clipboardData?.files||[])].find(f=>f.type.startsWith('image/'));
  if(f){addImageFile(f);e.preventDefault()}else if(clip){pasteClip();e.preventDefault()}});
