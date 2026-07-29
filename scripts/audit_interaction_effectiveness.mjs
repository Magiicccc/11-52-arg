import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.LIVE_SITE_URL ?? "http://127.0.0.1:4173/";
const canonicalOutputDir = path.resolve("docs", "qa", "full-realism");
const allApps = [
  "app.wechat", "app.photos", "app.safari", "app.baidu_map", "app.phone", "app.files", "app.notes", "app.calendar",
  "app.settings", "app.xiaohongshu", "app.douyin", "app.zhihu", "app.tieba", "app.toutiao", "app.qqmail",
  "app.baidunetdisk", "app.alipay", "app.didi", "app.meituan", "app.taobao", "app.netease_music", "app.wechat_reading",
  "app.railway12306", "app.health", "app.weather", "app.clock", "app.calculator", "app.camera", "app.voice_memos", "app.compass"
];
const requestedApps = (process.env.AUDIT_APP_IDS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
const apps = requestedApps.length ? allApps.filter((appId) => requestedApps.includes(appId)) : allApps;
const fullAudit = requestedApps.length === 0;
const auditSlug = requestedApps.map((appId) => appId.replace(/^app\./, "").replaceAll(".", "-")).join("__") || "full";
const outputDir = fullAudit
  ? canonicalOutputDir
  : path.join(canonicalOutputDir, "targeted", auditSlug);

if (!apps.length) {
  throw new Error(`No known app IDs selected from AUDIT_APP_IDS=${process.env.AUDIT_APP_IDS ?? ""}`);
}

await mkdir(outputDir, { recursive: true });

async function deleteDatabases(page) {
  await page.evaluate(async () => {
    const databases = await indexedDB.databases();
    await Promise.all(databases.map(({ name }) => name && new Promise((resolve) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    })));
  });
}

async function readEnvelope(page) {
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
    return envelope;
  });
}

async function writeEnvelope(page, envelope) {
  await page.evaluate(async (value) => {
    const request = indexedDB.open("11-52-save", 1);
    const database = await new Promise((resolve, reject) => {
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("slots")) request.result.createObjectStore("slots");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction("slots", "readwrite");
    transaction.objectStore("slots").put(value, "main");
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    database.close();
  }, envelope);
}

function stateSignature(envelope) {
  if (!envelope?.snapshot) return "missing";
  const snapshot = envelope.snapshot;
  const devices = Object.fromEntries(Object.entries(snapshot.devices ?? {}).map(([deviceId, device]) => [
    deviceId,
    {
      activeAppId: device.activeAppId,
      appStack: device.appStack,
      unreadByApp: device.unreadByApp,
      scrollByRoute: device.scrollByRoute,
      networkMode: device.networkMode,
      locked: device.locked
    }
  ]));
  return JSON.stringify({
    flags: snapshot.world?.flags,
    appState: snapshot.apps,
    devices,
    story: {
      currentSceneId: snapshot.story?.currentSceneId,
      completedSceneIds: snapshot.story?.completedSceneIds,
      checkpoints: snapshot.story?.checkpoints
    },
    content: {
      unlockedContentIds: snapshot.content?.unlockedContentIds,
      variants: snapshot.content?.variants
    }
  });
}

async function domSignature(page) {
  return page.evaluate(() => {
    const root = document.querySelector(".app-window") ?? document.body;
    const scrollState = [...root.querySelectorAll("*")]
      .filter((element) => element.scrollTop || element.scrollLeft)
      .map((element) => `${element.tagName}:${element.scrollTop}:${element.scrollLeft}`)
      .join("|");
    const formState = [...root.querySelectorAll("input,textarea,select")]
      .map((element) => {
        if (element instanceof HTMLInputElement) return `${element.value}:${element.checked}`;
        if (element instanceof HTMLTextAreaElement) return element.value;
        if (element instanceof HTMLSelectElement) return element.value;
        return "";
      })
      .join("|");
    const canvasState = [...root.querySelectorAll("canvas")]
      .map((canvas) => {
        try {
          return canvas.toDataURL("image/png");
        } catch {
          return `${canvas.width}x${canvas.height}`;
        }
      })
      .join("|");
    const value = `${root.innerHTML}\n${scrollState}\n${formState}\n${canvasState}`;
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `${hash >>> 0}:${value.length}`;
  });
}

async function returnHome(page) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (await page.getByTestId("home-screen").isVisible().catch(() => false)) return;
    const back = page.getByTestId("app-back").last();
    if (await back.count()) {
      await back.click({ force: true }).catch(() => undefined);
      await page.waitForTimeout(30);
    } else {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    }
  }
  await page.getByTestId("home-screen").waitFor({ state: "visible", timeout: 8_000 });
}

