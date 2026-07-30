import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/app/GameContext";
import { realisticInternetAvatar } from "@/content/avatar-assets";
import { activeBody, getContentItem, unlockedItemsForApp } from "@/content/selectors";
import { completePlatformParagraphs } from "@/content/platform-prose";
import { articleMediaFor } from "@/content/article-media";
import { assetUrl } from "@/lib/asset-url";
import type { NarrativeFunction } from "@/contracts/content";

type ZhihuView = "home" | "ideas" | "profile" | "search" | "detail" | "comments" | "not-found" | "archive";
type ZhihuItem = {
  id: string;
  contentId?: string;
  title: string;
  excerpt: string;
  body: string[];
  author: string;
  authorMark: string;
  authorColor: string;
  credential: string;
  upvotes: number;
  comments: number;
  topics: string[];
  narrativeFunction: NarrativeFunction;
  avatarSlot?: number;
  publishedAt?: string;
  commentItems?: ZhihuComment[];
  notFound?: boolean;
};

type AnswerBody = { question?: string; answer?: string; upvotes?: number };
type DeletedBody = { title?: string; status?: number; archivedAt?: string };
type ZhihuComment = {
  author: string;
  avatarSlot: number;
  text: string;
  likes: number;
  time: string;
};
type LongFormAnswerBody = {
  title?: string;
  excerpt?: string;
  paragraphs?: string[];
  author?: string;
  credential?: string;
  avatarSlot?: number;
  upvotes?: number;
  commentCount?: number;
  topics?: string[];
  publishedAt?: string;
  comments?: ZhihuComment[];
};

const comments = [
  { author: "橙色文件夹", mark: "橙", color: "#fa8231", text: "先保留原文件这点太重要了，转发之后时间经常会变。", likes: 38, time: "昨天 21:16" },
  { author: "南岸没有风", mark: "南", color: "#2d98da", text: "除了 hash，还可以看同一组照片的编号是否连续。", likes: 21, time: "昨天 22:03" },
  { author: "一只普通用户", mark: "普", color: "#778ca3", text: "收藏了，准备周末把移动硬盘重新整理一下。", likes: 9, time: "今天 08:42" },
  { author: "川流档案", mark: "川", color: "#1772f6", text: "对，相邻文件和取得路径都比单独一个字段更有意义。", likes: 46, time: "今天 09:11" }
];

function ZhihuIcon({name}:{name:"menu"|"search"|"plus"|"back"|"share"|"home"|"message"|"person"}) {
  const paths:Record<typeof name,string>={
    menu:"M4 7h16M4 12h16M4 17h16",
    search:"M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13m5 11l5 5",
    plus:"M12 5v14M5 12h14",
    back:"M15 4l-8 8l8 8",
    share:"M12 15V3m0 0L7 8m5-5l5 5M5 12v8h14v-8",
    home:"M3 11l9-8l9 8v9h-6v-6H9v6H3z",
    message:"M4 5h16v12H9l-5 4z",
    person:"M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8m-7 9c1-4 4-6 7-6s6 2 7 6"
  };
  return <svg className="zhihu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]}/></svg>;
}

function Avatar({mark,color,identity,slot}:{mark:string;color:string;identity?:string;slot?:number}) {
  const slots:Record<string,number>={
    研:96,页:97,河:98,光:99,本:100,西:101,网:102,纲:103,八:104,雨:105,
    橙:106,南:107,普:108,川:120
  };
  return <img className="zhihu-avatar" src={realisticInternetAvatar(identity ?? mark,slot??slots[mark]??109)} alt="" style={{background:color}} aria-hidden="true"/>;
}

