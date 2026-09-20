const content={
  pageTitle:"Hecho por Anderson, para mi novia 💗",
  letterDate:"21 de septiembre",
  letterTitle:"Este jardín tenía que ser para ti",
  letterBody:[
    "Si pudiera regalarte un lugar, sería un jardín de flores rosadas.",
    "Tú elegirías la más bonita y yo me quedaría mirando tu sonrisa.",
    "Feliz día, mi amor. Qué bonito es florecer contigo. 💗"
  ],
  letterSign:"Con amor, Anderson 💗",
  walkText:"Desliza entre flores y descubre mi carta 💌"
};

function applyContent(){
  document.title=content.pageTitle;
  document.getElementById("letterDate").textContent=content.letterDate;
  document.getElementById("letterTitle").textContent=content.letterTitle;
  document.getElementById("letterSign").textContent=content.letterSign;
  document.getElementById("walkText").textContent=content.walkText;
  const body=document.getElementById("letterBody");
  body.innerHTML="";
  content.letterBody.forEach(t=>{
    const p=document.createElement("p");
    p.textContent=t;
    body.appendChild(p);
  });
}

applyContent();

const canvas=document.getElementById("field");
const ctx=canvas.getContext("2d",{alpha:true});
const dpr=Math.min(window.devicePixelRatio||1,2);
const flower=new Image();
flower.decoding="async";
flower.src="flor-rosada.png";

let W=0,H=0,horizon=0;
let progress=0,target=0,dragging=false,lastY=0,velocity=0;
let rafStart=performance.now();
const maxScroll=1;

const sun=document.getElementById("sun");
const warm=document.getElementById("warm");
const letter=document.getElementById("letter");
const card=letter.firstElementChild;
const hint=document.getElementById("walkHint");

function resize(){
  W=window.innerWidth;
  H=window.innerHeight;
  horizon=H*(W<600?.48:.50);
  canvas.width=Math.round(W*dpr);
  canvas.height=Math.round(H*dpr);
  canvas.style.width=W+"px";
  canvas.style.height=H+"px";
}
resize();
addEventListener("resize",resize,{passive:true});

function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}
function lerp(a,b,t){return a+(b-a)*t}
function smooth(a,b,x){
  const t=clamp((x-a)/(b-a));
  return t*t*(3-2*t);
}

const seed=1234567;
let randState=seed;
function rnd(){
  randState=(randState*1664525+1013904223)>>>0;
  return randState/4294967296;
}

function makeFlowers(){
  randState=seed;
  const arr=[];
  const mobile=W<600;
  const count=mobile?42:64;
  for(let i=0;i<count;i++){
    const depth=Math.pow((i+.75)/count,.95);
    let x=.5+(rnd()-.5)*(0.25+depth*1.55);
    const lane=0.10+0.22*(1-depth);
    if(Math.abs(x-.5)<lane) x += (x<.5?-1:1)*(lane-Math.abs(x-.5));
    x=clamp(x,-.10,1.10);
    const y=0.505+depth*0.53+(rnd()-.5)*0.035;
    const size=(mobile?40:52)+depth*(mobile?120:180);
    arr.push({
      x,y,size,
      tilt:(rnd()-.5)*0.13,
      sway:rnd()*Math.PI*2,
      alpha:0.72+depth*.28
    });
  }
  return arr.sort((a,b)=>a.size-b.size);
}
let flowers=makeFlowers();
addEventListener("resize",()=>{flowers=makeFlowers()},{passive:true});

function drawFlower(f,t){
  const travel=progress*H*0.62;
  const perspective=1+progress*0.38;
  const y=f.y*H+travel*(.16+f.size/260);
  const x=f.x*W+(f.x-.5)*progress*W*.12;
  const size=f.size*perspective;
  if(y<horizon-80||y>H+size*.8||x<-size||x>W+size)return;

  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(f.tilt+Math.sin(t*.00045+f.sway)*0.018);
  ctx.globalAlpha=f.alpha*(1-smooth(.88,1,progress));
  ctx.drawImage(flower,-size/2,-size*.88,size,size);
  ctx.restore();
}

function draw(t){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);

  progress += (target-progress)*0.075;
  if(!dragging && Math.abs(velocity)>.00002){
    target=clamp(target+velocity);
    velocity*=.92;
  }

  if(flower.complete && flower.naturalWidth){
    const fade=1-smooth(.86,.98,progress);
    ctx.globalAlpha=fade;
    flowers.forEach(f=>drawFlower(f,t));
    ctx.globalAlpha=1;
  }

  const glow=smooth(.15,.95,progress);
  warm.style.opacity=(glow*.78).toFixed(3);
  sun.style.transform=`translate(-50%,-50%) translateY(${(progress*H*.085).toFixed(1)}px) scale(${(1+progress*.28).toFixed(3)})`;
  sun.style.opacity=(1-progress*.18).toFixed(3);

  const show=smooth(.84,.985,progress);
  letter.style.opacity=show.toFixed(3);
  letter.style.pointerEvents=show>.6?"auto":"none";
  card.style.transform=`translateY(${(22*(1-show)).toFixed(1)}px) scale(${(.95+.05*show).toFixed(3)})`;

  hint.style.opacity=progress>.035?"0":"1";

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

function addDelta(px){
  target=clamp(target+px/(H*5.2),0,maxScroll);
}

addEventListener("wheel",e=>{
  e.preventDefault();
  addDelta(e.deltaY);
},{passive:false});

addEventListener("touchstart",e=>{
  dragging=true;velocity=0;lastY=e.touches[0].clientY;
},{passive:true});

addEventListener("touchmove",e=>{
  if(!dragging)return;
  e.preventDefault();
  const y=e.touches[0].clientY;
  const dy=lastY-y;
  lastY=y;
  const step=dy/(H*5.2);
  target=clamp(target+step);
  velocity=step*.34;
},{passive:false});

addEventListener("touchend",()=>{dragging=false},{passive:true});

addEventListener("mousedown",e=>{
  dragging=true;velocity=0;lastY=e.clientY;
});

addEventListener("mousemove",e=>{
  if(!dragging)return;
  const dy=lastY-e.clientY;
  lastY=e.clientY;
  const step=dy/(H*5.2);
  target=clamp(target+step);
  velocity=step*.34;
});

addEventListener("mouseup",()=>{dragging=false});
addEventListener("mouseleave",()=>{dragging=false});

addEventListener("keydown",e=>{
  if(["ArrowDown","PageDown"," ","ArrowUp","PageUp","Home","End"].includes(e.key)){
    e.preventDefault();
    if(e.key==="Home")target=0;
    else if(e.key==="End")target=1;
    else addDelta(["ArrowUp","PageUp"].includes(e.key)?-H*.55:H*.55);
  }
});