async function openSurface(page, appId, surface) {
  await returnHome(page);
  const icon = page.getByTestId(`app-${appId}`);
  await icon.evaluate((element) => element.scrollIntoView({ block: "center", inline: "center" }));
  await icon.click({ force: true });
  await page.locator(".app-window").waitFor({ state: "visible", timeout: 8_000 });
  if (surface === "detail") {
    const action = page.getByTestId("app-effective-action").first();
    if (!await action.count()) return false;
    await action.click({ force: true });
    await page.waitForTimeout(50);
  }
  return true;
}

async function inventory(page, appId, surface) {
  return page.locator(".app-window button, .app-window a[href], .app-window input, .app-window textarea, .app-window select, .app-window [role='button'], .app-window [tabindex]").evaluateAll(
    (elements, context) => elements.filter((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
    }).map((element) => ({
      appId: context.appId,
      surface: context.surface,
      interactionId: element.getAttribute("data-interaction-id"),
      interactionState: element.getAttribute("data-interaction-state"),
      tag: element.tagName.toLowerCase(),
      type: element.getAttribute("type") ?? "",
      text: (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 100),
      ariaLabel: element.getAttribute("aria-label"),
      disabled: "disabled" in element ? element.disabled : false
    })),
    { appId, surface }
  );
}

