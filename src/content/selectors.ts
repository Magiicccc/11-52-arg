import type { ContentItem } from "@/contracts/content";
import type { GameState } from "@/contracts/game-state";
import { contentById, contentForApp } from "./content-pack";

export function activeBody(state: GameState, item: ContentItem): unknown {
  const variantId = state.content.activeVariantByContentId[item.id] ?? item.initialVariantId;
  return item.variants.find((variant) => variant.id === variantId)?.body ?? item.variants[0]?.body;
}
export function unlockedItemsForApp(state: GameState, appId: string): ContentItem[] {
  const unlocked = new Set(state.content.unlockedContentIds);
  return contentForApp(appId).filter((item) => unlocked.has(item.id));
}
export function getContentItem(id: string): ContentItem | undefined { return contentById.get(id); }
