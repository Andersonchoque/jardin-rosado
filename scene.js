(() => {
  'use strict';
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d', {alpha:true});
  const sun = document.getElementById('sun');
  const letter = document.getElementById('letter');
  const card = letter.querySelector('.letter-card');
  const hint = document.getElementById('hint');
  const flower = new Image();
  flower.decoding = 'async';
  flower.src = 'flor-rosada.png?v=remake-20260921';

  let W=innerWidth,H=innerHeight,DPR=1,progress=0,target=0,dragging=false,lastY=0;
  let plants=[];
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
  function rng(seed){let s=seed>>>0;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)}

  function makePlants(){
    const portrait = H > W*1.18;
    const mobile = W < 720;
    const r = rng(21092026);
    const list=[];
    const count = portrait ? 28 : mobile ? 36 : 56;
    for(let i=0;i<count;i++){
      const d=(i+.7)/count;
      const side=i%2?-1:1;
      const lane=.18+r()*.78;
      list.push({d,side,lane,j:(r()-.5)*.06,mul:.88+r()*.25,phase:r()*6.283});
    }
    const hero = portrait ? [
      [.84,-1,.16,1.12,.1],[.86,1,.16,1.1,1.8],[.67,-1,.30,1.06,2.5],[.70,1,.30,1.06,3.4]
    ] : [
      [.93,-1,.11,1.18,.2],[.94,1,.11,1.18,1.9],[.80,-1,.27,1.13,2.7],[.82,1,.27,1.13,4.1]
    ];
    hero.forEach(([d,side,lane,mul,phase])=>list.push({d,side,lane,j:0,mul,phase}));
    plants=list.sort((a,b)=>a.d-b.d);
  }

  function resize(){
    W=innerWidth; H=innerHeight; DPR=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(W*DPR); canvas.height=Math.round(H*DPR);
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0); makePlants();
  }
  addEventListener('resize',resize,{passive:true});
  if(window.visualViewport) visualViewport.addEventListener('resize',resize,{passive:true});
  resize();

  function leaf(x,y,len,angle,alpha){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha*=alpha;
    const g=ctx.createLinearGradient(0,0,len,0);g.addColorStop(0,'#284a19');g.addColorStop(.55,'#4b7d2d');g.addColorStop(1,'#77a947');ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(len*.48,-len*.25,len,0);ctx.quadraticCurveTo(len*.48,len*.22,0,0);ctx.fill();ctx.restore();
  }

  function drawPlant(p,t){
    const portrait=H>W*1.18;
    const d=p.d;
    const horizon=H*(portrait?.45:.47);
    const ground=H-horizon;
    const near = Math.pow(d,1.05);
    const maxHead = portrait ? Math.min(W*.36,145) : W<720 ? Math.min(W*.29,160) : Math.min(W*.17,235);
    const minHead = portrait ? 25 : 23;
    const head=lerp(minHead,maxHead,near)*p.mul*(1+progress*.08);
    const stem=lerp(portrait?30:28, portrait?132:178,Math.pow(d,.95))*p.mul;
    const pathHalf=lerp(W*.025, W*(portrait?.12:W<720?.15:.125), d);
    const usable=Math.max(12,W*.5-pathHalf-head*.56-9);
    let x=W*.5+p.side*(pathHalf+usable*p.lane)+p.j*W;
    x=clamp(x,head*.51+4,W-head*.51-4);
    let base=horizon+ground*lerp(.06,.93,d)+progress*lerp(3,28,d);
    base=Math.min(H-4,base);
    const alpha=(1-smooth(.83,.985,progress))*lerp(.75,1,d);
    if(alpha<.01)return;
    const sway=Math.sin(t*.00055+p.phase)*lerp(.4,1.8,d);
    const top=base-stem;
    ctx.save();ctx.globalAlpha=alpha;
    ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x,base+1,head*.34,Math.max(2,head*.075),0,0,Math.PI*2);ctx.fill();
    const sg=ctx.createLinearGradient(x,top,x,base);sg.addColorStop(0,'#578632');sg.addColorStop(1,'#284919');ctx.strokeStyle=sg;ctx.lineWidth=lerp(1.2,4.6,d);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,base);ctx.quadraticCurveTo(x+sway*2,top+stem*.54,x+sway,top+head*.12);ctx.stroke();
    const ll=lerp(10,38,d);leaf(x,base-stem*.34,ll,p.side<0?-2.62:-.50,.94);leaf(x,base-stem*.58,ll*.82,p.side<0?-.46:-2.67,.88);
    if(flower.complete&&flower.naturalWidth){ctx.save();ctx.translate(x+sway,top);ctx.rotate(sway*.002);ctx.drawImage(flower,-head/2,-head/2,head,head);ctx.restore()}
    ctx.restore();
  }

  function render(t){
    progress+=(target-progress)*.075;if(Math.abs(target-progress)<.0001)progress=target;
    ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
    plants.forEach(p=>drawPlant(p,t));
    sun.style.transform=`translate(-50%,-50%) translateY(${(progress*H*.045).toFixed(1)}px) scale(${(1+progress*.07).toFixed(3)})`;
    sun.style.opacity=String(1-progress*.17);
    const show=smooth(.79,.96,progress);letter.style.opacity=show.toFixed(3);letter.style.pointerEvents=show>.55?'auto':'none';letter.setAttribute('aria-hidden',show>.55?'false':'true');card.style.transform=`translateY(${(22*(1-show)).toFixed(1)}px) scale(${(.95+.05*show).toFixed(3)})`;
    hint.style.opacity=progress>.035?'0':'1';
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  function overCard(el){return !!(el&&el.closest&&el.closest('.letter-card')&&progress>.76)}
  function delta(px){target=clamp(target+px/Math.max(800,H*4.6))}
  addEventListener('wheel',e=>{if(overCard(e.target))return;if(e.cancelable)e.preventDefault();delta(e.deltaY)},{passive:false});
  addEventListener('touchstart',e=>{if(overCard(e.target)||!e.touches.length)return;dragging=true;lastY=e.touches[0].clientY},{passive:true});
  addEventListener('touchmove',e=>{if(!dragging||overCard(e.target)||!e.touches.length)return;const y=e.touches[0].clientY,dy=lastY-y;lastY=y;if(e.cancelable)e.preventDefault();delta(dy*1.25)},{passive:false});
  addEventListener('touchend',()=>dragging=false,{passive:true});addEventListener('touchcancel',()=>dragging=false,{passive:true});
  addEventListener('keydown',e=>{if(!['ArrowDown','PageDown',' ','ArrowUp','PageUp','Home','End'].includes(e.key))return;e.preventDefault();if(e.key==='Home')target=0;else if(e.key==='End')target=1;else delta(['ArrowUp','PageUp'].includes(e.key)?-H*.55:H*.55)});
})();
