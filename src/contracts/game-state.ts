export type DeviceId = "investigation" | "player";
export type CorrectionStage = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
export type ResponseSource = "H" | "A" | "P" | "C";
export type SceneId = string;
export type ContentId = string;
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface GameState {
  schemaVersion: number;
  campaignId: string;
  runId: string;
  revision: number;
  world: WorldState;
  devices: Record<DeviceId, DeviceState>;
  story: StoryState;
  evidence: EvidenceState;
  anchors: AnchorState;
  relationships: RelationshipState;
  content: ContentState;
  responses: ResponseQueueState;
  meta: MetaState;
}

export interface WorldState {
  storyDate: "2026-07-15";
  correctionStage: CorrectionStage;
  correctionVector: {
    publicNetwork: number;
    cloudDevices: number;
    localDevices: number;
    relationships: number;
    playerIdentity: number;
  };
  flags: Record<string, JsonValue>;
}

export interface DeviceState {
  id: DeviceId;
  locked: boolean;
  ownerLabel: string | null;
  activeAppId: string | null;
  appStack: string[];
  unreadByApp: Record<string, number>;
  scrollByRoute: Record<string, number>;
  networkMode: "offline" | "local-only" | "simulated-online";
}

export interface StoryState {
  currentSceneId: SceneId;
  completedSceneIds: SceneId[];
  gates: Record<string, boolean>;
  checkpoints: string[];
}

export interface EvidenceState {
  discovered: string[];
  interpreted: string[];
  confirmed: string[];
  sourceRoots: Record<string, string>;
}

export type AnchorType =
  | "name" | "face" | "voice" | "family" | "friend"
  | "home" | "trajectory" | "dailyLife" | "socialIdentity" | "activeMemory";

export interface AnchorState {
  shenChuan: Partial<Record<AnchorType, number>>;
  player: Partial<Record<AnchorType, number>>;
}

export interface RelationshipState {
  npcKnowledge: Record<string, string[]>;
  relationshipVariants: Record<string, string>;
}

export interface ContentState {
  activeVariantByContentId: Record<ContentId, string>;
  unlockedContentIds: ContentId[];
}

export interface ResponseQueueState {
  activeResponseId: string | null;
  queuedResponseIds: string[];
}

export interface MetaState {
  runNumber: number;
  endingHistory: string[];
  archiveUnlocked: boolean;
  accessibility: Record<string, JsonValue>;
}
