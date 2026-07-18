import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.LIVE_SITE_URL ?? "https://magiicccc.github.io/11-52-arg/";
const phase = process.env.LIVE_AUDIT_PHASE ?? "before";
const projectRoot = process.cwd();
const screenshotRoot = path.join(projectRoot, "test-results", `live-${phase}`);
const reportRoot = path.join(projectRoot, "docs", "qa", "live-site");
const viewports = [
  { name: "402x874", width: 402, height: 874 },
  { name: "440x956", width: 440, height: 956 },
  { name: "1440x1000", width: 1440, height: 1000 }
];

await mkdir(screenshotRoot, { recursive: true });
await mkdir(reportRoot, { recursive: true });

const consoleErrors = [];
const consoleWarnings = [];
const failedRequests = [];
const resources = [];
const performanceRows = [];
const brokenImages = [];

function recordPage(page, viewport) {
  page.on("console", (message) => {
    const row = {
      phase,
      viewport: viewport.name,
      type: message.type(),
      text: message.text(),
      location: message.location()
    };
    if (message.type() === "error") consoleErrors.push(row);
    if (message.type() === "warning" || message.type() === "warn") consoleWarnings.push(row);
  });
  page.on("pageerror", (error) => {
    consoleErrors.push({
      phase,
      viewport: viewport.name,
      type: "pageerror",
      text: error.message,
      stack: error.stack
    });
  });
  page.on("requestfailed", (request) => {
    failedRequests.push({
      phase,
      viewport: viewport.name,
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      failure: request.failure()?.errorText ?? "unknown"
    });
  });
  page.on("response", async (response) => {
    const request = response.request();
    const headers = await response.allHeaders();
    resources.push({
      phase,
      viewport: viewport.name,
      url: response.url(),
      status: response.status(),
      ok: response.ok(),
      resourceType: request.resourceType(),
      contentType: headers["content-type"] ?? null,
      contentLength: headers["content-length"] ?? null,
      fromServiceWorker: response.fromServiceWorker()
    });
  });
}

async function screenshot(page, name) {
  await page.locator("img").evaluateAll(async (images) => {
    await Promise.all(images.map(async (image) => {
      if (!image.complete) {
        await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }
      if (typeof image.decode === "function") {
        try {
          await image.decode();
        } catch {
          // The network audit records the corresponding failed resource.
        }
      }
    }));
  });
  await page.screenshot({
    path: path.join(screenshotRoot, `${name}.png`),
    animations: "disabled"
  });
  const broken = await page.locator("img").evaluateAll((images) => images
    .filter((image) => !image.complete || image.naturalWidth === 0)
    .map((image) => ({ src: image.currentSrc || image.src, complete: image.complete, naturalWidth: image.naturalWidth })));
  for (const image of broken) brokenImages.push({ phase, screenshot: name, ...image });
}

async function clearSave(page) {
  await page.evaluate(async () => {
    const databases = await indexedDB.databases();
    await Promise.all(databases.map(({ name }) => name && new Promise((resolve) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    })));
  });
}

async function gotoWithRetry(page, url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await page.goto(url, { waitUntil: "load", timeout: 45_000 });
    } catch (error) {
      lastError = error;
      if (attempt < 3) await page.waitForTimeout(attempt * 1_000);
    }
  }
  throw lastError;
}

async function edgeSwitch(page, direction) {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Missing viewport");
  const y = Math.round(viewport.height / 2);
  const stage = page.locator(".prototype-stage");
  if (direction === "investigation") {
    await stage.dispatchEvent("pointerdown", { clientX: viewport.width - 12, clientY: y, pointerId: 1, pointerType: "touch" });
    await stage.dispatchEvent("pointerup", { clientX: viewport.width - 120, clientY: y, pointerId: 1, pointerType: "touch" });
  } else {
    await stage.dispatchEvent("pointerdown", { clientX: 12, clientY: y, pointerId: 1, pointerType: "touch" });
    await stage.dispatchEvent("pointerup", { clientX: 120, clientY: y, pointerId: 1, pointerType: "touch" });
  }
}

async function returnHome(page) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await page.getByTestId("home-screen").isVisible()) return;
    const back = page.getByTestId("app-back");
    if (await back.count() !== 1) throw new Error("App back control is unavailable");
    await back.click();
  }
  await page.getByTestId("home-screen").waitFor({ state: "visible" });
}

