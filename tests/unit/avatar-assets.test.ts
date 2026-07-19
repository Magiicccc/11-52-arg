import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  GENERATED_AVATAR_COUNT,
  generatedAvatar,
  identityAvatar,
  realisticInternetAvatar,
  realisticWechatAvatar,
} from "@/content/avatar-assets";

type AvatarManifest = {
  assets: Array<{
    slot: number;
    path: string;
    seed: string;
    sha256: string;
  }>;
};

describe("generated avatar asset pack", () => {
  it("contains 128 stable and unique local image assets", () => {
    const manifest = JSON.parse(readFileSync(path.resolve("content/case-001/media/generated-avatar-manifest.json"), "utf8")) as AvatarManifest;
    expect(GENERATED_AVATAR_COUNT).toBe(128);
    expect(manifest.assets).toHaveLength(GENERATED_AVATAR_COUNT);
    expect(new Set(manifest.assets.map((asset) => asset.path)).size).toBe(GENERATED_AVATAR_COUNT);
    expect(new Set(manifest.assets.map((asset) => asset.seed)).size).toBe(GENERATED_AVATAR_COUNT);
    expect(new Set(manifest.assets.map((asset) => asset.sha256)).size).toBe(GENERATED_AVATAR_COUNT);
    expect(manifest.assets.every((asset, index) => asset.slot === index && asset.path.endsWith(".png"))).toBe(true);
  });

  it("maps every visible slot to a base-aware local asset URL", () => {
    for (let slot = 0; slot < GENERATED_AVATAR_COUNT; slot += 1) {
      expect(generatedAvatar(slot)).toMatch(new RegExp(`media/case-001/avatars/generated-avatar-${String(slot + 1).padStart(3, "0")}\\.png$`));
    }
  });

  it("maps ordinary WeChat identities to distinct realistic local images", () => {
    const identities = [
      "wechat.daily.chenyu",
      "wechat.daily.photo-group",
      "wechat.daily.research-group",
      "wechat.daily.family",
      "wechat.daily.xu",
      "wechat.daily.lin",
      "wechat.daily.gu",
      "wechat.daily.property",
      "wechat.daily.book-club",
      "wechat.daily.neighbor",
      "wechat.daily.delivery",
      "wechat.daily.chen",
      "wechat.daily-gym",
      "wechat.daily-cloud",
      "wechat.daily-self",
      "actor.zhoulan",
    ];
    const paths = identities.map((identity, index) => realisticWechatAvatar(identity, index));
    expect(new Set(paths).size).toBe(identities.length);
    expect(paths.every((assetPath) => assetPath.includes("/avatars/realistic/"))).toBe(true);
  });

  it("uses non-face generated lifestyle photos for core device identities", () => {
    expect(identityAvatar("player")).toContain("/daily/temporary-archive-desk.jpg");
    expect(identityAvatar("investigation")).toContain("/daily/temporary-rainy-street.jpg");
  });

  it("maps the first visible Xiaohongshu author cohort to distinct semantic images", () => {
    const authors = [
      "南岸慢慢走",
      "橙色文件夹",
      "午间十分钟",
      "白色鞋带",
      "接口旁边",
      "今天吃什么呀",
      "慢快门小顾",
      "八点四十二",
      "木桌边",
      "第三章以后",
      "沿河但不靠河",
      "硬盘灯还亮着",
    ];
    const paths = authors.map((author, index) => realisticInternetAvatar(author, 20 + index));
    expect(new Set(paths).size).toBe(authors.length);
    expect(paths.every((assetPath) => assetPath.includes("/avatars/realistic/"))).toBe(true);
  });

  it("maps every ordinary Xiaohongshu author to a unique custom image", () => {
    const authors = [
      "南岸慢慢走",
      "橙色文件夹",
      "午间十分钟",
      "白色鞋带",
      "接口旁边",
      "今天吃什么呀",
      "慢快门小顾",
      "八点四十二",
      "木桌边",
      "第三章以后",
      "沿河但不靠河",
      "硬盘灯还亮着",
      "写字楼观察员",
      "一档欠曝",
      "冰箱便签",
      "研究提纲",
      "鞋柜观察",
      "镜头布不见了",
      "灶台很小",
      "版本号从一开始",
      "耳机只戴一边",
      "窗台三号盆",
      "今天没迟到",
      "照片很多但不慌",
    ];
    const paths = authors.map((author, index) => realisticInternetAvatar(author, 20 + index));
    expect(new Set(paths).size).toBe(authors.length);
    expect(paths.every((assetPath) => assetPath.includes("/avatars/realistic/"))).toBe(true);
    expect(paths.every((assetPath) => !assetPath.includes("generated-avatar-"))).toBe(true);
  });

  it("keeps cross-platform ordinary identities on stable custom images", () => {
    const identities = ["南岸没有风", "旧雨17", "沿河慢慢走", "普通路过", "一只普通用户", "收纳慢慢来", "今天也下雨"];
    const paths = identities.map((identity, index) => realisticInternetAvatar(identity, 80 + index));
    expect(new Set(paths).size).toBe(identities.length);
    expect(paths.every((assetPath) => assetPath.includes("/avatars/realistic/"))).toBe(true);
    expect(paths.every((assetPath) => !assetPath.includes("generated-avatar-"))).toBe(true);
  });
});
