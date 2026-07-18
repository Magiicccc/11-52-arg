import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { testEntryUrl } from "./entry-url";

const visualRoot = path.resolve("test-results", "visual", "platforms");
const apps = [
  ["app.xiaohongshu", "xiaohongshu", ".xhs-app"],
  ["app.douyin", "douyin", ".douyin-app"],
  ["app.toutiao", "toutiao", ".toutiao-app"],
  ["app.qqmail", "qqmail", ".qqmail-app"],
  ["app.baidunetdisk", "baidunetdisk", ".netdisk-app"],
  ["app.alipay", "alipay", ".alipay-app"],
  ["app.didi", "didi", ".didi-app"],
  ["app.meituan", "meituan", ".meituan-app"],
  ["app.taobao", "taobao", ".taobao-app"]
] as const;

function withoutQa(url: string): string {
  if (/^https?:\/\//.test(url)) {
    const parsed = new URL(url);
    parsed.searchParams.delete("qa");
    return parsed.toString();
  }
  return url.split("?")[0] || "/";
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(visualRoot, `${name}-${page.viewportSize()?.width ?? "unknown"}.png`),
    animations: "disabled"
  });
}

test.beforeAll(() => mkdirSync(visualRoot, { recursive: true }));

test("supporting platform apps use distinct shells and real detail transitions", async ({ page }) => {
  await page.goto(withoutQa(testEntryUrl));
  await expect(page.getByTestId("home-screen")).toBeVisible();

  for (const [appId, slug, root] of apps) {
    const icon = page.getByTestId(`app-${appId}`);
    await icon.scrollIntoViewIfNeeded();
    await icon.click();
    await expect(page.locator(root)).toBeVisible();
    await expect(page.locator(".generic-app")).toHaveCount(0);
    await expect(page.locator(".platform-bottom-nav")).toBeVisible();
    await screenshot(page, `${slug}-home`);

    const action = page.getByTestId("app-effective-action");
    await expect(action).toBeVisible();
    await action.click();
    if (slug !== "douyin") {
      await expect(page.locator(".platform-detail-header")).toBeVisible();
      await screenshot(page, `${slug}-detail`);
    }

    await page.getByTestId("app-back").click();
    await expect(page.getByTestId("home-screen")).toBeVisible();

    await icon.scrollIntoViewIfNeeded();
    await icon.click();
    await expect(page.locator(root)).toBeVisible();
    await expect(page.locator(".generic-app")).toHaveCount(0);
    await page.getByTestId("app-back").click();
    await expect(page.getByTestId("home-screen")).toBeVisible();
  }
});
