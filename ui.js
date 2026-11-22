/* Menus, tool panels, page list, buttons. */
function closeFly(){$$('.fly').forEach(f=>f.classList.remove('on'));$$('[data-fly]').forEach(b=>b.setAttribute('aria-pressed','false'))}
function toggleFly(id){const f=$('#'+id),was=f.classList.contains('on');closeFly();if(!was){f.classList.add('on');$(`[data-fly=${id}]`).setAttribute('aria-pressed','true')}}
function sync(){
  $$('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===tool));
  $$('[data-c]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===color));
  $$('[data-s]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.s===size));
  paper.dataset.bg=bgs[bi];$('#bgn').textContent=bgs[bi][0].toUpperCase()+bgs[bi].slice(1);
  const pg=cp();$('[data-a=undo]').disabled=!pg.h.length;$('[data-a=redo]').disabled=!pg.r.length;
  $('#tt').innerHTML=IC[tool];$('#dot').style.cssText=tool==='eraser'||tool==='select'?'display:none':`background:${color}`;
  $('#pp').textContent=`${cur+1}/${pages.length}`;$('[data-a=paste]').disabled=!clip;$('[data-a=snap]').setAttribute('aria-pressed',snapOn)}
function rail(){$('#pages').innerHTML=pages.map((_,i)=>`<button class="pg" aria-current="${i==cur}" aria-label="Page ${i+1}" data-i="${i}">${i+1}</button>`).join('');sync()}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),2200)}
$('main').onclick=e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset,pg=cp();
  if(d.fly){toggleFly(d.fly);return}
  if(d.a==='min'){rail_.classList.toggle('min');closeFly();return}
  if(d.a==='home'){home();return}
  if(d.a==='export'){exportPDF();return}
  if(d.a==='snap'){snapOn=!snapOn;try{localStorage.setItem('jm-snap',snapOn?'1':'0')}catch(e){}}
  if(d.a==='xy'||d.a==='xyz'){addAxes(d.a);closeFly();return}
  if(d.a==='img'){closeFly();$('#file').click();return}
  if(d.a==='copy'){copySel();return}
  if(d.a==='paste'){pasteClip();closeFly();return}
  if(d.a==='pick'){const k=$('#pick');k.hidden=!k.hidden;if(!k.hidden)openPick();return}
  if(d.z){const r=ov.getBoundingClientRect();if(d.z==='fit')fit();else zoomAt(r.left+r.width/2,r.top+r.height/2,d.z==='in'?1.25:.8);return}
  if(d.tool){tool=d.tool;sel=new Set()}
  if(d.c){color=d.c;if(tool==='eraser')tool='pen'}if(d.s)size=+d.s;
  if(d.sc){commit();pg.s=pg.s.map(st=>sel.has(st.id)?{...st,c:d.sc}:st)}
  if(d.a==='seldel'){commit();pg.s=pg.s.filter(st=>!sel.has(st.id));sel=new Set()}
  if(d.a==='seldone')sel=new Set();
  if(d.a==='undo'&&pg.h.length){pg.r.push(pg.s);pg.s=pg.h.pop();sel=new Set()}
  if(d.a==='redo'&&pg.r.length){pg.h.push(pg.s);pg.s=pg.r.pop();sel=new Set()}
  if(d.a==='bg'){bi=(bi+1)%bgs.length;nb.bg=bgs[bi]}
  if(d.a==='clear'){commit();pg.s=pg.s.filter(st=>st.lock);sel=new Set()}
  if(d.a==='add'){pages.push(mk());cur=pages.length-1;sel=new Set()}
  if(d.a==='del'&&pages.length>1){pages.splice(cur,1);cur=Math.min(cur,pages.length-1);sel=new Set()}
  if(d.i!==undefined){cur=+d.i;sel=new Set()}
  redraw();rail();save();preloadImgs()};
