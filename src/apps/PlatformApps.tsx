import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useGame } from "@/app/GameContext";
import { activeBody, unlockedItemsForApp } from "@/content/selectors";
import { ordinaryMails, ordinaryPlatformRecords, ordinaryVideos, ordinaryXhsDrafts, ordinaryXhsNotes } from "@/content/realism-life-data";
import { realisticInternetAvatar } from "@/content/avatar-assets";
import { assetUrl } from "@/lib/asset-url";

type Body = Record<string, unknown>;

function text(body: Body, key: string, fallback = ""): string {
  const value = body[key];
  return typeof value === "string" ? value : fallback;
}

function number(body: Body, key: string, fallback = 0): number {
  const value = body[key];
  return typeof value === "number" ? value : fallback;
}

function stringList(body: Body, key: string): string[] {
  const value = body[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function PlatformBack({ onClick, label = "返回" }: { onClick(): void; label?: string }) {
  return <button className="platform-back" aria-label={label} onClick={onClick}>‹</button>;
}

function GeneratedAvatar({ slot, className, alt, identity }: { slot: number; className: string; alt: string; identity?: string }) {
  return <img className={className} src={realisticInternetAvatar(identity ?? alt, slot)} alt={alt}/>;
}

function PlatformBottomNav({ items, active, onChange }: { items: string[]; active: string; onChange(item: string): void }) {
  const { emit } = useGame();
  return <nav className="platform-bottom-nav" aria-label="底部导航">
    {items.map((item) => <button className={item === active ? "active" : ""} key={item} onClick={() => {
      onChange(item);
      emit("app.view.changed", "platform.bottom-navigation", { view: item, repeated: item === active, source: "P" });
    }}>{item}</button>)}
  </nav>;
}

function usePlatformScroll(route: string) {
  const { state, activeDeviceId, setScrollPosition } = useGame();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = state.devices[activeDeviceId].scrollByRoute[route] ?? 0;
  }, [activeDeviceId, route]);
  return {
    ref,
    restore() {
      if (ref.current) ref.current.scrollTop = state.devices[activeDeviceId].scrollByRoute[route] ?? 0;
    },
    remember() {
      if (ref.current) setScrollPosition(route, ref.current.scrollTop);
    }
  };
}

function PlatformStateButton({
  flag,
  label,
  activeLabel,
  contentId
}: {
  flag: string;
  label: string;
  activeLabel: string;
  contentId: string;
}) {
  const { state, setUiFlag, emit } = useGame();
  const active = state.world.flags[`ui.${flag}`] === true;
  return <button className={active ? "active" : ""} onClick={() => {
    setUiFlag(flag, !active);
    emit("content.item.interacted", contentId, { action: flag, active: !active });
  }}>{active ? activeLabel : label}</button>;
}

