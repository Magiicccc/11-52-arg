import { describe, expect, it } from "vitest";
import { createInitialGameState } from "@/engine/initial-state";
import { createStoryEvent } from "@/engine/event-factory";
import { processStoryEvent, type EngineResult } from "@/engine/story-engine";
import { triggers } from "@/content/content-pack";
import { validateCoordinateAssembly } from "@/a3/coordinate-assembly";
import { getPath } from "@/engine/path-utils";
import type { TriggerDefinition } from "@/contracts/triggers";

function stateAfter(sceneId:string) {
  const state=createInitialGameState();
  state.devices.investigation.locked=false;
  state.world.flags["device.investigation.unlocked"]=true;
  state.story.currentSceneId=sceneId;
  state.story.completedSceneIds.push(sceneId);
  return state;
}

function fire(result:EngineResult,type:string,targetId:string,deviceId:"investigation"|"player"="investigation") {
  const event=createStoryEvent({type,targetId,deviceId,sceneId:result.state.story.currentSceneId,actorId:"actor.player"});
  return processStoryEvent(result.state,result.journal,result.receipts,event,triggers);
}

describe("A3 runtime contracts",()=>{
  it("enters A3-01 from A2-11 and rejects an incorrect coordinate assembly",()=>{
    expect(validateCoordinateAssembly({latitudeSource:"NW01_original_image",longitudeTailSource:"IMG_0612_145237.HEIC",directionSource:"CY_MAP_CACHE_0714"})).toBe(false);
    const state=stateAfter("A2-11");
    let result:EngineResult={state,journal:[],receipts:[]};
    result=fire(result,"a3.coordinate.started","a3.coordinate.case");
    expect(result.state.story.currentSceneId).toBe("A3-01");
    result=fire(result,"coordinates.assembly.rejected","PZ-010");
    expect(result.state.story.completedSceneIds).not.toContain("A3-01");
  });

  it("accepts A3-01 only after all three source fragments were inspected",()=>{
    expect(validateCoordinateAssembly({latitudeSource:"IMG_0612_145237.HEIC",longitudeTailSource:"NW01_original_image",directionSource:"CY_MAP_CACHE_0714"})).toBe(true);
    let result:EngineResult={state:stateAfter("A2-11"),journal:[],receipts:[]};
    result=fire(result,"a3.coordinate.started","a3.coordinate.case");
    result=fire(result,"coordinate.source.inspected","IMG_0612_145237.HEIC");
    result=fire(result,"coordinate.source.inspected","NW01_original_image");
    result=fire(result,"coordinate.source.inspected","CY_MAP_CACHE_0714");
    result=fire(result,"coordinates.assembled","LOC_RIVER_EDU_OLD_01");
    expect(result.state.story.completedSceneIds).toContain("A3-01");
    expect(result.state.story.checkpoints).toContain("checkpoint.A3-01");
  });

  it("supports online map and frozen offline fallback without changing the location token",()=>{
    let result:EngineResult={state:stateAfter("A3-01"),journal:[],receipts:[]};
    result=fire(result,"map.network.mode.changed","map.mode.offline");
    expect(result.state.devices.investigation.networkMode).toBe("offline");
    result=fire(result,"map.location.opened","LOC_RIVER_EDU_OLD_01");
    expect(result.state.story.completedSceneIds).toContain("A3-02");
    result=fire(result,"map.network.mode.changed","map.mode.online");
    expect(result.state.devices.investigation.networkMode).toBe("simulated-online");
  });

  it("confirms distinct capture, create and modify metadata",()=>{
    let result:EngineResult={state:stateAfter("A3-03"),journal:[],receipts:[]};
    result=fire(result,"photo.metadata.signature.confirmed","IMG_0612_144611.HEIC");
    expect(result.state.story.completedSceneIds).toContain("A3-04");
    expect(result.state.evidence.confirmed).toContain("evidence.a3.metadata1152");
  });

  it.each([
    ["call.answered","answered"],
    ["call.rejected","voicemail"]
  ])("keeps the unknown-call %s path mainline-equivalent",(target,expected)=>{
    let result:EngineResult={state:stateAfter("A3-04"),journal:[],receipts:[]};
    result=fire(result,"unknown.call.completed",target);
    expect(result.state.story.completedSceneIds).toContain("A3-05");
    expect(getPath(result.state,"world.flags.a3.callPath")).toBe(expected);
    if(target==="call.rejected") expect(getPath(result.state,"world.flags.a3.voicemailCreated")).toBe(true);
  });

  it("records the accessible audio fallback",()=>{
    let result:EngineResult={state:stateAfter("A3-04"),journal:[],receipts:[]};
    result=fire(result,"audio.fallback.opened","a3.unknown.call");
    expect(getPath(result.state,"world.flags.a3.audioFallbackUsed")).toBe(true);
  });

  it("completes clean blue-mug blind validation only after voice and independent order",()=>{
    let result:EngineResult={state:stateAfter("A3-06"),journal:[],receipts:[]};
    result=fire(result,"wechat.media.clean.sent","photo.blue_mug.clean");
    result=fire(result,"audio.voice.played","voice.zhoulan.bluecup.r2");
    expect(result.state.story.completedSceneIds).not.toContain("A3-07");
    result=fire(result,"content.item.opened","a3.bluecup.order");
    expect(result.state.story.completedSceneIds).toContain("A3-07");
    expect(result.state.evidence.confirmed).toContain("evidence.a3.bluecup");
  });

  it("marks contaminated testimony and permits a clean retry",()=>{
    let result:EngineResult={state:stateAfter("A3-06"),journal:[],receipts:[]};
    result=fire(result,"wechat.media.contaminated.sent","dossier.blue_mug");
    expect(getPath(result.state,"world.flags.a3.bluecup.status")).toBe("contaminated");
    result=fire(result,"wechat.media.clean.sent","photo.blue_mug.clean");
    expect(getPath(result.state,"world.flags.a3.bluecup.status")).toBe("clean");
    result=fire(result,"audio.voice.played","voice.zhoulan.bluecup.r2");
    result=fire(result,"content.item.opened","a3.bluecup.order");
    expect(result.state.story.completedSceneIds).toContain("A3-07");
  });

  it("changes the same Zhou Lan recording from R2 to R3",()=>{
    let result:EngineResult={state:stateAfter("A3-07"),journal:[],receipts:[]};
    result=fire(result,"voice.variant.corrected","voice.zhoulan.bluecup");
    expect(result.state.content.activeVariantByContentId["a3.zhoulan.thread"]).toBe("a3.zhoulan.thread.r3");
    expect(result.state.world.correctionStage).toBe("R3");
    expect(result.state.story.completedSceneIds).toContain("A3-08");
  });

  it("commits A3-09 across both phones as one atomic checkpoint",()=>{
    let result:EngineResult={state:stateAfter("A3-08"),journal:[],receipts:[]};
    result=fire(result,"device.player.anchor_change.viewed","player.sync","player");
    expect(result.state.content.activeVariantByContentId["a3.player.sync"]).toBe("a3.player.sync.r3");
    expect(getPath(result.state,"world.flags.a3.playerSync.contactMom")).toBe("李女士");
    expect(getPath(result.state,"world.flags.a3.playerSync.mapHome")).toBe("收藏地点");
    expect(getPath(result.state,"world.flags.a3.playerSync.familyAlbumCount")).toBe(41);
    expect(getPath(result.state,"world.flags.a3.playerSync.axuNoticedAvatar")).toBe(true);
    expect(result.state.story.checkpoints).toContain("checkpoint.A3-09");
    expect(getPath(result.state,"world.flags.transactions.a3_09_player_sync_v1")).toBe(true);
  });

  it("does not apply A3-09 erosion twice",()=>{
    let result:EngineResult={state:stateAfter("A3-08"),journal:[],receipts:[]};
    result=fire(result,"device.player.anchor_change.viewed","player.sync","player");
    const family=result.state.anchors.player.family;
    result=fire(result,"device.player.anchor_change.viewed","player.sync","player");
    expect(result.state.anchors.player.family).toBe(family);
    expect(result.state.story.checkpoints.filter(value=>value==="checkpoint.A3-09")).toHaveLength(1);
  });

  it("rolls back all actions when an atomic transaction fails midway",()=>{
    const state=stateAfter("A3-08");
    const failing:TriggerDefinition={
      id:"trigger.test.atomic_failure",enabled:true,once:true,priority:999,
      when:{type:"test.atomic",targetId:"player.sync",deviceId:"player"},
      conditions:{op:"sceneCompleted",sceneId:"A3-08"},
      actions:[
        {type:"setFlag",path:"world.flags.test.partial",value:true},
        {type:"unsupported"} as never
      ],
      responseSource:"C",
      transaction:{id:"transaction.test.atomic_failure",atomic:true,rollbackPolicy:"allOrNothing",idempotencyKey:"test_atomic_failure"}
    };
    const event=createStoryEvent({type:"test.atomic",targetId:"player.sync",deviceId:"player",sceneId:"A3-08",actorId:"actor.player"});
    const result=processStoryEvent(state,[],[],event,[failing]);
    expect(getPath(result.state,"world.flags.test.partial")).toBeUndefined();
    expect(getPath(result.state,"world.flags.transactions.test_atomic_failure")).toBeUndefined();
  });

  it("offers video fallback and restores A3-10 progress/checkpoint from GameState",()=>{
    let result:EngineResult={state:stateAfter("A3-09"),journal:[],receipts:[]};
    result=fire(result,"video.fallback.opened","a3.site.video");
    expect(getPath(result.state,"world.flags.a3.videoFallbackUsed")).toBe(true);
    for(const cue of ["cue.3000","cue.5000","cue.11520","cue.14000","cue.19000","cue.24000"]) result=fire(result,"video.playback.progressed",cue);
    expect(getPath(result.state,"world.flags.a3.video.progressMs")).toBe(24000);
    result=fire(result,"video.playback.completed","a3.site.video");
    expect(result.state.story.currentSceneId).toBe("A3-10");
    expect(result.state.story.checkpoints).toContain("checkpoint.A3-10");
    expect(result.state.story.gates.G6).toBe(true);
    expect(getPath(result.state,"world.flags.story.a4EntryAvailable")).toBe(true);
    expect(result.state.story.completedSceneIds).not.toContain("A4-01");
  });
});
