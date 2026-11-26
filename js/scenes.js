import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const IMG = (k) => `assets/img/${k}.webp`;
const MODEL = (id) => `assets/models/${id}/${id}_1k.gltf`;
const loader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();
const modelCache = new Map();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const CAPTURE_SNAP = new URLSearchParams(location.search).has('capture');
const lerp = (a, b, t) => a + (b - a) * (CAPTURE_SNAP ? 1 : t);
const isTouch = matchMedia('(hover: none)').matches;
// ?capture=1 renders every scene eagerly and keeps frames (for screenshot review)
const CAPTURE = new URLSearchParams(location.search).has('capture');

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

function loadModel(id) {
  if (!modelCache.has(id)) modelCache.set(id, loader.loadAsync(MODEL(id)).then((g) => g.scene));
  return modelCache.get(id).then((s) => s.clone(true));
}

function loadTex(k) {
  return new Promise((res) => texLoader.load(IMG(k), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; res(t); }, undefined, () => res(null)));
}

// Fit an object into a box of `size` world units and centre it on the origin.
function normalize(obj, size) {
  const box = new THREE.Box3().setFromObject(obj);
  const s = box.getSize(new THREE.Vector3());
  const k = size / Math.max(s.x, s.y, s.z);
  obj.scale.multiplyScalar(k);
  const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
  obj.position.sub(c);
  const g = new THREE.Group(); g.add(obj); return g;
}

/* A small stage: renderer + camera + resize + render-only-when-visible. */
class Stage {
  constructor(canvas, { fov = 35, env = true, exposure = 1.05 } = {}) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: CAPTURE });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.75 : 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = exposure;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    if (env) {
      const pm = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
      pm.dispose();
    }
    this.visible = false; this.tickers = []; this.clock = new THREE.Clock();
    new ResizeObserver(() => this.resize()).observe(canvas);
    if (CAPTURE) this.visible = true;
    else new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.loop(); }, { rootMargin: '120px' }).observe(canvas);
    this.resize();
  }
  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.onResize?.(w, h);
  }
  loop() {
    if (this.running) return; this.running = true;
    const step = () => {
      if (!this.visible || document.hidden) { this.running = false; return; }
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const t = this.clock.elapsedTime;
      this.tickers.forEach((f) => f(dt, t));
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(step);
    };
    this.clock.getDelta();
    requestAnimationFrame(step);
  }
}

/* Drag-to-turn with inertia, for a model on a canvas. Track 1:1, release with momentum. */
function turntable(canvas, target, { onTap, reduced, idle = 0.25 } = {}) {
  let down = null; let vy = 0, vx = 0; let rx = 0.15, ry = -0.5;
  canvas.addEventListener('pointerdown', (e) => {
    down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: 0, t: performance.now() };
    try { canvas.setPointerCapture(e.pointerId); } catch {} vy = vx = 0;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.lx, dy = e.clientY - down.ly;
    down.moved += Math.abs(dx) + Math.abs(dy);
    ry += dx * 0.012; rx = clamp(rx + dy * 0.008, -0.6, 0.8);
    const now = performance.now(); const dt = Math.max(1, now - down.t);
    vy = (dx * 0.012) / dt * 16; vx = (dy * 0.008) / dt * 16;
    down.lx = e.clientX; down.ly = e.clientY; down.t = now;
  });
  const up = () => { if (!down) return; const tap = down.moved < 8; down = null; if (tap) onTap?.(); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', () => { down = null; });
  return (dt) => {
    if (!down) {
      ry += vy; rx += vx; vy *= 0.93; vx *= 0.9;
      if (!reduced && Math.abs(vy) < 0.002) ry += dt * idle;
      rx = lerp(rx, 0.15, 0.02);
    }
    target.rotation.y = ry; target.rotation.x = rx;
  };
}

