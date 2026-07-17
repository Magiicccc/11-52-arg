import type { JsonValue, ResponseSource } from "./game-state";

export interface TriggerDefinition {
  id: string;
  enabled: boolean;
  once: boolean;
  priority: number;
  when: EventMatcher;
  conditions: Condition;
  actions: Action[];
  responseSource: ResponseSource;
}

export interface EventMatcher {
  type: string;
  targetId?: string;
  deviceId?: "investigation" | "player";
}

export type Condition =
  | { op: "all"; conditions: Condition[] }
  | { op: "any"; conditions: Condition[] }
  | { op: "not"; condition: Condition }
  | { op: "flagEquals"; path: string; value: JsonValue }
  | { op: "sceneCompleted"; sceneId: string }
  | { op: "contentVariantIs"; contentId: string; variantId: string }
  | { op: "evidenceAtLeast"; evidenceId: string; stage: "discovered" | "interpreted" | "confirmed" }
  | { op: "triggerNotConsumed"; triggerId: string };

export type Action =
  | { type: "setFlag"; path: string; value: JsonValue }
  | { type: "emitEvent"; eventType: string; payload: JsonValue }
  | { type: "setContentVariant"; contentId: string; variantId: string }
  | { type: "unlockContent"; contentId: string }
  | { type: "enqueueMessage"; threadId: string; messageId: string; delayMs?: number }
  | { type: "showNotification"; deviceId: string; notificationId: string; delayMs?: number }
  | { type: "adjustAnchor"; subjectId: string; anchorType: string; delta: number }
  | { type: "adjustCorrection"; channel: string; delta: number }
  | { type: "completeScene"; sceneId: string }
  | { type: "createCheckpoint"; checkpointId: string };
