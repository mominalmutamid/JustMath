/* State, constants and saving. Loaded first. */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ov=$('#ov'),ctx=cv.getContext('2d'),o2=ov.getContext('2d'),paper=$('#paper'),rail_=$('#rail'),zui=$('#zoom'),sb=$('#selbar'),main=$('main');
const bgs=['lined','grid','blank'],PW=1600,PH=900;
const IC={pen:'<svg><path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/></svg>',highlighter:'<svg><path d="M4 20h6"/><path d="M8 16l8-9 3 3-8 9z"/></svg>',eraser:'<svg><path d="M8 20h11"/><path d="M5 14l8-8 6 6-6 6H9z"/></svg>',select:'<svg><path d="M12 4c4.4 0 8 2.2 8 5s-3.6 5-8 5-8-2.2-8-5 3.6-5 8-5z" stroke-dasharray="3 3"/><path d="M9 14c0 3 1 4 3 6"/></svg>'};
const mk=()=>({s:[],h:[],r:[]});
let pages=[mk()],nbs=[],nb=null,cur=0,tool='pen',color='#2D2A28',size=4,bi=0,live=null,tm,armed=null;
let view={z:1,x:0,y:0,auto:true},fitZ=1,gest=null,sel=new Set(),space=false,uid=Date.now();
const D=()=>devicePixelRatio||1,cp=()=>pages[cur];

const KEY='notebooks-v2',covers=[['var(--wine)','var(--linen)'],['var(--raise)','var(--linen)'],['var(--linen)','var(--graphite)'],['#A3726B','var(--graphite)']];
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function flush(){if(nb)nb.t=Date.now();try{localStorage.setItem(KEY,JSON.stringify(nbs,(k,v)=>k==='h'||k==='r'?undefined:v))}catch(e){}}
function save(){clearTimeout(tm);tm=setTimeout(flush,400)}
