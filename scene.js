(() => {
  "use strict";

  const content = {
    pageTitle: "Hecho por Anderson, para mi novia 💗",
    letterDate: "21 de septiembre",
    letterTitle: "Este jardín tenía que ser para ti",
    letterBody: "Si pudiera regalarte un lugar, sería un jardín de flores rosadas. Tú elegirías la más bonita y yo me quedaría mirando tu sonrisa. Feliz día, mi amor. Qué bonito es florecer contigo. 💗",
    letterSign: "Con amor, Anderson 💗",
    walkText: "Desliza entre flores y descubre mi carta 💌"
  };

  document.title = content.pageTitle;
  for (const [id, value] of Object.entries(content)) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d", { alpha: true });
  const warm = document.getElementById("warm");
  const sun = document.getElementById("sun");
  const letter = document.getElementById("letter");
  const card = letter.querySelector(".letter-card");
  const hint = document.getElementById("walkHint");

  let W = 0, H = 0, DPR = 1;
  let progress = 0, target = 0, dragging = false, lastY = 0;
  const coarse = matchMedia("(pointer: coarse)").matches || innerWidth < 600;
  const flowers = [];
  const motes = [];

  function resize() {
    W = innerWidth;
    H = innerHeight;
    DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  addEventListener("resize", resize, { passive: true });
  if (visualViewport) visualViewport.addEventListener("resize", resize, { passive: true });
  resize();

  const rows = coarse ? 42 : 82;
  for (let i = 0; i < rows; i++) {
    const depth = Math.random();
    let side = Math.random() < 0.5 ? -1 : 1;
    let lane = 0.17 + Math.random() * 0.9;
    flowers.push({
      depth,
      side,
      lane,
      phase: Math.random() * Math.PI * 2,
      sway: 0.5 + Math.random() * 0.9,
      size: 0.72 + Math.random() * 0.58,
      tone: Math.random()
    });
  }

  for (let i = 0; i < (coarse ? 25 : 55); i++) {
    motes.push({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 3.5,
      speed: 0.015 + Math.random() * 0.035,
      phase: Math.random() * Math.PI * 2
    });
  }

  function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
  function smooth(a, b, x) {
    x = clamp((x - a) / (b - a));
    return x * x * (3 - 2 * x);
  }

  function drawPetal(x, y, rx, ry, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -ry * 0.7, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawFlower(x, y, scale, sway, tone, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(sway);

    const stemH = 85 * scale;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#31531f";
    ctx.lineWidth = Math.max(1.1, 3.2 * scale);
    ctx.beginPath();
    ctx.moveTo(0, 7 * scale);
    ctx.quadraticCurveTo(4 * scale, stemH * .48, 0, stemH);
    ctx.stroke();

    ctx.fillStyle = "#48782b";
    ctx.beginPath();
    ctx.ellipse(-8 * scale, stemH * .52, 9 * scale, 4 * scale, -.55, 0, Math.PI * 2);
    ctx.ellipse(8 * scale, stemH * .69, 9 * scale, 4 * scale, .55, 0, Math.PI * 2);
    ctx.fill();

    const petals = 14;
    const petalColor = tone > .66 ? "#ff8fc8" : tone > .33 ? "#f76caf" : "#ffadd3";
    const petalLight = tone > .5 ? "#ffd4e8" : "#ffc4df";
    for (let i = 0; i < petals; i++) {
      const a = i / petals * Math.PI * 2;
      drawPetal(0, 0, 4.4 * scale, 11 * scale, a, i % 2 ? petalColor : petalLight);
    }

    const grd = ctx.createRadialGradient(-2 * scale, -2 * scale, 1, 0, 0, 11 * scale);
    grd.addColorStop(0, "#fff5a9");
    grd.addColorStop(.45, "#f2c244");
    grd.addColorStop(1, "#a96b1d");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,248,170,.95)";
    for (let i = 0; i < 24; i++) {
      const a = i * 2.399963;
      const r = Math.sqrt((i + .5) / 24) * 7.5 * scale;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, .7 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function overLetter(targetEl) {
    return !!(targetEl && targetEl.closest && targetEl.closest(".letter-card") && progress > .78);
  }

  function advance(delta) {
    target = clamp(target + delta / Math.max(780, H * 4.9));
    hint.style.opacity = target > .03 ? "0" : "1";
  }

  addEventListener("wheel", e => {
    if (overLetter(e.target)) return;
    if (e.cancelable) e.preventDefault();
    advance(e.deltaY);
  }, { passive: false });

  addEventListener("touchstart", e => {
    if (overLetter(e.target) || !e.touches.length) return;
    dragging = true;
    lastY = e.touches[0].clientY;
  }, { passive: true });

  addEventListener("touchmove", e => {
    if (!dragging || overLetter(e.target) || !e.touches.length) return;
    const y = e.touches[0].clientY;
    const delta = lastY - y;
    lastY = y;
    if (e.cancelable) e.preventDefault();
    advance(delta * 1.25);
  }, { passive: false });

  for (const type of ["touchend", "touchcancel"]) {
    addEventListener(type, () => { dragging = false; }, { passive: true });
  }

  addEventListener("keydown", e => {
    const down = ["ArrowDown", "PageDown", " ", "End"];
    const up = ["ArrowUp", "PageUp", "Home"];
    if (!down.includes(e.key) && !up.includes(e.key)) return;
    e.preventDefault();
    if (e.key === "Home") target = 0;
    else if (e.key === "End") target = 1;
    else advance((down.includes(e.key) ? 1 : -1) * H * .55);
  });

  function render(t) {
    progress += (target - progress) * .075;
    if (Math.abs(target - progress) < .0001) progress = target;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    warm.style.opacity = String(progress * .88);
    sun.style.transform = `translate(-50%,-50%) translateY(${(progress * H * .08).toFixed(1)}px) scale(${(1 + progress * .34).toFixed(3)})`;

    for (const f of flowers) {
      const z = (f.depth + progress * 1.16) % 1;
      const d = Math.pow(z, 1.85);
      if (d < .02 || d > .985) continue;
      const scale = (.15 + d * 1.75) * f.size * Math.max(.72, Math.min(1.2, W / 900));
      const centerGap = 35 + d * Math.min(W * .13, 125);
      const x = W / 2 + f.side * (centerGap + f.lane * d * W * .42);
      const y = H * .5 + d * H * .58;
      const sway = Math.sin(t * .001 * f.sway + f.phase) * (.018 + d * .045);
      drawFlower(x, y, scale, sway, f.tone, (1 - smooth(.91, 1, z)) * .96);
    }

    const finalGrow = smooth(.63, .96, progress);
    if (finalGrow > 0) {
      const mainScale = (.58 + finalGrow * 2.45) * Math.min(W, H) / 390;
      drawFlower(W / 2, H * .52, mainScale, Math.sin(t * .0007) * .012, .72, finalGrow);
    }

    const moteFade = 1 - smooth(.75, .98, progress);
    ctx.fillStyle = "#ffe6a4";
    for (const m of motes) {
      m.y -= m.speed * .008;
      if (m.y < -.04) m.y = 1.04;
      const x = (m.x + Math.sin(t * .0006 + m.phase) * .018) * W;
      const y = (.48 + m.y * .55) * H;
      ctx.globalAlpha = .22 * moteFade;
      ctx.beginPath();
      ctx.arc(x, y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const show = smooth(.86, .985, progress);
    letter.style.opacity = show.toFixed(3);
    letter.style.pointerEvents = show > .5 ? "auto" : "none";
    card.style.transform = `translateY(${(24 * (1 - show)).toFixed(1)}px) scale(${(.94 + .06 * show).toFixed(3)})`;

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();