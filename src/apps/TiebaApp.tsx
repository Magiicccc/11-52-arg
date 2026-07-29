import { useMemo, useState } from "react";
import { useGame } from "@/app/GameContext";
import { activeBody, unlockedItemsForApp } from "@/content/selectors";
import { followedTiebaBars, ordinaryTiebaPosts, type OrdinaryTiebaPost } from "@/content/tieba-life-data";
import { identityAvatar, realisticInternetAvatar } from "@/content/avatar-assets";
import { assetUrl } from "@/lib/asset-url";

type Floor = { floor?: number; author?: string; text?: string; cacheOnly?: boolean };
type TiebaView = "home" | "bar" | "thread" | "search" | "messages" | "profile" | "user" | "favorites";

const archivePostId = "tieba.archive.417";
const validViews: TiebaView[] = ["home", "bar", "thread", "search", "messages", "profile", "user", "favorites"];

function compactNumber(value: number): string {
  if (value >= 10_000) return `${(value / 10_000).toFixed(value >= 100_000 ? 0 : 1)}万`;
  return value.toLocaleString("zh-CN");
}

export function TiebaApp() {
  const { state, goBack, emit, setUiFlag } = useGame();
  const savedView = state.world.flags["ui.tieba.view"];
  const [viewState, setViewState] = useState<TiebaView>(
    typeof savedView === "string" && validViews.includes(savedView as TiebaView) ? savedView as TiebaView : "home"
  );
  const savedPost = state.world.flags["ui.tieba.selectedPost"];
  const [selectedPostId, setSelectedPostId] = useState(typeof savedPost === "string" ? savedPost : "");
  const savedBar = state.world.flags["ui.tieba.selectedBar"];
  const [selectedBar, setSelectedBar] = useState(typeof savedBar === "string" ? savedBar : "杭州吧");
  const savedQuery = state.world.flags["ui.tieba.query"];
  const [query, setQueryState] = useState(typeof savedQuery === "string" ? savedQuery : "");
  const [replyText, setReplyText] = useState("");
  const [onlyOwner, setOnlyOwner] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [profileSection, setProfileSection] = useState("动态");
  const [returnView, setReturnView] = useState<TiebaView>("home");

  const formalFloors = unlockedItemsForApp(state, "app.tieba");
  const selectedPost = ordinaryTiebaPosts.find((post) => post.id === selectedPostId);
  const view = viewState === "thread" && !selectedPost && selectedPostId !== archivePostId ? "home" : viewState;
  const selectedAuthor = typeof state.world.flags["ui.tieba.selectedAuthor"] === "string"
    ? String(state.world.flags["ui.tieba.selectedAuthor"])
    : selectedPost?.author ?? "旧雨17";

  const setView = (next: TiebaView) => {
    setViewState(next);
    setUiFlag("tieba.view", next);
    emit("app.view.changed", "app.tieba", { view: next, source: "P" });
  };
  const setQuery = (value: string) => {
    setQueryState(value);
    setUiFlag("tieba.query", value);
  };
  const openPost = (postId: string) => {
    setReturnView(viewState === "thread" ? "home" : viewState);
    setSelectedPostId(postId);
    setUiFlag("tieba.selectedPost", postId);
    setView("thread");
    emit("content.item.opened", postId, { surface: "tieba", source: "P" });
  };
  const openBar = (bar: string) => {
    setSelectedBar(bar);
    setUiFlag("tieba.selectedBar", bar);
    setView("bar");
  };
  const openUser = (author: string) => {
    setUiFlag("tieba.selectedAuthor", author);
    setView("user");
    emit("profile.opened", author, { surface: "tieba", source: "P" });
  };
  const backWithinApp = () => {
    if (view === "thread") {
      setView(returnView === "thread" ? "home" : returnView);
      return;
    }
    if (view === "user") {
      setView(selectedPostId ? "thread" : "home");
      return;
    }
    if (view !== "home") {
      setView("home");
      return;
    }
    goBack();
  };

  const followed = (bar: string) => state.world.flags[`ui.tieba.followed.${bar}`] === true;
  const toggleFollow = (bar: string) => {
    setUiFlag(`tieba.followed.${bar}`, !followed(bar));
    emit("content.item.interacted", bar, { action: "follow-bar", active: !followed(bar), source: "P" });
  };
  const saved = Boolean(selectedPostId) && state.world.flags[`ui.tieba.saved.${selectedPostId}`] === true;
  const customRepliesValue = selectedPostId ? state.world.flags[`ui.tieba.replies.${selectedPostId}`] : undefined;
  const customReplies = Array.isArray(customRepliesValue)
    ? customRepliesValue.filter((value): value is string => typeof value === "string")
    : [];
  const sendReply = () => {
    const text = replyText.trim();
    if (!text || !selectedPostId) return;
    setUiFlag(`tieba.replies.${selectedPostId}`, [...customReplies, text]);
    emit("forum.reply.sent", selectedPostId, { text, source: "P" });
    setReplyText("");
  };

  return <div className="app-window tieba-app" data-testid={`tieba-${view}`}>
    <TiebaHeader
      view={view}
      title={view === "bar" ? selectedBar : view === "thread" ? selectedPost?.bar ?? "潘博文事件吧" : view === "search" ? "搜索" : view === "messages" ? "消息" : view === "profile" || view === "favorites" ? "我的" : view === "user" ? selectedAuthor : "百度贴吧"}
      onBack={backWithinApp}
      onSearch={() => setView("search")}
      onMore={() => setHeaderMenuOpen((value) => !value)}
    />
    {headerMenuOpen && <aside className="tieba-header-menu">{["刷新", "扫一扫", "夜间模式", "设置"].map((label) => <button key={label} onClick={() => {
      setUiFlag(`tieba.header.${label}`, true);
      emit("content.item.interacted", "app.tieba", { surface: "header-menu", label, source: "P" });
      setHeaderMenuOpen(false);
    }}>{label}</button>)}</aside>}

    {view === "home" && <TiebaHome
      state={state}
      onOpenPost={openPost}
      onOpenArchive={() => openPost(archivePostId)}
      onOpenBar={openBar}
      onOpenUser={openUser}
      onRecordRead={(postId) => setUiFlag(`tieba.read.${postId}`, true)}
    />}

    {view === "bar" && <TiebaBarPage
      bar={selectedBar}
      followed={followed(selectedBar)}
      onFollow={() => toggleFollow(selectedBar)}
      onOpenPost={openPost}
      onOpenArchive={() => openPost(archivePostId)}
      onOpenUser={openUser}
      state={state}
      onRecordRead={(postId) => setUiFlag(`tieba.read.${postId}`, true)}
    />}

    {view === "thread" && selectedPost && <OrdinaryThread
      post={selectedPost}
      saved={saved}
      customReplies={customReplies}
      replyText={replyText}
      shareOpen={shareOpen}
      state={state}
      onAuthor={openUser}
      onReplyText={setReplyText}
      onReply={sendReply}
      onSave={() => {
        setUiFlag(`tieba.saved.${selectedPost.id}`, !saved);
        emit("content.item.interacted", selectedPost.id, { action: "save", active: !saved, source: "P" });
      }}
      onShare={() => setShareOpen(true)}
      onCloseShare={() => setShareOpen(false)}
      onShareAction={(action) => {
        setUiFlag(`tieba.shared.${selectedPost.id}.${action}`, true);
        emit("content.item.interacted", selectedPost.id, { action: `share-${action}`, source: "P" });
        setShareOpen(false);
      }}
      onLikeReply={(replyId) => setUiFlag(`tieba.replyLiked.${replyId}`, true)}
    />}

    {view === "thread" && selectedPostId === archivePostId && <ArchiveThread
      state={state}
      floors={formalFloors}
      onlyOwner={onlyOwner}
      saved={saved}
      customReplies={customReplies}
      replyText={replyText}
      shareOpen={shareOpen}
      onOnlyOwner={() => setOnlyOwner((value) => !value)}
      onAuthor={openUser}
      onReplyText={setReplyText}
      onReply={sendReply}
      onSave={() => {
        setUiFlag(`tieba.saved.${archivePostId}`, !saved);
        emit("content.item.interacted", archivePostId, { action: "save", active: !saved, source: "P" });
      }}
      onShare={() => setShareOpen(true)}
      onCloseShare={() => setShareOpen(false)}
      onShareAction={(action) => {
        setUiFlag(`tieba.shared.${archivePostId}.${action}`, true);
        emit("content.item.interacted", archivePostId, { action: `share-${action}`, source: "P" });
        setShareOpen(false);
      }}
      onInspect417={() => emit("forum.floor.inspected", "forum.tieba.floor417", { floor: 417 })}
    />}

    {view === "search" && <TiebaSearch
      query={query}
      onQuery={setQuery}
      onOpenPost={openPost}
      onOpenArchive={() => openPost(archivePostId)}
      onOpenBar={openBar}
      historyHidden={state.world.flags["ui.tieba.searchHistoryHidden"] === true}
      onClearHistory={() => setUiFlag("tieba.searchHistoryHidden", true)}
    />}

    {view === "messages" && <TiebaMessages onOpenPost={openPost}/>}

    {view === "profile" && <TiebaProfile
      section={profileSection}
      state={state}
      onSection={setProfileSection}
      onOpenPost={openPost}
      onOpenFavorites={() => setView("favorites")}
      onEdit={() => setProfileSection("编辑资料")}
    />}

    {view === "favorites" && <TiebaFavorites state={state} onOpenPost={openPost}/>}

    {view === "user" && <TiebaUser author={selectedAuthor} state={state} onOpenPost={openPost}/>}

    {!["thread", "user", "search"].includes(view) && <TiebaBottomNav active={view} onChange={setView}/>}
  </div>;
}

