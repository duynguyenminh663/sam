import { LINKS, EXPERIENCE, AWARDS, DEGREES, BOOKS } from './data.js';
import { DIMS } from './dims.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const img = (k) => `assets/img/${k}.webp`;
const dim = (k) => DIMS[k] || [800, 800];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ICON = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5M11 8v6M8 11h6"/></svg>',
  li: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
  fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>',
};

document.documentElement.classList.remove('no-js');

/* ---------- links + socials ---------- */
$$('[data-link]').forEach((a) => { a.href = LINKS[a.dataset.link]; });
$$('[data-socials]').forEach((wrap) => {
  const labels = wrap.hasAttribute('data-labels');
  const items = [
    ['li', 'LinkedIn', LINKS.linkedin, 'social--li'],
    ['fb', 'Facebook', LINKS.facebook, 'social--fb'],
    ['mail', 'Email', LINKS.email, 'social--mail'],
  ];
  wrap.innerHTML = items.map(([k, name, href, cls]) => {
    const ext = k === 'mail' ? '' : ' target="_blank" rel="noopener"';
    return `<a class="social ${cls}" href="${href}"${ext} aria-label="${name}${k === 'mail' ? ': truongnhuduyminh@gmail.com' : ' (opens in a new tab)'}">${ICON[k]}${labels ? `<span>${name}</span>` : ''}</a>`;
  }).join('');
});

