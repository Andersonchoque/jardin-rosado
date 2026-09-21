(() => {
  'use strict';

  const content = {
    pageTitle: 'Hecho por Anderson, para mi novia 💗',
    letterDate: '21 de septiembre',
    letterTitle: 'Este jardín tenía que ser para ti',
    letterBody: [
      'Si pudiera regalarte un lugar, sería un jardín de flores rosadas.',
      'Tú elegirías la más bonita y yo me quedaría mirando tu sonrisa.',
      'Feliz día, mi amor. Qué bonito es florecer contigo. 💗'
    ],
    letterSign: 'Con amor, Anderson 💗',
    walkText: 'Desliza entre flores y descubre mi carta 💌'
  };

  document.title = content.pageTitle;
  document.getElementById('letterDate').textContent = content.letterDate;
  document.getElementById('letterTitle').textContent = content.letterTitle;
  document.getElementById('letterSign').textContent = content.letterSign;
  document.getElementById('walkText').textContent = content.walkText;
  const letterBody = document.getElementById('letterBody');
  letterBody.innerHTML = '';
  content.letterBody.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    letterBody.appendChild(p);
  });

  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d', { alpha: true });
  const warm = document.getElementById('warm');
  const sun = document.getElementById('sun');
  const letter = document.getElementById('letter');
  const card = letter.querySelector('.letter-card');
  const hint = document.getElementById('walkHint');

  const flowerImg = new Image();
  flowerImg.decoding = 'async';
  flowerImg.src = 'flor-rosada.png';

  let W = innerWidth;
  let H = innerHeight;
  let DPR = Math.min(devicePixelRatio || 1, 2);
  let progress = 0;
  let target = 0;
  let dragging = false;
  let lastY = 0;
  let flowers = [];

  function clamp(v, min = 0, max = 1) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) {
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  function seeded(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function buildFlowers() {
    const rnd = seeded(20260921);
    const mobile = W < 620;
    const count = mobile ? 38 : 54;
    const list = [];

    for (let i = 0; i < count; i++) {
      const depth = (i + 0.65) / count;
      const side = i % 2 === 0 ? -1 : 1;
      const jitter = (rnd() - 0.5) * 0.1;
      const lane = 0.28 + rnd() * 0.58;
      const sizeMul = 0.9 + rnd() * 0.22;
      const swayPhase = rnd() * Math.PI * 2;
      list.push({ depth, side, lane, jitter, sizeMul, swayPhase });
    }

    list.push(
      { depth: .48, side: -1, lane: .28, jitter: 0, sizeMul: 1.05, swayPhase: 1.1 },
      { depth: .52, side:  1, lane: .31, jitter: 0, sizeMul: 1.00, swayPhase: 2.4 },
      { depth: .72, side: -1, lane: .42, jitter: 0, sizeMul: 1.10, swayPhase: 4.1 },
      { depth: .77, side:  1, lane: .45, jitter: 0, sizeMul: 1.08, swayPhase: 5.0 }
    );

    flowers = list.sort((a, b) => a.depth - b.depth);
  }

  function resize() {
    W = innerWidth;
    H = innerHeight;
    DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildFlowers();
  }

  addEventListener('resize', resize, { passive: true });
  if (window.visualViewport) visualViewport.addEventListener('resize', resize, { passive: true });
  resize();

  function drawLeaf(x, y, length, angle, alpha = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha *= alpha;
    const grad = ctx.createLinearGradient(0, 0, length, 0);
    grad.addColorStop(0, '#244817');
    grad.addColorStop(.55, '#3f7628');
    grad.addColorStop(1, '#6b9c3d');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * .46, -length * .24, length, 0);
    ctx.quadraticCurveTo(length * .48, length * .22, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFlower(f, t) {
    const d = clamp(f.depth);
    const mobile = W < 620;
    const horizon = H * (mobile ? .455 : .47);
    const ground = H - horizon;

    const travel = progress * lerp(7, 34, d);
    const baseY = Math.min(H - (mobile ? 18 : 22), horizon + ground * lerp(.08, .92, d) + travel);

    const headSize = lerp(mobile ? 18 : 20, mobile ? 76 : 108, Math.pow(d, 1.08)) * f.sizeMul * (1 + progress * .05);
    const stemH = lerp(mobile ? 22 : 26, mobile ? 118 : 165, Math.pow(d, .98)) * f.sizeMul;

    const pathHalf = lerp(W * .035, W * (mobile ? .18 : .145), d);
    const usable = Math.max(24, W * .5 - pathHalf - headSize * .62 - 10);
    let x = W * .5 + f.side * (pathHalf + usable * f.lane) + f.jitter * W;
    x = clamp(x, headSize * .56 + 7, W - headSize * .56 - 7);

    const topY = baseY - stemH;
    const alpha = (1 - smooth(.82, .985, progress)) * lerp(.78, 1, d);
    if (alpha <= .01) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(0,0,0,.16)';
    ctx.beginPath();
    ctx.ellipse(x, baseY + 1, headSize * .38, headSize * .10, 0, 0, Math.PI * 2);
    ctx.fill();

    const sway = Math.sin(t * .00055 + f.swayPhase) * lerp(.4, 1.9, d);

    const stemGrad = ctx.createLinearGradient(x, topY, x, baseY);
    stemGrad.addColorStop(0, '#4f812d');
    stemGrad.addColorStop(1, '#274b19');
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = Math.max(1.2, lerp(1.2, 4.4, d));
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + sway * 1.8, topY + stemH * .52, x + sway, topY + headSize * .14);
    ctx.stroke();

    const leafLen = lerp(9, 34, d);
    drawLeaf(x, baseY - stemH * .34, leafLen, f.side < 0 ? -2.65 : -.48, .92);
    drawLeaf(x, baseY - stemH * .56, leafLen * .82, f.side < 0 ? -.42 : -2.72, .88);

    if (flowerImg.complete && flowerImg.naturalWidth) {
      ctx.save();
      ctx.translate(x + sway, topY);
      ctx.rotate(sway * .0025);
      ctx.drawImage(flowerImg, -headSize / 2, -headSize / 2, headSize, headSize);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawMotes(t) {
    ctx.save();
    ctx.globalAlpha = .35 * (1 - smooth(.75, .98, progress));
    ctx.fillStyle = '#ffe2a1';
    for (let i = 0; i < 18; i++) {
      const x = ((i * 83.17 + t * .007) % (W + 80)) - 40;
      const y = H * .53 + ((i * 47.1 + t * .003) % (H * .42));
      const r = 1 + (i % 3) * .55;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function render(t) {
    progress += (target - progress) * .075;
    if (Math.abs(target - progress) < .0001) progress = target;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    flowers.forEach(f => drawFlower(f, t));
    drawMotes(t);

    warm.style.opacity = String(progress * .72);
    sun.style.transform = `translate(-50%,-50%) translateY(${(progress * H * .045).toFixed(1)}px) scale(${(1 + progress * .08).toFixed(3)})`;
    sun.style.opacity = String(1 - progress * .18);

    const show = smooth(.78, .96, progress);
    letter.style.opacity = show.toFixed(3);
    letter.style.pointerEvents = show > .55 ? 'auto' : 'none';
    card.style.transform = `translateY(${(22 * (1 - show)).toFixed(1)}px) scale(${(.95 + .05 * show).toFixed(3)})`;
    hint.style.opacity = progress > .035 ? '0' : '1';

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  function overLetter(targetEl) {
    return !!(targetEl && targetEl.closest && targetEl.closest('.letter-card') && progress > .75);
  }

  function addDelta(px) {
    target = clamp(target + px / Math.max(850, H * 4.9));
  }

  addEventListener('wheel', e => {
    if (overLetter(e.target)) return;
    if (e.cancelable) e.preventDefault();
    addDelta(e.deltaY);
  }, { passive: false });

  addEventListener('touchstart', e => {
    if (overLetter(e.target) || !e.touches.length) return;
    dragging = true;
    lastY = e.touches[0].clientY;
  }, { passive: true });

  addEventListener('touchmove', e => {
    if (!dragging || overLetter(e.target) || !e.touches.length) return;
    const y = e.touches[0].clientY;
    const dy = lastY - y;
    lastY = y;
    if (e.cancelable) e.preventDefault();
    addDelta(dy * 1.18);
  }, { passive: false });

  addEventListener('touchend', () => { dragging = false; }, { passive: true });
  addEventListener('touchcancel', () => { dragging = false; }, { passive: true });

  addEventListener('keydown', e => {
    if (!['ArrowDown','PageDown',' ','ArrowUp','PageUp','Home','End'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = 1;
    else addDelta(['ArrowUp','PageUp'].includes(e.key) ? -H * .55 : H * .55);
  });
})();
