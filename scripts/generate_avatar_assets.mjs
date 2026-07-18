import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "public", "media", "case-001", "avatars");
const manifestPath = path.join(root, "content", "case-001", "media", "generated-avatar-manifest.json");
const styles = [
  { id: "avataaars", creator: "Pablo Stanley", license: "Free for personal and commercial use" },
  { id: "lorelei", creator: "Lisa Wischofsky", license: "CC BY 4.0" },
  { id: "adventurer", creator: "Lisa Wischofsky", license: "CC BY 4.0" },
  { id: "personas", creator: "Draftbit", license: "CC0 1.0" }
];
const backgrounds = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "c7f0db", "e8d7c3", "cdd7e5"];
const count = 128;

await mkdir(outputDir, { recursive: true });
const assets = [];
for (let index = 0; index < count; index += 1) {
  const ordinal = String(index + 1).padStart(3, "0");
  const style = styles[index % styles.length];
  const seed = `11-52-fictional-avatar-${ordinal}`;
  const backgroundColor = backgrounds[(index * 5 + Math.floor(index / styles.length)) % backgrounds.length];
  const url = `https://api.dicebear.com/10.x/${style.id}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColor}&radius=12`;
  const response = await fetch(url, { headers: { "User-Agent": "11-52-ARG-avatar-production/1.0" } });
  if (!response.ok) throw new Error(`Avatar ${ordinal} failed: ${response.status} ${response.statusText}`);
  const svg = await response.text();
  if (!svg.includes("<svg")) throw new Error(`Avatar ${ordinal} did not return SVG`);
  const filename = `generated-avatar-${ordinal}.svg`;
  await writeFile(path.join(outputDir, filename), svg, "utf8");
  assets.push({
    slot: index,
    id: `avatar.generated.${ordinal}`,
    path: `/media/case-001/avatars/${filename}`,
    style: style.id,
    seed,
    creator: style.creator,
    license: style.license,
    sourceUrl: url,
    sha256: createHash("sha256").update(svg).digest("hex"),
    generatedAt: new Date().toISOString()
  });
}

const manifest = {
  schemaVersion: 1,
  purpose: "Fictional ordinary-user profile avatars for player-visible social and communication apps",
  source: "DiceBear 10.x HTTP avatar generation API",
  sourceDocumentation: "https://www.dicebear.com/how-to-use/http-api/",
  licenseDocumentation: "https://www.dicebear.com/licenses/",
  constraints: [
    "Fictional identities only",
    "No avatar is a narrative clue",
    "Stable seeds and local files make builds reproducible",
    "Every visible ordinary-user slot maps to an image asset rather than a single-character placeholder"
  ],
  assets
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ count: assets.length, outputDir, manifestPath }, null, 2));
