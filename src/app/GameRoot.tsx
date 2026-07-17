import { useGame } from "./GameContext";
import { PhoneFrame } from "@/shell/PhoneFrame";

export function GameRoot() {
  const { ready, activeDeviceId, switchDevice, reset, state } = useGame();
  if (!ready) return <main className="loading">正在恢复本地设备……</main>;
  return <main className="prototype-stage">
    <section className="prototype-toolbar" aria-label="开发原型控制">
      <div><strong>11:52</strong><span>可运行仓库 V0.1 · 视觉层待按冻结截图精修</span></div>
      <div className="device-tabs" role="tablist">
        <button data-testid="switch-player" className={activeDeviceId==="player"?"active":""} onClick={()=>switchDevice("player")}>我的手机</button>
        <button data-testid="switch-investigation" className={activeDeviceId==="investigation"?"active":""} onClick={()=>switchDevice("investigation")}>调查手机</button>
      </div>
      <button className="text-button" onClick={()=>void reset()}>重置本地存档</button>
    </section>
    <PhoneFrame deviceId={activeDeviceId} />
    <aside className="prototype-status" aria-label="原型状态">
      <span data-testid="current-scene">场景：{state.story.currentSceneId}</span><span>修正：{state.world.correctionStage}</span><span>修订：{state.revision}</span>
    </aside>
  </main>;
}