function TiebaHeader({
  view, title, onBack, onSearch, onMore
}: {
  view: TiebaView;
  title: string;
  onBack(): void;
  onSearch(): void;
  onMore(): void;
}) {
  return <header className="tieba-app-header">
    <button data-testid="app-back" aria-label={view === "home" ? "退出百度贴吧" : "返回"} onClick={onBack}>‹</button>
    <strong>{title}</strong>
    <div>
      {view !== "search" && <button aria-label="搜索贴吧" onClick={onSearch}>⌕</button>}
      <button aria-label="更多" onClick={onMore}>•••</button>
    </div>
  </header>;
}

function TiebaHome({
  state, onOpenPost, onOpenArchive, onOpenBar, onOpenUser, onRecordRead
}: {
  state: ReturnType<typeof useGame>["state"];
  onOpenPost(id: string): void;
  onOpenArchive(): void;
  onOpenBar(bar: string): void;
  onOpenUser(author: string): void;
  onRecordRead(id: string): void;
}) {
  const [feedTab, setFeedTab] = useState("推荐");
  const feed = (feedTab === "热榜"
    ? [...ordinaryTiebaPosts].sort((a, b) => b.views - a.views)
    : feedTab === "视频"
      ? ordinaryTiebaPosts.filter((post) => post.media)
      : ordinaryTiebaPosts).slice(0, 12);
  const open = (id: string) => {
    onRecordRead(id);
    onOpenPost(id);
  };
  return <main className="tieba-scroll tieba-home">
    <section className="tieba-followed-strip">
      <header><b>我关注的吧</b><span>全部 {followedTiebaBars.length}</span></header>
      <div>{followedTiebaBars.slice(0, 5).map((bar) => <button key={bar.name} onClick={() => onOpenBar(bar.name)}>
        <span>{bar.name.slice(0, 1)}</span><b>{bar.name.replace("吧", "")}</b>
      </button>)}</div>
    </section>
    <nav className="tieba-feed-tabs">{["推荐", "热榜", "视频"].map((label) => <button aria-current={feedTab === label ? "page" : undefined} disabled={feedTab === label} className={feedTab === label ? "active" : ""} key={label} onClick={() => setFeedTab(label)}>{label}</button>)}</nav>
    <section className="tieba-feed">
      {feed.map((post, index) => <div key={post.id}>
        {index === 4 && <ArchivePostCard onOpen={onOpenArchive}/>}
        <TiebaPostCard post={post} state={state} onOpen={() => open(post.id)} onAuthor={() => onOpenUser(post.author)}/>
      </div>)}
    </section>
  </main>;
}

