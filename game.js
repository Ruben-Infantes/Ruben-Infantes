'use strict';
const canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d');
const N=20,C=30,dirs={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const overlay=document.getElementById('overlay'),start=document.getElementById('start'),pause=document.getElementById('pause'),speed=document.getElementById('speed');
let snake,dir,queue,apple,score=0,best=0,state='ready',timer=null;
try{best=Math.max(0,Number(localStorage.getItem('ri-snake-best'))||0)}catch{}
document.getElementById('best').textContent=best;
function reset(){snake=[{x:7,y:10},{x:6,y:10},{x:5,y:10},{x:4,y:10}];dir=dirs.right;queue=[];score=0;apple={x:14,y:10};document.getElementById('score').textContent=0;draw()}
function food(){const free=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!snake.some(p=>p.x===x&&p.y===y))free.push({x,y});return free.length?free[Math.floor(Math.random()*free.length)]:null}
function circle(x,y,r,color){ctx.beginPath();ctx.fillStyle=color;ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function draw(){for(let y=0;y<N;y++)for(let x=0;x<N;x++){ctx.fillStyle=(x+y)%2?'#a2d35e':'#abd967';ctx.fillRect(x*C,y*C,C,C)}if(apple){const x=apple.x*C+15,y=apple.y*C+16;circle(x-4,y,10,'#e84b45');circle(x+4,y,10,'#e84b45');circle(x-5,y-3,3,'#ff9280');ctx.strokeStyle='#71512f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x+2,y-15);ctx.stroke();ctx.fillStyle='#3c802e';ctx.beginPath();ctx.ellipse(x+7,y-13,6,3,-.4,0,Math.PI*2);ctx.fill()}
ctx.strokeStyle='#4285ed';ctx.lineWidth=25;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();snake.forEach((p,i)=>i?ctx.lineTo(p.x*C+15,p.y*C+15):ctx.moveTo(p.x*C+15,p.y*C+15));ctx.stroke();const h=snake[0],x=h.x*C+15,y=h.y*C+15;circle(x,y,13,'#4285ed');const px=-dir.y,py=dir.x;for(const s of [-1,1]){const ex=x+dir.x*7+px*s*6,ey=y+dir.y*7+py*s*6;circle(ex,ey,5,'white');circle(ex+dir.x*2,ey+dir.y*2,2.5,'#18334e')}}
function show(title,message,label){document.getElementById('title').textContent=title;document.getElementById('message').textContent=message;start.textContent=label;overlay.hidden=false}
function stop(){clearInterval(timer);timer=null}
function end(won=false){stop();state='over';pause.disabled=true;speed.disabled=false;show(won?'¡Jardín completo!':'¡Otra semilla, otra partida!',`Conseguiste ${score} manzanas. Récord: ${best}.`,'Volver a jugar →')}
function tick(){if(state!=='playing')return;if(queue.length)dir=queue.shift();const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};const eat=apple&&head.x===apple.x&&head.y===apple.y;const body=eat?snake:snake.slice(0,-1);if(head.x<0||head.x>=N||head.y<0||head.y>=N||body.some(p=>p.x===head.x&&p.y===head.y)){end();return}snake.unshift(head);if(eat){score++;document.getElementById('score').textContent=score;if(score>best){best=score;document.getElementById('best').textContent=best;try{localStorage.setItem('ri-snake-best',String(best))}catch{}}apple=food();if(!apple){draw();end(true);return}}else snake.pop();draw()}
function run(){state='playing';overlay.hidden=true;pause.disabled=false;pause.textContent='Ⅱ Pausa';speed.disabled=true;stop();timer=setInterval(tick,Number(speed.value))}
function toggle(){if(state==='playing'){stop();state='paused';pause.textContent='▶ Seguir';show('Un respiro.','Tu jardín te espera.','Continuar →')}else if(state==='paused')run()}
function turn(name){if(state!=='playing'||queue.length>=2)return;const next=dirs[name],last=queue.length?queue[queue.length-1]:dir;if(next.x===-last.x&&next.y===-last.y||next.x===last.x&&next.y===last.y)return;queue.push(next)}
start.addEventListener('click',()=>{if(state!=='paused')reset();run()});pause.addEventListener('click',toggle);
const keys={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
document.addEventListener('keydown',e=>{if(['SELECT','INPUT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName)&&e.key===' ')return;const name=keys[e.key]||keys[e.key.toLowerCase()];if(name){if(document.activeElement.tagName==='SELECT')return;e.preventDefault();turn(name)}else if(e.code==='Space'){e.preventDefault();toggle()}});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>turn(b.dataset.dir)));
let touch=null;canvas.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointerup',e=>{if(!touch)return;const x=e.clientX-touch.x,y=e.clientY-touch.y;touch=null;if(Math.max(Math.abs(x),Math.abs(y))<12)return;turn(Math.abs(x)>Math.abs(y)?x>0?'right':'left':y>0?'down':'up')});canvas.addEventListener('pointercancel',()=>touch=null);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')toggle()});reset();
