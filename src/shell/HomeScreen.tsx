import type { DeviceId } from "@/contracts/game-state";
import { appManifests } from "@/content/content-pack";
import { useGame } from "@/app/GameContext";
import { getPath } from "@/engine/path-utils";

export function HomeScreen({deviceId}:{deviceId:DeviceId}){
  const {openApp,state}=useGame();
  const apps=appManifests.filter(a=>a.deviceAvailability.includes(deviceId));
  const pages=[apps.slice(0,20),apps.slice(20)];
  const playerGlitch=getPath(state,"world.flags.player.avatarGlitch")===true;
  const owner=deviceId==="player"?(playerGlitch?"未设置":"我的手机"):"";
  return <div className="home-screen" data-testid="home-screen">
    <div className="home-owner">{owner}</div>
    <div className="home-pages">{pages.map((page,p)=><div className="home-page" key={p}>{page.map(app=><button className="app-icon-button" data-testid={`app-${app.id}`} key={app.id} onClick={()=>openApp(app.id)}><span className="icon-wrap"><img src={app.iconAsset} alt=""/><i>{state.devices[deviceId].unreadByApp[app.id]||""}</i></span><span>{app.displayName}</span></button>)}</div>)}</div>
    <div className="page-dots"><i className="active"/><i/></div>
  </div>;
}
