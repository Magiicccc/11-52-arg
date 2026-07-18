import { lazy, Suspense, useCallback, useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem } from "@/content/selectors";
import { isQaMode } from "@/lib/qa-mode";
import { temporaryMapPois, type TemporaryMapPoi } from "@/content/realism-life-data";
const DeidentifiedMap = lazy(async () => {
  const module = await import("./DeidentifiedMap");
  return { default: module.DeidentifiedMap };
});

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
  const { state, activeDeviceId, emit, setUiFlag } = useGame();
  const mapItem = getContentItem("a3.map.oldpark");
  const syncItem = getContentItem("a3.player.sync");
  const unlocked = state.content.unlockedContentIds.includes("a3.map.oldpark");
  const qaMode = isQaMode();
  const offline = state.devices[activeDeviceId].networkMode === "offline";
  const savedSelected=state.world.flags[`ui.baiduMap.selected.${activeDeviceId}`];
  const [selectedPoiId,setSelectedPoiIdState]=useState<string|null>(typeof savedSelected==="string"?savedSelected:null);
  const routeVisible=state.world.flags[`ui.baiduMap.route.${activeDeviceId}`]===true;
  const [query,setQuery]=useState("");
  const [mapError,setMapError]=useState<string|null>(null);
  const [layer,setLayer]=useState("地图");
  const selectedPoi=temporaryMapPois.find((poi)=>poi.id===selectedPoiId)??null;

  const selectPoi=useCallback((poi:TemporaryMapPoi)=>{
    setSelectedPoiIdState(poi.id);
    setUiFlag(`baiduMap.selected.${activeDeviceId}`,poi.id);
    emit("map.poi.opened",poi.id,{name:poi.name,category:poi.category,source:"P",temporary:true});
  },[activeDeviceId,emit,setUiFlag]);
  const recordViewport=useCallback((viewport:{center:[number,number];zoom:number})=>{
    setUiFlag(`baiduMap.viewport.${activeDeviceId}`,viewport);
  },[activeDeviceId,setUiFlag]);
  const markReady=useCallback(()=>setUiFlag(`baiduMap.ready.${activeDeviceId}`,true),[activeDeviceId,setUiFlag]);
  const markError=useCallback((message:string)=>{setMapError(message);setUiFlag(`baiduMap.error.${activeDeviceId}`,message)},[activeDeviceId,setUiFlag]);
  const runSearch=(event:React.FormEvent)=>{
    event.preventDefault();
    const normalized=query.trim();
    const match=temporaryMapPois.find((poi)=>poi.name.includes(normalized)||poi.category.includes(normalized));
    emit("app.search.submitted","app.baidu_map",{query:normalized,matchedPoiId:match?.id??null,source:"P"});
    if(match)selectPoi(match);
  };

  if (!unlocked || !mapItem) {
    return <MapShell
      offline={offline}
      query={query}
      onQuery={setQuery}
      onSearch={runSearch}
      layer={layer}
      onLayer={setLayer}
      selectedPoi={selectedPoi}
      routeVisible={routeVisible}
      onRoute={()=>setUiFlag(`baiduMap.route.${activeDeviceId}`,!routeVisible)}
      onNetwork={()=>emit("map.network.mode.changed",offline?"map.mode.online":"map.mode.offline",{fallback:!offline,source:"P"})}
      mapError={mapError}
      onSelectPoi={selectPoi}
      onViewportChanged={recordViewport}
      onReady={markReady}
      onError={markError}
    >
      <section className="map-empty-history"><h2>最近查看</h2>{temporaryMapPois.slice(0,5).map((poi)=><button data-testid={poi.id==="poi.temp.01"?"app-effective-action":undefined} key={poi.id} onClick={()=>selectPoi(poi)}><span>{poi.category.slice(0,1)}</span><div><b>{poi.name}</b><small>{poi.detail}</small></div></button>)}</section>
    </MapShell>;
  }

  const body = activeBody(state, mapItem) as MapBody;
  const sync = syncItem ? activeBody(state, syncItem) as SyncBody : {};
  const title=activeDeviceId==="player"?(sync.mapHome??"家"):body.label;
  return <MapShell
    offline={offline}
    query={query}
    onQuery={setQuery}
    onSearch={runSearch}
    layer={layer}
    onLayer={setLayer}
    selectedPoi={selectedPoi}
    routeVisible={routeVisible}
    onRoute={()=>{
      setUiFlag(`baiduMap.route.${activeDeviceId}`,!routeVisible);
      emit("map.route.toggled",selectedPoi?.id??"poi.temp.14",{visible:!routeVisible,source:"P",temporary:true});
    }}
    onNetwork={()=>emit("map.network.mode.changed",offline?"map.mode.online":"map.mode.offline",{fallback:!offline,source:"P"})}
    mapError={mapError}
    onSelectPoi={selectPoi}
    onViewportChanged={recordViewport}
    onReady={markReady}
    onError={markError}
  >
    {activeDeviceId==="player"&&<section className="map-favorite-card" data-testid={state.story.completedSceneIds.includes("A3-09")?"player-map-eroded":undefined}>
      <span>收藏地点</span><h2>{title}</h2><p>{state.story.completedSceneIds.includes("A3-09")?"已同步为普通收藏地点；历史路线不再标记家庭关系。":"常用地点"}</p>
      <button data-testid="app-effective-action" onClick={()=>emit("map.favorite.inspected","player.home",{label:title,source:"P"})}>查看收藏详情</button>
    </section>}
    {activeDeviceId==="investigation"&&<>
      {qaMode&&<section className="reference-gap-card"><b>{body.referenceStatus}</b><span>{body.locationRef} 未绑定；地图为去标识化离线矢量测试区，不代表现实地址。</span></section>}
      <section className="map-evidence-card"><span>{offline?body.offlineSnapshot:"地图定位"}</span><h2>{body.label}</h2><p>公共外围基准：{body.landmarks.join("、")}</p><small>地点生产令牌未绑定，当前不显示门牌或现实地址。</small></section>
      {!state.story.completedSceneIds.includes("A3-02")&&<button className="primary-action" data-testid="confirm-map-location" onClick={()=>emit("map.location.opened",body.locationRef,{landmarks:body.landmarks,source:"P",temporaryGeometry:true})}>确认三个现场基准</button>}
    </>}
  </MapShell>;
}

