/* Xiaosong Wang — academic homepage interactions */

(function () {
  "use strict";

  /* ---------- Tab routing (hash-based) ---------- */
  const TABS = ["about", "news", "research", "publications", "datasets", "awards", "more"];

  function currentTab() {
    const h = location.hash.replace(/^#\/?/, "");
    return TABS.indexOf(h) >= 0 ? h : "about";
  }

  function activate(tab) {
    document.querySelectorAll(".nav-link").forEach((a) => {
      a.classList.toggle("active", a.dataset.tab === tab);
    });
    document.querySelectorAll(".tab-panel").forEach((p) => {
      p.classList.toggle("active", p.id === "tab-" + tab);
    });
    if (tab === "publications") renderPublications();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  document.querySelectorAll(".nav-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      location.hash = a.dataset.tab;
    });
  });

  window.addEventListener("hashchange", () => activate(currentTab()));

  /* ---------- Publications rendering ---------- */
  const state = { type: "all", year: "all", q: "" };

  const TYPE_LABELS = {
    all: "All",
    journal: "Journal",
    conference: "Conference",
    book: "Book & Chapter",
    preprint: "Preprint",
    patent: "Patent",
    abstract: "Abstract"
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  }

  function authorHTML(authors) {
    // bold the site owner's name
    return esc(authors).replace(/X\. Wang/g, "<b>X. Wang</b>");
  }

  function linksHTML(p) {
    const l = p.links || {};
    const out = [];
    if (l.doi) out.push(`<a class="plink" href="${l.doi}" target="_blank" rel="noopener">DOI</a>`);
    if (l.arxiv) out.push(`<a class="plink" href="https://arxiv.org/abs/${l.arxiv}" target="_blank" rel="noopener">arXiv</a>`);
    if (l.pdf) out.push(`<a class="plink" href="${l.pdf}" target="_blank" rel="noopener">PDF</a>`);
    if (l.code) out.push(`<a class="plink" href="${l.code}" target="_blank" rel="noopener">Code</a>`);
    if (l.data) out.push(`<a class="plink" href="${l.data}" target="_blank" rel="noopener">Data</a>`);
    if (l.patent) out.push(`<a class="plink" href="${l.patent}" target="_blank" rel="noopener">Patent</a>`);
    if (l.page) out.push(`<a class="plink" href="${l.page}" target="_blank" rel="noopener">Page</a>`);
    return out.join(" ");
  }

  function pubEntry(p) {
    const badge = TYPE_LABELS[p.type] || p.type;
    const note = p.note ? ` <span class="pub-note">🏆 ${esc(p.note)}</span>` : "";
    return `<li class="pub-item">
      <div class="pub-main">
        <span class="pub-title">${esc(p.title)}</span>${note}
        <span class="pub-authors">${authorHTML(p.authors)}</span>
      </div>
      <div class="pub-meta">
        <span class="pub-venue">${esc(p.venue)}</span>
        <span class="pub-links">${linksHTML(p)}</span>
      </div>
    </li>`;
  }

  function renderPublications() {
    const box = document.getElementById("pub-list");
    if (!box) return;
    let items = PUBLICATIONS.slice();

    if (state.type !== "all") items = items.filter((p) => p.type === state.type);
    if (state.year !== "all") items = items.filter((p) => String(p.year) === state.year);
    if (state.q) {
      const q = state.q.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          p.venue.toLowerCase().includes(q)
      );
    }

    // group by year (descending)
    const byYear = {};
    items.forEach((p) => {
      (byYear[p.year] = byYear[p.year] || []).push(p);
    });
    const years = Object.keys(byYear).sort((a, b) => b - a);

    const counter = document.getElementById("pub-count");
    if (counter) counter.textContent = items.length;

    if (!items.length) {
      box.innerHTML = `<p class="empty">No publications match the current filters.</p>`;
      return;
    }

    let html = "";
    years.forEach((y) => {
      html += `<h3 class="pub-year">${y}</h3><ul class="pub-group">`;
      byYear[y]
        .sort((a, b) => (b.selected === true) - (a.selected === true))
        .forEach((p) => (html += pubEntry(p)));
      html += "</ul>";
    });
    box.innerHTML = html;
  }

  /* publication filter controls */
  const typeSel = document.getElementById("pub-type");
  const yearSel = document.getElementById("pub-year");
  const search = document.getElementById("pub-search");

  if (typeSel) {
    typeSel.addEventListener("change", () => {
      state.type = typeSel.value;
      renderPublications();
    });
  }
  if (yearSel) {
    yearSel.addEventListener("change", () => {
      state.year = yearSel.value;
      renderPublications();
    });
  }
  if (search) {
    search.addEventListener("input", () => {
      state.q = search.value.trim();
      renderPublications();
    });
  }

  /* populate year filter from data */
  function initYearFilter() {
    if (!yearSel) return;
    const years = Array.from(new Set(PUBLICATIONS.map((p) => p.year))).sort((a, b) => b - a);
    years.forEach((y) => {
      const o = document.createElement("option");
      o.value = y;
      o.textContent = y;
      yearSel.appendChild(o);
    });
  }

  /* ---------- init ---------- */
  initYearFilter();
  activate(currentTab());
})();
