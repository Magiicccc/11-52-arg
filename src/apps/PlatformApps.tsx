import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useGame } from "@/app/GameContext";
import { activeBody, unlockedItemsForApp } from "@/content/selectors";

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

function PlatformBottomNav({ items, active }: { items: string[]; active: string }) {
  return <nav className="platform-bottom-nav" aria-label="底部导航">
    {items.map((item) => <button className={item === active ? "active" : ""} key={item}>{item}</button>)}
  </nav>;
}

function usePlatformScroll(route: string) {
  const { state, activeDeviceId, setScrollPosition } = useGame();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = state.devices[activeDeviceId].scrollByRoute[route] ?? 0;
  });
  return {
    ref,
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
  const { goBack } = useGame();
  return <div className={`app-window platform-app ${className}`}>
    <header className="platform-detail-header">
      <PlatformBack onClick={onBack}/>
      <strong>{title}</strong>
      <button aria-label="更多">•••</button>
    </header>
    <div className="platform-scroll">{children}</div>
    {footer}
    <button className="platform-close-hit" data-testid="app-back" aria-label={`退出${title}`} onClick={goBack}/>
  </div>;
}

export function XiaohongshuApp() {
  const { state, goBack, emit } = useGame();
  const items = unlockedItemsForApp(state, "app.xiaohongshu");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scroll = usePlatformScroll("xiaohongshu.home");
  const selected = items.find((item) => item.id === selectedId);

  if (selected) {
    const body = activeBody(state, selected) as Body;
    return <DetailShell
      className="xhs-app"
      title="笔记"
      onBack={() => setSelectedId(null)}
      footer={<div className="xhs-detail-actions">
        <button>说点什么…</button>
        <PlatformStateButton flag={`xiaohongshu.liked.${selected.id}`} label={`赞 ${number(body, "likes")}`} activeLabel={`已赞 ${number(body, "likes") + 1}`} contentId={selected.id}/>
        <PlatformStateButton flag={`xiaohongshu.saved.${selected.id}`} label="收藏" activeLabel="已收藏" contentId={selected.id}/>
        <button onClick={() => emit("content.item.interacted", selected.id, { action: "comments" })}>评论 {number(body, "comments")}</button>
      </div>}
    >
      <article className="xhs-note-detail">
        <div className="xhs-note-media" aria-label="笔记图片"><span>{text(body, "date")}</span></div>
        <header><span className="xhs-avatar">川</span><b>川流档案</b><button>关注</button></header>
        <h1>{text(body, "title")}</h1>
        <p>{text(body, "text")}</p>
        <div className="xhs-tags"><span>#城市散步</span><span>#生活记录</span></div>
        <time>{text(body, "date")} · 杭州</time>
        <section className="xhs-comments">
          <b>共 {number(body, "comments")} 条评论</b>
        </section>
      </article>
    </DetailShell>;
  }

  return <div className="app-window platform-app xhs-app" data-testid="xiaohongshu-home">
    <header className="xhs-home-header">
      <button aria-label="菜单">☰</button>
      <nav><button>关注</button><button className="active">发现</button><button>附近</button></nav>
      <button aria-label="搜索">⌕</button>
    </header>
    <div className="xhs-topic-tabs"><button className="active">推荐</button><button>穿搭</button><button>美食</button><button>旅行</button><button>摄影</button></div>
    <div className="platform-scroll xhs-feed" ref={scroll.ref}>
      {items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button
          className="xhs-card"
          data-testid={index === 0 ? "app-effective-action" : undefined}
          key={item.id}
          onClick={() => {
            setSelectedId(item.id);
            emit("content.item.opened", item.id, { surface: "xiaohongshu" });
            scroll.remember();
          }}
        >
          <span className={`xhs-cover tone-${index % 2}`} aria-hidden="true"/>
          <b>{text(body, "title")}</b>
          <small><i>川</i> 川流档案 <span>♡ {number(body, "likes")}</span></small>
        </button>;
      })}
      <div className="xhs-feed-end">已显示当前账号保存的全部笔记</div>
    </div>
    <PlatformBottomNav items={["首页", "购物", "发布", "消息", "我"]} active="首页"/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出小红书" onClick={goBack}/>
  </div>;
}

