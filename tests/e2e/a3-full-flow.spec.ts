import { test, expect, type Page } from "@playwright/test";
import { testEntryUrl } from "./entry-url";

async function closeApp(page:Page){
  for(let attempt=0;attempt<3&&!await page.getByTestId("home-screen").isVisible();attempt+=1){
    await page.getByTestId("app-back").click();
  }
  await expect(page.getByTestId("home-screen")).toBeVisible();
}

async function reachA2_11(page:Page){
  await page.getByTestId("switch-investigation").click();
  await page.getByTestId("lock-call-chenyu").click();
  await page.getByRole("button",{name:"结束通话"}).click();
  await page.getByTestId("open-passcode").click();
  for(const digit of "230917") await page.getByTestId(`key-${digit}`).click();

  await page.getByTestId("app-app.settings").click();
  await page.getByTestId("inspect-owner").click();
  await closeApp(page);
  await page.getByTestId("app-app.wechat").click();
  await page.getByTestId("thread-妈").click();
  await page.getByTestId("voice-shenchuan-name").click();
  await page.getByTestId("wechat-conversations").click();
  await page.getByTestId("wechat-search-input").fill("沈川");
  await page.getByTestId("wechat-search-submit").click();
  await closeApp(page);
  await page.getByTestId("app-app.photos").click();
  await page.getByTestId("photo-photo.shenchuan.group.01").click();
  await page.getByTestId("inspect-photo-face").click();
  await closeApp(page);
  await page.getByTestId("app-app.wechat").click();
  await page.getByTestId("thread-陈屿").click();
  await page.getByTestId("share-photo-chenyu").click();
  await closeApp(page);

  await page.getByTestId("app-app.safari").click();
  await page.getByTestId("safari-search-input").fill("潘博文");
  await page.getByTestId("safari-search-submit").click();
  await closeApp(page);
  await page.getByTestId("app-app.tieba").click();
  await page.getByTestId("open-archive-thread").click();
  await page.getByTestId("inspect-floor-417").click();
  await closeApp(page);
  await page.getByTestId("app-app.safari").click();
  await page.getByTestId("safari-search-input").fill("潘博文");
  await page.getByTestId("safari-search-submit").click();
  await page.getByTestId("open-deleted-answer").click();
  await page.getByTestId("open-cache-417").click();
  await page.getByTestId("open-morse-guide").click();
  await page.getByRole("button",{name:"返回缓存页"}).click();
  await page.getByTestId("morse-answer").fill("FRAME 417");
  await page.getByTestId("submit-morse-answer").click();
  await page.getByTestId("inspect-frame-417").click();
  await closeApp(page);
  await page.getByTestId("app-app.notes").click();
  await page.getByTestId("note-note.validation.07").click();
  await page.getByTestId("read-note-to-end").click();
  await page.getByRole("button",{name:"完成"}).click();
  await page.getByTestId("note-notification.note.remnant.content").click();
  await page.getByTestId("open-note-remnant").click();
  await closeApp(page);
  await page.getByTestId("app-app.files").click();
  await page.getByTestId("file-file.417_index").click();
  await expect(page.getByTestId("current-scene")).toContainText("A2-11");
}

test.beforeEach(async({page})=>{await page.goto(testEntryUrl);});

