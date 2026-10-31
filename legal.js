/* Legal pages: language button and translations. Shares the saved language with the homepage. */
(function () {
  "use strict";
  let lang = localStorage.getItem("sa-lang") || "en";
  if (!window.SA_LEGAL[lang]) lang = "en";

  function apply() {
    const dict = window.SA_LEGAL[lang], en = window.SA_LEGAL.en;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      const v = dict[key] || en[key];
      if (v) el.textContent = v;
    });
    document.querySelectorAll("[data-lang-opt]").forEach(b =>
      b.setAttribute("aria-current", String(b.dataset.langOpt === lang)));
  }

  document.querySelectorAll("[data-lang-opt]").forEach(b =>
    b.addEventListener("click", () => {
      lang = b.dataset.langOpt;
      localStorage.setItem("sa-lang", lang);
      apply();
    }));

  apply();
})();
