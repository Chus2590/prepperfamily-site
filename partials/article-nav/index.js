(function () {
  const script = document.currentScript;
  if (!script) return;

  // Idioma por ruta
  const isSpanish = window.location.pathname.startsWith("/es/");

  // Único dato que pasas por artículo
  const categoryUrl = script.dataset.categoryUrl || "/";

  // Textos
  const categoryLabel = isSpanish ? "Volver a la categoría" : "Back to Category";
  const exploreLabel  = isSpanish ? "Explorar más guías"   : "Explore more guides";
  const saveText = isSpanish
    ? "Guarda esta guía. Puede ser necesaria cuando los sistemas fallen."
    : "Save this guide. You may need it when systems fail.";
  const shareLabel = isSpanish ? "Compartir / Guardar" : "Share / Save";
  const copiedText = isSpanish
    ? "Enlace copiado. Guárdalo donde quieras."
    : "Link copied. Save it anywhere.";

  // ── SVGs ──────────────────────────────────────────────────────────────────
  const svgArrowLeft = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const svgArrowRight = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const svgShare = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" focusable="false"><circle cx="11.5" cy="2.5" r="1.8" stroke="currentColor" stroke-width="1.5"/><circle cx="11.5" cy="12.5" r="1.8" stroke="currentColor" stroke-width="1.5"/><circle cx="3.5" cy="7.5" r="1.8" stroke="currentColor" stroke-width="1.5"/><path d="M5.2 6.5L9.8 3.5M5.2 8.5L9.8 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const svgCheck = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const svgDivider = `<svg width="120" height="12" viewBox="0 0 120 12" fill="none" aria-hidden="true" focusable="false" class="pf-nav-ornament"><path d="M0 6 Q30 1 60 6 Q90 11 120 6" stroke="currentColor" stroke-width="1" fill="none" opacity="0.45"/><circle cx="60" cy="6" r="2" fill="currentColor" opacity="0.5"/></svg>`;

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

  // ── Inject TOP ────────────────────────────────────────────────────────────
  function injectTop() {
    const target = document.getElementById("pf-article-nav-top");
    if (!target) return;
    target.innerHTML = `
      <div class="pf-article-nav-wrap pf-article-nav-top">
        <a class="pf-article-nav-link" href="${categoryUrl}">
          ${svgArrowLeft}
          <span>${categoryLabel}</span>
        </a>
      </div>
    `;
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
  }

  injectTop();
  injectBottom();
})();
