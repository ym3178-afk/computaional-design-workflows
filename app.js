document.documentElement.classList.add('js');

const chapters = [
  { number: '01', short: '2D Spatial Canvas', target: 'object-01', lat: 0.58, lon: -2.32 },
  { number: '02', short: '3D Spatial Canvas', target: 'object-02', lat: -0.16, lon: -1.46 },
  { number: '03', short: 'Temporal Structure', target: 'object-03', lat: 0.34, lon: -0.48 },
  { number: '04', short: 'Relational Structure', target: 'object-04', lat: -0.54, lon: 0.28 },
  { number: '05', short: 'Geospatial Structure', target: 'object-05', lat: 0.08, lon: 1.18 },
  { number: '06', short: 'Engagement Component', target: 'object-06', lat: 0.60, lon: 2.08 },
  { number: '07', short: 'Agent', target: 'object-07', lat: -0.42, lon: 2.82 }
];

// Opening transition is intentionally brief so it feels cinematic without blocking navigation.
window.addEventListener('load', () => {
  window.setTimeout(() => document.body.classList.add('is-loaded'), 520);
});
window.setTimeout(() => document.body.classList.add('is-loaded'), 1800);

// Preview dialog.
const dialog = document.getElementById('preview');
const frame = dialog.querySelector('iframe');
const previewTitle = document.getElementById('preview-title');
document.querySelectorAll('.actions button').forEach((button) => {
  button.addEventListener('click', () => {
    previewTitle.textContent = button.dataset.title;
    frame.src = button.dataset.src;
    dialog.showModal();
  });
});
function closePreview() {
  dialog.close();
  frame.src = 'about:blank';
}
dialog.querySelector('button').addEventListener('click', closePreview);
dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closePreview();
});
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePreview();
});

// Scroll reveal keeps the long archive readable and gives each object a clear entrance.
const revealItems = document.querySelectorAll('.intro, .heading, .objects article, #aesthetic, #documentation');
revealItems.forEach((item) => item.classList.add('reveal-item'));
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
revealItems.forEach((item) => revealObserver.observe(item));

