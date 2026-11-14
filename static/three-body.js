const canvas=document.querySelector("#three-canvas");
if(canvas){
const ctx=canvas.getContext("2d"),$=id=>document.getElementById(id);
const G=1,DT=.002,EPS=.012,colors=["#8ddcff","#ffc58e","#c7a5ff"];
const presets={
figure8:[[-.97000436,.24308753,.466203685,.43236573],[.97000436,-.24308753,.466203685,.43236573],[0,0,-.93240737,-.86473146]],
triangle:[[-.8,-.45,.36,-.38],[.8,-.45,-.36,-.38],[0,.9,0,.76]],
chaos:[[-1.05,.25,.12,.55],[.82,.52,-.28,-.12],[.12,-.82,.34,-.18]]
};
let bodies=[],trails=[],running=true,t=0,speed=1,trailPct=100,vScale=1,accum=0,last=0,scale=150,cx=0,cy=0,drag=-1;
const acceleration=s=>s.map((b,i)=>{let ax=0,ay=0;s.forEach((o,j)=>{if(i===j)return;let dx=o.x-b.x,dy=o.y-b.y,r2=dx*dx+dy*dy+EPS*EPS,k=1/(r2*Math.sqrt(r2));ax+=o.m*dx*k;ay+=o.m*dy*k});return{ax,ay}});
const deriv=s=>{let a=acceleration(s);return s.map((b,i)=>({x:b.vx,y:b.vy,vx:a[i].ax,vy:a[i].ay}))};
const shift=(s,k,f)=>s.map((b,i)=>({...b,x:b.x+k[i].x*f,y:b.y+k[i].y*f,vx:b.vx+k[i].vx*f,vy:b.vy+k[i].vy*f}));
function step(){let a=deriv(bodies),b=deriv(shift(bodies,a,DT/2)),c=deriv(shift(bodies,b,DT/2)),d=deriv(shift(bodies,c,DT));
bodies=bodies.map((p,i)=>({...p,x:p.x+DT/6*(a[i].x+2*b[i].x+2*c[i].x+d[i].x),y:p.y+DT/6*(a[i].y+2*b[i].y+2*c[i].y+d[i].y),vx:p.vx+DT/6*(a[i].vx+2*b[i].vx+2*c[i].vx+d[i].vx),vy:p.vy+DT/6*(a[i].vy+2*b[i].vy+2*c[i].vy+d[i].vy)}));t+=DT;
bodies.forEach((p,i)=>{trails[i].push({x:p.x,y:p.y});let n=Math.max(30,1600*trailPct/100);if(trails[i].length>n)trails[i].splice(0,trails[i].length-n)})}
function energy(){let e=0;bodies.forEach(b=>e+=.5*b.m*(b.vx*b.vx+b.vy*b.vy));for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){let dx=bodies[j].x-bodies[i].x,dy=bodies[j].y-bodies[i].y;e-=bodies[i].m*bodies[j].m/Math.sqrt(dx*dx+dy*dy+EPS*EPS)}return e}
function reset(){bodies=presets[$("preset").value].map(a=>({x:a[0],y:a[1],vx:a[2]*vScale,vy:a[3]*vScale,m:1}));trails=bodies.map(b=>[{x:b.x,y:b.y}]);t=0;accum=0;draw()}
function resize(){let r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);cx=r.width/2;cy=r.height/2;scale=Math.min(r.width,r.height)*.31}
const screen=p=>({x:cx+p.x*scale,y:cy-p.y*scale});
function draw(){let w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);
ctx.strokeStyle="#aabfe012";ctx.lineWidth=1;for(let x=cx%50;x<w;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=cy%50;y<h;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
trails.forEach((arr,i)=>{if(arr.length<2)return;ctx.beginPath();arr.forEach((p,j)=>{let q=screen(p);j?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});ctx.strokeStyle=colors[i]+"a0";ctx.lineWidth=1.7;ctx.stroke()});
bodies.forEach((b,i)=>{let p=screen(b),r=10,g=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,30);g.addColorStop(0,colors[i]+"99");g.addColorStop(1,colors[i]+"00");ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,30,0,7);ctx.fill();ctx.fillStyle=colors[i];ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.fill();ctx.strokeStyle="#fff9";ctx.stroke();ctx.fillStyle="#dce8fa";ctx.font="11px Manrope,sans-serif";ctx.fillText("Тело "+(i+1),p.x+13,p.y-12)});
$("time").textContent=t.toFixed(2).replace(".",",");$("energy").textContent=energy().toFixed(5).replace(".",",")}
function frame(now){if(!last)last=now;let elapsed=Math.min((now-last)/1000,.05);last=now;if(running){accum+=elapsed*speed*.7;let n=0;while(accum>=DT&&n<250){step();accum-=DT;n++}}draw();requestAnimationFrame(frame)}
$("pause").onclick=()=>{running=!running;$("pause").textContent=running?"Пауза":"Продолжить";$("status").textContent=running?"Симуляция запущена":"Симуляция на паузе"};
$("reset").onclick=reset;
$("speed").oninput=e=>{speed=+e.target.value;$("speed-out").textContent=speed+"×"};
$("trail").oninput=e=>{trailPct=+e.target.value;$("trail-out").textContent=trailPct+"%"};
$("velocity").oninput=e=>{vScale=+e.target.value/100;$("velocity-out").textContent=e.target.value+"%";reset()};
$("preset").onchange=reset;
function pos(e){let r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
canvas.onpointerdown=e=>{let p=pos(e);drag=bodies.findIndex(b=>{let q=screen(b);return Math.hypot(q.x-p.x,q.y-p.y)<24});if(drag>=0){running=false;$("pause").textContent="Продолжить";$("status").textContent="Изменение начальных условий";canvas.setPointerCapture(e.pointerId)}};
canvas.onpointermove=e=>{if(drag<0)return;let p=pos(e);bodies[drag].x=(p.x-cx)/scale;bodies[drag].y=-(p.y-cy)/scale;trails[drag]=[{x:bodies[drag].x,y:bodies[drag].y}];draw()};
function endDrag(){if(drag>=0){drag=-1;$("status").textContent="Начальные положения изменены"}}
canvas.onpointerup=endDrag;canvas.onpointercancel=endDrag;window.addEventListener("resize",resize);resize();reset();requestAnimationFrame(frame);
}
