import type { ContentId, JsonValue } from "./game-state";

export type NarrativeFunction =
  | "characterization"
  | "relationship"
  | "world_context"
  | "chronology"
  | "location"
  | "profession"
  | "socioeconomic"
  | "habit"
  | "platform_culture"
  | "theme"
  | "emotional_contrast"
  | "continuity"
  | "future_loss";

export type ClueRole = "none" | "supporting" | "direct" | "misdirection";

export interface NarrativeMetadata {
  primaryFunction: NarrativeFunction;
  secondaryFunctions: NarrativeFunction[];
  clueRole: ClueRole;
  worldFactIds: string[];
  characterTraitIds: string[];
  relationshipBeatIds: string[];
  continuityLinkIds: string[];
  firstReadValue: string;
  recontextualizedValue?: string;
  payoffPolicy: "none" | "optional" | "required";
}

export interface ContentItem {
  id: ContentId;
  appId: string;
  kind: string;
  ownerId: string;
  sourceRootId: string;
  initialVariantId: string;
  variants: ContentVariant[];
  narrative: NarrativeMetadata;
  metadata?: Record<string, JsonValue>;
}

export interface ContentVariant {
  id: string;
  correctionStage: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
  body: JsonValue;
  replacesVariantId?: string;
  reason?: "normal" | "player_action" | "H" | "A" | "P" | "C";
}

export interface WorldFact {
  id: string;
  category: string;
  statement: string;
  supportContentIds: ContentId[];
}

export interface CharacterTrait {
  id: string;
  actorId: string;
  statement: string;
  supportContentIds: ContentId[];
}

export interface RelationshipBeat {
  id: string;
  actorIds: string[];
  phase: string;
  statement: string;
  supportContentIds: ContentId[];
}

export interface ScenePackage {
  id: string;
  order: number;
  prerequisites: string[];
  gatesSatisfied: string[];
  contentIds: string[];
  triggerIds: string[];
  checkpointId?: string;
}