test("new save reaches a recoverable A3-10 without exposing the A4 identity reversal",async({page})=>{
  test.setTimeout(240_000);
  await reachA2_11(page);

  await page.getByTestId("start-a3-coordinate").click();
  await expect(page.getByTestId("current-scene")).toContainText("A3-01");
  await page.getByTestId("coordinate-latitude").selectOption("NW01_original_image");
  await page.getByTestId("coordinate-longitude").selectOption("IMG_0612_145237.HEIC");
  await page.getByTestId("coordinate-direction").selectOption("CY_MAP_CACHE_0714");
  await page.getByTestId("submit-coordinate").click();
  await expect(page.getByTestId("coordinate-error")).toBeVisible();
  await page.getByTestId("coordinate-latitude").selectOption("IMG_0612_145237.HEIC");
  await page.getByTestId("coordinate-longitude").selectOption("NW01_original_image");
  await page.getByTestId("submit-coordinate").click();
  await expect(page.getByTestId("coordinate-result")).toContainText("LOC_RIVER_EDU_OLD_01");
  await page.getByTestId("app-back").click();
  await closeApp(page);

  await page.getByTestId("app-app.baidu_map").click();
  await expect(page.getByTestId("map-online")).toContainText("REFERENCE-GAP");
  await page.getByTestId("toggle-map-network").click();
  await expect(page.getByTestId("map-offline")).toContainText("冻结离线镜像");
  await page.getByTestId("confirm-map-location").click();
  await closeApp(page);

  await page.getByTestId("app-app.photos").click();
  await page.getByTestId("photo-a3.site.photos").click();
  for(const slot of ["P-A3-05","P-A3-06","P-A3-07"]){
    await page.getByTestId(`site-photo-${slot}`).click();
    await page.getByTestId(`inspect-${slot}`).click();
    await page.getByRole("button",{name:"十二张"}).click();
  }
  await page.getByTestId("confirm-site-photos").click();
  await expect(page.getByTestId("site-photo-metadata")).toContainText("拍摄日期");
  await expect(page.getByTestId("site-photo-metadata")).toContainText("文件创建时间");
  await expect(page.getByTestId("site-photo-metadata")).toContainText("文件修改时间");
  await page.getByTestId("confirm-photo-metadata").click();
  await closeApp(page);

  await page.getByTestId("app-app.phone").click();
  await page.getByTestId("audio-load-fallback").click();
  await expect(page.getByTestId("call-fallback")).toContainText("第二组脚步");
  await page.getByTestId("answer-unknown-call").click();
  await closeApp(page);

  await page.getByTestId("app-app.wechat").click();
  await page.getByTestId("thread-周岚").click();
  await page.getByTestId("contact-zhoulan").click();
  await expect(page.getByTestId("zhoulan-thread")).toContainText("不好意思，我不认识这个人");
  await page.getByTestId("send-bluecup-clean").click();
  await page.getByTestId("play-zhoulan-bluecup").click();
  await expect(page.getByTestId("zhoulan-thread")).toContainText("小川上大学第一年非要买蓝的");
  await page.getByTestId("wechat-conversations").click();
  await closeApp(page);

  await page.getByTestId("app-app.taobao").click();
  await page.getByRole("button",{name:/蓝色搪瓷杯订单/}).click();
  await closeApp(page);
  await expect(page.getByTestId("current-scene")).toContainText("A3-07");

  await page.getByTestId("app-app.wechat").click();
  await page.getByTestId("thread-周岚").click();
  await page.getByTestId("reopen-zhoulan-r3").click();
  await expect(page.getByTestId("zhoulan-r3")).toContainText("同一母带");
  await expect(page.getByTestId("zhoulan-r3")).toContainText("小川上大学第一年");

  await page.getByTestId("switch-player").click();
  await expect(page.getByTestId("current-scene")).toContainText("A3-09");
  await page.getByTestId("app-app.wechat").click();
  await page.getByTestId("thread-李女士").click();
  await expect(page.locator(".chat-thread")).toContainText("你是不是发错人了");
  await page.getByTestId("wechat-conversations").click();
  await closeApp(page);
  await page.getByTestId("app-app.baidu_map").click();
  await expect(page.getByTestId("player-map-eroded")).toContainText("普通收藏地点");
  await closeApp(page);
  await page.getByTestId("app-app.photos").click();
  await expect(page.getByTestId("player-album-eroded")).toContainText("41 张");
  await closeApp(page);

  await page.getByTestId("switch-investigation").click();
  await closeApp(page);
  await page.getByTestId("app-app.photos").click();
  await page.getByTestId("photo-a3.site.video").click();
  await page.getByTestId("video-load-fallback").click();
  await expect(page.getByTestId("a3-site-video")).toContainText("00:11.52");
  for(let i=0;i<6;i++) await page.getByTestId("advance-site-video").click();
  await page.getByTestId("complete-site-video").click();
  await expect(page.getByTestId("current-scene")).toContainText("A3-10");
  await expect(page.getByTestId("a3-site-video")).toContainText("只能确认存在第二名持机者");
  await expect(page.getByTestId("current-scene")).not.toContainText("A4-01");

  await page.reload();
  await expect(page.getByTestId("current-scene")).toContainText("A3-10");
  await page.getByTestId("photo-a3.site.video").click();
  await expect(page.getByTestId("a3-site-video")).toContainText("26.4 秒");
});
