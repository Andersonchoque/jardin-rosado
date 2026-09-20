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
const flower=new Image();
flower.decoding="async";
flower.src="flor-rosada.png";

const sun=document.getElementById("sun");
const hint=document.getElementById("hint");
const letter=document.getElementById("letter");
const card=letter.firstElementChild;

let W=0,H=0,DPR=1;
let progress=0,target=0,dragging=false,lastY=0,velocity=0;
let flowers=[],sparkles=[];
const seed=90210;
let state=seed;

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const rnd=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296};

function setViewportUnit(){
  document.documentElement.style.setProperty("--vh",(window.innerHeight*0.01)+"px");
}

function buildScene(){
  state=seed;
  flowers=[];
  sparkles=[];

  const mobile=W<700;
  const rows=mobile?34:52;

  for(let i=0;i<rows;i++){
    const d=(i+1)/rows;
    const p=Math.pow(d,1.55);
    const baseY=0.465+p*0.58;
    const spread=0.10+p*0.50;
    const size=(mobile?24:28)+p*(mobile?150:230);

    for(const side of [-1,1]){
      const jitter=(rnd()-.5)*(mobile?.045:.06);
      const x=.5+side*(spread+jitter);
      flowers.push({
        x:x,
        y:baseY+(rnd()-.5)*.018,
        size:size*(.83+rnd()*.34),
        alpha:.76+p*.24,
        sway:rnd()*Math.PI*2,
        tilt:(rnd()-.5)*.09
      });
    }
  }

  const extras=mobile
    ?[
      {x:.04,y:.82,s:190},{x:.22,y:.90,s:150},
      {x:.96,y:.82,s:190},{x:.78,y:.90,s:150}
    ]
    :[
      {x:.03,y:.84,s:290},{x:.20,y:.92,s:240},{x:.34,y:.83,s:170},
      {x:.97,y:.84,s:290},{x:.80,y:.92,s:240},{x:.66,y:.83,s:170}
    ];

  extras.forEach(e=>flowers.push({
    x:e.x,y:e.y,size:e.s,alpha:1,sway:rnd()*Math.PI*2,tilt:(rnd()-.5)*.07
  }));

  flowers.sort((a,b)=>a.size-b.size);

  const sparkCount=mobile?16:26;
  for(let i=0;i<sparkCount;i++){
    sparkles.push({
      x:rnd(),y:.38+rnd()*.55,
      r:1+rnd()*2.2,
      phase:rnd()*Math.PI*2,
      speed:.5+rnd()*.7
    });
  }
}

function resize(){
  setViewportUnit();
  W=window.innerWidth;
  H=window.innerHeight;
  DPR=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(W*DPR);
  canvas.height=Math.round(H*DPR);
  canvas.style.width=W+"px";
  canvas.style.height=H+"px";
  buildScene();
}
resize();
addEventListener("resize",resize,{passive:true});
addEventListener("orientationchange",()=>setTimeout(resize,120),{passive:true});

function drawFlower(f,t){
  const grow=1+progress*.20;
  const push=progress*H*.48;
  const x=f.x*W+(f.x-.5)*progress*W*.12;
  const y=f.y*H+push*(.18+f.size/320);
  const size=f.size*grow;

  if(x<-size||x>W+size||y<-size||y>H+size)return;

  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(f.tilt+Math.sin(t*.00055+f.sway)*.012);
  ctx.globalAlpha=f.alpha*(1-smooth(.84,.98,progress));
  ctx.drawImage(flower,-size/2,-size*.88,size,size);
  ctx.restore();
}

function drawSparkles(t){
  const fade=1-smooth(.75,.96,progress);
  ctx.save();
  for(const s of sparkles){
    const a=.35+.45*Math.pow(Math.sin(t*.001*s.speed+s.phase),2);
    ctx.globalAlpha=a*fade;
    ctx.shadowBlur=10;
    ctx.shadowColor="#ffc96b";
    ctx.fillStyle="#ffd88d";
    ctx.beginPath();
    ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function frame(t){
  progress += (target-progress)*.075;

  if(!dragging && Math.abs(velocity)>.00003){
    target=clamp(target+velocity);
    velocity*=.91;
  }

  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);

  if(flower.complete && flower.naturalWidth){
    flowers.forEach(f=>drawFlower(f,t));
  }
  drawSparkles(t);

  sun.style.transform="translate(-50%,-50%) translateY("+
    (progress*H*.055).toFixed(1)+"px) scale("+
    (1+progress*.18).toFixed(3)+")";
  sun.style.opacity=(1-progress*.15).toFixed(3);

  const show=smooth(.82,.985,progress);
  letter.style.opacity=show.toFixed(3);
  letter.style.pointerEvents=show>.65?"auto":"none";
  letter.setAttribute("aria-hidden",show>.65?"false":"true");
  card.style.transform="translateY("+
    (24*(1-show)).toFixed(1)+"px) scale("+
    (.95+.05*show).toFixed(3)+")";
  letter.style.backdropFilter="blur("+(show*4).toFixed(1)+"px)";

  hint.style.opacity=progress>.025?"0":"1";

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function addDelta(px){
  target=clamp(target+px/(H*5.0));
}

addEventListener("wheel",e=>{
  e.preventDefault();
  addDelta(e.deltaY);
},{passive:false});

addEventListener("touchstart",e=>{
  if(!e.touches.length)return;
  dragging=true;velocity=0;lastY=e.touches[0].clientY;
},{passive:true});

addEventListener("touchmove",e=>{
  if(!dragging||!e.touches.length)return;
  e.preventDefault();
  const y=e.touches[0].clientY;
  const dy=lastY-y;
  lastY=y;
  const step=dy/(H*5.0);
  target=clamp(target+step);
  velocity=step*.30;
},{passive:false});

addEventListener("touchend",()=>{dragging=false},{passive:true});
addEventListener("touchcancel",()=>{dragging=false},{passive:true});

addEventListener("pointerdown",e=>{
  if(e.pointerType==="touch")return;
  dragging=true;velocity=0;lastY=e.clientY;
});

addEventListener("pointermove",e=>{
  if(!dragging||e.pointerType==="touch")return;
  const dy=lastY-e.clientY;
  lastY=e.clientY;
  const step=dy/(H*5.0);
  target=clamp(target+step);
  velocity=step*.30;
});

addEventListener("pointerup",()=>{dragging=false});
addEventListener("pointercancel",()=>{dragging=false});

addEventListener("keydown",e=>{
  if(["ArrowDown","PageDown"," ","ArrowUp","PageUp","Home","End"].includes(e.key)){
    e.preventDefault();
    if(e.key==="Home")target=0;
    else if(e.key==="End")target=1;
    else addDelta(["ArrowUp","PageUp"].includes(e.key)?-H*.6:H*.6);
  }
});
