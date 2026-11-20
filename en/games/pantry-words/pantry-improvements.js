/* Pantry Words · visual effects. Does not change rules: it only observes the DOM. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var tb = $('tablero'), msgEl = $('msg'), vil = $('villano'), fin = $('final'), wn = $('mundoNombre');
  if (!tb || !msgEl) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Particle canvas (only runs while there are particles) ---- */
  var cv = document.createElement('canvas');
  cv.id = 'pf-fx'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
  var cx = cv.getContext ? cv.getContext('2d') : null, P = [], raf = 0, W = 0, H = 0;
  function size() {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight; cv.width = W * d; cv.height = H * d;
    if (cx) cx.setTransform(d, 0, 0, d, 0, 0);
  }
  size(); window.addEventListener('resize', size);
  var COL = {
    oro: ['#ffd877', '#f8b84e', '#fff3c4'], verde: ['#6fcf97', '#2c6d4c', '#c8f0d4'],
    rojo: ['#e4593f', '#c0392b', '#ffb4a3'], hoja: ['#c8782a', '#e0a030', '#7a9a3c', '#a8452a', '#2c6d4c']
  };
  function burst(x, y, n, pal, o) {
    if (reduce || !cx || P.length > 260) return;
    o = o || {};
    for (var i = 0; i < Math.min(n, 70); i++) {
      var a = Math.random() * 6.283, v = (o.v || 5) * (0.4 + Math.random());
      P.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up == null ? 2 : o.up),
        g: o.g == null ? 0.18 : o.g, life: 0, max: (o.life || 40) + Math.random() * 20,
        s: (o.s || 4) * (0.6 + Math.random()), c: pal[i % pal.length], k: o.k || 'c',
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3 });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    cx.clearRect(0, 0, W, H);
    for (var i = P.length - 1; i >= 0; i--) {
      var p = P[i]; p.life++; p.vx *= 0.985; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      var a = 1 - p.life / p.max;
      if (a <= 0) { P.splice(i, 1); continue; }
      cx.globalAlpha = a; cx.fillStyle = p.c; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
      if (p.k === 'l') { cx.beginPath(); cx.ellipse(0, 0, p.s * 1.6, p.s * 0.7, 0, 0, 6.283); cx.fill(); }
      else if (p.k === 's') cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
      else { cx.beginPath(); cx.arc(0, 0, p.s * a + 0.5, 0, 6.283); cx.fill(); }
      cx.restore();
    }
    cx.globalAlpha = 1;
    if (P.length) raf = requestAnimationFrame(tick); else { raf = 0; cx.clearRect(0, 0, W, H); }
  }

  /* ---- Utilities ---- */
  function center(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function flota(txt, x, y, color, big) {
    var e = document.createElement('div');
    e.className = 'pf-flota' + (big ? ' grande' : ''); e.textContent = txt;
    e.style.left = Math.max(60, Math.min(W - 60, x)) + 'px'; e.style.top = y + 'px'; e.style.color = color;
    document.body.appendChild(e); setTimeout(function () { e.remove(); }, 1200);
  }
  function flash(color) {
    if (reduce) return;
    var e = document.createElement('div'); e.className = 'pf-flash'; e.style.background = color;
    document.body.appendChild(e); setTimeout(function () { e.remove(); }, 700);
  }
  function anim(el, cls, ms) {
    if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, ms || 500);
  }
  function vibra(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

  /* ---- Letter taps: bounce + sparks on the newly picked letter ---- */
  tb.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tile'); if (!b) return;
    var r = b.dataset.r, c = b.dataset.c;
    setTimeout(function () {
      var n = tb.querySelector('.tile.sel[data-r="' + r + '"][data-c="' + c + '"]');
      if (!n) return;
      n.classList.add('pop'); var p = center(n);
      burst(p.x, p.y, 6, COL.verde, { v: 2.5, life: 22, s: 2.5, up: 0.5, g: 0.05 });
    }, 0);
  }, true);

  /* ---- Reactions to what the game announces in #msg ---- */
  new MutationObserver(function () {
    var t = msgEl.textContent; if (!t) return;
    var ok = msgEl.classList.contains('ok'), mal = msgEl.classList.contains('mal');
    anim(msgEl, 'anim', 350);
    if (mal) { anim(tb, 'rechazo', 350); vibra(40); return; }
    if (!ok) return;
    var g = t.match(/^([A-Z]+)! \+(\d+) points/);
    if (g) {
      var pw = document.querySelector('.palabra'), pc = center(pw), len = g[1].length;
      flota('+' + g[2], pc.x, pc.y, '#8a6b2a');
      burst(pc.x, pc.y, 10 + len * 3, COL.oro, { v: 5, life: 36, s: 3.5 });
      if (/golden acorn/.test(t)) burst(pc.x, pc.y, 16, COL.oro, { v: 6, life: 44, s: 4, k: 's' });
      if (/long word/.test(t)) {
        burst(pc.x, pc.y, 36, COL.hoja, { v: 7, life: 60, s: 4, k: 'l', g: 0.12 });
        flota('Long word!', pc.x, pc.y - 34, '#2c6d4c', true);
      }
      Array.prototype.forEach.call(tb.children, function (b, i) {
        b.style.animationDelay = ((i % 6) * 22 + Math.floor(i / 6) * 8) + 'ms'; b.classList.add('caer');
      });
    }
    var d = t.match(/(\d+) damage to/);
    if (d && vil) {
      var vc = center(vil);
      flota('−' + d[1], vc.x, vc.y, '#c0392b'); anim(vil, 'hit', 450);
      burst(vc.x, vc.y, 14, COL.rojo, { v: 5, life: 30, s: 3 }); vibra(30);
    }
    if (/defeated/.test(t) && vil) {
      var dc = center(vil);
      burst(dc.x, dc.y, 50, COL.oro.concat(COL.hoja), { v: 8, life: 60, s: 4.5, k: 's' });
      flota('Defeated!', dc.x, dc.y - 30, '#8a6b2a', true); flash('rgba(248,184,78,.35)');
    }
    if (/Counterattack/.test(t)) { anim(tb, 'infecta', 600); flash('rgba(192,57,43,.22)'); vibra(60); }
    if (/Freed/.test(t)) { var tc = center(tb); burst(tc.x, tc.y, 22, COL.verde, { v: 6, life: 36, s: 3 }); }
    if (/New game/.test(t)) { Array.prototype.forEach.call(tb.children, function (b) { b.classList.add('caer'); }); }
  }).observe(msgEl, { childList: true, characterData: true });

  /* ---- Villain: entrance and alert when about to counterattack ---- */
  var habiaVillano = false;
  if (vil) new MutationObserver(function () {
    var hay = vil.textContent.length > 0;
    if (hay && !habiaVillano) anim(vil, 'entra', 520);
    habiaVillano = hay;
    vil.classList.toggle('alerta', /counterattacks in 1 word/.test(vil.textContent));
  }).observe(vil, { childList: true });

  /* ---- Worlds: atmosphere per world and celebration on advance ---- */
  var MUNDOS = [['🌱', 'huerto'], ['🥫', 'despensa'], ['🌲', 'bosque'], ['🏺', 'bodega'], ['🏠', 'refugio'], ['🍳', 'cocina'], ['🌾', 'granero']], idxPrev = -1;
  function mundo() {
    var t = wn.textContent, idx = 0;
    MUNDOS.forEach(function (m, i) { if (t.indexOf(m[0]) === 0) idx = i; });
    document.body.setAttribute('data-mundo', MUNDOS[idx][1]);
    if (idxPrev >= 0 && idx > idxPrev) {
      flota(t, W / 2, H * 0.3, '#1f5138', true); flash('rgba(255,244,190,.5)');
      burst(W / 2, H * 0.3, 40, COL.hoja, { v: 7, life: 70, s: 4, k: 'l', g: 0.1 });
    }
    idxPrev = idx;
  }
  if (wn) { new MutationObserver(mundo).observe(wn, { childList: true }); mundo(); }

  /* ---- Scoreboard: bounce on change and flame on streak ---- */
  ['hudPuntos', 'hudTotal', 'hudRacha'].forEach(function (id) {
    var el = $(id); if (!el) return;
    new MutationObserver(function () {
      anim(el.parentNode, 'bump', 380);
      if (id === 'hudRacha') el.parentNode.classList.toggle('fuego', (parseInt(el.textContent, 10) || 0) >= 3);
    }).observe(el, { childList: true });
  });

  /* ---- Shuffle and final screen ---- */
  var bm = $('btnMezclar');
  if (bm) bm.addEventListener('click', function () { setTimeout(function () { anim(tb, 'mezcla', 520); }, 0); });
  if (fin) new MutationObserver(function () {
    if (!fin.classList.contains('show')) return;
    try { fin.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); } catch (e) {}
    [0, 250, 500, 800].forEach(function (d, i) {
      setTimeout(function () {
        burst(W * (0.2 + 0.2 * i), H * 0.25, 40, COL.oro.concat(COL.hoja), { k: i % 2 ? 's' : 'l', v: 7, life: 70, s: 5, g: 0.16 });
      }, d);
    });
  }).observe(fin, { attributes: true, attributeFilter: ['class'] });

  /* ---- Missing Nutty image: emoji fallback, no broken gaps ---- */
  function respaldo(img) {
    if (!img || !img.parentNode || img.previousSibling && img.previousSibling.className === 'nuez-hero fallback') return;
    var f = document.createElement('div');
    f.className = 'nuez-hero fallback'; f.textContent = '🐿️';
    f.setAttribute('role', 'img'); f.setAttribute('aria-label', 'Nutty, the squirrel');
    img.parentNode.insertBefore(f, img);
  }
  document.addEventListener('error', function (e) {
    var i = e.target; if (i && i.tagName === 'IMG' && i.classList.contains('nuez-hero')) respaldo(i);
  }, true);
  Array.prototype.forEach.call(document.querySelectorAll('img.nuez-hero'), function (i) {
    if (i.complete && i.naturalWidth === 0) respaldo(i);
  });
})();
