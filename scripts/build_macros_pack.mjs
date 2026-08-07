// build_macros_pack.mjs — writes the module's Macro compendium pack from
// the source files in scripts/automation/macros/. Same classic-level
// pattern as build_pack.mjs but with `!macros!<id>` keys (foundryvtt-cli
// compileClassicLevel format). Wipes the target dir first.
//
// Usage: node scripts/build_macros_pack.mjs <out-dir>
//   e.g.  node scripts/build_macros_pack.mjs packs/reforged-macros
//
// The macro SOURCE files are the `command` bodies (Foundry wraps them in
// an async IIFE, so top-level await is valid). Deterministic _ids are
// derived from a stable slug so re-imports keep UUIDs stable.
import { ClassicLevel } from "/home/apoapostolov/Foundry.14/node_modules/classic-level/index.js";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const MACRO_DIR = path.join(import.meta.dirname, "automation", "macros");
const OUT = process.argv[2];
if (!OUT) {
  console.error("Usage: node scripts/build_macros_pack.mjs <out-dir>");
  process.exit(1);
}

// Stable id from a slug: "charge-fury" -> fixed 16-hex id.
function stableId(slug) {
  return crypto.createHash("md5").update(`ose-reforged-macro:${slug}`).digest("hex").slice(0, 16);
}

const macros = [];
for (const file of fs.readdirSync(MACRO_DIR).filter((f) => f.endsWith(".js")).sort()) {
  const slug = file.replace(/\.js$/, "");
  const command = fs.readFileSync(path.join(MACRO_DIR, file), "utf8");
  const name = slug
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  // Core icons by macro (Foundry core "icons/" path, no leading slash).
  const ICONS = {
    "charge-fury": "icons/environment/people/charge.webp",
    "cleanse-evil-tag": "icons/weapons/swords/sword-gold-holy.webp",
  };
  macros.push({
    _id: stableId(slug),
    name,
    type: "script",
    scope: "global",
    img: ICONS[slug] ?? "icons/sundries/documents/document-symbol-light.webp",
    command,
    flags: {},
    ownership: { default: 0, PLAYER: 2 },
    sort: macros.length * 100000,
    _stats: {
      systemId: "ose",
      systemVersion: "2.10.0",
      coreVersion: "14.359",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: "ose-apo-reforged-rules",
    },
  });
}

// clean rebuild
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const db = new ClassicLevel(OUT, { keyEncoding: "utf8", valueEncoding: "json" });
await db.open();
const batch = db.batch();
for (const m of macros) {
  batch.put(`!macros!${m._id}`, m);
}
await batch.write();
await db.close();

// verify
const check = new ClassicLevel(OUT, { keyEncoding: "utf8", valueEncoding: "json" });
await check.open();
let count = 0;
for await (const [k] of check.iterator()) {
  if (k.startsWith("!macros!")) count++;
}
await check.close();
console.log(`macro pack written: ${OUT} (${count} macros)`);
for (const m of macros) console.log(`  ${m.name} (${m._id})`);