async function openApp(page, appId) {
  const icon = page.getByTestId(`app-${appId}`);
  await icon.scrollIntoViewIfNeeded();
  await icon.click();
  await page.locator(".app-window").waitFor({ state: "visible" });
}

async function captureApp(page, appId, screenshotName, detailName) {
  await openApp(page, appId);
  await screenshot(page, screenshotName);
  if (detailName) {
    const action = page.getByTestId("app-effective-action");
    if (await action.count()) {
      await action.first().click();
      await screenshot(page, detailName);
    }
  }
  await returnHome(page);
}

async function unlockInvestigationPhone(page) {
  await page.getByTestId("lock-call-chenyu").click();
  await page.getByRole("button", { name: "结束通话" }).click();
  await page.getByTestId("open-passcode").click();
  for (const digit of "230917") await page.getByTestId(`key-${digit}`).click();
  await page.getByTestId("home-screen").waitFor({ state: "visible" });
}

async function captureDeepMobileBaseline(page) {
  await screenshot(page, "player-home-402x874");
  await page.locator(".home-pages").evaluate((element) => {
    element.scrollLeft = element.clientWidth;
    element.dispatchEvent(new Event("scroll"));
  });
  await screenshot(page, "player-home-page2-402x874");
  await page.locator(".home-pages").evaluate((element) => {
    element.scrollLeft = 0;
    element.dispatchEvent(new Event("scroll"));
  });

  await edgeSwitch(page, "investigation");
  await page.getByTestId("lock-screen").waitFor({ state: "visible" });
  await screenshot(page, "investigation-lock-screen-402x874");
  await page.getByTestId("lock-call-chenyu").click();
  await screenshot(page, "investigation-notification-call-402x874");
  await page.getByRole("button", { name: "结束通话" }).click();
  await page.getByTestId("open-passcode").click();
  await screenshot(page, "investigation-passcode-402x874");
  for (const digit of "230917") await page.getByTestId(`key-${digit}`).click();
  await page.getByTestId("home-screen").waitFor({ state: "visible" });
  await screenshot(page, "investigation-home-402x874");
  await page.locator(".home-pages").evaluate((element) => {
    element.scrollLeft = element.clientWidth;
    element.dispatchEvent(new Event("scroll"));
  });
  await screenshot(page, "investigation-home-page2-402x874");
  await page.locator(".home-pages").evaluate((element) => {
    element.scrollLeft = 0;
    element.dispatchEvent(new Event("scroll"));
  });

  await openApp(page, "app.wechat");
  await screenshot(page, "wechat-conversations-402x874");
  await page.getByTestId("thread-陈屿").click();
  await screenshot(page, "wechat-chat-chenyu-402x874");
  await page.getByTestId("wechat-conversations").click();
  await page.getByTestId("thread-文件传输助手").click();
  await screenshot(page, "wechat-file-transfer-402x874");
  await returnHome(page);

  await openApp(page, "app.photos");
  await screenshot(page, "photos-library-402x874");
  const photos = page.locator('[data-testid^="photo-photo."]');
  const photoCount = await photos.count();
  if (photoCount > 0) {
    await photos.nth(0).click();
    await screenshot(page, "photos-detail-402x874");
  }
  await returnHome(page);

  await captureApp(page, "app.safari", "safari-home-402x874");
  await captureApp(page, "app.baidu_map", "baidu-map-402x874");
  await captureApp(page, "app.files", "files-home-402x874");
  await captureApp(page, "app.notes", "notes-home-402x874");
  await captureApp(page, "app.phone", "phone-home-402x874");

  await captureApp(page, "app.xiaohongshu", "xiaohongshu-home-402x874", "xiaohongshu-detail-402x874");
  await captureApp(page, "app.douyin", "douyin-home-402x874");

  await openApp(page, "app.zhihu");
  await screenshot(page, "zhihu-home-402x874");
  await page.getByTestId("zhihu-open-search").click();
  await page.getByTestId("zhihu-search-input").fill("网页");
  await page.getByTestId("zhihu-search-submit").click();
  await screenshot(page, "zhihu-search-402x874");
  await page.getByTestId("app-back").click();
  const effective = page.getByTestId("app-effective-action");
  await effective.click();
  await screenshot(page, "zhihu-question-402x874");
  await page.locator(".zhihu-answer-actions button").nth(1).click();
  await screenshot(page, "zhihu-comments-402x874");
  await page.getByTestId("app-back").click();
  await page.getByTestId("app-back").click();
  const zhihuCards = page.locator(".zhihu-question-card");
  const zhihuCardCount = await zhihuCards.count();
  await zhihuCards.nth(zhihuCardCount - 1).click();
  await screenshot(page, "zhihu-404-402x874");
  await page.getByTestId("zhihu-cache-entry-before").click();
  await screenshot(page, "zhihu-cache-after-402x874");
  await returnHome(page);

  await captureApp(page, "app.tieba", "tieba-home-402x874");
  await captureApp(page, "app.toutiao", "toutiao-home-402x874");
  await captureApp(page, "app.alipay", "alipay-home-402x874");
  await captureApp(page, "app.taobao", "taobao-home-402x874");
  await captureApp(page, "app.meituan", "meituan-home-402x874");
  await captureApp(page, "app.didi", "didi-home-402x874");
  await captureApp(page, "app.qqmail", "qqmail-home-402x874");
  await captureApp(page, "app.baidunetdisk", "baidunetdisk-home-402x874");
}

