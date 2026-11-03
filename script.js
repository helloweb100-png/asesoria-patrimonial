/* ==========================================================================
   Asesora Patrimonial · script.js
   Todo lo visual funciona sin librerías.
   Índice: 0 Configuración · 1 Utilidades · 2 WhatsApp · 3 Cargador · 4 Header
           5 Revelados · 6 Motor de scroll · 7 Hero · 8 Maqueta · 9 Detalles
           10 Contadores · 11 FAQ · 12 Formulario · 13 Extras · 14 Arranque
   ========================================================================== */
(() => {
  'use strict';

  /* 0 · CONFIGURACIÓN ------------------------------------------------------
     Único lugar donde vive el número de WhatsApp (52 + 10 dígitos).
     Si se deja vacío, el botón flotante y el envío del formulario se ocultan. */
  const WHATSAPP_NUMBER = '524771211951';
  const BRAND = 'Jardines de Versalles lofts';
  const TOTAL_LOFTS = 14;

  const root = document.documentElement;
  root.classList.add('js'); // desde aquí se activan los estados ocultos de entrada

  /* 1 · UTILIDADES ----------------------------------------------------------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const pad2 = (n) => String(n).padStart(2, '0');
  const arrowOf = (n) => (n % 2 ? '▼' : '▲'); // como en las puertas del proyecto: impares ▼, pares ▲
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqReduce.matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const safe = (fn, name) => {
    try { fn(); } catch (err) { console.warn('[init:' + name + ']', err); }
  };
  const state = { loft: null };

  /* 2 · WHATSAPP -------------------------------------------------------------- */
  const waDigits = String(WHATSAPP_NUMBER).replace(/\D/g, '');
  const hasWA = waDigits.length >= 10;
  const waUrl = (msg) => `https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`;

  function applyWA(a) {
    if (!hasWA) { a.hidden = true; return; }
    a.href = waUrl(a.dataset.msg || `Hola, quiero información de ${BRAND}.`);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  function initWhatsApp() {
    $$('[data-wa-only]').forEach((el) => { el.hidden = !hasWA; });
    $$('[data-wa]').forEach(applyWA);
    if (hasWA && waDigits.startsWith('52') && waDigits.length === 12) {
      const d = waDigits.slice(2);
      const pretty = `+52 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
      $$('[data-phone-text]').forEach((el) => { el.textContent = pretty; });
      $$('[data-phone-link]').forEach((el) => { el.href = `tel:+${waDigits}`; if (!el.querySelector('[data-phone-text]')) el.textContent = pretty; });
    }
    // Globo del botón flotante: aparece un momento para invitar a escribir
    const fl = $('#waFloat');
    if (fl && hasWA) {
      setTimeout(() => fl.classList.add('is-tip'), 5500);
      setTimeout(() => fl.classList.remove('is-tip'), 12000);
    }
  }

  /* 3 · CARGADOR ---------------------------------------------------------------- */
  function initLoader() {
    const loader = $('#loader');
    if (!loader) { root.classList.add('is-ready'); return; }
    const num = $('#loaderNum');
    const bar = $('#loaderBar');
    const dur = reduce() ? 450 : 1500;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      loader.classList.add('is-done');
      root.classList.add('is-ready');
      setTimeout(() => loader.remove(), 1000);
    };
    const t0 = performance.now();
    const step = (now) => {
      if (finished) return;
      const t = clamp((now - t0) / dur);
      const e = easeInOut(t);
      if (num) num.textContent = pad2(Math.round(e * TOTAL_LOFTS));
      if (bar) bar.style.transform = `scaleX(${e})`;
      if (t < 1) requestAnimationFrame(step);
      else setTimeout(finish, 120);
    };
    requestAnimationFrame(step);
    setTimeout(finish, 2000); // respaldo duro
  }

  /* 4 · HEADER, MENÚ Y NAVEGACIÓN ---------------------------------------------------- */
  function initHeader() {
    const header = $('#header');
    const prog = $('#progress');
    const burger = $('#burger');
    const menu = $('#menu');
    const links = $$('a[data-nav]');
    const targets = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      const max = root.scrollHeight - window.innerHeight;
      prog.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;
      let active = null;
      targets.forEach((sec) => {
        const r = sec.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.4) active = '#' + sec.id;
      });
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === active));
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();

    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      document.body.classList.toggle('is-locked', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menu.setAttribute('aria-hidden', String(!open));
    };
    burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    $$('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 1060px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* 5 · REVELADOS AL HACER SCROLL ------------------------------------------------------ */
  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.className = 'w__in';
            inner.style.setProperty('--wi', i++);
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  }

  function initReveal() {
    $$('[data-split]').forEach(splitWords);
    const items = $$('[data-reveal], [data-split]');
    const finishReveal = (el) => {
      if (!el.hasAttribute('data-reveal')) return;
      const drop = () => el.removeAttribute('data-reveal');
      el.addEventListener('transitionend', function onEnd(ev) {
        if (ev.target === el && ev.propertyName === 'opacity') { el.removeEventListener('transitionend', onEnd); drop(); }
      });
      setTimeout(drop, 3600); // respaldo
    };
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        finishReveal(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
    // Seguro: si por algo no se disparó, todo queda visible a los 9 s
    window.addEventListener('load', () => setTimeout(() => items.forEach((el) => el.classList.add('is-in')), 9000));
  }

  /* 6 · MOTOR DE SCROLL (valores suavizados: «motion slow») ------------------------------------ */
  const linked = [];
  let engineRunning = false;
  let lastWake = 0;
  let prevT = 0;

  function link(el, mode, apply, opts = {}) {
    if (!el) return;
    linked.push({ el, mode, apply, cur: 0, tgt: 0, last: null, init: false, ratchet: !!opts.ratchet, k: opts.k === undefined ? 0.1 : opts.k });
  }

  function rawProgress(mode, r) {
    const vh = window.innerHeight;
    switch (mode) {
      case 'view': return clamp((vh - r.top) / (vh + r.height));
      case 'sticky': { const total = r.height - vh; return total > 0 ? clamp(-r.top / total) : 0; }
      case 'center': return clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
      case 'hero': return clamp(-r.top / r.height);
      case 'line': return clamp((vh * 0.62 - r.top) / r.height);
      default: return 0;
    }
  }

  function frame(now) {
    const dt = Math.min(64, now - prevT || 16);
    prevT = now;
    let moving = false;
    for (const it of linked) {
      let tgt = rawProgress(it.mode, it.el.getBoundingClientRect());
      if (it.ratchet) tgt = Math.max(tgt, it.tgt);
      it.tgt = tgt;
      if (!it.init) { it.cur = tgt; it.init = true; }
      const d = it.tgt - it.cur;
      if (Math.abs(d) > 0.0004) {
        const f = reduce() || !it.k ? 1 : 1 - Math.pow(1 - it.k, dt / 16.67);
        it.cur += d * f;
        moving = true;
      } else {
        it.cur = it.tgt;
      }
      if (it.cur !== it.last) { it.apply(it.cur, it.el); it.last = it.cur; }
    }
    engineRunning = moving || now - lastWake < 220;
    if (engineRunning) requestAnimationFrame(frame);
  }

  function wake() {
    lastWake = performance.now();
    if (engineRunning) return;
    engineRunning = true;
    prevT = lastWake;
    requestAnimationFrame(frame);
  }

  function initScrollEffects() {
    /* Hero: la imagen se aleja y el texto se disuelve al bajar */
    const hero = $('.hero');
    const media = $('[data-hero-media]');
    const heroInner = $('.hero__inner');
    link(hero, 'hero', (p) => {
      if (media) media.style.translate = `0 ${(p * 140).toFixed(1)}px`;
      if (heroInner) {
        heroInner.style.opacity = String(clamp(1 - p * 1.35).toFixed(3));
        heroInner.style.translate = `0 ${(-p * 50).toFixed(1)}px`;
      }
    }, { k: 0.14 });

    /* Manifiesto: las palabras se encienden una a una */
    const mt = $('#manifestoText');
    if (mt) {
      const words = [];
      const walk = (node) => {
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              const s = document.createElement('span');
              s.className = 'mw';
              s.style.setProperty('--w', '0');
              s.textContent = part;
              words.push(s);
              frag.appendChild(s);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === 1) walk(child);
        });
      };
      walk(mt);
      const vals = new Array(words.length).fill(-1);
      link(mt, 'view', (p) => {
        const start = 0.2;
        const end = 0.58;
        words.forEach((w, i) => {
          const v = clamp((p - (start + (i / words.length) * (end - start))) / 0.05);
          const q = Math.round(v * 20) / 20;
          if (q !== vals[i]) { vals[i] = q; w.style.setProperty('--w', q); }
        });
      }, { ratchet: true, k: 0.12 });
    }

    /* Recorrido: el marco se abre y las escenas se relevan */
    const story = $('[data-story]');
    if (story) {
      const scenes = $$('[data-scene]', story);
      const caps = $$('[data-cap]', story);
      const rail = $$('[data-rail]', story);
      let lastIdx = -1;
      link(story, 'sticky', (p) => {
        const e = easeInOut(clamp(p / 0.2));
        const r1 = easeInOut(clamp((p - 0.36) / 0.14));
        const r2 = easeInOut(clamp((p - 0.68) / 0.14));
        story.style.setProperty('--e', e.toFixed(4));
        story.style.setProperty('--r1', r1.toFixed(4));
        story.style.setProperty('--r2', r2.toFixed(4));
        const s0 = 1.2 - clamp(p / 0.36) * 0.2;
        const s1 = 1.22 - clamp((p - 0.36) / 0.32) * 0.22;
        const s2 = 1.22 - clamp((p - 0.68) / 0.32) * 0.22;
        if (scenes[0]) scenes[0].style.setProperty('--sc', s0.toFixed(4));
        if (scenes[1]) scenes[1].style.setProperty('--sc', s1.toFixed(4));
        if (scenes[2]) scenes[2].style.setProperty('--sc', s2.toFixed(4));
        const idx = p < 0.36 ? 0 : p < 0.68 ? 1 : 2;
        const capsOn = idx > 0 || e > 0.88;
        caps.forEach((c, i) => c.classList.toggle('is-on', capsOn && i === idx));
        if (idx !== lastIdx) { rail.forEach((r, i) => r.classList.toggle('is-on', i === idx)); lastIdx = idx; }
      }, { k: 0.09 });
    }

    /* Proceso: la línea avanza y enciende cada paso */
    const steps = $('#steps');
    if (steps) {
      const items = $$('[data-step]', steps);
      link(steps, 'line', (p) => {
        steps.style.setProperty('--line', p.toFixed(4));
        const h = steps.offsetHeight || 1;
        items.forEach((s) => {
          const frac = (s.offsetTop + 14) / h;
          if (p >= frac) s.classList.add('is-in', 'is-on');
        });
      }, { ratchet: true, k: 0.1 });
    }

    /* Paralaje suave de imágenes */
    $$('[data-parallax]').forEach((img) => {
      const frameEl = img.parentElement;
      link(frameEl, 'center', (p) => { img.style.translate = `0 ${(-p * 46).toFixed(1)}px`; }, { k: 0.1 });
    });

    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    wake();
  }

  /* 7 · HERO: palabras que rotan, partículas y paralaje con el puntero ---------------------------- */
  function initRotor() {
    const rotor = $('#rotor');
    if (!rotor || reduce()) return;
    const words = $$('b', rotor);
    if (words.length < 2) return;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      const prev = words[i];
      i = (i + 1) % words.length;
      const next = words[i];
      prev.classList.remove('is-on');
      prev.classList.add('is-off');
      next.classList.remove('is-off');
      next.classList.add('is-on');
      setTimeout(() => prev.classList.remove('is-off'), 900);
    }, 2600);
  }

  function initParticles() {
    const canvas = $('#heroFx');
    const hero = $('.hero');
    if (!canvas || !hero || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, parts = [], visible = true, raf = 0, mx = -999, my = -999;
    const make = () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.7 + 0.5, vx: (Math.random() - 0.5) * 0.18, vy: -(Math.random() * 0.35 + 0.08), ph: Math.random() * 6.28, a: Math.random() * 0.55 + 0.3 });
    const resize = () => {
      const r = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(clamp((w * h) / 17000, 26, 88));
      parts = Array.from({ length: n }, make);
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx + Math.sin(t / 1800 + p.ph) * 0.12;
        p.y += p.vy;
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 16900) { const d = Math.sqrt(d2) || 1; const f = (130 - d) / 130; p.x += (dx / d) * f * 1.8; p.y += (dy / d) * f * 1.8; }
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const tw = 0.55 + 0.45 * Math.sin(t / 700 + p.ph);
        ctx.fillStyle = `rgba(201,174,255,${(p.a * 0.18 * tw).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.2832); ctx.fill();
        ctx.fillStyle = `rgba(224,208,255,${(p.a * tw).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      ctx.lineWidth = 0.7;
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 12100) {
            ctx.strokeStyle = `rgba(169,125,255,${((1 - Math.sqrt(d2) / 110) * 0.2).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
    };
    const loop = (t) => { if (!visible || document.hidden) { raf = 0; return; } draw(t); raf = requestAnimationFrame(loop); };
    const start = () => { if (!raf && !reduce()) raf = requestAnimationFrame(loop); };
    resize();
    if (reduce()) { draw(0); } else { start(); }
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduce()) draw(0); }, 200); });
    document.addEventListener('visibilitychange', start);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(hero);
    }
    hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mx = my = -999; });
  }

  function initHeroPointer() {
    if (!finePointer || reduce()) return;
    const hero = $('.hero');
    const layers = [
      { el: $('.hero__img'), k: -14 },
      { el: $('.hero__num--a'), k: 34 },
      { el: $('.hero__num--b'), k: -26 },
      { el: $('.hero__num--c'), k: 22 },
      { el: $('.hero__badge'), k: -12 },
    ].filter((l) => l.el);
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      layers.forEach((l) => { l.el.style.translate = `${(cx * l.k).toFixed(2)}px ${(cy * l.k).toFixed(2)}px`; });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(loop); else running = false;
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
    hero.addEventListener('pointerleave', () => { tx = ty = 0; if (!running) { running = true; requestAnimationFrame(loop); } });
  }

  /* 8 · MAQUETA (fotos + elige tu número) ------------------------------------------------------------------ */
  function initMaqueta() {
    const panel = $('#maqPanel');
    const wraps = [$('#maqChips'), $('#formChips')].filter(Boolean);

    // Fotos de la maqueta: miniaturas y deslizar
    const shots = $$('.maq__shot');
    const thumbs = $$('.maq__thumb');
    const box = $('.maq__shots');
    if (shots.length && shots.length === thumbs.length) {
      let cur = 0;
      const show = (i) => {
        cur = (i + shots.length) % shots.length;
        shots.forEach((s, k) => s.classList.toggle('is-on', k === cur));
        thumbs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === cur)));
      };
      thumbs.forEach((t, i) => t.addEventListener('click', () => show(i)));
      if (box) {
        let sx = null;
        box.addEventListener('pointerdown', (e) => { sx = e.clientX; });
        box.addEventListener('pointerup', (e) => {
          if (sx === null) return;
          const dx = e.clientX - sx;
          sx = null;
          if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
        });
        box.addEventListener('pointercancel', () => { sx = null; });
      }
    }

    // Chips accesibles (maqueta y formulario)
    wraps.forEach((wrap) => {
      for (let n = 1; n <= TOTAL_LOFTS; n++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.dataset.loft = String(n);
        b.setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-label', 'Loft ' + pad2(n));
        b.innerHTML = pad2(n) + '<i aria-hidden="true">' + arrowOf(n) + '</i>';
        wrap.appendChild(b);
      }
      wrap.addEventListener('click', (e) => {
        const b = e.target.closest('.chip');
        if (!b) return;
        const n = Number(b.dataset.loft);
        select(state.loft === n && wrap.id === 'formChips' ? null : n);
      });
    });

    function renderPanel() {
      if (!panel) return;
      if (!state.loft) {
        panel.innerHTML = '<p class="maq__panel-empty">Aún no eliges. Toca un número de abajo.</p>';
        return;
      }
      const n = state.loft;
      panel.innerHTML = '<div class="maq__sel"><span class="maq__sel-n">' + pad2(n) + '<i>' + arrowOf(n) + '</i></span><div><strong>Loft ' + pad2(n) + '</strong><p>Pregunta por su disponibilidad, medidas y esquema de crédito. Te respondemos por WhatsApp.</p></div></div>' +
        '<a class="btn btn--amber" href="#contacto" data-wa data-msg="Hola, me interesa el loft ' + pad2(n) + ' de Jardines de Versalles lofts. ¿Me compartes su ficha, disponibilidad y opciones de crédito?">Quiero saber del loft ' + pad2(n) + ' <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>';
      const a = $('a[data-wa]', panel);
      if (a) {
        if (hasWA) applyWA(a);
        else { a.setAttribute('href', '#contacto'); a.dataset.fallback = '1'; }
      }
    }

    function select(n) {
      state.loft = n;
      $$('.chip[data-loft]').forEach((c) => c.setAttribute('aria-pressed', String(Number(c.dataset.loft) === n)));
      renderPanel();
    }
    renderPanel();
  }

  /* 9 · DETALLES: puntos interactivos con ciclo automático ------------------------------------------------ */
  function initSpots() {
    const items = $$('[data-spot-item]');
    const spots = $$('.spot');
    const section = $('#detalles');
    if (!items.length || !section) return;
    let cur = 0, pausedUntil = 0, visible = false;
    const set = (i) => {
      cur = i;
      items.forEach((li, k) => {
        li.classList.toggle('is-on', k === i);
        const b = $('button', li);
        if (b) b.setAttribute('aria-expanded', String(k === i));
      });
      spots.forEach((s) => s.classList.toggle('is-on', Number(s.dataset.spot) === i));
    };
    const user = (i) => { pausedUntil = performance.now() + 12000; set(i); };
    items.forEach((li, k) => { const b = $('button', li); if (b) b.addEventListener('click', () => user(k)); });
    spots.forEach((s) => s.addEventListener('click', () => user(Number(s.dataset.spot))));
    set(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.3 }).observe(section);
    } else visible = true;
    if (!reduce()) {
      setInterval(() => {
        if (!visible || document.hidden || performance.now() < pausedUntil) return;
        set((cur + 1) % items.length);
      }, 4200);
    }
  }

  /* 10 · CONTADORES (ficha) ---------------------------------------------------------------------------------- */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length || reduce() || !('IntersectionObserver' in window)) return;
    const fmt = (v, d) => v.toFixed(d);
    els.forEach((el) => { el.textContent = fmt(0, Number(el.dataset.decimals || 0)); });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        const end = Number(el.dataset.count);
        const dec = Number(el.dataset.decimals || 0);
        const t0 = performance.now();
        const run = (now) => {
          const t = clamp((now - t0) / 2000);
          el.textContent = fmt(end * easeOut(t), dec);
          if (t < 1) requestAnimationFrame(run); else el.textContent = fmt(end, dec);
        };
        requestAnimationFrame(run);
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
    // Seguro: si no se disparó, deja el valor final
    window.addEventListener('load', () => setTimeout(() => els.forEach((el) => {
      if (el.textContent === fmt(0, Number(el.dataset.decimals || 0))) el.textContent = fmt(Number(el.dataset.count), Number(el.dataset.decimals || 0));
    }), 12000));
  }

  /* 11 · PREGUNTAS FRECUENTES --------------------------------------------------------------------------------- */
  function initFaq() {
    const list = $('#faqList');
    if (!list) return;
    list.addEventListener('click', (e) => {
      const q = e.target.closest('.faq__q');
      if (!q) return;
      const item = q.closest('.faq__item');
      const open = !item.classList.contains('is-open');
      $$('.faq__item', list).forEach((it) => {
        const on = it === item ? open : false;
        it.classList.toggle('is-open', on);
        $('.faq__q', it).setAttribute('aria-expanded', String(on));
      });
    });
  }

  /* 12 · FORMULARIO → WHATSAPP ----------------------------------------------------------------------------------- */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;
    const nombre = $('#f-nombre');
    const err = $('#err-nombre');
    const interes = $('#f-interes');
    const msg = $('#f-msg');
    const note = $('#formNote');
    const setErr = (text) => {
      err.textContent = text;
      nombre.closest('.field').classList.toggle('has-error', Boolean(text));
      nombre.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (text) nombre.setAttribute('aria-describedby', 'err-nombre'); else nombre.removeAttribute('aria-describedby');
    };
    nombre.addEventListener('input', () => setErr(''));
    if (!hasWA && note) note.textContent = 'Muy pronto podrás escribirnos desde aquí. Mientras tanto, déjanos tus datos y te contactamos.';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nombre.value.trim();
      if (name.length < 2) { setErr('Escribe tu nombre para saludarte como se debe.'); nombre.focus(); return; }
      if (!hasWA) return;
      const lines = [
        `Hola, soy ${name}. Vi la página de ${BRAND} y me gustaría recibir información.`,
        `Me interesa: ${interes.value}.`,
      ];
      if (state.loft) lines.push(`Loft de interés: ${pad2(state.loft)}.`);
      const extra = msg.value.trim();
      if (extra) lines.push(extra);
      const url = waUrl(lines.join('\n'));
      const w = window.open(url, '_blank');
      if (w) { try { w.opener = null; } catch (_) { /* ignorar */ } } else { window.location.href = url; }
    });

    // Tarjetas «Para quién»: precargan el interés y una nota en el formulario
    $$('[data-interest]').forEach((a) => a.addEventListener('click', () => {
      const v = a.dataset.interest;
      const opt = Array.from(interes.options).find((o) => o.value === v || o.textContent === v);
      if (opt) interes.value = opt.value;
      if (a.dataset.note && !msg.value.trim()) msg.value = a.dataset.note;
    }));
  }

  /* 13 · EXTRAS: inclinación 3D, botones magnéticos y brillo del cursor ----------------------------------------------- */
  function initExtras() {
    if (!finePointer) return;
    // Inclinación 3D de tarjetas
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    });
    // Botones magnéticos
    $$('.btn--amber.btn--lg, .btn--ghost.btn--lg, .btn--ink.btn--lg').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1)}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
    // Brillo cálido que sigue al cursor
    const glow = $('#cursorGlow');
    if (glow && !reduce()) {
      let gx = 0, gy = 0, cx = 0, cy = 0, run = false;
      const loop = () => {
        cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
        glow.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
        if (Math.abs(gx - cx) > 0.5 || Math.abs(gy - cy) > 0.5) requestAnimationFrame(loop); else run = false;
      };
      window.addEventListener('pointermove', (e) => {
        gx = e.clientX; gy = e.clientY;
        glow.classList.add('is-on');
        if (!run) { run = true; requestAnimationFrame(loop); }
      }, { passive: true });
      document.addEventListener('pointerleave', () => glow.classList.remove('is-on'));
    }
  }

  /* 14 · ARRANQUE ---------------------------------------------------------------------------------------------------------------- */
  function boot() {
    safe(initWhatsApp, 'whatsapp');
    safe(initLoader, 'loader');
    safe(initHeader, 'header');
    safe(initReveal, 'reveal');
    safe(initScrollEffects, 'scroll');
    safe(initRotor, 'rotor');
    safe(initParticles, 'particulas');
    safe(initHeroPointer, 'hero-puntero');
    safe(initMaqueta, 'maqueta');
    safe(initSpots, 'detalles');
    safe(initCounters, 'contadores');
    safe(initFaq, 'faq');
    safe(initForm, 'formulario');
    safe(initExtras, 'extras');
    // Seguro final: si el cargador no avisó, el hero aparece igual
    setTimeout(() => root.classList.add('is-ready'), 2600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
