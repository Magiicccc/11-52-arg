import { useRef, useState, type UIEvent } from "react";
import type { DeviceId } from "@/contracts/game-state";
import { appManifests } from "@/content/content-pack";
import { useGame } from "@/app/GameContext";
import { getPath } from "@/engine/path-utils";
import { assetUrl } from "@/lib/asset-url";

const dockAppIds = ["app.phone", "app.wechat", "app.safari", "app.photos"];
const pageAppIds = [
  ["app.baidu_map", "app.files", "app.notes", "app.calendar", "app.settings", "app.qqmail", "app.xiaohongshu", "app.douyin"],
  ["app.zhihu", "app.tieba", "app.toutiao", "app.baidunetdisk", "app.alipay", "app.didi", "app.meituan", "app.taobao", "app.netease_music", "app.wechat_reading", "app.health", "app.weather"],
  ["app.railway12306", "app.clock", "app.calculator", "app.camera", "app.voice_memos", "app.compass"]
];

function runtimeIconPath(path: string): string {
  if (path.startsWith("/icons/system/")) {
    return path.replace("/icons/system/", "/icons/system/runtime/");
  }
  return path.replace("/icons/third_party/", "/icons/third_party/runtime/").replace(/\.png$/i, ".webp");
}

function badgeLabel(count: number): string {
  return count > 99 ? "99+" : String(count);
}

function AppIconImage({ path }: { path: string }) {
  const [attempt, setAttempt] = useState(0);
  const resolved = assetUrl(runtimeIconPath(path));
  const src = attempt === 0 ? resolved : `${resolved}?retry=${attempt}`;
  return <img
    className="app-icon-image"
    src={src}
    alt=""
    fetchPriority="high"
    onError={() => setAttempt((current) => current < 2 ? current + 1 : current)}
  />;
}

export function HomeScreen({deviceId}:{deviceId:DeviceId}){
  const {openApp,state}=useGame();
  const apps=appManifests.filter(a=>a.deviceAvailability.includes(deviceId));
  const byId=new Map(apps.map(app=>[app.id,app]));
  const pages=pageAppIds.map(ids=>ids.map(id=>byId.get(id)).filter((app):app is (typeof apps)[number]=>Boolean(app)));
  const dock=dockAppIds.map(id=>byId.get(id)).filter((app):app is (typeof apps)[number]=>Boolean(app));
  const playerGlitch=getPath(state,"world.flags.player.avatarGlitch")===true;
  const [pageIndex,setPageIndex]=useState(0);
  const pagesRef=useRef<HTMLDivElement>(null);
  const onPageScroll=(event:UIEvent<HTMLDivElement>)=>{
    const width=event.currentTarget.clientWidth;
    if(width>0) setPageIndex(Math.round(event.currentTarget.scrollLeft/width));
  };
  const renderIcon=(app:(typeof apps)[number],location:"page"|"dock")=>{
    const badgeCount=state.devices[deviceId].unreadByApp[app.id]??0;
    return <button
      className={`app-icon-button app-icon-${location}`}
      data-testid={`app-${app.id}`}
      key={app.id}
      onClick={()=>openApp(app.id)}
      aria-label={badgeCount>0?`${app.displayName}，${badgeCount} 条未读`:app.displayName}
    >
      <span className="icon-wrap">
        <AppIconImage path={app.iconAsset}/>
        {badgeCount>0&&<span className="app-badge" aria-hidden="true">{badgeLabel(badgeCount)}</span>}
      </span>
      {location==="page"&&<span className="app-icon-label">{app.displayName}</span>}
    </button>;
  };
  return <div className="home-screen" data-testid="home-screen">
    <div className="home-wallpaper" aria-hidden="true"/>
    {deviceId==="player"&&playerGlitch&&<span className="avatar-glitch-pulse" aria-label="头像暂时无法显示"/>}
    <div className="home-pages" ref={pagesRef} onScroll={onPageScroll}>
      {pages.map((page,p)=><div className="home-page" key={p}>{page.map(app=>renderIcon(app,"page"))}</div>)}
    </div>
    <div className="page-dots" aria-label={`第 ${pageIndex+1} 页，共 ${pages.length} 页`}>
      {pages.map((_,index)=><i className={index===pageIndex?"active":""} key={index}/>)}
    </div>
    <div className="home-dock" aria-label="Dock">{dock.map(app=>renderIcon(app,"dock"))}</div>
  </div>;
}
