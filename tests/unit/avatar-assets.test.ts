import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GENERATED_AVATAR_COUNT, generatedAvatar } from "@/content/avatar-assets";

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
    expect(manifest.assets.every((asset, index) => asset.slot === index && asset.path.endsWith(".svg"))).toBe(true);
  });

  it("maps every visible slot to a base-aware local asset URL", () => {
    for (let slot = 0; slot < GENERATED_AVATAR_COUNT; slot += 1) {
      expect(generatedAvatar(slot)).toMatch(new RegExp(`media/case-001/avatars/generated-avatar-${String(slot + 1).padStart(3, "0")}\\.svg$`));
    }
  });
});
