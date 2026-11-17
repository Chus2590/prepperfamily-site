// PrepperFamily.org — Botón de instalación de la PWA.
// El botón se muestra siempre (salvo que la app ya esté instalada),
// porque el evento beforeinstallprompt no siempre llega: no existe
// en iOS ni en navegadores dentro de otras apps. Al tocarlo, si el
// navegador ofrece la instalación se usa el aviso nativo; si no,
// se muestran los pasos manuales. El pie de página se carga por JS
// después de la página, así que un MutationObserver revela los
// botones que llegan tarde.
(function () {
  var deferredPrompt = null;
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
