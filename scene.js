(function(){
  'use strict';

  var content={
    pageTitle:'Hecho por Anderson, para mi novia 💗',
    letterDate:'21 de septiembre',
    letterTitle:'Este jardín tenía que ser para ti',
    letterBody:[
      'Si pudiera regalarte un lugar, sería un jardín de flores rosadas.',
      'Tú elegirías la más bonita y yo me quedaría mirando tu sonrisa.',
      'Feliz día, mi amor. Qué bonito es florecer contigo. 💗'
    ],
    letterSign:'Con amor, Anderson 💗',
    walkText:'Desliza entre flores y descubre mi carta 💌'
  };

  document.title=content.pageTitle;
  document.getElementById('letterDate').textContent=content.letterDate;
  document.getElementById('letterTitle').textContent=content.letterTitle;
  document.getElementById('letterSign').textContent=content.letterSign;
  document.getElementById('walkText').textContent=content.walkText;
  var bodyEl=document.getElementById('letterBody');
  bodyEl.innerHTML='';
  for(var bi=0;bi<content.letterBody.length;bi++){
    var p=document.createElement('p');
    p.textContent=content.letterBody[bi];
    bodyEl.appendChild(p);
  }

  var canvas=document.getElementById('field');
  var ctx=canvas.getContext('2d');
  var sun=document.getElementById('sun');
  var warm=document.getElementById('warm');
  var hint=document.getElementById('walkHint');
  var letter=document.getElementById('letter');
  var card=letter.querySelector('.letter-card');

  var flowerImg=new Image();
  var flowerReady=false;
  flowerImg.onload=function(){ flowerReady=true; };
  flowerImg.onerror=function(){ flowerReady=false; };
  flowerImg.src='flor-rosada.png?v=20260920b';

  var W=0,H=0,DPR=1,horizon=0;
  var progress=0,target=0,velocity=0;
  var dragging=false,lastY=0;
  var fieldFlowers=[];
  var particles=[];
  var seed=481516;
  var randomState=seed;

  function rnd(){
    randomState=(randomState*1664525+1013904223)>>>0;
    return randomState/4294967296;
  }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function fract(v){ return v-Math.floor(v); }
  function smooth(a,b,x){
    var t=clamp((x-a)/(b-a),0,1);
    return t*t*(3-2*t);
  }

  function resize(){
    W=Math.max(320,window.innerWidth||320);
    H=Math.max(420,window.innerHeight||420);
    DPR=Math.min(window.devicePixelRatio||1,2);
    horizon=H*(W<700?0.455:0.47);
    canvas.width=Math.round(W*DPR);
    canvas.height=Math.round(H*DPR);
    canvas.style.width=W+'px';
    canvas.style.height=H+'px';
    buildScene();
  }

  function buildScene(){
    randomState=seed;
    fieldFlowers=[];
    particles=[];
    var mobile=W<700;
    var count=mobile?34:60;
    for(var i=0;i<count;i++){
      var side=i%2===0?-1:1;
      fieldFlowers.push({
        side:side,
        base:(i+0.5)/count + rnd()*0.05,
        lane:0.72+rnd()*0.35,
        scale:0.78+rnd()*0.48,
        sway:rnd()*Math.PI*2,
        speed:0.76+rnd()*0.42
      });
    }
    var pc=mobile?16:28;
    for(var j=0;j<pc;j++){
      particles.push({
        x:rnd(),
        y:0.50+rnd()*0.47,
        r:0.9+rnd()*2.4,
        phase:rnd()*Math.PI*2,
        speed:0.45+rnd()*0.7
      });
    }
  }

  function leaf(x,y,size,flip,angle,alpha){
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(flip,1);
    var g=ctx.createLinearGradient(0,-size*0.2,size,size*0.3);
    g.addColorStop(0,'#4e8b39');
    g.addColorStop(1,'#1e4921');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.quadraticCurveTo(size*0.55,-size*0.42,size,0);
    ctx.quadraticCurveTo(size*0.55,size*0.42,0,0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function fallbackFlower(x,y,size,alpha,rotation){
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.translate(x,y);
    ctx.rotate(rotation);
    for(var ring=0;ring<2;ring++){
      var petals=ring===0?16:12;
      var radius=ring===0?size*0.20:size*0.13;
      for(var i=0;i<petals;i++){
        ctx.save();
        ctx.rotate(i*Math.PI*2/petals+(ring?0.12:0));
        ctx.translate(0,-radius);
        var pg=ctx.createLinearGradient(0,-size*0.35,0,size*0.06);
        pg.addColorStop(0,'#fff0f8');
        pg.addColorStop(0.35,'#ffabd2');
        pg.addColorStop(1,'#d93e8d');
        ctx.fillStyle=pg;
        ctx.beginPath();
        ctx.ellipse(0,-size*(ring===0?0.18:0.14),size*(ring===0?0.065:0.052),size*(ring===0?0.20:0.15),0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }
    var c=ctx.createRadialGradient(-size*0.025,-size*0.025,size*0.01,0,0,size*0.11);
    c.addColorStop(0,'#fff08b');
    c.addColorStop(0.45,'#ffd23c');
    c.addColorStop(1,'#bb6510');
    ctx.fillStyle=c;
    ctx.beginPath();
    ctx.arc(0,0,size*0.105,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function flowerHead(x,y,size,alpha,rotation){
    if(flowerReady){
      ctx.save();
      ctx.globalAlpha=alpha;
      ctx.translate(x,y);
      ctx.rotate(rotation);
      ctx.drawImage(flowerImg,-size/2,-size/2,size,size);
      ctx.restore();
    }else{
      fallbackFlower(x,y,size,alpha,rotation);
    }
  }

  function drawPlant(x,groundY,size,alpha,sway,time){
    var headY=groundY-size*0.56;
    var bend=Math.sin(time*0.00055+sway)*size*0.025;

    ctx.save();
    ctx.globalAlpha=alpha;
    var sg=ctx.createLinearGradient(x,headY,x,groundY);
    sg.addColorStop(0,'#57893b');
    sg.addColorStop(1,'#21451f');
    ctx.strokeStyle=sg;
    ctx.lineWidth=Math.max(2,size*0.025);
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(x,groundY+size*0.05);
    ctx.quadraticCurveTo(x+bend,headY+size*0.35,x,headY+size*0.06);
    ctx.stroke();
    ctx.restore();

    leaf(x,headY+size*0.34,size*0.26,-1,-0.38,alpha*0.92);
    leaf(x,headY+size*0.50,size*0.24,1,0.40,alpha*0.90);
    flowerHead(x,headY,size,alpha,Math.sin(time*0.00042+sway)*0.018);
  }

  function drawField(time){
    var items=[];
    var travel=progress*3.55;
    for(var i=0;i<fieldFlowers.length;i++){
      var f=fieldFlowers[i];
      var z=fract(f.base+travel*f.speed);
      z=Math.pow(z,1.58);
      if(z<0.012)continue;
      var laneHalf=W*(0.055+z*0.50)*f.lane;
      var x=W*0.5+f.side*laneHalf;
      var y=horizon+z*(H-horizon+H*0.17);
      var size=Math.min(W,H)*(0.045+z*0.34)*f.scale;
      var edgeFade=smooth(0.01,0.08,z)*(1-smooth(0.91,1,z));
      var endFade=1-smooth(0.72,0.92,progress);
      var alpha=edgeFade*endFade*(0.78+z*0.22);
      if(alpha>0.01){
        items.push({x:x,y:y,size:size,alpha:alpha,sway:f.sway,z:z});
      }
    }
    items.sort(function(a,b){return a.z-b.z;});
    for(var j=0;j<items.length;j++){
      drawPlant(items[j].x,items[j].y,items[j].size,items[j].alpha,items[j].sway,time);
    }
  }

  function drawParticles(time){
    var fade=1-smooth(0.80,0.96,progress);
    for(var i=0;i<particles.length;i++){
      var p=particles[i];
      var pulse=0.25+0.55*Math.pow(Math.sin(time*0.001*p.speed+p.phase),2);
      ctx.save();
      ctx.globalAlpha=pulse*fade;
      ctx.fillStyle='#ffe6a2';
      ctx.shadowBlur=12;
      ctx.shadowColor='#ffc961';
      ctx.beginPath();
      ctx.arc(p.x*W,p.y*H,p.r,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawCenterFlower(time){
    var show=smooth(0.56,0.76,progress)*(1-smooth(0.88,0.985,progress));
    if(show<=0.001)return;
    var t=smooth(0.56,0.88,progress);
    var size=Math.min(W,H)*(0.18+0.72*Math.pow(t,1.22));
    var x=W*0.5;
    var y=H*(0.50+0.055*t);
    flowerHead(x,y,size,show*0.96,Math.sin(time*0.00035)*0.01);
  }

  function animate(time){
    if(!dragging && Math.abs(velocity)>0.00003){
      target=clamp(target+velocity,0,1);
      velocity*=0.91;
    }
    progress+=(target-progress)*0.085;
    if(Math.abs(target-progress)<0.00005)progress=target;

    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,W,H);
    drawParticles(time);
    drawField(time);
    drawCenterFlower(time);

    warm.style.opacity=(progress*0.75).toFixed(3);
    sun.style.transform='translate(-50%,-50%) translateY('+(progress*H*0.08).toFixed(1)+'px) scale('+(1+progress*0.24).toFixed(3)+')';
    sun.style.opacity=(1-progress*0.16).toFixed(3);

    var letterShow=smooth(0.875,0.985,progress);
    letter.style.opacity=letterShow.toFixed(3);
    letter.style.pointerEvents=letterShow>0.55?'auto':'none';
    card.style.transform='translateY('+(24*(1-letterShow)).toFixed(1)+'px) scale('+(0.95+letterShow*0.05).toFixed(3)+')';
    hint.style.opacity=progress>0.025?'0':'1';

    requestAnimationFrame(animate);
  }

  function addDelta(px){
    target=clamp(target+px/(H*5.0),0,1);
  }

  window.addEventListener('wheel',function(e){
    e.preventDefault();
    addDelta(e.deltaY);
  },{passive:false});

  window.addEventListener('touchstart',function(e){
    if(!e.touches||!e.touches.length)return;
    dragging=true;
    velocity=0;
    lastY=e.touches[0].clientY;
  },{passive:true});

  window.addEventListener('touchmove',function(e){
    if(!dragging||!e.touches||!e.touches.length)return;
    e.preventDefault();
    var y=e.touches[0].clientY;
    var dy=lastY-y;
    lastY=y;
    var step=dy/(H*5.0);
    target=clamp(target+step,0,1);
    velocity=step*0.35;
  },{passive:false});

  window.addEventListener('touchend',function(){dragging=false;},{passive:true});
  window.addEventListener('touchcancel',function(){dragging=false;},{passive:true});

  window.addEventListener('mousedown',function(e){
    dragging=true;
    velocity=0;
    lastY=e.clientY;
  });
  window.addEventListener('mousemove',function(e){
    if(!dragging)return;
    var dy=lastY-e.clientY;
    lastY=e.clientY;
    var step=dy/(H*5.0);
    target=clamp(target+step,0,1);
    velocity=step*0.35;
  });
  window.addEventListener('mouseup',function(){dragging=false;});
  window.addEventListener('mouseleave',function(){dragging=false;});

  window.addEventListener('keydown',function(e){
    var keys=['ArrowDown','PageDown',' ','ArrowUp','PageUp','Home','End'];
    if(keys.indexOf(e.key)!==-1){
      e.preventDefault();
      if(e.key==='Home')target=0;
      else if(e.key==='End')target=1;
      else addDelta((e.key==='ArrowUp'||e.key==='PageUp')?-H*0.65:H*0.65);
    }
  });

  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('orientationchange',function(){setTimeout(resize,180);},{passive:true});

  resize();
  requestAnimationFrame(animate);
})();