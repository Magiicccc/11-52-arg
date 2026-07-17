import type { GameState } from "@/contracts/game-state";
import type { Condition } from "@/contracts/triggers";
import { getPath } from "./path-utils";

export function evaluateCondition(state: GameState, condition: Condition): boolean {
  switch (condition.op) {
    case "all": return condition.conditions.every((item) => evaluateCondition(state, item));
    case "any": return condition.conditions.some((item) => evaluateCondition(state, item));
    case "not": return !evaluateCondition(state, condition.condition);
    case "flagEquals": return Object.is(getPath(state, condition.path), condition.value);
    case "sceneCompleted": return state.story.completedSceneIds.includes(condition.sceneId);
    case "contentVariantIs": return state.content.activeVariantByContentId[condition.contentId] === condition.variantId;
    case "evidenceAtLeast": {
      const list = condition.stage === "confirmed" ? state.evidence.confirmed : condition.stage === "interpreted" ? state.evidence.interpreted : state.evidence.discovered;
      return list.includes(condition.evidenceId);
    }
    case "triggerNotConsumed": return state.world.flags[`trigger.${condition.triggerId}.consumed`] !== true;
  }
}
