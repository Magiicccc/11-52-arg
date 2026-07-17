#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? "content/case-001";
const allowedFunctions = new Set([
  "characterization","relationship","world_context","chronology","location","profession","socioeconomic","habit","platform_culture","theme","emotional_contrast","continuity","future_loss"
]);
const allowedClueRoles = new Set(["none","supporting","direct","misdirection"]);
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,entry.name);
    entry.isDirectory()?walk(p):files.push(p);
  }
}
walk(root);
const registryIds=new Set();
const contentItems=[];
const errors=[];
for (const file of files.filter(f=>f.endsWith(".json"))) {
  let data;
  try { data=JSON.parse(fs.readFileSync(file,"utf8")); }
  catch (e) { errors.push(`${file}: invalid json: ${e.message}`); continue; }
  const scan=(v)=>{
    if (Array.isArray(v)) return v.forEach(scan);
    if (!v || typeof v!=="object") return;
    if (typeof v.id==="string") registryIds.add(v.id);
    if (typeof v.id==="string" && typeof v.appId==="string" && Array.isArray(v.variants)) contentItems.push([v,file]);
    Object.values(v).forEach(scan);
  };
  scan(data);
}
let directVisible=0, visible=0;
for (const [item,file] of contentItems) {
  const n=item.narrative;
  if (!n || typeof n!=="object") { errors.push(`${file}#${item.id}: missing narrative metadata`); continue; }
  if (!allowedFunctions.has(n.primaryFunction)) errors.push(`${file}#${item.id}: invalid primaryFunction ${n.primaryFunction}`);
  if (!Array.isArray(n.secondaryFunctions)) errors.push(`${file}#${item.id}: secondaryFunctions must be array`);
  else for (const f of n.secondaryFunctions) if (!allowedFunctions.has(f)) errors.push(`${file}#${item.id}: invalid secondary function ${f}`);
  if (!allowedClueRoles.has(n.clueRole)) errors.push(`${file}#${item.id}: invalid clueRole ${n.clueRole}`);
  if (typeof n.firstReadValue!=="string" || n.firstReadValue.trim().length<8) errors.push(`${file}#${item.id}: firstReadValue too short`);
  const linkKeys=["worldFactIds","characterTraitIds","relationshipBeatIds","continuityLinkIds"];
  let linkCount=0;
  for (const key of linkKeys) {
    if (!Array.isArray(n[key])) errors.push(`${file}#${item.id}: ${key} must be array`);
    else {
      linkCount+=n[key].length;
      for (const id of n[key]) if (!registryIds.has(id)) errors.push(`${file}#${item.id}: unresolved narrative ref ${id}`);
    }
  }
  if (linkCount===0) errors.push(`${file}#${item.id}: orphan content, no narrative graph links`);
  const raw=JSON.stringify(item);
  if (/lorem ipsum|随机填充|TODO-CONTENT/i.test(raw) && item.metadata?.status!=="placeholder") errors.push(`${file}#${item.id}: unmarked placeholder/filler text`);
  if (item.metadata?.visibleAtStart===true || item.metadata?.slice==="P00-A2-11") {
    visible++;
    if (n.clueRole==="direct") directVisible++;
  }
}
if (visible>=10 && directVisible/visible>0.35) errors.push(`direct clue density too high: ${directVisible}/${visible}`);
if (errors.length) {
  for (const e of errors) console.error(e);
  process.exit(1);
}
console.log(`OK: ${contentItems.length} content items; orphan=0; visible direct clues=${directVisible}/${visible}`);
