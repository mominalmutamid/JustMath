/* Drawing engine: strokes, paper lines, selection box. */
function T(c){const d=D();c.setTransform(d*view.z,0,0,d*view.z,d*view.x,d*view.y)}
function framed(fn){ctx.save();T(ctx);ctx.beginPath();ctx.rect(0,0,PW,PH);ctx.clip();fn();ctx.restore()}
function setup(st,c=ctx){c.strokeStyle=st.c;c.globalAlpha=st.t==='highlighter'?.35:1;c.lineCap=c.lineJoin='round'}
function seg(st,a,b,c=ctx){c.lineWidth=st.w*(st.t==='pen'?.35+b.p*1.3:4);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}
function render(st,c=ctx){
  if(st.t==='img'){const im=IMGS.get(st.i);if(!im)return;const[a,b,d]=st.p,w=im.naturalWidth,h=im.naturalHeight;
    c.save();c.globalAlpha=1;c.transform((b.x-a.x)/w,(b.y-a.y)/w,(d.x-a.x)/h,(d.y-a.y)/h,a.x,a.y);c.drawImage(im,0,0);c.restore();return}
  setup(st,c);const p=st.p;
  if(st.t==='pen'){if(p.length==1){seg(st,p[0],p[0],c);return}
    let k0=-1;for(let i=1;i<p.length;i++){const k=Math.round((.35+p[i].p*1.3)*10)/10;
      if(k!==k0){if(k0>=0)c.stroke();c.beginPath();c.moveTo(p[i-1].x,p[i-1].y);c.lineWidth=st.w*k;k0=k}c.lineTo(p[i].x,p[i].y)}
    c.stroke();return}
  c.lineWidth=st.w*4;c.beginPath();c.moveTo(p[0].x,p[0].y);p.forEach(q=>c.lineTo(q.x,q.y));if(p.length==1)c.lineTo(p[0].x+.1,p[0].y);c.stroke()}
function xf(m){ctx.translate(m.ax+m.dx,m.ay+m.dy);ctx.rotate(m.r);ctx.scale(m.k,m.k);ctx.translate(-m.ax,-m.ay)}
function am(m,q){const c=Math.cos(m.r),s=Math.sin(m.r),x=q.x-m.ax,y=q.y-m.ay,R=v=>Math.round(v*10)/10;return{x:R(m.ax+m.dx+m.k*(c*x-s*y)),y:R(m.ay+m.dy+m.k*(s*x+c*y)),p:q.p}}
function drawPaper(c=ctx,bg=bgs[bi],V=view,d=D()){if(bg==='blank')return;const z=V.z*d,x0=V.x*d,y0=V.y*d,lw=Math.max(1,Math.round(d)),o=lw%2?.5:0,R=Math.round,xa=R(x0),xb=R(x0+PW*z),ya=R(y0),yb=R(y0+PH*z);
  c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.lineWidth=lw;c.strokeStyle='#D3CDC1';c.beginPath();
  if(bg==='graph'){const cx=PW/2,cy=PH/2,nx=Math.floor(cx/34),ny=Math.floor(cy/34);
    for(let i=-nx;i<=nx;i++){const x=R(x0+(cx+i*34)*z)+o;c.moveTo(x,ya);c.lineTo(x,yb)}
    for(let i=-ny;i<=ny;i++){const y=R(y0+(cy+i*34)*z)+o;c.moveTo(xa,y);c.lineTo(xb,y)}
    c.stroke();
    const ax=R(x0+cx*z)+o,ay=R(y0+cy*z)+o,t=14*z;c.strokeStyle=c.fillStyle='#2D2A28';c.lineWidth=lw*2;c.beginPath();c.moveTo(xa,ay);c.lineTo(xb-t,ay);c.moveTo(ax,yb);c.lineTo(ax,ya+t);c.stroke();
    c.beginPath();c.moveTo(xb,ay);c.lineTo(xb-t*1.5,ay-t*.6);c.lineTo(xb-t*1.5,ay+t*.6);c.fill();
    c.beginPath();c.moveTo(ax,ya);c.lineTo(ax-t*.6,ya+t*1.5);c.lineTo(ax+t*.6,ya+t*1.5);c.fill();c.restore();return}
  for(let i=1;i*34<PH;i++){const y=R(y0+i*34*z)+o;c.moveTo(xa,y);c.lineTo(xb,y)}
  if(bg==='grid')for(let i=1;i*34<PW;i++){const x=R(x0+i*34*z)+o;c.moveTo(x,ya);c.lineTo(x,yb)}
  c.stroke();
  if(bg==='lined'){const x=R(x0+PW*.05*z)+o;c.beginPath();c.strokeStyle='#B79088';c.moveTo(x,ya);c.lineTo(x,yb);c.stroke()}
  c.restore()}
