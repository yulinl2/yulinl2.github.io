/* Zero-dependency site checks. Run: node statsupai-revamp/scripts/check.mjs
   Gates: JSON validity, internal link integrity, asset-weight budget,
   per-page HTML sanity. Exits non-zero on any failure. */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
// 900 KB ceiling catches the original site's catastrophic 9–12 MB class.
// Tighten to ~120 KB once headshots are re-encoded to WebP (see MAINTAINING.md).
const MAX_ASSET = 900 * 1024;
const MAX_IMG_DIR = 8 * 1024 * 1024;   // 8 MB total under assets/img
const errors = [];
const ok = (m) => console.log("  ok  " + m);
const fail = (m) => { errors.push(m); console.log("FAIL  " + m); };

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// 1. JSON validity
console.log("\n• JSON");
for (const f of walk(join(ROOT, "assets/data"))) {
  if (!f.endsWith(".json")) continue;
  try { JSON.parse(readFileSync(f, "utf8")); ok(f.replace(ROOT + "/", "")); }
  catch (e) { fail(`${f}: ${e.message}`); }
}

// 2. HTML sanity + internal links
console.log("\n• HTML pages");
const htmls = readdirSync(ROOT).filter((f) => f.endsWith(".html"));
for (const f of htmls) {
  const s = readFileSync(join(ROOT, f), "utf8");
  const h1 = (s.match(/<h1[ >]/g) || []).length;
  if (f !== "404.html" && h1 !== 1) fail(`${f}: expected exactly one <h1>, found ${h1}`);
  if (!/<html lang="en">/.test(s)) fail(`${f}: missing <html lang="en">`);
  if (!/<title>/.test(s)) fail(`${f}: missing <title>`);
  if (!/assets\/css\/main\.css/.test(s)) fail(`${f}: missing main.css`);
  var noIndex = f === "404.html" || f === "roadmap.html";
  if (!noIndex && !/rel="canonical"/.test(s)) fail(`${f}: missing canonical`);

  for (const m of s.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(u)) continue;
    const target = u.split(/[?#]/)[0];
    if (!target) continue;
    if (!existsSync(join(ROOT, target))) fail(`${f}: dead internal link → ${u}`);
  }
  ok(f);
}

// 3. Asset-weight budget
console.log("\n• Asset budget");
let imgTotal = 0;
for (const f of walk(join(ROOT, "assets"))) {
  const sz = statSync(f).size;
  if (f.includes("/assets/img/")) imgTotal += sz;
  if (sz > MAX_ASSET) fail(`${f.replace(ROOT + "/", "")} is ${(sz/1024|0)} KB (> ${MAX_ASSET/1024} KB budget)`);
}
if (imgTotal > MAX_IMG_DIR) fail(`assets/img total ${(imgTotal/1024/1024).toFixed(1)} MB (> ${MAX_IMG_DIR/1024/1024} MB)`);
else ok(`assets/img total ${(imgTotal/1024/1024).toFixed(1)} MB`);

console.log(`\n${errors.length ? "✗ " + errors.length + " problem(s)" : "✓ all checks passed"}`);
process.exit(errors.length ? 1 : 0);