function TiebaBarPage({
  bar, followed, onFollow, onOpenPost, onOpenArchive, onOpenUser, state, onRecordRead
}: {
  bar: string;
  followed: boolean;
  onFollow(): void;
  onOpenPost(id: string): void;
  onOpenArchive(): void;
  onOpenUser(author: string): void;
  state: ReturnType<typeof useGame>["state"];
  onRecordRead(id: string): void;
}) {
  const [barTab, setBarTab] = useState("看贴");
  const meta = followedTiebaBars.find((item) => item.name === bar);
  const sourcePosts = ordinaryTiebaPosts.filter((post) => post.bar === bar);
  const posts = barTab === "精品"
    ? [...sourcePosts].sort((a, b) => b.views - a.views)
    : barTab === "图片"
      ? sourcePosts.filter((post) => post.media)
      : sourcePosts;
  return <main className="tieba-scroll tieba-bar-page">
    <section className="tieba-bar-hero">
      <span>{bar.slice(0, 1)}</span>
      <div><h1>{bar}</h1><p>{meta?.members ?? "8.6万"}关注 · {meta?.posts ?? "842"}贴子</p><small>{meta?.description ?? "吧友的普通日常讨论"}</small></div>
      <button className={followed ? "followed" : ""} onClick={onFollow}>{followed ? "已关注" : "+ 关注"}</button>
    </section>
    <nav className="tieba-bar-tabs">{["看贴", "精品", "图片", "吧规"].map((label) => <button className={barTab === label ? "active" : ""} key={label} onClick={() => setBarTab(label)}>{label}</button>)}</nav>
    {barTab === "吧规"
      ? <section className="tieba-rules"><h2>{bar}吧规</h2><p>友善交流，不公开私人地址、联系方式或未授权人物信息。</p><p>转载资料请说明来源；缓存副本与公开页面应明确区分。</p><p>广告、重复刷屏和人身攻击会被折叠处理。</p></section>
      : <section className="tieba-feed">
        {bar === "潘博文事件吧" && <ArchivePostCard onOpen={onOpenArchive}/>}
        {posts.length > 0 ? posts.map((post) => <TiebaPostCard key={post.id} post={post} state={state} onOpen={() => {
          onRecordRead(post.id);
          onOpenPost(post.id);
        }} onAuthor={() => onOpenUser(post.author)}/>) : ordinaryTiebaPosts.slice(0, 6).map((post) => <TiebaPostCard key={post.id} post={post} state={state} onOpen={() => {
          onRecordRead(post.id);
          onOpenPost(post.id);
        }} onAuthor={() => onOpenUser(post.author)}/>)}
      </section>}
  </main>;
}

