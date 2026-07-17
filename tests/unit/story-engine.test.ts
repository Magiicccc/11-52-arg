import { describe, expect, it } from "vitest";
import { createInitialGameState } from "@/engine/initial-state";
import { createStoryEvent } from "@/engine/event-factory";
import { processStoryEvent } from "@/engine/story-engine";
import { triggers } from "@/content/content-pack";

describe("story engine", () => {
  it("keeps the investigation phone locked until the Chen Yu return call is completed", () => {
    const state=createInitialGameState();
    const passcodeEvent=createStoryEvent({type:"device.passcode.accepted",deviceId:"investigation",sceneId:"P01",actorId:"actor.player",targetId:"investigation"});
    const blocked=processStoryEvent(state,[],[],passcodeEvent,triggers);
    expect(blocked.state.devices.investigation.locked).toBe(true);

    const callEvent=createStoryEvent({type:"lockscreen.call.returned",deviceId:"investigation",sceneId:"P01",actorId:"actor.player",targetId:"call.chenyu.lock.01"});
    const afterCall=processStoryEvent(state,[],[],callEvent,triggers);
    const accepted=createStoryEvent({type:"device.passcode.accepted",deviceId:"investigation",sceneId:"P02",actorId:"actor.player",targetId:"investigation"});
    const result=processStoryEvent(afterCall.state,afterCall.journal,afterCall.receipts,accepted,triggers);
    expect(result.state.devices.investigation.locked).toBe(false);
    expect(result.state.story.completedSceneIds).toContain("P03");
  });
  it("is idempotent for the same event id", () => {
    const state=createInitialGameState();
    const event=createStoryEvent({type:"device.passcode.accepted",deviceId:"investigation",sceneId:"P02",actorId:"actor.player",targetId:"investigation"});
    const first=processStoryEvent(state,[],[],event,triggers);
    const second=processStoryEvent(first.state,first.journal,first.receipts,event,triggers);
    expect(second.state.revision).toBe(first.state.revision);
    expect(second.journal).toHaveLength(1);
  });
  it("corrects the note and unlocks a remnant after A2-08", () => {
    const state=createInitialGameState();
    state.story.completedSceneIds.push("A2-08");
    state.story.currentSceneId="A2-08";
    const event=createStoryEvent({type:"note.read.threshold_reached",deviceId:"investigation",sceneId:"A2-08",actorId:"actor.player",targetId:"note.validation.07"});
    const result=processStoryEvent(state,[],[],event,triggers);
    expect(result.state.content.activeVariantByContentId["note.validation.07"]).toBe("note.validation.07.v1");
    expect(result.state.content.unlockedContentIds).toContain("notification.note.remnant.content");
  });
});
