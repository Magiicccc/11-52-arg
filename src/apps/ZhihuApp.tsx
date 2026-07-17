import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem } from "@/content/selectors";

type ZhihuView = "home" | "search" | "detail" | "comments" | "not-found" | "archive";
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
  narrativeFunction: "profession" | "habit" | "world_context" | "platform_culture" | "supporting";
  notFound?: boolean;
};

type AnswerBody = { question?: string; answer?: string; upvotes?: number };
type DeletedBody = { title?: string; status?: number; archivedAt?: string };

const neutralItems: ZhihuItem[] = [
  {
    id: "zhihu.ui.interview",
    title: "第一次做用户访谈，怎样避免不自觉地诱导对方？",
    excerpt: "先问经历，再问判断。把“你是不是觉得”改成“当时发生了什么”，通常能得到更接近真实使用过程的回答。",
    body: ["访谈提纲最容易出现的问题，不是问题数量，而是提问的人已经在句子里放进了答案。", "更稳妥的做法是围绕一次具体经历追问：当时在哪里、先做了什么、为什么停下来、最后怎样处理。不要急着让受访者评价一个尚未发生的方案。"],
    author: "周末做研究",
    authorMark: "研",
    authorColor: "#546de5",
    credential: "用户研究从业者",
    upvotes: 1264,
    comments: 83,
    topics: ["用户研究", "访谈"],
    narrativeFunction: "profession"
  },
  {
    id: "zhihu.ui.photos",
    title: "为什么手机照片整理到最后总会越分越乱？",
    excerpt: "相簿更适合表达“我想怎样找”，文件夹更适合表达“它原来在哪里”。两套逻辑混在一起时，分类会越来越重。",
    body: ["整理照片不必追求每一张都只有一个归属。地点、人物和事件可以并列，真正需要长期保存的原图则另做备份。", "先保证时间和原文件不丢，再考虑精细标签，通常比一开始建立十几层目录更容易坚持。"],
    author: "折页之间",
    authorMark: "页",
    authorColor: "#f08a5d",
    credential: "摄影话题优秀答主",
    upvotes: 836,
    comments: 54,
    topics: ["照片管理", "数字生活"],
    narrativeFunction: "habit"
  },
  {
    id: "zhihu.ui.walk",
    title: "在一座熟悉的城市里散步，怎样重新获得一点新鲜感？",
    excerpt: "不要先选目的地，只给自己一个小限制：沿河、只走背阴面，或者每经过三条街才允许转弯。",
    body: ["所谓新鲜感往往不来自更远的地方，而来自改变平时默认的路径。", "不过旧厂区、施工围挡和封闭校园都不适合为了拍照擅自进入，公共道路已经足够观察城市的变化。"],
    author: "沿河慢慢走",
    authorMark: "河",
    authorColor: "#3b9c8c",
    credential: "城市生活话题答主",
    upvotes: 592,
    comments: 41,
    topics: ["城市生活", "散步"],
    narrativeFunction: "world_context"
  },
  {
    id: "zhihu.ui.reflection",
    title: "手机摄影中怎样处理玻璃反光？",
    excerpt: "贴近玻璃、改变拍摄角度、用深色衣物遮住身后光源，通常比后期强行去反光自然。",
    body: ["玻璃反光既可能是干扰，也可能提供环境信息。先确认拍摄者的位置和主光方向，再决定是否需要消除。", "如果照片用于记录，保留原图比只留一张处理后的版本更重要。"],
    author: "一格曝光",
    authorMark: "光",
    authorColor: "#b06ab3",
    credential: "摄影与器材话题答主",
    upvotes: 2187,
    comments: 129,
    topics: ["手机摄影", "反光"],
    narrativeFunction: "habit"
  },
  {
    id: "zhihu.ui.filename",
    title: "长期保存文件时，文件名应该包含哪些信息？",
    excerpt: "日期、对象、版本和状态足够覆盖大多数个人资料。文件名要帮助以后的人判断，而不是记录此刻所有想法。",
    body: ["推荐先固定顺序，例如“日期_项目_对象_版本”。同一目录里不要同时使用“最终版”“最终版2”和“真的最终版”。", "文件名只是索引，仍然需要保留创建时间、修改记录和校验值。"],
    author: "本地优先",
    authorMark: "本",
    authorColor: "#4b7bec",
    credential: "数字存档话题答主",
    upvotes: 1479,
    comments: 96,
    topics: ["文件管理", "数据备份"],
    narrativeFunction: "platform_culture"
  },
  {
    id: "zhihu.ui.renting",
    title: "一个人租房后，最值得先买的生活小物是什么？",
    excerpt: "不是装饰品，是一盏稳定的台灯、够长的插线板，以及真的会用到的收纳盒。",
    body: ["刚搬进去时很容易一次买齐想象中的生活，最后留下的却往往是每天都要用的几件东西。", "先住一周再补，比照着清单买得更准。"],
    author: "住在城西",
    authorMark: "西",
    authorColor: "#f7b731",
    credential: "杭州生活话题答主",
    upvotes: 734,
    comments: 112,
    topics: ["租房", "生活经验"],
    narrativeFunction: "world_context"
  },
  {
    id: "zhihu.ui.archive-images",
    title: "旧网页里的图片失效后，还有哪些常规找回方法？",
    excerpt: "先检查页面缓存、源文件名和站点迁移记录，再查公共网页存档。不同入口里的副本不一定是独立来源。",
    body: ["图片失效通常来自路径变更、权限、CDN 清理或站点迁移。浏览器缓存只证明这台设备曾经加载过内容。", "若要验证历史页面，最好同时记录地址、响应时间、文件校验值和取得副本的来源。"],
    author: "网页考古队",
    authorMark: "网",
    authorColor: "#3867d6",
    credential: "互联网档案收藏者",
    upvotes: 3208,
    comments: 184,
    topics: ["网页存档", "互联网"],
    narrativeFunction: "platform_culture"
  },
  {
    id: "zhihu.ui.exif",
    title: "如何验证照片 EXIF 是否可靠？",
    excerpt: "EXIF 可以被修改，需要与原文件 hash、路线和其他照片交叉验证。",
    body: ["只看拍摄时间和 GPS 不能独立确认一张照片的来历。先保留原文件，再核对文件创建时间、修改时间、设备信息与相邻照片。", "如果照片经过聊天软件或社区平台转发，元数据可能被清除或重写，应回到原始文件验证。"],
    author: "川流档案",
    authorMark: "川",
    authorColor: "#1772f6",
    credential: "用户研究 / 城市摄影",
    upvotes: 691,
    comments: 47,
    topics: ["EXIF", "数字取证"],
    narrativeFunction: "supporting"
  },
  {
    id: "zhihu.ui.work-files",
    title: "做用户研究的人通常会保留哪些工作资料？",
    excerpt: "招募记录、访谈提纲、原始笔记、逐字稿和分析版本都要分开，尤其不要把修订后的结论当成原始记录。",
    body: ["工作资料的价值在于能回到形成结论的过程。原始记录、脱敏材料和汇报版本应有清晰边界。", "对个人信息做最小化保存，比把所有东西都丢进同一个云盘更可靠。"],
    author: "提纲第四版",
    authorMark: "纲",
    authorColor: "#8854d0",
    credential: "互联网产品经理",
    upvotes: 447,
    comments: 29,
    topics: ["用户研究", "工作方法"],
    narrativeFunction: "profession"
  },
  {
    id: "zhihu.ui.commute",
    title: "城市通勤中，哪些小习惯真的能减少疲惫？",
    excerpt: "把路线留出十分钟余量、固定常用物品的位置，以及不要在最拥挤的换乘口临时做决定。",
    body: ["通勤体验很少因为一个技巧彻底改变，更多是靠减少每天重复的小摩擦。", "提前看天气、给充电线固定位置、记住两条备用路线，都是很普通但长期有效的办法。"],
    author: "八点四十二",
    authorMark: "八",
    authorColor: "#20bf6b",
    credential: "生活方式话题答主",
    upvotes: 982,
    comments: 76,
    topics: ["通勤", "城市生活"],
    narrativeFunction: "world_context"
  }
];