/* ---------------- HERO CAMERA ---------------- */
async function heroCamera(ctx) {
  const canvas = document.getElementById('hero-camera');
  const st = new Stage(canvas, { fov: 30 });
  st.camera.position.set(0, 0.1, 5.2);
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); st.scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fb2ff, 2.5); rim.position.set(-4, 2, -3); st.scene.add(rim);
  st.scene.add(new THREE.HemisphereLight(0xdce6f7, 0x0e2a5c, 0.6));

  const pivot = new THREE.Group(); st.scene.add(pivot);
  const cam = normalize(await loadModel('Camera_01'), 2.3);
  pivot.add(cam);

  // soft contact shadow
  const sh = new THREE.Mesh(new THREE.CircleGeometry(1.1, 48), new THREE.MeshBasicMaterial({ map: radialTex('#0E2A5C'), transparent: true, opacity: 0.35, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = -1.05; sh.scale.set(1.2, 0.6, 1); st.scene.add(sh);

  let kick = 0;
  const shoot = () => { kick = 1; ctx.flash(); ctx.nextPose(); };
  const spin = turntable(canvas, pivot, { onTap: shoot, reduced: ctx.REDUCED, idle: 0.35 });
  canvas.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); shoot(); } });
  st.tickers.push((dt, t) => {
    spin(dt);
    pivot.position.y = ctx.REDUCED ? 0 : Math.sin(t * 1.3) * 0.06;
    kick = lerp(kick, 0, 0.12);
    const s = 1 - kick * 0.08; pivot.scale.setScalar(s);
  });
  st.loop();
}

function radialTex(color) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------------- VIDEO CAMERA (Green Minute) ---------------- */
function videoCamera(ctx) {
  const canvas = document.querySelector('canvas[data-model="vintage_video_camera"]');
  if (!canvas) return;
  let started = false;
  const start = async () => {
    if (started || !canvas.clientWidth) return; started = true;
    const st = new Stage(canvas, { fov: 30 });
    st.camera.position.set(0, 0.2, 5);
    const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(2, 3, 4); st.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fb2ff, 2); rim.position.set(-3, 1, -3); st.scene.add(rim);
    const pivot = new THREE.Group(); st.scene.add(pivot);
    pivot.add(normalize(await loadModel('vintage_video_camera'), 2.4));
    const spin = turntable(canvas, pivot, { reduced: ctx.REDUCED, idle: 0.3 });
    st.tickers.push((dt) => spin(dt));
    st.resize(); st.loop();
  };
  addEventListener('exp:select', (e) => { if (e.detail === 'green-minute') requestAnimationFrame(start); });
  new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }).observe(canvas);
}

