import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { testEntryUrl } from "./entry-url";

const visualRoot = path.join("test-results", "full-realism", "after", "wechat");

test.beforeEach(async ({ page }) => {
  await page.goto(testEntryUrl);
  await page.getByTestId("app-app.wechat").click();
  await expect(page.getByTestId("wechat-home")).toBeVisible();
});

test("微信发现、我、通讯录和加号菜单均进入专用二级页并持久化", async ({ page }, testInfo) => {
  await mkdir(visualRoot, { recursive: true });
  const viewport = testInfo.project.name.replace("chromium-", "");

  await page.locator(".wechat-bottom-nav button").filter({ hasText: "发现" }).click();
  await page.locator(".wechat-discover-menu button").filter({ hasText: "朋友圈" }).click();
  await expect(page.getByTestId("wechat-subpage-discover:朋友圈")).toBeVisible();
  await expect(page.locator(".wechat-moments-feed>article")).toHaveCount(12);
  await page.locator(".wechat-moment-actions").first().getByRole("button", { name: "评论" }).click();
  await expect(page.locator(".wechat-moment-comments").first()).toBeVisible();
  await page.locator(".wechat-moment-actions").first().getByRole("button", { name: "赞" }).click();
  await expect(page.locator(".wechat-moment-actions").first()).toContainText("已赞");
  await page.screenshot({ path: path.join(visualRoot, `moments-${viewport}.png`) });

  await page.getByTestId("app-back").click();
  await page.locator(".wechat-bottom-nav button").filter({ hasText: "我" }).click();
  await page.locator(".wechat-me-menu button").filter({ hasText: "服务" }).click();
  await expect(page.getByTestId("wechat-subpage-me:服务")).toContainText("最近账单");
  await page.screenshot({ path: path.join(visualRoot, `services-${viewport}.png`) });
  await page.getByTestId("app-back").click();

  await page.locator(".wechat-me-menu button").filter({ hasText: "收藏" }).click();
  await expect(page.locator(".wechat-favorites>button")).toHaveCount(10);
  await page.getByTestId("app-back").click();
  await page.locator(".wechat-me-menu button").filter({ hasText: "设置" }).click();
  await page.getByRole("button", { name: "新消息通知", exact: true }).click();
  await expect(page.getByRole("button", { name: "新消息通知", exact: true }).locator(".switch")).toHaveClass(/on/);

  await page.reload();
  await expect(page.getByTestId("wechat-subpage-me:设置")).toBeVisible();
  await expect(page.getByRole("button", { name: "新消息通知", exact: true }).locator(".switch")).toHaveClass(/on/);
  await page.getByTestId("app-back").click();

  await page.locator(".wechat-bottom-nav button").filter({ hasText: "微信" }).click();
  await page.getByRole("button", { name: "更多" }).click();
  await page.getByRole("button", { name: "发起群聊", exact: true }).click();
  await expect(page.getByTestId("wechat-subpage-plus:发起群聊")).toBeVisible();
  const checkboxes = page.locator(".wechat-new-group input[type=checkbox]");
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  await page.getByRole("button", { name: "完成（2）" }).click();
  await expect(page.locator(".wechat-action-notice")).toContainText("创建群聊");

  await page.getByTestId("app-back").click();
  await page.locator(".wechat-bottom-nav button").filter({ hasText: "通讯录" }).click();
  await page.locator(".wechat-contact-tools button").filter({ hasText: "群聊" }).click();
  await expect(page.getByTestId("wechat-subpage-contacts:群聊")).toBeVisible();
  await expect(page.locator(".wechat-contact-sublist>button")).toHaveCount(5);
});
