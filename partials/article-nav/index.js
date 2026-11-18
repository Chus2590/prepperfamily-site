(function () {
  const script = document.currentScript;
  if (!script) return;

  // Idioma por ruta
  const isSpanish = window.location.pathname.startsWith("/es/");

  // Solo en la app instalada: en la web el botón «Ver productos» no se muestra.
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  // Único dato que pasas por artículo
  const categoryUrl = script.dataset.categoryUrl || "/";

  // Textos
  const categoryLabel = isSpanish ? "Volver a la categoría" : "Back to Category";
  const exploreLabel  = isSpanish ? "Explorar más guías"   : "Explore more guides";
  const saveText = isSpanish
    ? "Guarda esta guía. Puede ser necesaria cuando los sistemas fallen."
    : "Save this guide. You may need it when systems fail.";
  const shareLabel = isSpanish ? "Compartir" : "Share";
  const saveLabel = isSpanish ? "Guardar" : "Save";
  const savedLabel = isSpanish ? "Guardado" : "Saved";
  const savedToast = isSpanish
    ? "Guardado en la app. Lo verás en Guardados."
    : "Saved in the app. Find it under Saved.";
  const removedToast = isSpanish ? "Quitado de Guardados." : "Removed from Saved.";
  const copiedText = isSpanish
    ? "Enlace copiado. Guárdalo donde quieras."
    : "Link copied. Save it anywhere.";
  const installLabel = isSpanish ? "Instalar App" : "Install App";
  const productsLabel = isSpanish ? "Ver productos" : "See products";
  const installHint = isSpanish
    ? "Abre el menú del navegador y elige «Instalar app» o «Añadir a pantalla de inicio». En iPhone: Compartir → «Añadir a pantalla de inicio»."
    : "Open your browser menu and choose “Install app” or “Add to Home Screen”. On iPhone: Share → “Add to Home Screen”.";

  // ── SVGs ──────────────────────────────────────────────────────────────────
  const svgArrowLeft = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const svgArrowRight = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const svgShare = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" focusable="false"><circle cx="11.5" cy="2.5" r="1.8" stroke="currentColor" stroke-width="1.5"/><circle cx="11.5" cy="12.5" r="1.8" stroke="currentColor" stroke-width="1.5"/><circle cx="3.5" cy="7.5" r="1.8" stroke="currentColor" stroke-width="1.5"/><path d="M5.2 6.5L9.8 3.5M5.2 8.5L9.8 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const svgCheck = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const svgDivider = `<svg width="120" height="12" viewBox="0 0 120 12" fill="none" aria-hidden="true" focusable="false" class="pf-nav-ornament"><path d="M0 6 Q30 1 60 6 Q90 11 120 6" stroke="currentColor" stroke-width="1" fill="none" opacity="0.45"/><circle cx="60" cy="6" r="2" fill="currentColor" opacity="0.5"/></svg>`;
  const svgBookmark = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" focusable="false"><path d="M3.5 1.5h8v12l-4-2.8-4 2.8v-12z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const svgBookmarkFilled = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" focusable="false"><path d="M3.5 1.5h8v12l-4-2.8-4 2.8v-12z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const svgChevronDown = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false"><path d="M3 5.5L7 9.5L11 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // ── Estilos ───────────────────────────────────────────────────────────────
  const styleId = "pf-article-nav-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      /* ── Keyframes ── */
      @keyframes pf-fade-in-up {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ── Wrapper ── */
      .pf-article-nav-wrap {
        width: 100%;
        box-sizing: border-box;
        font-family: inherit;
        animation: pf-fade-in-up 0.35s ease both;
      }

      /* ── TOP block ── */
      .pf-article-nav-top {
        margin: 18px 0 12px;
      }
      .pf-article-nav-top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .pf-article-nav-top-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .pf-article-nav-products {
        display: none;
        align-items: center;
        gap: 6px;
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 999px;
        padding: 6px 12px;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: inherit;
        opacity: 0.75;
        cursor: pointer;
        white-space: nowrap;
        transition: opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease;
      }
      .pf-article-nav-products:hover {
        opacity: 1;
        border-color: rgba(160, 120, 60, 0.25);
        background: rgba(160, 120, 60, 0.07);
      }
      .pf-article-nav-install {
        appearance: none;
        -webkit-appearance: none;
        background: #274828;
        color: #FBF6EC;
        border: 1.5px solid rgba(154, 120, 64, 0.55);
        border-radius: 999px;
        padding: 8px 16px;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        line-height: 1.2;
        cursor: pointer;
        white-space: nowrap;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
      }
      .pf-article-nav-install:hover {
        transform: translateY(-2px);
        background: #2f5730;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
      }
      .pf-article-nav-hint {
        margin: 10px 0 0;
        font: inherit;
        font-size: 0.85rem;
        line-height: 1.5;
        opacity: 0.8;
      }
      .pf-article-nav-link {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        text-decoration: none;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: inherit;
        opacity: 0.75;
        padding: 6px 12px 6px 8px;
        border-radius: 999px;
        border: 1px solid transparent;
        transition: opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
      }
      .pf-article-nav-link:hover {
        opacity: 1;
        transform: translateX(-2px);
        border-color: rgba(160, 120, 60, 0.25);
        background: rgba(160, 120, 60, 0.07);
      }
      .pf-article-nav-link svg {
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }
      .pf-article-nav-link:hover svg {
        transform: translateX(-2px);
      }

      /* ── Ornament divider ── */
      .pf-nav-ornament {
        display: block;
        color: #9a7840;
        margin: 0 0 16px;
      }

      /* ── BOTTOM block ── */
      .pf-article-nav-bottom {
        margin: 32px 0 0;
        padding: 22px 0 0;
      }
      .pf-article-nav-save {
        margin: 0 0 16px;
        font: inherit;
        font-size: 0.9rem;
        line-height: 1.6;
        opacity: 0.78;
        font-style: italic;
      }

      /* ── Actions row ── */
      .pf-article-nav-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      /* ── Share button ── */
      .pf-article-nav-btn {
        appearance: none;
        -webkit-appearance: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1.5px solid rgba(154, 120, 64, 0.55);
        background: linear-gradient(135deg, #1a1208 0%, #2a1e0a 100%);
        color: #e8d5a3;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        line-height: 1.2;
        border-radius: 999px;
        padding: 11px 20px 11px 16px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 220, 130, 0.08);
      }
      .pf-article-nav-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 220, 130, 0.12);
        border-color: rgba(154, 120, 64, 0.9);
        background: linear-gradient(135deg, #221908 0%, #342510 100%);
      }
      .pf-article-nav-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      /* ── Guardar (activo) ── */
      .pf-article-nav-save-btn.is-saved {
        border-color: rgba(201, 168, 76, 0.9);
        color: #f4e3b2;
      }

      /* ── Explore link ── */
      .pf-article-nav-explore {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        text-decoration: none;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        color: inherit;
        opacity: 0.8;
        padding: 6px 8px 6px 12px;
        border-radius: 999px;
        border: 1px solid transparent;
        transition: opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
      }
      .pf-article-nav-explore:hover {
        opacity: 1;
        transform: translateX(2px);
        border-color: rgba(160, 120, 60, 0.25);
        background: rgba(160, 120, 60, 0.07);
      }
      .pf-article-nav-explore svg {
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }
      .pf-article-nav-explore:hover svg {
        transform: translateX(2px);
      }

      /* ── Toast ── */
      .pf-article-nav-toast {
        position: fixed;
        left: 50%;
        bottom: 28px;
        transform: translateX(-50%) translateY(12px);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #1a1208 0%, #2a1e0a 100%);
        color: #e8d5a3;
        border: 1px solid rgba(154, 120, 64, 0.5);
        padding: 10px 18px 10px 14px;
        border-radius: 999px;
        font: inherit;
        font-size: 0.825rem;
        line-height: 1.3;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease;
        z-index: 99999;
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.25);
        max-width: min(90vw, 380px);
        text-align: left;
        white-space: nowrap;
      }
      .pf-article-nav-toast.is-visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* ── Responsive ── */
      @media (max-width: 520px) {
        .pf-article-nav-btn {
          width: 100%;
          justify-content: center;
        }
        .pf-article-nav-actions {
          flex-direction: column;
          align-items: stretch;
        }
        .pf-article-nav-explore {
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  function showToast(message) {
    let toast = document.getElementById("pf-article-nav-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "pf-article-nav-toast";
      toast.className = "pf-article-nav-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `${svgCheck}<span>${message}</span>`;
    toast.classList.add("is-visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2400);
  }

  // ── Share / Copy ──────────────────────────────────────────────────────────
  async function shareOrCopy() {
    const url   = window.location.href;
    const title = document.title || "PrepperFamily.org";

    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast(copiedText);
    } catch (_) {
      const temp = document.createElement("input");
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      temp.setSelectionRange(0, 99999);
      try { document.execCommand("copy"); showToast(copiedText); } catch (_) {}
      document.body.removeChild(temp);
    }
  }

  // ── Guardados (en el teléfono) ────────────────────────────────────────
  const SAVED_KEY = "pf-guardados-v1";

  function readSaved() {
    try {
      const list = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (_) { return []; }
  }

  function pageUrl() {
    return window.location.href.split("#")[0].split("?")[0];
  }

  function isSaved() {
    const url = pageUrl();
    return readSaved().some((item) => item.u === url);
  }

  function cleanTitle() {
    return (document.title || "PrepperFamily.org")
      .replace(/\s*\|\s*PrepperFamily\.org\s*$/, "")
      .trim();
  }

  function paintSaveButton(saved) {
    const btn = document.getElementById("pf-article-nav-save-btn");
    if (!btn) return;
    btn.classList.toggle("is-saved", saved);
    const icon = btn.querySelector(".pf-save-icon");
    if (icon) icon.innerHTML = saved ? svgBookmarkFilled : svgBookmark;
    const label = btn.querySelector(".pf-save-label");
    if (label) label.textContent = saved ? savedLabel : saveLabel;
  }

  function toggleSaved() {
    const url = pageUrl();
    let list = readSaved();
    const at = list.findIndex((item) => item.u === url);
    let nowSaved;
    if (at >= 0) {
      list.splice(at, 1);
      nowSaved = false;
    } else {
      list.unshift({ u: url, t: cleanTitle(), l: isSpanish ? "es" : "en", d: Date.now() });
      nowSaved = true;
    }
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch (_) {}
    paintSaveButton(nowSaved);
    showToast(nowSaved ? savedToast : removedToast);
  }

  // ── Inject TOP ────────────────────────────────────────────────────────────
  function injectTop() {
    const target = document.getElementById("pf-article-nav-top");
    if (!target) return;
    target.innerHTML = `
      <div class="pf-article-nav-wrap pf-article-nav-top">
        <div class="pf-article-nav-top-row">
          <a class="pf-article-nav-link" href="${categoryUrl}">
            ${svgArrowLeft}
            <span>${categoryLabel}</span>
          </a>
          <span class="pf-article-nav-top-right">
            <button type="button" class="pf-article-nav-products" id="pf-article-nav-products-btn">
              <span>${productsLabel}</span>
              ${svgChevronDown}
            </button>
            <span class="pf-install-zone" style="display:none">
              <button type="button" class="pf-install-btn pf-article-nav-install">${installLabel}</button>
            </span>
          </span>
        </div>
        <p class="pf-install-hint pf-article-nav-hint" style="display:none">${installHint}</p>
      </div>
    `;
    const productsBtn = document.getElementById("pf-article-nav-products-btn");
    if (productsBtn) productsBtn.addEventListener("click", scrollToProducts);
    watchProducts();
  }

  // ── Ver productos (solo si el artículo los tiene) ──────────────────────
  // Los partials tienen tres estilos: con envoltura .pf-recs-products,
  // con grid .pf-recs-grid sin envoltura, y antiguos sin ninguna clase
  // pf-recs (grid .products-grid/.productos-grid/.pf-products-grid).
  // El botón debe salir en los tres: los productos se reconocen por su
  // enlace de Amazon (las fuentes nunca enlazan a Amazon).
  function productsEl() {
    const recs = document.querySelector(".pf-recs-products") || document.querySelector(".pf-recs-grid");
    if (recs) return recs;
    const link = document.querySelector('#pf-sources a[href*="amzn.to"], #pf-sources a[href*="amazon.com/dp"], #pf-sources a[href*="link.amazon"]');
    if (!link) return null;
    return link.closest('[class*="grid"]') || link;
  }

  function scrollToProducts() {
    const el = productsEl();
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function watchProducts() {
    const btn = document.getElementById("pf-article-nav-products-btn");
    if (!btn) return;
    // Solo en la app: en la web el botón no existe.
    if (!isStandalone) { btn.remove(); return; }
    const reveal = function () {
      if (productsEl()) {
        btn.style.display = "inline-flex";
        return true;
      }
      return false;
    };
    if (reveal()) return;
    const target = document.getElementById("pf-sources") || document.body;
    if ("MutationObserver" in window) {
      const obs = new MutationObserver(function () {
        if (reveal()) obs.disconnect();
      });
      obs.observe(target, { childList: true, subtree: true });
    }
  }

  // ── Inject BOTTOM ─────────────────────────────────────────────────────────
  function injectBottom() {
    const target = document.getElementById("pf-article-nav-bottom");
    if (!target) return;
    target.innerHTML = `
      <div class="pf-article-nav-wrap pf-article-nav-bottom">
        ${svgDivider}
        <p class="pf-article-nav-save">${saveText}</p>
        <div class="pf-article-nav-actions">
          <button type="button" class="pf-article-nav-btn pf-article-nav-save-btn" id="pf-article-nav-save-btn">
            <span class="pf-save-icon">${svgBookmark}</span>
            <span class="pf-save-label">${saveLabel}</span>
          </button>
          <button type="button" class="pf-article-nav-btn" id="pf-article-nav-share-btn">
            ${svgShare}
            <span>${shareLabel}</span>
          </button>
          <a class="pf-article-nav-explore" href="${categoryUrl}">
            <span>${exploreLabel}</span>
            ${svgArrowRight}
          </a>
        </div>
      </div>
    `;
    const shareBtn = document.getElementById("pf-article-nav-share-btn");
    if (shareBtn) shareBtn.addEventListener("click", shareOrCopy);
    const saveBtn = document.getElementById("pf-article-nav-save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", toggleSaved);
      paintSaveButton(isSaved());
    }
  }

  injectTop();
  injectBottom();
})();
