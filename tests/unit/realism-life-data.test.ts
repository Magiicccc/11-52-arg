import { describe, expect, it } from "vitest";
import {
  ordinaryMails,
  ordinaryPlatformRecords,
  ordinaryVideos,
  ordinaryWechatThreads,
  ordinaryXhsDrafts,
  ordinaryXhsNotes,
  realismContentSummary,
  temporaryMapPois,
  wechatThreadSupplements
} from "@/content/realism-life-data";

describe("ordinary digital-life realism pack", () => {
  it("meets the frozen quantitative density gates", () => {
    expect(realismContentSummary.wechatThreads).toBeGreaterThanOrEqual(15);
    expect(realismContentSummary.wechatMessages).toBeGreaterThanOrEqual(100);
    expect(realismContentSummary.wechatGroups).toBeGreaterThanOrEqual(3);
    expect(wechatThreadSupplements).toHaveLength(5);
    expect(wechatThreadSupplements.every((thread) => thread.messages.length >= 6)).toBe(true);
    expect(new Set(ordinaryWechatThreads.flatMap((thread) => thread.messages.map((message) => message.type))).size).toBeGreaterThanOrEqual(6);

    expect(realismContentSummary.xhsNotes).toBeGreaterThanOrEqual(24);
    expect(realismContentSummary.xhsAuthors).toBeGreaterThanOrEqual(18);
    expect(realismContentSummary.xhsCategories).toBeGreaterThanOrEqual(8);
    expect(realismContentSummary.xhsComments).toBeGreaterThanOrEqual(40);
    const categories = new Set(ordinaryXhsNotes.map((note) => note.category));
    for (const category of ["穿搭", "日常饮食", "旅行", "摄影", "宠物", "城市生活", "工作方法", "数码整理", "居家", "普通情绪"]) {
      expect(categories.has(category)).toBe(true);
    }
    expect(realismContentSummary.xhsDefaultFavorites).toBeGreaterThanOrEqual(6);
    expect(realismContentSummary.xhsDefaultHistory).toBeGreaterThanOrEqual(4);
    expect(realismContentSummary.xhsDrafts).toBeGreaterThanOrEqual(2);
    expect(ordinaryXhsNotes.every((note) => note.body.length >= 4)).toBe(true);
    expect(ordinaryXhsNotes.every((note) => note.body.join("").length >= 180)).toBe(true);
    expect(ordinaryXhsNotes.every((note) => note.summary.length < note.body.join("").length)).toBe(true);
    expect(new Set(ordinaryXhsNotes.flatMap((note) => note.comments.map((comment) => comment.text))).size)
      .toBe(ordinaryXhsNotes.reduce((sum, note) => sum + note.comments.length, 0));

    expect(realismContentSummary.mails).toBeGreaterThanOrEqual(20);
    expect(realismContentSummary.mailFolders).toBeGreaterThanOrEqual(6);
    expect(realismContentSummary.mailAttachments).toBeGreaterThanOrEqual(4);
    expect(realismContentSummary.mailThreads).toBeGreaterThanOrEqual(3);
    expect(new Set(ordinaryMails.map((mail) => mail.senderType)).size).toBe(3);
    expect(new Set(ordinaryMails.map((mail) => mail.body.join("\n"))).size).toBe(ordinaryMails.length);
    expect(ordinaryMails.every((mail) => mail.body.length >= 4)).toBe(true);
    expect(ordinaryMails.filter((mail) => mail.body.join("").length >= 180).length).toBeGreaterThanOrEqual(8);
    expect(ordinaryMails.every((mail) => mail.to.trim().length > 0 && mail.sentAt.trim().length > 0)).toBe(true);

    expect(realismContentSummary.videos).toBeGreaterThanOrEqual(15);
    expect(realismContentSummary.mapPois).toBeGreaterThanOrEqual(15);
    expect(ordinaryPlatformRecords.filter((record) => record.appId === "app.toutiao")).toHaveLength(20);
    for (const appId of ["app.baidunetdisk", "app.alipay", "app.didi", "app.meituan", "app.taobao"]) {
      expect(ordinaryPlatformRecords.filter((record) => record.appId === appId).length).toBeGreaterThanOrEqual(12);
    }
  });

  it("keeps every ordinary content unit attached to NarrativeMetadata", () => {
    const units = [
      ...ordinaryWechatThreads,
      ...wechatThreadSupplements,
      ...ordinaryXhsNotes,
      ...ordinaryXhsDrafts,
      ...ordinaryMails,
      ...ordinaryVideos,
      ...ordinaryPlatformRecords
    ];
    for (const unit of units) {
      expect(unit.narrative.firstReadValue.trim()).not.toBe("");
      expect(unit.narrative.primaryFunction).toBeTruthy();
      expect(unit.narrative.clueRole).toBe("none");
      expect(unit.narrative.payoffPolicy).toBe("none");
      expect(unit.narrative.worldFactIds.length).toBeGreaterThan(0);
    }
  });

  it("keeps the temporary map deidentified and explicit", () => {
    expect(temporaryMapPois).toHaveLength(15);
    expect(temporaryMapPois.some((poi) => poi.id === "poi.temp.14" && poi.detail.includes("地点令牌未绑定"))).toBe(true);
    for (const poi of temporaryMapPois) {
      expect(poi.id).toMatch(/^poi\.temp\./);
      expect(Math.abs(poi.x)).toBeLessThanOrEqual(100);
      expect(Math.abs(poi.y)).toBeLessThanOrEqual(100);
    }
  });
});
