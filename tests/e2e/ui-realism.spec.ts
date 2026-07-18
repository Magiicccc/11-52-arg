import { mkdirSync } from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { testEntryUrl } from "./entry-url";

const visualRoot=path.resolve("test-results/visual");
function withoutQa(url:string):string {
  if (/^https?:\/\//.test(url)) {
    const parsed=new URL(url);
    parsed.searchParams.delete("qa");
    return parsed.toString();
  }
  return url.split("?")[0]||"/";
}

const normalEntryUrl=withoutQa(testEntryUrl);

function viewportSuffix(page:Page):string {
  return String(page.viewportSize()?.width??"unknown");
}

async function openZhihu(page:Page) {
  const icon=page.getByTestId("app-app.zhihu");
  await icon.scrollIntoViewIfNeeded();
  await icon.click();
  await expect(page.getByTestId("zhihu-home")).toBeVisible();
}

test.beforeAll(()=>{
  mkdirSync(path.join(visualRoot,"home"),{recursive:true});
  mkdirSync(path.join(visualRoot,"zhihu"),{recursive:true});
});

test.beforeEach(async ({page})=>{
  await page.goto(normalEntryUrl);
  await expect(page.getByTestId("home-screen")).toBeVisible();
});

test("home screen uses measured icon geometry and numeric badges",async ({page})=>{
  const suffix=viewportSuffix(page);
  await expect(page.locator(".app-badge")).toHaveCount(1);
  await expect(page.locator(".app-badge")).toHaveText("3");
  await expect(page.locator(".app-badge:empty")).toHaveCount(0);
  await expect(page.locator(".home-page").first().locator(".app-icon-button")).toHaveCount(16);
  await expect(page.locator(".home-dock .app-icon-button")).toHaveCount(4);
  await expect(page.locator(".page-dots i")).toHaveCount(2);
  await expect(page.locator(".prototype-toolbar,.prototype-status")).toHaveCount(0);

  const icons=page.locator(".home-page").first().locator(".icon-wrap");
  const first=await icons.nth(0).boundingBox();
  const second=await icons.nth(1).boundingBox();
  expect(first?.width).toBeCloseTo(65,0);
  expect(first?.height).toBeCloseTo(65,0);
  expect((second?.x??0)-(first?.x??0)).toBeGreaterThanOrEqual(suffix==="440"?100:92);

  const systemIcon=page.getByTestId("app-app.files").locator("img");
  await expect(systemIcon).toHaveAttribute("src",/\/icons\/system\/runtime\/files\.png$/);
  await page.screenshot({path:path.join(visualRoot,"home",`home-${suffix}.png`)});
});

test("Zhihu dedicated home, search, detail, comments and cache states",async ({page})=>{
  const suffix=viewportSuffix(page);
  await openZhihu(page);
  await expect(page.locator(".generic-app")).toHaveCount(0);
  await expect(page.locator(".zhihu-question-card")).toHaveCount(12);
  await expect(page.locator(".zhihu-bottom-nav")).toBeVisible();
  await page.screenshot({path:path.join(visualRoot,"zhihu",`home-${suffix}.png`)});

  await page.getByTestId("zhihu-open-search").click();
  await page.getByTestId("zhihu-search-input").fill("网页");
  await page.getByTestId("zhihu-search-submit").click();
  await expect(page.getByTestId("zhihu-search")).toBeVisible();
  await expect(page.locator(".zhihu-question-card")).toHaveCount(2);
  await page.screenshot({path:path.join(visualRoot,"zhihu",`search-${suffix}.png`)});

  await page.locator(".zhihu-question-card").first().click();
  await expect(page.getByTestId("zhihu-detail")).toBeVisible();
  await page.screenshot({path:path.join(visualRoot,"zhihu",`detail-${suffix}.png`)});

  await page.locator(".zhihu-answer-actions button").nth(1).click();
  await expect(page.getByTestId("zhihu-comments")).toBeVisible();
  await page.screenshot({path:path.join(visualRoot,"zhihu",`comments-${suffix}.png`)});

  await page.getByTestId("app-back").click();
  await page.getByTestId("app-back").click();
  const feed=page.locator(".zhihu-feed");
  await feed.evaluate(element=>{element.scrollTop=element.scrollHeight});
  await page.locator(".zhihu-question-card").last().click();
  await expect(page.getByTestId("zhihu-404")).toBeVisible();
  await expect(page.getByTestId("zhihu-cache-entry-before")).not.toBeInViewport();
  await page.screenshot({path:path.join(visualRoot,"zhihu",`404-${suffix}.png`)});

  const errorScroll=page.locator(".zhihu-404-scroll");
  await errorScroll.evaluate(element=>{element.scrollTop=element.scrollHeight});
  await expect(page.getByTestId("zhihu-cache-entry-before")).toBeInViewport();
  await page.screenshot({path:path.join(visualRoot,"zhihu",`cache-entry-before-${suffix}.png`)});
  await page.getByTestId("zhihu-cache-entry-before").click();
  await expect(page.getByTestId("zhihu-cache-entry-after")).toBeVisible();
  await page.screenshot({path:path.join(visualRoot,"zhihu",`cache-entry-after-${suffix}.png`)});
});

test("Zhihu interaction and scroll state survive return and reload",async ({page})=>{
  await openZhihu(page);
  const feed=page.locator(".zhihu-feed");
  await feed.evaluate(element=>{element.scrollTop=520});
  await page.locator(".zhihu-question-card").nth(5).click();
  await page.getByTestId("zhihu-like").click();
  await page.getByTestId("zhihu-save").click();
  await expect(page.getByTestId("zhihu-like")).toContainText("已赞同");
  await expect(page.getByTestId("zhihu-save")).toContainText("已收藏");
  await page.getByTestId("app-back").click();
  await expect.poll(()=>feed.evaluate(element=>element.scrollTop)).toBeGreaterThan(400);

  await page.reload();
  await expect(page.getByTestId("zhihu-home")).toBeVisible();
  await expect.poll(()=>page.locator(".zhihu-feed").evaluate(element=>element.scrollTop)).toBeGreaterThan(400);
  await page.locator(".zhihu-question-card").nth(5).click();
  await expect(page.getByTestId("zhihu-like")).toContainText("已赞同");
  await expect(page.getByTestId("zhihu-save")).toContainText("已收藏");
});

test("all player apps open without player-visible development labels",async ({page})=>{
  const appIds=[
    "app.wechat","app.photos","app.safari","app.baidu_map","app.phone","app.files","app.notes","app.calendar","app.settings",
    "app.xiaohongshu","app.douyin","app.zhihu","app.tieba","app.toutiao","app.qqmail","app.baidunetdisk","app.alipay",
    "app.didi","app.meituan","app.taobao","app.netease_music","app.wechat_reading","app.railway12306","app.health",
    "app.weather","app.clock","app.calculator","app.camera","app.voice_memos","app.compass"
  ];
  const forbidden=/[ABC]级交互|本地模拟账号|TEMPORARY|REFERENCE-GAP|场景：|修正：|修订：/;
  for(const appId of appIds){
    const icon=page.getByTestId(`app-${appId}`);
    await icon.scrollIntoViewIfNeeded();
    await icon.click();
    await expect(page.locator(".app-window")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(forbidden);
    await page.getByTestId("app-back").click();
    await expect(page.getByTestId("home-screen")).toBeVisible();
  }
});
