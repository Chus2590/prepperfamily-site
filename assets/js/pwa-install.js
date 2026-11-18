// PrepperFamily.org — Botón de instalación de la PWA y menú de la app.
// En el navegador: el botón de instalación se muestra siempre (salvo
// que la app ya esté instalada), porque el evento beforeinstallprompt
// no siempre llega: no existe en iOS ni en navegadores dentro de otras
// apps. Al tocarlo, si el navegador ofrece la instalación se usa el
// aviso nativo; si no, se muestran los pasos manuales.
// En la app instalada (modo standalone): no hay botón de instalación
// — ya está instalada — y en su lugar aparece el menú exclusivo de la
// app (Inicio / Guardados) en una barra inferior. Tampoco hay header:
// solo una barra con el logo; en la home, el selector de pilares
// existente sube bajo el logo, con sus conteos.
// El pie de página se carga por JS después de la página, así que un
// MutationObserver revela los botones que llegan tarde.
(function () {
  var deferredPrompt = null;
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  // ── Menú exclusivo de la app (solo cuando ya está instalada) ─────────
  function initAppMenu() {
    var isGitHub = location.hostname.endsWith('github.io');
    var base = isGitHub ? '/prepperfamily-site' : '';
    var isSpanish = window.location.pathname.indexOf('/es/') !== -1;
    var homeUrl = base + (isSpanish ? '/es/' : '/');
    var savedUrl = base + (isSpanish ? '/es/guardados/' : '/en/saved/');
    var path = window.location.pathname;
    var isHome = path === base + '/' || path === base + '/es/' || path === base + '/en/' || path === base;
    var isSavedPage = path.indexOf('/guardados/') !== -1 || path.indexOf('/saved/') !== -1;
    var homeLabel = isSpanish ? 'Inicio' : 'Home';
    var savedLabel = isSpanish ? 'Guardados' : 'Saved';
    var donateLabel = isSpanish ? 'Donar' : 'Donate';
    var donateUrl = 'https://donate.stripe.com/fZudR93cKcU1cGwgC5d7q01';

    var savedCount = 0;
    try {
      var saved = JSON.parse(localStorage.getItem('pf-guardados-v1') || '[]');
      if (saved && saved.length) savedCount = saved.length;
    } catch (_) {}

    var svgHome = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11.5L12 4l8 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10.5V20h12v-9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var svgBookmark = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4h10v16l-5-3.6L7 20V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    var svgHeart = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

    var styleId = 'pf-app-menu-styles';
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = [
        '#pf-app-menu{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;justify-content:center;gap:8px;padding:8px 16px calc(8px + env(safe-area-inset-bottom,0px));background:#274828;border-top:1px solid rgba(201,168,76,.45);box-shadow:0 -4px 18px rgba(0,0,0,.25);}',
        '.pf-app-menu-item{position:relative;display:inline-flex;flex-direction:column;align-items:center;gap:2px;min-width:76px;padding:6px 14px 5px;color:#FBF6EC;text-decoration:none;font-family:inherit;font-size:.8rem;font-weight:700;letter-spacing:.02em;line-height:1.2;border-radius:10px;opacity:.72;}',
        '.pf-app-menu-item svg{width:22px;height:22px;}',
        '.pf-app-menu-item.is-active{opacity:1;background:rgba(251,246,236,.14);}',
        '.pf-app-menu-item:active{background:rgba(251,246,236,.10);}',
        '.pf-app-menu-count{position:absolute;top:0;right:8px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#C9A84C;color:#3a2c0e;font-size:.7rem;font-weight:700;line-height:18px;text-align:center;}',
        '.pf-app-menu-donate svg{color:#C9A84C;}',
        'body.pf-app-menu-on{padding-bottom:78px;}'
      ].join('\n');
      document.head.appendChild(style);
    }

    var bar = document.createElement('nav');
    bar.id = 'pf-app-menu';
    bar.setAttribute('aria-label', isSpanish ? 'Menú de la aplicación' : 'App menu');
    var badge = savedCount > 0 ? '<span class="pf-app-menu-count">' + savedCount + '</span>' : '';
    bar.innerHTML =
      '<a class="pf-app-menu-item' + (isHome ? ' is-active' : '') + '" href="' + homeUrl + '">' + svgHome + '<span>' + homeLabel + '</span></a>' +
      '<a class="pf-app-menu-item' + (isSavedPage ? ' is-active' : '') + '" href="' + savedUrl + '">' + svgBookmark + '<span>' + savedLabel + '</span>' + badge + '</a>' +
      '<a class="pf-app-menu-item pf-app-menu-donate" href="' + donateUrl + '" target="_blank" rel="noopener">' + svgHeart + '<span>' + donateLabel + '</span></a>';
    document.body.appendChild(bar);
    document.body.classList.add('pf-app-menu-on');
  }

  // ── App instalada: sin header, solo el logo; selector de pilares ───
  // El header se carga por JS en #pf-header o #pf-header-partial, así
  // que se oculta con CSS (vale llegue cuando llegue). La barra del
  // logo se inyecta al principio del body. En la home, el selector de
  // pilares que ya existe (.lib-chips) sube bajo el logo, fijo al
  // hacer scroll, con los conteos reales de tarjetas por pilar.
  // Los botones conservan sus propios listeners (van en el botón, no
  // en el padre), así que mover el contenedor no rompe el filtro.
  function initAppHeader() {
    var isGitHub = location.hostname.endsWith('github.io');
    var base = isGitHub ? '/prepperfamily-site' : '';
    var isSpanish = window.location.pathname.indexOf('/es/') !== -1;
    var homeUrl = base + (isSpanish ? '/es/' : '/');

    var styleId = 'pf-app-header-styles';
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = [
        '#pf-header, #pf-header-partial { display: none !important; }',
        '.pf-logo-bar { background: #fdfaf4; border-bottom: 1px solid rgba(42,36,30,.08); text-align: center; padding: 14px 16px 10px; }',
        '.pf-logo-bar img { height: 56px; width: auto; }',
        '.pf-app-pillars { position: sticky; top: 0; z-index: 9000; background: #FBF6EC; border-bottom: 1px solid rgba(42,36,30,.08); padding: 12px 16px 8px; }',
        '.pf-app-pillars .lib-chips { flex-wrap: nowrap; overflow-x: auto; }',
        '.pf-app-pillars .chip { flex: 0 0 auto; }',
        '.pf-app-pillars .chip .count { font-weight: 400; opacity: .7; }'
      ].join('\n');
      document.head.appendChild(style);
    }

    var bar = document.createElement('div');
    bar.className = 'pf-logo-bar';
    bar.innerHTML = '<a href="' + homeUrl + '" aria-label="PrepperFamily.org"><img src="' + base + '/assets/images/header/logo.webp" alt="PrepperFamily.org"></a>';
    document.body.insertBefore(bar, document.body.firstChild);

    var chipsBox = document.querySelector('.lib-chips');
    if (!chipsBox) return;
    var wrap = document.createElement('div');
    wrap.className = 'pf-app-pillars';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', chipsBox.getAttribute('aria-label') || 'Filter by pillar');
    bar.parentNode.insertBefore(wrap, bar.nextSibling);
    wrap.appendChild(chipsBox);

    var cards = document.querySelectorAll('.lib-card');
    var counts = {};
    cards.forEach(function (card) {
      var p = card.getAttribute('data-pillar');
      if (p) counts[p] = (counts[p] || 0) + 1;
    });
    chipsBox.querySelectorAll('.chip').forEach(function (chip) {
      var f = chip.getAttribute('data-filter');
      var n = f === 'all' ? cards.length : (counts[f] || 0);
      if (!chip.querySelector('.count')) {
        var s = document.createElement('span');
        s.className = 'count';
        s.textContent = ' ' + n;
        chip.appendChild(s);
      }
    });
  }

  if (isStandalone) {
    initAppMenu();
    initAppHeader();
    return;
  }

  function wire() {
    document.querySelectorAll('.pf-install-btn').forEach(function (btn) {
      if (btn.dataset.pfWired) return;
      btn.dataset.pfWired = '1';
      btn.addEventListener('click', onClick);
    });
  }

  function show() {
    wire();
    document.querySelectorAll('.pf-install-zone').forEach(function (z) {
      z.style.display = '';
    });
  }

  function onClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
    } else {
      // Sin aviso nativo: mostrar los pasos manuales.
      document.querySelectorAll('.pf-install-hint').forEach(function (h) {
        h.style.display = '';
      });
    }
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener('appinstalled', function () {
    document.querySelectorAll('.pf-install-zone').forEach(function (z) {
      z.style.display = 'none';
    });
  });

  show();

  if ('MutationObserver' in window) {
    new MutationObserver(function () { show(); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }
})();
