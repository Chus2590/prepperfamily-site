(function () {
  const script = document.currentScript;
  if (!script) return;

  // Idioma por ruta
  const isSpanish = window.location.pathname.startsWith("/es/");

  // Único dato que pasas por artículo
  const categoryUrl = script.dataset.categoryUrl || "/";

  // Textos fijos
  const categoryLabel = isSpanish ? "Volver a la categoría" : "Back to Category";
  const exploreLabel = isSpanish ? "Explorar más guías" : "Explore more guides";
  const saveText = isSpanish
    ? "Guarda esta guía. Puede ser necesaria cuando los sistemas fallen."
    : "Save this guide. You may need it when systems fail.";
  const shareLabel = isSpanish ? "Compartir / Guardar" : "Share / Save";
  const copiedText = isSpanish
    ? "Enlace copiado. Guárdalo donde quieras."
    : "Link copied. Save it anywhere.";

  // Estilos (una sola vez)
  const styleId = "pf-article-nav-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .pf-article-nav-wrap{width:100%;box-sizing:border-box;margin:0;padding:0;font-family:inherit;}
      .pf-article-nav-top{margin:18px 0 10px;}
      .pf-article-nav-bottom{margin:28px 0 0;padding:18px 0 0;}
      .pf-article-nav-link,
      .pf-article-nav-explore{
        display:inline-flex;align-items:center;gap:8px;text-decoration:none;
        font:inherit;font-weight:700;line-height:1.4;color:inherit;opacity:.92;
        transition:opacity .2s ease, transform .2s ease;
      }
      .pf-article-nav-link:hover,
      .pf-article-nav-explore:hover{opacity:1;transform:translateY(-1px);}
      .pf-article-nav-arrow{font-size:1em;line-height:1;}
      .pf-article-nav-save{margin:0 0 14px;font:inherit;line-height:1.6;opacity:.9;}
      .pf-article-nav-actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center;}
      .pf-article-nav-btn{
        appearance:none;-webkit-appearance:none;border:1px solid rgba(0,0,0,.18);
        background:#111;color:#fff;font:inherit;font-weight:700;line-height:1.2;
        border-radius:999px;padding:12px 18px;cursor:pointer;
        transition:transform .2s ease, opacity .2s ease, box-shadow .2s ease;
        box-shadow:0 8px 20px rgba(0,0,0,.10);
      }
      .pf-article-nav-btn:hover{transform:translateY(-1px);opacity:.96;}
      .pf-article-nav-btn:active{transform:translateY(0);}
      .pf-article-nav-toast{
        position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(10px);
        background:#111;color:#fff;padding:10px 14px;border-radius:999px;
        font:inherit;font-size:14px;line-height:1.3;opacity:0;pointer-events:none;
        transition:opacity .25s ease, transform .25s ease;z-index:99999;
        box-shadow:0 10px 30px rgba(0,0,0,.20);max-width:min(90vw, 420px);text-align:center;
      }
      .pf-article-nav-toast.is-visible{opacity:1;transform:translateX(-50%) translateY(0);}
      @media (max-width:640px){
        .pf-article-nav-btn{width:100%;justify-content:center;text-align:center;}
        .pf-article-nav-actions{flex-direction:column;align-items:stretch;}
      }
    `;
    document.head.appendChild(style);
  }

  function showToast(message) {
    let toast = document.getElementById("pf-article-nav-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "pf-article-nav-toast";
      toast.className = "pf-article-nav-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  async function shareOrCopy() {
    const url = window.location.href;
    const title = document.title || "PrepperFamily.org";
    const text = title;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast(copiedText);
    } catch (err) {
      const temp = document.createElement("input");
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      temp.setSelectionRange(0, 99999);
      try {
        document.execCommand("copy");
        showToast(copiedText);
      } catch (e) {}
      document.body.removeChild(temp);
    }
  }

  function injectTop() {
    const topTarget = document.getElementById("pf-article-nav-top");
    if (!topTarget) return;

    topTarget.innerHTML = `
      <div class="pf-article-nav-wrap pf-article-nav-top">
        <a class="pf-article-nav-link" href="${categoryUrl}">
          <span class="pf-article-nav-arrow">←</span>
          <span>${categoryLabel}</span>
        </a>
      </div>
    `;
  }

  function injectBottom() {
    const bottomTarget = document.getElementById("pf-article-nav-bottom");
    if (!bottomTarget) return;

    bottomTarget.innerHTML = `
      <div class="pf-article-nav-wrap pf-article-nav-bottom">
        <p class="pf-article-nav-save">${saveText}</p>
        <div class="pf-article-nav-actions">
          <button type="button" class="pf-article-nav-btn" id="pf-article-nav-share-btn">${shareLabel}</button>
          <a class="pf-article-nav-explore" href="${categoryUrl}">
            <span>${exploreLabel}</span>
            <span class="pf-article-nav-arrow">→</span>
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
