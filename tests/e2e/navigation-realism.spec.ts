import { expect, test } from "@playwright/test";
import { testEntryUrl } from "./entry-url";

test.beforeEach(async ({ page }) => {
  await page.goto(testEntryUrl);
});

test("微信聊天返回微信主页，特殊联系人具有连续的日常对话", async ({ page }) => {
  await page.getByTestId("app-app.wechat").click();
  await page.getByTestId("thread-妈妈").click();
  expect(await page.locator(".chat-thread .bubble").count()).toBeGreaterThanOrEqual(6);
  await page.getByTestId("app-back").click();
  await expect(page.getByTestId("wechat-home")).toBeVisible();
  await expect(page.getByTestId("home-screen")).not.toBeVisible();
  await page.getByTestId("thread-阿序").click();
  expect(await page.locator(".chat-thread .bubble").count()).toBeGreaterThanOrEqual(6);
  await page.getByTestId("home-indicator").click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
});

test("百度地图显示当前位置并可以重新定位", async ({ page }) => {
  await page.getByTestId("app-app.baidu_map").click();
  await expect(page.getByTestId("map-locate-current")).toBeVisible();
  await expect(page.locator(".map-current-location")).toBeVisible();
  await page.getByTestId("map-locate-current").click();
  await expect(page.locator(".map-inline-notice")).toContainText("已回到当前位置");
});

test("知乎与头条长文正文中含有语义匹配的行间配图", async ({ page }) => {
  await page.getByTestId("app-app.zhihu").click();
  await page.locator(".zhihu-question-card > button").first().click();
  await expect(page.locator(".zhihu-answer .platform-inline-figure img")).toBeVisible();
  await page.getByTestId("home-indicator").click();

  await page.getByTestId("app-app.toutiao").click();
  await page.locator(".toutiao-card").first().click();
  await expect(page.locator(".toutiao-article .platform-inline-figure img")).toBeVisible();
});