/* ---------- nav ---------- */
const nav = $('#nav');
const bar = $('.nav__progress span');
const sheet = $('#sheet');
const menuBtn = $('.nav__menu');
let ticking = false;
const onScroll = () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    nav.classList.toggle('is-scrolled', scrollY > 8);
    ticking = false;
  });
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const setSheet = (open) => { sheet.hidden = !open; menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
menuBtn.addEventListener('click', () => setSheet(sheet.hidden));
$$('a', sheet).forEach((a) => a.addEventListener('click', () => setSheet(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) { setSheet(false); menuBtn.focus(); } });
const sectionIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    $$('.nav__links a').forEach((a) => a.setAttribute('aria-current', a.getAttribute('href') === `#${en.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['experience', 'achievements', 'degrees', 'literacy', 'contact'].forEach((id) => sectionIO.observe(document.getElementById(id)));

/* ---------- lightbox ---------- */
const lb = $('#lightbox');
const openLightbox = (key, caption) => {
  const [w, h] = dim(key);
  const im = $('img', lb); im.src = img(key); im.width = w; im.height = h; im.alt = caption;
  $('figcaption', lb).textContent = caption;
  lb.showModal();
};
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('[data-close]') || e.target.tagName === 'FIGURE') lb.close(); });

/* ---------- drag-to-scroll (mouse only; touch uses native scrolling) ---------- */
function dragScroll(el) {
  let down = false, sx = 0, sl = 0, moved = 0, lastX = 0, lastT = 0, v = 0, raf = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    cancelAnimationFrame(raf);
    down = true; moved = 0; sx = lastX = e.clientX; sl = el.scrollLeft; lastT = performance.now(); v = 0;
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
    if (moved > 4) el.classList.add('is-dragging');
    el.scrollLeft = sl - dx; // 1:1 tracking
    const t = performance.now(); v = (e.clientX - lastX) / Math.max(1, t - lastT); lastX = e.clientX; lastT = t;
  });
  addEventListener('pointerup', () => {
    if (!down) return; down = false;
    // release: momentum seeded with pointer velocity, then let snap settle
    let vel = -v * 16;
    const step = () => {
      if (REDUCED || Math.abs(vel) < 0.5) { el.classList.remove('is-dragging'); return; }
      el.scrollLeft += vel; vel *= 0.92; raf = requestAnimationFrame(step);
    };
    step();
  });
  el.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { el.scrollBy({ left: el.clientWidth * 0.7, behavior: REDUCED ? 'auto' : 'smooth' }); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { el.scrollBy({ left: -el.clientWidth * 0.7, behavior: REDUCED ? 'auto' : 'smooth' }); e.preventDefault(); }
  });
}
$$('[data-drag-scroll]').forEach(dragScroll);
$$('.strip img').forEach((im) => im.addEventListener('click', () => im.classList.toggle('is-touched')));

/* ---------- chapter hover preview ---------- */
(() => {
  const prev = $('.chapters__preview');
  const box = $('.journey');
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const loop = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; prev.style.transform = `translate3d(${x}px,${y}px,0) rotate(-4deg) scale(${prev.classList.contains('is-on') ? 1 : .8})`; raf = requestAnimationFrame(loop); };
  $$('.chapters a').forEach((a) => {
    a.addEventListener('mouseenter', () => { prev.src = img(a.dataset.preview); prev.classList.add('is-on'); if (!raf) loop(); });
    a.addEventListener('mouseleave', () => { prev.classList.remove('is-on'); });
  });
  box.addEventListener('mousemove', (e) => { const r = box.getBoundingClientRect(); tx = e.clientX - r.left + 30; ty = e.clientY - r.top - 140; });
  box.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); raf = 0; });
})();

/* ---------- experience tabs ---------- */
(() => {
  const tabs = $('#exp-tabs');
  const panels = $('#exp-panels');
  tabs.innerHTML = EXPERIENCE.map((x, i) => `
    <button class="tab" role="tab" id="tab-${x.id}" aria-controls="panel-${x.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
      <span class="tab__org">${esc(x.org)}</span><span class="tab__role">${esc(x.role)}</span>
    </button>`).join('');
  panels.innerHTML = EXPERIENCE.map((x, i) => {
    const [lw, lh] = dim(x.logo);
    const video = x.video ? `
      <div class="video">
        <div class="video__frame">
          <button class="video__btn" data-yt="${x.video}" aria-label="Play the Green Minute film">
            <img src="https://i.ytimg.com/vi/${x.video}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
            <span class="video__play"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg></span>
          </button>
        </div>
        <canvas class="video__cam" data-model="vintage_video_camera" role="img" aria-label="3D vintage video camera. Drag to turn it."></canvas>
      </div>` : '';
    const media = x.media.length ? `
      <div class="media">
        <div class="media__track tone" data-drag-scroll tabindex="0" aria-label="${esc(x.org)} images, scroll sideways">
          ${x.media.map(([k, alt]) => { const [w, h] = dim(k); return `<button class="media__item" data-zoom="${k}" data-caption="${esc(alt)}" aria-label="Enlarge: ${esc(alt)}"><img src="${img(k)}" alt="${esc(alt)}" loading="lazy" width="${w}" height="${h}"></button>`; }).join('')}
        </div>
        ${x.media.length > 1 ? `<div class="media__nav"><button class="round" data-dir="-1" aria-label="Previous image">${ICON.prev}</button><button class="round" data-dir="1" aria-label="Next image">${ICON.next}</button><span class="media__count">${x.media.length} images · drag or tap to enlarge</span></div>` : ''}
      </div>` : '';
    const links = x.links.length ? `<div class="panel__links">${x.links.map((l) => `<a class="chip" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}${ICON.arrow}</a>`).join('')}</div>` : '';
    return `
      <div class="panel" role="tabpanel" id="panel-${x.id}" aria-labelledby="tab-${x.id}" ${i ? 'hidden' : ''} tabindex="0">
        <div class="panel__head">
          <img class="panel__logo" src="${img(x.logo)}" alt="" width="${lw}" height="${lh}" loading="lazy">
          <div><h3 class="panel__org">${esc(x.org)}</h3><p class="panel__role">${esc(x.role)}</p>${x.sub ? `<p class="panel__sub">${esc(x.sub)}</p>` : ''}</div>
        </div>
        <p class="panel__lead">${esc(x.lead)}</p>
        <ul class="panel__list">${x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
        ${links}${video}${media}
      </div>`;
  }).join('');

  const all = $$('.tab', tabs);
  const select = (i, focus) => {
    all.forEach((t, j) => { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
    $$('.panel', panels).forEach((p, j) => { p.hidden = i !== j; });
    if (focus) all[i].focus();
    all[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
    // keep the panel top in view on small screens
    const top = panels.getBoundingClientRect().top;
    if (innerWidth <= 960 && top < 0) scrollTo({ top: scrollY + top - 140, behavior: REDUCED ? 'auto' : 'smooth' });
    window.dispatchEvent(new CustomEvent('exp:select', { detail: EXPERIENCE[i].id }));
  };
  all.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const k = e.key; let n = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % all.length;
      if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + all.length) % all.length;
      if (k === 'Home') n = 0; if (k === 'End') n = all.length - 1;
      if (n !== null) { e.preventDefault(); select(n, true); }
    });
  });
  $$('[data-drag-scroll]', panels).forEach(dragScroll);
  panels.addEventListener('click', (e) => {
    const z = e.target.closest('[data-zoom]');
    if (z) return openLightbox(z.dataset.zoom, z.dataset.caption);
    const d = e.target.closest('[data-dir]');
    if (d) { const tr = $('.media__track', d.closest('.media')); tr.scrollBy({ left: Number(d.dataset.dir) * tr.clientWidth * 0.8, behavior: REDUCED ? 'auto' : 'smooth' }); }
    const y = e.target.closest('[data-yt]');
    if (y) {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${y.dataset.yt}?autoplay=1&rel=0`;
      f.title = 'Green Minute film by Minh Truong';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      y.replaceWith(f);
    }
  });
})();

