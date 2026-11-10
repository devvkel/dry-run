// Generates the 4 Dry Run logo concepts as pure-path SVGs (no font dependency).
//   node scripts/build-logos.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import opentype from "opentype.js";

const INK = "#07080c";
const LIME = "#c6ff3d";
const WHITE = "#eef0f6";
const VIOLET = "#7c5cff";

const buf = readFileSync("assets/Geist-Bold.ttf");
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

/** Text -> SVG path data, returns {d, width}. */
function text(str, size, x = 0, y = 0, tracking = 0) {
  let cx = x;
  let d = "";
  for (const ch of str) {
    const g = font.charToGlyph(ch);
    d += g.getPath(cx, y, size).toPathData(2);
    cx += (g.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return { d, width: cx - x };
}

// ---- Marks (64x64) ---------------------------------------------------------
const marks = {
  // 1. Ghost Curve: a dashed bonding curve (the rehearsal) ending in a solid dot (the real launch).
  1: (bg = true) => `
    ${bg ? `<rect width="64" height="64" rx="16" fill="${LIME}"/>` : ""}
    <path d="M13 49 C 29 49, 33 19, 47 17" fill="none" stroke="${INK}" stroke-width="6.5" stroke-linecap="round" stroke-dasharray="0.1 10.5"/>
    <circle cx="49" cy="16.5" r="7" fill="${INK}"/>`,
  // 2. DR monogram: tight bold D + lime R on ink.
  2: (bg = true) => {
    const D = text("D", 40, 9, 46, 0);
    const R = text("R", 40, 9 + D.width - 5, 46, 0);
    return `${bg ? `<rect width="64" height="64" rx="16" fill="${INK}" stroke="#2a2f44" stroke-width="2"/>` : ""}
    <path d="${D.d}" fill="${WHITE}"/><path d="${R.d}" fill="${LIME}"/>`;
  },
  // 3. Dry Drop: an empty (dry) drop outline with a rising curve inside.
  3: (bg = true) => `
    ${bg ? `<rect width="64" height="64" rx="16" fill="${INK}" stroke="#2a2f44" stroke-width="2"/>` : ""}
    <path d="M32 8 C 32 8, 14 29, 14 40 A 18 18 0 0 0 50 40 C 50 29, 32 8, 32 8 Z" fill="none" stroke="${LIME}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M22 45 C 29 45, 31 33, 41 32" fill="none" stroke="${LIME}" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="42" cy="32" r="3.6" fill="${LIME}"/>`,
  // 4. d/r: slash mark that echoes vibe/vibe.
  4: (bg = true) => {
    const d1 = text("d", 34, 7, 44);
    const r1 = text("r", 34, 39, 44);
    return `${bg ? `<rect width="64" height="64" rx="16" fill="${INK}" stroke="#2a2f44" stroke-width="2"/>` : ""}
    <path d="${d1.d}" fill="${WHITE}"/><path d="M38 14 L 28 50" stroke="${LIME}" stroke-width="6" stroke-linecap="round"/><path d="${r1.d}" fill="${WHITE}"/>`;
  },
};

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;

// ---- Lockups (mark + wordmark, for dark backgrounds) ----------------------
function lockup(n) {
  if (n === 4) {
    // The wordmark *is* the logo: dry/run with a lime slash.
    const a = text("dry", 64, 0, 62);
    const s = 34; // slash width
    const b = text("run", 64, a.width + s, 62);
    const w = Math.ceil(a.width + s + b.width + 4);
    return svg(w, 80, `<path d="${a.d}" fill="${WHITE}"/>
      <path d="M${a.width + s - 6} 14 L ${a.width + 6} 70" stroke="${LIME}" stroke-width="9" stroke-linecap="round"/>
      <path d="${b.d}" fill="${WHITE}"/>`);
  }
  const word = text("Dry Run", 46, 80, 50, -0.5);
  const w = Math.ceil(80 + word.width + 4);
  return svg(w, 64, `<g>${marks[n]()}</g><path d="${word.d}" fill="${WHITE}"/>`);
}

mkdirSync("brand", { recursive: true });
mkdirSync("public/brand", { recursive: true });
const names = { 1: "Ghost Curve", 2: "DR Monogram", 3: "Dry Drop", 4: "dry/run" };
for (const n of [1, 2, 3, 4]) {
  const mark = svg(64, 64, marks[n]());
  const lock = lockup(n);
  for (const dir of ["brand", "public/brand"]) {
    writeFileSync(`${dir}/logo-${n}-mark.svg`, mark);
    writeFileSync(`${dir}/logo-${n}.svg`, lock);
  }
}

// Preview sheet HTML (rendered to PNG with headless Chrome).
const cell = (n) => `
  <div class="cell">
    <div class="num">${n}</div>
    <div class="row"><img src="logo-${n}-mark.svg" width="120"/><img src="logo-${n}-mark.svg" width="32"/><img src="logo-${n}-mark.svg" width="16"/></div>
    <div class="lock"><img src="logo-${n}.svg" height="56"/></div>
    <div class="name">${names[n]}</div>
  </div>`;
const css = `body{margin:0;background:${INK};font-family:Arial,sans-serif;color:${WHITE}}
.sheet{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:40px;width:1520px}
.cell{border:1px solid #1d2130;border-radius:24px;padding:28px;background:#0f1118;position:relative;height:330px}
.num{position:absolute;top:18px;right:22px;font-size:40px;font-weight:700;color:${LIME}}
.row{display:flex;align-items:flex-end;gap:18px}.lock{margin-top:40px}.name{margin-top:28px;font-size:22px;color:#8a90a6}
h1{margin:40px 40px 0;font-size:28px}`;
writeFileSync("brand/sheet.html", `<html><head><style>${css}</style></head><body><h1>Dry Run · logo options</h1><div class="sheet">${[1, 2, 3, 4].map(cell).join("")}</div></body></html>`);
for (const n of [1, 2, 3, 4]) {
  writeFileSync(`brand/preview-${n}.html`, `<html><head><style>${css}</style></head><body><div class="sheet" style="grid-template-columns:1fr;width:420px;padding:20px">${cell(n)}</div></body></html>`);
}
console.log("logos written", VIOLET && "");
