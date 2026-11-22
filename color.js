/* Custom color picker: hue wheel, saturation and lightness sliders, hex box, saved colors. */
const PRESETS=['#2D2A28','#6E201E','#A3726B','#7C7871'];
let ph=0,ps=60,pl=40,saved=[];
try{saved=JSON.parse(localStorage.getItem('jm-colors'))||[]}catch(e){}
const hsl2hex=(h,s,l)=>{s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));
  return'#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase()};
const hex2hsl=x=>{const r=parseInt(x.slice(1,3),16)/255,g=parseInt(x.slice(3,5),16)/255,b=parseInt(x.slice(5,7),16)/255,M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;let h=0;
  if(d){h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360}
  const l=(M+m)/2;return[h,d?d/(1-Math.abs(2*l-1))*100:0,l*100]};
function updatePick(){const a=(ph-90)*Math.PI/180,k=$('#knob');
  k.style.left=75+57*Math.cos(a)+'px';k.style.top=75+57*Math.sin(a)+'px';k.style.background=hsl2hex(ph,100,50);
  $('#cur').style.background=hsl2hex(ph,ps,pl);$('#sat').value=ps;$('#lig').value=pl;
  $('#sat').style.setProperty('--tr',`linear-gradient(90deg,hsl(${ph} 0% ${pl}%),hsl(${ph} 100% ${pl}%))`);
  $('#lig').style.setProperty('--tr',`linear-gradient(90deg,#000,hsl(${ph} ${ps}% 50%),#fff)`);
  $('#hex').value=hsl2hex(ph,ps,pl)}
function openPick(){[ph,ps,pl]=hex2hsl(color);updatePick()}
function setPick(){color=hsl2hex(ph,ps,pl);if(tool==='eraser')tool='pen';updatePick();sync()}
function renderSaved(){$('#saved').innerHTML=saved.map(c=>`<button class="sw" data-c="${c}" style="--c:${c}" aria-label="Saved color ${c}"><i></i></button>`).join('');sync()}
function addCustom(){if(!PRESETS.includes(color)&&!saved.includes(color)){saved=[color,...saved].slice(0,6);try{localStorage.setItem('jm-colors',JSON.stringify(saved))}catch(e){}}renderSaved()}
const wb=$('#wheelbox');let drag=false;
const hue=e=>{const r=wb.getBoundingClientRect();ph=(Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI+450)%360;setPick()};
wb.onpointerdown=e=>{wb.setPointerCapture(e.pointerId);drag=true;hue(e)};
wb.onpointermove=e=>{if(drag)hue(e)};
wb.onpointerup=wb.onpointercancel=()=>{if(drag){drag=false;addCustom()}};
$('#sat').oninput=e=>{ps=+e.target.value;setPick()};
$('#lig').oninput=e=>{pl=+e.target.value;setPick()};
$('#sat').onchange=$('#lig').onchange=addCustom;
$('#hex').onchange=e=>{let v=e.target.value.trim();if(v[0]!=='#')v='#'+v;if(/^#[0-9a-f]{6}$/i.test(v)){[ph,ps,pl]=hex2hsl(v);setPick();addCustom()}else updatePick()};
renderSaved();