const comments = [
  { author: "橙色文件夹", mark: "橙", color: "#fa8231", text: "先保留原文件这点太重要了，转发之后时间经常会变。", likes: 38, time: "昨天 21:16" },
  { author: "南岸没有风", mark: "南", color: "#2d98da", text: "除了 hash，还可以看同一组照片的编号是否连续。", likes: 21, time: "昨天 22:03" },
  { author: "一只普通用户", mark: "普", color: "#778ca3", text: "收藏了，准备周末把移动硬盘重新整理一下。", likes: 9, time: "今天 08:42" },
  { author: "川流档案", mark: "川", color: "#1772f6", text: "对，相邻文件和取得路径都比单独一个字段更有意义。", likes: 46, time: "今天 09:11" }
];

function neutralItem(index:number): ZhihuItem {
  const item=neutralItems[index];
  if(!item) throw new Error(`Missing neutral Zhihu item at index ${index}`);
  return item;
}

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

function Avatar({mark,color}:{mark:string;color:string}) {
  return <span className="zhihu-avatar" style={{background:color}} aria-hidden="true">{mark}</span>;
}

export function ZhihuApp() {
  const {state,activeDeviceId,goBack,emit,setUiFlag,setScrollPosition}=useGame();
  const formalAnswer=getContentItem("zhihu.answer.01");
  const deletedPage=getContentItem("page.zhihu.deleted.01");
  const answerBody=formalAnswer?activeBody(state,formalAnswer) as AnswerBody:{};
  const deletedBody=deletedPage?activeBody(state,deletedPage) as DeletedBody:{};
  const formalItem:ZhihuItem={
    id:"zhihu.answer.01",
    contentId:"zhihu.answer.01",
    title:answerBody.question??"网页存档与当前页面为什么会不同？",
    excerpt:answerBody.answer??"",
    body:[answerBody.answer??""],
    author:"川流档案",
    authorMark:"川",
    authorColor:"#1772f6",
    credential:"用户研究 / 城市摄影",
    upvotes:answerBody.upvotes??318,
    comments:32,
    topics:["网页存档","缓存"],
    narrativeFunction:"profession"
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
    narrativeFunction:"supporting",
    notFound:true
  };
  const feed=useMemo(()=>[
    neutralItem(0),neutralItem(1),neutralItem(2),formalItem,neutralItem(3),
    neutralItem(4),neutralItem(5),neutralItem(6),neutralItem(7),neutralItem(8),
    neutralItem(9),missingItem
  ],[answerBody.answer,answerBody.question,answerBody.upvotes,deletedBody.title]);
  const [view,setView]=useState<ZhihuView>("home");
  const [selectedId,setSelectedId]=useState(formalItem.id);
  const [query,setQuery]=useState("");
  const [searchQuery,setSearchQuery]=useState("");
  const scrollRef=useRef<HTMLDivElement>(null);
  const selected=feed.find(item=>item.id===selectedId)??formalItem;
  const liked=state.world.flags[`ui.zhihu.liked.${selected.id}`]===true;
  const saved=state.world.flags[`ui.zhihu.saved.${selected.id}`]===true;
  const routeKey=`zhihu.${view}`;

  useLayoutEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollTop=state.devices[activeDeviceId].scrollByRoute[routeKey]??0;
  },[activeDeviceId,routeKey,state.devices]);

  const rememberScroll=()=>{
    if(scrollRef.current) setScrollPosition(routeKey,scrollRef.current.scrollTop);
  };
  const openItem=(item:ZhihuItem)=>{
    const currentScroll=scrollRef.current?.scrollTop??0;
    setSelectedId(item.id);
    emit(item.notFound?"browser.page.opened":"content.item.opened",item.contentId??item.id,{surface:"zhihu"});
    setScrollPosition(routeKey,currentScroll);
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
  });

  if(view==="not-found"||view==="archive") {
    return <div className="app-window zhihu-app" data-testid="zhihu-404">
      <header className="zhihu-page-header">
        <button data-testid="app-back" aria-label="返回" onClick={backWithinApp}><ZhihuIcon name="back"/></button>
        <strong>知乎</strong>
        <button aria-label="分享"><ZhihuIcon name="share"/></button>
      </header>
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
      <nav className="zhihu-search-tabs"><button className="active">综合</button><button>用户</button><button>话题</button></nav>
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
        <button aria-label="更多">•••</button>
      </header>
      <div className="zhihu-scroll zhihu-comments-list" ref={scrollRef}>
        <div className="zhihu-comment-sort"><b>评论</b><button>默认排序⌄</button></div>
        {comments.map(comment=><article className="zhihu-comment" key={comment.author}>
          <Avatar mark={comment.mark} color={comment.color}/>
          <div><b>{comment.author}</b><p>{comment.text}</p><footer><time>{comment.time}</time><span>♡ {comment.likes}</span><button>回复</button></footer></div>
        </article>)}
      </div>
      <div className="zhihu-comment-composer"><button>写评论…</button><span>♡</span><span>☆</span></div>
    </div>;
  }

  if(view==="detail") {
    return <div className="app-window zhihu-app" data-testid="zhihu-detail">
      <header className="zhihu-page-header">
        <button data-testid="app-back" aria-label="返回" onClick={backWithinApp}><ZhihuIcon name="back"/></button>
        <strong>问题</strong>
        <button aria-label="分享"><ZhihuIcon name="share"/></button>
      </header>
      <div className="zhihu-scroll zhihu-detail-scroll" ref={scrollRef}>
        <article className="zhihu-question">
          <div className="zhihu-topic-row">{selected.topics.map(topic=><span key={topic}>{topic}</span>)}</div>
          <h1>{selected.title}</h1>
          <p>{selected.excerpt}</p>
          <div className="zhihu-question-meta"><span>{selected.comments+12} 人关注</span><span>{selected.comments} 个回答</span></div>
          <div className="zhihu-question-buttons"><button className="follow">关注问题</button><button>写回答</button><button>邀请回答</button></div>
        </article>
        <article className="zhihu-answer">
          <header><Avatar mark={selected.authorMark} color={selected.authorColor}/><div><b>{selected.author}</b><span>{selected.credential}</span></div><button>关注</button></header>
          <div className="zhihu-answer-voters">{selected.upvotes.toLocaleString("zh-CN")} 人赞同了该回答</div>
          {selected.body.map((paragraph,index)=><p key={index}>{paragraph}</p>)}
          <button className="zhihu-expand">展开阅读全文⌄</button>
          <footer className="zhihu-answer-meta">编辑于 2026-07-12 · 著作权归作者所有</footer>
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
        <button>喜欢</button>
      </div>
    </div>;
  }

  return <div className="app-window zhihu-app" data-testid="zhihu-home">
    <header className="zhihu-home-header">
      <button data-testid="app-back" aria-label="退出知乎" onClick={goBack}><ZhihuIcon name="menu"/></button>
      <strong>知乎</strong>
      <div><button data-testid="zhihu-open-search" aria-label="搜索" onClick={()=>setView("search")}><ZhihuIcon name="search"/></button><button aria-label="发布"><ZhihuIcon name="plus"/></button></div>
    </header>
    <nav className="zhihu-feed-tabs"><button>关注</button><button className="active">推荐</button><button>热榜</button></nav>
    <div className="zhihu-scroll zhihu-feed" ref={scrollRef}>
      <section className="zhihu-greeting"><b>早上好，朋友</b><span>为你推荐值得认真读完的回答</span></section>
      {feed.map((item,index)=><QuestionCard item={item} key={item.id} onOpen={()=>openItem(item)} effective={index===0}/>)}
    </div>
    <nav className="zhihu-bottom-nav" aria-label="知乎底部导航">
      <button className="active"><ZhihuIcon name="home"/><span>首页</span></button>
      <button><span className="zhihu-kanshan">山</span><span>看山</span></button>
      <button className="create"><ZhihuIcon name="plus"/><span>创作</span></button>
      <button><ZhihuIcon name="message"/><span>消息</span></button>
      <button><ZhihuIcon name="person"/><span>我的</span></button>
    </nav>
  </div>;
}

function QuestionCard({item,onOpen,effective=false}:{item:ZhihuItem;onOpen():void;effective?:boolean}) {
  return <article className="zhihu-question-card">
    <button data-testid={effective?"app-effective-action":undefined} onClick={onOpen}>
      <h2>{item.title}</h2>
      <div className="zhihu-card-author"><Avatar mark={item.authorMark} color={item.authorColor}/><span><b>{item.author}</b><small>{item.credential}</small></span></div>
      <p>{item.excerpt}</p>
      <footer><span>▲ {item.upvotes.toLocaleString("zh-CN")} 赞同</span><span>{item.comments} 评论</span><span>收藏</span><span>•••</span></footer>
    </button>
  </article>;
}
