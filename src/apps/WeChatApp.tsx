import { useMemo, useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem, unlockedItemsForApp } from "@/content/selectors";
import type { ContentItem } from "@/contracts/content";
import { getPath } from "@/engine/path-utils";

type SearchResult = { app?: string; title?: string; detail?: string };
type Body={
  thread?:string;
  text?:string;
  time?:string;
  timeMode?:string;
  name?:string;
  content?:unknown;
  duration?:number;
  transcript?:string;
  query?:string;
  results?:SearchResult[];
  contact?:string;
  initialReplies?:string[];
  safetyReply?:string;
  voiceDuration?:number;
  voiceTranscript?:string;
  messageReference?:string;
  notificationPreview?:string;
  correctionMessages?:string[];
  sameMasterRecording?:boolean;
  momContact?:string;
  momMessages?:string[];
  axuMessages?:string[];
};

export function WeChatApp(){
  const {state,activeDeviceId,emit}=useGame();
  const [thread,setThread]=useState<string|null>(null);
  const [query,setQuery]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const [played,setPlayed]=useState<string[]>([]);
  const items=unlockedItemsForApp(state,"app.wechat");
  const zhoulanItem=getContentItem("a3.zhoulan.thread");
  const zhoulanBody=zhoulanItem?activeBody(state,zhoulanItem) as Body:undefined;
  const zhoulanUnlocked=state.content.unlockedContentIds.includes("a3.zhoulan.thread");
  const syncItem=getContentItem("a3.player.sync");
  const syncBody=syncItem?activeBody(state,syncItem) as Body:undefined;
  const playerSynced=state.story.completedSceneIds.includes("A3-09");
  const momLabel=playerSynced?(syncBody?.momContact??"李女士"):"妈妈";
  const threads=activeDeviceId==="player"
    ?[momLabel,"爸爸","阿序"]
    :["陈屿","妈","文件传输助手",...(state.content.unlockedContentIds.includes("message.pb_0425.01")?["PB_0425"]:[]),...(zhoulanUnlocked?["__zhoulan"]:[])];

  const searchItem=getContentItem("search.shenchuan.results");
  const searchBody=searchItem?activeBody(state,searchItem) as Body:undefined;
  const searchAvailable=Boolean(searchItem&&state.content.unlockedContentIds.includes(searchItem.id));
  const normalizedQuery=query.trim();
  const matchedSearch=searchAvailable&&normalizedQuery.includes("沈川");

  const fileTransferItem=useMemo(()=>{
    if(!state.content.unlockedContentIds.includes("file.417_index")) return undefined;
    return getContentItem("file.417_index");
  },[state.content.unlockedContentIds]);

  const threadItems=useMemo(()=>{
    const sourceThread=thread===momLabel&&playerSynced?"妈妈":thread;
    const result:ContentItem[]=items.filter(i=>(activeBody(state,i) as Body)?.thread===sourceThread);
    if(thread==="文件传输助手"&&fileTransferItem) result.push(fileTransferItem);
    return result;
  },[items,state,thread,fileTransferItem]);

  const runSearch=(event:React.FormEvent)=>{
    event.preventDefault();
    setShowSearch(true);
    if(matchedSearch) emit("app.search.submitted","search.shenchuan.results",{query:normalizedQuery});
  };

  if(thread==="__zhoulan"&&zhoulanBody) {
    const status=getPath(state,"world.flags.a3.bluecup.status");
    const voiceAvailable=getPath(state,"world.flags.a3.bluecup.voiceAvailable")===true;
    const voicePlayed=getPath(state,"world.flags.a3.bluecup.voicePlayed")===true;
    const corrected=state.story.completedSceneIds.includes("A3-08");
    return <AppChrome title={zhoulanBody.contact??"周岚"} actions={<button data-testid="wechat-conversations" onClick={()=>setThread(null)}>会话</button>}>
      <div className="chat-thread" data-testid="zhoulan-thread">
        {!state.story.completedSceneIds.includes("A3-06")&&<button className="primary-action" data-testid="contact-zhoulan" onClick={()=>emit("wechat.thread.zhoulan.opened","thread.zhoulan",{sentText:"您好，我在整理沈川留下的东西。"})}>发送：您好，我在整理沈川留下的东西。</button>}
        {state.story.completedSceneIds.includes("A3-06")&&<><div className="bubble mine">您好，我在整理沈川留下的东西。</div>{(zhoulanBody.initialReplies??["沈川？","不好意思，我不认识这个人。","这个号怎么会在我通讯录里？"]).map(text=><div className="bubble theirs" key={text}>{text}</div>)}</>}
        {state.story.completedSceneIds.includes("A3-06")&&!status&&<div className="blind-validation-actions">
          <button className="primary-action" data-testid="send-bluecup-clean" onClick={()=>emit("wechat.media.clean.sent","photo.blue_mug.clean",{labels:[]})}>只发送蓝杯照片（无标签）</button>
          <button className="secondary-action" data-testid="send-bluecup-contaminated" onClick={()=>emit("wechat.media.contaminated.sent","dossier.blue_mug",{included:["沈川姓名","伤疤","订单"]})}>发送含姓名、伤疤和订单的材料</button>
        </div>}
        {status==="contaminated"&&<><div className="bubble mine">蓝杯照片、沈川姓名、伤疤和订单信息</div><div className="bubble theirs">你已经把名字写出来了，我说什么都不算。</div><p className="contamination-warning">证言状态：contaminated。须由独立来源补足，当前不会形成永久死路。</p><button className="primary-action" data-testid="retry-bluecup-clean" onClick={()=>emit("wechat.media.clean.sent","photo.blue_mug.clean",{labels:[],recovery:"withdraw-and-retry"})}>撤回材料，重新进行无标签验证</button></>}
        {status==="clean"&&<><div className="bubble mine">[蓝色搪瓷杯照片 · 无姓名/伤疤/订单标签]</div>{voiceAvailable&&<div className="bubble theirs">
          <button className="voice-message" data-testid="play-zhoulan-bluecup" onClick={()=>emit("audio.voice.played","voice.zhoulan.bluecup.r2",{duration:zhoulanBody.voiceDuration??18.2,sameMaster:true})}><span>▶︎</span><i>{zhoulanBody.voiceDuration}″</i><em>{voicePlayed?"已播放":"点按播放"}</em></button>
          {voicePlayed&&<span className="voice-transcript">{zhoulanBody.voiceTranscript}</span>}
        </div>}</>}
        {voicePlayed&&!state.story.completedSceneIds.includes("A3-07")&&<p className="evidence-instruction">盲证已取得。请到淘宝打开“蓝色搪瓷杯订单”作为独立来源；污染路径也必须完成此补足。</p>}
        {state.story.completedSceneIds.includes("A3-07")&&!corrected&&<button className="primary-action" data-testid="reopen-zhoulan-r3" onClick={()=>emit("voice.variant.corrected","voice.zhoulan.bluecup",{from:"R2",to:"R3",sameMaster:true})}>重新进入会话并核对原语音</button>}
        {corrected&&<section className="correction-thread" data-testid="zhoulan-r3"><div className="bubble theirs"><button className="voice-message"><span>▶︎</span><i>{zhoulanBody.voiceDuration}″</i><em>同一母带 · R3</em></button><span className="voice-transcript">{zhoulanBody.voiceTranscript}</span></div>{(zhoulanBody.correctionMessages??[]).map(text=><div className="bubble theirs" key={text}>{text}</div>)}<p>原通知预览暂存残片：{zhoulanBody.notificationPreview}</p></section>}
        <div className="chat-composer"><button>＋</button><input aria-label="消息" placeholder="发消息"/><button>发送</button></div>
      </div>
    </AppChrome>;
  }

  if(thread) return <AppChrome title={thread} actions={<button data-testid="wechat-conversations" onClick={()=>setThread(null)}>会话</button>}>
    <div className="chat-thread">
      {threadItems.map(item=>{
        const b=activeBody(state,item) as Body;
        const isVoice=item.kind==="voice";
        const isPlayed=played.includes(item.id);
        return <div className={`bubble ${item.ownerId==="actor.player"?"mine":"theirs"}`} key={item.id} data-testid={`message-${item.id}`}>
          {isVoice?<>
            <button className="voice-message" data-testid={item.id==="voice.shenchuan.name.01"?"voice-shenchuan-name":undefined} onClick={()=>{
              setPlayed(current=>current.includes(item.id)?current:[...current,item.id]);
              emit("audio.voice.played",item.id,{duration:b.duration??0});
            }}><span>▶︎</span><i>{b.duration??0}″</i><em>{isPlayed?"已播放":"点按播放"}</em></button>
            {isPlayed&&<span className="voice-transcript">{b.transcript}</span>}
          </>:<span>{b.text??(b.name?`文件：${b.name}`:JSON.stringify(b.content??""))}</span>}
          <small>{b.time??(b.timeMode?new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"}):"")}</small>
        </div>;
      })}
      {thread==="陈屿"&&state.story.completedSceneIds.includes("A1-05")&&!state.story.completedSceneIds.includes("A1-06")&&<button className="primary-action" data-testid="share-photo-chenyu" onClick={()=>emit("message.attachment.sent","photo.shenchuan.group.01",{})}>把“桥下咖啡”照片发给陈屿</button>}
      {playerSynced&&thread===momLabel&&(syncBody?.momMessages??[]).map(text=><div className="bubble theirs" key={text}>{text}</div>)}
      {playerSynced&&thread==="阿序"&&(syncBody?.axuMessages??[]).map(text=><div className="bubble theirs" key={text}>{text}</div>)}
      <div className="chat-composer"><button>＋</button><input aria-label="消息" placeholder="发消息"/><button>发送</button></div>
    </div>
  </AppChrome>;

  return <AppChrome title="微信" actions={<button data-testid="app-effective-action" onClick={()=>setShowSearch(v=>!v)}>＋</button>}>
    <form className="wechat-search" onSubmit={runSearch}>
      <input data-testid="wechat-search-input" value={query} onChange={event=>{setQuery(event.target.value);setShowSearch(false)}} placeholder="搜索" aria-label="微信搜索"/>
      <button data-testid="wechat-search-submit">搜索</button>
    </form>
    {showSearch&&<section className="wechat-search-results" data-testid="wechat-search-results">
      {!matchedSearch&&<p>未找到与“{normalizedQuery||"空白"}”相关的内容</p>}
      {matchedSearch&&<>
        <header><b>搜索：{searchBody?.query??"沈川"}</b><small>来自本机缓存的跨应用结果</small></header>
        {(searchBody?.results??[]).map((result,index)=><article key={`${result.app}-${index}`}><span>{result.app}</span><b>{result.title}</b><small>{result.detail}</small></article>)}
      </>}
    </section>}
    <div className="list">{threads.map(name=>{
      const displayName=name==="__zhoulan"?(zhoulanBody?.contact??"周岚"):name;
      const sourceName=name===momLabel&&playerSynced?"妈妈":name;
      const last=items.filter(i=>(activeBody(state,i) as Body)?.thread===sourceName).at(-1);
      const body=last?activeBody(state,last) as Body:undefined;
      const preview=name==="__zhoulan"?(zhoulanBody?.notificationPreview??"这个号怎么会在我通讯录里？"):body?.text??body?.transcript??(name==="文件传输助手"?"本机文件与传输记录":"暂无新消息");
      return <button className="list-row" data-testid={name==="__zhoulan"?"thread-周岚":`thread-${displayName}`} key={name} onClick={()=>{setThread(name);setShowSearch(false)}}>
        <span className="avatar">{displayName.slice(0,1)}</span><span><b>{displayName}</b><small>{preview}</small></span><time>{body?.time??""}</time>
      </button>;
    })}</div>
  </AppChrome>;
}