/* ---------------- AWARDS RING ---------------- */
async function awardsRing(ctx) {
  const canvas = document.getElementById('ring-canvas');
  const st = new Stage(canvas, { fov: 32, env: false });
  const N = ctx.AWARDS.length;
  const H = 2.3;
  const R = 7.4;
  const ring = new THREE.Group(); st.scene.add(ring);
  const items = [];
  const fade = fadeTex();

  ctx.AWARDS.forEach((a, i) => {
    const g = new THREE.Group();
    const ang = (i / N) * Math.PI * 2;
    g.position.set(Math.sin(ang) * R, 0, Math.cos(ang) * R);
    g.rotation.y = ang;
    const mat = new THREE.MeshBasicMaterial({ color: 0xdce6f7, transparent: true, toneMapped: false });
    const front = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x1f4fa3, transparent: true, opacity: 0.55, toneMapped: false }));
    back.rotation.y = Math.PI; back.position.z = -0.01;
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, alphaMap: fade, depthWrite: false, toneMapped: false }));
    g.add(front, back, refl);
    ring.add(g);
    const item = { g, front, back, refl, mat, i, aspect: 0.75 };
    items.push(item);
    setSize(item);
    loadTex(a.img).then((t) => {
      if (!t) return;
      item.aspect = t.image.width / t.image.height;
      mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true;
      refl.material.map = t; refl.material.needsUpdate = true;
      setSize(item);
    });
  });
  function setSize(it) {
    let w = H * it.aspect, h = H;
    if (w > 3.1) { w = 3.1; h = w / it.aspect; }
    it.front.scale.set(w, h, 1); it.back.scale.set(w, h, 1);
    it.front.position.y = h / 2 - H / 2 + 0.25; it.back.position.y = it.front.position.y;
    it.refl.scale.set(w, -h, 1); it.refl.position.y = it.front.position.y - h - 0.04;
  }

  // light specks
  const COUNT = isTouch ? 160 : 320;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) { pos[i * 3] = (Math.random() - 0.5) * 22; pos[i * 3 + 1] = (Math.random() - 0.2) * 7; pos[i * 3 + 2] = (Math.random() - 0.5) * 18; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.07, map: radialTex('#DCE6F7'), color: 0xdce6f7, transparent: true, opacity: 0.32, depthWrite: false }));
  st.scene.add(pts);

  st.onResize = (w, h) => {
    const narrow = w / h < 1;
    st.camera.position.set(0, narrow ? 0.9 : 1.1, R + (narrow ? 6.4 : 6.9));
    st.camera.fov = narrow ? 40 : 30; st.camera.updateProjectionMatrix();
    st.camera.lookAt(0, 0.1, R - 2);
  };
  st.resize();

  // rotation state (in "index" units), spring to target
  let pos0 = 0, vel = 0, target = 0, dragging = null, current = 0;
  const go = (idx) => { target = idx; };
  const wrap = (i) => ((i % N) + N) % N;
  const pxPerItem = () => Math.max(140, canvas.clientWidth * 0.22);

  canvas.addEventListener('pointerdown', (e) => {
    dragging = { x: e.clientX, y: e.clientY, lx: e.clientX, t: performance.now(), moved: 0, v: 0, axis: null, id: e.pointerId };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    const dx = e.clientX - dragging.x, dy = e.clientY - dragging.y;
    if (!dragging.axis && Math.hypot(dx, dy) > 6) { dragging.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; if (dragging.axis === 'x') { try { canvas.setPointerCapture(e.pointerId); } catch {} } }
    if (dragging.axis !== 'x') return;
    const d = (e.clientX - dragging.lx) / pxPerItem();
    pos0 -= d; target = pos0; vel = 0; // 1:1 tracking
    const now = performance.now(); dragging.v = -d / Math.max(1, now - dragging.t) * 1000; dragging.t = now; dragging.lx = e.clientX;
    dragging.moved += Math.abs(e.movementX || 1);
  });
  const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
  canvas.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    const d = dragging; dragging = null;
    if (d.axis === 'x') {
      // release: project with velocity, land on the nearest item
      const proj = pos0 + clamp(d.v * 0.18, -3, 3);
      target = Math.round(proj); vel = d.v / 60;
      return;
    }
    if (d.axis === null) { // tap: pick an item
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, st.camera);
      const hit = ray.intersectObjects(items.map((it) => it.front))[0];
      if (!hit) return;
      const it = items.find((x) => x.front === hit.object);
      const frontIdx = wrap(Math.round(pos0));
      if (it.i === frontIdx) document.querySelector('#ring-caption [data-zoom]')?.click();
      else { let delta = it.i - frontIdx; if (delta > N / 2) delta -= N; if (delta < -N / 2) delta += N; go(Math.round(pos0) + delta); }
    }
  });
  canvas.addEventListener('pointercancel', () => { dragging = null; target = Math.round(pos0); });

  document.querySelector('[data-ring="prev"]').addEventListener('click', () => go(Math.round(target) - 1));
  document.querySelector('[data-ring="next"]').addEventListener('click', () => go(Math.round(target) + 1));
  document.getElementById('ring-dots').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const idx = [...b.parentNode.children].indexOf(b);
    let delta = idx - wrap(Math.round(target)); if (delta > N / 2) delta -= N; if (delta < -N / 2) delta += N;
    go(Math.round(target) + delta);
  });
  const ringEl = document.getElementById('ring');
  ringEl.addEventListener('keydown', (e) => {
    if (e.target.closest('a, button:not([data-ring])') && !e.target.closest('#ring-dots')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(target) + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(target) - 1); }
  });

  let mx = 0, my = 0;
  canvas.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; });

  st.tickers.push((dt, t) => {
    if (!dragging) {
      // critically-damped-ish spring toward target
      const k = ctx.REDUCED ? 400 : 90, c = ctx.REDUCED ? 40 : 17;
      const a = (target - pos0) * k - vel * c;
      vel += a * dt; pos0 += vel * dt;
      if (Math.abs(target - pos0) < 0.0005 && Math.abs(vel) < 0.001) pos0 = target;
    }
    ring.rotation.y = -(pos0 / N) * Math.PI * 2;
    ring.rotation.x = lerp(ring.rotation.x, my * 0.06, 0.05);
    ring.position.x = lerp(ring.position.x, -mx * 0.3, 0.05);
    const front = wrap(Math.round(pos0));
    if (front !== current) { current = front; ctx.showAward(front); }
    items.forEach((it) => {
      let d = Math.abs(((it.i - pos0) % N + N) % N); d = Math.min(d, N - d);
      const near = clamp(1 - d / 3.2, 0, 1);
      it.mat.opacity = 0.35 + near * 0.65;
      it.refl.material.opacity = 0.05 + near * 0.15;
      const s = 0.82 + near * 0.18; it.g.scale.setScalar(s);
    });
    if (!ctx.REDUCED) { pts.rotation.y = t * 0.006; pts.position.y = Math.sin(t * 0.2) * 0.15; }
  });
  st.loop();
}

