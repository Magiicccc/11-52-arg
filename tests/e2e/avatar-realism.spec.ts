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

  await page.locator(".list-row").first().click();
  await expect(page.locator(".wechat-chat-with-avatars")).toBeVisible();
  const avatarVariables = await page.locator(".wechat-chat-with-avatars").evaluate((node) => ({
    peer: getComputedStyle(node).getPropertyValue("--wechat-peer-avatar"),
    self: getComputedStyle(node).getPropertyValue("--wechat-self-avatar")
  }));
  expect(avatarVariables.peer).toContain("generated-avatar-");
  expect(avatarVariables.self).toContain("generated-avatar-121.svg");
  await page.getByTestId("wechat-conversations").click();
  await page.getByTestId("app-back").click();

  await openApp(page, "app.xiaohongshu");
  await expectLoadedImages(page, "img.xhs-feed-avatar", 12);
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
  await expectLoadedImages(page, ".tieba-author img", 1);
});
