import { useRef } from "react";
import { useGame } from "./GameContext";
import { PhoneFrame } from "@/shell/PhoneFrame";
import { isQaMode } from "@/lib/qa-mode";
import { buildMeta } from "@/lib/build-meta";

export function GameRoot() {
  const { ready, activeDeviceId, switchDevice, reset, state } = useGame();
  const pointerStart=useRef<number|null>(null);
  const qaMode=isQaMode();
  if (!ready) return <main className="loading">正在恢复本地设备……</main>;
  return <main
    className={`prototype-stage ${qaMode?"qa-mode":""}`}
    onPointerDown={event=>{
      const width=event.currentTarget.getBoundingClientRect().width;
      pointerStart.current=event.clientX<=24||event.clientX>=width-24?event.clientX:null;
    }}
    onPointerUp={event=>{
      if(pointerStart.current===null) return;
      const delta=event.clientX-pointerStart.current;
      pointerStart.current=null;
      if(Math.abs(delta)<80) return;
      switchDevice(delta<0?"investigation":"player");
    }}
  >
    {qaMode&&<section className="prototype-toolbar" aria-label="QA 控制">
      <div><strong>11:52</strong><span data-testid="qa-build-meta">build {buildMeta.commit.slice(0,12)} · workflow {buildMeta.workflowRun}</span></div>
      <div className="device-tabs" role="tablist">
        <button data-testid="switch-player" className={activeDeviceId==="player"?"active":""} onClick={()=>switchDevice("player")}>我的手机</button>
        <button data-testid="switch-investigation" className={activeDeviceId==="investigation"?"active":""} onClick={()=>switchDevice("investigation")}>调查手机</button>
      </div>
      <button className="text-button" onClick={()=>void reset()}>重置本地存档</button>
    </section>}
    <PhoneFrame deviceId={activeDeviceId} />
    {qaMode&&<aside className="prototype-status" aria-label="QA 状态">
      <span data-testid="current-scene">场景：{state.story.currentSceneId}</span><span>修正：{state.world.correctionStage}</span><span>修订：{state.revision}</span>
    </aside>}
  </main>;
}
