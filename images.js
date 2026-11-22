/* Pictures (PNG/JPG): kept in the browser database (IndexedDB), drawn on the page like writing. */
const IMGS=new Map();let idb;
const db=()=>idb||(idb=new Promise((ok,no)=>{const r=indexedDB.open('justmath',1);r.onupgradeneeded=()=>r.result.createObjectStore('img');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}));
async function putBlob(id,b){const d=await db();return new Promise((ok,no)=>{const t=d.transaction('img','readwrite');t.objectStore('img').put(b,id);t.oncomplete=ok;t.onerror=()=>no(t.error)})}
async function getBlob(id){const d=await db();return new Promise((ok,no)=>{const q=d.transaction('img').objectStore('img').get(id);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})}
function ensureImg(id){if(IMGS.has(id))return Promise.resolve(IMGS.get(id));
  return getBlob(id).then(b=>b&&new Promise(ok=>{const im=new Image();im.onload=()=>{IMGS.set(id,im);ok(im)};im.onerror=()=>ok(null);im.src=URL.createObjectURL(b)})).catch(()=>null)}
function preloadImgs(){const ids=new Set(pages.flatMap(p=>p.s).filter(s=>s.t==='img').map(s=>s.i));Promise.all([...ids].map(ensureImg)).then(()=>redraw())}
async function addImageFile(file){
  if(!file||!/^image\/(png|jpe?g|webp)/.test(file.type)){toast('Please choose a PNG or JPG picture');return}
  try{
    const bm=await createImageBitmap(file),k=Math.min(1,1800/Math.max(bm.width,bm.height)),w=Math.round(bm.width*k),h=Math.round(bm.height*k);
    const cv2=document.createElement('canvas');cv2.width=w;cv2.height=h;const x=cv2.getContext('2d'),png=file.type==='image/png';
    if(!png){x.fillStyle='#fff';x.fillRect(0,0,w,h)}x.drawImage(bm,0,0,w,h);bm.close?.();
    const blob=await new Promise(r=>cv2.toBlob(r,png?'image/png':'image/jpeg',.88)),id='i'+(++uid);
    await putBlob(id,blob);await ensureImg(id);
    const sc=Math.min(PW*.55/w,PH*.55/h),dw=w*sc,dh=h*sc;
    const cx=Math.min(Math.max((main.clientWidth/2-view.x)/view.z,dw/2),PW-dw/2),cy=Math.min(Math.max((main.clientHeight/2-view.y)/view.z,dh/2),PH-dh/2);
    const X=cx-dw/2,Y=cy-dh/2,P=(x,y)=>({x:Math.round(x*10)/10,y:Math.round(y*10)/10,p:.5}),pg=cp();
    const obj={id:++uid,t:'img',i:id,p:[P(X,Y),P(X+dw,Y),P(X,Y+dh),P(X+dw,Y+dh)]};
    commit();pg.s.unshift(obj);tool='select';sel=new Set([obj.id]);redraw();sync();save();
  }catch(e){toast('Could not add that picture')}
}
$('#file').onchange=e=>{addImageFile(e.target.files[0]);e.target.value=''};
