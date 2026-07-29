import type { GameState } from "@/contracts/game-state";
import { contentItems } from "@/content/content-pack";

function visibleContentIds(): string[] {
  return contentItems
    .filter((item) => item.metadata?.visibleAtStart === true)
    .map((item) => item.id);
}

export function createInitialGameState(): GameState {
  const activeVariantByContentId = Object.fromEntries(contentItems.map((item) => [item.id, item.initialVariantId]));
  const visibleContent = visibleContentIds();
  return {
    schemaVersion: 1,
    campaignId: "campaign.case-001",
    runId: crypto.randomUUID(),
    revision: 0,
    world: {
      storyDate: "2026-07-15",
      correctionStage: "R0",
      correctionVector: { publicNetwork: 0, cloudDevices: 0, localDevices: 0, relationships: 0, playerIdentity: 0 },
      flags: { activeDeviceId: "player", passcodeFailures: 0, prototypeVisualStatus: "temporary" }
    },
    devices: {
      investigation: { id: "investigation", locked: true, ownerLabel: null, activeAppId: null, appStack: [], unreadByApp: {"app.wechat":2,"app.baidunetdisk":1}, scrollByRoute: {}, networkMode: "local-only" },
      player: { id: "player", locked: false, ownerLabel: "我", activeAppId: null, appStack: [], unreadByApp: {"app.wechat":3}, scrollByRoute: {}, networkMode: "simulated-online" }
    },
    story: { currentSceneId: "P00", completedSceneIds: ["P00"], gates: {}, checkpoints: [] },
    evidence: { discovered: [], interpreted: [], confirmed: [], sourceRoots: {} },
    anchors: { shenChuan: {}, player: { name: 1, face: 1, family: 1, friend: 1, home: 1, dailyLife: 1, socialIdentity: 1 } },
    relationships: { npcKnowledge: {"actor.chenyu":[],"actor.zhoulan":[],"actor.axu":["actor.player"]}, relationshipVariants: {} },
    content: { activeVariantByContentId, unlockedContentIds: visibleContent },
    responses: { activeResponseId: null, queuedResponseIds: [] },
    meta: { runNumber: 1, endingHistory: [], archiveUnlocked: false, accessibility: { reduceMotion: false } }
  };
}

/**
 * Adds newly shipped, initially visible content to an existing save without
 * changing any story, evidence, trigger, or active variant already present.
 */
export function reconcileContentCatalog(snapshot: GameState): GameState {
  const next = structuredClone(snapshot);
  let changed = false;
  for (const item of contentItems) {
    if (!next.content.activeVariantByContentId[item.id]) {
      next.content.activeVariantByContentId[item.id] = item.initialVariantId;
      changed = true;
    }
  }
  const unlocked = new Set(next.content.unlockedContentIds);
  for (const id of visibleContentIds()) {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      changed = true;
    }
  }
  if (changed) {
    next.content.unlockedContentIds = [...unlocked];
    next.revision += 1;
  }
  return next;
}
