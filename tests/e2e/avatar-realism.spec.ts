import { expect, test, type Page } from "@playwright/test";
import { testEntryUrl } from "./entry-url";

async function openApp(page: Page, appId: string) {
  const icon = page.getByTestId(`app-${appId}`);
  await icon.scrollIntoViewIfNeeded();
  await icon.click();
  await expect(page.locator(".app-window")).toBeVisible();
}

async function expectLoadedImages(page: Page, selector: string, minimum: number) {
  const images = page.locator(selector);
  await expect.poll(() => images.count()).toBeGreaterThanOrEqual(minimum);
  await expect.poll(() => images.evaluateAll((nodes) => nodes.every((node) => {
    const image = node as HTMLImageElement;
    return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  })), { timeout: 15_000 }).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.goto(testEntryUrl);
  await expect(page.getByTestId("home-screen")).toBeVisible();
});

test("communication and social apps use loaded custom avatar images", async ({ page }) => {
  await openApp(page, "app.wechat");
  await expectLoadedImages(page, ".list-row img.avatar", 15);
  const sources = await page.locator(".list-row img.avatar").evaluateAll((nodes) => nodes.map((node) => (node as HTMLImageElement).src));
  expect(new Set(sources).size).toBe(sources.length);
  expect(sources.every((source) => !source.includes("generated-avatar-"))).toBe(true);

  await page.locator(".list-row").first().click();
  await expect(page.locator(".wechat-chat-with-avatars")).toBeVisible();
  const avatarVariables = await page.locator(".wechat-chat-with-avatars").evaluate((node) => ({
    peer: getComputedStyle(node).getPropertyValue("--wechat-peer-avatar"),
    self: getComputedStyle(node).getPropertyValue("--wechat-self-avatar")
  }));
  expect(avatarVariables.peer).not.toContain("generated-avatar-");
  expect(avatarVariables.self).not.toContain("generated-avatar-");
  expect(avatarVariables.self).toContain("/daily/");
  await page.getByTestId("wechat-conversations").click();
  await page.getByTestId("app-back").click();

  await openApp(page, "app.xiaohongshu");
  await expectLoadedImages(page, "img.xhs-feed-avatar", 24);
  const xhsSources = await page.locator("img.xhs-feed-avatar").evaluateAll((nodes) => nodes.slice(0, 24).map((node) => (node as HTMLImageElement).src));
  expect(new Set(xhsSources).size).toBe(24);
  expect(xhsSources.every((source) => source.includes("/avatars/realistic/"))).toBe(true);
  const viewportWidth = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `test-results/full-realism/avatar-realistic-xhs/xhs-home-${viewportWidth}.png` });
  await page.locator(".xhs-card").nth(12).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/full-realism/avatar-realistic-xhs/xhs-home-lower-${viewportWidth}.png` });
  await page.locator(".xhs-card").first().click();
  await expect(page.locator(".xhs-note-detail")).toBeVisible();
  await page.screenshot({ path: `test-results/full-realism/avatar-realistic-xhs/xhs-detail-${viewportWidth}.png` });
  await page.locator(".platform-back").click();
  await page.getByTestId("app-back").click();

  await openApp(page, "app.qqmail");
  await expectLoadedImages(page, ".mail-avatar,.mail-account-image", 2);
  await page.getByTestId("app-back").click();

  await openApp(page, "app.zhihu");
  await expectLoadedImages(page, "img.zhihu-avatar", 8);
});

test("account and passenger surfaces no longer render one-character avatar placeholders", async ({ page }) => {
  await openApp(page, "app.settings");
  await expectLoadedImages(page, ".settings-profile>img.avatar", 1);
  await page.getByTestId("app-back").click();

  await openApp(page, "app.netease_music");
  await expectLoadedImages(page, ".music-profile>img", 1);
  await page.getByTestId("app-back").click();

  await openApp(page, "app.health");
  await expectLoadedImages(page, ".health-head>img", 1);
  await page.getByTestId("app-back").click();

  await openApp(page, "app.tieba");
  await expectLoadedImages(page, ".tieba-post-author img", 1);
});