function DetailShell({
  className,
  title,
  onBack,
  children,
  footer
}: {
  className: string;
  title: string;
  onBack(): void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { goBack, emit } = useGame();
  const [showMore, setShowMore] = useState(false);
  return <div className={`app-window platform-app ${className}`}>
    <header className="platform-detail-header">
      <PlatformBack onClick={onBack}/>
      <strong>{title}</strong>
      <button aria-label="更多" onClick={() => setShowMore((value) => !value)}>•••</button>
    </header>
    {showMore && <div className="platform-more-sheet">{["分享","复制链接","收藏"].map((action) => <button key={action} onClick={() => {
      emit("content.item.interacted", title, { action, source: "P" });
      setShowMore(false);
    }}>{action}</button>)}</div>}
    <div className="platform-scroll">{children}</div>
    {footer}
    <button className="platform-close-hit" data-testid="app-back" aria-label={`退出${title}`} onClick={goBack}/>
  </div>;
}

export function XiaohongshuApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.xiaohongshu");
  const savedTab=state.world.flags["ui.xiaohongshu.tab"];
  const [tab,setTabState]=useState(typeof savedTab==="string"?savedTab:"首页");
  const [view,setView]=useState<"home"|"detail"|"search"|"profile">("home");
  const savedSelected=state.world.flags["ui.xiaohongshu.selected"];
  const [selectedId, setSelectedIdState] = useState<string | null>(typeof savedSelected==="string"?savedSelected:null);
  const savedDraft=state.world.flags["ui.xiaohongshu.draft"];
  const draft=typeof savedDraft==="object"&&savedDraft&&!Array.isArray(savedDraft)?savedDraft:{};
  const [draftTitle,setDraftTitle]=useState(typeof draft.title==="string"?draft.title:"");
  const [draftBody,setDraftBody]=useState(typeof draft.body==="string"?draft.body:"");
  const [query,setQuery]=useState("");
  const [commentText,setCommentText]=useState("");
  const [galleryIndex,setGalleryIndex]=useState(0);
  const scroll = usePlatformScroll("xiaohongshu.home");
  useLayoutEffect(()=>{
    if(view==="home") scroll.restore();
  },[view]);
  const formalNotes=items.map((item,index)=>{
    const body=activeBody(state,item) as Body;
    return {
      id:item.id,
      author:"川流档案",
      avatar:"川",
      category:"生活记录",
      title:text(body,"title"),
      body:[text(body,"text")],
      date:text(body,"date"),
      location:"杭州",
      likes:number(body,"likes"),
      comments:[{id:`${item.id}.comment`,author:"普通用户",text:"已收藏，稍后认真看。",likes:3}],
      media:ordinaryXhsNotes[index%ordinaryXhsNotes.length]!.media,
      mediaSet:[ordinaryXhsNotes[index%ordinaryXhsNotes.length]!.media],
      mediaType:"image" as const
    };
  });
  const notes=[...ordinaryXhsNotes,...formalNotes];
  const selected = notes.find((note) => note.id === selectedId);
  const setSelectedId=(value:string|null)=>{
    setSelectedIdState(value);
    setUiFlag("xiaohongshu.selected",value);
  };
  const setTab=(value:string)=>{
    setTabState(value);
    setUiFlag("xiaohongshu.tab",value);
    setView("home");
    emit("app.view.changed","app.xiaohongshu",{view:value,source:"P"});
  };
  const openNote=(id:string)=>{
    scroll.remember();
    setSelectedId(id);
    setGalleryIndex(0);
    setView("detail");
    setUiFlag(`xiaohongshu.history.${id}`,true);
    emit("content.item.opened",id,{surface:"xiaohongshu",source:"P"});
  };

  if (view==="detail"&&selected) {
    const selectedAvatarSlot=20+Math.max(0,notes.findIndex(note=>note.id===selected.id));
    const liked=state.world.flags[`ui.xiaohongshu.liked.${selected.id}`]===true;
    const savedFlag=state.world.flags[`ui.xiaohongshu.saved.${selected.id}`];
    const saved=typeof savedFlag==="boolean"?savedFlag:ordinaryXhsNotes.slice(0,6).some(note=>note.id===selected.id);
    const followed=state.world.flags[`ui.xiaohongshu.followed.${selected.author}`]===true;
    const addedComments=state.world.flags[`ui.xiaohongshu.comments.${selected.id}`];
    const playerComments=Array.isArray(addedComments)?addedComments.filter((item):item is string=>typeof item==="string"):[];
    return <DetailShell
      className="xhs-app"
      title="笔记"
      onBack={() => setView("home")}
      footer={<div className="xhs-detail-actions">
        <input value={commentText} onChange={event=>setCommentText(event.target.value)} placeholder="说点什么…"/>
        <button className={liked?"active":""} onClick={()=>{setUiFlag(`xiaohongshu.liked.${selected.id}`,!liked);emit("content.item.interacted",selected.id,{action:"like",active:!liked,source:"P"})}}>{liked?"已赞":`赞 ${selected.likes}`}</button>
        <button className={saved?"active":""} onClick={()=>{setUiFlag(`xiaohongshu.saved.${selected.id}`,!saved);emit("content.item.interacted",selected.id,{action:"save",active:!saved,source:"P"})}}>{saved?"已收藏":"收藏"}</button>
        <button disabled={!commentText.trim()} onClick={()=>{setUiFlag(`xiaohongshu.comments.${selected.id}`,[...playerComments,commentText.trim()]);emit("content.comment.created",selected.id,{text:commentText.trim(),source:"P"});setCommentText("")}}>发送</button>
      </div>}
    >
      <article className="xhs-note-detail">
        <div className="xhs-gallery">
          <img className="xhs-note-photo" src={assetUrl(selected.mediaSet[galleryIndex]??selected.media)} alt={`${selected.category}普通生活照片`}/>
          {selected.mediaType==="video"&&<span className="xhs-video-indicator">▶ {Math.max(8,selected.title.length)} 秒</span>}
          {selected.mediaSet.length>1&&<><span className="xhs-gallery-count">{galleryIndex+1}/{selected.mediaSet.length}</span><nav>{selected.mediaSet.map((_,index)=><button aria-label={`查看第${index+1}张`} className={galleryIndex===index?"active":""} key={index} onClick={()=>setGalleryIndex(index)}/>)}</nav></>}
        </div>
        <header><button className="xhs-author-button" onClick={()=>setView("profile")}><GeneratedAvatar className="xhs-avatar" slot={selectedAvatarSlot} identity={selected.author} alt={`${selected.author}头像`}/><b>{selected.author}</b></button><button className={followed?"active":""} onClick={()=>setUiFlag(`xiaohongshu.followed.${selected.author}`,!followed)}>{followed?"已关注":"关注"}</button></header>
        <h1>{selected.title}</h1>
        {selected.body.map((paragraph,index)=><p key={index}>{paragraph}</p>)}
        <div className="xhs-tags"><span>#{selected.category}</span><span>#生活记录</span></div>
        <time>{selected.date} · {selected.location}</time>
        <section className="xhs-comments">
          <b>共 {selected.comments.length+playerComments.length} 条评论</b>
          {selected.comments.map((comment,index)=><article key={comment.id}><GeneratedAvatar className="xhs-avatar" slot={46+index} identity={comment.author} alt={`${comment.author}头像`}/><div><b>{comment.author}</b><p>{comment.text}</p><small>♡ {comment.likes}</small></div></article>)}
          {playerComments.map((text,index)=><article key={`player-${index}`}><GeneratedAvatar className="xhs-avatar" slot={120} identity="川流档案" alt="川流档案头像"/><div><b>川流档案</b><p>{text}</p><small>刚刚</small></div></article>)}
        </section>
      </article>
    </DetailShell>;
  }

  if(view==="profile"&&selected) {
    const authorNotes=notes.filter(note=>note.author===selected.author);
    const followed=state.world.flags[`ui.xiaohongshu.followed.${selected.author}`]===true;
    return <DetailShell className="xhs-app" title="个人主页" onBack={()=>setView("detail")}>
      <section className="xhs-profile">
        <header><GeneratedAvatar className="xhs-avatar" slot={20+Math.max(0,notes.findIndex(note=>note.id===selected.id))} identity={selected.author} alt={`${selected.author}头像`}/><div><h1>{selected.author}</h1><p>普通生活记录 · {selected.category}</p></div></header>
        <div className="xhs-profile-stats"><span><b>{authorNotes.length}</b>笔记</span><span><b>{Math.max(12,selected.likes%1300)}</b>获赞与收藏</span><span><b>{Math.max(8,selected.comments.length*9)}</b>关注</span></div>
        <button className={followed?"active":""} onClick={()=>setUiFlag(`xiaohongshu.followed.${selected.author}`,!followed)}>{followed?"已关注":"关注"}</button>
        <div className="xhs-profile-grid">{authorNotes.map(note=><button key={note.id} onClick={()=>openNote(note.id)}><img src={assetUrl(note.media)} alt="笔记缩略图"/><b>{note.title}</b></button>)}</div>
      </section>
    </DetailShell>;
  }

  if(view==="search") {
    const results=notes.filter(note=>!query.trim()||`${note.title}${note.category}${note.author}`.includes(query.trim()));
    return <DetailShell className="xhs-app" title="搜索" onBack={()=>setView("home")}>
      <div className="xhs-search-page"><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索小红书"/><nav>{["综合","笔记","用户","商品"].map((label,index)=><button className={index===0?"active":""} key={label} onClick={()=>emit("app.search.submitted","app.xiaohongshu",{query,filter:label,source:"P"})}>{label}</button>)}</nav>{results.slice(0,16).map(note=><button key={note.id} onClick={()=>openNote(note.id)}><img src={assetUrl(note.media)} alt="搜索结果"/><div><b>{note.title}</b><small>{note.author} · ♡ {note.likes}</small></div></button>)}</div>
    </DetailShell>;
  }

  if(tab==="购物") return <XhsTabShell tab={tab} onTab={setTab} onExit={goBack}>
    <header className="xhs-store-header"><strong>小红书市集</strong><button onClick={()=>setView("search")}>搜索商品</button></header>
    <div className="xhs-store-categories">{["家居","数码","服饰","食品","运动","文具","摄影","更多"].map(label=><button key={label} onClick={()=>setUiFlag(`xiaohongshu.store.category.${label}`,true)}>{label}</button>)}</div>
    <section className="xhs-store-grid">{notes.filter(note=>["居家","数码整理","摄影","日常饮食"].includes(note.category)).slice(0,12).map((note,index)=><button key={note.id} onClick={()=>{setUiFlag(`xiaohongshu.cart.${note.id}`,true);emit("content.item.interacted",note.id,{action:"add-to-cart",source:"P"})}}><img src={assetUrl(note.media)} alt="生活好物"/><b>{note.title}</b><strong>¥{(19.9+index*7).toFixed(1)}</strong><small>加入购物车</small></button>)}</section>
  </XhsTabShell>;

  if(tab==="发布") return <XhsTabShell tab={tab} onTab={setTab} onExit={goBack}>
    <header className="xhs-publish-header"><button onClick={()=>setTab("首页")}>取消</button><strong>发布笔记</strong><button disabled={!draftTitle.trim()} onClick={()=>{setUiFlag("xiaohongshu.published",{title:draftTitle,body:draftBody,createdAt:"2026-07-15T21:35:00+08:00"});setUiFlag("xiaohongshu.draft",{});emit("content.item.created","app.xiaohongshu",{title:draftTitle,source:"P"});setDraftTitle("");setDraftBody("");setTab("我")}}>发布</button></header>
    <section className="xhs-publish-editor"><button className="xhs-publish-media" onClick={()=>emit("media.picker.opened","app.photos",{surface:"xiaohongshu",source:"P"})}>＋ 添加照片或视频</button><input value={draftTitle} onChange={event=>{setDraftTitle(event.target.value);setUiFlag("xiaohongshu.draft",{title:event.target.value,body:draftBody})}} placeholder="填写标题会有更多赞哦"/><textarea value={draftBody} onChange={event=>{setDraftBody(event.target.value);setUiFlag("xiaohongshu.draft",{title:draftTitle,body:event.target.value})}} placeholder="添加正文"/><div>{["#日常生活","#城市散步","#摄影","#工作方法"].map(label=><button key={label} onClick={()=>setDraftBody(value=>`${value}${value?" ":""}${label}`)}>{label}</button>)}</div><button onClick={()=>{setUiFlag("xiaohongshu.draft",{title:draftTitle,body:draftBody});emit("content.draft.saved","app.xiaohongshu",{source:"P"})}}>保存草稿</button></section>
  </XhsTabShell>;

  if(tab==="消息") return <XhsTabShell tab={tab} onTab={setTab} onExit={goBack}>
    <header className="xhs-simple-header"><strong>消息</strong></header>
    <div className="xhs-message-shortcuts">{["赞和收藏","新增关注","评论和@","陌生人消息"].map(label=><button key={label} onClick={()=>setUiFlag(`xiaohongshu.messages.${label}`,true)}><span>{label.slice(0,1)}</span><b>{label}</b><i>›</i></button>)}</div>
    <section className="xhs-message-list">{ordinaryXhsNotes.slice(0,8).map((note,index)=><button key={note.id} onClick={()=>openNote(note.id)}><GeneratedAvatar className="xhs-avatar" slot={20+index} identity={note.author} alt={`${note.author}头像`}/><div><b>{note.author}</b><p>{index%2===0?"赞了你的笔记":"回复了你的一条评论"}</p><small>{index+1} 小时前</small></div><img src={assetUrl(note.media)} alt="相关笔记"/></button>)}</section>
  </XhsTabShell>;

  if(tab==="我") {
    const savedNotes=notes.filter((note,index)=>{
      const flag=state.world.flags[`ui.xiaohongshu.saved.${note.id}`];
      return typeof flag==="boolean"?flag:index<6;
    });
    const historyNotes=notes.filter((note,index)=>state.world.flags[`ui.xiaohongshu.history.${note.id}`]===true||index<4);
    const published=state.world.flags["ui.xiaohongshu.published"];
    return <XhsTabShell tab={tab} onTab={setTab} onExit={goBack}>
      <section className="xhs-me-header"><GeneratedAvatar className="xhs-avatar" slot={120} identity="川流档案" alt="川流档案头像"/><div><h1>川流档案</h1><p>小红书号：chuanliu_archive</p></div><button onClick={()=>setUiFlag("xiaohongshu.profile.editing",true)}>编辑资料</button></section>
      <div className="xhs-me-stats"><span><b>87</b>关注</span><span><b>316</b>粉丝</span><span><b>1,642</b>获赞与收藏</span></div>
      <nav className="xhs-me-tabs">{["笔记","收藏","赞过","浏览记录","草稿"].map(label=><button key={label} onClick={()=>setUiFlag("xiaohongshu.me.section",label)}>{label}</button>)}</nav>
      <section className="xhs-me-summary"><div><b>收藏</b><span>{savedNotes.length} 篇</span></div><div><b>浏览记录</b><span>{historyNotes.length} 篇</span></div><div><b>草稿</b><span>{ordinaryXhsDrafts.length+(draftTitle||draftBody?1:0)} 篇</span></div></section>
      <section className="xhs-draft-list">{ordinaryXhsDrafts.map(item=><article key={item.id}><img src={assetUrl(item.media)} alt="普通生活草稿"/><div><b>{item.title}</b><p>{item.body}</p><small>{item.updatedAt}</small></div></article>)}</section>
      {published&&typeof published==="object"&&!Array.isArray(published)&&<article className="xhs-published-note"><b>{typeof published.title==="string"?published.title:"新笔记"}</b><p>{typeof published.body==="string"?published.body:""}</p><small>仅本机发布记录</small></article>}
      <div className="xhs-profile-grid">{[...savedNotes,...historyNotes,...ordinaryXhsNotes].filter((note,index,array)=>array.findIndex(candidate=>candidate.id===note.id)===index).slice(0,12).map(note=><button key={note.id} onClick={()=>openNote(note.id)}><img src={assetUrl(note.media)} alt="个人页笔记"/><b>{note.title}</b></button>)}</div>
    </XhsTabShell>;
  }

  return <div className="app-window platform-app xhs-app" data-testid="xiaohongshu-home">
    <header className="xhs-home-header">
      <button aria-label="菜单" onClick={()=>setTab("我")}>☰</button>
      <nav><button onClick={()=>setUiFlag("xiaohongshu.feed","following")}>关注</button><button className="active" onClick={()=>setUiFlag("xiaohongshu.feed","discover")}>发现</button><button onClick={()=>setUiFlag("xiaohongshu.feed","nearby")}>附近</button></nav>
      <button aria-label="搜索" onClick={()=>setView("search")}>⌕</button>
    </header>
    <div className="xhs-topic-tabs">{["推荐","穿搭","美食","旅行","摄影","数码","居家"].map((label,index)=><button className={index===0?"active":""} key={label} onClick={()=>setUiFlag("xiaohongshu.category",label)}>{label}</button>)}</div>
    <div className="platform-scroll xhs-feed" ref={scroll.ref}>
      {notes.map((note, index) => {
        return <button
          className="xhs-card"
          data-testid={index === 0 ? "app-effective-action" : undefined}
          key={note.id}
          onClick={() => openNote(note.id)}
        >
          <img className="xhs-cover" src={assetUrl(note.media)} alt={`${note.category}生活照片`}/>
          {note.mediaSet.length>1&&<span className="xhs-card-media-mark">▣ {note.mediaSet.length}</span>}
          {note.mediaType==="video"&&<span className="xhs-card-video-mark">▶</span>}
          <b>{note.title}</b>
          <small><GeneratedAvatar className="xhs-feed-avatar" slot={20+index} identity={note.author} alt={`${note.author}头像`}/> {note.author} <span>♡ {note.likes}</span></small>
        </button>;
      })}
      <div className="xhs-feed-end">已经到底了 · 共 {notes.length} 篇笔记</div>
    </div>
    <nav className="platform-bottom-nav" aria-label="小红书底部导航">{["首页","购物","发布","消息","我"].map(label=><button className={label==="首页"?"active":label==="发布"?"publish":""} key={label} onClick={()=>setTab(label)}>{label==="发布"?"＋":label}</button>)}</nav>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出小红书" onClick={goBack}/>
  </div>;
}

