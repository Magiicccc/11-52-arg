import { useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, unlockedItemsForApp } from "@/content/selectors";
import { getPath } from "@/engine/path-utils";

export function SettingsApp(){
  const {state,activeDeviceId,emit}=useGame();
  const [airplane,setAirplane]=useState(activeDeviceId==="investigation");
  const [profileOpen,setProfileOpen]=useState(false);
  const item=unlockedItemsForApp(state,"app.settings")[0];
  const b=item?activeBody(state,item) as Record<string,unknown>:{};
  const playerGlitch=getPath(state,"world.flags.player.avatarGlitch")===true;
  const ownerInspected=state.story.completedSceneIds.includes("A1-02");
  const inspectOwner=()=>{
    if(activeDeviceId==="investigation") emit("settings.account.inspected","setting.owner.invalid",{panel:"account"});
    else emit("content.item.opened","settings.account.player",{panel:"account",source:"P"});
    setProfileOpen(value=>!value);
  };
  return <AppChrome title="设置">
    <button className="settings-profile" data-testid="inspect-owner" onClick={inspectOwner}>
      <span className="avatar">{activeDeviceId==="player"&&!playerGlitch?"我":"?"}</span>
      <span><b>{activeDeviceId==="player"?(playerGlitch?"未设置":"我的账户"):String(b.owner??"无法验证账户身份")}</b><small>{ownerInspected&&activeDeviceId==="investigation"?"本机发现一段家庭语音":"Apple账户、iCloud与媒体购买"}</small></span>
      <i>›</i>
    </button>
    {profileOpen&&<section className="settings-account-sheet"><b>{activeDeviceId==="player"?"Apple 账户":"账户信息"}</b><p>{activeDeviceId==="player"?"iCloud、媒体购买与设备备份均使用当前本机账户。":"账户身份无法在线验证；仅显示本机缓存信息。"}</p><button onClick={()=>setProfileOpen(false)}>完成</button></section>}
    <div className="settings-group">
      <button className="settings-toggle" data-testid="app-effective-action" onClick={()=>setAirplane(v=>!v)}><b>飞行模式</b><span>{airplane?"已开启":"已关闭"}</span></button>
      <p><b>设备名称</b><span>{activeDeviceId==="player"?"我的 iPhone":String(b.deviceName??"iPhone")}</span></p>
      <p><b>同步</b><span>{activeDeviceId==="player"?"正常":String(b.sync??"已暂停")}</span></p>
      <p><b>上次备份</b><span>{String(b.lastBackup??"今天 03:12")}</span></p>
    </div>
  </AppChrome>;
}
