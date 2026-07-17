import { test, expect } from "@playwright/test";
const appIds=["app.wechat","app.photos","app.safari","app.baidu_map","app.phone","app.files","app.notes","app.calendar","app.settings","app.xiaohongshu","app.douyin","app.zhihu","app.tieba","app.toutiao","app.qqmail","app.baidunetdisk","app.alipay","app.didi","app.meituan","app.taobao","app.netease_music","app.wechat_reading","app.railway12306","app.health","app.weather","app.clock","app.calculator","app.camera","app.voice_memos","app.compass"];

test.beforeEach(async ({page}) => { await page.goto("/"); });

test("all visible player phone apps open and return", async ({page}) => {
  for (const appId of appIds) {
    const locator=page.getByTestId(`app-${appId}`);
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
    await expect(page.locator(".app-window")).toBeVisible();
    const action=page.getByTestId("app-effective-action").first();
    await expect(action).toBeVisible();
    await action.click();
    await page.getByTestId("app-back").click();
    await expect(page.getByTestId("home-screen")).toBeVisible();
  }
});
