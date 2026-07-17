import { useMemo, useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem, unlockedItemsForApp } from "@/content/selectors";
import type { ContentItem } from "@/contracts/content";

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
};

export function WeChatApp(){
  const {state,activeDeviceId,emit}=useGame();
  const [thread,setThread]=useState<string|null>(null);
  const [query,setQuery]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const [played,setPlayed]=useState<string[]>([]);
  const items=unlockedItemsForApp(state,"app.wechat");
  const threads=activeDeviceId==="player"
    ?["妈妈","爸爸","阿序"]
    :["陈屿","妈","文件传输助手",...(state.content.unlockedContentIds.includes("message.pb_0425.01")?["PB_0425"]:[])];

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
    const result:ContentItem[]=items.filter(i=>(activeBody(state,i) as Body)?.thread===thread);
    if(thread==="文件传输助手"&&fileTransferItem) result.push(fileTransferItem);
    return result;
  },[items,state,thread,fileTransferItem]);

  const runSearch=(event:React.FormEvent)=>{
    event.preventDefault();
    setShowSearch(true);
    if(matchedSearch) emit("app.search.submitted","search.shenchuan.results",{query:normalizedQuery});
  };

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
      const last=items.filter(i=>(activeBody(state,i) as Body)?.thread===name).at(-1);
      const body=last?activeBody(state,last) as Body:undefined;
      return <button className="list-row" data-testid={`thread-${name}`} key={name} onClick={()=>{setThread(name);setShowSearch(false)}}>
        <span className="avatar">{name.slice(0,1)}</span><span><b>{name}</b><small>{body?.text??body?.transcript??(name==="文件传输助手"?"本机文件与传输记录":"暂无新消息")}</small></span><time>{body?.time??""}</time>
      </button>;
    })}</div>
  </AppChrome>;
}
