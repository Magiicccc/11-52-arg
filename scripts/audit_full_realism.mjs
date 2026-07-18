import { chromium } from "@playwright/test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.LIVE_SITE_URL ?? "https://magiicccc.github.io/11-52-arg/";
const phase = process.env.REALISM_PHASE ?? "before";
const deployedCommit = process.env.DEPLOYED_COMMIT ?? "unknown";
const workflowRun = process.env.DEPLOYED_WORKFLOW ?? "unknown";
const outputRoot = path.resolve("test-results", "full-realism", phase);
const qaRoot = path.resolve("docs", "qa", "full-realism", "runtime");
const viewports = [
  { name: "402x874", width: 402, height: 874 },
  { name: "440x956", width: 440, height: 956 },
  { name: "1440x1000", width: 1440, height: 1000 }
];
const apps = [
  ["app.wechat", "wechat"],
  ["app.photos", "photos"],
  ["app.safari", "safari"],
  ["app.baidu_map", "baidu-map"],
  ["app.phone", "phone"],
  ["app.files", "files"],
  ["app.notes", "notes"],
  ["app.calendar", "calendar"],
  ["app.settings", "settings"],
  ["app.xiaohongshu", "xiaohongshu"],
  ["app.douyin", "douyin"],
  ["app.zhihu", "zhihu"],
  ["app.tieba", "tieba"],
  ["app.toutiao", "toutiao"],
  ["app.qqmail", "qqmail"],
  ["app.baidunetdisk", "baidu-netdisk"],
  ["app.alipay", "alipay"],
  ["app.didi", "didi"],
  ["app.meituan", "meituan"],
  ["app.taobao", "taobao"],
  ["app.netease_music", "netease-music"],
  ["app.wechat_reading", "wechat-reading"],
  ["app.railway12306", "railway-12306"],
  ["app.health", "health"],
  ["app.weather", "weather"],
  ["app.clock", "clock"],
  ["app.calculator", "calculator"],
  ["app.camera", "camera"],
  ["app.voice_memos", "voice-memos"],
  ["app.compass", "compass"]
];

await rm(outputRoot, { recursive: true, force: true });
await Promise.all([mkdir(outputRoot, { recursive: true }), mkdir(qaRoot, { recursive: true })]);

function summarizeState(snapshot) {
  if (!snapshot) return null;
  return {
    revision: snapshot.revision,
    activeDeviceId: snapshot.world?.flags?.activeDeviceId,
    correctionStage: snapshot.world?.correctionStage,
    currentSceneId: snapshot.story?.currentSceneId,
    completedSceneCount: snapshot.story?.completedSceneIds?.length ?? 0,
    checkpoints: snapshot.story?.checkpoints ?? [],
    playerActiveApp: snapshot.devices?.player?.activeAppId ?? null,
    investigationActiveApp: snapshot.devices?.investigation?.activeAppId ?? null
  };
}

async function readSaveSnapshot(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open("11-52-save", 1);
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (!database.objectStoreNames.contains("slots")) {
      database.close();
      return null;
    }
    const transaction = database.transaction("slots", "readonly");
    const getRequest = transaction.objectStore("slots").get("main");
    const envelope = await new Promise((resolve, reject) => {
      getRequest.onsuccess = () => resolve(getRequest.result ?? null);
      getRequest.onerror = () => reject(getRequest.error);
    });
    database.close();
    return envelope?.snapshot ?? null;
  });
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

async function gotoWithRetry(page) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await page.goto(baseUrl, { waitUntil: "load", timeout: 45_000 });
      await page.getByTestId("home-screen").waitFor({ state: "visible", timeout: 15_000 });
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 5) await page.waitForTimeout(Math.min(12_000, 2 ** attempt * 1_000));
    }
  }
  throw lastError;
}

async function waitForAssets(page) {
  await page.locator("img").evaluateAll(async (images) => {
    await Promise.all(images.map(async (image) => {
      if (!image.complete) {
        await Promise.race([
          new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          }),
          new Promise((resolve) => setTimeout(resolve, 4_000))
        ]);
      }
      if (image.naturalWidth > 0 && typeof image.decode === "function") {
        await image.decode().catch(() => undefined);
      }
    }));
  });
}

