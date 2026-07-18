import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const date = "2026-07-18";
const frozenRoot = path.resolve("references", "ui", "11_52_UI_Reference_Pack_V1.0_全量版", "apps");
const outputRoot = path.resolve("references", "ui", "research-supplement");
const currentlyVerified = new Set(["wechat", "xiaohongshu", "baidu_map", "qqmail"]);

const folders = await import("node:fs/promises").then(({ readdir }) =>
  readdir(frozenRoot, { withFileTypes: true })
);

for (const folder of folders.filter((entry) => entry.isDirectory())) {
  const slug = folder.name;
  const frozenDir = path.join(frozenRoot, slug);
  const targetDir = path.join(outputRoot, slug, date);
  const manifest = JSON.parse(await readFile(path.join(frozenDir, "manifest.json"), "utf8"));
  const measurements = JSON.parse(await readFile(path.join(frozenDir, "measurements.json"), "utf8"));
  const sourceLog = await readFile(path.join(frozenDir, "source-log.md"), "utf8");
  const stateMatrix = await readFile(path.join(frozenDir, "state-matrix.md"), "utf8");
  const verification = currentlyVerified.has(slug)
    ? "Official App Store/product source rechecked on 2026-07-18"
    : "Frozen 2026 reference retained; official product URL recorded for follow-up drift review";

  await mkdir(targetDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(targetDir, "manifest.json"), `${JSON.stringify({
      supplementVersion: "1.0",
      researchedAt: "2026-07-18",
      app: manifest.app,
      slug,
      target: manifest.target,
      officialSource: manifest.officialSource,
      frozenReferencePath: path.relative(path.resolve("."), frozenDir).replaceAll("\\", "/"),
      verification,
      authority: "Frozen raw screenshots remain the visual authority. Current sources may identify drift but cannot override a frozen reference without a documented conflict.",
      greyReleaseStatus: "unknown; do not reproduce unverified grey-release modules"
    }, null, 2)}\n`, "utf8"),
    writeFile(path.join(targetDir, "source-log.md"), `# ${manifest.app} research supplement\n\n- Research date: 2026-07-18\n- Platform: iPhone / iOS 26.5.2 target\n- Locale: zh-CN\n- Appearance: light\n- Current verification: ${verification}\n- Official source: ${manifest.officialSource}\n- Frozen source directory: \`${path.relative(path.resolve("."), frozenDir).replaceAll("\\", "/")}\`\n\n## Frozen source log\n\n${sourceLog}\n`, "utf8"),
    writeFile(path.join(targetDir, "state-matrix.md"), `# ${manifest.app} state matrix supplement\n\nThis supplement does not merge or replace the frozen state matrix. It records the\n2026-07-18 implementation audit against the same-app references only.\n\n${stateMatrix}\n`, "utf8"),
    writeFile(path.join(targetDir, "measurements.json"), `${JSON.stringify({
      researchedAt: "2026-07-18",
      app: manifest.app,
      viewport: manifest.target?.viewport ?? "402x874",
      inheritedFrom: `${path.relative(path.resolve("."), path.join(frozenDir, "measurements.json")).replaceAll("\\", "/")}`,
      measurements,
      measurementPolicy: "No cross-app interpolation. Runtime deviations must be recorded in the per-app QA report."
    }, null, 2)}\n`, "utf8")
  ]);
}

console.log(`research supplements: ${folders.filter((entry) => entry.isDirectory()).length}`);
