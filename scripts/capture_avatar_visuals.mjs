import { chromium } from "@playwright/test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const phase = process.env.AVATAR_CAPTURE_PHASE ?? "avatar-pass";
const outputRoot = path.join(root, "test-results", "full-realism", phase);
const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173/";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const appCases = [
  ["wechat", "app.wechat"],
  ["xiaohongshu", "app.xiaohongshu"],
  ["douyin", "app.douyin"],
  ["zhihu", "app.zhihu"],
  ["qqmail", "app.qqmail"],
  ["baidunetdisk", "app.baidunetdisk"],
  ["settings", "app.settings"],
  ["tieba", "app.tieba"],
  ["netease-music", "app.netease_music"],
  ["health", "app.health"]
];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
const browser = await chromium.launch({
  ...(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {}),
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-http2"]
});
const audit = [];

async function openHome(page) {
  const url = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}qa=1`;
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    try {
      await page.getByTestId("home-screen").waitFor({ timeout: 30_000 });
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function waitForVisibleImages(page) {
  await page.waitForFunction(() => Array.from(document.images)
    .filter((image) => image.getClientRects().length > 0)
    .every((image) => image.complete && image.naturalWidth > 0), undefined, { timeout: 30_000 });
}

for (const viewport of [{ width: 402, height: 874 }, { width: 440, height: 956 }]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText ?? "unknown";
    if (error === "net::ERR_ABORTED") return;
    failedRequests.push({ url: request.url(), error });
  });

  await openHome(page);
  for (const [label, appId] of appCases) {
    for (let attempt = 0; attempt < 3 && await page.getByTestId(`app-${appId}`).count() === 0; attempt += 1) {
      const back = page.getByTestId("app-back").first();
      if (await back.count() === 0) break;
      await back.click();
    }
    const icon = page.getByTestId(`app-${appId}`);
    await icon.scrollIntoViewIfNeeded();
    await icon.click();
    await page.locator(".app-window").waitFor();
    await waitForVisibleImages(page);
    await page.screenshot({ path: path.join(outputRoot, `${label}-home-${viewport.width}.png`) });

    if (label === "wechat") {
      await page.locator(".list-row").first().click();
      await waitForVisibleImages(page);
      await page.screenshot({ path: path.join(outputRoot, `${label}-chat-${viewport.width}.png`) });
    }
    if (label === "xiaohongshu") {
      await page.locator(".xhs-card").first().click();
      await waitForVisibleImages(page);
      await page.screenshot({ path: path.join(outputRoot, `${label}-detail-${viewport.width}.png`) });
    }
    if (label === "qqmail") {
      await page.locator(".mail-row").first().click();
      await waitForVisibleImages(page);
      await page.screenshot({ path: path.join(outputRoot, `${label}-detail-${viewport.width}.png`) });
    }
    for (let attempt = 0; attempt < 6 && await page.getByTestId("home-screen").count() === 0; attempt += 1) {
      const back = page.getByTestId("app-back").first();
      if (await back.count() === 0) break;
      await back.click();
    }
    await page.getByTestId("home-screen").waitFor({ timeout: 10_000 });
  }

  const avatarUrls = Array.from({ length: 128 }, (_, index) =>
    new URL(`media/case-001/avatars/generated-avatar-${String(index + 1).padStart(3, "0")}.png`, baseUrl).href
  );
  await page.setContent(`<style>
    body{margin:0;padding:12px;background:#eef0f3;font-family:system-ui}
    h1{font-size:18px;margin:0 0 12px}.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
    figure{margin:0;text-align:center;font-size:9px;color:#555}img{width:100%;aspect-ratio:1;display:block;border-radius:50%;object-fit:cover;background:#fff}
  </style><h1>Generated avatar contact sheet</h1><div class="grid">${avatarUrls.map((url, index) =>
    `<figure><img src="${url}" alt="avatar ${index + 1}"><figcaption>${String(index + 1).padStart(3, "0")}</figcaption></figure>`
  ).join("")}</div>`, { waitUntil: "load" });
  await waitForVisibleImages(page);
  await page.screenshot({ path: path.join(outputRoot, `avatar-contact-sheet-${viewport.width}.png`), fullPage: true });
  audit.push({ viewport, consoleErrors, failedRequests });
  await context.close();
}

await browser.close();
await writeFile(path.join(outputRoot, "runtime-audit.json"), `${JSON.stringify(audit, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputRoot, screenshots: 28, runtimeAuditFiles: 1, audit }, null, 2));
