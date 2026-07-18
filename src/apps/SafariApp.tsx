import { useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { assetUrl } from "@/lib/asset-url";

export function SafariApp(){
  const {state,emit}=useGame();
  const [query,setQuery]=useState("");
  const [page,setPage]=useState("start");
  const [answer,setAnswer]=useState("");
  const solved=state.story.completedSceneIds.includes("A2-06");

  const search=(value:string)=>{
    const next=value.trim();
    setQuery(next);
    if(next.includes("摩斯")){
      setPage("morse");
      if(state.content.unlockedContentIds.includes("page.morse.guide")) emit("knowledge.page.opened","page.morse.guide",{query:next});
      return;
    }
    setPage("results");
    if(next.includes("潘博文")) emit("browser.search.submitted","page.zhihu.deleted.01",{query:next});
  };

  const openDeleted=()=>{
    setPage("deleted");
    emit("browser.page.opened","page.zhihu.deleted.01",{status:404});
  };
  const openCache=()=>{
    setPage("cache");
    emit("browser.cache.opened","audio.carrier.01",{archivedAt:"2021-04-18"});
  };
  const openMorse=()=>{
    setPage("morse");
    emit("knowledge.page.opened","page.morse.guide",{from:"cache_417"});
  };
  const submit=()=>{
    if(answer.toUpperCase().replace(/[^A-Z0-9]/g,"")==="FRAME417"){
      emit("puzzle.answer.accepted","puzzle.morse.frame417",{answer});
      setPage("video");
    }
  };

  return <AppChrome title="Safari" actions={<button onClick={()=>{setPage(current=>current==="tabs"?"start":"tabs");emit("app.view.changed","app.safari",{view:"tabs",source:"P"})}}>标签页</button>}>
    <div className="safari-shell">
      <div className="address-bar">{page==="start"?"搜索或输入网站名称":page}</div>
      {page==="tabs"&&<section className="safari-tabs-page"><h2>标签页</h2><button onClick={()=>setPage("start")}><b>起始页</b><span>搜索或输入网站名称</span></button><button onClick={()=>setPage("results")}><b>搜索结果</b><span>{query||"最近搜索"}</span></button><button onClick={()=>{setQuery("");setPage("start");emit("content.item.created","app.safari",{surface:"new-tab",source:"P"})}}>＋ 新建标签页</button></section>}
      {page==="start"&&<>
        <form className="browser-search" onSubmit={e=>{e.preventDefault();search(query)}}>
          <input data-testid="safari-search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索互联网"/>
          <button data-testid="safari-search-submit">搜索</button>
        </form>
        <div className="favorites">
          <button data-testid="app-effective-action" onClick={()=>search("潘博文")}>潘博文</button>
          <button onClick={()=>search("摩斯密码")}>摩斯密码</button>
        </div>
      </>}
      {page==="results"&&<div className="web-results" data-testid="safari-results">
        <p>找到与“{query||"潘博文"}”相关的结果</p>
        <button data-testid="open-deleted-answer" onClick={openDeleted}><b>知乎：如果你记得那个人，如何验证自己没有记错？</b><span>该回答当前不可用</span></button>
        <button onClick={()=>setPage("public")}><b>网络热传的潘博文事件整理</b><span>公开叙事与后续讨论</span></button>
      </div>}
      {page==="public"&&<article className="web-article"><h2>潘博文事件</h2><p>2013年4月25日，一名学生进入地下通道后被所有人遗忘。公开页面同时包含相信、质疑和幻想伙伴解释。</p><button onClick={openDeleted}>查看一个已删除回答</button></article>}
      {page==="deleted"&&<div className="error-page" data-testid="deleted-answer"><h1>404</h1><p>你访问的回答不存在。</p><button className="archive-link" data-testid="open-cache-417" onClick={openCache}>Last archived: 2021-04-18</button></div>}
      {page==="cache"&&<article className="cache-page" data-testid="cache-417"><h2>cache_417</h2><p>旧雨17保存的本地缓存。音频只有点划声：</p><pre>..-. .-. .- -- . / ....- .---- --...</pre><button data-testid="open-morse-guide" onClick={openMorse}>打开摩斯密码知识页</button><label>解码结果<input data-testid="morse-answer" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="输入英文与数字"/></label><button className="primary-action" data-testid="submit-morse-answer" onClick={submit}>验证</button></article>}
      {page==="morse"&&<article className="web-article" data-testid="morse-guide"><h2>摩斯密码</h2><p>点（·）、划（—）和间隔构成字母与数字。</p><div className="morse-table"><span>F ··—·</span><span>R ·—·</span><span>A ·—</span><span>M ——</span><span>E ·</span><span>4 ····—</span><span>1 ·————</span><span>7 ——···</span></div><button onClick={()=>setPage("cache")}>返回缓存页</button></article>}
      {page==="video"&&<div className="video-page" data-testid="frame-417-page"><img src={assetUrl("/media/case-001/placeholders/corridor-frame-417.svg")} alt="第417帧"/><b>第 417 帧</b><p>服务门旁出现手持钥匙的人影。</p><button className="primary-action" data-testid="inspect-frame-417" onClick={()=>emit("video.frame.inspected","video.corridor.frame417",{frame:417})}>检查这一帧</button>{solved&&<small>FRAME 417 已记录</small>}</div>}
    </div>
  </AppChrome>;
}
