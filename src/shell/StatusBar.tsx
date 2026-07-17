import { useEffect, useState } from "react";
import type { DeviceId } from "@/contracts/game-state";
import { useGame } from "@/app/GameContext";

export function StatusBar({deviceId}:{deviceId:DeviceId}) {
 const {state}=useGame();
 const [time,setTime]=useState(()=>new Date());
 useEffect(()=>{const id=setInterval(()=>setTime(new Date()),30000);return()=>clearInterval(id)},[]);
 const device=state.devices[deviceId];
 const onWallpaper=device.activeAppId===null&&!device.locked;
 return <div className={`status-bar ${onWallpaper?"status-bar-on-wallpaper":""}`}>
   <time dateTime={time.toISOString()}>{time.toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:false})}</time>
   <span className="dynamic-island" aria-hidden="true"/>
   <span className="status-icons" aria-label={device.networkMode==="simulated-online"?"5G，电量 78%":"飞行模式，电量 78%"}>
     {device.networkMode==="simulated-online"
       ? <><span className="cellular" aria-hidden="true"><i/><i/><i/><i/></span><span className="network-label">5G</span></>
       : <span className="airplane" aria-hidden="true">✈︎</span>}
     <span className="battery" aria-hidden="true"><i/></span>
   </span>
 </div>;
}