function ArchivePostCard({ onOpen }: { onOpen(): void }) {
  return <article className="tieba-post-card tieba-archive-card">
    <button className="tieba-post-title" data-testid="open-archive-thread" onClick={onOpen}>
      <span className="tieba-pin">置顶</span>
      <h2>旧帖存档对比：页面缺失前后的缓存差异</h2>
      <p>公开页面已失效，本机缓存仍保留少量楼层。请按楼层顺序核对。</p>
    </button>
    <footer><span>潘博文事件吧</span><span>418 回复 · 3.8万浏览</span></footer>
  </article>;
}

function TiebaPostCard({
  post, state, onOpen, onAuthor
}: {
  post: OrdinaryTiebaPost;
  state?: ReturnType<typeof useGame>["state"];
  onOpen(): void;
  onAuthor(): void;
}) {
  const read = state?.world.flags[`ui.tieba.read.${post.id}`] === true;
  return <article className={`tieba-post-card ${read ? "read" : ""}`}>
    <button className="tieba-post-title" data-testid={post.id === "tieba.ordinary.01" ? "app-effective-action" : undefined} onClick={onOpen}>
      <h2>{post.title}</h2>
      <p>{post.body[0]}</p>
      {post.media && <img src={assetUrl(post.media)} alt={`${post.bar}普通帖子配图`}/>}
    </button>
    <footer>
      <button className="tieba-post-author" onClick={onAuthor}><img src={realisticInternetAvatar(post.author)} alt={`${post.author}头像`}/><span>{post.author}</span></button>
      <span>{post.bar} · {compactNumber(post.views)}浏览 · {post.replyCount}回复</span>
    </footer>
  </article>;
}

