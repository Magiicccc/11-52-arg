import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { testEntryUrl } from "./entry-url";

const visualRoot = path.resolve("test-results", "visual", "xiaohongshu");

function withoutQa(url: string): string {
  if (/^https?:\/\//.test(url)) {
    const parsed = new URL(url);
    parsed.searchParams.delete("qa");
    return parsed.toString();
  }
  return url.split("?")[0] || "/";
}

async function openXhs(page: Page) {
  await page.goto(withoutQa(testEntryUrl));
  await expect(page.getByTestId("home-screen")).toBeVisible();
  await page.getByTestId("app-app.xiaohongshu").scrollIntoViewIfNeeded();
  await page.getByTestId("app-app.xiaohongshu").click();
  await expect(page.getByTestId("xiaohongshu-home")).toBeVisible();
}

async function shot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(visualRoot, `${name}-${page.viewportSize()?.width ?? "unknown"}.png`),
    animations: "disabled"
  });
}

test.beforeAll(() => mkdirSync(visualRoot, { recursive: true }));

test("小红书普通笔记具有完整正文、独立评论和真实筛选反馈", async ({ page }) => {
  await openXhs(page);
  expect(await page.locator(".xhs-card").count()).toBeGreaterThanOrEqual(24);

  await page.locator(".xhs-topic-tabs").getByRole("button", { name: "美食" }).click();
  await expect(page.locator(".xhs-topic-tabs").getByRole("button", { name: "美食" })).toHaveClass(/active/);
  await expect(page.locator(".xhs-card")).toHaveCount(3);

  await page.locator(".xhs-topic-tabs").getByRole("button", { name: "推荐" }).click();
  await page.locator(".xhs-card").first().click();
  await expect(page.locator(".xhs-note-detail > p")).toHaveCount(4);
  await expect(page.locator(".xhs-note-detail")).toContainText("这个下午就算完整结束了");
  await expect(page.locator(".xhs-comments article")).toHaveCount(3);
  await expect(page.locator(".xhs-comments article").nth(0)).not.toHaveText(
    await page.locator(".xhs-comments article").nth(1).innerText()
  );
  await shot(page, "long-form-detail");
});

test("小红书关注、购物、消息和个人分区都产生可见且可恢复的状态", async ({ page }) => {
  await openXhs(page);

  await page.locator(".xhs-home-header nav").getByRole("button", { name: "关注" }).click();
  await expect(page.locator(".xhs-following-empty")).toBeVisible();
  await page.locator(".xhs-following-empty > button").first().click();
  await expect(page.locator(".xhs-following-empty")).toHaveCount(0);
  await expect(page.locator(".xhs-card")).toHaveCount(1);

  await page.locator(".platform-bottom-nav").getByRole("button", { name: "购物" }).click();
  await expect(page.getByTestId("xiaohongshu-购物")).toBeVisible();
  await page.locator(".xhs-store-categories").getByRole("button", { name: "摄影" }).click();
  await expect(page.locator(".xhs-store-categories").getByRole("button", { name: "摄影" })).toHaveClass(/active/);
  await page.locator(".xhs-store-grid > button").first().click();
  await expect(page.locator(".xhs-product-detail")).toBeVisible();
  const cartButton=page.locator(".xhs-product-actions").getByRole("button", { name: "切换购物车状态" });
  await expect(cartButton).toHaveText("加入购物车");
  await cartButton.click();
  await expect(cartButton).toHaveText("已加入购物车");
  await page.locator(".platform-back").click();
  await expect(page.locator(".xhs-store-grid")).toContainText("已在购物车");

  await page.reload();
  await expect(page.getByTestId("xiaohongshu-购物")).toBeVisible();
  await expect(page.locator(".xhs-store-categories").getByRole("button", { name: "摄影" })).toHaveClass(/active/);
  await expect(page.locator(".xhs-store-grid")).toContainText("已在购物车");

  await page.locator(".platform-bottom-nav").getByRole("button", { name: "消息" }).click();
  await page.locator(".xhs-message-shortcuts").getByRole("button", { name: "评论和@" }).click();
  await expect(page.locator(".xhs-simple-header")).toContainText("评论和@");
  await expect(page.locator(".xhs-message-list")).toContainText("回复了你的一条评论");

  await page.locator(".platform-bottom-nav").getByRole("button", { name: "我" }).click();
  await page.locator(".xhs-me-tabs").getByRole("button", { name: "收藏" }).click();
  await expect(page.locator(".xhs-me-tabs").getByRole("button", { name: "收藏" })).toHaveClass(/active/);
  await expect(page.locator(".xhs-me-summary")).toContainText("收藏");
  await shot(page, "ecosystem-state");
});

test("小红书发布草稿与资料编辑提供可见反馈并持久化", async ({ page }) => {
  await openXhs(page);
  await page.locator(".platform-bottom-nav").getByRole("button", { name: "发布" }).click();
  await page.locator(".xhs-publish-media").click();
  await expect(page.locator(".xhs-publish-media img")).toBeVisible();
  await page.locator(".xhs-publish-editor > input").fill("雨后散步记录");
  await page.locator(".xhs-publish-editor > textarea").fill("雨停以后从地铁站多走了一个路口，路面还有反光。");
  await page.locator(".xhs-publish-editor").getByRole("button", { name: "保存草稿" }).click();
  await expect(page.getByRole("status")).toHaveText("草稿已保存到本机");

  await page.locator(".platform-bottom-nav").getByRole("button", { name: "我" }).click();
  await page.locator(".xhs-me-tabs").getByRole("button", { name: "草稿" }).click();
  await expect(page.locator(".xhs-draft-list")).toContainText("雨后散步记录");

  await page.locator(".xhs-me-header").getByRole("button", { name: "编辑资料" }).click();
  await page.locator(".xhs-profile-editor input").fill("川流档案室");
  await page.locator(".xhs-profile-editor textarea").fill("记录城市散步、照片和文件整理");
  await page.locator(".xhs-profile-editor").getByRole("button", { name: "保存" }).click();
  await expect(page.locator(".xhs-me-header")).toContainText("川流档案室");
  await expect(page.locator(".xhs-me-header")).toContainText("记录城市散步、照片和文件整理");

  await page.reload();
  await expect(page.locator(".xhs-me-header")).toContainText("川流档案室");
  await expect(page.locator(".xhs-draft-list")).toContainText("雨后散步记录");
});
