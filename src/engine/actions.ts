import type { GameState, AnchorType, DeviceId } from "@/contracts/game-state";
import type { Action } from "@/contracts/triggers";
import { getPath, setPath } from "./path-utils";

export interface AppliedActionResult { state: GameState; emitted: { type: string; payload: unknown }[]; }

export function applyActions(input: GameState, actions: Action[]): AppliedActionResult {
  const state = structuredClone(input);
  const emitted: {type:string;payload:unknown}[] = [];
  for (const action of actions) {
    switch (action.type) {
      case "setFlag": setPath(state as unknown as Record<string, unknown>, action.path, action.value); break;
      case "emitEvent": emitted.push({ type: action.eventType, payload: action.payload }); break;
      case "setContentVariant": state.content.activeVariantByContentId[action.contentId] = action.variantId; break;
      case "unlockContent": if (!state.content.unlockedContentIds.includes(action.contentId)) state.content.unlockedContentIds.push(action.contentId); break;
      case "enqueueMessage": {
        if (!state.content.unlockedContentIds.includes(action.messageId)) state.content.unlockedContentIds.push(action.messageId);
        state.responses.queuedResponseIds.push(`message:${action.threadId}:${action.messageId}`);
        state.devices.investigation.unreadByApp["app.wechat"] = (state.devices.investigation.unreadByApp["app.wechat"] ?? 0) + 1;
        break;
      }
      case "showNotification": state.responses.queuedResponseIds.push(action.notificationId); break;
      case "adjustAnchor": {
        const subject = action.subjectId === "actor.shenchuan" ? state.anchors.shenChuan : state.anchors.player;
        const key = action.anchorType as AnchorType;
        subject[key] = Math.max(-5, Math.min(5, (subject[key] ?? 0) + action.delta));
        break;
      }
      case "adjustCorrection": {
        const key = action.channel as keyof GameState["world"]["correctionVector"];
        if (key in state.world.correctionVector) state.world.correctionVector[key] = Math.max(0, Math.min(100, state.world.correctionVector[key] + action.delta));
        break;
      }
      case "setCorrectionStage": state.world.correctionStage = action.stage; break;
      case "activateScene": state.story.currentSceneId = action.sceneId; break;
      case "completeScene": {
        if (!state.story.completedSceneIds.includes(action.sceneId)) state.story.completedSceneIds.push(action.sceneId);
        state.story.currentSceneId = action.sceneId;
        break;
      }
      case "satisfyGate": state.story.gates[action.gateId] = true; break;
      case "markEvidence": {
        const target = action.stage === "confirmed" ? state.evidence.confirmed : action.stage === "interpreted" ? state.evidence.interpreted : state.evidence.discovered;
        if (!target.includes(action.evidenceId)) target.push(action.evidenceId);
        if (action.sourceRootId) state.evidence.sourceRoots[action.evidenceId] = action.sourceRootId;
        break;
      }
      case "createCheckpoint": if (!state.story.checkpoints.includes(action.checkpointId)) state.story.checkpoints.push(action.checkpointId); break;
      default: throw new Error(`Unsupported story action: ${String((action as {type?:unknown}).type)}`);
    }
  }
  state.devices.investigation.locked = getPath(state, "world.flags.device.investigation.unlocked") === true ? false : state.devices.investigation.locked;
  state.revision += 1;
  return { state, emitted };
}