/* ---------- awards caption (ring drives it) ---------- */
const ringCaption = $('#ring-caption');
const ringDots = $('#ring-dots');
ringDots.innerHTML = AWARDS.map((a, i) => `<button role="tab" aria-label="${esc(a.rank)}: ${esc(a.title)}" aria-selected="${i === 0}"></button>`).join('');
export function showAward(i) {
  const a = AWARDS[i];
  ringCaption.innerHTML = `
    <h3 class="ring__title">${esc(a.title)}</h3>
    <p class="ring__meta"><strong>${esc(a.rank)}</strong> · ${esc(a.work)}</p>
    <div class="ring__actions">
      <button class="chip" data-zoom="${a.img}" data-caption="${esc(a.rank)}, ${esc(a.title)}">${ICON.zoom}View certificate</button>
      ${a.photo ? `<button class="chip" data-zoom="${a.photo}" data-caption="${esc(a.work)}">${ICON.zoom}See the photograph</button>` : ''}
      ${a.link ? `<a class="chip" href="${a.link.href}" target="_blank" rel="noopener">${esc(a.link.label)}${ICON.arrow}</a>` : ''}
    </div>`;
  $$('button', ringDots).forEach((b, j) => b.setAttribute('aria-selected', i === j));
}
ringCaption.addEventListener('click', (e) => { const z = e.target.closest('[data-zoom]'); if (z) openLightbox(z.dataset.zoom, z.dataset.caption); });
showAward(0);
// fallback (no WebGL) list
$('#ring-fallback').innerHTML = AWARDS.map((a, i) => { const [w, h] = dim(a.img); return `<button data-i="${i}" aria-label="${esc(a.title)}"><img src="${img(a.img)}" alt="${esc(a.rank)}, ${esc(a.title)}" loading="lazy" width="${w}" height="${h}"></button>`; }).join('');
$('#ring-fallback').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { showAward(+b.dataset.i); openLightbox(AWARDS[+b.dataset.i].img, AWARDS[+b.dataset.i].title); } });

