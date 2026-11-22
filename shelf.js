/* Notebook shelf and the new-notebook box. Starts the app. */
function show(v){document.body.dataset.view=v}
function renderShelf(){
  const trash='<svg><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>';
  $('#shelf').innerHTML='<button class="new" id="new"><svg><path d="M12 5v14M5 12h14"/></svg>New notebook</button>'+
  '<button class="new" id="pdfin"><svg><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M12 12v5M9.5 14.5L12 17l2.5-2.5"/></svg>Import PDF</button>'+
  [...nbs].sort((a,b)=>b.t-a.t).map(n=>`<div class="nbk" style="--cv:${n.cv[0]};--ink:${n.cv[1]}"><button class="open" data-id="${n.id}"><span class="nt">${esc(n.name)}</span><span class="ns">${n.pages.length} ${n.pages.length==1?'page':'pages'}</span></button><button class="x${armed==n.id?' arm':''}" data-x="${n.id}" aria-label="Delete notebook">${armed==n.id?'Delete?':trash}</button></div>`).join('')}
function openNb(id){nb=nbs.find(n=>n.id==id);pages=nb.pages;cur=0;bi=Math.max(0,bgs.indexOf(nb.bg));$('#name').value=nb.name;sel=new Set();closeFly();show('editor');fit();rail();preloadImgs()}
function home(){clearTimeout(tm);flush();nb=null;pages=[mk()];closeFly();renderShelf();show('shelf')}
$('#shelf').onclick=e=>{const o=e.target.closest('.open'),x=e.target.closest('.x');
  if(e.target.closest('#new')){openModal();return}
  if(e.target.closest('#pdfin')){$('#pdffile').click();return}
  if(o){armed=null;openNb(+o.dataset.id);return}
  if(x){const id=+x.dataset.x;if(armed===id){const dead=nbs.find(n=>n.id===id);nbs=nbs.filter(n=>n.id!==id);armed=null;dropNb(dead)}else armed=id;renderShelf();return}
  if(armed){armed=null;renderShelf()}};
$('#name').oninput=e=>{nb.name=e.target.value.trim()||'Untitled notebook';save()};
let nc=0;
function openModal(){nc=0;$('#nn').value=`Notebook ${nbs.length+1}`;$('#covers').innerHTML=covers.map((c,i)=>`<button class="cvr" style="--cv:${c[0]}" data-cv="${i}" aria-label="Cover ${i+1}" aria-pressed="${i==0}"></button>`).join('');$('#modal').hidden=false;$('#nn').focus();$('#nn').select()}
function create(){const name=$('#nn').value.trim()||`Notebook ${nbs.length+1}`;nbs.push({id:Date.now(),name,cv:covers[nc],bg:'lined',pages:[mk()],t:Date.now()});$('#modal').hidden=true;saveNb(nbs.at(-1));openNb(nbs.at(-1).id)}
$('#modal').onclick=e=>{if(e.target.id==='modal'){e.target.hidden=true;return}const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.cv!==undefined){nc=+d.cv;$$('.cvr').forEach((x,i)=>x.setAttribute('aria-pressed',i==nc))}
  if(d.m==='cancel')$('#modal').hidden=true;if(d.m==='ok')create()};
$('#nn').onkeydown=e=>{if(e.key==='Enter')create();if(e.key==='Escape')$('#modal').hidden=true};
renderShelf();
(async()=>{try{nbs=await loadNbs()}catch(e){nbs=[]}nbs.forEach(n=>n.pages.forEach(p=>{p.h=[];p.r=[]}));renderShelf()})();
addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
