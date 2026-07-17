import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem } from "@/content/selectors";

type MapBody = {
  label: string;
  locationRef: string;
  referenceStatus: string;
  geometry: string;
  landmarks: string[];
  offlineSnapshot: string;
};
type SyncBody = { mapHome?: string };

export function BaiduMapApp() {
  const { state, activeDeviceId, emit } = useGame();
  const mapItem = getContentItem("a3.map.oldpark");
  const syncItem = getContentItem("a3.player.sync");
  const unlocked = state.content.unlockedContentIds.includes("a3.map.oldpark");

  if (activeDeviceId === "player") {
    const sync = syncItem ? activeBody(state, syncItem) as SyncBody : {};
    return <AppChrome title="百度地图">
      <div className="map-shell">
        <div className="map-canvas player-map"><span>收藏</span><b>{sync.mapHome ?? "家"}</b><small>常用地点</small></div>
        <button className="secondary-action" data-testid="app-effective-action" onClick={()=>emit("map.favorite.inspected","player.home",{label:sync.mapHome??"家"})}>查看收藏地点信息</button>
        {state.story.completedSceneIds.includes("A3-09") && <section className="reference-gap-card" data-testid="player-map-eroded">
          “家”已同步为普通收藏地点；历史路线仍保留，但不再标记家庭关系。
        </section>}
      </div>
    </AppChrome>;
  }

  if (!unlocked || !mapItem) return <AppChrome title="百度地图"><button className="empty-state" data-testid="app-effective-action" onClick={()=>emit("map.layer.inspected","map.empty",{layer:"favorites"})}>尚无可查看地点 · 查看收藏图层</button></AppChrome>;
  const body = activeBody(state, mapItem) as MapBody;
  const offline = state.devices.investigation.networkMode === "offline";
  return <AppChrome title="百度地图">
    <div className="map-shell" data-testid={offline ? "map-offline" : "map-online"}>
      <div className={`map-canvas ${offline ? "offline" : ""}`}>
        <span>{offline ? body.offlineSnapshot : "模拟在线地图 · 临时几何"}</span>
        <b>{body.label}</b>
        <small>{body.locationRef}</small>
        <i>非比例示意 · 不含真实地址</i>
      </div>
      <section className="reference-gap-card"><b>{body.referenceStatus}</b><span>地点包尚未绑定；当前仅显示冻结生产令牌。</span></section>
      <div className="map-landmarks">{body.landmarks.map((landmark, index) => <span key={landmark}><i>{index + 1}</i>{landmark}</span>)}</div>
      <button className="secondary-action" data-testid="toggle-map-network" onClick={() => emit("map.network.mode.changed", offline ? "map.mode.online" : "map.mode.offline", { fallback: !offline })}>
        {offline ? "恢复模拟在线地图" : "模拟地图服务不可用"}
      </button>
      {!state.story.completedSceneIds.includes("A3-02") && <button className="primary-action" data-testid="confirm-map-location" onClick={() => emit("map.location.opened", body.locationRef, { landmarks: body.landmarks })}>确认三个现场基准</button>}
    </div>
  </AppChrome>;
}