function XhsTabShell({children,tab,onTab,onExit}:{children:ReactNode;tab:string;onTab(value:string):void;onExit():void}) {
  return <div className="app-window platform-app xhs-app" data-testid={`xiaohongshu-${tab}`}>
    <div className="platform-scroll">{children}</div>
    <nav className="platform-bottom-nav" aria-label="小红书底部导航">{["首页","购物","发布","消息","我"].map(label=><button className={label===tab?"active":label==="发布"?"publish":""} key={label} onClick={()=>onTab(label)}>{label==="发布"?"＋":label}</button>)}</nav>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出小红书" onClick={onExit}/>
  </div>;
}

export function DouyinApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.douyin");
  const videos=[
    ...ordinaryVideos,
    ...items.map((item,index)=>{
      const body=activeBody(state,item) as Body;
      return {
        id:item.id,
        author:text(body,"author","川流档案"),
        caption:text(body,"caption","普通城市记录"),
        category:"生活",
        likes:number(body,"likes"),
        comments:number(body,"comments"),
        duration:12,
        media:ordinaryVideos[index%ordinaryVideos.length]!.media
      };
    })
  ];
  const storedIndex=Number(state.world.flags["ui.douyin.feedIndex"]??0);
  const currentIndex=Math.max(0,Math.min(videos.length-1,Number.isFinite(storedIndex)?storedIndex:0));
  const item = videos[currentIndex];
  const [paused, setPaused] = useState(false);
  const [tab, setTab] = useState("首页");
  const [feedMode,setFeedMode]=useState("推荐");
  const saved = item ? state.world.flags[`ui.douyin.saved.${item.id}`] === true : false;
  const followed = item ? state.world.flags[`ui.douyin.followed.${item.author}`] === true : false;
  const changeVideo=(direction:number)=>{
    if(videos.length===0)return;
    const next=(currentIndex+direction+videos.length)%videos.length;
    setUiFlag("douyin.feedIndex",next);
    emit("app.view.changed","app.douyin",{view:"feed",index:next,source:"P"});
  };
  if (tab !== "首页") {
    const tabRows: Record<string, string[]> = {
      朋友: ["周末散步发来一条新视频", "城市摄影小组更新了动态", "阿序分享了普通生活片段"],
      "＋": ["拍摄", "从相册选择", "文字作品", "开直播"],
      直播: ["城市生活直播", "摄影器材交流", "安静学习直播间"],
      搜索: ["城市散步", "手机摄影", "文件整理", "普通午饭"],
      消息: ["互动消息", "新增关注", "系统通知", "私信"],
      我: ["作品 6", "私密 3", "收藏 12", "喜欢 29", "观看历史"]
    };
    return <div className="app-window platform-app douyin-app douyin-tab-page" data-testid={`douyin-${tab}`}>
      <header className="douyin-header"><button onClick={() => setTab("首页")}>‹</button><strong>{tab === "＋" ? "发布作品" : tab}</strong><button onClick={() => setUiFlag(`douyin.${tab}.settings`, true)}>•••</button></header>
      <div className="platform-scroll platform-tab-page">{(tabRows[tab] ?? []).map((row, index) => <button key={row} onClick={() => {
        setUiFlag(`douyin.${tab}.${index}`, true);
        emit("content.item.interacted", "app.douyin", { surface: tab, label: row, source: "P" });
      }}><b>{row}</b><span>›</span></button>)}</div>
      <nav className="platform-bottom-nav" aria-label="抖音底部导航">{["首页","朋友","＋","消息","我"].map(label=><button className={label===tab?"active":""} key={label} onClick={()=>{setTab(label);emit("app.view.changed","app.douyin",{view:label,source:"P"})}}>{label}</button>)}</nav>
      <button className="platform-close-hit" data-testid="app-back" aria-label="退出抖音" onClick={goBack}/>
    </div>;
  }
  return <div className="app-window platform-app douyin-app" data-testid="douyin-home">
    <header className="douyin-header">
      <button aria-label="直播" onClick={()=>{setUiFlag("douyin.live.open",true);setTab("直播")}}>LIVE</button>
      <nav>{["关注","推荐"].map(label=><button className={feedMode===label?"active":""} key={label} onClick={()=>{setFeedMode(label);setUiFlag("douyin.feed",label);emit("app.view.changed","app.douyin",{view:label,source:"P"})}}>{label}</button>)}</nav>
      <button aria-label="搜索" onClick={()=>{setUiFlag("douyin.search.open",true);setTab("搜索")}}>⌕</button>
    </header>
    <button
      className="douyin-stage"
      data-testid="app-effective-action"
      aria-label={paused ? "继续播放" : "暂停播放"}
      onClick={() => {
        setPaused((value) => !value);
        if (item) emit("content.item.interacted", item.id, { action: "playback", paused: !paused });
      }}
    >
      {item&&<img className="douyin-media" src={assetUrl(item.media)} alt={`${item.category}普通短视频封面`}/>}
      {paused && <span className="douyin-play-state">▶</span>}
    </button>
    <aside className="douyin-actions">
      <button className={followed?"active":""} onClick={()=>{if(!item)return;setUiFlag(`douyin.followed.${item.author}`,!followed);emit("content.item.interacted",item.id,{action:"follow",active:!followed,source:"P"})}}><GeneratedAvatar className="douyin-avatar" slot={52+currentIndex} identity={item?.author} alt={`${item?.author??"视频作者"}头像`}/><b>{followed?"✓":"＋"}</b></button>
      <button onClick={() => item && emit("content.item.interacted", item.id, { action: "like", source:"P" })}>♡<small>{item?.likes??0}</small></button>
      <button onClick={() => item && emit("content.item.interacted", item.id, { action: "comments", source:"P" })}>◌<small>{item?.comments??0}</small></button>
      <button className={saved ? "active" : ""} onClick={() => {
        if (!item) return;
        setUiFlag(`douyin.saved.${item.id}`, !saved);
        emit("content.item.interacted", item.id, { action: "save", active: !saved });
      }}>☆<small>{saved ? "已收藏" : "收藏"}</small></button>
      <button onClick={()=>item&&emit("content.item.interacted",item.id,{action:"share-sheet",source:"P"})}>↗<small>分享</small></button>
    </aside>
    <section className="douyin-caption">
      <b>@{item?.author??"城市边角"}</b>
      <p>{item?.caption??"暂无视频说明"}</p>
      <span>♫ 原声 · {item?.author??"城市边角"} · {item?.duration??0}秒</span>
    </section>
    <div className="douyin-feed-controls"><button onClick={()=>changeVideo(-1)}>上一条</button><span>{currentIndex+1} / {videos.length}</span><button onClick={()=>changeVideo(1)}>下一条</button></div>
    <nav className="platform-bottom-nav" aria-label="抖音底部导航">{["首页","朋友","＋","消息","我"].map(label=><button className={label===tab?"active":""} key={label} onClick={()=>{setTab(label);setUiFlag("douyin.tab",label);emit("app.view.changed","app.douyin",{view:label,source:"P"})}}>{label}</button>)}</nav>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出抖音" onClick={goBack}/>
  </div>;
}

