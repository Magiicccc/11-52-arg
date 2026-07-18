import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.LIVE_SITE_URL ?? "https://magiicccc.github.io/11-52-arg/";
const phase = process.env.UI_PASS_2_PHASE ?? "before";
const deployedCommit = process.env.DEPLOYED_COMMIT ?? "unknown";
const workflowRun = process.env.DEPLOYED_WORKFLOW ?? "unknown";
const outputRoot = path.resolve("test-results", "ui-pass-2", phase);
const viewports = [
  { name: "402x874", width: 402, height: 874 },
  { name: "440x956", width: 440, height: 956 }
];
const appIds = [
  "app.wechat", "app.photos", "app.safari", "app.baidu_map", "app.phone",
  "app.files", "app.notes", "app.calendar", "app.settings", "app.xiaohongshu",
  "app.douyin", "app.zhihu", "app.tieba", "app.toutiao", "app.qqmail",
  "app.baidunetdisk", "app.alipay", "app.didi", "app.meituan", "app.taobao",
  "app.netease_music", "app.wechat_reading", "app.railway12306", "app.health",
  "app.weather", "app.clock", "app.calculator", "app.camera", "app.voice_memos",
  "app.compass"
];

await mkdir(outputRoot, { recursive: true });

function slug(appId) {
  return appId.replace(/^app\./, "").replaceAll("_", "-");
}

async function gotoWithRetry(page, url) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await page.goto(url, { waitUntil: "load", timeout: 45_000 });
      await page.getByTestId("home-screen").waitFor({ state: "visible", timeout: 10_000 });
      const styled = await page.locator(".prototype-stage").evaluate(
        (element) => getComputedStyle(element).display === "flex"
      );
      if (!styled) throw new Error("Production stylesheet did not apply");
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 5) await page.waitForTimeout(Math.min(12_000, 2 ** attempt * 1_000));
    }
  }
  throw lastError;
}

async function waitForImages(page) {
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

async function shot(page, name, locator = null) {
  await waitForImages(page);
  const targetPath = path.join(outputRoot, `${name}.png`);
  if (locator) {
    await locator.screenshot({ path: targetPath, animations: "disabled" });
  } else {
    await page.screenshot({ path: targetPath, animations: "disabled" });
  }
}

async function setHomePage(page, pageIndex) {
  await page.locator(".home-pages").evaluate((element, index) => {
    element.scrollLeft = element.clientWidth * index;
    element.dispatchEvent(new Event("scroll"));
  }, pageIndex);
  await page.waitForTimeout(100);
}

async function returnHome(page) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await page.getByTestId("home-screen").isVisible()) return;
    await page.getByTestId("app-back").click();
  }
  await page.getByTestId("home-screen").waitFor({ state: "visible" });
}

async function captureApp(page, appId, viewportName) {
  const icon = page.getByTestId(`app-${appId}`);
  await icon.scrollIntoViewIfNeeded();
  await icon.click();
  await page.locator(".app-window").waitFor({ state: "visible" });
  await shot(page, `${slug(appId)}-home-${viewportName}`);

  const action = page.getByTestId("app-effective-action").first();
  if (await action.count()) {
    await action.click();
    await page.waitForTimeout(120);
    await shot(page, `${slug(appId)}-detail-${viewportName}`);
  }
  await returnHome(page);
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

async function switchToInvestigation(page) {
  const viewport = page.viewportSize();
  const y = Math.round(viewport.height / 2);
  const stage = page.locator(".prototype-stage");
  await stage.dispatchEvent("pointerdown", {
    clientX: viewport.width - 12, clientY: y, pointerId: 1, pointerType: "touch"
  });
  await stage.dispatchEvent("pointerup", {
    clientX: viewport.width - 120, clientY: y, pointerId: 1, pointerType: "touch"
  });
  await page.getByTestId("lock-screen").waitFor({ state: "visible" });
}

async function unlockInvestigation(page) {
  await page.getByTestId("lock-call-chenyu").click();
  await page.getByRole("button", { name: "结束通话" }).click();
  await page.getByTestId("open-passcode").click();
  for (const digit of "230917") await page.getByTestId(`key-${digit}`).click();
  await page.getByTestId("home-screen").waitFor({ state: "visible" });
}

const browser = await chromium.launch({ headless: true, args: ["--disable-http2"] });
const metadata = {
  schemaVersion: 1,
  phase,
  baseUrl,
  deployedCommit,
  workflowRun,
  capturedAt: new Date().toISOString(),
  viewports: []
};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      locale: "zh-CN"
    });
    const page = await context.newPage();
    const response = await gotoWithRetry(page, baseUrl);
    await clearSave(page);
    await page.reload({ waitUntil: "load" });
    await page.getByTestId("home-screen").waitFor({ state: "visible" });
    await page.waitForTimeout(300);

    const snapshot = await readSaveSnapshot(page);
    metadata.viewports.push({
      viewport: viewport.name,
      httpStatus: response?.status() ?? null,
      capturedAt: new Date().toISOString(),
      gameState: snapshot
    });

    for (let pageIndex = 0; pageIndex < 3; pageIndex += 1) {
      await setHomePage(page, pageIndex);
      await shot(page, `player-home-page${pageIndex + 1}-${viewport.name}`);
    }
    await setHomePage(page, 0);
    await shot(page, `player-dock-${viewport.name}`, page.locator(".home-dock"));
    await shot(page, `status-cellular-${viewport.name}`, page.locator(".status-bar"));

    for (const appId of appIds) {
      await captureApp(page, appId, viewport.name);
    }

    await switchToInvestigation(page);
    await shot(page, `investigation-lock-${viewport.name}`);
    await unlockInvestigation(page);
    await shot(page, `status-airplane-${viewport.name}`, page.locator(".status-bar"));
    for (let pageIndex = 0; pageIndex < 3; pageIndex += 1) {
      await setHomePage(page, pageIndex);
      await shot(page, `investigation-home-page${pageIndex + 1}-${viewport.name}`);
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(
  path.join(outputRoot, "capture-metadata.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
  "utf8"
);

console.log(JSON.stringify({
  phase,
  outputRoot,
  deployedCommit,
  workflowRun,
  screenshots: (await import("node:fs")).readdirSync(outputRoot).filter((name) => name.endsWith(".png")).length
}, null, 2));
