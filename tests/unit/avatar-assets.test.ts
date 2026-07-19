import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  GENERATED_AVATAR_COUNT,
  generatedAvatar,
  identityAvatar,
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
    ];
    const paths = identities.map((identity, index) => realisticWechatAvatar(identity, index));
    expect(new Set(paths).size).toBe(identities.length);
    expect(paths.every((assetPath) => assetPath.includes("/avatars/realistic/"))).toBe(true);
  });

  it("uses non-face generated lifestyle photos for core device identities", () => {
    expect(identityAvatar("player")).toContain("/daily/temporary-archive-desk.jpg");
    expect(identityAvatar("investigation")).toContain("/daily/temporary-rainy-street.jpg");
  });
});
