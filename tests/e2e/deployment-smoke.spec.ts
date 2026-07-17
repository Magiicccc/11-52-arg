import { test, expect, type Page } from "@playwright/test";
import { testEntryUrl } from "./entry-url";

async function unlockInvestigationPhone(page: Page) {
  await page.getByTestId("switch-investigation").click();
  await page.getByTestId("lock-call-chenyu").click();
  await page.getByRole("button", { name: "结束通话" }).click();
  await page.getByTestId("open-passcode").click();
  for (const digit of "230917") await page.getByTestId(`key-${digit}`).click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
}

test("deployment entry, assets, IndexedDB, and refresh recovery", async ({ page }) => {
  const missingResources: string[] = [];
  page.on("response", (response) => {
    if (response.status() === 404) missingResources.push(response.url());
  });

  await page.goto(testEntryUrl);
  await expect(page.getByTestId("phone-player")).toBeVisible();

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBeTruthy();
  const manifestUrl = new URL(manifestHref!, page.url());
  const manifestResponse = await page.request.get(manifestUrl.href);
  expect(manifestResponse.ok()).toBeTruthy();

  await unlockInvestigationPhone(page);
  await expect(page.getByTestId("current-scene")).toContainText("P03");
  await expect.poll(async () => page.locator("img").evaluateAll(
    (images) => images.filter((image) => {
      const renderedImage = image as HTMLImageElement;
      return !renderedImage.complete || renderedImage.naturalWidth === 0;
    }).length
  )).toBe(0);

  await expect.poll(async () => page.evaluate(async () => {
    const databases = await indexedDB.databases();
    return databases.some((database) => database.name === "11-52-save");
  })).toBeTruthy();

  const loadedUrls = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  const loadedPaths = loadedUrls.map((url) => new URL(url).pathname);
  expect(loadedPaths.some((path) => path.endsWith(".js") || path.endsWith("/src/main.tsx"))).toBeTruthy();
  expect(loadedPaths.some((path) => path.endsWith(".css"))).toBeTruthy();
  expect(loadedUrls.some((url) => url.includes("/icons/"))).toBeTruthy();
  expect(loadedUrls.every((url) => !/^[A-Za-z]:[\\/]/.test(url) && !/^file:\/\/\/[A-Za-z]:/i.test(url))).toBeTruthy();

  if (process.env.PLAYWRIGHT_BASE_URL || process.env.PLAYWRIGHT_LOCAL_PAGES_BASE_PATH) {
    const entryPath = new URL(testEntryUrl).pathname;
    const entryOrigin = new URL(testEntryUrl).origin;
    const sameOriginAssets = loadedUrls
      .map((url) => new URL(url))
      .filter((url) => url.origin === entryOrigin && /\.(?:js|css|png|webp|svg)$/.test(url.pathname));
    expect(sameOriginAssets.every((url) => url.pathname.startsWith(entryPath))).toBeTruthy();
    const serviceWorkerScope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
    expect(new URL(serviceWorkerScope).pathname).toBe(entryPath);
  }

  await page.reload();
  await expect(page.getByTestId("home-screen")).toBeVisible();
  await expect(page.getByTestId("current-scene")).toContainText("P03");
  expect(missingResources).toEqual([]);
});