export function ZhihuApp() {
  const {state,activeDeviceId,goBack,emit,setUiFlag,setScrollPosition}=useGame();
  const formalAnswer=getContentItem("zhihu.answer.01");
  const deletedPage=getContentItem("page.zhihu.deleted.01");
  const longFormContent=unlockedItemsForApp(state,"app.zhihu").filter(item=>item.id.startsWith("zhihu.life."));
  const answerBody=formalAnswer?activeBody(state,formalAnswer) as AnswerBody:{};
  const deletedBody=deletedPage?activeBody(state,deletedPage) as DeletedBody:{};
  const formalItem:ZhihuItem={
    id:"zhihu.answer.01",
    contentId:"zhihu.answer.01",
    title:answerBody.question??"网页存档与当前页面为什么会不同？",
    excerpt:answerBody.answer??"",
    body:completePlatformParagraphs("zhihu.answer.01",[answerBody.answer??""]),
    author:"川流档案",
    authorMark:"川",
    authorColor:"#1772f6",
    credential:"用户研究 / 城市摄影",
    upvotes:answerBody.upvotes??318,
    comments:32,
    topics:["网页存档","缓存"],
    narrativeFunction:"profession",
    avatarSlot:120,
    publishedAt:"编辑于 2026-07-12",
    commentItems:[]
  };
  const missingItem:ZhihuItem={
    id:"page.zhihu.deleted.01",
    contentId:"page.zhihu.deleted.01",
    title:deletedBody.title??"如果你记得那个人，应该如何验证自己没有记错？",
    excerpt:"该问题暂时无法查看。",
    body:[],
    author:"旧雨17",
    authorMark:"雨",
    authorColor:"#607d8b",
    credential:"用户",
    upvotes:17,
    comments:4,
    topics:["记忆","验证"],
    narrativeFunction:"world_context",
    avatarSlot:105,
    commentItems:[],
    notFound:true
  };
  const feed=useMemo(()=>{
    const ordinary=longFormContent.map((item):ZhihuItem=>{
      const body=activeBody(state,item) as LongFormAnswerBody;
      const author=body.author??"知乎用户";
      return {
        id:item.id,
        contentId:item.id,
        title:body.title??"未命名问题",
        excerpt:body.excerpt??"",
        body:body.paragraphs??[],
        author,
        authorMark:author.slice(0,1),
        authorColor:"#607d8b",
        credential:body.credential??"知乎用户",
        upvotes:body.upvotes??0,
        comments:body.commentCount??body.comments?.length??0,
        topics:body.topics??[],
        narrativeFunction:item.narrative.primaryFunction,
        avatarSlot:body.avatarSlot,
        publishedAt:body.publishedAt,
        commentItems:body.comments??[]
      };
    });
    return [...ordinary.slice(0,4),formalItem,...ordinary.slice(4),missingItem];
  },[answerBody.answer,answerBody.question,answerBody.upvotes,deletedBody.title,longFormContent,state]);
  const [view,setView]=useState<ZhihuView>("home");
  const [selectedId,setSelectedId]=useState(formalItem.id);
  const [query,setQuery]=useState("");
  const [searchQuery,setSearchQuery]=useState("");
  const [feedTab,setFeedTab]=useState("推荐");
  const [profileTab,setProfileTab]=useState("动态");
  const [searchTab,setSearchTab]=useState("综合");
  const [notice,setNotice]=useState("");
  const scrollRef=useRef<HTMLDivElement>(null);
  const selected=feed.find(item=>item.id===selectedId)??formalItem;
  const liked=state.world.flags[`ui.zhihu.liked.${selected.id}`]===true;
  const saved=state.world.flags[`ui.zhihu.saved.${selected.id}`]===true;
  const expanded=state.world.flags[`ui.zhihu.expanded.${selected.id}`]===true;
  const selectedComments=selected.commentItems?.length
    ? selected.commentItems
    : comments.map((comment,index)=>({...comment,avatarSlot:106+index}));
  const routeKey=`zhihu.${view}`;

  useLayoutEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollTop=state.devices[activeDeviceId].scrollByRoute[routeKey]??0;
  },[activeDeviceId,routeKey]);

  const rememberScroll=()=>{
    if(scrollRef.current) setScrollPosition(routeKey,scrollRef.current.scrollTop);
  };
  const openItem=(item:ZhihuItem)=>{
    const currentScroll=scrollRef.current?.scrollTop??0;
    setScrollPosition(routeKey,currentScroll);
    setSelectedId(item.id);
    emit(item.notFound?"browser.page.opened":"content.item.opened",item.contentId??item.id,{surface:"zhihu"});
    setView(item.notFound?"not-found":"detail");
  };
  const backWithinApp=()=>{
    rememberScroll();
    if(view==="home") goBack();
    else if(view==="comments") setView("detail");
    else if(view==="archive") setView("not-found");
    else setView("home");
  };
  const searchResults=feed.filter(item=>{
    const needle=searchQuery.trim().toLowerCase();
    return !needle||`${item.title}${item.excerpt}${item.topics.join("")}`.toLowerCase().includes(needle);
  }).sort((left,right)=>right.body.length-left.body.length);
  const act=(action:string,target="app.zhihu")=>{
    setNotice(action);
    emit("content.item.interacted",target,{action,source:"P"});
  };

  if(view==="ideas") {
    return <div className="app-window zhihu-app" data-testid="zhihu-ideas">
      <header className="zhihu-page-header"><button data-testid="app-back" aria-label="返回首页" onClick={backWithinApp}><ZhihuIcon name="back"/></button><strong>想法</strong><button aria-label="发布" onClick={()=>act("打开想法发布器")}><ZhihuIcon name="plus"/></button></header>
      {notice&&<div className="zhihu-action-feedback">{notice}</div>}
      <div className="zhihu-scroll zhihu-ideas-feed" ref={scrollRef}>
        {feed.filter(item=>!item.notFound).slice(0,8).map((item,index)=><article key={item.id}>
          <header><Avatar mark={item.authorMark} color={item.authorColor} identity={item.author} slot={item.avatarSlot}/><div><b>{item.author}</b><small>{index+2} 小时前</small></div><button onClick={()=>act(`已关注 ${item.author}`,item.id)}>关注</button></header>
          <p>{item.excerpt}</p>
          <footer><button onClick={()=>act(`已赞同 ${item.title}`,item.id)}>赞同 {item.upvotes}</button><button onClick={()=>openItem(item)}>评论 {item.comments}</button><button onClick={()=>act(`已收藏 ${item.title}`,item.id)}>收藏</button></footer>
        </article>)}
      </div>
      <nav className="zhihu-bottom-nav"><button onClick={()=>setView("home")}><ZhihuIcon name="home"/><span>首页</span></button><button className="active" onClick={()=>setView("ideas")}><span className="zhihu-kanshan">想</span><span>想法</span></button><button className="create" onClick={()=>act("打开创作中心")}><ZhihuIcon name="plus"/><span>创作</span></button><button onClick={()=>act("消息中心 · 3 条未读")}><ZhihuIcon name="message"/><span>消息</span></button><button onClick={()=>setView("profile")}><ZhihuIcon name="person"/><span>我的</span></button></nav>
    </div>;
  }

  if(view==="profile") {
    return <div className="app-window zhihu-app" data-testid="zhihu-profile">
      <header className="zhihu-page-header"><button data-testid="app-back" aria-label="返回首页" onClick={backWithinApp}><ZhihuIcon name="back"/></button><strong>我的</strong><button aria-label="设置" onClick={()=>act("打开设置")}>•••</button></header>
      {notice&&<div className="zhihu-action-feedback">{notice}</div>}
      <div className="zhihu-scroll zhihu-profile-page" ref={scrollRef}>
        <section className="zhihu-profile-card"><Avatar mark="川" color="#1772f6" identity="川流档案"/><div><h1>川流档案</h1><p>用户研究 / 城市摄影</p></div><button onClick={()=>act("进入资料编辑")}>编辑资料</button></section>
        <section className="zhihu-profile-stats"><span><b>28</b>创作</span><span><b>1,642</b>赞同</span><span><b>316</b>收藏</span><span><b>87</b>关注</span></section>
        <nav className="zhihu-profile-tabs">{["动态","回答","想法","收藏"].map(label=><button className={profileTab===label?"active":""} key={label} onClick={()=>{setProfileTab(label);act(`个人页：${label}`)}}>{label}</button>)}</nav>
        {feed.filter(item=>item.author==="川流档案").map(item=><QuestionCard item={item} key={item.id} onOpen={()=>openItem(item)}/>)}
      </div>
      <nav className="zhihu-bottom-nav"><button onClick={()=>setView("home")}><ZhihuIcon name="home"/><span>首页</span></button><button onClick={()=>setView("ideas")}><span className="zhihu-kanshan">想</span><span>想法</span></button><button className="create" onClick={()=>act("打开创作中心")}><ZhihuIcon name="plus"/><span>创作</span></button><button onClick={()=>act("消息中心 · 3 条未读")}><ZhihuIcon name="message"/><span>消息</span></button><button className="active" onClick={()=>setView("profile")}><ZhihuIcon name="person"/><span>我的</span></button></nav>
    </div>;
  }

  if(view==="not-found"||view==="archive") {
    return <div className="app-window zhihu-app" data-testid="zhihu-404">
      <header className="zhihu-page-header">
        <button data-testid="app-back" aria-label="返回" onClick={backWithinApp}><ZhihuIcon name="back"/></button>
        <strong>知乎</strong>
        <button aria-label="分享" onClick={()=>act("已打开分享面板","page.zhihu.deleted.01")}><ZhihuIcon name="share"/></button>
      </header>
      {notice&&<div className="zhihu-action-feedback">{notice}</div>}
      <div className="zhihu-scroll zhihu-404-scroll" ref={scrollRef}>
        {view==="not-found"?<>
          <section className="zhihu-error-card">
            <span className="zhihu-error-mark">?</span>
            <h1>页面无法访问</h1>
            <p>问题可能已被删除，或暂时无法查看。</p>
            <button onClick={()=>setView("home")}>返回知乎首页</button>
          </section>
          <button className="zhihu-archive-footnote" data-testid="zhihu-cache-entry-before" onClick={()=>setView("archive")}>
            页面存档信息 · 最后缓存 {deletedBody.archivedAt??"2021-04-18"}
          </button>
        </>:<section className="zhihu-archive-panel" data-testid="zhihu-cache-entry-after">
          <span>本机浏览记录</span>
          <h1>页面快照</h1>
          <dl>
            <div><dt>页面状态</dt><dd>已失效</dd></div>
            <div><dt>最后缓存</dt><dd>{deletedBody.archivedAt??"2021-04-18"} 02:17</dd></div>
            <div><dt>保存位置</dt><dd>Safari 离线网页</dd></div>
          </dl>
          <button data-testid="zhihu-open-cache" onClick={()=>emit("content.item.interacted","page.zhihu.deleted.01",{action:"inspect-local-cache"})}>查看离线缓存记录</button>
        </section>}
      </div>
    </div>;
  }

  if(view==="search") {
    return <div className="app-window zhihu-app" data-testid="zhihu-search">
      <header className="zhihu-search-header">
        <button data-testid="app-back" aria-label="返回" onClick={backWithinApp}><ZhihuIcon name="back"/></button>
        <form onSubmit={event=>{event.preventDefault();setSearchQuery(query);setUiFlag("zhihu.lastSearch",query);emit("app.search.submitted","app.zhihu",{query})}}>
          <ZhihuIcon name="search"/>
          <input data-testid="zhihu-search-input" value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索知乎内容"/>
        </form>
        <button data-testid="zhihu-search-submit" onClick={()=>{setSearchQuery(query);setUiFlag("zhihu.lastSearch",query);emit("app.search.submitted","app.zhihu",{query})}}>搜索</button>
      </header>
      <nav className="zhihu-search-tabs">{["综合","用户","话题"].map(label=><button className={searchTab===label?"active":""} key={label} onClick={()=>{setSearchTab(label);act(`搜索筛选：${label}`)}}>{label}</button>)}</nav>
      {notice&&<div className="zhihu-action-feedback">{notice}</div>}
      <div className="zhihu-scroll" ref={scrollRef}>
        <div className="zhihu-result-summary">{searchQuery?`“${searchQuery}”的相关内容`:"搜索历史与推荐"}</div>
        {searchResults.map(item=><QuestionCard item={item} key={item.id} onOpen={()=>openItem(item)}/>)}
        {searchResults.length===0&&<div className="zhihu-no-results">没有找到相关内容，换个关键词试试。</div>}
      </div>
    </div>;
  }

  if(view==="comments") {
    return <div className="app-window zhihu-app" data-testid="zhihu-comments">
      <header className="zhihu-page-header">
        <button data-testid="app-back" aria-label="返回回答" onClick={backWithinApp}><ZhihuIcon name="back"/></button>
        <strong>{selected.comments} 条评论</strong>
        <button aria-label="更多" onClick={()=>act("评论区更多选项",selected.id)}>•••</button>
      </header>
      {notice&&<div className="zhihu-action-feedback">{notice}</div>}
      <div className="zhihu-scroll zhihu-comments-list" ref={scrollRef}>
        <div className="zhihu-comment-sort"><b>评论</b><button onClick={()=>act("评论排序：按时间",selected.id)}>默认排序⌄</button></div>
        {selectedComments.map(comment=><article className="zhihu-comment" key={`${selected.id}-${comment.author}`}>
          <Avatar mark={comment.author.slice(0,1)} color="#778ca3" identity={comment.author} slot={comment.avatarSlot}/>
          <div><b>{comment.author}</b><p>{comment.text}</p><footer><time>{comment.time}</time><span>♡ {comment.likes}</span><button onClick={()=>act(`回复 ${comment.author}`,selected.id)}>回复</button></footer></div>
        </article>)}
      </div>
      <div className="zhihu-comment-composer"><button onClick={()=>act("评论编辑器已打开",selected.id)}>写评论…</button><span>♡</span><span>☆</span></div>
    </div>;
  }

  if(view==="detail") {
    const answerMedia=articleMediaFor(selected.title,selected.body);
    const visibleParagraphs=expanded?selected.body:selected.body.slice(0,3);
    const mediaAfter=Math.max(0,Math.floor(visibleParagraphs.length/2)-1);
    return <div className="app-window zhihu-app" data-testid="zhihu-detail">
      <header className="zhihu-page-header">
        <button data-testid="app-back" aria-label="返回" onClick={backWithinApp}><ZhihuIcon name="back"/></button>
        <strong>问题</strong>
        <button aria-label="分享" onClick={()=>act("已打开分享面板",selected.id)}><ZhihuIcon name="share"/></button>
      </header>
      {notice&&<div className="zhihu-action-feedback">{notice}</div>}
      <div className="zhihu-scroll zhihu-detail-scroll" ref={scrollRef}>
        <article className="zhihu-question">
          <div className="zhihu-topic-row">{selected.topics.map(topic=><span key={topic}>{topic}</span>)}</div>
          <h1>{selected.title}</h1>
          <p>{selected.excerpt}</p>
          <div className="zhihu-question-meta"><span>{selected.comments+12} 人关注</span><span>{selected.comments} 个回答</span></div>
          <div className="zhihu-question-buttons"><button className="follow" onClick={()=>act("已关注问题",selected.id)}>关注问题</button><button onClick={()=>act("回答编辑器已打开",selected.id)}>写回答</button><button onClick={()=>act("邀请回答面板已打开",selected.id)}>邀请回答</button></div>
        </article>
        <article className="zhihu-answer">
          <header><Avatar mark={selected.authorMark} color={selected.authorColor} identity={selected.author} slot={selected.avatarSlot}/><div><b>{selected.author}</b><span>{selected.credential}</span></div><button onClick={()=>act(`已关注 ${selected.author}`,selected.id)}>关注</button></header>
          <div className="zhihu-answer-voters">{selected.upvotes.toLocaleString("zh-CN")} 人赞同了该回答</div>
          {visibleParagraphs.map((paragraph,index)=><Fragment key={index}><p>{paragraph}</p>{index===mediaAfter&&<figure className="platform-inline-figure"><img src={assetUrl(answerMedia.src)} alt={answerMedia.alt}/><figcaption>{answerMedia.caption}</figcaption></figure>}</Fragment>)}
          {selected.body.length>3&&<button
            className="zhihu-expand"
            data-testid="zhihu-expand"
            onClick={()=>{
              setUiFlag(`zhihu.expanded.${selected.id}`,!expanded);
              emit("content.item.interacted",selected.contentId??selected.id,{action:expanded?"collapse-answer":"expand-answer",active:!expanded,source:"P"});
            }}
          >{expanded?"收起回答⌃":"展开阅读全文⌄"}</button>}
          <footer className="zhihu-answer-meta">{selected.publishedAt??"编辑于 2026-07-12"} · 著作权归作者所有</footer>
        </article>
        <section className="zhihu-related">
          <h2>相关推荐</h2>
          {feed.filter(item=>item.id!==selected.id&&!item.notFound).slice(0,4).map(item=><button key={item.id} onClick={()=>openItem(item)}><b>{item.title}</b><span>{item.upvotes} 赞同 · {item.comments} 评论</span></button>)}
        </section>
      </div>
      <div className="zhihu-answer-actions">
        <button className={liked?"active":""} data-testid="zhihu-like" onClick={()=>{emit("content.item.interacted",selected.contentId??selected.id,{action:"upvote",active:!liked});setUiFlag(`zhihu.liked.${selected.id}`,!liked)}}>▲ {liked?"已赞同":`赞同 ${selected.upvotes}`}</button>
        <button onClick={()=>setView("comments")}>评论 {selected.comments}</button>
        <button className={saved?"active":""} data-testid="zhihu-save" onClick={()=>{emit("content.item.interacted",selected.contentId??selected.id,{action:"save",active:!saved});setUiFlag(`zhihu.saved.${selected.id}`,!saved)}}>{saved?"已收藏":"收藏"}</button>
        <button onClick={()=>act("已喜欢",selected.id)}>喜欢</button>
      </div>
    </div>;
  }

  return <div className="app-window zhihu-app" data-testid="zhihu-home">
    <header className="zhihu-home-header">
      <button data-testid="app-back" aria-label="退出知乎" onClick={goBack}><ZhihuIcon name="menu"/></button>
      <strong>知乎</strong>
      <div><button data-testid="zhihu-open-search" aria-label="搜索" onClick={()=>setView("search")}><ZhihuIcon name="search"/></button><button aria-label="发布" onClick={()=>act("打开创作中心")}><ZhihuIcon name="plus"/></button></div>
    </header>
    {notice&&<div className="zhihu-action-feedback">{notice}</div>}
    <nav className="zhihu-feed-tabs">{["关注","推荐","热榜"].map(label=><button className={feedTab===label?"active":""} key={label} onClick={()=>{setFeedTab(label);act(`首页频道：${label}`)}}>{label}</button>)}</nav>
    <div className="zhihu-scroll zhihu-feed" ref={scrollRef}>
      <section className="zhihu-greeting"><b>早上好，朋友</b><span>为你推荐值得认真读完的回答</span></section>
      {feed.map((item,index)=><QuestionCard item={item} key={item.id} onOpen={()=>openItem(item)} effective={index===0}/>)}
    </div>
    <nav className="zhihu-bottom-nav" aria-label="知乎底部导航">
      <button className="active" onClick={()=>{setView("home");act("已回到首页")}}><ZhihuIcon name="home"/><span>首页</span></button>
      <button onClick={()=>setView("ideas")}><span className="zhihu-kanshan">想</span><span>想法</span></button>
      <button className="create" onClick={()=>act("打开创作中心")}><ZhihuIcon name="plus"/><span>创作</span></button>
      <button onClick={()=>act("消息中心 · 3 条未读")}><ZhihuIcon name="message"/><span>消息</span></button>
      <button onClick={()=>setView("profile")}><ZhihuIcon name="person"/><span>我的</span></button>
    </nav>
  </div>;
}

function QuestionCard({item,onOpen,effective=false}:{item:ZhihuItem;onOpen():void;effective?:boolean}) {
  return <article className="zhihu-question-card">
    <button data-testid={effective?"app-effective-action":undefined} onClick={onOpen}>
      <h2>{item.title}</h2>
      <div className="zhihu-card-author"><Avatar mark={item.authorMark} color={item.authorColor} identity={item.author} slot={item.avatarSlot}/><span><b>{item.author}</b><small>{item.credential}</small></span></div>
      <p>{item.excerpt}</p>
      <footer><span>▲ {item.upvotes.toLocaleString("zh-CN")} 赞同</span><span>{item.comments} 评论</span><span>收藏</span><span>•••</span></footer>
    </button>
  </article>;
}
