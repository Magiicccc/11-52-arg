import { useState } from "react";
import type { DeviceId } from "@/contracts/game-state";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem } from "@/content/selectors";

type CallBody = {
  contact?: string;
  transcript?: string;
  status?: string;
};

export function LockScreen({deviceId}:{deviceId:DeviceId}) {
  const {state,openApp,emit}=useGame();
  const [callOpen,setCallOpen]=useState(false);
  const failures=Number(state.world.flags.passcodeFailures??0);
  const callItem=getContentItem("call.chenyu.lock.01");
  const callBody=callItem ? activeBody(state,callItem) as CallBody : {};
  const callReturned=state.story.completedSceneIds.includes("P02");

  const returnCall=()=>{
    emit("lockscreen.call.returned","call.chenyu.lock.01",{direction:"outgoing"});
    setCallOpen(true);
  };

  return <div className="lock-screen" data-testid="lock-screen">
    <div className="lock-date">7月15日 星期三</div><div className="lock-time">11:52</div>
    <div className="lock-clue-card"><span>照片回忆</span><strong>桥下咖啡 · 2023.09.17</strong><small>两张车票 · 两杯咖啡</small></div>
    <div className="lock-notifications">
      <button onClick={()=>{emit("notification.opened","app.tieba",{source:"P"});openApp("app.tieba")}}><b>百度贴吧</b><span>你关注的回答已删除</span></button>
      <button onClick={()=>{emit("notification.opened","app.baidunetdisk",{source:"P"});openApp("app.baidunetdisk")}}><b>百度网盘</b><span>1个文件等待同步</span></button>
      <button data-testid="lock-call-chenyu" onClick={returnCall}><b>陈屿</b><span>{callReturned?"刚刚已回拨":"未接来电 · 点按回拨"}</span></button>
    </div>
    {failures>0&&<p className="lock-error">密码不正确（{failures}）</p>}
    <button className="unlock-hint" data-testid="open-passcode" onClick={()=>openApp("__passcode__")}>向上轻扫以解锁</button>
    {callOpen&&<section className="call-sheet" data-testid="chenyu-lock-reply" role="dialog" aria-label="与陈屿的回拨通话">
      <div className="call-sheet-avatar">陈</div>
      <h2>{callBody.contact??"陈屿"}</h2>
      <small>{callBody.status??"已接通"}</small>
      <p>“{callBody.transcript??"我不认识失主。你先别联网。"}”</p>
      <button className="hangup-button" onClick={()=>setCallOpen(false)}>结束通话</button>
    </section>}
  </div>;
}