const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || undefined,
  args: process.env.PLAYWRIGHT_BROWSER_CHANNEL ? [] : ["--disable-http2"]
});
const results = [];
try {
  for (const appId of apps) {
    const context = await browser.newContext({ viewport: { width: 402, height: 874 }, locale: "zh-CN" });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "load", timeout: 30_000 });
    await deleteDatabases(page);
    await page.reload({ waitUntil: "load", timeout: 30_000 });
    for (const surface of ["home", "detail"]) {
      if (!await openSurface(page, appId, surface)) continue;
      await page.waitForTimeout(appId === "app.baidu_map" ? 700 : 80);
      const controls = await inventory(page, appId, surface);
      await page.waitForTimeout(100);
      const baselineEnvelope = await readEnvelope(page);
      for (const control of controls) {
        if (!control.interactionId) {
          results.push({ ...control, status: "BROKEN", reason: "missing-interaction-id" });
          continue;
        }
        if (control.disabled) {
          results.push({ ...control, status: "DISABLED", reason: "disabled-by-current-state" });
          continue;
        }
        if (baselineEnvelope) {
          await writeEnvelope(page, baselineEnvelope);
          await page.reload({ waitUntil: "load", timeout: 30_000 });
        }
        if (!await openSurface(page, appId, surface)) {
          results.push({ ...control, status: "BROKEN", reason: "surface-could-not-be-restored" });
          continue;
        }
        await page.waitForTimeout(appId === "app.baidu_map" ? 700 : 50);
        const locator = page.locator(`[data-interaction-id="${control.interactionId}"]`).first();
        if (!await locator.count()) {
          results.push({ ...control, status: "BROKEN", reason: "control-could-not-be-restored" });
          continue;
        }
        const beforeEnvelope = await readEnvelope(page);
        const beforeJournal = beforeEnvelope?.journal ?? [];
        const beforeSignature = await domSignature(page);
        let clickError = null;
        let formValueChanged = false;
        try {
          if (control.tag === "input" || control.tag === "textarea") {
            const previousValue = await locator.inputValue();
            const probe = `audit-${Date.now()}`;
            await locator.fill(probe, { force: true, timeout: 4_000 });
            const value = await locator.inputValue();
            if (value !== probe) throw new Error("form-control-did-not-retain-value");
            formValueChanged = value !== previousValue;
          } else if (control.tag === "select") {
            const options = await locator.locator("option").evaluateAll((nodes) => nodes.map((node) => node.value));
            if (!options.length) throw new Error("select-has-no-options");
            const previousValue = await locator.inputValue();
            const nextValue = options.find((value) => value !== previousValue);
            if (nextValue === undefined) throw new Error("select-has-no-alternative-option");
            await locator.selectOption(nextValue);
            formValueChanged = await locator.inputValue() === nextValue;
          } else {
            await locator.click({ force: true, timeout: 4_000 });
          }
          await page.waitForTimeout(120);
        } catch (error) {
          try {
            await locator.evaluate((element) => element.click());
            await page.waitForTimeout(120);
          } catch (fallbackError) {
            clickError = fallbackError instanceof Error ? fallbackError.message : String(fallbackError ?? error);
          }
        }
        let afterSignature = await domSignature(page).catch(() => "navigation");
        let afterEnvelope = await readEnvelope(page).catch(() => null);
        let afterJournal = afterEnvelope?.journal ?? [];
        let newEvents = afterJournal.slice(beforeJournal.length).map((event) => event.type);
        let canonicalEvents = newEvents.filter((type) => type !== "ui.interaction.activated");
        let changedDom = beforeSignature !== afterSignature;
        let changedState = stateSignature(beforeEnvelope) !== stateSignature(afterEnvelope);
        if (!clickError && !formValueChanged && !changedDom && !changedState) {
          try {
            if (control.tag === "input" || control.tag === "textarea") {
              const previousValue = await locator.inputValue();
              const probe = `audit-retry-${Date.now()}`;
              await locator.fill(probe, { force: true });
              formValueChanged = await locator.inputValue() === probe && probe !== previousValue;
            } else if (control.tag === "select") {
              const options = await locator.locator("option").evaluateAll((nodes) => nodes.map((node) => node.value));
              const previousValue = await locator.inputValue();
              const nextValue = options.find((value) => value !== previousValue);
              if (nextValue === undefined) throw new Error("select-has-no-alternative-option");
              await locator.selectOption(nextValue);
              formValueChanged = await locator.inputValue() === nextValue;
            } else {
              await locator.evaluate((element) => element.click());
            }
            await page.waitForTimeout(180);
            afterSignature = await domSignature(page).catch(() => "navigation");
            afterEnvelope = await readEnvelope(page).catch(() => null);
            afterJournal = afterEnvelope?.journal ?? [];
            newEvents = afterJournal.slice(beforeJournal.length).map((event) => event.type);
            canonicalEvents = newEvents.filter((type) => type !== "ui.interaction.activated");
            changedDom = beforeSignature !== afterSignature;
            changedState = stateSignature(beforeEnvelope) !== stateSignature(afterEnvelope);
          } catch (fallbackError) {
            clickError = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          }
        }
        const works = !clickError && (formValueChanged || changedDom);
        results.push({
          ...control,
          status: works ? "WORKS" : "BROKEN",
          reason: clickError
            ? "click-error"
            : formValueChanged
              ? "form-value-change"
              : changedDom
                ? "visible-surface-change"
                : changedState
                  ? "state-only-no-visible-feedback"
                  : canonicalEvents.length
                    ? "event-without-visible-effect"
                    : "no-observable-effect",
          canonicalEvents,
          formValueChanged,
          changedState,
          clickError
        });
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const broken = results.filter((result) => result.status === "BROKEN");
const summary = apps.map((appId) => {
  const appResults = results.filter((result) => result.appId === appId);
  return {
    appId,
    controls: appResults.length,
    works: appResults.filter((result) => result.status === "WORKS").length,
    disabled: appResults.filter((result) => result.status === "DISABLED").length,
    broken: appResults.filter((result) => result.status === "BROKEN").length
  };
});
const missingApps = summary.filter((row) => row.controls === 0).map((row) => row.appId);

const markdown = [
  "# 全站交互有效性审计",
  "",
  `- 地址：${baseUrl}`,
  `- 审计时间：${new Date().toISOString()}`,
  `- 可见控件：${results.length}`,
  `- WORKS：${results.filter((result) => result.status === "WORKS").length}`,
  `- DISABLED：${results.filter((result) => result.status === "DISABLED").length}`,
  `- BROKEN：${broken.length}`,
  `- 审计范围：${fullAudit ? "全部 30 个玩家可见 App" : `定向 ${apps.join(", ")}`}`,
  `- 未覆盖 App：${missingApps.length ? missingApps.join(", ") : "0"}`,
  "",
  "| App | 控件 | WORKS | DISABLED | BROKEN |",
  "| --- | ---: | ---: | ---: | ---: |",
  ...summary.map((row) => `| ${row.appId} | ${row.controls} | ${row.works} | ${row.disabled} | ${row.broken} |`),
  "",
  ...(broken.length ? ["## 未通过控件", "", ...broken.map((item) => `- ${item.appId} / ${item.surface} / ${item.interactionId}: ${item.reason}`)] : ["所有被审计的可见控件均有稳定交互 ID，并产生可见 DOM 变化、规范状态事件或有效表单提交。"])
].join("\n");

await Promise.all([
  writeFile(path.join(outputDir, "interaction-effectiveness.json"), `${JSON.stringify({ baseUrl, capturedAt: new Date().toISOString(), summary, results }, null, 2)}\n`, "utf8"),
  writeFile(path.join(outputDir, "interaction-coverage.json"), `${JSON.stringify({ baseUrl, capturedAt: new Date().toISOString(), summary, results }, null, 2)}\n`, "utf8"),
  writeFile(path.join(outputDir, "INTERACTION_EFFECTIVENESS.md"), `${markdown}\n`, "utf8"),
  writeFile(path.join(outputDir, "INTERACTION_COVERAGE.md"), `${markdown.replace("# 全站交互有效性审计", "# 全站交互覆盖门禁")}\n`, "utf8")
]);

console.log(JSON.stringify({
  baseUrl,
  scope: fullAudit ? "full" : "targeted",
  apps: apps.length,
  controls: results.length,
  broken: broken.length,
  disabled: results.filter((result) => result.status === "DISABLED").length,
  missingApps,
  outputDir
}, null, 2));
if (broken.length || (fullAudit && missingApps.length)) process.exitCode = 1;
