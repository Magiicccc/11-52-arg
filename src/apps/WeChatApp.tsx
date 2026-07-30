import { useMemo, useState, type CSSProperties } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem, unlockedItemsForApp } from "@/content/selectors";
import type { ContentItem } from "@/contracts/content";
import { getPath } from "@/engine/path-utils";
import { ordinaryWechatThreads, ordinaryXhsNotes, wechatThreadSupplements, type OrdinaryMessage } from "@/content/realism-life-data";
import { identityAvatar, realisticInternetAvatar, realisticWechatAvatar } from "@/content/avatar-assets";
import { assetUrl } from "@/lib/asset-url";

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

function chatAvatarStyle(peerAvatar:string,selfAvatar:string):CSSProperties {
  return {
    "--wechat-peer-avatar": `url("${peerAvatar}")`,
    "--wechat-self-avatar": `url("${selfAvatar}")`
  } as CSSProperties;
}

export function WeChatApp(){
  const {state,activeDeviceId,emit,setUiFlag}=useGame();
  const [thread,setThreadState]=useState<string|null>(null);
  const savedTab=state.world.flags[`ui.wechat.tab.${activeDeviceId}`];
  const [tab,setTabState]=useState(typeof savedTab==="string"?savedTab:"微信");
  const savedQuery=state.world.flags[`ui.wechat.query.${activeDeviceId}`];
  const [query,setQueryState]=useState(typeof savedQuery==="string"?savedQuery:"");
  const [showSearch,setShowSearch]=useState(false);
  const [played,setPlayed]=useState<string[]>([]);
  const [showMenu,setShowMenu]=useState(false);
  const [showExtras,setShowExtras]=useState(false);
  const [showThreadSearch,setShowThreadSearch]=useState(false);
  const [showThreadInfo,setShowThreadInfo]=useState(false);
  const [threadQuery,setThreadQuery]=useState("");
  const [messageMenuId,setMessageMenuId]=useState<string|null>(null);
  const [composerText,setComposerText]=useState("");
  const savedSubView=state.world.flags[`ui.wechat.subView.${activeDeviceId}`];
  const [subView,setSubViewState]=useState(typeof savedSubView==="string"?savedSubView:null);
  const items=unlockedItemsForApp(state,"app.wechat");
  const zhoulanItem=getContentItem("a3.zhoulan.thread");
  const zhoulanBody=zhoulanItem?activeBody(state,zhoulanItem) as Body:undefined;
  const zhoulanUnlocked=state.content.unlockedContentIds.includes("a3.zhoulan.thread");
  const syncItem=getContentItem("a3.player.sync");
  const syncBody=syncItem?activeBody(state,syncItem) as Body:undefined;
  const playerSynced=state.story.completedSceneIds.includes("A3-09");
  const momLabel=playerSynced?(syncBody?.momContact??"李女士"):"妈妈";
  const selfAvatar=identityAvatar(activeDeviceId);
  const setThread=(value:string|null)=>{
    setThreadState(value);
    if(value)setSubView(null);
  };
  const setSubView=(value:string|null)=>{
    setSubViewState(value);
    setUiFlag(`wechat.subView.${activeDeviceId}`,value);
    if(value)emit("app.view.changed","app.wechat",{view:value,source:"P"});
  };
  const setTab=(value:string)=>{
    setTabState(value);
    setSubView(null);
    setUiFlag(`wechat.tab.${activeDeviceId}`,value);
    emit("app.view.changed","app.wechat",{view:value});
  };
  const setQuery=(value:string)=>{
    setQueryState(value);
    setUiFlag(`wechat.query.${activeDeviceId}`,value);
  };
  const ordinaryKeys=ordinaryWechatThreads.map((ordinary)=>ordinary.title==="陈屿"||ordinary.title==="文件传输助手"?ordinary.title:ordinary.id);
  const threads=activeDeviceId==="player"
    ?[momLabel,"爸爸","阿序",...ordinaryKeys.filter(key=>key!=="陈屿")]
    :[...ordinaryKeys,"妈",...(state.content.unlockedContentIds.includes("message.pb_0425.01")?["PB_0425"]:[]),...(zhoulanUnlocked?["__zhoulan"]:[])];
  const ordinaryForThread=ordinaryWechatThreads.find((ordinary)=>ordinary.id===thread||ordinary.title===thread);
  const supplementThread=thread===momLabel?"妈妈":thread;
  const supplementForThread=wechatThreadSupplements.find((supplement)=>supplement.thread===supplementThread);

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
  const sentMessages=thread?state.world.flags[`ui.wechat.sent.${thread}`]:undefined;
  const customMessages=Array.isArray(sentMessages)?sentMessages.filter((value):value is string=>typeof value==="string"):[];
  const sendMessage=()=>{
    const value=composerText.trim();
    if(!thread||!value)return;
    setUiFlag(`wechat.sent.${thread}`,[...customMessages,value]);
    emit("message.text.sent",thread,{text:value,source:"P"});
    setComposerText("");
  };

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
    return <AppChrome title={zhoulanBody.contact??"周岚"} onBack={()=>setThread(null)} actions={<button data-testid="wechat-conversations" onClick={()=>setThread(null)}>会话</button>}>
      <div className="chat-thread wechat-chat-with-avatars" data-testid="zhoulan-thread" style={chatAvatarStyle(realisticWechatAvatar("周岚",19),selfAvatar)}>
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
        {corrected&&<section className="correction-thread" data-testid="zhoulan-r3"><div className="bubble theirs"><button className="voice-message" onClick={()=>emit("audio.voice.played","voice.zhoulan.bluecup.r3",{duration:zhoulanBody.voiceDuration??18.2,sameMaster:true,source:"P"})}><span>▶︎</span><i>{zhoulanBody.voiceDuration}″</i><em>同一母带 · R3</em></button><span className="voice-transcript">{zhoulanBody.voiceTranscript}</span></div>{(zhoulanBody.correctionMessages??[]).map(text=><div className="bubble theirs" key={text}>{text}</div>)}<p>原通知预览暂存残片：{zhoulanBody.notificationPreview}</p></section>}
        <WechatComposer
          text={composerText}
          onText={setComposerText}
          onSend={sendMessage}
          showExtras={showExtras}
          onToggleExtras={()=>setShowExtras(value=>!value)}
          onExtra={(type)=>emit("message.attachment.picker.opened","thread.zhoulan",{type,source:"P"})}
        />
      </div>
    </AppChrome>;
  }

  if(thread) {
    const peerIndex=Math.max(0,ordinaryWechatThreads.findIndex(item=>item.id===thread||item.title===thread));
    const peerAvatar=ordinaryForThread
      ?realisticWechatAvatar(ordinaryForThread.id,peerIndex)
      :identityAvatar(thread,peerIndex);
    return <AppChrome title={ordinaryForThread?.title??thread} onBack={()=>setThread(null)} actions={<div className="wechat-chat-header-actions"><button aria-label="搜索聊天记录" onClick={()=>setShowThreadSearch(value=>!value)}>⌕</button><button aria-label="聊天信息" onClick={()=>setShowThreadInfo(value=>!value)}>•••</button><button data-testid="wechat-conversations" onClick={()=>setThread(null)}>会话</button></div>}>
    <div className="chat-thread wechat-chat-with-avatars" style={chatAvatarStyle(peerAvatar,selfAvatar)}>
      {showThreadSearch&&<section className="wechat-thread-search"><input autoFocus value={threadQuery} onChange={event=>setThreadQuery(event.target.value)} placeholder="搜索聊天记录"/><b>{[...(ordinaryForThread?.messages??[]),...(supplementForThread?.messages??[])].filter(message=>!threadQuery.trim()||message.text.includes(threadQuery.trim())).length} 条结果</b></section>}
      {showThreadInfo&&<section className="wechat-thread-info"><header><img className="avatar" src={peerAvatar} alt="联系人头像"/><b>{ordinaryForThread?.title??thread}</b></header><button onClick={()=>setUiFlag(`wechat.pinned.${thread}`,true)}>置顶聊天</button><button onClick={()=>setUiFlag(`wechat.muted.${thread}`,true)}>消息免打扰</button><button onClick={()=>setShowThreadSearch(true)}>查找聊天内容</button></section>}
      {ordinaryForThread?.messages
        .filter(message=>!showThreadSearch||!threadQuery.trim()||message.text.includes(threadQuery.trim()))
        .map(message=><OrdinaryWechatMessage message={message} key={message.id} menuOpen={messageMenuId===message.id} onMenu={()=>setMessageMenuId(value=>value===message.id?null:message.id)} onAction={(action)=>{setUiFlag(`wechat.message.${action}.${message.id}`,true);emit("content.item.interacted",message.id,{action,source:"P"});setMessageMenuId(null)}}/>)}
      {supplementForThread?.messages.slice(0,3)
        .filter(message=>!showThreadSearch||!threadQuery.trim()||message.text.includes(threadQuery.trim()))
        .map(message=><OrdinaryWechatMessage message={message} key={message.id} menuOpen={messageMenuId===message.id} onMenu={()=>setMessageMenuId(value=>value===message.id?null:message.id)} onAction={(action)=>{setUiFlag(`wechat.message.${action}.${message.id}`,true);emit("content.item.interacted",message.id,{action,source:"P"});setMessageMenuId(null)}}/>)}
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
      {supplementForThread?.messages.slice(3)
        .filter(message=>!showThreadSearch||!threadQuery.trim()||message.text.includes(threadQuery.trim()))
        .map(message=><OrdinaryWechatMessage message={message} key={message.id} menuOpen={messageMenuId===message.id} onMenu={()=>setMessageMenuId(value=>value===message.id?null:message.id)} onAction={(action)=>{setUiFlag(`wechat.message.${action}.${message.id}`,true);emit("content.item.interacted",message.id,{action,source:"P"});setMessageMenuId(null)}}/>)}
      {customMessages.map((text,index)=><div className="bubble mine" key={`custom-${index}`}><span>{text}</span><small>刚刚</small></div>)}
      <WechatComposer
        text={composerText}
        onText={setComposerText}
        onSend={sendMessage}
        showExtras={showExtras}
        onToggleExtras={()=>setShowExtras(value=>!value)}
        onExtra={(type)=>emit("message.attachment.picker.opened",thread,{type,source:"P"})}
      />
    </div>
  </AppChrome>;
  }

  if(subView) return <WechatSubPage
    view={subView}
    state={state}
    activeDeviceId={activeDeviceId}
    selfAvatar={selfAvatar}
    onBack={()=>setSubView(null)}
    onOpenThread={(threadId)=>setThread(threadId)}
    onOpenView={setSubView}
    emit={emit}
    setUiFlag={setUiFlag}
  />;

  if(tab==="通讯录") return <WechatScaffold tab={tab} onTab={setTab}>
    <header className="wechat-section-header"><strong>通讯录</strong><button onClick={()=>setSubView("contacts:新的朋友")}>添加朋友</button></header>
    <div className="wechat-contact-tools">{["新的朋友","仅聊天的朋友","群聊","标签","公众号"].map(label=><button key={label} onClick={()=>setSubView(`contacts:${label}`)}><span>{label.slice(0,1)}</span><b>{label}</b><i>›</i></button>)}</div>
    <div className="wechat-contact-list"><h2>联系人</h2>{ordinaryWechatThreads.filter(item=>!item.group).map((item,index)=><button key={item.id} onClick={()=>setThread(item.title==="陈屿"||item.title==="文件传输助手"?item.title:item.id)}><img className="avatar" src={realisticWechatAvatar(item.id,index)} alt={`${item.title}头像`}/><b>{item.title}</b></button>)}</div>
  </WechatScaffold>;

  if(tab==="发现") return <WechatScaffold tab={tab} onTab={setTab}>
    <header className="wechat-section-header"><strong>发现</strong></header>
    <div className="wechat-discover-menu">{["朋友圈","视频号","直播","扫一扫","摇一摇","看一看","搜一搜","附近"].map((label,index)=><button key={label} onClick={()=>setSubView(`discover:${label}`)}><span>{["◎","▶","▣","⌗","↔","◉","⌕","⌖"][index]}</span><b>{label}</b><i>›</i></button>)}</div>
    <section className="wechat-moments-preview"><header><b>朋友圈</b><span>最近动态</span></header>{ordinaryXhsNotes.slice(0,8).map((note,index)=><article key={note.id}><img className="avatar" src={realisticInternetAvatar(note.author,20+index)} alt={`${note.author}头像`}/><div><b>{note.author}</b><p>{note.title}</p><img src={assetUrl(note.media)} alt="普通生活动态"/><small>{note.date}</small></div></article>)}</section>
  </WechatScaffold>;

  if(tab==="我") return <WechatScaffold tab={tab} onTab={setTab}>
    <section className="wechat-me-card"><img className="avatar" src={selfAvatar} alt="川流档案头像"/><div><h1>川流档案</h1><p>微信号：chuanliu_archive</p><small>＋ 状态</small></div><button onClick={()=>setSubView("me:个人信息")}>二维码</button></section>
    <div className="wechat-me-menu">{["服务","收藏","朋友圈","卡包","表情","设置"].map(label=><button key={label} onClick={()=>setSubView(`me:${label}`)}><span>{label.slice(0,1)}</span><b>{label}</b><i>›</i></button>)}</div>
  </WechatScaffold>;

  return <WechatScaffold tab={tab} onTab={setTab}>
    <header className="wechat-section-header"><strong>微信</strong><div><button data-testid="app-effective-action" aria-label="搜索" onClick={()=>setShowSearch(value=>!value)}>⌕</button><button aria-label="更多" onClick={()=>setShowMenu(value=>!value)}>＋</button></div></header>
    {showMenu&&<div className="wechat-plus-menu">{["发起群聊","添加朋友","扫一扫","收付款"].map(label=><button key={label} onClick={()=>{setShowMenu(false);setSubView(`plus:${label}`)}}>{label}</button>)}</div>}
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
    <div className="list">{threads.map((name,index)=>{
      const ordinary=ordinaryWechatThreads.find(item=>item.id===name||item.title===name);
      const displayName=name==="__zhoulan"?(zhoulanBody?.contact??"周岚"):(ordinary?.title??name);
      const sourceName=name===momLabel&&playerSynced?"妈妈":name;
      const avatar=ordinary
        ?realisticWechatAvatar(ordinary.id,index)
        :identityAvatar(displayName,index);
      const last=items.filter(i=>(activeBody(state,i) as Body)?.thread===sourceName).at(-1);
      const body=last?activeBody(state,last) as Body:undefined;
      const preview=name==="__zhoulan"?(zhoulanBody?.notificationPreview??"这个号怎么会在我通讯录里？"):body?.text??body?.transcript??(name==="文件传输助手"?"本机文件与传输记录":"暂无新消息");
      const supplement=wechatThreadSupplements.find(item=>item.thread===(name===momLabel?"妈妈":name));
      return <button className="list-row" data-testid={name==="__zhoulan"?"thread-周岚":`thread-${displayName}`} key={name} onClick={()=>{setThread(name);setShowSearch(false)}}>
        <img className="avatar" src={avatar} alt={`${displayName}头像`}/><span><b>{displayName}</b><small>{ordinary?.messages.at(-1)?.text??supplement?.messages.at(-1)?.text??preview}</small></span><time>{ordinary?.messages.at(-1)?.time??supplement?.messages.at(-1)?.time??body?.time??""}</time>
      </button>;
    })}</div>
  </WechatScaffold>;
}