function OrdinaryThread({
  post, saved, customReplies, replyText, shareOpen, state, onAuthor, onReplyText, onReply, onSave, onShare, onCloseShare, onShareAction, onLikeReply
}: {
  post: OrdinaryTiebaPost;
  saved: boolean;
  customReplies: string[];
  replyText: string;
  shareOpen: boolean;
  state: ReturnType<typeof useGame>["state"];
  onAuthor(author: string): void;
  onReplyText(value: string): void;
  onReply(): void;
  onSave(): void;
  onShare(): void;
  onCloseShare(): void;
  onShareAction(action: string): void;
  onLikeReply(replyId: string): void;
}) {
  const [replyOrder, setReplyOrder] = useState<"asc" | "desc">("asc");
  const replies = replyOrder === "asc" ? post.replies : [...post.replies].reverse();
  return <main className="tieba-thread">
    <div className="tieba-thread-scroll">
      <article className="tieba-thread-op">
        <h1>{post.title}</h1>
        <button className="tieba-user-line" onClick={() => onAuthor(post.author)}><img src={realisticInternetAvatar(post.author)} alt={`${post.author}头像`}/><span><b>{post.author}</b><small>{post.bar} · {post.time}</small></span><i>楼主</i></button>
        {post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {post.media && <img className="tieba-thread-media" src={assetUrl(post.media)} alt="帖子生活配图"/>}
        <footer><span>{compactNumber(post.views)} 次浏览</span><span>{post.replyCount + customReplies.length} 条回复</span></footer>
      </article>
      <section className="tieba-replies">
        <header><b>全部回复</b><button onClick={() => setReplyOrder((value) => value === "asc" ? "desc" : "asc")}>{replyOrder === "asc" ? "正序" : "倒序"}</button></header>
        {replies.map((reply, index) => <article className="tieba-reply" key={reply.id}>
          <button className="tieba-reply-user" onClick={() => onAuthor(reply.author)}><img src={realisticInternetAvatar(reply.author, index + 70)} alt={`${reply.author}头像`}/></button>
          <div>
            <header><button onClick={() => onAuthor(reply.author)}>{reply.author}</button><span>{index + 2}楼</span></header>
            <p>{reply.text}</p>
            <footer><time>{reply.time}</time><button onClick={() => onLikeReply(reply.id)}>{state.world.flags[`ui.tieba.replyLiked.${reply.id}`] === true ? "已赞" : `赞 ${reply.likes}`}</button><button onClick={() => onReplyText(`回复 ${reply.author}：`)}>回复</button></footer>
            {reply.replies && <div className="tieba-nested-replies">{reply.replies.map((nested) => <p key={nested.id}><button onClick={() => onAuthor(nested.author)}>{nested.author}</button>{nested.replyTo && <> 回复 <b>{nested.replyTo}</b></>}：{nested.text}</p>)}</div>}
          </div>
        </article>)}
        {customReplies.map((text, index) => <article className="tieba-reply mine" key={`custom-${index}`}><img src={identityAvatar("沈川")} alt="沈川头像"/><div><header><b>川流档案</b><span>{post.replyCount + index + 2}楼</span></header><p>{text}</p><footer><time>刚刚</time></footer></div></article>)}
      </section>
    </div>
    <TiebaThreadComposer saved={saved} text={replyText} onText={onReplyText} onReply={onReply} onSave={onSave} onShare={onShare}/>
    {shareOpen && <TiebaShareSheet onClose={onCloseShare} onAction={onShareAction}/>}
  </main>;
}

function ArchiveThread({
  state, floors, onlyOwner, saved, customReplies, replyText, shareOpen, onOnlyOwner, onAuthor, onReplyText, onReply, onSave, onShare, onCloseShare, onShareAction, onInspect417
}: {
  state: ReturnType<typeof useGame>["state"];
  floors: ReturnType<typeof unlockedItemsForApp>;
  onlyOwner: boolean;
  saved: boolean;
  customReplies: string[];
  replyText: string;
  shareOpen: boolean;
  onOnlyOwner(): void;
  onAuthor(author: string): void;
  onReplyText(value: string): void;
  onReply(): void;
  onSave(): void;
  onShare(): void;
  onCloseShare(): void;
  onShareAction(action: string): void;
  onInspect417(): void;
}) {
  const shown = onlyOwner ? floors.filter((item) => (activeBody(state, item) as Floor).author === "旧雨17") : floors;
  const ordered = [...shown].sort((a, b) => Number((activeBody(state, a) as Floor).floor ?? 0) - Number((activeBody(state, b) as Floor).floor ?? 0));
  return <main className="tieba-thread">
    <div className="tieba-thread-scroll">
      <article className="tieba-thread-op tieba-archive-op">
        <div className="tieba-cache-label">本机网页缓存</div>
        <h1>旧帖存档对比：页面缺失前后的缓存差异</h1>
        <button className="tieba-user-line" onClick={() => onAuthor("旧雨17")}><img src={realisticInternetAvatar("旧雨17")} alt="旧雨17头像"/><span><b>旧雨17</b><small>潘博文事件吧 · 旧帖只读副本</small></span><i>楼主</i></button>
        <p>公开页面目前无法访问。下面的楼层来自同一页面的本机缓存，不代表新的独立来源。</p>
        <footer><span>3.8万 次浏览</span><span>缓存楼层 {floors.length}</span></footer>
      </article>
      <div className="tieba-thread-filter"><b>全部回复</b><button data-testid="app-effective-action" onClick={onOnlyOwner}>{onlyOwner ? "查看全部" : "只看楼主"}</button></div>
      <section className="tieba-replies">
        {ordered.map((item) => {
          const floor = activeBody(state, item) as Floor;
          const content = <div>
            <header><button onClick={() => onAuthor(floor.author ?? "贴吧用户")}>{floor.author}</button><span>{floor.floor}楼</span></header>
            <p>{floor.text}</p>
            <footer><time>缓存记录</time><button onClick={() => onReplyText(`回复 ${floor.author}：`)}>回复</button></footer>
            {floor.cacheOnly && <small className="tieba-cache-only">仅本机缓存可见</small>}
          </div>;
          return <article className={`tieba-reply ${floor.cacheOnly ? "cache-floor" : ""}`} key={item.id}>
            <button className="tieba-reply-user" onClick={() => onAuthor(floor.author ?? "贴吧用户")}><img src={realisticInternetAvatar(floor.author ?? "贴吧用户", 112 + (Number(floor.floor ?? 0) % 8))} alt={`${floor.author ?? "贴吧用户"}头像`}/></button>
            {item.id === "forum.tieba.floor417"
              ? <div
                  className="tieba-cache-inspect"
                  data-testid="inspect-floor-417"
                  role="button"
                  tabIndex={0}
                  aria-label="检查缓存中的417楼"
                  onClick={(event)=>{
                    if (!(event.target as HTMLElement).closest("button")) onInspect417();
                  }}
                  onKeyDown={(event)=>{
                    if (event.key==="Enter"||event.key===" ") {
                      event.preventDefault();
                      onInspect417();
                    }
                  }}
                >{content}</div>
              : content}
          </article>;
        })}
        {customReplies.map((text, index) => <article className="tieba-reply mine" key={`custom-${index}`}><img src={identityAvatar("沈川")} alt="沈川头像"/><div><header><b>川流档案</b><span>新回复</span></header><p>{text}</p><footer><time>刚刚</time></footer></div></article>)}
      </section>
    </div>
    <TiebaThreadComposer saved={saved} text={replyText} onText={onReplyText} onReply={onReply} onSave={onSave} onShare={onShare}/>
    {shareOpen && <TiebaShareSheet onClose={onCloseShare} onAction={onShareAction}/>}
  </main>;
}

function TiebaThreadComposer({
  saved, text, onText, onReply, onSave, onShare
}: {
  saved: boolean;
  text: string;
  onText(value: string): void;
  onReply(): void;
  onSave(): void;
  onShare(): void;
}) {
  return <footer className="tieba-thread-composer">
    <input value={text} onChange={(event) => onText(event.target.value)} onKeyDown={(event) => {
      if (event.key === "Enter") onReply();
    }} placeholder="说点什么…"/>
    <button className={saved ? "active" : ""} aria-label={saved ? "取消收藏" : "收藏帖子"} onClick={onSave}>{saved ? "★" : "☆"}</button>
    <button aria-label="分享帖子" onClick={onShare}>↗</button>
    <button disabled={!text.trim()} onClick={onReply}>发送</button>
  </footer>;
}

function TiebaShareSheet({ onClose, onAction }: { onClose(): void; onAction(action: string): void }) {
  return <div className="tieba-sheet-backdrop" onClick={onClose}>
    <section className="tieba-share-sheet" onClick={(event) => event.stopPropagation()}>
      <header><b>分享帖子</b><button onClick={onClose}>取消</button></header>
      <div>{["微信好友", "朋友圈", "复制链接", "生成长图"].map((label) => <button key={label} onClick={() => onAction(label)}><span>{label.slice(0, 1)}</span><b>{label}</b></button>)}</div>
    </section>
  </div>;
}

function TiebaSearch({
  query, onQuery, onOpenPost, onOpenArchive, onOpenBar, historyHidden, onClearHistory
}: {
  query: string;
  onQuery(value: string): void;
  onOpenPost(id: string): void;
  onOpenArchive(): void;
  onOpenBar(bar: string): void;
  historyHidden: boolean;
  onClearHistory(): void;
}) {
  const normalized = query.trim().toLowerCase();
  const posts = ordinaryTiebaPosts.filter((post) => !normalized || `${post.title}${post.body.join("")}${post.bar}${post.author}`.toLowerCase().includes(normalized));
  const bars = followedTiebaBars.filter((bar) => !normalized || `${bar.name}${bar.description}`.toLowerCase().includes(normalized));
  const archiveKeywords = ["旧帖", "存档", "缓存", "417", "潘博文", "旧网页"];
  const archiveMatch = !normalized || archiveKeywords.some((keyword) => normalized.includes(keyword) || keyword.includes(normalized));
  return <main className="tieba-scroll tieba-search-page">
    <form onSubmit={(event) => event.preventDefault()}><span>⌕</span><input autoFocus value={query} onChange={(event) => onQuery(event.target.value)} placeholder="搜索帖子、吧或用户"/>{query && <button type="button" onClick={() => onQuery("")}>×</button>}</form>
    {!query && !historyHidden && <section className="tieba-search-history"><header><b>搜索历史</b><button onClick={onClearHistory}>清除</button></header>{["杭州雨天通勤", "移动硬盘索引", "旧网页缓存"].map((item) => <button key={item} onClick={() => onQuery(item)}>{item}</button>)}</section>}
    {!query && historyHidden && <p className="tieba-empty">暂无搜索历史</p>}
    {query && <section className="tieba-search-results">
      <h2>吧</h2>
      {bars.map((bar) => <button key={bar.name} onClick={() => onOpenBar(bar.name)}><span>{bar.name.slice(0, 1)}</span><div><b>{bar.name}</b><small>{bar.description}</small></div><i>进吧</i></button>)}
      <h2>帖子</h2>
      {archiveMatch && <button onClick={onOpenArchive}><div><b>旧帖存档对比：页面缺失前后的缓存差异</b><small>潘博文事件吧 · 本机缓存</small></div><i>›</i></button>}
      {posts.slice(0, 12).map((post) => <button key={post.id} onClick={() => onOpenPost(post.id)}><div><b>{post.title}</b><small>{post.bar} · {post.author}</small></div><i>›</i></button>)}
      {bars.length === 0 && posts.length === 0 && !archiveMatch && <p className="tieba-empty">没有找到相关内容</p>}
    </section>}
  </main>;
}

function TiebaMessages({ onOpenPost }: { onOpenPost(id: string): void }) {
  const [messageTab, setMessageTab] = useState("回复");
  const notices = [
    { title: "普通路过 回复了你的评论", detail: "这个方法很实用，周末试试。", postId: ordinaryTiebaPosts[2]!.id, time: "今天 09:18" },
    { title: "橙色文件夹 赞了你的回复", detail: "索引不要只放盘里。", postId: ordinaryTiebaPosts[11]!.id, time: "昨天 22:03" },
    { title: "摄影吧 有 3 条新动态", detail: "你关注的话题：原图备份", postId: ordinaryTiebaPosts[8]!.id, time: "昨天 17:40" },
    { title: "吧务通知", detail: "请勿在帖子中公开私人地址和门牌。", postId: ordinaryTiebaPosts[0]!.id, time: "7月13日" }
  ];
  return <main className="tieba-scroll tieba-message-page">
    <nav>{["回复", "赞", "关注", "通知"].map((label) => <button className={messageTab === label ? "active" : ""} key={label} onClick={() => setMessageTab(label)}>{label}</button>)}</nav>
    <section>{notices.filter((_, index) => messageTab === "回复" || index === ["回复", "赞", "关注", "通知"].indexOf(messageTab)).map((notice, index) => <button key={notice.title} onClick={() => onOpenPost(notice.postId)}>
      <span>{["回", "赞", "新", "务"][index]}</span><div><b>{notice.title}</b><p>{notice.detail}</p><time>{notice.time}</time></div><i>›</i>
    </button>)}</section>
  </main>;
}

function TiebaProfile({
  section, state, onSection, onOpenPost, onOpenFavorites, onEdit
}: {
  section: string;
  state: ReturnType<typeof useGame>["state"];
  onSection(value: string): void;
  onOpenPost(id: string): void;
  onOpenFavorites(): void;
  onEdit(): void;
}) {
  const history = state.world.flags["ui.tieba.selectedPost"];
  return <main className="tieba-scroll tieba-profile-page">
    <section className="tieba-profile-card"><img src={identityAvatar("沈川")} alt="川流档案头像"/><div><h1>川流档案</h1><p>吧龄 6.3 年 · 关注 12 个吧</p><small>记录普通生活，也记录文件从哪里来。</small></div><button onClick={onEdit}>编辑资料</button></section>
    <section className="tieba-profile-stats"><span><b>87</b>关注</span><span><b>316</b>粉丝</span><span><b>1,642</b>获赞</span></section>
    <nav className="tieba-profile-tabs">{["动态", "帖子", "回复"].map((label) => <button className={section === label ? "active" : ""} key={label} onClick={() => onSection(label)}>{label}</button>)}</nav>
    <section className="tieba-profile-actions">
      <button onClick={onOpenFavorites}><span>☆</span><b>我的收藏</b><i>›</i></button>
      <button onClick={() => typeof history === "string" && onOpenPost(history)} disabled={typeof history !== "string"}><span>时</span><b>浏览历史</b><i>›</i></button>
      <button onClick={() => onSection("关注的吧")}><span>吧</span><b>关注的吧</b><i>›</i></button>
      <button onClick={() => onSection("设置")}><span>设</span><b>设置</b><i>›</i></button>
    </section>
    <section className="tieba-profile-feed">
      <h2>{section}</h2>
      {section === "设置"
        ? ["隐私设置", "消息提醒", "字体大小", "青少年模式"].map((label) => <button key={label} onClick={() => onSection(`已打开：${label}`)}><b>{label}</b><i>›</i></button>)
        : section === "编辑资料"
          ? <form className="tieba-profile-edit" onSubmit={(event) => {
            event.preventDefault();
            onSection("资料已保存");
          }}><label>昵称<input defaultValue="川流档案"/></label><label>简介<textarea defaultValue="记录普通生活，也记录文件从哪里来。"/></label><button>保存</button></form>
          : section === "关注的吧"
            ? followedTiebaBars.map((bar) => <button key={bar.name} onClick={() => onSection(`已查看：${bar.name}`)}><b>{bar.name}</b><small>{bar.description}</small></button>)
        : ordinaryTiebaPosts.slice(0, 5).map((post) => <button key={post.id} onClick={() => onOpenPost(post.id)}><b>{post.title}</b><small>{post.bar} · {post.time}</small></button>)}
    </section>
  </main>;
}

function TiebaFavorites({ state, onOpenPost }: { state: ReturnType<typeof useGame>["state"]; onOpenPost(id: string): void }) {
  const [favoriteTab, setFavoriteTab] = useState("帖子");
  const savedIds = [archivePostId, ...ordinaryTiebaPosts.map((post) => post.id)].filter((id) => state.world.flags[`ui.tieba.saved.${id}`] === true);
  const defaultIds = ordinaryTiebaPosts.slice(1, 5).map((post) => post.id);
  const visible = [...new Set([...savedIds, ...defaultIds])];
  return <main className="tieba-scroll tieba-favorites-page">
    <nav>{["帖子", "吧", "视频"].map((label) => <button className={favoriteTab === label ? "active" : ""} key={label} onClick={() => setFavoriteTab(label)}>{label}</button>)}</nav>
    <section>{favoriteTab === "吧"
      ? followedTiebaBars.slice(0, 4).map((bar) => <article key={bar.name}><b>{bar.name}</b><small>{bar.description}</small></article>)
      : favoriteTab === "视频"
        ? ordinaryTiebaPosts.filter((post) => post.media).map((post) => <button key={post.id} onClick={() => onOpenPost(post.id)}><div><b>{post.title}</b><small>{post.bar} · 含图片</small></div><i>›</i></button>)
        : visible.map((id) => {
      const post = ordinaryTiebaPosts.find((item) => item.id === id);
      return <button key={id} onClick={() => onOpenPost(id)}><div><b>{post?.title ?? "旧帖存档对比：页面缺失前后的缓存差异"}</b><small>{post?.bar ?? "潘博文事件吧"} · 已收藏</small></div><i>›</i></button>;
    })}</section>
  </main>;
}

function TiebaUser({ author, state, onOpenPost }: { author: string; state: ReturnType<typeof useGame>["state"]; onOpenPost(id: string): void }) {
  const [userTab, setUserTab] = useState("动态");
  const posts = useMemo(() => ordinaryTiebaPosts.filter((post) => post.author === author || post.replies.some((reply) => reply.author === author)), [author]);
  const followed = state.world.flags[`ui.tieba.followedUser.${author}`] === true;
  const { setUiFlag, emit } = useGame();
  return <main className="tieba-scroll tieba-user-page">
    <section className="tieba-user-hero"><img src={realisticInternetAvatar(author)} alt={`${author}头像`}/><h1>{author}</h1><p>吧龄 {2 + author.length % 6}.{author.length % 9} 年 · 常逛摄影、城市生活与数码</p><button className={followed ? "followed" : ""} onClick={() => {
      setUiFlag(`tieba.followedUser.${author}`, !followed);
      emit("content.item.interacted", author, { action: "follow-user", active: !followed, source: "P" });
    }}>{followed ? "已关注" : "+ 关注"}</button></section>
    <nav className="tieba-user-tabs">{["动态", "帖子", "回复"].map((label) => <button className={userTab === label ? "active" : ""} key={label} onClick={() => setUserTab(label)}>{label}</button>)}</nav>
    <section className="tieba-user-feed">{posts.length ? posts.map((post) => <button key={post.id} onClick={() => onOpenPost(post.id)}><b>{userTab === "回复" && post.author !== author ? `回复了 ${post.author}` : post.title}</b><p>{userTab === "帖子" ? post.body[0] : `${author} 在 ${post.bar} 留下了一条公开动态。`}</p><small>{post.bar} · {post.time}</small></button>) : <p className="tieba-empty">这位用户暂时没有公开帖子</p>}</section>
  </main>;
}

function TiebaBottomNav({ active, onChange }: { active: TiebaView; onChange(view: TiebaView): void }) {
  const items: Array<{ label: string; view: TiebaView; icon: string }> = [
    { label: "首页", view: "home", icon: "⌂" },
    { label: "进吧", view: "bar", icon: "吧" },
    { label: "消息", view: "messages", icon: "◌" },
    { label: "我的", view: "profile", icon: "人" }
  ];
  return <nav className="tieba-bottom-nav" aria-label="百度贴吧底部导航">{items.map((item) => <button aria-current={active === item.view ? "page" : undefined} disabled={active === item.view} className={active === item.view ? "active" : ""} key={item.view} onClick={() => onChange(item.view)}><span>{item.icon}</span><b>{item.label}</b></button>)}</nav>;
}