export function ToutiaoApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.toutiao");
  const ordinaryRecords = ordinaryPlatformRecords.filter((record) => record.appId === "app.toutiao");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("首页");
  const [channel, setChannel] = useState("推荐");
  const [commenting, setCommenting] = useState(false);
  const scroll = usePlatformScroll("toutiao.home");
  useLayoutEffect(()=>{
    if(!selectedId) scroll.restore();
  },[selectedId]);
  const selected = items.find((item) => item.id === selectedId);
  const selectedOrdinary = ordinaryRecords.find((record) => record.id === selectedId);
  if (selected || selectedOrdinary) {
    const body = selected ? activeBody(state, selected) as Body : {
      title: selectedOrdinary!.title,
      summary: selectedOrdinary!.subtitle,
      date: selectedOrdinary!.date
    };
    const detailId = selected?.id ?? selectedOrdinary!.id;
    return <DetailShell className="toutiao-app" title="今日头条" onBack={() => setSelectedId(null)} footer={
      <div className="toutiao-actions">
        <button onClick={() => setCommenting(true)}>{commenting ? "评论已打开" : "写评论…"}</button>
        <PlatformStateButton flag={`toutiao.liked.${detailId}`} label="♡" activeLabel="♥" contentId={detailId}/>
        <PlatformStateButton flag={`toutiao.saved.${detailId}`} label="☆" activeLabel="★" contentId={detailId}/>
        <button onClick={() => emit("content.item.interacted", detailId, { action: "share-sheet", source: "P" })}>↗</button>
      </div>
    }>
      <article className="toutiao-article">
        <h1>{text(body, "title")}</h1>
        <div><span className="toutiao-source">头条新闻</span><time>{text(body, "date")}</time></div>
        <p>{text(body, "summary")}</p>
      </article>
    </DetailShell>;
  }
  if (tab !== "首页") {
    const tabContent: Record<string, { title: string; rows: string[] }> = {
      视频: { title: "视频", rows: ["城市雨夜的慢镜头记录", "三分钟整理手机照片", "周末菜市场的一小时"] },
      发布: { title: "发布", rows: ["写文章", "发微头条", "上传普通生活视频"] },
      消息: { title: "消息", rows: ["系统通知：隐私设置已更新", "摄影频道回复了你的评论", "城市生活话题有新内容"] },
      我的: { title: "我的", rows: ["收藏 18", "历史 46", "关注 27", "设置"] },
      搜索: { title: "搜索", rows: ["城市生活", "网页缓存", "手机照片整理"] }
    };
    const content = tabContent[tab] ?? { title: "我的", rows: ["收藏 18", "历史 46", "关注 27", "设置"] };
    return <div className="app-window platform-app toutiao-app" data-testid={`toutiao-${tab}`}>
      <header className="toutiao-home-header"><strong>{content.title}</strong><button onClick={() => setTab("首页")}>返回首页</button></header>
      <div className="platform-scroll platform-tab-page">{content.rows.map((row, index) => <button key={row} onClick={() => {
        setUiFlag(`toutiao.${tab}.${index}`, true);
        emit("content.item.interacted", "app.toutiao", { surface: tab, label: row, source: "P" });
      }}><b>{row}</b><span>›</span></button>)}</div>
      <PlatformBottomNav items={["首页", "视频", "发布", "消息", "我的"]} active={tab} onChange={setTab}/>
      <button className="platform-close-hit" data-testid="app-back" aria-label="退出今日头条" onClick={goBack}/>
    </div>;
  }
  return <div className="app-window platform-app toutiao-app" data-testid="toutiao-home">
    <header className="toutiao-home-header"><strong>今日头条</strong><button aria-label="搜索" onClick={() => setTab("搜索")}>⌕</button><button aria-label="发布" onClick={() => setTab("发布")}>＋</button></header>
    <nav className="toutiao-tabs">{["关注","推荐","热榜","杭州","视频"].map((label) => <button className={channel === label ? "active" : ""} key={label} onClick={() => {
      setChannel(label);
      setUiFlag("toutiao.channel", label);
      emit("app.view.changed", "app.toutiao", { view: label, source: "P" });
    }}>{label}</button>)}</nav>
    <div className="platform-scroll toutiao-feed" ref={scroll.ref}>
      {ordinaryRecords.map((record, index) => <button data-testid={index === 0 ? "app-effective-action" : undefined} className="toutiao-card" key={record.id} onClick={() => {
        setSelectedId(record.id);
        emit("content.item.opened", record.id, { surface: "toutiao", source: "P" });
        scroll.remember();
      }}>
        <b>{record.title}</b>
        <p>{record.subtitle}</p>
        <small>{record.category} · {record.date}</small>
      </button>)}
      {items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button className="toutiao-card" key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "toutiao" });
          scroll.remember();
        }}>
          <b>{text(body, "title")}</b>
          <p>{text(body, "summary")}</p>
          <small>头条新闻 · {text(body, "date")}</small>
        </button>;
      })}
      <section className="toutiao-hot"><header><b>头条热榜</b><span>实时更新</span></header><p>当前设备未缓存热榜条目</p></section>
    </div>
    <PlatformBottomNav items={["首页", "视频", "发布", "消息", "我的"]} active={tab} onChange={setTab}/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出今日头条" onClick={goBack}/>
  </div>;
}

