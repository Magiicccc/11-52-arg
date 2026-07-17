import type { GameState } from "@/contracts/game-state";
import { contentItems } from "@/content/content-pack";

export function createInitialGameState(): GameState {
  const activeVariantByContentId = Object.fromEntries(contentItems.map((item) => [item.id, item.initialVariantId]));
  const visibleContent = contentItems.filter((item) => item.metadata?.visibleAtStart === true).map((item) => item.id);
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