function fadeTex() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 128;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, '#000'); gr.addColorStop(0.55, '#000'); gr.addColorStop(1, '#fff');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------------- BOOKSHELF ---------------- */
async function bookshelf(ctx) {
  const canvas = document.getElementById('shelf-canvas');
  const st = new Stage(canvas, { fov: 30, exposure: 1.1 });
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(2, 4, 5); st.scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fb2ff, 3); rim.position.set(-4, 3, -2); st.scene.add(rim);
  st.scene.add(new THREE.HemisphereLight(0xdce6f7, 0x081a3b, 0.5));

  const root = new THREE.Group(); st.scene.add(root);
  // painted board ledge with rounded, shaded edges
  const board = new THREE.MeshStandardMaterial({ color: 0xe9eef8, roughness: 0.42, metalness: 0 });
  const ledge = new THREE.Mesh(new RoundedBoxGeometry(5.4, 0.16, 1.5, 4, 0.05), board);
  ledge.position.y = -1.08; root.add(ledge);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(5.4, 0.22, 0.08, 3, 0.03), new THREE.MeshStandardMaterial({ color: 0xc9d6ee, roughness: 0.5 }));
  lip.position.set(0, -0.98, 0.74); root.add(lip);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.2), new THREE.MeshBasicMaterial({ map: radialTex('#000814'), transparent: true, opacity: 0.55, depthWrite: false }));
  under.position.set(0, -1.32, -0.2); root.add(under);
  const shadowTex = radialTex('#0E2A5C');

  const pages = pagesTex();
  const WHITE = new THREE.Color(0xffffff), DIM = new THREE.Color(0x8fa6cf);
  const books = [];
  const slots = [-1.75, 0, 1.7];
  await Promise.all(ctx.BOOKS.map(async (b, i) => {
    const t = await loadTex(b.img);
    const aspect = t ? t.image.width / t.image.height : 0.72;
    const h = 1.55, w = h * aspect, d = 0.2;
    const spine = new THREE.MeshStandardMaterial({ color: new THREE.Color(b.spine), roughness: 0.55 });
    const paper = new THREE.MeshStandardMaterial({ map: pages, roughness: 0.9 });
    const cover = new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0 });
    const backM = new THREE.MeshStandardMaterial({ color: new THREE.Color(b.spine).multiplyScalar(0.8), roughness: 0.6 });
    // +x pages edge, -x spine, +y top pages, -y bottom, +z cover, -z back
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, [paper, spine, paper, paper, cover, backM]);
    const g = new THREE.Group(); g.add(mesh); mesh.position.y = h / 2;
    g.userData = { i, base: new THREE.Vector3(slots[i], -1, -0.05), w };
    g.position.copy(g.userData.base);
    g.rotation.set(-0.12, 0.18 - i * 0.08, 0);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, d * 6), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.55, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.set(0, 0.005, 0.05); g.add(sh);
    root.add(g); books[i] = { g, mesh, sh };
  }));

  let sel = 0, hover = -1, mx = 0, my = 0;
  st.onResize = (w, h) => {
    const wide = w / h > 1.15;
    st.camera.position.set(0, 0.6, wide ? 7.6 : 8.6);
    st.camera.lookAt(0, -0.3, 0);
  };
  st.resize();
  addEventListener('book:select', (e) => { sel = e.detail; });

  const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
  const pick = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, st.camera);
    const hit = ray.intersectObjects(books.map((b) => b.mesh))[0];
    return hit ? books.findIndex((b) => b.mesh === hit.object) : -1;
  };
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
    hover = pick(e); canvas.style.cursor = hover >= 0 ? 'pointer' : 'default';
  });
  canvas.addEventListener('pointerleave', () => { hover = -1; mx = my = 0; });
  canvas.addEventListener('click', (e) => { const i = pick(e); if (i >= 0 && i !== sel) { sel = i; ctx.showBook(i, true); } });

  st.tickers.push((dt, t) => {
    books.forEach((b, i) => {
      if (!b) return;
      const on = i === sel, hv = i === hover && !on;
      const base = b.g.userData.base;
      const tz = on ? 0.75 : hv ? 0.1 : -0.15;
      const ty = on ? -0.98 + (ctx.REDUCED ? 0 : Math.sin(t * 1.4) * 0.03) : -1;
      const others = [0, 1, 2].filter((j) => j !== sel);
      const tx = on ? 0 : others.indexOf(i) === 0 ? -1.85 : 1.85;
      b.g.position.x = lerp(b.g.position.x, tx, 0.08);
      b.g.position.y = lerp(b.g.position.y, ty, 0.08);
      b.g.position.z = lerp(b.g.position.z, tz, 0.08);
      const ry = on ? -mx * 0.5 : (tx < 0 ? 0.35 : -0.35) + (hv ? (tx < 0 ? -0.15 : 0.15) : 0);
      const rx = on ? -0.05 + my * 0.2 : -0.12;
      b.g.rotation.y = lerp(b.g.rotation.y, ry, 0.08);
      b.g.rotation.x = lerp(b.g.rotation.x, rx, 0.08);
      const sc = on ? 1.18 : hv ? 0.98 : 0.9; b.g.scale.setScalar(lerp(b.g.scale.x, sc, 0.08));
      b.mesh.material[4].color.lerp(on || hv ? WHITE : DIM, 0.08);
    });
    root.rotation.y = lerp(root.rotation.y, mx * 0.15, 0.04);
  });
  st.loop();
}

function pagesTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 64, 256);
  g.strokeStyle = 'rgba(120,110,95,.25)';
  for (let x = 0; x < 64; x += 2) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------------- CONTACT ---------------- */
async function contact(ctx) {
  const canvas = document.getElementById('contact-canvas');
  const st = new Stage(canvas, { fov: 30 });
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-3, 6, 4); st.scene.add(key);
  const rim = new THREE.DirectionalLight(0x2f6bff, 3); rim.position.set(4, 2, -4); st.scene.add(rim);
  st.scene.add(new THREE.HemisphereLight(0xdce6f7, 0x081a3b, 0.35));

  // the desk: a soft pool of light on the ink ground, objects resting on it
  const desk = new THREE.Group(); st.scene.add(desk);
  // a painted desk board with a white paper blotter on it
  const board = new THREE.Mesh(new RoundedBoxGeometry(4.4, 0.14, 3.0, 4, 0.06), new THREE.MeshStandardMaterial({ color: 0x1f4fa3, roughness: 0.55, metalness: 0.05 }));
  board.position.y = -0.07; desk.add(board);
  const blotter = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.012, 2.1), new THREE.MeshStandardMaterial({ color: 0xf2f5fb, roughness: 0.9 }));
  blotter.position.set(0.1, 0.006, 0.05); blotter.rotation.y = -0.06; desk.add(blotter);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), new THREE.MeshBasicMaterial({ map: radialTex('#2F6BFF'), transparent: true, opacity: 0.25, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = -0.16; desk.add(pool);
  const shadowTex = radialTex('#000814');
  const restOn = (obj, x, z, ry, size, shade = 0.28) => {
    const g = normalize(obj, size);
    const b = new THREE.Box3().setFromObject(g);
    g.position.set(x, 0.012 - b.min.y, z); g.rotation.y = ry;
    const s = b.getSize(new THREE.Vector3());
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(s.x * 1.05, s.z * 1.05), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: shade, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.set(x, 0.016, z); sh.rotation.z = ry;
    desk.add(sh, g); return g;
  };
  const [a, b] = await Promise.all([loadModel('stationery_supplies').catch(() => null), loadModel('office_notepads').catch(() => null)]);
  if (a) restOn(arrangeStationery(a), -0.35, -0.15, 0.35, 1.9);
  if (b) restOn(b, 0.95, 0.6, -0.35, 1.15, 0.12);

  // paper envelopes resting and drifting just above the desk
  const paper = new THREE.MeshStandardMaterial({ color: 0xf7f9fd, roughness: 0.8, side: THREE.DoubleSide });
  const flapM = new THREE.MeshStandardMaterial({ color: 0xb9cbec, roughness: 0.8, side: THREE.DoubleSide });
  const flapGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.35, 0.22, 0.003), new THREE.Vector3(0.35, 0.22, 0.003), new THREE.Vector3(0, -0.04, 0.003)]);
  flapGeo.setIndex([0, 2, 1]); flapGeo.computeVertexNormals();
  const env = [];
  [[1.35, -0.85], [-1.45, 0.95], [0.2, 1.75]].forEach(([x, z], i) => {
    const m = new THREE.Group();
    m.add(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.44), paper), new THREE.Mesh(flapGeo, flapM));
    m.rotation.x = -Math.PI / 2; m.rotation.z = (i - 1.5) * 0.5;
    m.userData = { x, z, p: i * 1.7 };
    m.position.set(x, 0.25, z); desk.add(m); env.push(m);
    const crease = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.35, 0.22, 0.006), new THREE.Vector3(0, -0.04, 0.006), new THREE.Vector3(0.35, 0.22, 0.006)]), new THREE.LineBasicMaterial({ color: 0x1f4fa3 }));
    m.add(crease);
  });

  st.onResize = (w, h) => {
    const narrow = w / h < 0.9;
    // desktop: desk sits in the right half; phone: desk sits above the copy
    desk.position.set(narrow ? 0 : w < 1200 ? 2.35 : 2.75, 0, 0);
    desk.scale.setScalar(narrow ? 0.3 : w < 1200 ? 0.52 : 0.74);
    st.camera.position.set(narrow ? 0 : 0.6, 6.2, 7.2);
    st.camera.lookAt(narrow ? 0 : 0.6, narrow ? -2.6 : 0, narrow ? -1.2 : 0);
  };
  st.resize();
  let mx = 0, my = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  const turn = new THREE.Group(); // drag turns the whole desk
  const spin = turntable(canvas, turn, { reduced: ctx.REDUCED, idle: 0 });
  st.tickers.push((dt, t) => {
    spin(dt);
    desk.rotation.y = lerp(desk.rotation.y, turn.rotation.y * 0.6 + mx * 0.25, 0.06);
    if (!ctx.REDUCED) env.forEach((m) => {
      m.position.y = 0.32 + Math.sin(t * 0.9 + m.userData.p) * 0.1;
      m.position.x = m.userData.x + Math.sin(t * 0.35 + m.userData.p) * 0.15;
    });
  });
  st.loop();
}