async function saveShot(page, records, app, stateName, viewport, locator = null) {
  await waitForAssets(page);
  const directory = path.join(outputRoot, app);
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, `${stateName}-${viewport.name}.png`);
  if (locator) {
    await locator.screenshot({ path: file, animations: "disabled" });
  } else {
    await page.screenshot({ path: file, animations: "disabled", fullPage: false });
  }
  records.push({
    app,
    pageState: stateName,
    viewport: viewport.name,
    gameState: summarizeState(await readSaveSnapshot(page)),
    commit: deployedCommit,
    workflowRun,
    capturedAt: new Date().toISOString(),
    url: page.url(),
    file: path.relative(process.cwd(), file).replaceAll("\\", "/")
  });
}

async function setHomePage(page, pageIndex) {
  await page.locator(".home-pages").evaluate((element, index) => {
    element.scrollLeft = element.clientWidth * index;
    element.dispatchEvent(new Event("scroll"));
  }, pageIndex);
  await page.waitForTimeout(120);
}

async function returnHome(page) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (await page.getByTestId("home-screen").isVisible().catch(() => false)) return;
    const back = page.getByTestId("app-back").last();
    if (await back.count()) {
      await back.click({ force: true });
      await page.waitForTimeout(100);
    }
  }
  await page.getByTestId("home-screen").waitFor({ state: "visible", timeout: 10_000 });
}

async function inventoryVisibleControls(page, app, viewport) {
  return page.locator("button, a, input, textarea, select, [role='button'], [tabindex]").evaluateAll(
    (elements, context) => elements
      .filter((element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && box.width > 0 && box.height > 0;
      })
      .map((element, index) => {
        const box = element.getBoundingClientRect();
        return {
          app: context.app,
          viewport: context.viewport,
          ordinal: index,
          tag: element.tagName.toLowerCase(),
          interactionId: element.getAttribute("data-interaction-id"),
          testId: element.getAttribute("data-testid"),
          role: element.getAttribute("role"),
          ariaLabel: element.getAttribute("aria-label"),
          text: (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 120),
          disabled: "disabled" in element ? element.disabled : false,
          bounds: {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height)
          }
        };
      }),
    { app, viewport: viewport.name }
  );
}

async function captureApp(page, records, controls, appId, slug, viewport) {
  const icon = page.getByTestId(`app-${appId}`);
  await icon.evaluate((element) => element.scrollIntoView({ block: "center", inline: "center" }));
  await icon.click({ force: true });
  await page.locator(".app-window").waitFor({ state: "visible", timeout: 10_000 });
  if (appId === "app.baidu_map") {
    await page.getByTestId("maplibre-map").waitFor({ state: "visible", timeout: 10_000 });
    await page.waitForTimeout(900);
  } else {
    await page.waitForTimeout(120);
  }
  await saveShot(page, records, slug, "home", viewport);
  controls.push(...await inventoryVisibleControls(page, slug, viewport));

  const action = page.getByTestId("app-effective-action").first();
  if (await action.count()) {
    await action.click({ force: true });
    await page.waitForTimeout(150);
    await saveShot(page, records, slug, "detail", viewport);
    controls.push(...await inventoryVisibleControls(page, `${slug}:detail`, viewport));
  }
  await returnHome(page);
}

async function switchToInvestigation(page) {
  const viewport = page.viewportSize();
  const y = Math.round(viewport.height / 2);
  const stage = page.locator(".prototype-stage");
  await stage.dispatchEvent("pointerdown", {
    clientX: viewport.width - 12,
    clientY: y,
    pointerId: 1,
    pointerType: "touch"
  });
  await stage.dispatchEvent("pointerup", {
    clientX: viewport.width - 120,
    clientY: y,
    pointerId: 1,
    pointerType: "touch"
  });
  await page.getByTestId("lock-screen").waitFor({ state: "visible", timeout: 10_000 });
}

