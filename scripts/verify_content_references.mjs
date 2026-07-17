#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? "content/case-001";
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    entry.isDirectory() ? walk(p) : files.push(p);
  }
}
walk(root);
const ids = new Map();
const refs = [];
for (const file of files.filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const scan = (v, key = "") => {
    if (Array.isArray(v)) return v.forEach((x) => scan(x, key));
    if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) {
        if (k === "id" && typeof x === "string") {
          if (ids.has(x)) throw new Error(`duplicate id ${x}: ${file} / ${ids.get(x)}`);
          ids.set(x, file);
        }
        if ((k.endsWith("Id") || k.endsWith("Ids")) && k !== "id") {
          const values = Array.isArray(x) ? x : [x];
          for (const r of values) if (typeof r === "string") refs.push([r, file, k]);
        }
        scan(x, k);
      }
    }
  };
  scan(data);
}
const missing = refs.filter(([r]) => !ids.has(r));
if (missing.length) {
  for (const [r, f, k] of missing) console.error(`missing ref ${r} in ${f}#${k}`);
  process.exit(1);
}
console.log(`OK: ${ids.size} ids, ${refs.length} references`);
