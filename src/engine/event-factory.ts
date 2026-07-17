import type { DeviceId, JsonValue, SceneId } from "@/contracts/game-state";
import type { StoryEvent } from "@/contracts/story-event";

export function createStoryEvent(params: {type:string;deviceId:DeviceId;sceneId:SceneId;actorId:string;targetId?:string;payload?:JsonValue}): StoryEvent {
  return {
    eventId: crypto.randomUUID(), type: params.type, occurredAt: new Date().toISOString(), storyDate: "2026-07-15",
    deviceId: params.deviceId, sceneId: params.sceneId, actorId: params.actorId, targetId: params.targetId, payload: params.payload ?? {}
  };
}
