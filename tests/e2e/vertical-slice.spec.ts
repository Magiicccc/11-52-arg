import { test, expect, type Page } from "@playwright/test";

async function unlock(page:Page){
  await page.getByTestId("switch-investigation").click();
  await page.getByTestId("lock-call-chenyu").click();
  await expect(page.getByTestId("chenyu-lock-reply")).toBeVisible();
  await page.getByRole("button",{name:"结束通话"}).click();
  await page.getByTestId("open-passcode").click();
  for(const digit of "230917") await page.getByTestId(`key-${digit}`).click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
}

async function closeApp(page:Page){
  await page.getByTestId("app-back").click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
}

test.beforeEach(async ({page})=>{ await page.goto("/"); });

test("P00-A2-11 complete vertical slice is reachable and persists", async ({page})=>{
  await unlock(page);

  // A1: owner identity, family voice, cross-app search and fourth face.
  await page.getByTestId("app-app.settings").click();
  await page.getByTestId("inspect-owner").click();
  await closeApp(page);

  await page.getByTestId("app-app.wechat").click();
  await page.getByTestId("thread-妈").click();
  await page.getByTestId("voice-shenchuan-name").click();
  await page.getByTestId("wechat-conversations").click();
  await page.getByTestId("wechat-search-input").fill("沈川");
  await page.getByTestId("wechat-search-submit").click();
  await expect(page.getByTestId("wechat-search-results")).toContainText("Shen’s iPhone");
  await closeApp(page);

  await page.getByTestId("app-app.photos").click();
  await page.getByTestId("photo-photo.shenchuan.group.01").click();
  await page.getByTestId("inspect-photo-face").click();
  await closeApp(page);

  await page.getByTestId("app-app.wechat").click();
  await page.getByTestId("thread-陈屿").click();
  await page.getByTestId("share-photo-chenyu").click();
  await expect(page.getByTestId("message-message.chenyu.photo_reaction")).toBeVisible();
  await closeApp(page);

  // A2: search, floor 417, deleted page, cache, Morse guide and frame.
  await page.getByTestId("app-app.safari").click();
  await page.getByTestId("safari-search-input").fill("潘博文");
  await page.getByTestId("safari-search-submit").click();
  await expect(page.getByTestId("safari-results")).toBeVisible();
  await closeApp(page);

  await page.getByTestId("app-app.tieba").click();
  await page.getByTestId("inspect-floor-417").click();
  await closeApp(page);

  await page.getByTestId("app-app.safari").click();
  await page.getByTestId("safari-search-input").fill("潘博文");
  await page.getByTestId("safari-search-submit").click();
  await page.getByTestId("open-deleted-answer").click();
  await expect(page.getByTestId("deleted-answer")).toBeVisible();
  await page.getByTestId("open-cache-417").click();
  await expect(page.getByTestId("cache-417")).toBeVisible();
  await page.getByTestId("open-morse-guide").click();
  await expect(page.getByTestId("morse-guide")).toBeVisible();
  await page.getByRole("button",{name:"返回缓存页"}).click();
  await page.getByTestId("morse-answer").fill("FRAME 417");
  await page.getByTestId("submit-morse-answer").click();
  await page.getByTestId("inspect-frame-417").click();
  await closeApp(page);

  // A2-09 to A2-11: note correction, remnant and released file.
  await page.getByTestId("app-app.notes").click();
  await page.getByTestId("note-note.validation.07").click();
  await page.getByTestId("read-note-to-end").click();
  await page.getByRole("button",{name:"完成"}).click();
  await page.getByTestId("note-notification.note.remnant.content").click();
  await page.getByTestId("open-note-remnant").click();
  await closeApp(page);

  await page.getByTestId("app-app.files").click();
  await page.getByTestId("file-file.417_index").click();
  await expect(page.locator(".json-file")).toContainText("417");
  await expect(page.getByTestId("current-scene")).toContainText("A2-11");

  await page.reload();
  await expect(page.getByTestId("current-scene")).toContainText("A2-11");
  await expect(page.locator(".json-file")).toContainText("417");
});