/* ---------- degrees: swipe-away deck ---------- */
(() => {
  const deck = $('#deck');
  const info = $('#deck-info');
  let order = DEGREES.map((_, i) => i);
  deck.innerHTML = DEGREES.map((d, i) => {
    const [w, h] = dim(d.img);
    return `<div class="card${d.pending ? ' card--pending' : ''}" data-i="${i}"><img src="${img(d.img)}" alt="${esc(d.title)}, ${esc(d.issuer)}" width="${w}" height="${h}" loading="lazy">${d.pending ? '<span class="card__soon">Coming soon</span>' : ''}</div>`;
  }).join('');
  const cards = $$('.card', deck);
  const layout = (animate = true) => {
    order.forEach((idx, pos) => {
      const c = cards[idx];
      c.style.transition = animate && !REDUCED ? 'transform .55s cubic-bezier(.32,.72,0,1), opacity .3s' : 'none';
      c.style.zIndex = String(10 - pos);
      const rot = [0, -5, 4][pos] ?? 0;
      const ty = pos * 14; const sc = 1 - pos * 0.05;
      c.style.transform = `translate3d(${pos * 10}px, ${ty}px, 0) rotate(${rot}deg) scale(${sc})`;
      c.style.opacity = pos > 2 ? '0' : '1';
      c.setAttribute('aria-hidden', pos !== 0);
    });
    const d = DEGREES[order[0]];
    info.innerHTML = `
      <h3 class="deck__title">${esc(d.title)}</h3>
      <p class="deck__issuer">${esc(d.issuer)}</p>
      <p class="deck__detail">${esc(d.detail)}</p>
      <div class="deck__ctrl">
        <button class="round" data-deck="-1" aria-label="Previous certificate">${ICON.prev}</button>
        <button class="round" data-deck="1" aria-label="Next certificate">${ICON.next}</button>
        <span class="deck__count">${order[0] + 1} of ${DEGREES.length}</span>
        ${d.pending ? '' : `<button class="chip" data-zoom="${d.img}" data-caption="${esc(d.title)}">${ICON.zoom}View full size</button>`}
        ${d.link ? `<a class="chip" href="${d.link.href}" target="_blank" rel="noopener">${esc(d.link.label)}${ICON.arrow}</a>` : ''}
      </div>`;
  };
  const next = (dir = 1, flingX = null) => {
    if (dir > 0) {
      const top = cards[order[0]];
      // fling the top card out along the drag axis, then tuck it to the back
      top.style.transition = REDUCED ? 'opacity .2s' : 'transform .45s cubic-bezier(.32,.72,0,1), opacity .45s';
      const x = flingX ?? -1;
      top.style.transform = REDUCED ? top.style.transform : `translate3d(${x * 140}%, -4%, 0) rotate(${x * 18}deg)`;
      top.style.opacity = '0';
      order.push(order.shift());
      setTimeout(() => layout(true), REDUCED ? 0 : 260);
      // relayout the others immediately
      order.slice(0, -1).forEach((idx, pos) => {
        const c = cards[idx];
        c.style.transition = REDUCED ? 'none' : 'transform .55s cubic-bezier(.32,.72,0,1)';
        c.style.zIndex = String(10 - pos);
        c.style.transform = `translate3d(${pos * 10}px, ${pos * 14}px, 0) rotate(${[0, -5, 4][pos]}deg) scale(${1 - pos * .05})`;
      });
    } else {
      order.unshift(order.pop());
      layout(true);
    }
    window.dispatchEvent(new CustomEvent('deck:change'));
  };
  layout(false);
  info.addEventListener('click', (e) => {
    const b = e.target.closest('[data-deck]'); if (b) next(+b.dataset.deck, 1);
    const z = e.target.closest('[data-zoom]'); if (z) openLightbox(z.dataset.zoom, z.dataset.caption);
  });
  deck.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(1, -1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); next(-1); }
    if (e.key === 'Enter' && !DEGREES[order[0]].pending) openLightbox(DEGREES[order[0]].img, DEGREES[order[0]].title);
  });

  // gesture: track 1:1, release by distance OR velocity
  let drag = null;
  deck.addEventListener('pointerdown', (e) => {
    const c = e.target.closest('.card'); if (!c || +c.dataset.i !== order[0]) return;
    drag = { c, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, t: performance.now(), lx: e.clientX, v: 0, axis: null, id: e.pointerId };
    c.style.transition = 'none';
  });
  deck.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dx = e.clientX - drag.x0; drag.dy = e.clientY - drag.y0;
    if (!drag.axis && Math.hypot(drag.dx, drag.dy) > 6) {
      drag.axis = Math.abs(drag.dx) > Math.abs(drag.dy) ? 'x' : 'y';
      if (drag.axis === 'x') { try { deck.setPointerCapture(e.pointerId); } catch {} drag.c.classList.add('is-dragging'); }
    }
    if (drag.axis !== 'x') return;
    const now = performance.now(); drag.v = (e.clientX - drag.lx) / Math.max(1, now - drag.t); drag.lx = e.clientX; drag.t = now;
    drag.c.style.transform = `translate3d(${drag.dx}px, ${drag.dy * 0.15}px, 0) rotate(${drag.dx * 0.05}deg)`;
  });
  const end = () => {
    if (!drag) return;
    const { c, dx, v, axis } = drag; drag = null; c.classList.remove('is-dragging');
    if (axis !== 'x') { if (axis === null && !DEGREES[order[0]].pending) openLightbox(DEGREES[order[0]].img, DEGREES[order[0]].title); return; }
    if (Math.abs(dx) > deck.clientWidth * 0.28 || Math.abs(v) > 0.5) next(1, Math.sign(dx || v));
    else { c.style.transition = 'transform .35s cubic-bezier(.2,.9,.3,1)'; c.style.transform = 'translate3d(0,0,0) rotate(0)'; }
  };
  deck.addEventListener('pointerup', end);
  deck.addEventListener('pointercancel', end);
})();

