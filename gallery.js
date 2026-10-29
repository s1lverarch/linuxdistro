/* Gallery lightbox and the ☰ toggle for the section tabs. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* tabs: hidden behind a menu button */
  const tg = $("#tabs-toggle"), menu = $("#tabs-menu");
  if (tg && menu) {
    tg.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      tg.setAttribute("aria-expanded", String(open));
    });
    $$(".tab", menu).forEach(tab => tab.addEventListener("click", () => {
      menu.classList.remove("open");
      tg.setAttribute("aria-expanded", "false");
    }));
  }

  /* gallery lightbox */
  const items = $$(".g-item"), lb = $("#lightbox"), img = $("#lb-img");
  if (!items.length || !lb) return;
  let idx = 0;
  const show = n => {
    idx = (n + items.length) % items.length;
    img.src = `assets/gallery-${idx + 1}.jpg`;
    img.alt = `Wallpaper ${idx + 1}`;
  };
  const open = n => { show(n); lb.hidden = false; document.body.style.overflow = "hidden"; lb.focus(); };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; };

  items.forEach((el, i) => el.addEventListener("click", () => open(i)));
  lb.addEventListener("click", e => {
    if (e.target === lb) return close();
    const btn = e.target.closest("[data-lb]");
    if (!btn) return;
    if (btn.dataset.lb === "close") close();
    if (btn.dataset.lb === "prev") show(idx - 1);
    if (btn.dataset.lb === "next") show(idx + 1);
  });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  /* swipe on touch screens */
  let sx = null;
  lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
})();