export function QQMailApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.qqmail");
  const [view,setView]=useState<"list"|"detail"|"folders"|"compose"|"search">("list");
  const [tab,setTab]=useState("邮件");
  const [folder,setFolder]=useState("收件箱");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query,setQuery]=useState("");
  const [replyText,setReplyText]=useState("");
  const [compose,setCompose]=useState({to:"",subject:"",body:""});
  const scroll = usePlatformScroll("qqmail.home");
  useLayoutEffect(()=>{
    if(view==="list") scroll.restore();
  },[view]);
  const formalMails=items.map((item)=>{
    const body=activeBody(state,item) as Body;
    return {
      id:item.id,threadId:item.id,folder:"收件箱" as const,from:text(body,"from","系统邮件"),senderType:"service" as const,
      subject:text(body,"subject","邮件"),preview:text(body,"preview"),body:[text(body,"preview")],date:text(body,"date"),
      unread:true,narrative:null
    };
  });
  const mails=[...ordinaryMails,...formalMails].filter(mail=>state.world.flags[`ui.qqmail.deleted.${mail.id}`]!==true);
  const selected = mails.find((mail) => mail.id === selectedId);
  const visibleMails=mails.filter(mail=>{
    const moved=state.world.flags[`ui.qqmail.folder.${mail.id}`];
    const currentFolder=typeof moved==="string"?moved:mail.folder;
    const matchesFolder=folder==="所有邮件"||currentFolder===folder;
    const needle=query.trim().toLowerCase();
    return matchesFolder&&(!needle||`${mail.from}${mail.subject}${mail.preview}`.toLowerCase().includes(needle));
  });
  const openMail=(id:string)=>{
    setSelectedId(id);setView("detail");
    setUiFlag(`qqmail.read.${id}`,true);
    emit("content.item.opened",id,{surface:"qqmail",source:"P"});
    scroll.remember();
  };
  if (view==="detail"&&selected) {
    const starred=state.world.flags[`ui.qqmail.starred.${selected.id}`]===true||"starred" in selected&&selected.starred===true;
    const attachments="attachments" in selected?selected.attachments:undefined;
    return <DetailShell className="qqmail-app" title="邮件" onBack={() => setView("list")} footer={
      <div className="mail-actions">
        <button onClick={()=>setReplyText(replyText||`Re: ${selected.subject}\n`)}>回复</button>
        <button onClick={()=>{setCompose({to:"",subject:`Fwd: ${selected.subject}`,body:selected.preview});setView("compose")}}>转发</button>
        <button onClick={()=>setView("folders")}>移动</button>
        <button onClick={()=>{setUiFlag(`qqmail.deleted.${selected.id}`,true);emit("content.item.interacted",selected.id,{action:"delete",source:"P"});setView("list")}}>删除</button>
      </div>
    }>
      <article className="mail-detail">
        <h1>{selected.subject}</h1>
        <header><GeneratedAvatar className="mail-avatar" slot={68+Math.max(0,mails.findIndex(mail=>mail.id===selected.id))} identity={selected.from} alt={`${selected.from}头像`}/><div><b>{selected.from}</b><small>发给 沈川 · {selected.date}</small></div><button className={starred?"active":""} onClick={()=>setUiFlag(`qqmail.starred.${selected.id}`,!starred)}>{starred?"★":"☆"}</button></header>
        {selected.body.map((paragraph,index)=><p key={index}>{paragraph}</p>)}
        {attachments&&attachments.length>0&&<section className="mail-attachments"><b>{attachments.length} 个附件</b>{attachments.map(attachment=><button key={attachment.id} onClick={()=>{setUiFlag(`qqmail.downloaded.${attachment.id}`,true);emit("content.item.interacted",attachment.id,{action:"download",source:"P"})}}><span>{attachment.kind}</span><div><b>{attachment.name}</b><small>{attachment.size}</small></div><i>下载</i></button>)}</section>}
        {replyText&&<section className="mail-inline-reply"><textarea value={replyText} onChange={event=>setReplyText(event.target.value)}/><button onClick={()=>{setUiFlag(`qqmail.reply.${selected.id}`,replyText);emit("message.email.sent",selected.id,{mode:"reply",source:"P"});setReplyText("")}}>发送回复</button></section>}
        {mails.filter(mail=>mail.threadId===selected.threadId&&mail.id!==selected.id).length>0&&<section className="mail-thread"><b>同一会话</b>{mails.filter(mail=>mail.threadId===selected.threadId&&mail.id!==selected.id).map(mail=><button key={mail.id} onClick={()=>openMail(mail.id)}><span>{mail.from}</span><b>{mail.subject}</b><small>{mail.date}</small></button>)}</section>}
      </article>
    </DetailShell>;
  }

  if(view==="folders") return <DetailShell className="qqmail-app" title="邮箱" onBack={()=>setView(selected?"detail":"list")}>
    <section className="mail-folder-page"><header><GeneratedAvatar className="mail-account" slot={121} identity="沈川" alt="沈川邮箱头像"/><div><b>沈川</b><small>已同步</small></div></header>{["收件箱","星标邮件","已发送","草稿箱","订阅邮件","归档","垃圾箱","所有邮件"].map(label=><button key={label} onClick={()=>{if(selected){setUiFlag(`qqmail.folder.${selected.id}`,label);emit("content.item.interacted",selected.id,{action:"move",folder:label,source:"P"})}setFolder(label);setView("list")}}><span>{label.slice(0,1)}</span><b>{label}</b><i>{mails.filter(mail=>mail.folder===label).length||""}</i></button>)}</section>
  </DetailShell>;

  if(view==="compose") return <DetailShell className="qqmail-app" title="写邮件" onBack={()=>setView("list")} footer={<div className="mail-compose-actions"><button onClick={()=>{setUiFlag("qqmail.compose.draft",compose);emit("content.draft.saved","app.qqmail",{source:"P"});setView("list")}}>存草稿</button><button disabled={!compose.to.trim()||!compose.subject.trim()} onClick={()=>{setUiFlag("qqmail.compose.sent",{...compose,sentAt:"2026-07-15T21:35:00+08:00"});emit("message.email.sent","app.qqmail",{mode:"compose",to:compose.to,source:"P"});setCompose({to:"",subject:"",body:""});setView("list")}}>发送</button></div>}>
    <form className="mail-compose" onSubmit={event=>event.preventDefault()}><label>收件人<input value={compose.to} onChange={event=>setCompose(value=>({...value,to:event.target.value}))}/></label><label>主题<input value={compose.subject} onChange={event=>setCompose(value=>({...value,subject:event.target.value}))}/></label><textarea value={compose.body} onChange={event=>setCompose(value=>({...value,body:event.target.value}))} placeholder="邮件正文"/><button type="button" onClick={()=>emit("media.picker.opened","app.files",{surface:"qqmail",source:"P"})}>添加附件</button></form>
  </DetailShell>;

  if(view==="search") return <DetailShell className="qqmail-app" title="搜索邮件" onBack={()=>setView("list")}>
    <div className="mail-search-page"><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder="发件人、主题或正文"/>{visibleMails.map(mail=><button key={mail.id} onClick={()=>openMail(mail.id)}><b>{mail.from}</b><strong>{mail.subject}</strong><p>{mail.preview}</p></button>)}</div>
  </DetailShell>;

  if (tab !== "邮件") {
    const tabRows: Record<string, string[]> = {
      通讯录: ["陈屿", "周岚", "城市摄影小组", "工作往来"],
      日历: ["今天 18:30 整理照片", "明天 09:00 项目周会", "周六 15:00 取修好的镜头"],
      文件: ["项目排期.xlsx", "照片备份清单.pdf", "城市走访记录.docx", "车票报销凭证.zip"]
    };
    return <div className="app-window platform-app qqmail-app" data-testid={`qqmail-${tab}`}>
      <header className="qqmail-header"><button className="mail-account" onClick={() => setTab("邮件")}><GeneratedAvatar className="mail-account-image" slot={121} identity="沈川" alt="沈川邮箱头像"/></button><strong>{tab}</strong><button aria-label="新增" onClick={() => {
        setUiFlag(`qqmail.${tab}.create`, true);
        emit("content.item.created", "app.qqmail", { surface: tab, source: "P" });
      }}>＋</button></header>
      <div className="platform-scroll platform-tab-page">{(tabRows[tab] ?? []).map((row, index) => <button key={row} onClick={() => {
        setUiFlag(`qqmail.${tab}.${index}`, true);
        emit("content.item.interacted", "app.qqmail", { surface: tab, label: row, source: "P" });
      }}><b>{row}</b><span>›</span></button>)}</div>
      <nav className="platform-bottom-nav" aria-label="QQ邮箱底部导航">{["邮件","通讯录","日历","文件"].map(label=><button className={label===tab?"active":""} key={label} onClick={()=>{setTab(label);emit("app.view.changed","app.qqmail",{view:label,source:"P"})}}>{label}</button>)}</nav>
      <button className="platform-close-hit" data-testid="app-back" aria-label="退出QQ邮箱" onClick={goBack}/>
    </div>;
  }

  return <div className="app-window platform-app qqmail-app" data-testid="qqmail-home">
    <header className="qqmail-header"><button aria-label="邮箱文件夹" className="mail-account" onClick={()=>setView("folders")}><GeneratedAvatar className="mail-account-image" slot={121} identity="沈川" alt="沈川邮箱头像"/></button><strong>{folder}</strong><div><button aria-label="搜索" onClick={()=>setView("search")}>⌕</button><button aria-label="写邮件" onClick={()=>setView("compose")}>＋</button></div></header>
    <button className="mail-search" onClick={()=>setView("search")}>搜索邮件</button>
    <div className="platform-scroll mail-list" ref={scroll.ref}>
      <section className="mail-folders"><button onClick={()=>{setFolder("收件箱");setUiFlag("qqmail.filter","unread")}}>所有未读 <b>{mails.filter(mail=>mail.unread&&state.world.flags[`ui.qqmail.read.${mail.id}`]!==true).length}</b></button><button onClick={()=>setFolder("星标邮件")}>星标邮件</button><button onClick={()=>setUiFlag("qqmail.attachment.manager",true)}>附件管理</button></section>
      {visibleMails.map((mail, index) => {
        const read=state.world.flags[`ui.qqmail.read.${mail.id}`]===true||!mail.unread;
        return <button data-testid={index === 0 ? "app-effective-action" : undefined} className={`mail-row ${read?"read":""}`} key={mail.id} onClick={() => openMail(mail.id)}>
          <span className="mail-list-avatar"><GeneratedAvatar className="mail-avatar" slot={68+index} identity={mail.from} alt={`${mail.from}头像`}/><i className="mail-unread"/></span>
          <div><b>{mail.from}</b><strong>{mail.subject}</strong><p>{mail.preview}</p></div>
          <time>{mail.date}</time>
        </button>;
      })}
    </div>
    <nav className="platform-bottom-nav" aria-label="QQ邮箱底部导航">{["邮件","通讯录","日历","文件"].map(label=><button className={label===tab?"active":""} key={label} onClick={()=>{setTab(label);setUiFlag("qqmail.tab",label);emit("app.view.changed","app.qqmail",{view:label,source:"P"})}}>{label}</button>)}</nav>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出QQ邮箱" onClick={goBack}/>
  </div>;
}