const browser = await chromium.launch({ headless: true, args: ["--disable-http2"] });
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      locale: "zh-CN"
    });
    const page = await context.newPage();
    recordPage(page, viewport);
    const startedAt = Date.now();
    const response = await gotoWithRetry(page, baseUrl);
    await page.getByTestId("home-screen").waitFor({ state: "visible" });
    const visibleAt = Date.now();
    const performance = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const paints = Object.fromEntries(performance.getEntriesByType("paint").map((entry) => [entry.name, entry.startTime]));
      return {
        navigation: navigation && "toJSON" in navigation ? navigation.toJSON() : null,
        paints
      };
    });
    const indexedDb = await page.evaluate(async () => ({
      supported: typeof indexedDB !== "undefined",
      databases: (await indexedDB.databases()).map((database) => database.name)
    }));
    performanceRows.push({
      phase,
      viewport: viewport.name,
      httpStatus: response?.status() ?? null,
      finalUrl: page.url(),
      loadMs: visibleAt - startedAt,
      indexedDb,
      performance
    });
    await screenshot(page, `entry-${viewport.name}`);
    if (viewport.name === "402x874") await captureDeepMobileBaseline(page);
    await context.close();
  }
} finally {
  await browser.close();
}

const uniqueResources = [...new Map(resources.map((resource) => [
  `${resource.viewport}|${resource.url}|${resource.status}`,
  resource
])).values()];

const siteUrl = new URL(baseUrl);
const basePath = siteUrl.pathname.endsWith("/") ? siteUrl.pathname : `${siteUrl.pathname}/`;
const mimeErrors = uniqueResources.filter((resource) => {
  const type = resource.contentType ?? "";
  if (resource.resourceType === "image") return !type.startsWith("image/");
  if (resource.resourceType === "stylesheet") return !type.includes("text/css");
  if (resource.resourceType === "script") return !/(javascript|ecmascript)/i.test(type);
  if (resource.resourceType === "font") return !/(font|woff|octet-stream)/i.test(type);
  if (/\.json(?:$|\?)/i.test(resource.url)) return !/(json|octet-stream)/i.test(type);
  if (/\.(?:mp3|m4a|wav|ogg)(?:$|\?)/i.test(resource.url)) return !/(audio|octet-stream)/i.test(type);
  if (/\.(?:mp4|webm|mov)(?:$|\?)/i.test(resource.url)) return !/(video|octet-stream)/i.test(type);
  return false;
});
const escapedBasePath = uniqueResources.filter((resource) => {
  const url = new URL(resource.url);
  return url.origin === siteUrl.origin && !url.pathname.startsWith(basePath);
});
const windowsAbsolutePaths = uniqueResources.filter((resource) => /(?:^|\/)[A-Za-z]:[\\/]/.test(resource.url) || /^file:\/\/\/[A-Za-z]:/i.test(resource.url));
const uniqueBrokenImages = [...new Map(brokenImages.map((image) => [`${image.screenshot}|${image.src}`, image])).values()];
const resourceReport = {
  phase,
  baseUrl,
  summary: {
    totalResponses: uniqueResources.length,
    httpErrors: uniqueResources.filter((resource) => resource.status >= 400).length,
    mimeErrors: mimeErrors.length,
    escapedBasePath: escapedBasePath.length,
    windowsAbsolutePaths: windowsAbsolutePaths.length,
    brokenImages: uniqueBrokenImages.length,
    fontErrors: failedRequests.filter((request) => request.resourceType === "font").length,
    imageErrors: failedRequests.filter((request) => request.resourceType === "image").length,
    audioVideoErrors: failedRequests.filter((request) => request.resourceType === "media").length,
    jsonErrors: failedRequests.filter((request) => /\.json(?:$|\?)/i.test(request.url)).length
  },
  mimeErrors,
  escapedBasePath,
  windowsAbsolutePaths,
  brokenImages: uniqueBrokenImages,
  resources: uniqueResources
};

