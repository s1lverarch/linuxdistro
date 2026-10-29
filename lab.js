/* Lab: package search (from the real pacman db), commit changelog (GitHub API), installer theme picker. */
(function () {
  "use strict";
  const D = window.SA_DATA, I = window.SA_I18N;
  const $ = (s, r = document) => r.querySelector(s);
  const lang = (localStorage.getItem("sa-lang") || "en");
  const t = k => (I[lang] && I[lang][k]) || I.en[k] || "";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DB_URL = "https://raw.githubusercontent.com/s1lverarch/silvernebula/main/x86_64/silvernebula.db";

  /* ── 1. package search: read the pacman db (tar.gz) in the browser ── */
  function tarEntries(buf) {
    const out = [], u8 = new Uint8Array(buf), dec = new TextDecoder();
    let off = 0;
    while (off + 512 <= u8.length) {
      const name = dec.decode(u8.subarray(off, off + 100)).replace(/\0.*$/, "");
      if (!name) break;
      const size = parseInt(dec.decode(u8.subarray(off + 124, off + 136)).replace(/\0.*$/, "").trim() || "0", 8);
      out.push({ name, text: () => dec.decode(u8.subarray(off + 512, off + 512 + size)) });
      off += 512 + Math.ceil(size / 512) * 512;
    }
    return out;
  }
  function parseDesc(txt) {
    const f = {}; const lines = txt.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^%([A-Z0-9]+)%$/);
      if (m) { const vals = []; i++; while (i < lines.length && lines[i] !== "") vals.push(lines[i++]); f[m[1]] = vals.join("\n"); }
    }
    return f;
  }
  const fmtSize = b => { b = Number(b) || 0; return b > 1048576 ? (b / 1048576).toFixed(1) + " MiB" : (b / 1024).toFixed(0) + " KiB"; };
  let packages = null;

  async function loadDb() {
    const res = await fetch(DB_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("db " + res.status);
    const gz = res.body.pipeThrough(new DecompressionStream("gzip"));
    const buf = await new Response(gz).arrayBuffer();
    return tarEntries(buf).filter(e => e.name.endsWith("/desc")).map(e => {
      const f = parseDesc(e.text());
      return { name: f.NAME, version: f.VERSION, size: f.CSIZE, desc: f.DESC || "", url: f.URL || "" };
    }).filter(p => p.name);
  }
  function renderPkgs(q) {
    const box = $("#pkg-results");
    const list = (packages || []).filter(p => !q || (p.name + " " + p.desc).toLowerCase().includes(q));
    $("#pkg-count").textContent = packages ? `${list.length} / ${packages.length}` : "";
    box.innerHTML = list.length ? list.map(p => `
      <div class="pkg-row"><div><b>${esc(p.name)}</b> <span class="pkg-ver">${esc(p.version)}</span><div class="pkg-desc">${esc(p.desc)}</div></div>
      <div class="pkg-meta">${fmtSize(p.size)}</div>
      <code class="pkg-cmd">sudo pacman -S ${esc(p.name)}</code></div>`).join("")
      : `<div class="lab-empty">${t("pkg_empty")}</div>`;
  }
  function initPkg() {
    $("#pkg-status").textContent = t("pkg_loading");
    loadDb().then(list => {
      packages = list.sort((a, b) => a.name.localeCompare(b.name));
      $("#pkg-status").textContent = "";
      renderPkgs($("#pkg-q").value.trim().toLowerCase());
    }).catch(() => { $("#pkg-status").textContent = t("pkg_fail"); });
    $("#pkg-q").addEventListener("input", e => renderPkgs(e.target.value.trim().toLowerCase()));
  }

  /* ── 2. changelog: commits from GitHub, grouped by type ── */
  const KIND = msg => {
    const m = msg.match(/^(\w+)(\(.*?\))?!?:/i);
    if (!m) return "other";
    const k = m[1].toLowerCase();
    return k === "feat" ? "feat" : k === "fix" ? "fix" : "other";
  };
  const cache = {};
  async function loadCommits(repo) {
    if (cache[repo]) return cache[repo];
    const r = await fetch(`https://api.github.com/repos/s1lverarch/${repo}/commits?per_page=15`);
    if (!r.ok) throw new Error(r.status);
    const data = await r.json();
    return (cache[repo] = data.map(c => ({
      sha: c.sha.slice(0, 7), url: c.html_url, date: c.commit.author.date.slice(0, 10),
      msg: c.commit.message.split("\n")[0], kind: KIND(c.commit.message)
    })));
  }
  function initChangelog() {
    const sel = $("#cl-repo");
    sel.innerHTML = D.repos.map(r => `<option value="${r.name}">${r.name}</option>`).join("");
    const show = async () => {
      const list = $("#cl-list");
      list.innerHTML = `<li class="lab-empty">${t("cl_loading")}</li>`;
      try {
        const items = await loadCommits(sel.value);
        list.innerHTML = items.map(c => `
          <li class="cl-item"><span class="cl-date">${c.date}</span>
          <span class="cl-kind k-${c.kind}">${t("cl_" + c.kind)}</span>
          <a href="${c.url}" target="_blank" rel="noopener">${esc(c.msg)}</a><code>${c.sha}</code></li>`).join("") || `<li class="lab-empty">${t("cl_fail")}</li>`;
      } catch (e) { list.innerHTML = `<li class="lab-empty">${t("cl_fail")}</li>`; }
    };
    sel.addEventListener("change", show);
    show();
  }

  /* ── 3. theme picker: the installer's themes (themes.go), live preview only ── */
  const THEMES = {
    silvercore: { p:"#C0C0C0", s:"#00BFFF", a:"#00FFD0", ok:"#00FF7F", w:"#FFD700", dim:"#333333", dim2:"#666666", bg:"#0a0a0a", tx:"#EEEEEE", bd:"#444444", sel:"#051525" },
    crimson:    { p:"#FF4466", s:"#FF0033", a:"#FF6688", ok:"#FF4466", w:"#FF8800", dim:"#2a0a0a", dim2:"#663333", bg:"#0d0000", tx:"#FFE0E0", bd:"#441111", sel:"#1a0505" },
    aurora:     { p:"#88FFCC", s:"#AA88FF", a:"#FF88CC", ok:"#88FFAA", w:"#FFCC44", dim:"#1a1a2e", dim2:"#4a4a6e", bg:"#0d0d1a", tx:"#E0E0FF", bd:"#2a2a4a", sel:"#0a0a20" },
    monochrome: { p:"#FFFFFF", s:"#AAAAAA", a:"#CCCCCC", ok:"#FFFFFF", w:"#AAAAAA", dim:"#222222", dim2:"#555555", bg:"#000000", tx:"#DDDDDD", bd:"#444444", sel:"#1a1a1a" },
    nebula:     { p:"#7B68EE", s:"#9B59B6", a:"#00CED1", ok:"#7B68EE", w:"#FF6B6B", dim:"#1a0a2e", dim2:"#4a3a6e", bg:"#0d0a1a", tx:"#E8E0FF", bd:"#2a1a4a", sel:"#100a20" },
    forest:     { p:"#00FF88", s:"#00CC66", a:"#88FFCC", ok:"#00FF88", w:"#FFCC00", dim:"#0a1a0a", dim2:"#336633", bg:"#050d05", tx:"#E0FFE8", bd:"#1a3a1a", sel:"#051005" },
    ocean:      { p:"#00BFFF", s:"#0088CC", a:"#00FFFF", ok:"#00BFFF", w:"#FFD700", dim:"#0a1020", dim2:"#334466", bg:"#050a15", tx:"#E0F0FF", bd:"#1a2a44", sel:"#051020" },
    void:       { p:"#7733FF", s:"#5500CC", a:"#AA55FF", ok:"#7733FF", w:"#FF3366", dim:"#0d0020", dim2:"#330055", bg:"#050005", tx:"#EEE0FF", bd:"#220044", sel:"#0a0015" }
  };
  function paintTheme(name) {
    const v = THEMES[name], pv = $("#th-preview");
    pv.style.setProperty("--tp", v.p); pv.style.setProperty("--ts", v.s); pv.style.setProperty("--ta", v.a);
    pv.style.setProperty("--tok", v.ok); pv.style.setProperty("--tw", v.w); pv.style.setProperty("--tdim", v.dim2);
    pv.style.setProperty("--tbg", v.bg); pv.style.setProperty("--ttx", v.tx); pv.style.setProperty("--tbd", v.bd); pv.style.setProperty("--tsel", v.sel);
    $$(".th-chip").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.theme === name)));
    $("#th-code").textContent = Object.entries(v).map(([k, x]) => `${k.padEnd(4)} ${x}`).join("\n");
  }
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  function initThemes() {
    const row = $("#th-chips");
    row.innerHTML = Object.keys(THEMES).map(n => `<button class="th-chip" data-theme="${n}" aria-pressed="false"><span class="sw" style="background:${THEMES[n].p}"></span>${n}</button>`).join("");
    row.addEventListener("click", e => { const b = e.target.closest(".th-chip"); if (b) paintTheme(b.dataset.theme); });
    paintTheme("silvercore");
  }

  function init() {
    if ($("#pkg-q")) initPkg();
    if ($("#cl-repo")) initChangelog();
    if ($("#th-chips")) initThemes();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
