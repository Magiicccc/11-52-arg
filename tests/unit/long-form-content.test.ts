import { describe, expect, it } from "vitest";
import { contentForApp } from "@/content/content-pack";
import { createInitialGameState, reconcileContentCatalog } from "@/engine/initial-state";

type ZhihuLongFormBody = {
  title?: string;
  excerpt?: string;
  paragraphs?: string[];
  comments?: Array<{ author?: string; text?: string }>;
};
type ToutiaoLongFormBody = {
  title?: string;
  summary?: string;
  paragraphs?: string[];
  source?: string;
  date?: string;
};

describe("long-form platform content", () => {
  const zhihuItems = contentForApp("app.zhihu").filter((item) => item.id.startsWith("zhihu.life."));
  const toutiaoItems = contentForApp("app.toutiao").filter((item) => item.id.startsWith("news.toutiao.life."));

  it("ships at least twelve complete ordinary Zhihu answers", () => {
    expect(zhihuItems.length).toBeGreaterThanOrEqual(12);
    for (const item of zhihuItems) {
      const body = item.variants[0]?.body as ZhihuLongFormBody;
      expect(body.title?.trim().length).toBeGreaterThan(8);
      expect(body.excerpt?.trim().length).toBeGreaterThan(20);
      expect(body.paragraphs?.length).toBeGreaterThanOrEqual(6);
      expect(body.paragraphs?.every((paragraph) => paragraph.trim().length >= 45)).toBe(true);
      expect((body.paragraphs ?? []).join("").length).toBeGreaterThan(300);
      expect(body.comments?.length).toBeGreaterThanOrEqual(3);
      expect(item.narrative.clueRole === "none" || item.narrative.clueRole === "supporting").toBe(true);
      expect(
        item.narrative.worldFactIds.length
        + item.narrative.characterTraitIds.length
        + item.narrative.relationshipBeatIds.length
        + item.narrative.continuityLinkIds.length
      ).toBeGreaterThan(0);
    }
  });

  it("ships twenty complete ordinary Toutiao articles", () => {
    expect(toutiaoItems).toHaveLength(20);
    for (const item of toutiaoItems) {
      const body = item.variants[0]?.body as ToutiaoLongFormBody;
      expect(body.title?.trim().length).toBeGreaterThan(8);
      expect(body.summary?.trim().length).toBeGreaterThan(20);
      expect(body.paragraphs).toHaveLength(4);
      expect(body.paragraphs?.every((paragraph) => paragraph.trim().length >= 35)).toBe(true);
      expect((body.paragraphs ?? []).join("").length).toBeGreaterThan(180);
      expect(body.source?.trim()).not.toBe("");
      expect(body.date?.trim()).not.toBe("");
      expect(item.narrative.clueRole).toBe("none");
    }
  });

  it("adds new visible long-form content to an old save without resetting progress", () => {
    const current = createInitialGameState();
    const target = zhihuItems[0]!;
    const old = structuredClone(current);
    delete old.content.activeVariantByContentId[target.id];
    old.content.unlockedContentIds = old.content.unlockedContentIds.filter((id) => id !== target.id);
    old.story.currentSceneId = "A3-10";
    old.story.completedSceneIds.push("A3-10");
    const revision = old.revision;

    const migrated = reconcileContentCatalog(old);

    expect(migrated.content.activeVariantByContentId[target.id]).toBe(target.initialVariantId);
    expect(migrated.content.unlockedContentIds).toContain(target.id);
    expect(migrated.story.currentSceneId).toBe("A3-10");
    expect(migrated.story.completedSceneIds).toContain("A3-10");
    expect(migrated.revision).toBe(revision + 1);
  });
});
