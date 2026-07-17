import { useEffect } from "react";
import { useGame } from "@/app/GameContext";

export function NotificationToast(){
  const {state,openApp,setUiFlag}=useGame();
  const dismissed=state.world.flags["ui.toastDismissed"]===true;
  const queue=state.responses.queuedResponseIds;
  const latest=queue.at(-1);

  useEffect(()=>{
    if(!latest||dismissed) return;
    const timer=window.setTimeout(()=>setUiFlag("toastDismissed",true),3600);
    return ()=>window.clearTimeout(timer);
  },[dismissed,latest]);

  if(!latest||dismissed)return null;
  const text=latest.includes("417_index")
    ?"文件传输助手：收到 417_index.json"
    :latest.includes("note.remnant")
      ?"备忘录：通知预览仍保留一段文字"
      :"微信：你收到一条新消息";
  return <button className="notification-toast" onClick={()=>{
    openApp(latest.includes("note.remnant")?"app.notes":"app.wechat");
    setUiFlag("toastDismissed",true);
  }}><b>{text.split("：")[0]}</b><span>{text.split("：")[1]}</span></button>;
}
