const canvas = document.getElementById("signal-canvas");
const ctx = canvas.getContext("2d");

document.documentElement.classList.add("motion-ready");

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

function updateScrolledState() {
  document.body.classList.toggle("has-scrolled", window.scrollY > 70);
}

updateScrolledState();
window.addEventListener("scroll", updateScrolledState, { passive: true });

function targetScrollTop(target) {
  const scrollMargin = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - scrollMargin);
}

function scrollToTarget(target, behavior = reduceMotion ? "auto" : "smooth") {
  const top = targetScrollTop(target);
  window.scrollTo({ top, behavior });
}

function jumpToTarget(target) {
  const top = targetScrollTop(target);
  window.scrollTo(0, top);
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
}

let handledHash = "";

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    handledHash = href;
    history.pushState(null, "", href);
    scrollToTarget(target);
  });
});

function scrollToCurrentHash() {
  if (!window.location.hash) return;

  const targetId = decodeURIComponent(window.location.hash.slice(1));
  const target = document.getElementById(targetId);
  if (!target) return;

  handledHash = window.location.hash;
  jumpToTarget(target);
  window.requestAnimationFrame(() => jumpToTarget(target));
  window.setTimeout(() => jumpToTarget(target), 80);
  window.setTimeout(() => jumpToTarget(target), 220);
  window.setTimeout(() => jumpToTarget(target), 600);
  window.setTimeout(() => jumpToTarget(target), 1200);
}

scrollToCurrentHash();
window.addEventListener("load", scrollToCurrentHash);
window.addEventListener("hashchange", scrollToCurrentHash);
window.setInterval(() => {
  if (window.location.hash && window.location.hash !== handledHash) {
    scrollToCurrentHash();
  }
}, 250);

const kcMark = document.querySelector(".kc-mark");

if (kcMark) {
  const kcQuestion = kcMark.querySelector("[data-kc-question]");
  const kcQuestions = [
    "what should I build next?",
    "what should I design today?",
    "where should I explore next?",
    "what should I cook after this?",
  ];

  const askKcQuestion = () => {
    if (!kcQuestion) return;
    kcQuestion.textContent = kcQuestions[Math.floor(Math.random() * kcQuestions.length)];
  };

  const setImagining = (active) => {
    kcMark.classList.toggle("is-imagining", active);

    if (active) askKcQuestion();
  };

  kcMark.addEventListener("pointerenter", () => setImagining(true));
  kcMark.addEventListener("pointerleave", () => setImagining(false));
  kcMark.addEventListener("pointercancel", () => setImagining(false));
  kcMark.addEventListener("focusin", () => setImagining(true));
  kcMark.addEventListener("focusout", () => setImagining(false));
}

const motionTargets = Array.from(
  document.querySelectorAll(
    [
      ".profile-section",
      ".track-hero > *",
      ".track-scroll-hint",
      ".track-stats article",
      ".track-stage-rail",
      ".stage-hint",
      ".track-stage-panel .section-heading",
      ".color-title span",
      ".skill-token",
      ".experience-card",
      ".time-pill",
      ".impact-point",
      ".track-project-media",
      ".compact-project-media",
      ".smartkart-strip img",
      ".project-report-preview",
      ".track-project",
      ".project-action-hint",
      ".metrics-strip article",
      ".role-section .section-heading",
      ".role-card",
      ".role-click-hint",
      ".certificates-section .section-heading",
      ".certificate-preview",
      ".certificate-card",
      ".certificate-meta",
      ".about-copy",
      ".personal-ribbon span",
      ".about-signal-board article",
      ".site-footer > *"
    ].join(",")
  )
);

motionTargets.forEach((target, index) => {
  target.classList.add("motion-item");
  target.style.setProperty("--motion-delay", `${Math.min((index % 8) * 55, 275)}ms`);
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  motionTargets.forEach((target) => target.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
  );

  motionTargets.forEach((target) => revealObserver.observe(target));

  let ticking = false;
  function updatePastTargets() {
    motionTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      target.classList.toggle("is-past", rect.bottom < window.innerHeight * 0.18);
    });
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updatePastTargets);
    },
    { passive: true }
  );

  updatePastTargets();
}

const stagePanels = Array.from(document.querySelectorAll(".track-stage-panel[data-stage-title]"));
const stageTitle = document.querySelector("[data-stage-title-output]");
const stageCopy = document.querySelector("[data-stage-copy-output]");
const stageIndex = document.querySelector("[data-stage-index-output]");
const stageMeter = document.querySelector("[data-stage-meter]");
const stageNavLinks = Array.from(document.querySelectorAll("[data-stage-nav]"));

if (stagePanels.length && stageTitle && stageCopy && stageIndex) {
  let activeStage = "";
  let stageTicking = false;

  function setActiveStage(panel) {
    if (!panel || panel.dataset.stage === activeStage) return;

    activeStage = panel.dataset.stage;
    document.body.dataset.trackStage = activeStage;
    stageTitle.textContent = panel.dataset.stageTitle || "";
    stageCopy.textContent = panel.dataset.stageCopy || "";
    stageIndex.textContent = panel.dataset.stageIndex || "";

    if (stageMeter) {
      const index = stagePanels.indexOf(panel) + 1;
      stageMeter.style.setProperty("--stage-meter-width", `${(index / stagePanels.length) * 100}%`);
    }

    stagePanels.forEach((stagePanel) => {
      stagePanel.classList.toggle("is-active-stage", stagePanel === panel);
    });

    stageNavLinks.forEach((link) => {
      link.classList.toggle("is-active-stage-link", link.dataset.stageNav === activeStage);
    });
  }

  function updateStageFromScroll() {
    const hashTarget = window.location.hash
      ? stagePanels.find((panel) => `#${panel.id}` === window.location.hash)
      : null;

    if (hashTarget && window.scrollY < 4) {
      setActiveStage(hashTarget);
      stageTicking = false;
      return;
    }

    const targetLine = window.innerHeight * 0.46;
    let selectedPanel = null;
    let closestPanel = stagePanels[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    stagePanels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const containsAnchor = rect.top <= targetLine && rect.bottom >= targetLine;
      const distance = Math.min(Math.abs(rect.top - targetLine), Math.abs(rect.bottom - targetLine));

      if (containsAnchor) {
        selectedPanel = panel;
      }

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPanel = panel;
      }
    });

    if (!selectedPanel) selectedPanel = closestPanel;
    setActiveStage(selectedPanel);
    stageTicking = false;
  }

  function queueStageUpdate() {
    if (stageTicking) return;
    stageTicking = true;
    requestAnimationFrame(updateStageFromScroll);
  }

  window.addEventListener("scroll", queueStageUpdate, { passive: true });
  window.addEventListener("resize", queueStageUpdate);
  window.setInterval(queueStageUpdate, 450);
  updateStageFromScroll();
}
