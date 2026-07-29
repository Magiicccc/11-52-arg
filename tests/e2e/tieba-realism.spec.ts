import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { testEntryUrl } from "./entry-url";

const visualRoot = path.join("test-results", "full-realism", "after", "tieba");

test.beforeEach(async ({ page }) => {
  await page.goto(testEntryUrl);
  await page.getByTestId("app-app.tieba").click();
  await expect(page.getByTestId("tieba-home")).toBeVisible();
});

test("贴吧具有真实首页、吧页、搜索、帖子、用户和缓存楼层路径", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await mkdir(visualRoot, { recursive: true });
  const viewport = testInfo.project.name.replace("chromium-", "");

  await expect(page.locator(".tieba-post-card")).toHaveCount(13);
  await expect(page.locator(".tieba-followed-strip button")).toHaveCount(5);
  await page.screenshot({ path: path.join(visualRoot, `home-${viewport}.png`) });

  await page.getByRole("button", { name: "进吧" }).click();
  await expect(page.locator(".tieba-bar-hero")).toContainText("杭州吧");
  await page.getByRole("button", { name: "精品" }).click();
  await expect(page.getByRole("button", { name: "精品" })).toHaveClass(/active/);

  await page.getByRole("button", { name: "搜索贴吧" }).click();
  await page.getByPlaceholder("搜索帖子、吧或用户").fill("旧网页缓存");
  await expect(page.locator(".tieba-search-results")).toContainText("旧帖存档对比");
  await page.getByText("旧帖存档对比：页面缺失前后的缓存差异", { exact: true }).click();
  await expect(page.getByTestId("inspect-floor-417")).toContainText("不是三个人。数视频帧。");
  await page.screenshot({ path: path.join(visualRoot, `archive-thread-${viewport}.png`) });
  await page.getByTestId("inspect-floor-417").click();

  await page.getByTestId("app-back").click();
  await page.getByTestId("app-back").click();
  await expect(page.getByTestId("tieba-home")).toBeVisible();
  await page.locator(".tieba-post-card").filter({ hasText: "今天傍晚这阵雨来得也太快了" }).getByRole("button").first().click();
  await expect(page.locator(".tieba-thread-op")).toContainText("今天傍晚这阵雨来得也太快了");
  await expect(page.locator(".tieba-thread-op > p")).toHaveCount(4);
  await expect(page.locator(".tieba-thread-op")).toContainText("晚高峰也多留一点换乘时间");
  await expect(page.locator(".tieba-thread-op")).toContainText("不要为了赶几分钟直接穿过看不清底的水面");
  await page.getByPlaceholder("说点什么…").fill("雨停以后路面还是很滑，大家慢一点。");
  await page.getByRole("button", { name: "收藏帖子" }).click();
  await page.getByRole("button", { name: "发送" }).click();
  await expect(page.locator(".tieba-reply.mine")).toContainText("雨停以后路面还是很滑");
  await page.screenshot({ path: path.join(visualRoot, `ordinary-thread-${viewport}.png`) });

  await page.reload();
  await expect(page.getByTestId("tieba-thread")).toBeVisible();
  await expect(page.locator(".tieba-reply.mine")).toContainText("雨停以后路面还是很滑");
  await expect(page.getByRole("button", { name: "取消收藏" })).toBeVisible();

  await page.locator(".tieba-user-line").click();
  await expect(page.getByTestId("tieba-user")).toBeVisible();
  await expect(page.locator(".tieba-user-hero img")).toHaveJSProperty("complete", true);
  await page.screenshot({ path: path.join(visualRoot, `user-${viewport}.png`) });
  expect(consoleErrors.filter((message) => /button.*descendant|nested <button>/i.test(message))).toEqual([]);
});