export function BaiduNetdiskApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.baidunetdisk");
  const ordinaryRecords = ordinaryPlatformRecords.filter((record) => record.appId === "app.baidunetdisk");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("首页");
  const scroll = usePlatformScroll("baidunetdisk.home");
  useLayoutEffect(()=>{
    if(!selectedId) scroll.restore();
  },[selectedId]);
  const selected = items.find((item) => item.id === selectedId);
  const selectedOrdinary = ordinaryRecords.find((record) => record.id === selectedId);
  if (selected || selectedOrdinary) {
    const body = selected ? activeBody(state, selected) as Body : { name: selectedOrdinary!.title, size: selectedOrdinary!.subtitle, status: "已同步" };
    const detailId = selected?.id ?? selectedOrdinary!.id;
    return <DetailShell className="netdisk-app" title={text(body, "name", "文件详情")} onBack={() => setSelectedId(null)}>
      <section className="netdisk-file-detail">
        <span className="netdisk-file-icon">ZIP</span>
        <h1>{text(body, "name")}</h1>
        <p>{text(body, "size")} · {text(body, "status")}</p>
        <button onClick={() => emit("content.item.interacted", detailId, { action: "download" })}>下载到本机</button>
        <button onClick={() => emit("content.item.interacted", detailId, { action: "share" })}>分享</button>
      </section>
    </DetailShell>;
  }
  if (tab !== "首页") {
    const tabRows: Record<string, string[]> = {
      文件: ["全部文件", "图片", "视频", "文档", "音频", "压缩包"],
      传输: ["正在传输 0", "传输完成 12", "离线下载"],
      分享: ["我分享的文件", "收到的分享", "分享动态"],
      我的: ["存储空间 18.4 GB / 100 GB", "回收站", "设备管理", "设置"]
    };
    return <div className="app-window platform-app netdisk-app" data-testid={`baidunetdisk-${tab}`}>
      <header className="netdisk-header"><GeneratedAvatar className="netdisk-account" slot={121} identity="沈川" alt="沈川网盘头像"/><div><b>{tab}</b><small>百度网盘</small></div><button onClick={() => {
        setUiFlag("baidunetdisk.upload.open", true);
        emit("media.picker.opened", "app.files", { surface: "baidunetdisk", source: "P" });
      }}>＋</button></header>
      <div className="platform-scroll platform-tab-page">{(tabRows[tab] ?? []).map((row, index) => <button key={row} onClick={() => {
        setUiFlag(`baidunetdisk.${tab}.${index}`, true);
        emit("content.item.interacted", "app.baidunetdisk", { surface: tab, label: row, source: "P" });
      }}><b>{row}</b><span>›</span></button>)}</div>
      <PlatformBottomNav items={["首页", "文件", "传输", "分享", "我的"]} active={tab} onChange={setTab}/>
      <button className="platform-close-hit" data-testid="app-back" aria-label="退出百度网盘" onClick={goBack}/>
    </div>;
  }
  return <div className="app-window platform-app netdisk-app" data-testid="baidunetdisk-home">
    <header className="netdisk-header"><GeneratedAvatar className="netdisk-account" slot={121} identity="沈川" alt="沈川网盘头像"/><div><b>百度网盘</b><small>安全保存每一份文件</small></div><button onClick={() => {
      setUiFlag("baidunetdisk.upload.open", true);
      emit("media.picker.opened", "app.files", { surface: "baidunetdisk", source: "P" });
    }}>＋</button></header>
    <div className="netdisk-search">搜索网盘文件</div>
    <div className="platform-scroll netdisk-home" ref={scroll.ref}>
      <section className="netdisk-shortcuts">{["图片", "视频", "文档", "音频", "压缩包"].map((label) => <button key={label} onClick={() => {
        setTab("文件");
        setUiFlag("baidunetdisk.file.filter", label);
      }}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <section className="netdisk-storage"><b>存储空间</b><span>查看详情</span><i><b/></i></section>
      <h2>最近</h2>
      {ordinaryRecords.map((record, index) => <button data-testid={index === 0 ? "app-effective-action" : undefined} className="netdisk-file-row" key={record.id} onClick={() => {
        setSelectedId(record.id);
        emit("content.item.opened", record.id, { surface: "baidunetdisk", source: "P" });
        scroll.remember();
      }}><span>{record.subtitle.includes("音频") ? "M4A" : record.subtitle.includes("文件夹") ? "DIR" : "DOC"}</span><div><b>{record.title}</b><small>{record.subtitle} · 已同步</small></div><i>•••</i></button>)}
      {items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button className="netdisk-file-row" key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "baidunetdisk" });
          scroll.remember();
        }}>
          <span>ZIP</span><div><b>{text(body, "name")}</b><small>{text(body, "size")} · {text(body, "status")}</small></div><i>•••</i>
        </button>;
      })}
    </div>
    <PlatformBottomNav items={["首页", "文件", "传输", "分享", "我的"]} active={tab} onChange={setTab}/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出百度网盘" onClick={goBack}/>
  </div>;
}

export function AlipayApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.alipay");
  const ordinaryRecords = ordinaryPlatformRecords.filter((record) => record.appId === "app.alipay");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("首页");
  const scroll = usePlatformScroll("alipay.home");
  useLayoutEffect(()=>{
    if(!selectedId) scroll.restore();
  },[selectedId]);
  const selected = items.find((item) => item.id === selectedId);
  const selectedOrdinary = ordinaryRecords.find((record) => record.id === selectedId);
  if (selected || selectedOrdinary) {
    const body = selected ? activeBody(state, selected) as Body : { merchant: selectedOrdinary!.title, amount: selectedOrdinary!.amount, date: selectedOrdinary!.date };
    return <DetailShell className="alipay-app" title="账单详情" onBack={() => setSelectedId(null)}>
      <section className="alipay-bill-detail">
        <span className="alipay-merchant-mark">支</span>
        <b>{text(body, "merchant")}</b>
        <h1>−{number(body, "amount").toFixed(2)}</h1>
        <dl><div><dt>付款时间</dt><dd>{text(body, "date")}</dd></div></dl>
      </section>
    </DetailShell>;
  }
  if (tab !== "首页") {
    const tabRows: Record<string, string[]> = {
      理财: ["余额宝", "基金", "理财账单", "风险评估"],
      生活: ["生活缴费", "市民中心", "医保电子凭证", "我的快递"],
      消息: ["账单助手", "服务提醒", "物流通知"],
      我的: ["账单", "余额", "银行卡", "芝麻信用", "设置"]
    };
    return <div className="app-window platform-app alipay-app" data-testid={`alipay-${tab}`}>
      <header className="alipay-header"><button onClick={() => setUiFlag("alipay.city.sheet", true)}>杭州⌄</button><div>{tab}</div><button onClick={() => setUiFlag("alipay.quick.sheet", true)}>＋</button></header>
      <div className="platform-scroll platform-tab-page">{(tabRows[tab] ?? []).map((row, index) => <button key={row} onClick={() => {
        setUiFlag(`alipay.${tab}.${index}`, true);
        emit("content.item.interacted", "app.alipay", { surface: tab, label: row, source: "P" });
      }}><b>{row}</b><span>›</span></button>)}</div>
      <PlatformBottomNav items={["首页", "理财", "生活", "消息", "我的"]} active={tab} onChange={setTab}/>
      <button className="platform-close-hit" data-testid="app-back" aria-label="退出支付宝" onClick={goBack}/>
    </div>;
  }
  return <div className="app-window platform-app alipay-app" data-testid="alipay-home">
    <header className="alipay-header"><button onClick={() => setUiFlag("alipay.city.sheet", true)}>杭州⌄</button><div>搜索</div><button onClick={() => setUiFlag("alipay.quick.sheet", true)}>＋</button></header>
    <div className="platform-scroll alipay-home" ref={scroll.ref}>
      <section className="alipay-primary">{["扫一扫", "付钱/收钱", "出行", "卡包"].map((label) => <button key={label} onClick={() => {
        setUiFlag("alipay.primary.open", label);
        emit("content.item.interacted", "app.alipay", { surface: "primary", label, source: "P" });
      }}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <section className="alipay-services">{["饿了么", "市民中心", "生活缴费", "医保码", "转账", "余额宝", "我的快递", "更多"].map((label) => <button key={label} onClick={() => {
        setUiFlag("alipay.service.open", label);
        setTab(label === "余额宝" ? "理财" : "生活");
      }}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <section className="alipay-bills"><header><b>最近账单</b><span>全部</span></header>{ordinaryRecords.map((record, index) => <button data-testid={index === 0 ? "app-effective-action" : undefined} key={record.id} onClick={() => {
        setSelectedId(record.id);
        emit("content.item.opened", record.id, { surface: "alipay", source: "P" });
        scroll.remember();
      }}><span className="alipay-merchant-mark">支</span><div><b>{record.title}</b><small>{record.subtitle} · {record.date}</small></div><strong>−{(record.amount ?? 0).toFixed(2)}</strong></button>)}</section>
      <section className="alipay-bills"><header><b>最近账单</b><span>全部</span></header>{items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "alipay" });
          scroll.remember();
        }}><span className="alipay-merchant-mark">支</span><div><b>{text(body, "merchant")}</b><small>{text(body, "date")}</small></div><strong>−{number(body, "amount").toFixed(2)}</strong></button>;
      })}</section>
    </div>
    <PlatformBottomNav items={["首页", "理财", "生活", "消息", "我的"]} active={tab} onChange={setTab}/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出支付宝" onClick={goBack}/>
  </div>;
}