function hpos(b){const g=gest;return g&&g.type==='rotate'?{x:g.c.x+Math.sin(g.m.r)*g.R,y:g.c.y-Math.cos(g.m.r)*g.R}:{x:(b.x1+b.x2)/2,y:b.y1-40/view.z}}
function redraw(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);drawPaper();
  framed(()=>{const m=gest&&gest.m;cp().s.forEach(st=>{if(m&&sel.has(st.id)){ctx.save();xf(m);render(st);ctx.restore()}else render(st)})});drawOv()}
const corners=b=>[{x:b.x1,y:b.y1},{x:b.x2,y:b.y1},{x:b.x2,y:b.y2},{x:b.x1,y:b.y2}];
function bbox(){let a=1e9,b=1e9,c=-1e9,d=-1e9;
  const m=gest&&gest.m,pad=10;
  cp().s.forEach(st=>{if(sel.has(st.id))st.p.forEach(q0=>{const q=m?am(m,q0):q0;a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x);d=Math.max(d,q.y)})});
  if(c<a)return null;
  return{x1:a-pad,y1:b-pad,x2:c+pad,y2:d+pad}}
function drawOv(){o2.setTransform(1,0,0,1,0,0);o2.clearRect(0,0,ov.width,ov.height);T(o2);const z=view.z;
  if(gest&&gest.type==='lasso'){o2.beginPath();gest.pts.forEach((q,i)=>i?o2.lineTo(q.x,q.y):o2.moveTo(q.x,q.y));o2.fillStyle='rgba(110,32,30,.08)';o2.fill();o2.strokeStyle='#6E201E';o2.lineWidth=2/z;o2.setLineDash([7/z,6/z]);o2.stroke();o2.setLineDash([])}
  const b=sel.size?bbox():null;
  if(b){o2.strokeStyle='#6E201E';o2.lineWidth=1.5/z;o2.setLineDash([6/z,5/z]);o2.strokeRect(b.x1,b.y1,b.x2-b.x1,b.y2-b.y1);o2.setLineDash([]);
    o2.fillStyle='#F2ECDE';corners(b).forEach(c=>{const h=8/z;o2.fillRect(c.x-h,c.y-h,2*h,2*h);o2.strokeRect(c.x-h,c.y-h,2*h,2*h)});
    const hp=hpos(b);if(!gest||gest.type!=='rotate'){o2.beginPath();o2.moveTo((b.x1+b.x2)/2,b.y1);o2.lineTo(hp.x,hp.y);o2.stroke()}
    o2.beginPath();o2.arc(hp.x,hp.y,10/z,0,7);o2.fillStyle='#6E201E';o2.fill();o2.strokeStyle='#F2ECDE';o2.lineWidth=2/z;o2.stroke()}
  place(b)}
function place(b){if(!b||gest){sb.hidden=true;return}sb.hidden=false;sb.classList.toggle('noink',cp().s.filter(st=>sel.has(st.id)).every(st=>st.t==='img'));const r=sb.offsetWidth||280,h=sb.offsetHeight||64;
  const x=Math.min(Math.max((b.x1+b.x2)/2*view.z+view.x,r/2+8),main.clientWidth-r/2-8);let y=b.y2*view.z+view.y+16;
  if(y+h>main.clientHeight-8)y=b.y1*view.z+view.y-40-14-h;
  y=Math.min(Math.max(y,8),main.clientHeight-h-8);sb.style.left=x+'px';sb.style.top=y+'px'}
const pt=e=>{const r=ov.getBoundingClientRect();return{x:Math.round((e.clientX-r.left-view.x)/view.z*10)/10,y:Math.round((e.clientY-r.top-view.y)/view.z*10)/10,p:e.pressure||.5}};
function commit(){const pg=cp();pg.h.push(pg.s.slice());if(pg.h.length>80)pg.h.shift();pg.r=[]}
function inPoly(p,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a.y>p.y)!=(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)c=!c}return c}
function dseg(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;let t=l?((p.x-a.x)*dx+(p.y-a.y)*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)}
function hit(st,p,r){const q=st.p;if(q.length==1)return Math.hypot(q[0].x-p.x,q[0].y-p.y)<=r;for(let i=1;i<q.length;i++)if(dseg(p,q[i-1],q[i])<=r)return true;return false}
function eraseAt(p){const pg=cp(),keep=pg.s.filter(st=>st.t==='img'||!hit(st,p,10+size*3));
  if(keep.length!==pg.s.length){if(!gest.did){commit();gest.did=true}pg.s=keep;redraw()}}
