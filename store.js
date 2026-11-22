/* Saving: notebooks and pictures live in the browser database (IndexedDB). Only the open notebook is saved. */
let idb;
const db=()=>idb||(idb=new Promise((ok,no)=>{const r=indexedDB.open('justmath',2);
  r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('img'))d.createObjectStore('img');if(!d.objectStoreNames.contains('nb'))d.createObjectStore('nb')};
  r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}));
const tx=(s,m='readonly')=>db().then(d=>d.transaction(s,m).objectStore(s));
const rq=r=>new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function saveNb(n){const c={...n,pages:n.pages.map(p=>({s:p.s}))};const s=await tx('nb','readwrite');await rq(s.put(c,String(n.id)))}
async function loadNbs(){const all=await rq((await tx('nb')).getAll());let old=[];
  try{old=JSON.parse(localStorage.getItem('notebooks-v2'))||[]}catch(e){}
  if(old.length){for(const n of old)await saveNb(n);try{localStorage.removeItem('notebooks-v2')}catch(e){}return[...all,...old]}
  return all}
async function dropNb(n){
  const used=new Set(nbs.flatMap(x=>x.pages.flatMap(p=>p.s)).filter(s=>s.t==='img').map(s=>s.i));
  await rq((await tx('nb','readwrite')).delete(String(n.id)));
  const m=await tx('img','readwrite');
  for(const st of n.pages.flatMap(p=>p.s))if(st.t==='img'&&!used.has(st.i)){m.delete(st.i);IMGS.delete(st.i)}}