function OrdinaryWechatMessage({
  message,menuOpen,onMenu,onAction
}:{
  message:OrdinaryMessage;
  menuOpen:boolean;
  onMenu():void;
  onAction(action:string):void;
}) {
  const mine=message.sender==="self";
  return <div className={`bubble ${mine?"mine":"theirs"} wechat-message-${message.type}`} role="button" tabIndex={0} aria-label="点按或长按消息" onClick={onMenu} onContextMenu={event=>{event.preventDefault();onMenu()}} onKeyDown={event=>{if(event.key==="Enter")onMenu()}}>
    {message.type!=="text"&&<span className="wechat-message-kind">{{
      image:"图片",voice:`语音 ${message.duration??0}″`,file:"文件",location:"位置",link:"链接",sticker:"表情",quote:"引用",recalled:"已撤回",payment:"转账",text:""
    }[message.type]}</span>}
    <span>{message.text}</span>
    <small>{message.time}</small>
    {menuOpen&&<aside className="wechat-message-menu">{["复制","引用","收藏","删除"].map(action=><button key={action} onClick={event=>{event.stopPropagation();onAction(action)}}>{action}</button>)}</aside>}
  </div>;
}

function WechatComposer({
  text,onText,onSend,showExtras,onToggleExtras,onExtra
}:{
  text:string;
  onText(value:string):void;
  onSend():void;
  showExtras:boolean;
  onToggleExtras():void;
  onExtra(type:string):void;
}) {
  return <>
    {showExtras&&<div className="wechat-extra-panel">{["照片","拍摄","视频通话","位置","红包","文件"].map(type=><button key={type} onClick={()=>onExtra(type)}><span>{type.slice(0,1)}</span>{type}</button>)}</div>}
    <div className="chat-composer"><button aria-label="语音输入" onClick={()=>onExtra("语音输入")}>◉</button><input aria-label="消息" value={text} onChange={event=>onText(event.target.value)} placeholder="发消息"/><button aria-label="表情" onClick={()=>onExtra("表情")}>☺</button><button aria-label="更多消息类型" onClick={onToggleExtras}>＋</button><button disabled={!text.trim()} onClick={onSend}>发送</button></div>
  </>;
}