function MapShell({
  offline,query,onQuery,onSearch,layer,onLayer,selectedPoi,routeVisible,onRoute,onNetwork,mapError,
  onSelectPoi,onViewportChanged,onReady,onError,children
}:{
  offline:boolean;
  query:string;
  onQuery(value:string):void;
  onSearch(event:React.FormEvent):void;
  layer:string;
  onLayer(value:string):void;
  selectedPoi:TemporaryMapPoi|null;
  routeVisible:boolean;
  onRoute():void;
  onNetwork():void;
  mapError:string|null;
  onSelectPoi(poi:TemporaryMapPoi):void;
  onViewportChanged(viewport:{center:[number,number];zoom:number}):void;
  onReady():void;
  onError(message:string):void;
  children:React.ReactNode;
}) {
  return <AppChrome title="百度地图">
    <div className="baidu-map-real" data-testid={offline?"map-offline":"map-online"}>
      <form className="map-search-bar" onSubmit={onSearch}><button type="button" aria-label="个人中心" onClick={()=>onLayer("个人中心")}>☰</button><input value={query} onChange={(event)=>onQuery(event.target.value)} placeholder="搜地点、查路线"/><button type="submit">搜索</button></form>
      <nav className="map-layer-tabs">{["地图","公交","路况","骑行"].map((label)=><button className={layer===label?"active":""} key={label} onClick={()=>onLayer(label)}>{label}</button>)}</nav>
      <section className="map-stage">
        <Suspense fallback={<div className="map-loading-card">正在载入本机离线地图…</div>}>
          <DeidentifiedMap selectedPoiId={selectedPoi?.id??null} routeVisible={routeVisible} onSelectPoi={onSelectPoi} onViewportChanged={onViewportChanged} onReady={onReady} onError={onError}/>
        </Suspense>
        {offline&&<span className="map-offline-badge">离线地图 · 本机矢量包</span>}
        {mapError&&<div className="map-render-error"><b>地图画布暂不可用</b><p>已保留搜索、POI列表、路线文字与剧情入口。</p></div>}
      </section>
      <div className="map-quick-actions"><button onClick={onRoute}>{routeVisible?"收起路线":"路线"}</button><button data-testid="toggle-map-network" onClick={onNetwork}>{offline?"恢复在线模式":"离线地图"}</button><button onClick={()=>onLayer("路况")}>路况</button><button onClick={()=>onLayer("公交")}>公交</button></div>
      {selectedPoi&&<section className="map-poi-sheet"><header><div><h2>{selectedPoi.name}</h2><p>{selectedPoi.category} · {selectedPoi.detail}</p></div><button onClick={onRoute}>{routeVisible?"结束路线":"到这里"}</button></header><nav><button onClick={()=>onSelectPoi(selectedPoi)}>收藏</button><button onClick={onRoute}>路线</button><button onClick={()=>onLayer(`已分享：${selectedPoi.name}`)}>分享</button><button onClick={()=>onLayer("附近")}>附近</button></nav></section>}
      <div className="map-support-content">{children}</div>
      <nav className="map-bottom-nav"><button className="active" onClick={()=>onLayer("地图")}>地图</button><button onClick={()=>onLayer("路线")}>路线</button><button onClick={()=>onLayer("出行")}>出行</button><button onClick={()=>onLayer("我的")}>我的</button></nav>
    </div>
  </AppChrome>;
}
