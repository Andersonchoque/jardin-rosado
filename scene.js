var content={
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

(function(){
  document.title=content.pageTitle;
  document.getElementById("letterDate").textContent=content.letterDate;
  document.getElementById("letterTitle").textContent=content.letterTitle;
  document.getElementById("letterSign").textContent=content.letterSign;
  document.getElementById("walkText").textContent=content.walkText;
  var body=document.getElementById("letterBody");
  body.innerHTML="";
  for(var i=0;i<content.letterBody.length;i++){
    var p=document.createElement("p");
    p.textContent=content.letterBody[i];
    body.appendChild(p);
  }
})();

var canvas=document.getElementById("field");
var ctx=canvas.getContext("2d");
var sun=document.getElementById("sun");
var hint=document.getElementById("hint");
var letter=document.getElementById("letter");
var card=letter.firstElementChild;

var W=0,H=0,DPR=1;
var progress=0,target=0;
var dragging=false,lastY=0,velocity=0;
var flowerList=[];
var sparkles=[];
var seed=24681357;
var rndState=seed;

function clamp(v,a,b){
  if(a===undefined)a=0;
  if(b===undefined)b=1;
  return Math.max(a,Math.min(b,v));
}
function smooth(a,b,x){
  var t=clamp((x-a)/(b-a),0,1);
  return t*t*(3-2*t);
}
function rnd(){
  rndState=(rndState*1664525+1013904223)>>>0;
  return rndState/4294967296;
}

function setSize(){
  W=Math.max(320,window.innerWidth||320);
  H=Math.max(480,window.innerHeight||480);
  DPR=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(W*DPR);
  canvas.height=Math.round(H*DPR);
  canvas.style.width=W+"px";
  canvas.style.height=H+"px";
  buildFlowers();
}
window.addEventListener("resize",setSize,{passive:true});
window.addEventListener("orientationchange",function(){setTimeout(setSize,180);},{passive:true});

function buildFlowers(){
  rndState=seed;
  flowerList=[];
  sparkles=[];

  var mobile=W<700;
  var rows=mobile?24:34;

  for(var i=0;i<rows;i++){
    var d=(i+1)/rows;
    var depth=Math.pow(d,1.75);
    var baseY=.50+depth*.55;
    var spread=.09+depth*.53;
    var size=(mobile?22:26)+depth*(mobile?145:210);

    for(var side=-1;side<=1;side+=2){
      var x=.5+side*(spread+(rnd()-.5)*(mobile?.035:.055));
      flowerList.push({
        x:x,
        y:baseY+(rnd()-.5)*.018,
        size:size*(.84+rnd()*.32),
        tilt:(rnd()-.5)*.08,
        phase:rnd()*Math.PI*2,
        depth:depth
      });
    }
  }

  var extras=mobile?[
    {x:.02,y:.96,s:180},{x:.18,y:1.01,s:155},{x:.93,y:.95,s:190},{x:.78,y:1.01,s:150}
  ]:[
    {x:.00,y:1.03,s:300},{x:.18,y:1.04,s:245},{x:.33,y:.98,s:175},
    {x:1.00,y:1.03,s:300},{x:.82,y:1.04,s:245},{x:.67,y:.98,s:175}
  ];
  for(var j=0;j<extras.length;j++){
    flowerList.push({
      x:extras[j].x,y:extras[j].y,size:extras[j].s,
      tilt:(rnd()-.5)*.06,phase:rnd()*Math.PI*2,depth:1
    });
  }

  flowerList.sort(function(a,b){return a.size-b.size;});

  var sc=mobile?12:20;
  for(var k=0;k<sc;k++){
    sparkles.push({
      x:rnd(),y:.34+rnd()*.60,
      r:.8+rnd()*2.2,
      phase:rnd()*Math.PI*2,
      speed:.5+rnd()*.8
    });
  }
}

function petalGradient(size){
  var g=ctx.createLinearGradient(0,-size*.40,0,size*.06);
  g.addColorStop(0,"#fff0f7");
  g.addColorStop(.24,"#ffc4df");
  g.addColorStop(.62,"#f66aaa");
  g.addColorStop(1,"#c92e7e");
  return g;
}

function drawLeaf(x,y,scale,flip,angle){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle);
  ctx.scale(flip*scale,scale);
  var g=ctx.createLinearGradient(0,-20,26,18);
  g.addColorStop(0,"#4f873a");
  g.addColorStop(1,"#1f4d23");
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.quadraticCurveTo(24,-17,43,-9);
  ctx.quadraticCurveTo(27,9,0,0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFlower(f,time){
  var scaleGrow=1+progress*.22;
  var size=f.size*scaleGrow;
  var push=progress*H*(.12+.33*f.depth);
  var baseX=f.x*W+(f.x-.5)*W*progress*.12;
  var baseY=f.y*H+push;
  var headY=baseY-size*.50;

  if(baseX<-size||baseX>W+size||headY<-size||headY>H+size)return;

  var fade=1-smooth(.86,.99,progress);
  if(fade<=0)return;

  ctx.save();
  ctx.globalAlpha=fade;

  var stemTop=headY+size*.10;
  var stemBottom=baseY+size*.06;

  var stemGrad=ctx.createLinearGradient(baseX,stemTop,baseX,stemBottom);
  stemGrad.addColorStop(0,"#5b8c35");
  stemGrad.addColorStop(1,"#20441f");
  ctx.strokeStyle=stemGrad;
  ctx.lineWidth=Math.max(2,size*.035);
  ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(baseX,stemBottom);
  ctx.quadraticCurveTo(baseX+Math.sin(time*.0005+f.phase)*size*.04,(stemTop+stemBottom)/2,baseX,stemTop);
  ctx.stroke();

  drawLeaf(baseX,headY+size*.34,size/180,-1,-.42);
  drawLeaf(baseX,headY+size*.48,size/200,1,.42);

  ctx.translate(baseX,headY);
  ctx.rotate(f.tilt+Math.sin(time*.00055+f.phase)*.012);

  var petalFill=petalGradient(size);

  for(var ring=0;ring<2;ring++){
    var count=ring===0?14:12;
    var radius=ring===0?size*.20:size*.13;
    var len=ring===0?size*.32:size*.25;
    var wid=ring===0?size*.105:size*.09;

    for(var i=0;i<count;i++){
      var a=(Math.PI*2/count)*i+(ring?Math.PI/count:0);
      ctx.save();
      ctx.rotate(a);
      ctx.translate(0,-radius);
      ctx.fillStyle=petalFill;
      ctx.beginPath();
      ctx.ellipse(0,-len*.32,wid,len*.50,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  var centerR=size*.105;
  var cg=ctx.createRadialGradient(-centerR*.25,-centerR*.25,centerR*.08,0,0,centerR);
  cg.addColorStop(0,"#fff08b");
  cg.addColorStop(.36,"#ffd344");
  cg.addColorStop(.72,"#f3a81c");
  cg.addColorStop(1,"#bc6411");
  ctx.fillStyle=cg;
  ctx.beginPath();
  ctx.arc(0,0,centerR,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="rgba(255,246,160,.75)";
  var dots=20;
  for(var d=0;d<dots;d++){
    var ang=d*2.3999632297;
    var rr=centerR*.72*Math.sqrt((d+.5)/dots);
    ctx.beginPath();
    ctx.arc(Math.cos(ang)*rr,Math.sin(ang)*rr,Math.max(1,size*.008),0,Math.PI*2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSparkles(time){
  var fade=1-smooth(.78,.96,progress);
  for(var i=0;i<sparkles.length;i++){
    var s=sparkles[i];
    var a=.22+.55*Math.pow(Math.sin(time*.001*s.speed+s.phase),2);
    ctx.save();
    ctx.globalAlpha=a*fade;
    ctx.shadowBlur=12;
    ctx.shadowColor="#ffd27a";
    ctx.fillStyle="#ffe7a4";
    ctx.beginPath();
    ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

function animate(time){
  progress += (target-progress)*.08;

  if(!dragging && Math.abs(velocity)>.00002){
    target=clamp(target+velocity,0,1);
    velocity*=.91;
  }

  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);

  drawSparkles(time);
  for(var i=0;i<flowerList.length;i++){
    drawFlower(flowerList[i],time);
  }

  sun.style.transform="translate(-50%,-50%) translateY("+
    (progress*H*.045).toFixed(1)+"px) scale("+(1+progress*.16).toFixed(3)+")";
  sun.style.opacity=(1-progress*.12).toFixed(3);

  var show=smooth(.82,.985,progress);
  letter.style.opacity=show.toFixed(3);
  letter.style.pointerEvents=show>.65?"auto":"none";
  card.style.transform="translateY("+(24*(1-show)).toFixed(1)+"px) scale("+(.95+.05*show).toFixed(3)+")";
  hint.style.opacity=progress>.025?"0":"1";

  requestAnimationFrame(animate);
}

function addDelta(px){
  target=clamp(target+px/(H*4.6),0,1);
}

window.addEventListener("wheel",function(e){
  e.preventDefault();
  addDelta(e.deltaY);
},{passive:false});

window.addEventListener("touchstart",function(e){
  if(!e.touches||!e.touches.length)return;
  dragging=true;
  velocity=0;
  lastY=e.touches[0].clientY;
},{passive:true});

window.addEventListener("touchmove",function(e){
  if(!dragging||!e.touches||!e.touches.length)return;
  e.preventDefault();
  var y=e.touches[0].clientY;
  var dy=lastY-y;
  lastY=y;
  var step=dy/(H*4.6);
  target=clamp(target+step,0,1);
  velocity=step*.30;
},{passive:false});

window.addEventListener("touchend",function(){dragging=false;},{passive:true});
window.addEventListener("touchcancel",function(){dragging=false;},{passive:true});

window.addEventListener("mousedown",function(e){
  dragging=true;velocity=0;lastY=e.clientY;
});
window.addEventListener("mousemove",function(e){
  if(!dragging)return;
  var dy=lastY-e.clientY;
  lastY=e.clientY;
  var step=dy/(H*4.6);
  target=clamp(target+step,0,1);
  velocity=step*.30;
});
window.addEventListener("mouseup",function(){dragging=false;});
window.addEventListener("mouseleave",function(){dragging=false;});

window.addEventListener("keydown",function(e){
  var keys=["ArrowDown","PageDown"," ","ArrowUp","PageUp","Home","End"];
  if(keys.indexOf(e.key)!==-1){
    e.preventDefault();
    if(e.key==="Home")target=0;
    else if(e.key==="End")target=1;
    else addDelta((e.key==="ArrowUp"||e.key==="PageUp")?-H*.65:H*.65);
  }
});

setSize();
requestAnimationFrame(animate);
