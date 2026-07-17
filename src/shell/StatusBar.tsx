import { useEffect, useState } from "react";
import type { DeviceId } from "@/contracts/game-state";
export function StatusBar({deviceId}:{deviceId:DeviceId}) {
 const [time,setTime]=useState(()=>new Date()); useEffect(()=>{const id=setInterval(()=>setTime(new Date()),30000);return()=>clearInterval(id)},[]);
 return <div className="status-bar"><span>{time.toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:false})}</span><span className="dynamic-island"/><span>{deviceId==="investigation"?"飞行模式":"5G"} ◉ 78%</span></div>;
}
