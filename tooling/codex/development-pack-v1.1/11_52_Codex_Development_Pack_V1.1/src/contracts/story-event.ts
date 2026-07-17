import type { DeviceId, JsonValue, ResponseSource, SceneId } from "./game-state";

export interface StoryEvent<TPayload extends JsonValue = JsonValue> {
  eventId: string;
  type: string;
  occurredAt: string;
  storyDate: "2026-07-15";
  deviceId: DeviceId;
  sceneId: SceneId;
  actorId: string;
  targetId?: string;
  source?: ResponseSource;
  causationId?: string;
  correlationId?: string;
  transactionId?: string;
  payload: TPayload;
}

export interface EventReceipt {
  eventId: string;
  triggerIds: string[];
  transactionIds: string[];
  committedAt: string;
}
