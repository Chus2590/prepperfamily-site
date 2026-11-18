// PrepperFamily.org — Botón de instalación de la PWA y experiencia de la app.
// En el navegador: el botón de instalación se muestra siempre (salvo
// que la app ya esté instalada), porque el evento beforeinstallprompt
// no siempre llega: no existe en iOS ni en navegadores dentro de otras
// apps. Al tocarlo, si el navegador ofrece la instalación se usa el
// aviso nativo; si no, se muestran los pasos manuales.
// En la app instalada (modo standalone) la experiencia es propia y no
// toca la web: header compacto de 60 px (logo sin fondo, buscar,
// idioma) que se oculta al bajar y reaparece al subir, transparente
// sobre la portada y sólido al desplazarse; portada al 75 % de la
// pantalla con degradado para el contraste; filtros de la biblioteca
// fijos bajo el header, con conteos; barra inferior con Inicio, Guías,
// Guardados y Donar; en los artículos, barra mínima de lectura con
// progreso dorado y bloque de donación al final.
// El pie de página se carga por JS después de la página, así que un
// MutationObserver revela los botones que llegan tarde.
(function () {
  var deferredPrompt = null;
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  // ── Contexto compartido (solo app) ───────────────────────────────────
  var isGitHub = location.hostname.endsWith('github.io');
  var base = isGitHub ? '/prepperfamily-site' : '';
  var isSpanish = window.location.pathname.indexOf('/es/') !== -1;
  var homeUrl = base + (isSpanish ? '/es/' : '/');
  var savedUrl = base + (isSpanish ? '/es/guardados/' : '/en/saved/');
  var guidesUrl = homeUrl + '#library';
  var shopUrl = base + (isSpanish ? '/es/tienda/' : '/en/shop/');
  var gameUrl = base + (isSpanish ? '/es/juegos/' : '/en/games/');
  var communityUrl = 'https://www.facebook.com/profile.php?id=100094190691995';
  var donateUrl = 'https://donate.stripe.com/fZudR93cKcU1cGwgC5d7q01';
  var path = window.location.pathname;
  var isHome = path === base + '/' || path === base + '/es/' || path === base + '/en/' || path === base;
  var isSavedPage = path.indexOf('/guardados/') !== -1 || path.indexOf('/saved/') !== -1;
  var isArticle = !!document.getElementById('pf-article-nav-top');

  function pageUrl() {
    return window.location.href.split('#')[0].split('?')[0];
  }

  function readSaved() {
    try {
      var list = JSON.parse(localStorage.getItem('pf-guardados-v1') || '[]');
      return Array.isArray(list) ? list : [];
    } catch (_) { return []; }
  }

  function cleanTitle() {
    return (document.title || 'PrepperFamily.org')
      .replace(/\s*\|\s*PrepperFamily\.org\s*$/, '').trim();
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function addStyle(id, rules) {
    if (document.getElementById(id)) return;
    var style = document.createElement('style');
    style.id = id;
    style.textContent = rules.join('\n');
    document.head.appendChild(style);
  }

  // ── Scroll compartido: header hide-on-scroll + progreso de lectura ──
  var lastScrollY = window.scrollY || 0;
  function onScroll() {
    var y = window.scrollY || 0;
    var header = document.getElementById('pf-app-header');
    if (header) {
      if (y > lastScrollY && y > 90) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
      if (isHome) {
        if (y > 24) header.classList.add('is-solid');
        else header.classList.remove('is-solid');
      }
    }
    var prog = document.getElementById('pf-read-progress');
    if (prog) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      prog.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
    lastScrollY = y;
  }

  // ── Barra inferior: Guardados · Donar · Ajustes ──────────────────────
  function initAppMenu() {
    var savedLabel = isSpanish ? 'Guardados' : 'Saved';
    var donateLabel = isSpanish ? 'Donar' : 'Donate';
    var settingsLabel = isSpanish ? 'Ajustes' : 'Settings';
    var exploreLabel = isSpanish ? 'Explorar' : 'Explore';

    var savedCount = readSaved().length;
    var seenCount = 0;
    try { seenCount = parseInt(localStorage.getItem('pf-guardados-vistos') || '0', 10) || 0; } catch (_) {}
    var newCount = savedCount - seenCount;

    var svgBookmark = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4h10v16l-5-3.6L7 20V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    var svgHeart = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    var svgGear = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

    var svgCompass = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><polygon points="15.5,8.5 13.5,13.5 8.5,15.5 10.5,10.5" fill="currentColor"/></svg>';

    addStyle('pf-app-menu-styles', [
      'body.pf-app { overflow-x: clip; }',
      '#pf-app-menu{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;justify-content:center;gap:4px;width:100vw;max-width:100vw;box-sizing:border-box;min-height:64px;padding:6px 10px calc(6px + env(safe-area-inset-bottom,0px));background:#274828;border-top:1px solid rgba(201,168,76,.45);box-shadow:0 -4px 18px rgba(0,0,0,.25);}',
      '.pf-app-menu-item{position:relative;flex:1 1 0;min-width:0;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 4px 4px;color:#FBF6EC;text-decoration:none;font-family:inherit;font-size:.72rem;font-weight:700;letter-spacing:.02em;line-height:1.2;border:0;border-radius:10px;white-space:nowrap;opacity:.75;background:transparent;cursor:pointer;}',
      '.pf-app-menu-item svg{width:20px;height:20px;}',
      '.pf-app-menu-item.is-active{opacity:1;background:rgba(251,246,236,.14);box-shadow:inset 0 2px 0 #C9A84C;}',
      '.pf-app-menu-item:active{background:rgba(251,246,236,.10);}',
      '.pf-app-menu-count{position:absolute;top:0;right:calc(50% - 24px);min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#C9A84C;color:#3a2c0e;font-size:.7rem;font-weight:700;line-height:18px;text-align:center;}',
      '.pf-app-menu-donate{background:#C9A84C;color:#3a2c0e;opacity:1;}',
      '.pf-app-menu-donate svg{color:#3a2c0e;}',
      'body.pf-app-menu-on{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px));}'
    ]);

    var bar = document.createElement('nav');
    bar.id = 'pf-app-menu';
    bar.setAttribute('aria-label', isSpanish ? 'Menú de la aplicación' : 'App menu');
    var badge = newCount > 0 ? '<span class="pf-app-menu-count">' + newCount + '</span>' : '';
    bar.innerHTML =
      '<a class="pf-app-menu-item' + (isSavedPage ? ' is-active' : '') + '" href="' + savedUrl + '">' + svgBookmark + '<span>' + savedLabel + '</span>' + badge + '</a>' +
      '<button type="button" id="pf-menu-donate" class="pf-app-menu-item pf-app-menu-donate">' + svgHeart + '<span>' + donateLabel + '</span></button>' +
      '<button type="button" id="pf-menu-explore" class="pf-app-menu-item">' + svgCompass + '<span>' + exploreLabel + '</span></button>' +
      '<button type="button" id="pf-menu-settings" class="pf-app-menu-item">' + svgGear + '<span>' + settingsLabel + '</span></button>';
    document.body.appendChild(bar);
    document.body.classList.add('pf-app-menu-on');
  }

  // ── Donar: el anuncio solo aparece al tocar Donar ────────────────────
  // En la app, la sección de apoyo del pie (#pf-support-combined, con
  // la tarjeta de donar) queda oculta. Al tocar Donar en la barra, esa
  // misma sección se muestra en una hoja inferior descartable (con X y
  // tocando fuera), y vuelve a su sitio al cerrarse. Así el anuncio no
  // estorba la lectura y siempre se puede quitar. Si el pie aún no ha
  // cargado, Donar abre el enlace de Stripe directamente.
  var donateSheet = null;
  var supportOriginal = null;

  function closeDonateSheet() {
    if (!donateSheet) return;
    var support = document.getElementById('pf-support-combined');
    if (support && supportOriginal && supportOriginal.parent) {
      if (supportOriginal.next) supportOriginal.parent.insertBefore(support, supportOriginal.next);
      else supportOriginal.parent.appendChild(support);
    }
    donateSheet.remove();
    donateSheet = null;
    supportOriginal = null;
    document.body.style.overflow = '';
  }

  function initDonateSheet() {
    addStyle('pf-app-donate-styles', [
      'body.pf-app #pf-footer #pf-support-combined { display: none !important; }',
      '.pf-donate-sheet-backdrop { position: fixed; inset: 0; z-index: 10000; background: rgba(20,30,20,.55); display: flex; align-items: flex-end; justify-content: center; }',
      '.pf-donate-sheet { position: relative; width: 100%; max-width: 640px; max-height: 85svh; overflow-y: auto; background: #FBF6EC; border-radius: 24px 24px 0 0; padding: 12px 16px calc(20px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -8px 32px rgba(0,0,0,.3); }',
      '.pf-donate-sheet-close { position: sticky; top: 0; float: right; z-index: 2; width: 44px; height: 44px; margin-left: 8px; border: 0; border-radius: 50%; background: rgba(39,72,40,.10); color: #274828; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }',
      '.pf-donate-sheet #pf-support-combined { display: block; }'
    ]);

    var btn = document.getElementById('pf-menu-donate');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (donateSheet) return;
      var support = document.getElementById('pf-support-combined');
      if (!support) { window.open(donateUrl, '_blank'); return; }
      supportOriginal = { parent: support.parentNode, next: support.nextSibling };
      var backdrop = document.createElement('div');
      backdrop.className = 'pf-donate-sheet-backdrop';
      backdrop.innerHTML =
        '<div class="pf-donate-sheet" role="dialog" aria-label="' + (isSpanish ? 'Apoyar a PrepperFamily.org' : 'Support PrepperFamily.org') + '">' +
          '<button type="button" class="pf-donate-sheet-close" aria-label="' + (isSpanish ? 'Cerrar' : 'Close') + '">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          '</button>' +
          '<div class="pf-donate-sheet-body"></div>' +
        '</div>';
      backdrop.querySelector('.pf-donate-sheet-body').appendChild(support);
      document.body.appendChild(backdrop);
      donateSheet = backdrop;
      document.body.style.overflow = 'hidden';
      backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeDonateSheet(); });
      backdrop.querySelector('.pf-donate-sheet-close').addEventListener('click', closeDonateSheet);
      var donateBtn = support.querySelector('.pf-donate-button');
      if (donateBtn) donateBtn.addEventListener('click', function () { setTimeout(closeDonateSheet, 300); });
    });
  }

  // ── Ajustes: idioma (cambio real) + Tienda, Juegos, Comunidad ────────
  // El idioma ya no está en el encabezado: vive en Ajustes. El cambio
  // es real: va a la MISMA página en el otro idioma (hreflang del
  // <head>; si la página no tiene, a la raíz del pilar equivalente; si
  // no, a la home del otro idioma). Así cambia la app y el contenido.
  var settingsSheet = null;

  function closeSettingsSheet() {
    if (!settingsSheet) return;
    settingsSheet.remove();
    settingsSheet = null;
    document.body.style.overflow = '';
  }

  function switchLanguage(targetLang) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + targetLang + '"]');
    var url = link ? link.getAttribute('href') : null;
    if (!url) {
      var pillars = {
        '/es/sustento-material/': '/en/material-support/',
        '/es/resistencia-familiar/': '/en/family-resilience/',
        '/es/fortaleza-interior/': '/en/inner-strength/',
        '/en/material-support/': '/es/sustento-material/',
        '/en/family-resilience/': '/es/resistencia-familiar/',
        '/en/inner-strength/': '/es/fortaleza-interior/'
      };
      var p = window.location.pathname;
      var key = null;
      Object.keys(pillars).forEach(function (k) { if (p.indexOf(k) === 0) key = k; });
      url = key ? pillars[key] : (targetLang === 'es' ? '/es/' : '/');
    }
    window.location.href = url;
  }

  function initSettingsSheet() {
    addStyle('pf-app-settings-styles', [
      '.pf-settings-sheet-backdrop { position: fixed; inset: 0; z-index: 10000; background: rgba(20,30,20,.55); display: flex; align-items: flex-end; justify-content: center; }',
      '.pf-settings-sheet { position: relative; width: 100%; max-width: 640px; max-height: 85svh; overflow-y: auto; background: #FBF6EC; border-radius: 24px 24px 0 0; padding: 12px 16px calc(20px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -8px 32px rgba(0,0,0,.3); }',
      '.pf-settings-sheet-close { position: sticky; top: 0; float: right; z-index: 2; width: 44px; height: 44px; margin-left: 8px; border: 0; border-radius: 50%; background: rgba(39,72,40,.10); color: #274828; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }',
      '.pf-settings-sheet h2 { font-size: 1.3rem; color: #274828; margin: .4rem 0 1rem; }',
      '.pf-settings-sheet h3 { font-size: .8rem; text-transform: uppercase; letter-spacing: .1em; color: #274828; opacity: .7; margin: 1.2rem 0 .5rem; }',
      '.pf-settings-lang { display: flex; gap: 10px; }',
      '.pf-settings-lang button { flex: 1; min-height: 48px; border: 1.5px solid rgba(39,72,40,.35); border-radius: 12px; background: #fff; color: #274828; font: inherit; font-weight: 700; cursor: pointer; }',
      '.pf-settings-lang button.is-active { background: #274828; border-color: #274828; color: #FBF6EC; }',
      '.pf-settings-link { display: flex; align-items: center; justify-content: space-between; min-height: 48px; padding: .6rem .2rem; border-bottom: 1px solid rgba(39,72,40,.12); color: #274828; font-weight: 700; text-decoration: none; }',
      '.pf-settings-link:last-child { border-bottom: 0; }'
    ]);

    var btn = document.getElementById('pf-menu-settings');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (settingsSheet) return;
      var backdrop = document.createElement('div');
      backdrop.className = 'pf-settings-sheet-backdrop';
      backdrop.innerHTML =
        '<div class="pf-settings-sheet" role="dialog" aria-label="' + (isSpanish ? 'Ajustes' : 'Settings') + '">' +
          '<button type="button" class="pf-settings-sheet-close" aria-label="' + (isSpanish ? 'Cerrar' : 'Close') + '">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          '</button>' +
          '<h2>' + (isSpanish ? 'Ajustes' : 'Settings') + '</h2>' +
          '<h3>' + (isSpanish ? 'Idioma' : 'Language') + '</h3>' +
          '<div class="pf-settings-lang">' +
            '<button type="button" data-lang="es" class="' + (isSpanish ? 'is-active' : '') + '">Español</button>' +
            '<button type="button" data-lang="en" class="' + (isSpanish ? '' : 'is-active') + '">English</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(backdrop);
      settingsSheet = backdrop;
      document.body.style.overflow = 'hidden';
      backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeSettingsSheet(); });
      backdrop.querySelector('.pf-settings-sheet-close').addEventListener('click', closeSettingsSheet);
      backdrop.querySelectorAll('.pf-settings-lang button').forEach(function (b) {
        b.addEventListener('click', function () {
          var target = b.getAttribute('data-lang');
          if ((target === 'es') === isSpanish) { closeSettingsSheet(); return; }
          switchLanguage(target);
        });
      });
    });
  }

  // ── Explorar: Tienda, Juegos y Comunidad en una hoja inferior ───────
  // Antes vivía dentro de Ajustes; ahora es un botón propio en la barra.
  // Reusa el aspecto de la hoja de Ajustes. Al tocar un enlace, la hoja
  // se cierra (también al tocar fuera o la X).
  var exploreSheet = null;

  function closeExploreSheet() {
    if (!exploreSheet) return;
    exploreSheet.remove();
    exploreSheet = null;
    document.body.style.overflow = '';
  }

  function initExploreSheet() {
    var btn = document.getElementById('pf-menu-explore');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (exploreSheet) return;
      var shop = isSpanish ? '/es/tienda/' : '/en/shop/';
      var game = isSpanish ? '/es/juegos/' : '/en/games/';
      var community = (isSpanish ? '/es/' : '/') + '#community';
      var backdrop = document.createElement('div');
      backdrop.className = 'pf-settings-sheet-backdrop';
      backdrop.innerHTML =
        '<div class="pf-settings-sheet" role="dialog" aria-label="' + (isSpanish ? 'Explorar' : 'Explore') + '">' +
          '<button type="button" class="pf-settings-sheet-close" aria-label="' + (isSpanish ? 'Cerrar' : 'Close') + '">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          '</button>' +
          '<h2>' + (isSpanish ? 'Explorar' : 'Explore') + '</h2>' +
          '<a class="pf-settings-link" href="' + shop + '"><span>' + (isSpanish ? 'Tienda' : 'Shop') + '</span><span>›</span></a>' +
          '<a class="pf-settings-link" href="' + game + '"><span>' + (isSpanish ? 'Juegos' : 'Games') + '</span><span>›</span></a>' +
          '<a class="pf-settings-link" href="' + community + '"><span>' + (isSpanish ? 'Comunidad' : 'Community') + '</span><span>›</span></a>' +
        '</div>';
      document.body.appendChild(backdrop);
      exploreSheet = backdrop;
      document.body.style.overflow = 'hidden';
      backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeExploreSheet(); });
      backdrop.querySelector('.pf-settings-sheet-close').addEventListener('click', closeExploreSheet);
      backdrop.querySelectorAll('.pf-settings-link').forEach(function (a) {
        a.addEventListener('click', closeExploreSheet);
      });
    });
  }

  // ── Pilares: en las páginas de pilar y categoría, los otros a la vista
  // Solo en páginas de pilar/categoría (nunca en artículos). En las de
  // categoría van SOLO arriba de las opciones de categoría (el submenú),
  // nunca entre las tarjetas. En la raíz del pilar, bajo su encabezado.
  function initPillarSwitcher() {
    if (isArticle) return;
    // Cada pastilla lleva a la primera categoría de su pilar: la app
    // abre en Almacena, y Jesús pidió Roles y Conceptos como destino
    // de Resistencia y Fortaleza. `root` solo marca el pilar activo
    // cuando se está en la raíz del pilar.
    var pillars = isSpanish ? [
      { label: 'Sustento Material', url: '/es/sustento-material/almacena/', root: '/es/sustento-material/' },
      { label: 'Resistencia Familiar', url: '/es/resistencia-familiar/roles-estructura/', root: '/es/resistencia-familiar/' },
      { label: 'Fortaleza Interior', url: '/es/fortaleza-interior/conceptos-cristianos-basicos/', root: '/es/fortaleza-interior/' }
    ] : [
      { label: 'Material Support', url: '/en/material-support/store/', root: '/en/material-support/' },
      { label: 'Family Resilience', url: '/en/family-resilience/roles-structure/', root: '/en/family-resilience/' },
      { label: 'Inner Strength', url: '/en/inner-strength/basic-christian-concepts/', root: '/en/inner-strength/' }
    ];
    var current = null;
    pillars.forEach(function (p) { if (window.location.pathname.indexOf(p.url) === 0) current = p.url; });
    if (!current) pillars.forEach(function (p) { if (window.location.pathname.indexOf(p.root) === 0) current = p.url; });
    if (!current) return;
    var submenu = document.getElementById('pf-submenu-partial');
    var anchor = null;
    var before = false;
    if (submenu) { anchor = submenu; before = true; }
    else { anchor = document.querySelector('header.sm-hero') || document.querySelector('h1'); }
    if (!anchor) return;
    addStyle('pf-app-pillars-styles', [
      '.pf-pillars { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 14px 0 4px; }',
      '.pf-pillars::-webkit-scrollbar { display: none; }',
      '.pf-pillars a { flex: 0 0 auto; min-height: 44px; display: inline-flex; align-items: center; padding: .5rem 1.1rem; border-radius: 999px; border: 1.5px solid rgba(39,72,40,.35); background: #fff; color: #274828; font-weight: 700; font-size: .9rem; text-decoration: none; }',
      '.pf-pillars a.is-active { background: #274828; border-color: #274828; color: #FBF6EC; }'
    ]);
    var row = document.createElement('nav');
    row.className = 'pf-pillars';
    row.setAttribute('aria-label', isSpanish ? 'Pilares' : 'Pillars');
    pillars.forEach(function (p) {
      var a = document.createElement('a');
      a.href = p.url;
      a.textContent = p.label;
      if (p.url === current) a.classList.add('is-active');
      row.appendChild(a);
    });
    if (before) anchor.parentNode.insertBefore(row, anchor);
    else anchor.parentNode.insertBefore(row, anchor.nextSibling);
  }

  // ── Header compacto (60 px): logo sin fondo, buscar, idioma ─────────
  // En la portada es transparente sobre la imagen y pasa a sólido
  // (pergamino) al desplazarse; en el resto de páginas nace sólido.
  // Se oculta al bajar y reaparece al subir (transición de 200 ms).
  function initAppHeader() {
    var svgSearch = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

    addStyle('pf-app-header-styles', [
      '#pf-header, #pf-header-partial { display: none !important; }',
      'body.pf-app { padding-top: 60px; }',
      'body.pf-app.pf-app-home { padding-top: 0; }',
      'body.pf-app [id] { scroll-margin-top: 70px; }',
      '.pf-app-header { position: fixed; top: 0; left: 0; right: 0; z-index: 9500; height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 8px 0 14px; background: transparent; border-bottom: 1px solid transparent; transition: transform .2s ease, background-color .2s ease, border-color .2s ease, box-shadow .2s ease; }',
      '.pf-app-header.is-solid { background: #FBF6EC; border-bottom-color: rgba(42,36,30,.10); box-shadow: 0 2px 12px rgba(0,0,0,.08); }',
      '.pf-app-header.is-hidden { transform: translateY(-100%); }',
      '.pf-app-header .pf-app-logo { display: block; line-height: 0; }',
      '.pf-app-header .pf-app-logo img { height: 48px; width: auto; display: block; }',
      '.pf-app-header-actions { display: flex; align-items: center; gap: 2px; }',
      '.pf-app-header-btn { min-width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 10px; border: 0; border-radius: 999px; background: transparent; color: #274828; font-family: inherit; font-size: .9rem; font-weight: 700; text-decoration: none; cursor: pointer; }',
      '.pf-app-header-btn:active { background: rgba(39,72,40,.10); }'
    ]);

    var header = document.createElement('header');
    header.id = 'pf-app-header';
    header.className = 'pf-app-header' + (isHome ? '' : ' is-solid');
    header.innerHTML =
      '<a class="pf-app-logo" href="' + homeUrl + '" aria-label="PrepperFamily.org"><img src="' + base + '/assets/images/header/logo-app.webp" alt="PrepperFamily.org"></a>' +
      '<span class="pf-app-header-actions">' +
        '<button type="button" class="pf-app-header-btn pf-app-search-btn" aria-label="' + (isSpanish ? 'Buscar' : 'Search') + '">' + svgSearch + '</button>' +
      '</span>';
    document.body.insertBefore(header, document.body.firstChild);

    header.querySelector('.pf-app-search-btn').addEventListener('click', function () {
      if (isHome) {
        var q = document.getElementById('libSearch');
        var lib = document.getElementById('library');
        if (lib) lib.scrollIntoView({ behavior: 'smooth' });
        if (q) setTimeout(function () { q.focus({ preventScroll: true }); }, 350);
      } else {
        try { sessionStorage.setItem('pf-focus-search', '1'); } catch (_) {}
        window.location.href = guidesUrl;
      }
    });
  }

  // ── Portada (home): 75svh, degradado, filtros en su sitio ───────────
  function initAppHome() {
    addStyle('pf-app-home-styles', [
      'body.pf-app .hero { min-height: 75svh; align-items: flex-start; }',
      'body.pf-app .hero-bg { background-position: center 22%; }',
      'body.pf-app .hero-overlay { background: linear-gradient(180deg, rgba(39,72,40,0.55) 0%, rgba(39,72,40,0.22) 42%, rgba(13,26,69,0.55) 74%, rgba(13,26,69,0.85) 100%); }',
      'body.pf-app .hero-content { padding: 5.5rem 1.5rem 2.25rem; }',
      'body.pf-app .hero-title { font-size: clamp(2.1rem, 8vw, 3.2rem); text-shadow: 0 2px 10px rgba(0,0,0,.45); }',
      'body.pf-app .hero-sub { text-shadow: 0 1px 6px rgba(0,0,0,.55); }',
      'body.pf-app .hero-buttons .btn { min-height: 48px; }',
      'body.pf-app .hero-buttons .btn-outline { border-width: 2px; border-color: rgba(255,255,255,.85); background: rgba(255,255,255,.16); }',
      'body.pf-app .hero-figures { margin-top: 1.25rem; }',
      '.pf-trust { margin: 1.1rem 0 0; font-size: .85rem; color: rgba(255,255,255,.92); text-shadow: 0 1px 4px rgba(0,0,0,.5); }',
      '.pf-trust .dot { color: #C9A84C; }',
      'body.pf-app .save-band { display: none !important; }',
      'body.pf-app .lib-controls { position: sticky; top: 60px; z-index: 9000; flex-direction: column; align-items: stretch; gap: .75rem; background: #fff; margin: 0 -1.5rem; padding: .85rem 1.5rem; }',
      'body.pf-app .lib-chips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; -webkit-mask-image: linear-gradient(90deg, transparent, #000 20px, #000 calc(100% - 20px), transparent); mask-image: linear-gradient(90deg, transparent, #000 20px, #000 calc(100% - 20px), transparent); }',
      'body.pf-app .lib-chips::-webkit-scrollbar { display: none; }',
      'body.pf-app .lib-chips .chip { flex: 0 0 auto; }',
      'body.pf-app .lib-chips .chip .count { font-weight: 400; opacity: .7; }',
      'body.pf-app .lib-search { width: 100%; }',
      'body.pf-app #libSearch { width: 100%; }'
    ]);

    // Línea de confianza bajo los botones.
    var btns = document.querySelector('.hero-buttons');
    if (btns && !document.querySelector('.pf-trust')) {
      var trust = document.createElement('p');
      trust.className = 'pf-trust';
      trust.innerHTML = '<span class="dot">●</span> ' + (isSpanish ? '35 guías gratuitas · sin publicidad' : '35 free guides · no ads');
      btns.parentNode.insertBefore(trust, btns.nextSibling);
    }

    // «Empieza aquí»: los tres pilares.
    var kicker = document.querySelector('#resources .section-kicker');
    if (kicker) kicker.textContent = isSpanish ? 'Empieza aquí' : 'Start here';

    // Conteos reales en los filtros, en su sitio (la biblioteca).
    // Los botones conservan sus propios listeners, así que añadir el
    // contador no rompe el filtro.
    var chipsBox = document.querySelector('.lib-chips');
    if (chipsBox) {
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

    // Venir desde otra página a buscar: enfocar el buscador.
    try {
      if (sessionStorage.getItem('pf-focus-search') === '1') {
        sessionStorage.removeItem('pf-focus-search');
        var q = document.getElementById('libSearch');
        if (q) setTimeout(function () { q.focus({ preventScroll: true }); }, 400);
      }
    } catch (_) {}
  }

  // ── Artículos: barra mínima, progreso, donación ──────────────────────
  function backUrl() {
    var s = document.querySelector('script[data-category-url]');
    if (s && s.dataset && s.dataset.categoryUrl) return s.dataset.categoryUrl;
    var p = window.location.pathname.replace(/\/$/, '');
    var i = p.lastIndexOf('/');
    if (i > 0) return p.slice(0, i) + '/';
    return homeUrl;
  }

  function isCurrentSaved() {
    var url = pageUrl();
    return readSaved().some(function (item) { return item.u === url; });
  }

  var svgBookmarkOutline = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4h10v16l-5-3.6L7 20V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  var svgBookmarkFilled = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4h10v16l-5-3.6L7 20V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  var svgShare = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var svgBack = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function paintReadSave() {
    var btn = document.getElementById('pf-read-save');
    if (!btn) return;
    btn.innerHTML = isCurrentSaved() ? svgBookmarkFilled : svgBookmarkOutline;
  }

  function toggleSavedFallback() {
    var url = pageUrl();
    var list = readSaved();
    var at = -1;
    for (var i = 0; i < list.length; i++) { if (list[i].u === url) { at = i; break; } }
    if (at >= 0) list.splice(at, 1);
    else list.unshift({ u: url, t: cleanTitle(), l: isSpanish ? 'es' : 'en', d: Date.now() });
    try { localStorage.setItem('pf-guardados-v1', JSON.stringify(list)); } catch (_) {}
    paintReadSave();
  }

  function initAppArticle() {
    addStyle('pf-app-article-styles', [
      '.pf-readbar { position: fixed; top: 0; left: 0; right: 0; z-index: 9600; height: 60px; display: flex; align-items: center; gap: 2px; padding: 0 8px; background: #FBF6EC; border-bottom: 1px solid rgba(42,36,30,.10); box-shadow: 0 2px 12px rgba(0,0,0,.08); }',
      '.pf-readbar-btn { min-width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border: 0; background: transparent; color: #274828; border-radius: 50%; cursor: pointer; padding: 0; text-decoration: none; }',
      '.pf-readbar-btn:active { background: rgba(39,72,40,.10); }',
      '.pf-readbar-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; font-size: .9rem; font-weight: 700; color: #274828; padding: 0 4px; }',
      '.pf-read-progress { position: absolute; left: 0; bottom: -1px; height: 3px; width: 0%; background: #C9A84C; }'
    ]);

    // Barra mínima: retorno, título, guardar, compartir + progreso.
    var bar = document.createElement('div');
    bar.className = 'pf-readbar';
    bar.innerHTML =
      '<a class="pf-readbar-btn" id="pf-read-back" href="' + backUrl() + '" aria-label="' + (isSpanish ? 'Volver a la categoría' : 'Back to category') + '">' + svgBack + '</a>' +
      '<span class="pf-readbar-title">' + escapeHtml(cleanTitle()) + '</span>' +
      '<button type="button" class="pf-readbar-btn" id="pf-read-save" aria-label="' + (isSpanish ? 'Guardar' : 'Save') + '">' + svgBookmarkOutline + '</button>' +
      '<button type="button" class="pf-readbar-btn" id="pf-read-share" aria-label="' + (isSpanish ? 'Compartir' : 'Share') + '">' + svgShare + '</button>' +
      '<span class="pf-read-progress" id="pf-read-progress"></span>';
    document.body.insertBefore(bar, document.body.firstChild);

    // El enlace real de «Volver a la categoría» lo inyecta article-nav
    // un poco después: cuando aparezca, usar su href exacto.
    setTimeout(function () {
      var link = document.querySelector('#pf-article-nav-top .pf-article-nav-link');
      var back = document.getElementById('pf-read-back');
      if (link && back && link.getAttribute('href')) back.setAttribute('href', link.getAttribute('href'));
    }, 1200);

    paintReadSave();
    document.getElementById('pf-read-save').addEventListener('click', function () {
      var real = document.getElementById('pf-article-nav-save-btn');
      if (real) { real.click(); setTimeout(paintReadSave, 120); }
      else toggleSavedFallback();
    });
    document.getElementById('pf-read-share').addEventListener('click', function () {
      var real = document.getElementById('pf-article-nav-share-btn');
      if (real) { real.click(); return; }
      if (navigator.share) { navigator.share({ title: document.title, url: window.location.href }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).catch(function () {});
    });

    // «Continuar leyendo»: recordar la última guía abierta.
    try {
      localStorage.setItem('pf-ultima-guia', JSON.stringify({ u: pageUrl(), t: cleanTitle() }));
    } catch (_) {}
  }

  // ── Guardados: marcar como vistos + estado vacío ─────────────────────
  function markSavedSeen() {
    if (!isSavedPage) return;
    try { localStorage.setItem('pf-guardados-vistos', String(readSaved().length)); } catch (_) {}
  }

  function initAppSavedExtras() {
    addStyle('pf-app-saved-styles', [
      '.pf-saved-extras { margin-top: 1.25rem; display: grid; gap: .75rem; }',
      '.pf-saved-extras a { display: block; padding: .8rem 1rem; border: 1.5px solid rgba(39,72,40,.25); border-radius: 12px; text-decoration: none; font-weight: 700; color: #274828; background: #fff; }'
    ]);
    var empty = document.getElementById('pf-saved-empty');
    if (!empty) return;
    var done = false;
    function inject() {
      if (done) return;
      if (empty.style.display === 'none') return;
      done = true;
      var wrap = document.createElement('div');
      wrap.className = 'pf-saved-extras';
      var html = '';
      var last = null;
      try { last = JSON.parse(localStorage.getItem('pf-ultima-guia') || 'null'); } catch (_) {}
      if (last && last.u && last.t) {
        html += '<a href="' + last.u + '">' + (isSpanish ? 'Continuar leyendo: ' : 'Continue reading: ') + escapeHtml(last.t) + '</a>';
      }
      html += '<a href="' + gameUrl + '">' + (isSpanish ? 'Jugar a Pantry Words' : 'Play Pantry Words') + '</a>';
      html += '<a href="' + communityUrl + '" target="_blank" rel="noopener">' + (isSpanish ? 'Comunidad en Facebook' : 'Facebook community') + '</a>';
      wrap.innerHTML = html;
      empty.appendChild(wrap);
    }
    if ('MutationObserver' in window) {
      new MutationObserver(function () { inject(); })
        .observe(empty, { attributes: true, attributeFilter: ['style'] });
    }
    setTimeout(inject, 800);
  }

  if (isStandalone) {
    document.body.classList.add('pf-app');
    if (isHome) document.body.classList.add('pf-app-home');
    markSavedSeen();
    initAppMenu();
    initDonateSheet();
    initSettingsSheet();
    initExploreSheet();
    initPillarSwitcher();
    if (isArticle) initAppArticle();
    else initAppHeader();
    if (isHome) initAppHome();
    if (isSavedPage) initAppSavedExtras();
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
