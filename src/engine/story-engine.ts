import type { GameState } from "@/contracts/game-state";
import type { EventReceipt, StoryEvent } from "@/contracts/story-event";
import type { TriggerDefinition } from "@/contracts/triggers";
import { applyActions } from "./actions";
import { evaluateCondition } from "./conditions";
import { getPath, setPath } from "./path-utils";

export interface EngineResult { state: GameState; journal: StoryEvent[]; receipts: EventReceipt[]; }

function matches(event: StoryEvent, trigger: TriggerDefinition): boolean {
  return trigger.when.type === event.type && (!trigger.when.targetId || trigger.when.targetId === event.targetId) && (!trigger.when.deviceId || trigger.when.deviceId === event.deviceId);
}

export function processStoryEvent(state: GameState, journal: StoryEvent[], receipts: EventReceipt[], event: StoryEvent, triggers: TriggerDefinition[]): EngineResult {
  if (journal.some((entry) => entry.eventId === event.eventId)) return { state, journal, receipts };
  let nextState = structuredClone(state);
  const triggerIds: string[] = [];
  const transactionIds: string[] = [];
  for (const trigger of [...triggers].sort((a,b) => b.priority - a.priority)) {
    if (!trigger.enabled || !matches(event, trigger) || !evaluateCondition(nextState, trigger.conditions)) continue;
    const transactionId = trigger.transaction?.idempotencyKey ?? crypto.randomUUID();
    const committedPath = trigger.transaction ? `world.flags.transactions.${trigger.transaction.idempotencyKey}` : "";
    if (committedPath && getPath(nextState, committedPath) === true) continue;
    try {
      const result = applyActions(nextState, trigger.actions);
      nextState = result.state;
      if (committedPath) setPath(nextState as unknown as Record<string, unknown>, committedPath, true);
    } catch (error) {
      if (!trigger.transaction?.atomic) throw error;
      continue;
    }
    if (trigger.once) nextState.world.flags[`trigger.${trigger.id}.consumed`] = true;
    nextState.world.flags[`trigger.${trigger.id}.source`] = trigger.responseSource;
    triggerIds.push(trigger.id);
    transactionIds.push(transactionId);
  }
  const receipt: EventReceipt = { eventId: event.eventId, triggerIds, transactionIds, committedAt: new Date().toISOString() };
  return { state: nextState, journal: [...journal, event], receipts: [...receipts, receipt] };
}