const browser = await chromium.launch({ headless: true, args: ["--disable-http2"] });
const metadata = [];
const controls = [];
const consoleErrors = [];
const consoleWarnings = [];
const failedRequests = [];
const resourceAudit = [];
const performanceMetrics = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      locale: "zh-CN"
    });
    const page = await context.newPage();
    page.on("console", (message) => {
      const entry = { viewport: viewport.name, type: message.type(), text: message.text(), url: page.url() };
      if (message.type() === "error") consoleErrors.push(entry);
      if (message.type() === "warning") consoleWarnings.push(entry);
    });
    page.on("requestfailed", (request) => failedRequests.push({
      viewport: viewport.name,
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText ?? "unknown"
    }));
    page.on("response", (response) => resourceAudit.push({
      viewport: viewport.name,
      url: response.url(),
      status: response.status(),
      contentType: response.headers()["content-type"] ?? null,
      fromServiceWorker: response.fromServiceWorker()
    }));

    const startedAt = globalThis.performance.now();
    const response = await gotoWithRetry(page);
    await clearSave(page);
    await page.reload({ waitUntil: "load", timeout: 45_000 });
    await page.getByTestId("home-screen").waitFor({ state: "visible", timeout: 15_000 });
    await page.waitForTimeout(300);
    const navTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType("navigation")[0];
      return timing ? {
        domContentLoaded: timing.domContentLoadedEventEnd,
        loadEvent: timing.loadEventEnd,
        transferSize: timing.transferSize,
        decodedBodySize: timing.decodedBodySize
      } : null;
    });
    performanceMetrics.push({
      viewport: viewport.name,
      httpStatus: response?.status() ?? null,
      wallClockMs: Math.round(globalThis.performance.now() - startedAt),
      navigation: navTiming
    });

    const homePageCount = await page.locator(".page-dots i").count();
    for (let pageIndex = 0; pageIndex < homePageCount; pageIndex += 1) {
      await setHomePage(page, pageIndex);
      await saveShot(page, metadata, "system", `player-home-page-${pageIndex + 1}`, viewport);
    }
    await setHomePage(page, 0);
    await saveShot(page, metadata, "system", "player-dock", viewport, page.locator(".home-dock"));
    await saveShot(page, metadata, "system", "status-cellular", viewport, page.locator(".status-bar"));
    controls.push(...await inventoryVisibleControls(page, "system:player-home", viewport));

    for (const [appId, slug] of apps) {
      await captureApp(page, metadata, controls, appId, slug, viewport);
    }

    await switchToInvestigation(page);
    await saveShot(page, metadata, "system", "investigation-lock", viewport);
    await page.getByTestId("open-passcode").click();
    await saveShot(page, metadata, "system", "investigation-passcode", viewport);
    controls.push(...await inventoryVisibleControls(page, "system:passcode", viewport));
    await context.close();
  }
} finally {
  await browser.close();
}

const missingInteractionIds = controls.filter((control) => !control.interactionId);
await Promise.all([
  writeFile(path.join(outputRoot, "capture-metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8"),
  writeFile(path.join(qaRoot, `${phase}-controls.json`), `${JSON.stringify(controls, null, 2)}\n`, "utf8"),
  writeFile(path.join(qaRoot, `${phase}-console-errors.json`), `${JSON.stringify(consoleErrors, null, 2)}\n`, "utf8"),
  writeFile(path.join(qaRoot, `${phase}-console-warnings.json`), `${JSON.stringify(consoleWarnings, null, 2)}\n`, "utf8"),
  writeFile(path.join(qaRoot, `${phase}-failed-requests.json`), `${JSON.stringify(failedRequests, null, 2)}\n`, "utf8"),
  writeFile(path.join(qaRoot, `${phase}-resource-audit.json`), `${JSON.stringify(resourceAudit, null, 2)}\n`, "utf8"),
  writeFile(path.join(qaRoot, `${phase}-performance.json`), `${JSON.stringify(performanceMetrics, null, 2)}\n`, "utf8")
]);

console.log(JSON.stringify({
  phase,
  baseUrl,
  deployedCommit,
  workflowRun,
  screenshots: metadata.length,
  visibleControls: controls.length,
  missingInteractionIds: missingInteractionIds.length,
  consoleErrors: consoleErrors.length,
  consoleWarnings: consoleWarnings.length,
  failedRequests: failedRequests.length,
  badHttpResponses: resourceAudit.filter((entry) => entry.status >= 400).length,
  outputRoot
}, null, 2));