/* ---------- literacy text ---------- */
const bookTabs = $('#book-tabs');
const bookText = $('#book-text');
bookTabs.innerHTML = BOOKS.map((b, i) => `<button role="tab" aria-selected="${i === 0}" data-book="${i}">${esc(b.title)}</button>`).join('');
export function showBook(i, fromShelf = false) {
  const b = BOOKS[i];
  const pullIdx = b.id === 'snow' ? 3 : b.id === 'pear' ? 2 : 3;
  bookText.innerHTML = `<h3>${esc(b.title)}</h3>` + b.text.map((p, j) => `<p${j === pullIdx ? ' class="pull"' : ''}>${esc(p)}</p>`).join('');
  bookText.classList.remove('is-in'); void bookText.offsetWidth; bookText.classList.add('is-in');
  $$('button', bookTabs).forEach((t, j) => t.setAttribute('aria-selected', i === j));
  if (!fromShelf) window.dispatchEvent(new CustomEvent('book:select', { detail: i }));
  if (fromShelf && innerWidth <= 860) bookText.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
}
bookTabs.addEventListener('click', (e) => { const b = e.target.closest('[data-book]'); if (b) showBook(+b.dataset.book); });
showBook(0);

/* ---------- hero lens + reveal ---------- */
(() => {
  const print = $('#hero-print');
  const stage = $('#hero-stage');
  let r = 0, tr = 0, mx = 50, my = 40, raf = 0;
  const loop = () => {
    r += (tr - r) * 0.14;
    print.style.setProperty('--r', `${r.toFixed(1)}px`);
    print.style.setProperty('--mx', `${mx}%`); print.style.setProperty('--my', `${my}%`);
    if (Math.abs(tr - r) > 0.5) raf = requestAnimationFrame(loop); else raf = 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  stage.addEventListener('pointermove', (e) => {
    if (e.target.id === 'hero-camera') { tr = 0; kick(); return; }
    const b = print.getBoundingClientRect();
    mx = ((e.clientX - b.left) / b.width) * 100; my = ((e.clientY - b.top) / b.height) * 100;
    tr = Math.min(170, b.width * 0.3); kick();
  });
  stage.addEventListener('pointerleave', () => { tr = 0; kick(); });
  if (new URLSearchParams(location.search).get('capture') === 'lens') { mx = 58; my = 26; tr = 170; r = 169; kick(); }
})();

export const heroPoses = ['minh_3', 'minh_1', 'minh_2'];
let pose = 0;
export function nextPose() {
  pose = (pose + 1) % heroPoses.length;
  const k = heroPoses[pose];
  const [w, h] = dim(`${k}_c`);
  const bw = $('.hero__fig--bw'); const c = $('.hero__fig--c');
  for (const [el, suf] of [[bw, 'bw'], [c, 'c']]) { el.src = img(`${k}_${suf}`); el.width = w; el.height = h; }
  // seated/flower poses are shorter in frame: scale so they sit like prints
  const hh = k === 'minh_2' ? '52%' : k === 'minh_1' ? '82%' : '96%';
  bw.style.height = c.style.height = hh;
  const print = $('#hero-print');
  print.classList.add('is-color');
  clearTimeout(nextPose.t); nextPose.t = setTimeout(() => print.classList.remove('is-color'), 1400);
}
export function flash() {
  const f = $('#flash');
  if (REDUCED) return;
  f.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
}

/* ---------- reveal on scroll ---------- */
if (!REDUCED && !new URLSearchParams(location.search).has('capture')) {
  const revealIO = new IntersectionObserver((es) => es.forEach((e) => {
    // only elements that start below the fold get the settle; nothing is ever hidden
    if (e.isIntersecting && e.boundingClientRect.top > innerHeight * 0.6) e.target.classList.add('is-in');
    if (e.isIntersecting) revealIO.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.chapter-head, .journey__head, .chapters li, .press__head, .contact__inner > *').forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', `${(i % 4) * 70}ms`); revealIO.observe(el); });
}

/* ---------- 3D (lazy) ---------- */
import('./scenes.js').then((m) => m.boot({ AWARDS, BOOKS, showAward, showBook, nextPose, flash, REDUCED })).catch((err) => {
  console.warn('3D unavailable', err);
  $('#ring').classList.add('no-webgl');
});
