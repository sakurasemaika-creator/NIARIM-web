/* Site-level, non-blocking reading cue. No tracking, third-party requests,
   or modification of app-screen previews. */
(() => {
  "use strict";
  const start = () => {
    if (!document.body || document.querySelector(".brand-reading-progress")) return;
    const header = document.querySelector(".site-header");
    if (!header) return;
    const bar = document.createElement("div");
    bar.className = "brand-reading-progress";
    bar.setAttribute("aria-hidden", "true");
    // Anchor to sticky header, not a fixed viewport layer: full-page
    // captures and mobile menus should never show a stray floating line.
    header.appendChild(bar);
    let pending = false;
    const paint = () => {
      pending = false;
      const doc = document.documentElement;
      const span = Math.max(0, doc.scrollHeight - doc.clientHeight);
      const ratio = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
      bar.style.transform = `scaleX(${ratio})`;
      document.body.classList.toggle("brand-has-scrolled", window.scrollY > 18);
    };
    const requestPaint = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(paint);
    };
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint, { passive: true });
    window.addEventListener("load", requestPaint, { once: true });
    requestPaint();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
