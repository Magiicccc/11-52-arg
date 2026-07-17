import { test, expect, type Page } from "@playwright/test";

async function unlockInvestigationPhone(page:Page){
  await page.getByTestId("switch-investigation").click();
  await expect(page.getByTestId("lock-screen")).toBeVisible();
  await page.getByTestId("lock-call-chenyu").click();
  await expect(page.getByTestId("chenyu-lock-reply")).toContainText("你先别联网");
  await page.getByRole("button",{name:"结束通话"}).click();
  await page.getByTestId("open-passcode").click();
  for (const digit of "230917") await page.getByTestId(`key-${digit}`).click();
  await expect(page.getByTestId("home-screen")).toBeVisible();
}

test.beforeEach(async ({page}) => { await page.goto("/"); });

test("P00-P03: return Chen Yu's call and unlock with 230917", async ({page}) => {
  await expect(page.getByTestId("phone-player")).toBeVisible();
  await unlockInvestigationPhone(page);
  await expect(page.getByTestId("current-scene")).toContainText("P03");
  await page.reload();
  await expect(page.getByTestId("home-screen")).toBeVisible();
  await expect(page.getByTestId("current-scene")).toContainText("P03");
});