export function DouyinApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const items = unlockedItemsForApp(state, "app.douyin");
  const storedIndex=Number(state.world.flags["ui.douyin.feedIndex"]??0);
  const currentIndex=Math.max(0,Math.min(items.length-1,Number.isFinite(storedIndex)?storedIndex:0));
  const item = items[currentIndex];
  const body = item ? activeBody(state, item) as Body : {};
  const [paused, setPaused] = useState(false);
  const saved = item ? state.world.flags[`ui.douyin.saved.${item.id}`] === true : false;
  const changeVideo=(direction:number)=>{
    if(items.length===0)return;
    const next=(currentIndex+direction+items.length)%items.length;
    setUiFlag("douyin.feedIndex",next);
    emit("app.view.changed","app.douyin",{view:"feed",index:next});
  };
  return <div className="app-window platform-app douyin-app" data-testid="douyin-home">
    <header className="douyin-header">
      <button aria-label="直播">LIVE</button>
      <nav><button>关注</button><button className="active">推荐</button></nav>
      <button aria-label="搜索">⌕</button>
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
      <span className="douyin-skyline" aria-hidden="true"/>
      {paused && <span className="douyin-play-state">▶</span>}
    </button>
    <aside className="douyin-actions">
      <button><span className="douyin-avatar">城</span><b>＋</b></button>
      <button onClick={() => item && emit("content.item.interacted", item.id, { action: "like" })}>♡<small>{number(body, "likes")}</small></button>
      <button onClick={() => item && emit("content.item.interacted", item.id, { action: "comments" })}>◌<small>{number(body, "comments")}</small></button>
      <button className={saved ? "active" : ""} onClick={() => {
        if (!item) return;
        setUiFlag(`douyin.saved.${item.id}`, !saved);
        emit("content.item.interacted", item.id, { action: "save", active: !saved });
      }}>☆<small>{saved ? "已收藏" : "收藏"}</small></button>
      <button>↗<small>分享</small></button>
    </aside>
    <section className="douyin-caption">
      <b>@{text(body, "author", "城市边角")}</b>
      <p>{text(body, "caption", "暂无视频说明")}</p>
      <span>♫ 原声 · {text(body, "author", "城市边角")}</span>
    </section>
    <div className="douyin-feed-controls"><button onClick={()=>changeVideo(-1)}>上一条</button><span>{currentIndex+1} / {items.length}</span><button onClick={()=>changeVideo(1)}>下一条</button></div>
    <PlatformBottomNav items={["首页", "朋友", "＋", "消息", "我"]} active="首页"/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出抖音" onClick={goBack}/>
  </div>;
}