export function DidiApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.didi");
  const ordinaryRecords = ordinaryPlatformRecords.filter((record) => record.appId === "app.didi");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("首页");
  const [mode, setMode] = useState("打车");
  const selected = items.find((item) => item.id === selectedId);
  const selectedOrdinary = ordinaryRecords.find((record) => record.id === selectedId);
  if (selected || selectedOrdinary) {
    const [from = "", to = ""] = selectedOrdinary?.title.split(" → ") ?? [];
    const body = selected ? activeBody(state, selected) as Body : { from, to, status: selectedOrdinary!.subtitle, date: selectedOrdinary!.date };
    const detailId = selected?.id ?? selectedOrdinary!.id;
    return <DetailShell className="didi-app" title="行程详情" onBack={() => setSelectedId(null)}>
      <section className="didi-trip-detail">
        <span>{text(body, "status")}</span><h1>{text(body, "date")}</h1>
        <div className="didi-route-line"><i/><p><b>{text(body, "from")}</b><b>{text(body, "to")}</b></p></div>
        <button onClick={() => emit("content.item.interacted", detailId, { action: "route" })}>查看行程路线</button>
      </section>
    </DetailShell>;
  }
  if (tab !== "首页") {
    const tabRows: Record<string, string[]> = {
      订单: ["全部订单", "待支付", "已完成", "发票与报销"],
      优惠: ["出行券 3 张", "周末打车优惠", "顺风车礼包"],
      我的: ["常用地址", "安全中心", "钱包", "客服", "设置"]
    };
    return <div className="app-window platform-app didi-app" data-testid={`didi-${tab}`}>
      <header className="didi-header"><button onClick={() => setUiFlag("didi.city.sheet", true)}>杭州⌄</button><button onClick={() => setTab("消息")}>消息</button></header>
      <div className="platform-scroll platform-tab-page"><h1>{tab}</h1>{(tabRows[tab] ?? ["行程提醒", "安全通知", "优惠消息"]).map((row, index) => <button key={row} onClick={() => {
        setUiFlag(`didi.${tab}.${index}`, true);
        emit("content.item.interacted", "app.didi", { surface: tab, label: row, source: "P" });
      }}><b>{row}</b><span>›</span></button>)}</div>
      <PlatformBottomNav items={["首页", "订单", "优惠", "我的"]} active={tab} onChange={setTab}/>
      <button className="platform-close-hit" data-testid="app-back" aria-label="退出滴滴出行" onClick={goBack}/>
    </div>;
  }
  return <div className="app-window platform-app didi-app" data-testid="didi-home">
    <header className="didi-header"><button onClick={() => setUiFlag("didi.city.sheet", true)}>杭州⌄</button><button aria-label="消息" onClick={() => setTab("消息")}>消息</button></header>
    <div className="didi-map" aria-label="地图"><span className="didi-current-dot"/><i/><i/><i/></div>
    <section className="didi-sheet">
      <div className="didi-destination"><span/><div><small>你要去哪儿？</small><b>输入目的地</b></div></div>
      <nav>{["打车", "顺风车", "代驾", "特价拼车"].map((label) => <button className={mode === label ? "active" : ""} key={label} onClick={() => {
        setMode(label);
        setUiFlag("didi.mode", label);
        emit("app.view.changed", "app.didi", { view: label, source: "P" });
      }}><i>{label.slice(0, 1)}</i>{label}</button>)}</nav>
      <h2>最近行程</h2>
      {ordinaryRecords.map((record, index) => <button data-testid={index === 0 ? "app-effective-action" : undefined} className="didi-trip-row" key={record.id} onClick={() => {
        setSelectedId(record.id);
        emit("content.item.opened", record.id, { surface: "didi", source: "P" });
      }}><div><b>{record.title}</b><small>{record.date} · {record.subtitle}</small></div><span>›</span></button>)}
      {items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button className="didi-trip-row" key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "didi" });
        }}><div><b>{text(body, "from")} → {text(body, "to")}</b><small>{text(body, "date")} · {text(body, "status")}</small></div><span>›</span></button>;
      })}
    </section>
    <PlatformBottomNav items={["首页", "订单", "优惠", "我的"]} active={tab} onChange={setTab}/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出滴滴出行" onClick={goBack}/>
  </div>;
}

export function MeituanApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.meituan");
  const ordinaryRecords = ordinaryPlatformRecords.filter((record) => record.appId === "app.meituan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("首页");
  const scroll = usePlatformScroll("meituan.home");
  useLayoutEffect(()=>{
    if(!selectedId) scroll.restore();
  },[selectedId]);
  const selected = items.find((item) => item.id === selectedId);
  const selectedOrdinary = ordinaryRecords.find((record) => record.id === selectedId);
  if (selected || selectedOrdinary) {
    const body = selected ? activeBody(state, selected) as Body : {
      merchant: selectedOrdinary!.title,
      items: selectedOrdinary!.subtitle.split("、"),
      tableware: 1,
      amount: selectedOrdinary!.amount,
      date: selectedOrdinary!.date
    };
    const detailId = selected?.id ?? selectedOrdinary!.id;
    return <DetailShell className="meituan-app" title="订单详情" onBack={() => setSelectedId(null)}>
      <article className="meituan-order-detail">
        <header><h1>{text(body, "merchant")}</h1></header>
        <section>{stringList(body, "items").map((item) => <p key={item}><span>{item}</span></p>)}<p><span>餐具数量</span><b>{number(body, "tableware")} 份</b></p></section>
        <div><span>实付</span><strong>¥{number(body, "amount").toFixed(2)}</strong></div>
        <small>下单时间 {text(body, "date")}</small>
        <button onClick={() => emit("content.item.interacted", detailId, { action: "review" })}>评价订单</button>
      </article>
    </DetailShell>;
  }
  if (tab !== "首页") {
    const tabRows: Record<string, string[]> = {
      视频: ["本周城市吃喝榜", "十分钟家常菜", "雨天室内活动"],
      消息: ["订单通知", "商家回复", "优惠提醒"],
      购物车: ["牛肉饭套餐 × 1", "冰美式 × 1", "已失效商品"],
      我的: ["我的订单", "收藏", "红包卡券", "客服中心", "设置"]
    };
    return <div className="app-window platform-app meituan-app" data-testid={`meituan-${tab}`}>
      <header className="meituan-header"><button onClick={() => setUiFlag("meituan.city.sheet", true)}>杭州⌄</button><div>{tab}</div><button onClick={() => setUiFlag("meituan.quick.sheet", true)}>＋</button></header>
      <div className="platform-scroll platform-tab-page">{(tabRows[tab] ?? []).map((row, index) => <button key={row} onClick={() => {
        setUiFlag(`meituan.${tab}.${index}`, true);
        emit("content.item.interacted", "app.meituan", { surface: tab, label: row, source: "P" });
      }}><b>{row}</b><span>›</span></button>)}</div>
      <PlatformBottomNav items={["首页", "视频", "消息", "购物车", "我的"]} active={tab} onChange={setTab}/>
      <button className="platform-close-hit" data-testid="app-back" aria-label="退出美团" onClick={goBack}/>
    </div>;
  }
  return <div className="app-window platform-app meituan-app" data-testid="meituan-home">
    <header className="meituan-header"><button onClick={() => setUiFlag("meituan.city.sheet", true)}>杭州⌄</button><div>搜索商家、商品</div><button onClick={() => setUiFlag("meituan.quick.sheet", true)}>＋</button></header>
    <div className="platform-scroll meituan-home" ref={scroll.ref}>
      <section className="meituan-categories">{["美食", "外卖", "酒店", "休闲玩乐", "电影", "打车", "买药", "全部"].map((label) => <button key={label} onClick={() => {
        setUiFlag("meituan.category", label);
        emit("app.view.changed", "app.meituan", { view: label, source: "P" });
      }}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <section className="meituan-banner"><b>吃喝玩乐 都在美团</b><span>问美团，都安排</span></section>
      <section className="meituan-orders"><header><b>我的订单</b><span>全部订单</span></header>{ordinaryRecords.map((record, index) => <button data-testid={index === 0 ? "app-effective-action" : undefined} key={record.id} onClick={() => {
        setSelectedId(record.id);
        emit("content.item.opened", record.id, { surface: "meituan", source: "P" });
        scroll.remember();
      }}><span className="meituan-shop-mark">店</span><div><b>{record.title}</b><small>{record.subtitle}</small><time>{record.date}</time></div><strong>¥{(record.amount ?? 0).toFixed(2)}</strong></button>)}</section>
      <section className="meituan-orders"><header><b>我的订单</b><span>全部订单</span></header>{items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "meituan" });
          scroll.remember();
        }}><span className="meituan-shop-mark">店</span><div><b>{text(body, "merchant")}</b><small>{stringList(body, "items").join("、")}</small><time>{text(body, "date")}</time></div><strong>¥{number(body, "amount").toFixed(2)}</strong></button>;
      })}</section>
      <section className="meituan-everyday"><header><b>常点商家</b><span>来自历史订单</span></header>{["牛肉饭","馄饨","咖啡"].map((label,index)=><button key={label} onClick={()=>emit("content.item.opened","app.meituan",{surface:"everyday",label,index})}><span>{label.slice(0,1)}</span><div><b>{label}</b><small>普通生活订单 · 查看历史记录</small></div><i>›</i></button>)}</section>
    </div>
    <PlatformBottomNav items={["首页", "视频", "消息", "购物车", "我的"]} active={tab} onChange={setTab}/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出美团" onClick={goBack}/>
  </div>;
}

