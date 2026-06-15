const canvas = document.getElementById("signal-canvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let particles = [];
let pointer = { x: 0, y: 0, active: false };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.max(42, Math.floor((width * height) / 22000));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    r: 1 + Math.random() * 1.6,
    hue: index % 3,
  }));
}

function drawGrid() {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#f2eadb";
  ctx.lineWidth = 1;

  const spacing = width < 700 ? 54 : 72;
  for (let x = 0; x <= width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function colorFor(particle) {
  if (particle.hue === 0) return "101, 214, 191";
  if (particle.hue === 1) return "241, 179, 95";
  return "124, 168, 255";
}

function drawParticles() {
  for (const particle of particles) {
    if (!reduceMotion) {
      particle.x += particle.vx;
      particle.y += particle.vy;
    }

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    const color = colorFor(particle);
    ctx.beginPath();
    ctx.fillStyle = `rgba(${color}, 0.86)`;
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 128) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(242, 234, 219, ${0.11 * (1 - distance / 128)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
}

function drawPointerField() {
  if (!pointer.active) return;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "rgba(101, 214, 191, 0.42)";
  ctx.lineWidth = 1.2;
  ctx.arc(pointer.x, pointer.y, 76, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "rgba(241, 179, 95, 0.28)";
  ctx.arc(pointer.x, pointer.y, 118, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, width, height);
  drawGrid();
  drawParticles();
  drawPointerField();
  if (!reduceMotion) requestAnimationFrame(render);
}

window.addEventListener("resize", resize);
window.addEventListener("mousemove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener("mouseleave", () => {
  pointer.active = false;
});

resize();
render();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
});