// Interactive spherical directory. It is rendered with a lightweight 3D projection,
// so the landing page stays dependency-free and works on GitHub Pages.
const canvas = document.getElementById('chapter-sphere');
const context = canvas.getContext('2d');
const currentLabel = document.getElementById('sphere-current');
const chapterButtons = [...document.querySelectorAll('.sphere-labels button')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const spherePoints = [];
const pointCount = 760;
const goldenAngle = Math.PI * (3 - Math.sqrt(5));
for (let index = 0; index < pointCount; index += 1) {
  const y = 1 - (index / (pointCount - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = goldenAngle * index;
  spherePoints.push({ x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius });
}

let width = 0;
let height = 0;
let pixelRatio = 1;
let rotationX = -0.10;
let rotationY = -0.42;
let targetRotationX = rotationX;
let targetRotationY = rotationY;
let velocityX = 0;
let velocityY = 0;
let dragging = false;
let moved = false;
let pointerX = 0;
let pointerY = 0;
let hoveredNode = 0;
let activeNode = 0;
let introProgress = reducedMotion ? 1 : 0;
let previousTime = performance.now();
let projectedNodes = [];

function resizeSphere() {
  const bounds = canvas.getBoundingClientRect();
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = Math.max(320, bounds.width);
  height = Math.max(340, bounds.height);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function rotatePoint(point, xAngle = rotationX, yAngle = rotationY) {
  const cosY = Math.cos(yAngle);
  const sinY = Math.sin(yAngle);
  const x1 = point.x * cosY + point.z * sinY;
  const z1 = -point.x * sinY + point.z * cosY;
  const cosX = Math.cos(xAngle);
  const sinX = Math.sin(xAngle);
  return {
    x: x1,
    y: point.y * cosX - z1 * sinX,
    z: point.y * sinX + z1 * cosX
  };
}

function chapterPoint(chapter) {
  const cosLat = Math.cos(chapter.lat);
  return {
    x: cosLat * Math.cos(chapter.lon),
    y: Math.sin(chapter.lat),
    z: cosLat * Math.sin(chapter.lon)
  };
}

function roundedRect(x, y, rectWidth, rectHeight, radius) {
  const r = Math.min(radius, rectWidth / 2, rectHeight / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + rectWidth, y, x + rectWidth, y + rectHeight, r);
  context.arcTo(x + rectWidth, y + rectHeight, x, y + rectHeight, r);
  context.arcTo(x, y + rectHeight, x, y, r);
  context.arcTo(x, y, x + rectWidth, y, r);
  context.closePath();
}

function drawSphere(time) {
  const delta = Math.min(40, time - previousTime);
  previousTime = time;
  if (!reducedMotion) introProgress = Math.min(1, introProgress + delta / 1350);
  const easedIntro = 1 - Math.pow(1 - introProgress, 3);

  if (!dragging && !reducedMotion) {
    targetRotationY += 0.00014 * delta;
    targetRotationY += velocityY;
    targetRotationX += velocityX;
    velocityX *= 0.94;
    velocityY *= 0.94;
  }
  rotationX += (targetRotationX - rotationX) * 0.075;
  rotationY += (targetRotationY - rotationY) * 0.075;
  rotationX = Math.max(-1.05, Math.min(1.05, rotationX));
  targetRotationX = Math.max(-1.05, Math.min(1.05, targetRotationX));

  context.clearRect(0, 0, width, height);
  const centerX = width / 2;
  const centerY = height * 0.48;
  const sphereRadius = Math.max(0.5, Math.min(width * 0.39, height * 0.38) * easedIntro);
  const perspective = 3.2;

  // Outer atmosphere.
  const gradient = context.createRadialGradient(centerX, centerY, sphereRadius * 0.15, centerX, centerY, sphereRadius * 1.2);
  gradient.addColorStop(0, 'rgba(129,147,137,.15)');
  gradient.addColorStop(0.6, 'rgba(82,99,91,.05)');
  gradient.addColorStop(1, 'rgba(47,54,50,0)');
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(centerX, centerY, sphereRadius * 1.24, 0, Math.PI * 2);
  context.fill();

  const projected = spherePoints.map((point) => {
    const rotated = rotatePoint(point);
    const scale = perspective / (perspective - rotated.z);
    return {
      x: centerX + rotated.x * sphereRadius * scale,
      y: centerY + rotated.y * sphereRadius * scale,
      z: rotated.z,
      scale
    };
  }).sort((a, b) => a.z - b.z);

  projected.forEach((point) => {
    const depth = (point.z + 1) / 2;
    const alpha = 0.08 + depth * 0.72;
    context.fillStyle = `rgba(232,238,234,${alpha})`;
    context.beginPath();
    context.arc(point.x, point.y, 0.55 + depth * 1.35, 0, Math.PI * 2);
    context.fill();
  });

  // Quiet orbital lines make the sphere legible as a navigable system.
  context.save();
  context.translate(centerX, centerY);
  context.strokeStyle = 'rgba(243,240,232,.12)';
  context.lineWidth = 1;
  [0.45, 0.7, 0.92].forEach((ratio, index) => {
    context.beginPath();
    context.ellipse(0, 0, sphereRadius * ratio, sphereRadius * (0.18 + index * 0.07), rotationY * 0.45 + index * 0.65, 0, Math.PI * 2);
    context.stroke();
  });
  context.restore();

  projectedNodes = chapters.map((chapter, index) => {
    const rotated = rotatePoint(chapterPoint(chapter));
    const scale = perspective / (perspective - rotated.z);
    return {
      index,
      x: centerX + rotated.x * sphereRadius * scale,
      y: centerY + rotated.y * sphereRadius * scale,
      z: rotated.z,
      scale
    };
  }).sort((a, b) => a.z - b.z);

  projectedNodes.forEach((node) => {
    const isHovered = node.index === hoveredNode;
    const isActive = node.index === activeNode;
    const front = (node.z + 1) / 2;
    const nodeRadius = (isHovered || isActive ? 12 : 8.5) * (0.72 + front * 0.36);

    context.strokeStyle = `rgba(243,240,232,${0.15 + front * 0.45})`;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(node.x, node.y);
    context.stroke();

    context.shadowColor = isHovered || isActive ? 'rgba(215,176,163,.55)' : 'rgba(129,147,137,.35)';
    context.shadowBlur = isHovered || isActive ? 18 : 8;
    context.fillStyle = isHovered || isActive ? '#d7b0a3' : front > 0.46 ? '#dce5df' : '#87998f';
    context.beginPath();
    context.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    context.fillStyle = '#2f3632';
    context.font = '400 13px Inter, -apple-system, "Segoe UI", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(chapters[node.index].number, node.x, node.y + 0.5);

    if (isHovered || isActive) {
      const title = chapters[node.index].short.toUpperCase();
      context.font = '400 13px Inter, -apple-system, "Segoe UI", sans-serif';
      const labelWidth = Math.min(180, context.measureText(title).width + 24);
      const labelX = Math.max(8, Math.min(width - labelWidth - 8, node.x + 16));
      const labelY = Math.max(8, Math.min(height - 36, node.y - 34));
      roundedRect(labelX, labelY, labelWidth, 27, 3);
      context.fillStyle = 'rgba(243,240,232,.94)';
      context.fill();
      context.fillStyle = '#2f3632';
      context.textAlign = 'left';
      context.fillText(title, labelX + 12, labelY + 14);
    }
  });

  requestAnimationFrame(drawSphere);
}

function nearestNode(clientX, clientY) {
  const bounds = canvas.getBoundingClientRect();
  const x = clientX - bounds.left;
  const y = clientY - bounds.top;
  let nearest = null;
  projectedNodes.forEach((node) => {
    const distance = Math.hypot(node.x - x, node.y - y);
    if (distance < 30 && (!nearest || distance < nearest.distance)) nearest = { ...node, distance };
  });
  return nearest;
}

function setActiveNode(index, focusSphere = false) {
  activeNode = index;
  hoveredNode = index;
  currentLabel.textContent = `${chapters[index].number} · ${chapters[index].short}`;
  chapterButtons.forEach((button, buttonIndex) => button.classList.toggle('is-active', buttonIndex === index));
  if (focusSphere) {
    const chapter = chapters[index];
    targetRotationY = -chapter.lon;
    targetRotationX = chapter.lat * 0.76;
  }
}

function scrollToChapter(index) {
  const target = document.getElementById(chapters[index].target);
  if (!target) return;
  setActiveNode(index, true);
  target.classList.add('is-sphere-target');
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  window.setTimeout(() => target.classList.remove('is-sphere-target'), 1500);
}

canvas.addEventListener('pointerdown', (event) => {
  dragging = true;
  moved = false;
  pointerX = event.clientX;
  pointerY = event.clientY;
  velocityX = 0;
  velocityY = 0;
  canvas.classList.add('is-dragging');
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  const hovered = nearestNode(event.clientX, event.clientY);
  if (!dragging) {
    if (hovered) setActiveNode(hovered.index, false);
    canvas.style.cursor = hovered ? 'pointer' : 'grab';
    return;
  }
  const dx = event.clientX - pointerX;
  const dy = event.clientY - pointerY;
  if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
  targetRotationY += dx * 0.006;
  targetRotationX += dy * 0.0045;
  velocityY = dx * 0.00015;
  velocityX = dy * 0.0001;
  pointerX = event.clientX;
  pointerY = event.clientY;
});
canvas.addEventListener('pointerup', (event) => {
  const clicked = nearestNode(event.clientX, event.clientY);
  dragging = false;
  canvas.classList.remove('is-dragging');
  if (!moved && clicked) scrollToChapter(clicked.index);
});
canvas.addEventListener('pointercancel', () => {
  dragging = false;
  canvas.classList.remove('is-dragging');
});
canvas.addEventListener('mouseleave', () => {
  if (!dragging) hoveredNode = activeNode;
});

chapterButtons.forEach((button) => {
  const index = Number(button.dataset.node);
  button.addEventListener('mouseenter', () => setActiveNode(index, true));
  button.addEventListener('focus', () => setActiveNode(index, true));
  button.addEventListener('click', () => scrollToChapter(index));
});

// Keep the sphere's chapter state synchronized with the object currently in view.
const objectObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActiveNode(Number(visible.target.dataset.chapter), false);
}, { threshold: [0.25, 0.5, 0.75] });
document.querySelectorAll('.objects article').forEach((article) => objectObserver.observe(article));

const resizeObserver = new ResizeObserver(resizeSphere);
resizeObserver.observe(canvas);
resizeSphere();
setActiveNode(0, true);
requestAnimationFrame(drawSphere);
