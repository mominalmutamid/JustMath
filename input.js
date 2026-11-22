/* Pen, mouse, wheel and keyboard input; zoom and pan. */
const tp=new Map();
function cancelGest(){const g=gest;if(!g)return;const pg=cp();
  if(g.type==='draw'){pg.s.pop();pg.h.pop();live=null}
  if(g.type==='erase'&&g.did)pg.s=pg.h.pop();
  gest=null;rail_.classList.remove('dim');zui.classList.remove('dim')}
function startPinch(){const[a,b]=[...tp.values()],r=ov.getBoundingClientRect(),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  gest={type:'pinch',d0:Math.hypot(a.x-b.x,a.y-b.y)||1,z0:view.z,gx:(mx-r.left-view.x)/view.z,gy:(my-r.top-view.y)/view.z};redraw()}
ov.onpointerdown=e=>{
  if(e.pointerType==='touch'){tp.set(e.pointerId,{x:e.clientX,y:e.clientY});if(tp.size===2){cancelGest();startPinch();return}if(tp.size>2)return}
  if(e.button===1||space){ov.setPointerCapture(e.pointerId);gest={type:'pan',lx:e.clientX,ly:e.clientY};return}
  if(e.button!==0)return;
  ov.setPointerCapture(e.pointerId);closeFly();rail_.classList.add('dim');zui.classList.add('dim');
  const p=pt(e),pg=cp();
  if(tool==='pen'||tool==='highlighter'){commit();live={id:++uid,t:tool,c:color,w:size,p:[p]};pg.s.push(live);gest={type:'draw'};framed(()=>render(live))}
  else if(tool==='eraser'){gest={type:'erase'};eraseAt(p)}
  else{const b=sel.size?bbox():null;
    if(b){const hp=hpos(b);
      if(Math.hypot(hp.x-p.x,hp.y-p.y)*view.z<24){const c={x:(b.x1+b.x2)/2,y:(b.y1+b.y2)/2};gest={type:'rotate',c,R:Math.hypot(hp.x-c.x,hp.y-c.y),a0:Math.atan2(p.y-c.y,p.x-c.x),m:{k:1,r:0,ax:c.x,ay:c.y,dx:0,dy:0}};drawOv();return}
      const cs=corners(b),i=cs.findIndex(c=>Math.hypot(c.x-p.x,c.y-p.y)*view.z<22);
      if(i>=0){const a=cs[(i+2)%4];gest={type:'resize',a,h:cs[i],m:{k:1,r:0,ax:a.x,ay:a.y,dx:0,dy:0}};drawOv();return}
      if(p.x>b.x1&&p.x<b.x2&&p.y>b.y1&&p.y<b.y2){gest={type:'move',s:p,m:{k:1,r:0,ax:0,ay:0,dx:0,dy:0}};drawOv();return}}
    sel=new Set();gest={type:'lasso',pts:[p]};drawOv()}};
ov.onpointermove=e=>{if(tp.has(e.pointerId))tp.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!gest)return;const g=gest;
  if(g.type==='pinch'){if(tp.size<2)return;const[a,b]=[...tp.values()],r=ov.getBoundingClientRect(),mx=(a.x+b.x)/2,my=(a.y+b.y)/2,z=Math.min(Math.max(g.z0*Math.hypot(a.x-b.x,a.y-b.y)/g.d0,fitZ*.3),fitZ*8);
    view.z=z;view.x=mx-r.left-g.gx*z;view.y=my-r.top-g.gy*z;view.auto=false;apply();return}
  if(g.type==='pan'){view.x+=e.clientX-g.lx;view.y+=e.clientY-g.ly;g.lx=e.clientX;g.ly=e.clientY;view.auto=false;apply();return}
  for(const c of(e.getCoalescedEvents?.()||[e])){const p=pt(c);
    if(g.type==='draw'){const a=live.p.at(-1);live.p.push(p);if(live.t==='pen')framed(()=>{setup(live);seg(live,a,p)})}
    else if(g.type==='erase')eraseAt(p);
    else if(g.type==='lasso')g.pts.push(p);
    else if(g.type==='rotate')g.m.r=Math.atan2(p.y-g.c.y,p.x-g.c.x)-g.a0;
    else if(g.type==='move'){g.m.dx=p.x-g.s.x;g.m.dy=p.y-g.s.y}
    else if(g.type==='resize'){const vx=g.h.x-g.a.x,vy=g.h.y-g.a.y;g.m.k=Math.max(.1,((p.x-g.a.x)*vx+(p.y-g.a.y)*vy)/(vx*vx+vy*vy))}}
  if(g.type==='draw'){if(live.t==='highlighter')redraw()}
  else if(g.type==='lasso')drawOv();
  else if(g.m)redraw()};
ov.onpointerup=ov.onpointercancel=e=>{tp.delete(e.pointerId);const g=gest;if(!g)return;if(g.type==='pinch'){if(tp.size<2){gest=null;redraw()}return}gest=null;rail_.classList.remove('dim');zui.classList.remove('dim');
  if(g.type==='draw')live=null;
  if(g.type==='lasso'&&g.pts.length>2)cp().s.forEach(st=>{if(st.p.filter(q=>inPoly(q,g.pts)).length>=st.p.length/2)sel.add(st.id)});
  if(g.m){commit();const m=g.m;cp().s=cp().s.map(st=>sel.has(st.id)?{...st,w:st.w*m.k,p:st.p.map(q=>am(m,q))}:st)}
  redraw();sync();save()};
function apply(){paper.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.z})`;$('#zp').textContent=Math.round(view.z/fitZ*100)+'%';redraw()}
function fit(){const w=main.clientWidth,h=main.clientHeight;fitZ=Math.min(w/PW,h/PH)||1;view={z:fitZ,x:(w-PW*fitZ)/2,y:(h-PH*fitZ)/2,auto:true};apply()}
function zoomAt(cx,cy,f){const r=ov.getBoundingClientRect(),z=Math.min(Math.max(view.z*f,fitZ*.3),fitZ*8),gx=(cx-r.left-view.x)/view.z,gy=(cy-r.top-view.y)/view.z;
  view.z=z;view.x=cx-r.left-gx*z;view.y=cy-r.top-gy*z;view.auto=false;apply()}
ov.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey)zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.01));else{view.x-=e.deltaX;view.y-=e.deltaY;view.auto=false;apply()}},{passive:false});
addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT/.test(e.target.tagName)){space=true;e.preventDefault()}});
addEventListener('keydown',e=>{if(e.key==='0'&&!/INPUT/.test(e.target.tagName))fit()});
addEventListener('keyup',e=>{if(e.code==='Space')space=false});
new ResizeObserver(()=>{const r=main.getBoundingClientRect(),d=D();for(const c of[cv,ov]){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d)}view.auto?fit():redraw()}).observe(main);
