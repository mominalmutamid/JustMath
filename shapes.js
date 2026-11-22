/* Hold the pen still at the end of a stroke: it snaps to a clean line, circle, ellipse, triangle or rectangle. Also the straight-line tool. */
let snapOn=true,snapT;
try{snapOn=localStorage.getItem('jm-snap')!=='0'}catch(e){}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function pdist(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);return l?Math.abs((p.x-a.x)*dy-(p.y-a.y)*dx)/l:dist(p,a)}
function rdp(P,e){if(P.length<3)return P;let m=0,k=0;const a=P[0],b=P.at(-1);
  for(let i=1;i<P.length-1;i++){const d=pdist(P[i],a,b);if(d>m){m=d;k=i}}
  if(m<=e)return[a,b];return[...rdp(P.slice(0,k+1),e).slice(0,-1),...rdp(P.slice(k),e)]}
function lineEnd(a,b){const dx=b.x-a.x,dy=b.y-a.y;
  if(Math.abs(dy)<Math.abs(dx)*.0875)return{...b,y:a.y};if(Math.abs(dx)<Math.abs(dy)*.0875)return{...b,x:a.x};return b}
function shapePoints(P){
  if(P.length<6)return null;let a=1e9,b=1e9,c=-1e9,d=-1e9,len=0;
  P.forEach((q,i)=>{a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x);d=Math.max(d,q.y);if(i)len+=dist(P[i-1],q)});
  const w=c-a,h=d-b,diag=Math.hypot(w,h);if(diag<30)return null;
  const A=P[0],B=P.at(-1),chord=dist(A,B),pt2=(x,y)=>({x:Math.round(x*10)/10,y:Math.round(y*10)/10,p:.5});
  if(chord>30&&chord>.85*len&&P.every(q=>pdist(q,A,B)<.06*chord)){const E=lineEnd(A,B);return[pt2(A.x,A.y),pt2(E.x,E.y)]}
  if(chord>.2*diag)return null;
  const cx=(a+c)/2,cy=(b+d)/2,rx=w/2,ry=h/2;
  if(rx>8&&ry>8){const r=P.map(q=>Math.hypot((q.x-cx)/rx,(q.y-cy)/ry)),m=r.reduce((s,v)=>s+v,0)/r.length,sd=Math.sqrt(r.reduce((s,v)=>s+(v-m)**2,0)/r.length);
    if(m>.8&&m<1.2&&sd<.1){const same=Math.abs(rx-ry)/Math.max(rx,ry)<.15,R1=same?(rx+ry)/2:rx,R2=same?(rx+ry)/2:ry,o=[];
      for(let k=0;k<=64;k++){const t=k/64*Math.PI*2;o.push(pt2(cx+R1*Math.cos(t),cy+R2*Math.sin(t)))}return o}}
  let F=0,fd=0;P.forEach((q,i)=>{const t=dist(q,A);if(t>fd){fd=t;F=i}});
  const ep=.05*diag,S=[...rdp(P.slice(0,F+1),ep).slice(0,-1),...rdp(P.slice(F),ep)];
  let V=S.slice(0,-1);V[0]={x:(A.x+B.x)/2,y:(A.y+B.y)/2};
  V=V.filter((q,i)=>{const p=V[(i+V.length-1)%V.length],n=V[(i+1)%V.length];let t=Math.abs(Math.atan2(q.y-p.y,q.x-p.x)-Math.atan2(n.y-q.y,n.x-q.x))*180/Math.PI;if(t>180)t=360-t;return t>20});
  if(V.length===3)return[...V,V[0]].map(q=>pt2(q.x,q.y));
  if(V.length===4){const ang=V.map((q,i)=>{const p=V[(i+3)%4],n=V[(i+1)%4],u=Math.atan2(p.y-q.y,p.x-q.x),v=Math.atan2(n.y-q.y,n.x-q.x);let t=Math.abs(u-v)*180/Math.PI;if(t>180)t=360-t;return t});
    if(ang.every(t=>Math.abs(t-90)<14)){const ed=V.map((q,i)=>{const n=V[(i+1)%4];return Math.abs(Math.atan2(n.y-q.y,n.x-q.x))*180/Math.PI%90}),flat=ed.every(t=>t<8||t>82);
      if(flat)return[pt2(a,b),pt2(c,b),pt2(c,d),pt2(a,d),pt2(a,b)]}
    return[...V,V[0]].map(q=>pt2(q.x,q.y))}
  return null}
function snapShape(){const g=gest;if(!g||g.type!=='draw'||!live||g.snapped)return;const P=shapePoints(live.p);if(!P)return;live.p=P;g.snapped=true;redraw()}
function armSnap(){clearTimeout(snapT);if(snapOn&&gest&&gest.type==='draw'&&live)snapT=setTimeout(snapShape,550)}
function trackHold(g,p){if(g.snapped)return;if(dist(p,g.anchor)>5){g.anchor=p;armSnap()}}
