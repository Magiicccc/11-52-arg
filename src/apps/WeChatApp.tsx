import { useMemo, useState, type CSSProperties } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem, unlockedItemsForApp } from "@/content/selectors";
import type { ContentItem } from "@/contracts/content";
import { getPath } from "@/engine/path-utils";
import { ordinaryWechatThreads, ordinaryXhsNotes, type OrdinaryMessage } from "@/content/realism-life-data";
import { identityAvatar, realisticInternetAvatar, realisticWechatAvatar } from "@/content/avatar-assets";

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
  };
  const setTab=(value:string)=>{
    setTabState(value);
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
    return <AppChrome title={zhoulanBody.contact??"周岚"} actions={<button data-testid="wechat-conversations" onClick={()=>setThread(null)}>会话</button>}>
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
    return <AppChrome title={ordinaryForThread?.title??thread} actions={<div className="wechat-chat-header-actions"><button aria-label="搜索聊天记录" onClick={()=>setShowThreadSearch(value=>!value)}>⌕</button><button aria-label="聊天信息" onClick={()=>setShowThreadInfo(value=>!value)}>•••</button><button data-testid="wechat-conversations" onClick={()=>setThread(null)}>会话</button></div>}>
    <div className="chat-thread wechat-chat-with-avatars" style={chatAvatarStyle(peerAvatar,selfAvatar)}>
      {showThreadSearch&&<section className="wechat-thread-search"><input autoFocus value={threadQuery} onChange={event=>setThreadQuery(event.target.value)} placeholder="搜索聊天记录"/><b>{ordinaryForThread?.messages.filter(message=>!threadQuery.trim()||message.text.includes(threadQuery.trim())).length??0} 条结果</b></section>}
      {showThreadInfo&&<section className="wechat-thread-info"><header><img className="avatar" src={peerAvatar} alt="联系人头像"/><b>{ordinaryForThread?.title??thread}</b></header><button onClick={()=>setUiFlag(`wechat.pinned.${thread}`,true)}>置顶聊天</button><button onClick={()=>setUiFlag(`wechat.muted.${thread}`,true)}>消息免打扰</button><button onClick={()=>setShowThreadSearch(true)}>查找聊天内容</button></section>}
      {ordinaryForThread?.messages
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

  if(tab==="通讯录") return <WechatScaffold tab={tab} onTab={setTab}>
    <header className="wechat-section-header"><strong>通讯录</strong><button onClick={()=>setShowMenu(value=>!value)}>添加朋友</button></header>
    <div className="wechat-contact-tools">{["新的朋友","仅聊天的朋友","群聊","标签","公众号"].map(label=><button key={label} onClick={()=>emit("content.item.interacted","app.wechat",{surface:"contacts",label,source:"P"})}><span>{label.slice(0,1)}</span><b>{label}</b><i>›</i></button>)}</div>
    <div className="wechat-contact-list"><h2>联系人</h2>{ordinaryWechatThreads.filter(item=>!item.group).map((item,index)=><button key={item.id} onClick={()=>setThread(item.title==="陈屿"||item.title==="文件传输助手"?item.title:item.id)}><img className="avatar" src={realisticWechatAvatar(item.id,index)} alt={`${item.title}头像`}/><b>{item.title}</b></button>)}</div>
  </WechatScaffold>;

  if(tab==="发现") return <WechatScaffold tab={tab} onTab={setTab}>
    <header className="wechat-section-header"><strong>发现</strong></header>
    <div className="wechat-discover-menu">{["朋友圈","视频号","直播","扫一扫","摇一摇","看一看","搜一搜","附近"].map((label,index)=><button key={label} onClick={()=>setUiFlag(`wechat.discovery.${label}`,true)}><span>{["◎","▶","▣","⌗","↔","◉","⌕","⌖"][index]}</span><b>{label}</b><i>›</i></button>)}</div>
    <section className="wechat-moments-preview"><header><b>朋友圈</b><span>最近动态</span></header>{ordinaryXhsNotes.slice(0,8).map((note,index)=><article key={note.id}><img className="avatar" src={realisticInternetAvatar(note.author,20+index)} alt={`${note.author}头像`}/><div><b>{note.author}</b><p>{note.title}</p><img src={note.media} alt="普通生活动态"/><small>{note.date}</small></div></article>)}</section>
  </WechatScaffold>;

  if(tab==="我") return <WechatScaffold tab={tab} onTab={setTab}>
    <section className="wechat-me-card"><img className="avatar" src={selfAvatar} alt="川流档案头像"/><div><h1>川流档案</h1><p>微信号：chuanliu_archive</p><small>＋ 状态</small></div><button onClick={()=>setUiFlag("wechat.me.qrVisible",true)}>二维码</button></section>
    <div className="wechat-me-menu">{["服务","收藏","朋友圈","卡包","表情","设置"].map(label=><button key={label} onClick={()=>setUiFlag(`wechat.me.${label}`,true)}><span>{label.slice(0,1)}</span><b>{label}</b><i>›</i></button>)}</div>
  </WechatScaffold>;

  return <WechatScaffold tab={tab} onTab={setTab}>
    <header className="wechat-section-header"><strong>微信</strong><div><button data-testid="app-effective-action" aria-label="搜索" onClick={()=>setShowSearch(value=>!value)}>⌕</button><button aria-label="更多" onClick={()=>setShowMenu(value=>!value)}>＋</button></div></header>
    {showMenu&&<div className="wechat-plus-menu">{["发起群聊","添加朋友","扫一扫","收付款"].map(label=><button key={label} onClick={()=>{setShowMenu(false);emit("content.item.interacted","app.wechat",{surface:"plus-menu",label,source:"P"})}}>{label}</button>)}</div>}
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
      return <button className="list-row" data-testid={name==="__zhoulan"?"thread-周岚":`thread-${displayName}`} key={name} onClick={()=>{setThread(name);setShowSearch(false)}}>
        <img className="avatar" src={avatar} alt={`${displayName}头像`}/><span><b>{displayName}</b><small>{ordinary?.messages.at(-1)?.text??preview}</small></span><time>{ordinary?.messages.at(-1)?.time??body?.time??""}</time>
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

function WechatScaffold({children,tab,onTab}:{children:React.ReactNode;tab:string;onTab(value:string):void}) {
  const {goBack}=useGame();
  return <div className="app-window wechat-real" data-testid="wechat-home">
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出微信" onClick={goBack}/>
    <div className="wechat-page-scroll">{children}</div>
    <nav className="wechat-bottom-nav" aria-label="微信底部导航">{["微信","通讯录","发现","我"].map(label=><button className={tab===label?"active":""} key={label} onClick={()=>onTab(label)}><span>{label==="微信"?"◌":label==="通讯录"?"♙":label==="发现"?"◎":"♙"}</span><b>{label}</b></button>)}</nav>
  </div>;
}