function WechatSubPage({
  view,state,activeDeviceId,selfAvatar,onBack,onOpenThread,onOpenView,emit,setUiFlag
}:{
  view:string;
  state:ReturnType<typeof useGame>["state"];
  activeDeviceId:ReturnType<typeof useGame>["activeDeviceId"];
  selfAvatar:string;
  onBack():void;
  onOpenThread(threadId:string):void;
  onOpenView(view:string|null):void;
  emit:ReturnType<typeof useGame>["emit"];
  setUiFlag:ReturnType<typeof useGame>["setUiFlag"];
}) {
  const [scope,label]=view.split(":");
  const title=label??view;
  const [query,setQuery]=useState("");
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [notice,setNotice]=useState("");
  const [commentOpen,setCommentOpen]=useState<string|null>(null);
  const [selectedContacts,setSelectedContacts]=useState<string[]>([]);
  const notes=ordinaryXhsNotes.slice(0,12);
  const act=(action:string,target=title)=>{
    setNotice(action);
    setUiFlag(`wechat.subAction.${activeDeviceId}.${scope}.${target}.${action}`,true);
    emit("content.item.interacted","app.wechat",{surface:view,action,target,source:"P"});
  };

  if(selectedId){
    const note=notes.find((item)=>item.id===selectedId);
    if(note)return <div className="app-window wechat-subpage wechat-channel-detail" data-testid="wechat-subpage-detail">
      <header className="wechat-sub-header"><button data-testid="app-back" onClick={()=>setSelectedId(null)}>‹</button><strong>{title}</strong><button onClick={()=>act("更多",note.id)}>•••</button></header>
      <main className="wechat-sub-scroll">
        <img className="wechat-channel-hero" src={assetUrl(note.media)} alt={`${note.title}生活内容`}/>
        <section className="wechat-channel-author"><img src={realisticInternetAvatar(note.author)} alt={`${note.author}头像`}/><div><b>{note.author}</b><small>{note.location} · {note.date}</small></div><button onClick={()=>act("关注",note.author)}>{state.world.flags[`ui.wechat.subAction.${activeDeviceId}.${scope}.${note.author}.关注`]===true?"已关注":"+ 关注"}</button></section>
        <article className="wechat-channel-copy"><h1>{note.title}</h1>{note.body.map((paragraph,index)=><div className="wechat-channel-paragraph" key={paragraph}><p>{paragraph}</p>{index===0&&note.mediaSet.length>1&&<figure className="platform-inline-figure"><img src={assetUrl(note.mediaSet[1]!)} alt={`${note.title}正文补充配图`}/><figcaption>作者补充的同组生活照片</figcaption></figure>}</div>)}</article>
        <section className="wechat-channel-comments">{note.comments.slice(0,5).map((comment,index)=><article key={comment.id}><img src={realisticInternetAvatar(comment.author,90+index)} alt={`${comment.author}头像`}/><div><b>{comment.author}</b><p>{comment.text}</p><small>赞 {comment.likes}</small></div></article>)}</section>
      </main>
      <footer className="wechat-channel-actions"><button onClick={()=>act("点赞",note.id)}>♡ {note.likes}</button><button onClick={()=>act("评论",note.id)}>评论 {note.comments.length}</button><button onClick={()=>act("转发",note.id)}>转发</button></footer>
      {notice&&<div className="wechat-action-notice">{notice}</div>}
    </div>;
  }

  return <div className="app-window wechat-subpage" data-testid={`wechat-subpage-${view}`}>
    <header className="wechat-sub-header"><button data-testid="app-back" onClick={onBack}>‹</button><strong>{title}</strong><button onClick={()=>act("更多")}>•••</button></header>
    <main className="wechat-sub-scroll">
      {scope==="discover"&&label==="朋友圈"&&<>
        <section className="wechat-moments-cover"><img src={assetUrl("/media/case-001/daily/temporary-rainy-street.jpg")} alt="朋友圈封面"/><div><b>川流档案</b><img src={selfAvatar} alt="川流档案头像"/></div></section>
        <section className="wechat-moments-feed">{notes.map((note,index)=>{
          const liked=state.world.flags[`ui.wechat.momentLiked.${note.id}`]===true;
          return <article key={note.id}>
            <button className="wechat-moment-avatar" onClick={()=>{setSelectedId(note.id);act("打开作者动态",note.author)}}><img src={realisticInternetAvatar(note.author,20+index)} alt={`${note.author}头像`}/></button>
            <div><button className="wechat-moment-author" onClick={()=>setSelectedId(note.id)}>{note.author}</button><p>{note.body[0]}</p><button className="wechat-moment-media" onClick={()=>setSelectedId(note.id)}><img src={assetUrl(note.media)} alt={`${note.title}朋友圈配图`}/></button><small>{note.date} · {note.location}</small>
              <div className="wechat-moment-actions"><button className={liked?"active":""} onClick={()=>{setUiFlag(`wechat.momentLiked.${note.id}`,!liked);emit("content.item.interacted",note.id,{action:"like",active:!liked,source:"P"})}}>{liked?"♥ 已赞":"♡ 赞"}</button><button onClick={()=>setCommentOpen(value=>value===note.id?null:note.id)}>评论</button></div>
              {commentOpen===note.id&&<div className="wechat-moment-comments">{note.comments.slice(0,3).map((comment)=><p key={comment.id}><b>{comment.author}：</b>{comment.text}</p>)}<button onClick={()=>act("写评论",note.id)}>写评论…</button></div>}
            </div>
          </article>;
        })}</section>
      </>}

      {scope==="discover"&&["视频号","直播","看一看","附近"].includes(label??"")&&<>
        <nav className="wechat-content-tabs">{["推荐","朋友","同城"].map((tab,index)=><button className={index===0?"active":""} key={tab} onClick={()=>act(`切换${tab}`)}>{tab}</button>)}</nav>
        <section className="wechat-channel-grid">{notes.slice(0,label==="直播"?8:12).map((note,index)=><button key={note.id} onClick={()=>setSelectedId(note.id)}><img src={assetUrl(note.media)} alt={`${note.title}封面`}/>{label==="直播"&&<i>直播中</i>}<b>{note.title}</b><span><img src={realisticInternetAvatar(note.author,30+index)} alt=""/>{note.author}</span></button>)}</section>
      </>}

      {scope==="discover"&&label==="扫一扫"&&<section className="wechat-scan-page"><div className="wechat-scan-frame"><i/><i/><i/><i/><span/></div><p>将二维码/条码放入框内，即可自动扫描</p><button onClick={()=>setNotice("未识别到二维码，请对准后重试")}>开始识别</button><button onClick={()=>act("从相册选取")}>从相册选取</button></section>}

      {scope==="discover"&&label==="摇一摇"&&<section className="wechat-shake-page"><div>📱</div><h1>摇一摇</h1><p>发现同时摇动手机的人，也可以识别附近歌曲。</p><button onClick={()=>setNotice("刚刚没有找到同时摇动的人")}>模拟摇动</button><nav><button onClick={()=>act("识别歌曲")}>歌曲</button><button onClick={()=>act("识别电视")}>电视</button></nav></section>}

      {scope==="discover"&&label==="搜一搜"&&<section className="wechat-global-search"><form onSubmit={(event)=>{event.preventDefault();setUiFlag(`wechat.searchHistory.${activeDeviceId}`,query);act("提交搜索",query)}}><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索朋友圈、文章、公众号"/><button disabled={!query.trim()}>搜索</button></form>{query&&<div>{ordinaryWechatThreads.filter((thread)=>`${thread.title}${thread.messages.map(message=>message.text).join("")}`.includes(query)).map((thread,index)=><button key={thread.id} onClick={()=>onOpenThread(thread.title==="陈屿"||thread.title==="文件传输助手"?thread.title:thread.id)}><img src={realisticWechatAvatar(thread.id,index)} alt={`${thread.title}头像`}/><span><b>{thread.title}</b><small>聊天记录中包含“{query}”</small></span><i>›</i></button>)}{notes.filter((note)=>`${note.title}${note.body.join("")}`.includes(query)).map((note)=><button key={note.id} onClick={()=>setSelectedId(note.id)}><img src={assetUrl(note.media)} alt=""/><span><b>{note.title}</b><small>朋友圈与文章</small></span><i>›</i></button>)}</div>}</section>}

      {scope==="me"&&label==="服务"&&<section className="wechat-services"><header><b>钱包</b><strong>¥ 286.42</strong><button onClick={()=>act("零钱明细")}>零钱明细</button></header><div>{["收付款","钱包","银行卡","手机充值","生活缴费","城市服务","出行服务","火车票机票","外卖","电影演出"].map((item,index)=><button key={item} onClick={()=>act(`打开${item}`)}><span>{["付","钱","卡","充","缴","城","行","票","外","影"][index]}</span><b>{item}</b></button>)}</div><h2>最近账单</h2>{["便利店 · ¥18.60","地铁出行 · ¥4.00","照片冲印 · ¥36.00","午餐 · ¥24.00"].map(item=><button key={item} onClick={()=>act("查看账单",item)}>{item}<i>›</i></button>)}</section>}

      {scope==="me"&&label==="收藏"&&<section className="wechat-favorites"><nav>{["全部","链接","图片","文件","聊天"].map((tab,index)=><button className={index===0?"active":""} key={tab} onClick={()=>act(`筛选${tab}`)}>{tab}</button>)}</nav>{[...ordinaryWechatThreads.flatMap(thread=>thread.messages.filter(message=>["file","link","image","quote"].includes(message.type)).map(message=>({thread,message}))).slice(0,10)].map(({thread,message},index)=><button key={message.id} onClick={()=>onOpenThread(thread.title==="陈屿"||thread.title==="文件传输助手"?thread.title:thread.id)}><img src={realisticWechatAvatar(thread.id,index)} alt={`${thread.title}头像`}/><span><b>{message.text}</b><small>{thread.title} · {message.time}</small></span><i>›</i></button>)}</section>}

      {scope==="me"&&label==="朋友圈"&&<section className="wechat-own-moments"><header><img src={selfAvatar} alt="川流档案头像"/><div><b>川流档案</b><small>共 38 条朋友圈</small></div></header>{notes.slice(0,9).map(note=><button key={note.id} onClick={()=>setSelectedId(note.id)}><time>{note.date}</time><img src={assetUrl(note.media)} alt={note.title}/><span><b>{note.title}</b><small>{note.body[0]}</small></span></button>)}</section>}

      {scope==="me"&&label==="卡包"&&<section className="wechat-card-wallet">{["城市公共交通卡","社区图书馆读者证","摄影冲印店积分卡","社区体育馆次卡"].map((card,index)=><button key={card} onClick={()=>act("查看卡券",card)}><span>{["交","书","影","体"][index]}</span><div><b>{card}</b><small>{index===0?"余额 ¥42.60":index===3?"剩余 6 次":"有效"}</small></div><i>›</i></button>)}</section>}

      {scope==="me"&&label==="表情"&&<section className="wechat-sticker-store"><nav><button className="active">精选</button><button onClick={()=>act("切换更多表情")}>更多表情</button><button onClick={()=>act("管理表情")}>设置</button></nav>{["普通小猫","工作日小狗","不着急鸭","城市天气","简单手势","摄影日常"].map((pack,index)=><button key={pack} onClick={()=>act("添加表情包",pack)}><span>{["🐈","🐕","🦆","☂","👋","📷"][index]}</span><div><b>{pack}</b><small>16 个表情 · 普通日常</small></div><i>添加</i></button>)}</section>}

      {scope==="me"&&label==="设置"&&<section className="wechat-settings-page">{["账号与安全","新消息通知","聊天","通用","朋友权限","个人信息与权限","帮助与反馈","关于微信"].map((item,index)=>{
        const enabled=state.world.flags[`ui.wechat.setting.${item}`]===true;
        return <button key={item} onClick={()=>{setUiFlag(`wechat.setting.${item}`,!enabled);act(`${enabled?"关闭":"打开"}${item}`)}}><b>{item}</b>{[1,4].includes(index)?<i className={enabled?"switch on":"switch"}/>:<span>›</span>}</button>;
      })}<button className="wechat-logout" onClick={()=>setNotice("为保留本机调查记录，当前账号保持登录")}>切换账号</button></section>}

      {scope==="me"&&label==="个人信息"&&<section className="wechat-personal-info"><img src={selfAvatar} alt="川流档案头像"/><h1>川流档案</h1><p>微信号：chuanliu_archive</p><div className="wechat-qr-grid" aria-label="个人二维码">{Array.from({length:81},(_,index)=><i key={index} className={(index*17+index%7)%5<2?"dark":""}/>)}</div><small>扫一扫上面的二维码图案，加我为朋友。</small>{["名字","拍一拍","微信豆","我的地址"].map(item=><button key={item} onClick={()=>act(`编辑${item}`)}><b>{item}</b><span>›</span></button>)}</section>}

      {scope==="contacts"&&<WechatContactsSubPage label={label??"联系人"} onOpenThread={onOpenThread} onAction={act}/>}

      {scope==="plus"&&<WechatPlusSubPage label={label??"更多"} contacts={selectedContacts} onContacts={setSelectedContacts} onOpenView={onOpenView} onAction={act}/>}
    </main>
    {notice&&<button className="wechat-action-notice" onClick={()=>setNotice("")}>{notice}</button>}
  </div>;
}

function WechatContactsSubPage({label,onOpenThread,onAction}:{label:string;onOpenThread(threadId:string):void;onAction(action:string,target?:string):void}) {
  const contacts=ordinaryWechatThreads.filter(thread=>!thread.group);
  if(label==="群聊")return <section className="wechat-contact-sublist">{ordinaryWechatThreads.filter(thread=>thread.group).map((thread,index)=><button key={thread.id} onClick={()=>onOpenThread(thread.id)}><img src={realisticWechatAvatar(thread.id,index)} alt={`${thread.title}头像`}/><span><b>{thread.title}</b><small>{thread.messages.length} 条消息</small></span><i>›</i></button>)}</section>;
  if(label==="公众号")return <section className="wechat-contact-sublist">{["城市公共文化中心","摄影器材维护","铁路出行服务","云服务助手","社区体育馆"].map((name,index)=><button key={name} onClick={()=>onAction("打开公众号",name)}><span className="wechat-official-avatar">{["文","影","行","云","体"][index]}</span><span><b>{name}</b><small>最近更新：普通服务通知</small></span><i>›</i></button>)}</section>;
  if(label==="标签")return <section className="wechat-contact-sublist">{["工作往来（6）","亲友（5）","摄影（4）","仅聊天的朋友（2）"].map(item=><button key={item} onClick={()=>onAction("打开标签",item)}><span className="wechat-official-avatar">签</span><span><b>{item}</b><small>联系人标签</small></span><i>›</i></button>)}</section>;
  return <section className="wechat-contact-sublist"><form onSubmit={event=>{event.preventDefault();onAction("搜索微信号")}}><input placeholder="微信号/手机号"/><button>搜索</button></form>{contacts.slice(0,label==="新的朋友"?8:4).map((thread,index)=><button key={thread.id} onClick={()=>label==="新的朋友"?onAction("发送朋友申请",thread.title):onOpenThread(thread.id)}><img src={realisticWechatAvatar(thread.id,index)} alt={`${thread.title}头像`}/><span><b>{thread.title}</b><small>{label==="新的朋友"?"来自群聊或共同联系人":"仅聊天，不看朋友圈"}</small></span><i>{label==="新的朋友"?"添加":"›"}</i></button>)}</section>;
}

function WechatPlusSubPage({label,contacts,onContacts,onOpenView,onAction}:{label:string;contacts:string[];onContacts(values:string[]):void;onOpenView(view:string|null):void;onAction(action:string,target?:string):void}) {
  if(label==="扫一扫")return <section className="wechat-plus-link"><p>正在打开扫一扫…</p><button onClick={()=>onOpenView("discover:扫一扫")}>进入扫一扫</button></section>;
  if(label==="收付款")return <section className="wechat-plus-link"><p>支付服务需要在本机确认。</p><button onClick={()=>onOpenView("me:服务")}>打开收付款</button></section>;
  if(label==="添加朋友")return <WechatContactsSubPage label="新的朋友" onOpenThread={()=>undefined} onAction={onAction}/>;
  const candidates=ordinaryWechatThreads.filter(thread=>!thread.group).slice(0,8);
  return <section className="wechat-new-group"><form onSubmit={event=>{event.preventDefault();if(contacts.length)onAction("创建群聊",contacts.join("、"))}}><input placeholder="搜索联系人"/><div>{candidates.map((thread,index)=>{
    const checked=contacts.includes(thread.id);
    return <label key={thread.id}><input type="checkbox" checked={checked} onChange={()=>onContacts(checked?contacts.filter(id=>id!==thread.id):[...contacts,thread.id])}/><img src={realisticWechatAvatar(thread.id,index)} alt={`${thread.title}头像`}/><b>{thread.title}</b></label>;
  })}</div><button disabled={contacts.length<2}>完成（{contacts.length}）</button></form></section>;
}

function WechatScaffold({children,tab,onTab}:{children:React.ReactNode;tab:string;onTab(value:string):void}) {
  const {goBack}=useGame();
  return <div className="app-window wechat-real" data-testid="wechat-home">
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出微信" onClick={goBack}/>
    <div className="wechat-page-scroll">{children}</div>
    <nav className="wechat-bottom-nav" aria-label="微信底部导航">{["微信","通讯录","发现","我"].map(label=><button aria-current={tab===label?"page":undefined} disabled={tab===label} className={tab===label?"active":""} key={label} onClick={()=>onTab(label)}><span>{label==="微信"?"◌":label==="通讯录"?"♙":label==="发现"?"◎":"♙"}</span><b>{label}</b></button>)}</nav>
  </div>;
}
