import { useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem } from "@/content/selectors";

type CallBody = {
  caller: string;
  duration: number;
  events: { at: string; text: string }[];
  voicemailTranscript: string;
  textAlternative: string;
};

export function PhoneApp() {
  const { state, emit } = useGame();
  const [showAll,setShowAll]=useState(false);
  const item = getContentItem("a3.unknown.call");
  const unlocked = state.content.unlockedContentIds.includes("a3.unknown.call");
  if (!unlocked || !item) return <AppChrome title="电话">{showAll?<section className="phone-recents-empty" role="status"><h1>最近通话</h1><p>当前设备没有可显示的最近通话。</p><p>FaceTime 音频和已删除记录不会出现在这里。</p><button onClick={()=>setShowAll(false)}>返回空列表</button></section>:<button className="empty-state" data-testid="app-effective-action" onClick={()=>{setShowAll(true);emit("phone.recents.filtered","phone.recents",{filter:"all"})}}>没有最近通话 · 查看全部记录</button>}</AppChrome>;
  const body = activeBody(state, item) as CallBody;
  const completed = state.story.completedSceneIds.includes("A3-05");
  const fallback = state.world.flags.a3 && (state.world.flags.a3 as Record<string, unknown>).audioFallbackUsed === true;
  const voicemail = state.world.flags.a3 && (state.world.flags.a3 as Record<string, unknown>).voicemailCreated === true;
  return <AppChrome title="电话">
    <div className="unknown-call" data-testid="unknown-call">
      <header><span>未知来电</span><h2>{body.caller}</h2><b>{body.duration}.0 秒</b></header>
      <div className="waveform" aria-label="八秒环境声波形">{body.events.map((event) => <i key={event.at}/>)}</div>
      <ol className="audio-events">{body.events.map((event) => <li key={event.at}><time>{event.at}</time><span>{event.text}</span></li>)}</ol>
      {!completed && <div className="call-actions">
        <button data-testid="reject-unknown-call" onClick={() => emit("unknown.call.completed", "call.rejected", { duration: body.duration })}>拒接</button>
        <button data-testid="answer-unknown-call" onClick={() => emit("unknown.call.completed", "call.answered", { duration: body.duration })}>接听</button>
      </div>}
      <button className="secondary-action" data-testid="audio-load-fallback" onClick={() => emit("audio.fallback.opened", "a3.unknown.call", { reason: "media-load-failed" })}>音频无法加载：显示无障碍替代</button>
      {(fallback || voicemail) && <section className="fallback-transcript" data-testid="call-fallback">
        <b>{voicemail ? "语音留言 · 已生成" : "字幕、波形事件与文字替代"}</b>
        <p>{body.voicemailTranscript}</p><strong>{body.textAlternative}</strong>
      </section>}
    </div>
  </AppChrome>;
}
