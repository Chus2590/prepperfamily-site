// PrepperFamily.org — Botón de instalación de la PWA.
// Muestra los botones .pf-install-btn solo cuando la app se puede
// instalar (evento beforeinstallprompt, Android/Chrome/Edge) o en iOS,
// donde la instalación es manual (Compartir → Añadir a pantalla de
// inicio). El pie de página se carga por JS después de la página, así
// que un MutationObserver revela los botones que llegan tarde. Si la
// app ya está instalada (standalone), no muestra nada.
(function () {
  var deferredPrompt = null;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (isStandalone) return;

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
      // iOS o navegador sin evento: mostrar los pasos manuales.
      document.querySelectorAll('.pf-install-hint').forEach(function (h) {
        h.style.display = '';
      });
    }
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    show();
  });

  window.addEventListener('appinstalled', function () {
    document.querySelectorAll('.pf-install-zone').forEach(function (z) {
      z.style.display = 'none';
    });
  });

  if (isIOS) show();

  if ('MutationObserver' in window) {
    new MutationObserver(function () {
      if (deferredPrompt || isIOS) show();
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