export function TaobaoApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.taobao");
  const ordinaryRecords = ordinaryPlatformRecords.filter((record) => record.appId === "app.taobao");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("首页");
  const [channel, setChannel] = useState("推荐");
  const scroll = usePlatformScroll("taobao.home");
  useLayoutEffect(()=>{
    if(!selectedId) scroll.restore();
  },[selectedId]);
  const selected = items.find((item) => item.id === selectedId);
  const selectedOrdinary = ordinaryRecords.find((record) => record.id === selectedId);
  if (selected || selectedOrdinary) {
    const body = selected ? activeBody(state, selected) as Body : {
      title: selectedOrdinary!.title,
      amount: selectedOrdinary!.amount,
      status: selectedOrdinary!.subtitle,
      date: selectedOrdinary!.date
    };
    const detailId = selected?.id ?? selectedOrdinary!.id;
    return <DetailShell className="taobao-app" title="订单详情" onBack={() => setSelectedId(null)} footer={
      <div className="taobao-detail-actions"><button onClick={() => emit("message.thread.opened", detailId, { surface: "taobao", source: "P" })}>联系卖家</button><button onClick={() => emit("content.item.interacted", detailId, { action: "logistics", source: "P" })}>查看物流</button><PlatformStateButton flag={`taobao.saved.${detailId}`} label="收藏" activeLabel="已收藏" contentId={detailId}/></div>
    }>
      <article className="taobao-order-detail">
        <div className="taobao-product-image"><span>商品图片</span></div>
        <h1>{text(body, "title")}</h1>
        <strong>{text(body, "amount") ? `¥${number(body, "amount").toFixed(2)}` : text(body, "status")}</strong>
        <dl><div><dt>订单状态</dt><dd>{text(body, "status")}</dd></div><div><dt>下单时间</dt><dd>{text(body, "date")}</dd></div>{text(body, "note") && <div><dt>订单说明</dt><dd>{text(body, "note")}</dd></div>}</dl>
      </article>
    </DetailShell>;
  }
  if (tab !== "首页") {
    const tabRows: Record<string, string[]> = {
      视频: ["相机收纳实测", "旧书修补方法", "雨天通勤装备"],
      消息: ["物流助手", "店铺客服", "活动通知"],
      购物车: ["移动电源 × 1", "镜头清洁纸 × 2", "帆布袋 × 1"],
      我的淘宝: ["待付款", "待发货", "待收货", "待评价", "收藏夹", "浏览记录"]
    };
    return <div className="app-window platform-app taobao-app" data-testid={`taobao-${tab}`}>
      <header className="taobao-header"><div>{tab}</div><button onClick={() => setTab("首页")}>返回首页</button></header>
      <div className="platform-scroll platform-tab-page">{(tabRows[tab] ?? []).map((row, index) => <button key={row} onClick={() => {
        setUiFlag(`taobao.${tab}.${index}`, true);
        emit("content.item.interacted", "app.taobao", { surface: tab, label: row, source: "P" });
      }}><b>{row}</b><span>›</span></button>)}</div>
      <PlatformBottomNav items={["首页", "视频", "消息", "购物车", "我的淘宝"]} active={tab} onChange={setTab}/>
      <button className="platform-close-hit" data-testid="app-back" aria-label="退出淘宝" onClick={goBack}/>
    </div>;
  }
  return <div className="app-window platform-app taobao-app" data-testid="taobao-home">
    <header className="taobao-header"><div>搜索淘宝商品</div><button onClick={() => {
      setUiFlag("taobao.search.open", true);
      emit("app.search.submitted", "app.taobao", { query: "", source: "P" });
    }}>搜索</button></header>
    <nav className="taobao-tabs">{["推荐","闪购","小时达","百亿补贴"].map((label) => <button className={channel === label ? "active" : ""} key={label} onClick={() => {
      setChannel(label);
      setUiFlag("taobao.channel", label);
      emit("app.view.changed", "app.taobao", { view: label, source: "P" });
    }}>{label}</button>)}</nav>
    <div className="platform-scroll taobao-home" ref={scroll.ref}>
      <section className="taobao-categories">{["天猫", "聚划算", "淘金币", "闲鱼", "充值", "旅行", "领券", "分类"].map((label) => <button key={label} onClick={() => {
        setUiFlag("taobao.category", label);
        emit("app.view.changed", "app.taobao", { view: label, source: "P" });
      }}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <h2>猜你喜欢</h2>
      <div className="taobao-order-grid">{ordinaryRecords.map((record, index) => <button
        data-testid={index === 0 ? "app-effective-action" : undefined}
        aria-label={record.title}
        key={record.id}
        onClick={() => {
          setSelectedId(record.id);
          emit("content.item.opened", record.id, { surface: "taobao", source: "P" });
          scroll.remember();
        }}
      >
        <span className="taobao-thumb tone-1">日常用品</span>
        <b>{record.title}</b>
        <small>{record.subtitle} · {record.date}</small>
        <strong>¥{(record.amount ?? 0).toFixed(2)}</strong>
      </button>)}</div>
      <h2>我的订单</h2>
      <div className="taobao-order-grid">{items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button
          aria-label={text(body, "title")}
          key={item.id}
          onClick={() => {
            setSelectedId(item.id);
            emit("content.item.opened", item.id, { surface: "taobao" });
            scroll.remember();
          }}
        >
          <span className={`taobao-thumb tone-${index % 2}`}>商品图片</span>
          <b>{text(body, "title")}</b>
          <small>{text(body, "status")} · {text(body, "date")}</small>
          {typeof body.amount === "number" && <strong>¥{number(body, "amount").toFixed(2)}</strong>}
        </button>;
      })}</div>
      <section className="taobao-everyday"><header><b>收藏与历史</b><span>共 17 笔订单</span></header>{["相机配件","旧地图册","搪瓷杯修补漆","移动电源","录音笔"].map((label,index)=><button key={label} onClick={()=>emit("content.item.opened","app.taobao",{surface:"favorites",label,index})}><span>{label.slice(0,1)}</span><div><b>{label}</b><small>{index<3?"收藏夹":"历史订单"}</small></div></button>)}</section>
      </div>
    <PlatformBottomNav items={["首页", "视频", "消息", "购物车", "我的淘宝"]} active={tab} onChange={setTab}/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出淘宝" onClick={goBack}/>
  </div>;
}
