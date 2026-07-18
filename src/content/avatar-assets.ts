import { assetUrl } from "@/lib/asset-url";

export const GENERATED_AVATAR_COUNT = 128;

export function generatedAvatar(slot: number): string {
  const normalized = ((Math.trunc(slot) % GENERATED_AVATAR_COUNT) + GENERATED_AVATAR_COUNT) % GENERATED_AVATAR_COUNT;
  return assetUrl(`/media/case-001/avatars/generated-avatar-${String(normalized + 1).padStart(3, "0")}.svg`)!;
}
