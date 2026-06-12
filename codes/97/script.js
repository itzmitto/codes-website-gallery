/* =====================================================
   Bento Features — Interactive CSS Tutorial
   script.js
   ===================================================== */

(function () {
  "use strict";

  /* ── DOM refs ──────────────────────────────────────── */
  const frame       = document.getElementById("frame");
  const handle      = document.getElementById("handle");
  const rulerFill   = document.getElementById("rulerFill");
  const rulerCurrent = document.getElementById("rulerCurrent");
  const presets     = document.querySelectorAll(".preset");
  const codeTabs    = document.querySelectorAll(".code__tab");
  const codeBody    = document.getElementById("codeBody");

  /* ── Constants ─────────────────────────────────────── */
  const MIN_W   = 320;
  const MAX_W   = 1280;
  const RULER_MIN = MIN_W;
  const RULER_MAX = MAX_W;

  /* ── CSS snippets per breakpoint tab ───────────────── */
  const snippets = {
    base: [
      { type: "comment", text: "/* Single-column stack — every cell full-width */" },
      { type: "blank" },
      { type: "sel",  text: ".bento {" },
      { type: "prop", text: "  display",            value: "grid" },
      { type: "prop", text: "  gap",                value: "var(--gap)" },
      { type: "prop", text: "  grid-template-columns", value: "1fr" },
      { type: "prop", text: "  grid-template-areas",
        value: `\n    "ai"\n    "board"\n    "config"\n    "apps"\n    "search"\n    "tasks"\n    "stats"` },
      { type: "close" },
    ],

    480: [
      { type: "at",   text: "@media (min-width: 480px) {" },
      { type: "blank" },
      { type: "comment", text: "  /* Asymmetric two-column pairs */" },
      { type: "sel",  text: "  .bento {", indent: "  " },
      { type: "prop", text: "  grid-template-columns", value: "1fr 1fr",  indent: "    " },
      { type: "prop", text: "  grid-template-areas",
        value: `\n      "ai     board"\n      "config search"\n      "apps   apps"\n      "tasks  stats"`,
        indent: "    " },
      { type: "close", indent: "  " },
      { type: "blank" },
      { type: "close" },
    ],

    768: [
      { type: "at",   text: "@media (min-width: 768px) {" },
      { type: "blank" },
      { type: "comment", text: "  /* Three-column layout with spanning cells */" },
      { type: "sel",  text: "  .bento {", indent: "  " },
      { type: "prop", text: "  grid-template-columns", value: "repeat(3, 1fr)",  indent: "    " },
      { type: "prop", text: "  grid-template-rows",    value: "auto auto auto",  indent: "    " },
      { type: "prop", text: "  grid-template-areas",
        value: `\n      "ai     board  config"\n      "apps   apps   search"\n      "tasks  stats  stats"`,
        indent: "    " },
      { type: "close", indent: "  " },
      { type: "blank" },
      { type: "comment", text: "  /* Apps icon grid grows to 3 columns */" },
      { type: "sel",  text: "  .apps-grid {", indent: "  " },
      { type: "prop", text: "  grid-template-columns", value: "repeat(3, 1fr)", indent: "    " },
      { type: "close", indent: "  " },
      { type: "blank" },
      { type: "close" },
    ],

    1024: [
      { type: "at",   text: "@media (min-width: 1024px) {" },
      { type: "blank" },
      { type: "comment", text: "  /* Looser spacing and gradient accent cards */" },
      { type: "sel",  text: "  .bento {", indent: "  " },
      { type: "prop", text: "  gap",  value: "0.75rem",  indent: "    " },
      { type: "close", indent: "  " },
      { type: "blank" },
      { type: "sel",  text: "  .cell {", indent: "  " },
      { type: "prop", text: "  padding",  value: "1.4rem 1.1rem 1.1rem",  indent: "    " },
      { type: "close", indent: "  " },
      { type: "blank" },
      { type: "sel",  text: "  .apps-grid {", indent: "  " },
      { type: "prop", text: "  grid-template-columns", value: "repeat(4, 1fr)", indent: "    " },
      { type: "close", indent: "  " },
      { type: "blank" },
      { type: "sel",  text: "  .chart {", indent: "  " },
      { type: "prop", text: "  min-height",  value: "90px",  indent: "    " },
      { type: "close", indent: "  " },
      { type: "blank" },
      { type: "comment", text: "  /* Gradient cards for AI and Stats */" },
      { type: "sel",  text: "  .cell--ai,\n  .cell--stats {", indent: "  " },
      { type: "prop", text: "  background",
        value: "linear-gradient(135deg, #f1eefb, #fde9ec)",  indent: "    " },
      { type: "close", indent: "  " },
      { type: "blank" },
      { type: "close" },
    ],
  };

  /* ── Syntax-highlight renderer ─────────────────────── */
  function renderSnippet(tokens) {
    return tokens.map(tok => {
      const ind = tok.indent || "";
      switch (tok.type) {
        case "comment":
          return `<span class="tok-comment">${esc(tok.text)}</span>`;
        case "blank":
          return "";
        case "at":
          return `<span class="tok-at">${esc(tok.text)}</span>`;
        case "sel":
          return `<span class="tok-sel">${esc(tok.text)}</span>`;
        case "prop": {
          const valLines = tok.value.split("\n");
          const valFormatted = valLines
            .map((l, i) => i === 0
              ? `<span class="tok-val">${esc(l)}</span>`
              : `${esc(ind)}    <span class="tok-val">${esc(l.trimStart())}</span>`)
            .join("\n");
          return `${esc(ind)}  <span class="tok-prop">${esc(tok.text)}</span><span class="tok-punc">: </span>${valFormatted}<span class="tok-punc">;</span>`;
        }
        case "close":
          return `${esc(ind)}<span class="tok-punc">}</span>`;
        default:
          return esc(tok.text || "");
      }
    }).join("\n");
  }

  function esc(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ── Width → active breakpoint key ─────────────────── */
  function bpKey(w) {
    if (w >= 1024) return "1024";
    if (w >= 768)  return "768";
    if (w >= 480)  return "480";
    return "base";
  }

  /* ── Ruler ──────────────────────────────────────────── */
  function updateRuler(w) {
    const pct = ((w - RULER_MIN) / (RULER_MAX - RULER_MIN)) * 100;
    rulerFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    rulerCurrent.textContent = `${Math.round(w)}px`;
    handle.setAttribute("aria-valuenow", Math.round(w));
  }

  /* ── Preset buttons ─────────────────────────────────── */
  function updatePresets(w) {
    presets.forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.width) === w);
      btn.setAttribute("aria-selected", String(Number(btn.dataset.width) === w));
    });
  }

  /* ── Code panel ─────────────────────────────────────── */
  function updateCode(bp) {
    codeTabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.bp === bp);
    });
    codeBody.innerHTML = renderSnippet(snippets[bp]);
  }

  /* ── Apply width everywhere ─────────────────────────── */
  function applyWidth(w) {
    w = Math.round(Math.max(MIN_W, Math.min(MAX_W, w)));
    frame.style.width = `${w}px`;
    updateRuler(w);
    updatePresets(w);
    updateCode(bpKey(w));
  }

  /* ── Drag logic ─────────────────────────────────────── */
  let dragging   = false;
  let startX     = 0;
  let startWidth = 0;

  function onDragStart(e) {
    dragging   = true;
    startX     = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    startWidth = frame.offsetWidth;
    handle.classList.add("dragging");
    document.body.style.userSelect   = "none";
    document.body.style.cursor       = "ew-resize";
    document.addEventListener("mousemove", onDragMove, { passive: true });
    document.addEventListener("mouseup",   onDragEnd);
    document.addEventListener("touchmove", onDragMove, { passive: true });
    document.addEventListener("touchend",  onDragEnd);
  }

  function onDragMove(e) {
    if (!dragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const delta   = clientX - startX;
    applyWidth(startWidth + delta);
  }

  function onDragEnd() {
    dragging = false;
    handle.classList.remove("dragging");
    document.body.style.userSelect = "";
    document.body.style.cursor     = "";
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup",   onDragEnd);
    document.removeEventListener("touchmove", onDragMove);
    document.removeEventListener("touchend",  onDragEnd);
  }

  /* keyboard support for the handle (arrow keys) */
  handle.addEventListener("keydown", e => {
    const step = e.shiftKey ? 50 : 10;
    if (e.key === "ArrowRight") { e.preventDefault(); applyWidth(frame.offsetWidth + step); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); applyWidth(frame.offsetWidth - step); }
  });

  handle.addEventListener("mousedown",  onDragStart);
  handle.addEventListener("touchstart", onDragStart, { passive: true });

  /* ── Preset button clicks ───────────────────────────── */
  presets.forEach(btn => {
    btn.addEventListener("click", () => applyWidth(Number(btn.dataset.width)));
  });

  /* ── Code tab clicks ────────────────────────────────── */
  codeTabs.forEach(tab => {
    tab.addEventListener("click", () => updateCode(tab.dataset.bp));
  });

  /* ── Init ───────────────────────────────────────────── */
  applyWidth(375);

})();