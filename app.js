/* SilverArch Linux site behaviour: translations, apps, tabs, compact header, search, news, icons. */
(function () {
  "use strict";
  const D = window.SA_DATA, I = window.SA_I18N, IC = window.SA_ICONS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  let lang = store.get("sa-lang", "en");
  let theme = store.get("sa-theme", matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  const escape = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const escapeAttr = s => escape(s).replace(/\n/g, "&#10;");
  const t = key => (I[lang] && I[lang][key]) || I.en[key] || "";
  /* pick a translated field: obj = { en, ar, fr, ru } or a plain string */
  const L = obj => (obj && typeof obj === "object") ? (obj[lang] || obj.en || "") : (obj || "");

  function svgFor(name, cls = "ic") {
    const p = IC[name];
    return p ? `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>` : "";
  }
  function paintIcons(root = document) {
    $$("[data-icon]", root).forEach(el => { el.innerHTML = svgFor(el.dataset.icon, el.dataset.size === "sm" ? "ic ic-sm" : "ic"); });
  }
  function spinIcon(svg) {
    svg.classList.remove("spin"); void svg.getBoundingClientRect(); svg.classList.add("spin");
    svg.addEventListener("animationend", () => svg.classList.remove("spin"), { once: true });
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$("[data-lang-opt]").forEach(el => el.setAttribute("aria-current", String(el.dataset.langOpt === lang)));
    $("#search-input").placeholder = t("search_placeholder");
    $("#burger").setAttribute("aria-label", t("menu"));
    renderRepos(); renderProjects(); renderSteps(); renderApps(); renderDocs(); renderDistros(); renderIso(); loadNews();
    const cur = $(".app-icon.on"); if (cur) showApp(cur.dataset.app, false);
    store.set("sa-lang", lang);
  }
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    const btn = $("#theme-btn");
    btn.innerHTML = svgFor(theme === "dark" ? "sun" : "moon");
    btn.setAttribute("aria-label", theme === "dark" ? t("theme_light") : t("theme_dark"));
    store.set("sa-theme", theme);
  }

  /* ── content renderers ── */
  function renderRepos() {
    $("#repo-grid").innerHTML = D.repos.map(r => `
      <article class="glass repo rv in">
        <div class="repo-top"><h3>${r.name}</h3><span class="tag">${r.lang}</span></div>
        <p>${escape(L(r.desc))}</p>
        <div class="repo-meta"><span>${r.commits != null ? r.commits + " commits" : r.tag}</span><span>${r.updated}</span></div>
        <a class="repo-link" href="${r.url}" target="_blank" rel="noopener">GitHub ${svgFor("external", "ic ic-sm")}</a>
      </article>`).join("");
  }
  function renderProjects() {
    $("#tab-projects").innerHTML = D.repos.map(r => `
      <div class="proj"><b>${r.name}</b><span>${escape(L(r.desc))}</span>
        <a href="${r.url}" target="_blank" rel="noopener">${svgFor("external", "ic ic-sm")} ${r.url.replace("https://", "")}</a></div>`).join("");
  }
  function renderSteps() {
    $("#steps").innerHTML = D.steps.map(s => `<li>${escape(L(s))}</li>`).join("");
  }
  function renderApps() {
    const cur = $(".app-icon.on");
    $("#app-icons").innerHTML = D.apps.map(a => `
      <button class="app-icon glass${cur && cur.dataset.app === a.id ? " on" : ""}" role="listitem" data-app="${a.id}" aria-label="${a.name}">
        <span class="app-ico">${svgFor(a.icon, "ic")}</span>
        <b>${a.name}</b><small>${escape(L(a.desc))}</small>
      </button>`).join("");
  }
  function showApp(id, scroll = true) {
    const a = D.apps.find(x => x.id === id);
    if (!a) return;
    $$(".app-icon").forEach(b => b.classList.toggle("on", b.dataset.app === id));
    const repo = D.repos.find(r => r.name === a.repo);
    const feats = (a.features[lang] || a.features.en || []);
    $("#app-detail").innerHTML = `
      <div class="app-head"><span class="app-ico big">${svgFor(a.icon, "ic")}</span>
        <div><h3>${a.name}</h3><span class="tag">${escape(L(a.desc))}</span></div></div>
      <h4 class="sub">${t("app_about")}</h4>
      <p class="lead">${escape(L(a.about))}</p>
      <h4 class="sub">${t("app_install")}</h4>
      <div class="cmd"><div class="cmd-row"><pre>${escape(a.install)}</pre>
        <button class="copy" data-copy="${escapeAttr(a.install)}">${svgFor("copy", "ic ic-sm")}<span>${t("copy")}</span></button></div></div>
      <h4 class="sub">${t("app_features")}</h4>
      <ul class="facts">${feats.map(f => `<li>${escape(f)}</li>`).join("")}</ul>
      <div class="app-links">
        ${a.docId ? `<a class="btn btn-primary btn-sm" href="#doc-${a.docId}" data-open-doc="${a.docId}">${svgFor("terminal", "ic ic-sm")}${t("app_docs")}</a>` : `<span class="muted">${t("app_none")}</span>`}
        ${repo ? `<a class="btn btn-sm" href="${repo.url}" target="_blank" rel="noopener">${svgFor("github", "ic ic-sm")}${t("app_github")}</a>` : ""}
      </div>`;
    paintIcons($("#app-detail"));
    if (scroll && !reduced) $("#app-detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function renderDocs() {
    $("#docs-box").innerHTML = D.docs.map(d => `
      <details class="glass doc" id="doc-${d.id}" ${d.id === "silverpurge" ? "open" : ""}>
        <summary><h3>${d.title} <small>${d.sub}</small></h3><span class="chev" data-icon="chevron"></span></summary>
        <div class="doc-body">
          ${d.blocks.map(b => `
            <div class="cmd">
              <div class="cmd-row"><pre>${escape(b.cmd)}</pre><button class="copy" data-copy="${escapeAttr(b.cmd)}">${svgFor("copy", "ic ic-sm")}<span>${t("copy")}</span></button></div>
              <div class="note">${escape(L(b.note))}</div>
            </div>`).join("")}
          <ul class="facts">${(d.facts[lang] || d.facts.en).map(f => `<li>${escape(f)}</li>`).join("")}</ul>
        </div>
      </details>`).join("");
    paintIcons($("#docs-box"));
  }
  function renderDistros() {
    $("#distros").innerHTML = D.distros.map((n, i) => `<div class="distro"><span>${String(i + 1).padStart(2, "0")}</span>${escape(n)}</div>`).join("");
    $("#distro-count").textContent = D.distros.length;
  }
  function renderIso() {
    $("#iso-sha").textContent = D.iso.sha256;
    $("#iso-link").href = D.iso.url;
  }

  /* ── news: live RSS first, otherwise the translated snapshot ── */
  function parseRss(xml) {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    if (doc.querySelector("parsererror")) return [];
    return Array.from(doc.querySelectorAll("item")).slice(0, 5).map(it => ({
      title: (it.querySelector("title") || {}).textContent || "",
      link: (it.querySelector("link") || {}).textContent || D.links.phoronix,
      category: (it.querySelector("category") || {}).textContent || "",
      time: (it.querySelector("pubDate") || {}).textContent || "", tt: ""
    })).filter(i => i.title);
  }
  function renderNews(items, note) {
    $("#news-list").innerHTML = (note ? `<li class="muted news-note">${escape(note)}</li>` : "") + items.map(i => `
      <li><div class="news-item">
        <div class="news-meta"><span class="tag">${escape(i.category)}</span><span class="mono">${escape(i.time)}</span></div>
        <a href="${escapeAttr(i.link)}" target="_blank" rel="noopener"><b>${escape(i.title)}</b></a>
        ${i.tt ? `<span class="muted">${escape(i.tt)}</span>` : ""}
      </div></li>`).join("") +
      `<li><a class="btn btn-sm" href="${D.links.phoronix}" target="_blank" rel="noopener">${svgFor("file", "ic ic-sm")}${t("news_rss")}</a></li>`;
  }
  async function loadNews() {
    $("#news-list").innerHTML = `<li class="muted">${t("news_loading")}</li>`;
    const rss = D.links.phoronix;
    for (const url of [rss, "https://api.allorigins.win/raw?url=" + encodeURIComponent(rss)]) {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) continue;
        const items = parseRss(await r.text());
        if (items.length) return renderNews(items, "");
      } catch (e) { /* next source */ }
    }
    const N = D.news;
    renderNews(N.items.map(i => ({ title: i.title, link: i.link, category: i.category, time: L(i.time), tt: L(i.tt) || "" })), L(N.snapshot));
  }

  /* ── search ── */
  const SECTIONS = [
    { id: "repos", title: { en: "Repositories", ar: "المستودعات", fr: "Dépôts", ru: "Репозитории" } },
    { id: "explore", title: { en: "Apps and projects", ar: "التطبيقات والمشاريع", fr: "Applications et projets", ru: "Приложения и проекты" } },
    { id: "docs", title: { en: "Command reference", ar: "مرجع الأوامر", fr: "Référence des commandes", ru: "Справочник команд" } },
    { id: "installer", title: { en: "Installer", ar: "المثبّت", fr: "Installateur", ru: "Установщик" } },
    { id: "iso", title: { en: "ISO", ar: "ISO", fr: "ISO", ru: "ISO" } },
    { id: "setup", title: { en: "Repo setup", ar: "إعداد المستودع", fr: "Config dépôt", ru: "Настройка репо" } },
    { id: "slite", title: { en: "Slite", ar: "Slite", fr: "Slite", ru: "Slite" } },
    { id: "community", title: { en: "Community", ar: "المجتمع", fr: "Communauté", ru: "Сообщество" } }
  ];
  function buildIndex() {
    return [
      ...D.repos.map(r => ({ group: "repos", title: r.name, text: `${r.lang} ${L(r.desc)} ${r.tag}`, href: r.url })),
      ...D.apps.map(a => ({ group: "apps", title: a.name, text: L(a.desc), go: "#explore", app: a.id })),
      ...D.docs.flatMap(d => d.blocks.map(b => ({ group: "docs", title: b.cmd.split("\n")[0], text: L(b.note), go: `#doc-${d.id}` }))),
      ...SECTIONS.map(s => ({ group: "sections", title: L(s.title), text: "", go: "#" + s.id }))
    ];
  }
  let INDEX = buildIndex(), results = [], activeIdx = -1;
  const mark = (s, q) => {
    const i = s.toLowerCase().indexOf(q);
    return i < 0 ? escape(s) : escape(s.slice(0, i)) + "<mark>" + escape(s.slice(i, i + q.length)) + "</mark>" + escape(s.slice(i + q.length));
  };
  function runSearch() {
    const q = $("#search-input").value.trim().toLowerCase(), box = $("#search-results");
    if (!q) return box.classList.remove("open");
    results = INDEX.filter(x => (x.title + " " + x.text).toLowerCase().includes(q));
    let html = "";
    ["apps", "repos", "docs", "sections"].forEach(g => {
      const items = results.filter(r => r.group === g);
      if (!items.length) return;
      html += `<div class="sr-group">${t("search_group_" + g) || g}</div>`;
      items.forEach(it => {
        const i = results.indexOf(it);
        html += `<a class="sr-item" data-i="${i}" href="${it.href || it.go}" ${it.href ? 'target="_blank" rel="noopener"' : ""}><b>${mark(it.title, q)}</b><span>${escape(it.text).slice(0, 110)}</span></a>`;
      });
    });
    box.innerHTML = html || `<div class="sr-empty">${t("search_empty")}</div>`;
    activeIdx = results.length ? 0 : -1;
    markActive();
    box.classList.add("open");
  }
  function markActive() { $$(".sr-item").forEach(el => el.classList.toggle("active", Number(el.dataset.i) === activeIdx)); }
  function closeSearch() { $("#search-results").classList.remove("open"); }

  /* ── header: collapse to the menu before anything overlaps ── */
  function fitHeader() {
    const nav = $("#nav"), links = $("#nav-links"), inner = $("#nav-inner");
    nav.classList.remove("compact");
    const textOverflow = links.scrollWidth > links.clientWidth + 1 || inner.scrollWidth > inner.clientWidth + 1;
    const lr = links.getBoundingClientRect(), rr = $(".nav-right").getBoundingClientRect();
    const touching = lr.width > 0 && lr.right > rr.left - 12;
    if (textOverflow || touching) nav.classList.add("compact");
    if (!nav.classList.contains("compact")) closeSheet();
  }
  function closeSheet() {
    $("#nav-sheet").classList.remove("open");
    $("#burger").setAttribute("aria-expanded", "false");
  }

  /* ── boot terminal ── */
  const BOOT = [
    "SilverArch boot — loading kernel and initramfs",
    '<span class="ok">✓</span> rootfs mounted',
    '<span class="ok">✓</span> silverpurge ready (dry-run by default)',
    '<span class="ok">✓</span> silvergrab ready (pacman wrapper)',
    '<span class="ok">✓</span> silvernebula repository reachable',
    '<span class="p">$</span> sudo silverss  <span class="dim"># installer</span>'
  ];
  function runBoot() {
    const box = $("#boot-body");
    box.innerHTML = BOOT.map(l => `<div class="term-line">${l}</div>`).join("") + '<div><span class="caret"></span></div>';
    const lines = $$(".term-line", box);
    if (reduced) return lines.forEach(l => l.classList.add("show"));
    lines.forEach((l, i) => setTimeout(() => l.classList.add("show"), 350 + i * 420));
  }

  function bindTabs() {
    $$(".tab").forEach(tab => tab.addEventListener("click", () => {
      $$(".tab").forEach(x => x.setAttribute("aria-selected", String(x === tab)));
      $$(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + tab.dataset.tab));
    }));
  }

  function bindPointer() {
    document.addEventListener("pointerdown", e => {
      const icon = e.target.closest("[data-icon], svg.ic");
      if (icon && !reduced) {
        const svg = icon.tagName.toLowerCase() === "svg" ? icon : icon.querySelector("svg");
        if (svg) spinIcon(svg);
      }
      const el = e.target.closest(".btn, .copy, .icon-btn, .globe-btn, .lang-opt, .repo, .cta, .tab, .doc summary, .nav-sheet a, .app-icon");
      if (!el || reduced) return;
      const r = el.getBoundingClientRect(), s = Math.max(r.width, r.height);
      const d = document.createElement("span");
      d.className = "ripple";
      d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.appendChild(d);
      setTimeout(() => d.remove(), 650);
    });
    document.addEventListener("click", e => {
      const appBtn = e.target.closest(".app-icon");
      if (appBtn) return showApp(appBtn.dataset.app);
      const open = e.target.closest("[data-open-doc]");
      if (open) {
        const det = document.getElementById("doc-" + open.dataset.openDoc);
        if (det) { det.open = true; setTimeout(() => det.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }), 30); }
        e.preventDefault();
        return;
      }
      const b = e.target.closest("[data-copy]");
      if (b && navigator.clipboard) {
        navigator.clipboard.writeText(b.dataset.copy.replace(/&#10;/g, "\n")).then(() => {
          const span = b.querySelector("span"); if (!span) return;
          const old = span.textContent; span.textContent = t("copied");
          setTimeout(() => { span.textContent = old; }, 1500);
        });
      }
      if (!e.target.closest(".search")) closeSearch();
      if (!e.target.closest("#nav")) closeSheet();
    });
  }

  function bindChrome() {
    const nav = $("#nav");
    addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 24), { passive: true });
    $("#theme-btn").addEventListener("click", () => { theme = theme === "dark" ? "light" : "dark"; applyTheme(); });
    $$("[data-lang-opt]").forEach(b => b.addEventListener("click", () => {
      lang = b.dataset.langOpt; INDEX = buildIndex(); applyLang(); applyTheme();
    }));
    $("#burger").addEventListener("click", () => {
      const open = $("#nav-sheet").classList.toggle("open");
      $("#burger").setAttribute("aria-expanded", String(open));
    });
    $$("#nav-sheet a, #nav-links a").forEach(a => a.addEventListener("click", closeSheet));
    addEventListener("resize", fitHeader);
    if ("ResizeObserver" in window) new ResizeObserver(fitHeader).observe($("#nav-inner"));
  }

  function bindSearch() {
    const input = $("#search-input");
    input.addEventListener("input", runSearch);
    input.addEventListener("focus", () => { if (input.value) runSearch(); });
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); activeIdx = Math.min(results.length - 1, activeIdx + 1); markActive(); }
      if (e.key === "ArrowUp") { e.preventDefault(); activeIdx = Math.max(0, activeIdx - 1); markActive(); }
      if (e.key === "Enter") {
        const r = results[activeIdx];
        if (r) {
          if (r.href) window.open(r.href, "_blank", "noopener");
          else if (r.app) { location.hash = "explore"; showApp(r.app); }
          else location.hash = r.go;
          closeSearch(); input.blur();
        }
      }
      if (e.key === "Escape") { closeSearch(); input.blur(); }
    });
    document.addEventListener("keydown", e => {
      const typing = /input|textarea/i.test(document.activeElement.tagName);
      if ((e.key === "/" || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) && !typing) {
        e.preventDefault(); input.focus(); input.select();
      }
    });
    $("#search-results").addEventListener("mousedown", e => e.preventDefault());
  }

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });

  function loadPackageCount() {
    fetch("https://api.github.com/repos/s1lverarch/silvernebula/contents/x86_64")
      .then(r => r.json()).then(d => {
        if (!Array.isArray(d)) return;
        const n = d.filter(f => f.name.endsWith(".pkg.tar.zst")).length;
        if (n) $("#stat-pkgs").textContent = n;
      }).catch(() => {});
  }

  function init() {
    paintIcons();
    bindPointer(); bindChrome(); bindSearch(); bindTabs();
    applyTheme(); applyLang();
    showApp("silverpurge", false);
    runBoot();
    fitHeader();
    $$(".rv").forEach(el => io.observe(el));
    const v = $("#preview-video");
    if (v && !reduced) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: .35 }).observe(v);
    loadPackageCount();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
