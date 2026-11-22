/* Insert an XY plane or XYZ axes as lines you can move, resize, rotate and recolor like writing. */
function addAxes(kind){
  const pg=cp(),L=kind==='xy'?240:200,mx=L+90,my=L+70,out=[];
  const cx=Math.min(Math.max((main.clientWidth/2-view.x)/view.z,mx),PW-mx),cy=Math.min(Math.max((main.clientHeight/2-view.y)/view.z,my),PH-my);
  const S=(pts,w=size,c=color)=>out.push({id:++uid,t:'pen',c,w,p:pts.map(([x,y])=>({x:Math.round((cx+x)*10)/10,y:Math.round((cy+y)*10)/10,p:.5}))});
  const arrow=(x,y,dx,dy,s=20)=>{const a=Math.atan2(dy,dx),r=.45;S([[x-s*Math.cos(a-r),y-s*Math.sin(a-r)],[x,y],[x-s*Math.cos(a+r),y-s*Math.sin(a+r)]])};
  const G={x:[[[0,0],[14,20]],[[14,0],[0,20]]],y:[[[0,0],[7,13]],[[14,0],[3,26]]],z:[[[0,0],[14,0],[0,20],[14,20]]]},lw=Math.max(1.5,size*.8);
  const letter=(ch,x,y)=>{if(ch==='o'){const e=[];for(let i=0;i<=20;i++){const t=i/20*6.2832;e.push([x+9+9*Math.cos(t),y+12+12*Math.sin(t)])}S(e,lw);return}
    G[ch].forEach(s=>S(s.map(([u,v])=>[x+u*1.2,y+v*1.2]),lw))};
  if(kind==='xy'){const g=40,E=L+26,gc='#CFC8BA';
    for(let i=-6;i<=6;i++){if(!i)continue;S([[i*g,-L],[i*g,L]],1.2,gc);S([[-L,i*g],[L,i*g]],1.2,gc)}
    S([[-E,0],[E,0]]);S([[0,E],[0,-E]]);arrow(E,0,1,0);arrow(0,-E,0,-1);
    letter('x',E-6,16);letter('y',18,-E-6);letter('o',-34,8)}
  else{const o=.72;
    S([[0,0],[0,-L]]);S([[0,0],[L,0]]);S([[0,0],[-L*o,L*o]]);
    arrow(0,-L,0,-1);arrow(L,0,1,0);arrow(-L*o,L*o,-o,o);
    letter('z',-9,-L-42);letter('y',L+14,-14);letter('x',-L*o-36,L*o+2);letter('o',-36,6)}
  commit();pg.s.push(...out);sel=new Set(out.map(s=>s.id));tool='select';redraw();sync();save()}