/* The Poly Haven stationery set ships as a front-facing display. Re-arrange it as a desk:
   cup upright, four pens standing in it, the rest lying on the desk. */
function arrangeStationery(src) {
  const parts = {};
  src.traverse((o) => { if (o.isMesh || (o.children.length && o.name)) parts[o.name.replace('stationery_supplies_', '')] = o; });
  const g = new THREE.Group();
  const take = (name) => { const o = parts[name]; if (!o) return null; o.removeFromParent(); o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); g.add(o); return o; };
  const boxOf = (o) => { o.updateMatrixWorld(true); return new THREE.Box3().setFromObject(o); };
  const cup = take('pencilcup');
  let cupTop = 0.08;
  if (cup) { const b = boxOf(cup); cup.position.y = -b.min.y; cupTop = b.max.y - b.min.y; }
  [['pen_blue', -0.012, 0.008, 0.10], ['pen_fancy', 0.012, -0.006, -0.08], ['pencil_new_a', 0.004, 0.014, 0.05], ['pencil_old', -0.008, -0.012, -0.14]].forEach(([n, x, z, tilt]) => {
    const o = take(n); if (!o) return;
    o.rotation.set(tilt, 0, Math.PI / 2 + tilt * 0.6);
    const b = boxOf(o); const c = b.getCenter(new THREE.Vector3());
    o.position.set(x - c.x, 0.012 - b.min.y, z - c.z);
  });
  [['pen_red', -0.16, 0.07, 0.3], ['pencil_new_b', -0.15, 0.11, 0.18], ['pencil_used', -0.12, 0.15, -0.1]].forEach(([n, x, z, ry]) => {
    const o = take(n); if (!o) return;
    o.rotation.set(0, ry, 0);
    const b = boxOf(o); const c = b.getCenter(new THREE.Vector3());
    o.position.set(x - c.x, -b.min.y, z - c.z);
  });
  const er = take('eraser');
  if (er) { const b = boxOf(er); const c = b.getCenter(new THREE.Vector3()); er.position.set(0.09 - c.x, -b.min.y, 0.07 - c.z); er.rotation.y = 0.4; }
  return g;
}

/* ---------------- BOOT ---------------- */
export function boot(ctx) {
  if (!hasWebGL()) { document.getElementById('ring').classList.add('no-webgl'); document.getElementById('hero-camera').hidden = true; return; }
  const lazy = (el, fn) => {
    if (CAPTURE) { fn(ctx).catch((err) => console.warn(err)); return; } const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(ctx).catch((err) => console.warn(err)); } }, { rootMargin: '400px' }); io.observe(el); };
  heroCamera(ctx).catch((err) => { console.warn(err); document.getElementById('hero-camera').hidden = true; });
  videoCamera(ctx);
  lazy(document.getElementById('ring-canvas'), awardsRing);
  lazy(document.getElementById('shelf-canvas'), bookshelf);
  lazy(document.getElementById('contact-canvas'), contact);
}
