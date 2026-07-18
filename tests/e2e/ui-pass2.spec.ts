import { expect, test, type Page } from "@playwright/test";
import { testEntryUrl } from "./entry-url";

const utilityApps=[
  ["app.calendar","calendar-home"],
  ["app.netease_music","netease_music-home"],
  ["app.wechat_reading","wechat_reading-home"],
  ["app.railway12306","railway12306-home"],
  ["app.health","health-home"],
  ["app.weather","weather-home"],
  ["app.clock","clock-home"],
  ["app.camera","camera-home"],
  ["app.voice_memos","voice_memos-home"],
  ["app.compass","compass-home"]
] as const;

async function openApp(page:Page,appId:string) {
  const icon=page.getByTestId(`app-${appId}`);
  await icon.scrollIntoViewIfNeeded();
  await icon.click();
  await expect(page.locator(".app-window")).toBeVisible();
}

async function returnHome(page:Page) {
  for(let attempt=0;attempt<3;attempt+=1) {
    if(await page.getByTestId("home-screen").isVisible())return;
    await page.getByTestId("app-back").click();
  }
  await expect(page.getByTestId("home-screen")).toBeVisible();
}

test.beforeEach(async ({page})=>{
  await page.goto(testEntryUrl.split("?")[0]||"/");
  await expect(page.getByTestId("home-screen")).toBeVisible();
});

test("home geometry matches measured 402 and 440 tokens",async ({page})=>{
  const width=page.viewportSize()!.width;
  const expected=width===440
    ? {columns:[66.5,168.5,270.5,372.5],rowStep:98,dockHeight:94,dockBottom:20,dotsBottom:124}
    : {columns:[60.5,153.5,246.5,339.5],rowStep:96,dockHeight:91,dockBottom:18,dotsBottom:120};
  const icons=page.locator(".home-page").first().locator(".icon-wrap");
  const centers:number[]=[];
  for(let index=0;index<4;index+=1) {
    const box=await icons.nth(index).boundingBox();
    centers.push((box?.x??0)+(box?.width??0)/2);
  }
  centers.forEach((center,index)=>expect(center).toBeCloseTo(expected.columns[index]!,0));
  const first=await icons.nth(0).boundingBox();
  const fifth=await icons.nth(4).boundingBox();
  expect((fifth?.y??0)-(first?.y??0)).toBeCloseTo(expected.rowStep,0);
  const dock=await page.locator(".home-dock").boundingBox();
  expect(dock?.height).toBeCloseTo(expected.dockHeight,0);
  expect(page.viewportSize()!.height-(dock?.y??0)-(dock?.height??0)).toBeCloseTo(expected.dockBottom,0);
  const dot=await page.locator(".page-dots").boundingBox();
  expect(page.viewportSize()!.height-(dot?.y??0)-(dot?.height??0)).toBeCloseTo(expected.dotsBottom,0);
  await expect(page.locator(".icon-wrap").first()).toHaveCSS("padding","0px");
  await expect(page.locator(".icon-wrap").first()).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
  await expect(page.locator(".app-icon-image").first()).toHaveCSS("object-fit","cover");
});

test("status bar follows device projection and home pages remain swipeable",async ({page})=>{
  await expect(page.locator(".status-icons")).toHaveAttribute("data-network","cellular");
  await expect(page.locator(".status-icons")).toHaveAttribute("aria-label",/5G，电量 78%/);
  const pages=page.locator(".home-pages");
  await pages.evaluate(element=>{element.scrollLeft=element.clientWidth});
  await expect(page.locator(".page-dots i").nth(1)).toHaveClass(/active/);
  await pages.evaluate(element=>{element.scrollLeft=element.clientWidth*2});
  await expect(page.locator(".page-dots i").nth(2)).toHaveClass(/active/);
  const viewport=page.viewportSize()!;
  const stage=page.locator(".prototype-stage");
  await stage.dispatchEvent("pointerdown",{clientX:viewport.width-8,clientY:viewport.height/2,pointerId:1,pointerType:"touch"});
  await stage.dispatchEvent("pointerup",{clientX:viewport.width-120,clientY:viewport.height/2,pointerId:1,pointerType:"touch"});
  await expect(page.locator(".status-icons")).toHaveAttribute("data-network","airplane");
  await expect(page.locator(".status-icons")).toHaveAttribute("aria-label",/飞行模式，电量 78%/);
});

test("all formerly generic utility apps have dedicated structures",async ({page})=>{
  for(const [appId,testId] of utilityApps) {
    await openApp(page,appId);
    await expect(page.getByTestId(testId)).toBeVisible();
    await expect(page.locator(".generic-app,.generic-detail")).toHaveCount(0);
    await expect(page.getByTestId("app-effective-action").first()).toBeVisible();
    await page.getByTestId("app-effective-action").first().click();
    await returnHome(page);
  }
});

test("content apps provide dense, persistent browsing surfaces",async ({page})=>{
  await openApp(page,"app.xiaohongshu");
  const xhs=page.locator(".xhs-feed");
  expect(await xhs.evaluate(element=>element.scrollHeight/element.clientHeight)).toBeGreaterThan(2);
  await xhs.evaluate(element=>{element.scrollTop=900});
  await page.locator(".xhs-card").nth(8).click();
  await page.locator(".platform-back").click();
  await expect.poll(()=>xhs.evaluate(element=>element.scrollTop)).toBeGreaterThan(700);
  await returnHome(page);

  await openApp(page,"app.toutiao");
  const toutiao=page.locator(".toutiao-feed");
  expect(await toutiao.locator(".toutiao-card").count()).toBeGreaterThanOrEqual(5);
  await toutiao.evaluate(element=>{element.scrollTop=320});
  await toutiao.locator(".toutiao-card").last().click();
  await page.locator(".platform-back").click();
  await expect.poll(()=>toutiao.evaluate(element=>element.scrollTop)).toBeGreaterThan(250);
});

test("Zhihu exposes ideas and profile without an unapproved AI module",async ({page})=>{
  await openApp(page,"app.zhihu");
  await page.locator(".zhihu-bottom-nav button").nth(1).click();
  await expect(page.getByTestId("zhihu-ideas")).toBeVisible();
  await expect(page.locator(".zhihu-ideas-feed>article")).toHaveCount(8);
  await page.locator(".zhihu-bottom-nav button").nth(4).click();
  await expect(page.getByTestId("zhihu-profile")).toBeVisible();
  await expect(page.locator(".zhihu-profile-card")).toContainText("川流档案");
  await expect(page.locator("body")).not.toContainText("AI");
});