for (const [filename, value] of [
  ["console-errors.json", consoleErrors],
  ["console-warnings.json", consoleWarnings],
  ["failed-requests.json", failedRequests],
  ["resource-audit.json", resourceReport],
  [`console-errors-${phase}.json`, consoleErrors],
  [`console-warnings-${phase}.json`, consoleWarnings],
  [`failed-requests-${phase}.json`, failedRequests],
  [`resource-audit-${phase}.json`, resourceReport]
]) {
  await writeFile(path.join(reportRoot, filename), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const performanceMarkdown = [
  "# GitHub Pages 线上性能摘要",
  "",
  `- 阶段：${phase}`,
  `- 地址：${baseUrl}`,
  `- 采集时间：${new Date().toISOString()}`,
  "",
  "| 视口 | HTTP | 首屏可见 | DOMContentLoaded | Load Event | FCP | IndexedDB |",
  "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
  ...performanceRows.map((row) => {
    const navigation = row.performance.navigation ?? {};
    const fcp = row.performance.paints["first-contentful-paint"];
    return `| ${row.viewport} | ${row.httpStatus ?? "—"} | ${row.loadMs} ms | ${Math.round(navigation.domContentLoadedEventEnd ?? 0)} ms | ${Math.round(navigation.loadEventEnd ?? 0)} ms | ${fcp ? `${Math.round(fcp)} ms` : "—"} | ${row.indexedDb.supported ? `可用（${row.indexedDb.databases.join("、") || "初始为空"}）` : "不可用"} |`;
  }),
  "",
  `- 控制台错误：${consoleErrors.length}`,
  `- 控制台警告：${consoleWarnings.length}`,
  `- 请求失败：${failedRequests.length}`,
  `- HTTP 4xx/5xx：${uniqueResources.filter((resource) => resource.status >= 400).length}`,
  `- MIME 类型错误：${mimeErrors.length}`,
  `- GitHub Pages base 逃逸请求：${escapedBasePath.length}`,
  `- Windows 本地绝对路径：${windowsAbsolutePaths.length}`,
  `- IndexedDB 错误：${consoleErrors.filter((row) => /indexeddb/i.test(row.text)).length}`,
  `- 字体加载错误：${resourceReport.summary.fontErrors}`,
  `- 图片加载错误：${resourceReport.summary.imageErrors + resourceReport.summary.brokenImages}`,
  `- 音频/视频加载错误：${resourceReport.summary.audioVideoErrors}`,
  `- JSON 加载错误：${resourceReport.summary.jsonErrors}`,
  ""
].join("\n");

await writeFile(path.join(reportRoot, "performance-summary.md"), performanceMarkdown, "utf8");
await writeFile(path.join(reportRoot, `performance-summary-${phase}.md`), performanceMarkdown, "utf8");

console.log(JSON.stringify({
  phase,
  baseUrl,
  screenshots: screenshotRoot,
  viewports: performanceRows,
  consoleErrors: consoleErrors.length,
  consoleWarnings: consoleWarnings.length,
  failedRequests: failedRequests.length,
  resources: uniqueResources.length,
  resourceSummary: resourceReport.summary
}, null, 2));
