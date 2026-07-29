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

test("Toutiao ordinary cards open complete sourced articles", async ({ page }) => {
  await page.goto(withoutQa(testEntryUrl));
  await page.getByTestId("app-app.toutiao").scrollIntoViewIfNeeded();
  await page.getByTestId("app-app.toutiao").click();
  await expect(page.locator('.toutiao-card[data-content-class="ordinary"]')).toHaveCount(20);
  await expect(page.locator('.toutiao-card[data-content-class="formal"]')).toHaveCount(10);
  await expect(page.locator(".toutiao-card")).toHaveCount(30);
  await page.locator(".toutiao-card").first().click();
  await expect(page.locator(".toutiao-article")).toBeVisible();
  await expect(page.locator(".toutiao-article > p")).toHaveCount(5);
  await expect(page.locator(".toutiao-source")).toHaveText("城市气象服务");
  await expect(page.locator(".toutiao-article")).toContainText("根据实际天气调整路线");
  await screenshot(page, "toutiao-long-form-detail");
});

test("Toutiao early records also open as complete articles instead of title-only shells", async ({ page }) => {
  await page.goto(withoutQa(testEntryUrl));
  await page.getByTestId("app-app.toutiao").scrollIntoViewIfNeeded();
  await page.getByTestId("app-app.toutiao").click();
  await page.getByTestId("toutiao-formal-card").first().click();
  await expect(page.locator(".toutiao-article")).toBeVisible();
  await expect(page.locator(".toutiao-article > p")).toHaveCount(5);
  await expect(page.locator(".toutiao-article")).toContainText("现阶段没有证据支持将近期讨论合并为同一事件");
});

test("early Zhihu and Xiaohongshu records render complete readable bodies", async ({ page }) => {
  await page.goto(withoutQa(testEntryUrl));
  await page.getByTestId("app-app.zhihu").scrollIntoViewIfNeeded();
  await page.getByTestId("app-app.zhihu").click();
  await page.locator(".zhihu-question-card button", { hasText: "网页存档与当前页面为什么会不同" }).click();
  await expect(page.locator(".zhihu-answer > p")).toHaveCount(3);
  await page.getByTestId("zhihu-expand").click();
  await expect(page.locator(".zhihu-answer > p")).toHaveCount(6);
  await expect(page.locator(".zhihu-answer")).toContainText("先保留证据链");
  await screenshot(page, "zhihu-early-complete-detail");
  await page.getByTestId("app-back").click();
  await expect(page.getByTestId("zhihu-home")).toBeVisible();
  await page.getByTestId("app-back").click();

  await page.getByTestId("app-app.xiaohongshu").scrollIntoViewIfNeeded();
  await page.getByTestId("app-app.xiaohongshu").click();
  await page.locator(".xhs-card", { hasText: "桥下咖啡" }).click();
  await expect(page.locator(".xhs-note-detail > p")).toHaveCount(4);
  await expect(page.locator(".xhs-note-detail")).toContainText("会先把文件名改准确");
  await screenshot(page, "xiaohongshu-early-complete-detail");
});

test("QQ Mail ordinary messages include full headers and complete bodies", async ({ page }) => {
  await page.goto(withoutQa(testEntryUrl));
  await page.getByTestId("app-app.qqmail").scrollIntoViewIfNeeded();
  await page.getByTestId("app-app.qqmail").click();
  await page.locator(".mail-row").first().click();
  await expect(page.locator(".mail-detail")).toBeVisible();
  await expect(page.locator(".mail-envelope")).toContainText("收件人");
  await expect(page.locator(".mail-envelope")).toContainText("项目经理");
  await expect(page.locator(".mail-detail > p")).toHaveCount(5);
  await expect(page.locator(".mail-detail")).toContainText("今天 18:00 前回复确认主持人与记录分工");
  await screenshot(page, "qqmail-long-form-detail");
});