export function ToutiaoApp() {
  const { state, goBack, emit } = useGame();
  const items = unlockedItemsForApp(state, "app.toutiao");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scroll = usePlatformScroll("toutiao.home");
  const selected = items.find((item) => item.id === selectedId);
  if (selected) {
    const body = activeBody(state, selected) as Body;
    return <DetailShell className="toutiao-app" title="今日头条" onBack={() => setSelectedId(null)} footer={
      <div className="toutiao-actions"><button>写评论…</button><button>♡</button><button>☆</button><button>↗</button></div>
    }>
      <article className="toutiao-article">
        <h1>{text(body, "title")}</h1>
        <div><span className="toutiao-source">头条新闻</span><time>{text(body, "date")}</time></div>
        <p>{text(body, "summary")}</p>
      </article>
    </DetailShell>;
  }
  return <div className="app-window platform-app toutiao-app" data-testid="toutiao-home">
    <header className="toutiao-home-header"><strong>今日头条</strong><button aria-label="搜索">⌕</button><button aria-label="发布">＋</button></header>
    <nav className="toutiao-tabs"><button>关注</button><button className="active">推荐</button><button>热榜</button><button>杭州</button><button>视频</button></nav>
    <div className="platform-scroll toutiao-feed" ref={scroll.ref}>
      {items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button data-testid={index === 0 ? "app-effective-action" : undefined} className="toutiao-card" key={item.id} onClick={() => {
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
    <PlatformBottomNav items={["首页", "视频", "发布", "消息", "我的"]} active="首页"/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出今日头条" onClick={goBack}/>
  </div>;
}

export function QQMailApp() {
  const { state, goBack, emit } = useGame();
  const items = unlockedItemsForApp(state, "app.qqmail");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scroll = usePlatformScroll("qqmail.home");
  const selected = items.find((item) => item.id === selectedId);
  if (selected) {
    const body = activeBody(state, selected) as Body;
    return <DetailShell className="qqmail-app" title="邮件" onBack={() => setSelectedId(null)} footer={
      <div className="mail-actions"><button>回复</button><button>转发</button><button>移动</button><button>删除</button></div>
    }>
      <article className="mail-detail">
        <h1>{text(body, "subject")}</h1>
        <header><span className="mail-avatar">{text(body, "from").slice(0, 1)}</span><div><b>{text(body, "from")}</b><small>发给 沈川 · {text(body, "date")}</small></div></header>
        <p>{text(body, "preview")}</p>
      </article>
    </DetailShell>;
  }
  return <div className="app-window platform-app qqmail-app" data-testid="qqmail-home">
    <header className="qqmail-header"><button aria-label="头像" className="mail-account">沈</button><strong>收件箱</strong><div><button aria-label="搜索">⌕</button><button aria-label="写邮件">＋</button></div></header>
    <div className="mail-search">搜索邮件</div>
    <div className="platform-scroll mail-list" ref={scroll.ref}>
      <section className="mail-folders"><button>所有未读 <b>{items.length}</b></button><button>星标邮件</button><button>附件管理</button></section>
      {items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button data-testid={index === 0 ? "app-effective-action" : undefined} className="mail-row" key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "qqmail" });
          scroll.remember();
        }}>
          <span className="mail-unread"/>
          <div><b>{text(body, "from")}</b><strong>{text(body, "subject")}</strong><p>{text(body, "preview")}</p></div>
          <time>{text(body, "date")}</time>
        </button>;
      })}
    </div>
    <PlatformBottomNav items={["邮件", "通讯录", "日历", "文件"]} active="邮件"/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出QQ邮箱" onClick={goBack}/>
  </div>;
}

export function BaiduNetdiskApp() {
  const { state, goBack, emit } = useGame();
  const items = unlockedItemsForApp(state, "app.baidunetdisk");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scroll = usePlatformScroll("baidunetdisk.home");
  const selected = items.find((item) => item.id === selectedId);
  if (selected) {
    const body = activeBody(state, selected) as Body;
    return <DetailShell className="netdisk-app" title={text(body, "name", "文件详情")} onBack={() => setSelectedId(null)}>
      <section className="netdisk-file-detail">
        <span className="netdisk-file-icon">ZIP</span>
        <h1>{text(body, "name")}</h1>
        <p>{text(body, "size")} · {text(body, "status")}</p>
        <button onClick={() => emit("content.item.interacted", selected.id, { action: "download" })}>下载到本机</button>
        <button onClick={() => emit("content.item.interacted", selected.id, { action: "share" })}>分享</button>
      </section>
    </DetailShell>;
  }
  return <div className="app-window platform-app netdisk-app" data-testid="baidunetdisk-home">
    <header className="netdisk-header"><span className="netdisk-account">沈</span><div><b>百度网盘</b><small>安全保存每一份文件</small></div><button>＋</button></header>
    <div className="netdisk-search">搜索网盘文件</div>
    <div className="platform-scroll netdisk-home" ref={scroll.ref}>
      <section className="netdisk-shortcuts">{["图片", "视频", "文档", "音频", "压缩包"].map((label) => <button key={label}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <section className="netdisk-storage"><b>存储空间</b><span>查看详情</span><i><b/></i></section>
      <h2>最近</h2>
      {items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button data-testid={index === 0 ? "app-effective-action" : undefined} className="netdisk-file-row" key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "baidunetdisk" });
          scroll.remember();
        }}>
          <span>ZIP</span><div><b>{text(body, "name")}</b><small>{text(body, "size")} · {text(body, "status")}</small></div><i>•••</i>
        </button>;
      })}
    </div>
    <PlatformBottomNav items={["首页", "文件", "传输", "分享", "我的"]} active="首页"/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出百度网盘" onClick={goBack}/>
  </div>;
}

