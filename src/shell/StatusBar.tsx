import { useEffect, useState } from "react";
import type { DeviceId } from "@/contracts/game-state";
import { useGame } from "@/app/GameContext";
import { projectStatusBar } from "./status-bar-model";

export function StatusBar({deviceId}:{deviceId:DeviceId}) {
 const {state}=useGame();
 const [time,setTime]=useState(()=>new Date());
 useEffect(()=>{const id=setInterval(()=>setTime(new Date()),30000);return()=>clearInterval(id)},[]);
 const device=state.devices[deviceId];
 const model=projectStatusBar(state,deviceId);
 const onWallpaper=device.activeAppId===null&&!device.locked;
 return <div className={`status-bar ${onWallpaper?"status-bar-on-wallpaper":""}`}>
   <time dateTime={time.toISOString()}>{time.toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:false})}</time>
   <span className="dynamic-island" aria-hidden="true"/>
   <span className="status-icons" data-network={model.network} data-low-battery={model.lowBattery?"true":"false"} aria-label={`${model.networkLabel}，电量 ${model.batteryLevel}%`}>
     {model.network==="cellular"&&<><span className="cellular" aria-hidden="true"><i/><i/><i/><i/></span><span className="network-label">5G</span></>}
     {model.network==="wifi"&&<span className="wifi" aria-hidden="true"><i/><i/><i/></span>}
     {model.network==="no-service"&&<span className="no-service" aria-hidden="true">无服务</span>}
     {model.network==="airplane"&&<span className="airplane" aria-hidden="true">✈︎</span>}
     <span className={`battery ${model.lowBattery?"low":""}`} aria-hidden="true"><i style={{width:`${model.batteryLevel}%`}}/></span>
   </span>
 </div>;
}
