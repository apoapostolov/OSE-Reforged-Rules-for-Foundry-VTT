// build_pack.mjs — writes the classic-level compendium pack from the JSON manifest.
// Same write pattern as foundryvtt-cli compileClassicLevel: flat keys
// `!items!<id>` / `!folders!<id>` with JSON values, keyEncoding utf8,
// valueEncoding json. Folders ARE included (v13+ LevelDB packs support them).
// Wipes the target directory first so stale keys never survive a rebuild.
import { ClassicLevel } from "/home/apoapostolov/Foundry.14/node_modules/classic-level/index.js";
import fs from "node:fs";

const MANIFEST = "/tmp/reforged-pack-manifest.json";
const OUT = process.argv[2]; // packs/reforged-class-features

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

// clean rebuild: remove existing pack dir entirely
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const db = new ClassicLevel(OUT, { keyEncoding: "utf8", valueEncoding: "json" });
await db.open();
const batch = db.batch();

for (const folder of manifest.folders) {
  batch.put(`!folders!${folder._id}`, { ...folder });
}
for (const item of manifest.items) {
  batch.put(`!items!${item._id}`, { ...item });
}
await batch.write();
await db.close();

// verify
const check = new ClassicLevel(OUT, { keyEncoding: "utf8", valueEncoding: "json" });
await check.open();
let folders = 0, items = 0;
for await (const [k] of check.iterator()) {
  if (k.startsWith("!folders!")) folders++;
  else if (k.startsWith("!items!")) items++;
}
await check.close();
console.log(`pack written: ${OUT}`);
console.log(`folders: ${folders}, items: ${items}`);
if (folders !== manifest.folders.length || items !== manifest.items.length) {
  console.error("MISMATCH: written counts differ from manifest!");
  process.exit(1);
}