export function AlipayApp() {
  const { state, goBack, emit } = useGame();
  const items = unlockedItemsForApp(state, "app.alipay");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scroll = usePlatformScroll("alipay.home");
  const selected = items.find((item) => item.id === selectedId);
  if (selected) {
    const body = activeBody(state, selected) as Body;
    return <DetailShell className="alipay-app" title="账单详情" onBack={() => setSelectedId(null)}>
      <section className="alipay-bill-detail">
        <span className="alipay-merchant-mark">支</span>
        <b>{text(body, "merchant")}</b>
        <h1>−{number(body, "amount").toFixed(2)}</h1>
        <dl><div><dt>付款时间</dt><dd>{text(body, "date")}</dd></div></dl>
      </section>
    </DetailShell>;
  }
  return <div className="app-window platform-app alipay-app" data-testid="alipay-home">
    <header className="alipay-header"><button>杭州⌄</button><div>搜索</div><button>＋</button></header>
    <div className="platform-scroll alipay-home" ref={scroll.ref}>
      <section className="alipay-primary">{["扫一扫", "付钱/收钱", "出行", "卡包"].map((label) => <button key={label}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <section className="alipay-services">{["饿了么", "市民中心", "生活缴费", "医保码", "转账", "余额宝", "我的快递", "更多"].map((label) => <button key={label}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <section className="alipay-bills"><header><b>最近账单</b><span>全部</span></header>{items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button data-testid={index === 0 ? "app-effective-action" : undefined} key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "alipay" });
          scroll.remember();
        }}><span className="alipay-merchant-mark">支</span><div><b>{text(body, "merchant")}</b><small>{text(body, "date")}</small></div><strong>−{number(body, "amount").toFixed(2)}</strong></button>;
      })}</section>
    </div>
    <PlatformBottomNav items={["首页", "理财", "生活", "消息", "我的"]} active="首页"/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出支付宝" onClick={goBack}/>
  </div>;
}

export function DidiApp() {
  const { state, goBack, emit } = useGame();
  const items = unlockedItemsForApp(state, "app.didi");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((item) => item.id === selectedId);
  if (selected) {
    const body = activeBody(state, selected) as Body;
    return <DetailShell className="didi-app" title="行程详情" onBack={() => setSelectedId(null)}>
      <section className="didi-trip-detail">
        <span>{text(body, "status")}</span><h1>{text(body, "date")}</h1>
        <div className="didi-route-line"><i/><p><b>{text(body, "from")}</b><b>{text(body, "to")}</b></p></div>
        <button onClick={() => emit("content.item.interacted", selected.id, { action: "route" })}>查看行程路线</button>
      </section>
    </DetailShell>;
  }
  return <div className="app-window platform-app didi-app" data-testid="didi-home">
    <header className="didi-header"><button>杭州⌄</button><button aria-label="消息">消息</button></header>
    <div className="didi-map" aria-label="地图"><span className="didi-current-dot"/><i/><i/><i/></div>
    <section className="didi-sheet">
      <div className="didi-destination"><span/><div><small>你要去哪儿？</small><b>输入目的地</b></div></div>
      <nav>{["打车", "顺风车", "代驾", "特价拼车"].map((label) => <button key={label}><i>{label.slice(0, 1)}</i>{label}</button>)}</nav>
      <h2>最近行程</h2>
      {items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button data-testid={index === 0 ? "app-effective-action" : undefined} className="didi-trip-row" key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "didi" });
        }}><div><b>{text(body, "from")} → {text(body, "to")}</b><small>{text(body, "date")} · {text(body, "status")}</small></div><span>›</span></button>;
      })}
    </section>
    <PlatformBottomNav items={["首页", "订单", "优惠", "我的"]} active="首页"/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出滴滴出行" onClick={goBack}/>
  </div>;
}

