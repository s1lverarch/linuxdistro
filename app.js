/* SilverArch site behaviour: icons, language, theme, search, matrix canvas,
   terminal boot, copy buttons, ripples, reveal animations and live feeds.
   Content lives in data.js, translations in i18n.js, icons in icons.js. */
(function () {
  "use strict";
  const D = window.SA_DATA, I = window.SA_I18N, IC = window.SA_ICONS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── state ── */
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  let lang = store.get("sa-lang", "en");
  let theme = store.get("sa-theme", matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  /* ── icons: <i data-icon="name"> becomes an inline SVG ── */
  function paintIcons(root = document) {
    $$("[data-icon]", root).forEach(el => {
      const p = IC[el.dataset.icon];
      if (!p) return;
      el.innerHTML = `<svg class="ic ${el.dataset.size === "sm" ? "ic-sm" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
    });
  }

  /* ── translation ── */
  function t(key) { return (I[lang] && I[lang][key]) || I.en[key] || key; }
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-attr]").forEach(el => {
      const [attr, key] = el.dataset.i18nAttr.split(":");
      el.setAttribute(attr, t(key));
    });
    $$("[data-lang-opt]").forEach(el => el.setAttribute("aria-current", String(el.dataset.langOpt === lang)));
    renderRepos();
    renderDocs();
    renderDistros();
    renderIsoLabels();
    loadNews();
    $("#search-input") && ($("#search-input").placeholder = t("search_placeholder"));
    store.set("sa-lang", lang);
  }

  /* ── theme ── */
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    const label = theme === "dark" ? t("theme_light") : t("theme_dark");
    $("#theme-btn").setAttribute("aria-label", label);
    $("#theme-btn").title = label;
    $("#theme-btn").innerHTML = `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${theme === "dark" ? IC.sun : IC.moon}</svg>`;
    store.set("sa-theme", theme);
  }

  /* ── render: repositories ── */
  function renderRepos() {
    const list = $("#repo-grid");
    list.innerHTML = D.repos.map(r => `
      <article class="glass repo rv in" data-search="${r.name}">
        <div class="repo-top"><h3>${r.name}</h3><span class="tag">${r.lang}</span></div>
        <p>${r.desc[lang] || r.desc.en}</p>
        <div class="repo-meta"><span>${r.commits != null ? r.commits + " commits" : r.tag}</span><span>${r.updated}</span></div>
        <a class="repo-link" href="${r.url}" target="_blank" rel="noopener">GitHub <i data-icon="external" data-size="sm"></i></a>
      </article>`).join("");
    paintIcons(list);
  }

  /* ── render: command reference (only real commands) ── */
  function renderDocs() {
    const box = $("#docs-box");
    box.innerHTML = D.docs.map(d => `
      <details class="glass doc" id="doc-${d.id}" ${d.id === "silverpurge" ? "open" : ""}>
        <summary><h3>${d.title} <small>${d.sub}</small></h3><i class="chev" data-icon="chevron"></i></summary>
        <div class="doc-body">
          ${d.blocks.map(b => `
            <div class="cmd">
              <div class="cmd-row"><pre>${escape(b.cmd)}</pre><button class="copy" data-copy="${escapeAttr(b.cmd)}"><i data-icon="copy" data-size="sm"></i><span>${t("copy")}</span></button></div>
              <div class="note">${escape(b.note)}</div>
            </div>`).join("")}
          <ul class="facts">${d.facts.map(f => `<li>${escape(f)}</li>`).join("")}</ul>
        </div>
      </details>`).join("");
    paintIcons(box);
  }

  /* ── render: Slite distro list (from data.js) ── */
  function renderDistros() {
    $("#distros").innerHTML = D.distros.map((n, i) =>
      `<div class="distro"><span>${String(i + 1).padStart(2, "0")}</span>${escape(n)}</div>`).join("");
    $("#distro-count").textContent = D.distros.length;
  }

  function renderIsoLabels() {
    $("#iso-sha").textContent = D.iso.sha256;
    $("#iso-link").href = D.iso.url;
    $("#stat-pkgs").textContent = "6";
  }

  /* ── escape helpers ── */
  function escape(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function escapeAttr(s) { return escape(s).replace(/\n/g, "&#10;"); }

  /* ── copy + ripple ── */
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const text = b.dataset.copy.replace(/&#10;/g, "\n");
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => flash(b));
  });
  function flash(btn) {
    const span = btn.querySelector("span");
    if (!span) return;
    const old = span.textContent;
    span.textContent = t("copied");
    setTimeout(() => { span.textContent = old; }, 1500);
  }
  document.addEventListener("pointerdown", e => {
    const el = e.target.closest(".btn, .copy, .icon-btn, .globe-btn, .lang-opt, .repo, .cta, .doc summary");
    if (!el || reduced) return;
    const r = el.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const d = document.createElement("span");
    d.className = "ripple";
    d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.appendChild(d);
    setTimeout(() => d.remove(), 650);
  });

  /* ── search: ranks repos, commands and sections; keyboard navigable ── */
  const SECTIONS = [
    { id: "repos", title: "Repositories", key: "nav_repos" },
    { id: "docs", title: "Command reference", key: "nav_docs" },
    { id: "installer", title: "Installer", key: "nav_installer" },
    { id: "iso", title: "ISO", key: "nav_iso" },
    { id: "setup", title: "Repo setup", key: "nav_setup" },
    { id: "slite", title: "Slite", key: "nav_slite" },
    { id: "origin", title: "Origin", key: "nav_community" },
    { id: "community", title: "Community", key: "nav_community" }
  ];
  function buildIndex() {
    const idx = [];
    D.repos.forEach(r => idx.push({ group: "repos", title: r.name, text: `${r.lang} ${r.desc.en} ${r.tag}`, go: "#repos", href: r.url }));
    D.docs.forEach(d => d.blocks.forEach(b => idx.push({ group: "docs", title: b.cmd.split("\n")[0], text: b.note, go: `#doc-${d.id}` })));
    SECTIONS.forEach(s => idx.push({ group: "sections", title: s.title, text: "", go: "#" + s.id }));
    return idx;
  }
  const INDEX = buildIndex();
  function highlight(s, q) {
    if (!q) return escape(s);
    const i = s.toLowerCase().indexOf(q);
    if (i < 0) return escape(s);
    return escape(s.slice(0, i)) + "<mark>" + escape(s.slice(i, i + q.length)) + "</mark>" + escape(s.slice(i + q.length));
  }
  let activeIdx = -1, results = [];
  function runSearch() {
    const q = $("#search-input").value.trim().toLowerCase();
    const box = $("#search-results");
    if (!q) { box.classList.remove("open"); return; }
    results = INDEX.filter(x => (x.title + " " + x.text).toLowerCase().includes(q));
    const groups = ["repos", "docs", "sections"];
    let html = "";
    groups.forEach(g => {
      const items = results.filter(r => r.group === g);
      if (!items.length) return;
      html += `<div class="sr-group">${t("search_group_" + g)}</div>`;
      items.forEach(it => {
        const i = results.indexOf(it);
        html += `<a class="sr-item" data-i="${i}" href="${it.href || it.go}" ${it.href ? 'target="_blank" rel="noopener"' : ""}>
          <b>${highlight(it.title, q)}</b><span>${escape(it.text).slice(0, 110)}</span></a>`;
      });
    });
    box.innerHTML = html || `<div class="sr-empty">${t("search_empty")}</div>`;
    activeIdx = results.length ? 0 : -1;
    markActive();
    box.classList.add("open");
  }
  function markActive() {
    $$(".sr-item").forEach(el => el.classList.toggle("active", Number(el.dataset.i) === activeIdx));
  }
  function closeSearch() { $("#search-results").classList.remove("open"); }

  /* ── matrix rain (dark theme only) ── */
  const canvas = $("#matrix"), ctx = canvas.getContext("2d");
  const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF";
  let cols = [], fontSize = 16, last = 0;
  function resizeMatrix() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.ceil(innerWidth / fontSize);
    cols = Array.from({ length: n }, () => Math.random() * -innerHeight / fontSize);
  }
  function drawMatrix(ts) {
    if (theme !== "dark" || reduced) { requestAnimationFrame(drawMatrix); return; }
    if (ts - last < 70) { requestAnimationFrame(drawMatrix); return; } // ~14 fps keeps it light
    last = ts;
    ctx.fillStyle = "rgba(4,7,15,0.16)";
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.font = fontSize + "px JetBrains Mono, monospace";
    cols.forEach((y, i) => {
      const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      ctx.fillStyle = Math.random() > .97 ? "#d9ffe9" : "#2bd86b";
      ctx.fillText(ch, i * fontSize, y * fontSize);
      cols[i] = y * fontSize > innerHeight && Math.random() > .975 ? 0 : y + 1;
    });
    requestAnimationFrame(drawMatrix);
  }

  /* ── boot terminal in the hero ── */
  const BOOT = [
    "SilverArch boot — loading kernel and initramfs",
    '<span class="ok">✓</span> rootfs mounted',
    '<span class="ok">✓</span> silverpurge ready (dry-run by default)',
    '<span class="ok">✓</span> silvergrab ready (pacman wrapper)',
    '<span class="ok">✓</span> silvernebula repository reachable',
    '<span class="p">$</span> silverss  <span class="dim"># installer</span>'
  ];
  function runBoot() {
    const box = $("#boot-body");
    box.innerHTML = BOOT.map(l => `<div class="term-line">${l}</div>`).join("") + '<div><span class="caret"></span></div>';
    const lines = $$(".term-line", box);
    if (reduced) { lines.forEach(l => l.classList.add("show")); return; }
    lines.forEach((l, i) => setTimeout(() => l.classList.add("show"), 350 + i * 420));
  }

  /* ── live feeds (fail gracefully) ── */
  function parseRss(xml) {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    if (doc.querySelector("parsererror")) return [];
    return Array.from(doc.querySelectorAll("item")).slice(0, 5).map(it => ({
      title: (it.querySelector("title") || {}).textContent || "",
      link: (it.querySelector("link") || {}).textContent || D.links.phoronix
    })).filter(i => i.title);
  }
  function renderNews(items) {
    const list = $("#news-list");
    list.innerHTML = items.map(i =>
      `<li><i data-icon="arrow" data-size="sm"></i><a href="${escapeAttr(i.link)}" target="_blank" rel="noopener">${escape(i.title)}</a></li>`).join("");
    paintIcons(list);
  }
  function renderNewsFallback() {
    const N = D.news || { items: [] };
    const list = $("#news-list");
    if (!N.items.length) {
      list.innerHTML = `<li class="muted">${t("news_fail")}</li>`;
      return;
    }
    list.innerHTML = `<li class="muted news-note">${escape(N.snapshot || "")}</li>` + N.items.map(i => `
      <li class="news-item">
        <div class="news-meta"><span class="tag">${escape(i.category)}</span><span class="mono">${escape(i.time)}</span></div>
        <a href="${escapeAttr(i.link)}" target="_blank" rel="noopener"><b>${escape(i.title)}</b></a>
        <span class="muted">${escape(i.excerpt)}</span>
      </li>`).join("") +
      `<li><a class="btn btn-sm" href="${D.links.phoronix}" target="_blank" rel="noopener"><i data-icon="file" data-size="sm"></i>RSS</a></li>`;
    paintIcons(list);
  }
  async function loadNews() {
    const rss = D.links.phoronix;
    // 1) the feed directly, 2) a CORS proxy that returns the raw XML
    const sources = [rss, "https://api.allorigins.win/raw?url=" + encodeURIComponent(rss)];
    $("#news-list").innerHTML = `<li class="muted">${t("news_loading")}</li>`;
    for (const url of sources) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const items = parseRss(await res.text());
        if (items.length) return renderNews(items);
      } catch (e) { /* try the next source */ }
    }
    renderNewsFallback();
  }
  function loadPackageCount() {
    fetch("https://api.github.com/repos/s1lverarch/silvernebula/contents/x86_64")
      .then(r => r.json())
      .then(d => {
        if (!Array.isArray(d)) return;
        const n = d.filter(f => f.name.endsWith(".pkg.tar.zst")).length;
        if (n) $("#stat-pkgs").textContent = n;
      })
      .catch(() => {});
  }

  /* ── reveal on scroll ── */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });

  /* ── nav scroll + burger ── */
  function bindChrome() {
    const nav = $("#nav");
    addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 24), { passive: true });
    $("#theme-btn").addEventListener("click", () => { theme = theme === "dark" ? "light" : "dark"; applyTheme(); });
    $$("[data-lang-opt]").forEach(b => b.addEventListener("click", () => { lang = b.dataset.langOpt; applyLang(); applyTheme(); }));
    $("#burger").addEventListener("click", () => $("#nav-links").classList.toggle("open"));
    $$("#nav-links a").forEach(a => a.addEventListener("click", () => $("#nav-links").classList.remove("open")));
  }
  function bindSearch() {
    const input = $("#search-input");
    input.addEventListener("input", runSearch);
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); activeIdx = Math.min(results.length - 1, activeIdx + 1); markActive(); }
      if (e.key === "ArrowUp") { e.preventDefault(); activeIdx = Math.max(0, activeIdx - 1); markActive(); }
      if (e.key === "Enter") {
        const r = results[activeIdx];
        if (r) { if (r.href) window.open(r.href, "_blank", "noopener"); else location.hash = r.go; closeSearch(); input.blur(); }
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
    document.addEventListener("click", e => { if (!e.target.closest(".search")) closeSearch(); });
  }

  /* ── init ── */
  function init() {
    paintIcons();
    bindChrome();
    bindSearch();
    applyTheme();
    applyLang();
    runBoot();
    resizeMatrix();
    addEventListener("resize", resizeMatrix);
    requestAnimationFrame(drawMatrix);
    $$(".rv").forEach(el => io.observe(el));
    // trailer plays only while it is on screen (saves CPU and battery)
    const v = $("#preview-video");
    if (v && !reduced) {
      new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: .35 }).observe(v);
    }
    loadPackageCount();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