export function MeituanApp() {
  const { state, goBack, emit } = useGame();
  const items = unlockedItemsForApp(state, "app.meituan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scroll = usePlatformScroll("meituan.home");
  const selected = items.find((item) => item.id === selectedId);
  if (selected) {
    const body = activeBody(state, selected) as Body;
    return <DetailShell className="meituan-app" title="订单详情" onBack={() => setSelectedId(null)}>
      <article className="meituan-order-detail">
        <header><h1>{text(body, "merchant")}</h1></header>
        <section>{stringList(body, "items").map((item) => <p key={item}><span>{item}</span></p>)}<p><span>餐具数量</span><b>{number(body, "tableware")} 份</b></p></section>
        <div><span>实付</span><strong>¥{number(body, "amount").toFixed(2)}</strong></div>
        <small>下单时间 {text(body, "date")}</small>
        <button onClick={() => emit("content.item.interacted", selected.id, { action: "review" })}>评价订单</button>
      </article>
    </DetailShell>;
  }
  return <div className="app-window platform-app meituan-app" data-testid="meituan-home">
    <header className="meituan-header"><button>杭州⌄</button><div>搜索商家、商品</div><button>＋</button></header>
    <div className="platform-scroll meituan-home" ref={scroll.ref}>
      <section className="meituan-categories">{["美食", "外卖", "酒店", "休闲玩乐", "电影", "打车", "买药", "全部"].map((label) => <button key={label}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <section className="meituan-banner"><b>吃喝玩乐 都在美团</b><span>问美团，都安排</span></section>
      <section className="meituan-orders"><header><b>我的订单</b><span>全部订单</span></header>{items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button data-testid={index === 0 ? "app-effective-action" : undefined} key={item.id} onClick={() => {
          setSelectedId(item.id);
          emit("content.item.opened", item.id, { surface: "meituan" });
          scroll.remember();
        }}><span className="meituan-shop-mark">店</span><div><b>{text(body, "merchant")}</b><small>{stringList(body, "items").join("、")}</small><time>{text(body, "date")}</time></div><strong>¥{number(body, "amount").toFixed(2)}</strong></button>;
      })}</section>
      <section className="meituan-everyday"><header><b>常点商家</b><span>来自历史订单</span></header>{["牛肉饭","馄饨","咖啡"].map((label,index)=><button key={label} onClick={()=>emit("content.item.opened","app.meituan",{surface:"everyday",label,index})}><span>{label.slice(0,1)}</span><div><b>{label}</b><small>普通生活订单 · 查看历史记录</small></div><i>›</i></button>)}</section>
    </div>
    <PlatformBottomNav items={["首页", "视频", "消息", "购物车", "我的"]} active="首页"/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出美团" onClick={goBack}/>
  </div>;
}

export function TaobaoApp() {
  const { state, goBack, emit } = useGame();
  const items = unlockedItemsForApp(state, "app.taobao");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scroll = usePlatformScroll("taobao.home");
  const selected = items.find((item) => item.id === selectedId);
  if (selected) {
    const body = activeBody(state, selected) as Body;
    return <DetailShell className="taobao-app" title="订单详情" onBack={() => setSelectedId(null)} footer={
      <div className="taobao-detail-actions"><button>联系卖家</button><button>查看物流</button><PlatformStateButton flag={`taobao.saved.${selected.id}`} label="收藏" activeLabel="已收藏" contentId={selected.id}/></div>
    }>
      <article className="taobao-order-detail">
        <div className="taobao-product-image"><span>商品图片</span></div>
        <h1>{text(body, "title")}</h1>
        <strong>{text(body, "amount") ? `¥${number(body, "amount").toFixed(2)}` : text(body, "status")}</strong>
        <dl><div><dt>订单状态</dt><dd>{text(body, "status")}</dd></div><div><dt>下单时间</dt><dd>{text(body, "date")}</dd></div>{text(body, "note") && <div><dt>订单说明</dt><dd>{text(body, "note")}</dd></div>}</dl>
      </article>
    </DetailShell>;
  }
  return <div className="app-window platform-app taobao-app" data-testid="taobao-home">
    <header className="taobao-header"><div>搜索淘宝商品</div><button>搜索</button></header>
    <nav className="taobao-tabs"><button className="active">推荐</button><button>闪购</button><button>小时达</button><button>百亿补贴</button></nav>
    <div className="platform-scroll taobao-home" ref={scroll.ref}>
      <section className="taobao-categories">{["天猫", "聚划算", "淘金币", "闲鱼", "充值", "旅行", "领券", "分类"].map((label) => <button key={label}><i>{label.slice(0, 1)}</i>{label}</button>)}</section>
      <h2>我的订单</h2>
      <div className="taobao-order-grid">{items.map((item, index) => {
        const body = activeBody(state, item) as Body;
        return <button
          data-testid={index === 0 ? "app-effective-action" : undefined}
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
    <PlatformBottomNav items={["首页", "视频", "消息", "购物车", "我的淘宝"]} active="首页"/>
    <button className="platform-close-hit" data-testid="app-back" aria-label="退出淘宝" onClick={goBack}/>
  </div>;
}
