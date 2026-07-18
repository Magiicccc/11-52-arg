import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useGame } from "@/app/GameContext";

type UtilityView = string;

function UtilityShell({
  appId,
  className,
  title,
  view,
  onBack,
  children,
  footer
}: {
  appId: string;
  className: string;
  title: string;
  view: UtilityView;
  onBack(): void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { goBack, emit }=useGame();
  const [showMore, setShowMore] = useState(false);
  return <div className={`app-window utility-app ${className}`} data-testid={`${appId.replace("app.","")}-${view}`}>
    <header className="utility-header">
      <button data-testid="app-back" aria-label={view==="home"?`退出${title}`:"返回"} onClick={view==="home"?goBack:onBack}>‹</button>
      <strong>{title}</strong>
      <button aria-label="更多" onClick={() => setShowMore((value) => !value)}>•••</button>
    </header>
    {showMore && <div className="utility-more-sheet">{["分享","帮助","设置"].map((action) => <button key={action} onClick={() => {
      emit("content.item.interacted", appId, { action, surface: view, source: "P" });
      setShowMore(false);
    }}>{action}</button>)}</div>}
    <div className="utility-scroll">{children}</div>
    {footer}
  </div>;
}

function Segmented({items,active,onChange}:{items:string[];active:string;onChange(value:string):void}) {
  return <nav className="utility-segmented">{items.map(item=><button className={active===item?"active":""} key={item} onClick={()=>onChange(item)}>{item}</button>)}</nav>;
}

function emitView(emit:ReturnType<typeof useGame>["emit"],appId:string,view:string) {
  emit("app.view.changed",appId,{view});
}

const calendarEvents=[
  {id:"calendar.daily.interview",date:"7月15日",time:"09:30",title:"用户访谈",note:"线上会议 · 提前十分钟检查录音"},
  {id:"calendar.daily.payment",date:"7月15日",time:"18:40",title:"缴水电费",note:"每月重复"},
  {id:"calendar.daily.birthday",date:"7月18日",time:"全天",title:"妈妈生日",note:"家庭日历"},
  {id:"calendar.meeting.20230917",date:"2023年9月17日",time:"15:20",title:"桥下咖啡",note:"2 位 · 历史日程"}
];
const firstCalendarEvent=calendarEvents[0]!;

export function CalendarApp() {
  const {emit}=useGame();
  const [view,setView]=useState("home");
  const [month,setMonth]=useState(7);
  const [selectedDay,setSelectedDay]=useState(15);
  const [selected,setSelected]=useState(firstCalendarEvent);
  const open=(event:typeof calendarEvents[number])=>{setSelected(event);setView("detail");emit("content.item.opened",event.id,{surface:"calendar"})};
  return <UtilityShell appId="app.calendar" className="calendar-real" title={view==="detail"?"日程详情":"日历"} view={view} onBack={()=>setView("home")}>
    {view==="home"?<>
      <div className="calendar-month-head"><button onClick={()=>{setMonth(value=>value===1?12:value-1);emit("app.calendar.month.changed","app.calendar",{direction:"previous",source:"P"})}}>‹</button><b>2026年{month}月</b><button onClick={()=>{setMonth(value=>value===12?1:value+1);emit("app.calendar.month.changed","app.calendar",{direction:"next",source:"P"})}}>›</button></div>
      <div className="calendar-weekdays">{["日","一","二","三","四","五","六"].map(day=><span key={day}>{day}</span>)}</div>
      <div className="calendar-month">{Array.from({length:35},(_,index)=>{const day=index-2;const outside=day<1||day>31;return <button disabled={outside} className={day===selectedDay?"selected":outside?"muted":""} key={index} onClick={()=>{setSelectedDay(day);emit("app.calendar.date.selected","app.calendar",{day,month,source:"P"})}}>{outside?"":day}</button>})}</div>
      <section className="calendar-agenda"><header><b>{month}月{selectedDay}日</b><button onClick={()=>{setSelected({id:"calendar.local.new",date:`${month}月${selectedDay}日`,time:"未定",title:"新日程",note:"本机草稿"});setView("detail");emit("content.item.created","app.calendar",{day:selectedDay,month,source:"P"})}}>＋</button></header>{calendarEvents.map((event,index)=><button data-testid={index===0?"app-effective-action":undefined} key={event.id} onClick={()=>open(event)}><time>{event.time}</time><i/><span><b>{event.title}</b><small>{event.note}</small></span></button>)}</section>
    </>:<article className="calendar-detail">
      <span className="calendar-color"/>
      <h1>{selected.title}</h1>
      <dl><div><dt>时间</dt><dd>{selected.date} {selected.time}</dd></div><div><dt>日历</dt><dd>个人</dd></div><div><dt>提醒</dt><dd>日程开始时</dd></div><div><dt>备注</dt><dd>{selected.note}</dd></div></dl>
      <button onClick={()=>emit("content.item.interacted",selected.id,{action:"reminder-toggled"})}>提醒我</button>
    </article>}
  </UtilityShell>;
}

const musicHistory=["雨停之后","夜路","城市更新：旧建筑如何被重新使用","照片整理与本地存档"];
export function NeteaseMusicApp() {
  const {emit}=useGame();
  const [view,setView]=useState("home");
  const [playing,setPlaying]=useState(false);
  const go=(next:string)=>{setView(next);emitView(emit,"app.netease_music",next)};
  return <UtilityShell appId="app.netease_music" className="music-real" title={view==="player"?"正在播放":view==="playlist"?"夜路":view==="history"?"最近播放":view==="podcast"?"播客":view==="me"?"我的音乐":view==="search"?"搜索":"网易云音乐"} view={view} onBack={()=>setView("home")} footer={view!=="player"?<nav className="music-nav"><button className={view==="home"?"active":""} onClick={()=>go("home")}>发现</button><button className={view==="podcast"?"active":""} onClick={()=>go("podcast")}>播客</button><button className={view==="me"?"active":""} onClick={()=>go("me")}>我的</button></nav>:undefined}>
    {view==="home"&&<>
      <header className="music-profile"><span>川</span><div><b>川流档案</b><small>黑胶会员</small></div><button onClick={()=>go("search")}>搜索</button></header>
      <section className="music-shortcuts"><button onClick={()=>go("playlist")} data-testid="app-effective-action"><i>歌</i><b>夜路</b><small>4 首</small></button><button onClick={()=>go("history")}><i>历</i><b>最近播放</b><small>87 首</small></button><button onClick={()=>go("podcast")}><i>播</i><b>播客</b><small>城市与记忆</small></button></section>
      <h2>为你推荐</h2><div className="music-cards">{musicHistory.map((track,index)=><button key={track} onClick={()=>{go("player");emit("content.item.opened",index===0?"music.track.01":"app.netease_music",{track})}}><span className={`music-cover tone-${index}`}/><b>{track}</b><small>{index<2?"独立音乐":"播客"}</small></button>)}</div>
    </>}
    {view==="playlist"&&<><div className="playlist-hero"><span>夜路</span><h1>夜路</h1><p>环境声、独立音乐与散步时听的节目</p><button onClick={()=>go("player")}>▶ 播放全部</button></div><div className="track-list">{musicHistory.map((track,index)=><button key={track} onClick={()=>{go("player");emit("content.item.opened","app.netease_music",{track})}}><span>{index+1}</span><div><b>{track}</b><small>{index<2?"川流档案":"城市播客"}</small></div><i>•••</i></button>)}</div></>}
    {view==="history"&&<div className="history-list"><p>最近播放 · 87 首</p>{musicHistory.map((track,index)=><button key={track} onClick={()=>go("player")}><span>{index+1}</span><b>{track}</b><small>{index===0?"今天":"本周"}</small></button>)}</div>}
    {view==="player"&&<section className="music-player"><div className="record-art"><i/></div><h1>雨停之后</h1><p>川流档案</p><input aria-label="播放进度" type="range" min="0" max="100" defaultValue="38"/><div><button onClick={()=>emit("content.item.interacted","music.track.01",{action:"previous",source:"P"})}>上一首</button><button className="play" onClick={()=>{setPlaying(value=>!value);emit("content.item.interacted","music.track.01",{action:"playback",playing:!playing})}}>{playing?"Ⅱ":"▶"}</button><button onClick={()=>emit("content.item.interacted","music.track.01",{action:"next",source:"P"})}>下一首</button></div><button onClick={()=>go("history")}>查看播放历史</button></section>}
    {view==="podcast"&&<section className="history-list"><p>订阅的播客</p>{["城市与记忆","网页保存研究","摄影散步"].map((title,index)=><button key={title} onClick={()=>{go("player");emit("content.item.opened","app.netease_music",{surface:"podcast",title,index,source:"P"})}}><span>{index+1}</span><b>{title}</b><small>本周更新</small></button>)}</section>}
    {view==="me"&&<section className="history-list"><p>我的音乐</p>{["本地与下载","云盘","收藏的歌单","已购"].map((title,index)=><button key={title} onClick={()=>emit("content.item.interacted","app.netease_music",{surface:"me",title,index,source:"P"})}><span>{index+1}</span><b>{title}</b><small>›</small></button>)}</section>}
    {view==="search"&&<section className="history-list"><input autoFocus placeholder="搜索音乐、播客"/>{musicHistory.map((title,index)=><button key={title} onClick={()=>{go("player");emit("app.search.submitted","app.netease_music",{query:title,index,source:"P"})}}><span>⌕</span><b>{title}</b><small>搜索结果</small></button>)}</section>}
  </UtilityShell>;
}

const readingBooks=["档案整理方法","数字记忆研究","城市观察手册","网页保存与版本","摄影笔记"];
export function WechatReadingApp() {
  const {emit,state,setUiFlag}=useGame();
  const [view,setView]=useState("home");
  const progress=Number(state.world.flags["ui.wechatReading.progress"]??31);
  const go=(next:string)=>{setView(next);emitView(emit,"app.wechat_reading",next)};
  return <UtilityShell appId="app.wechat_reading" className="reading-real" title={view==="reader"?"档案整理方法":view==="notes"?"划线与批注":view==="audio"?"听书":view==="discover"?"发现":view==="me"?"我":view==="search"?"搜索":"微信读书"} view={view} onBack={()=>setView("home")} footer={["home","audio","discover","me"].includes(view)?<nav className="reading-nav"><button className={view==="home"?"active":""} onClick={()=>go("home")}>书架</button><button className={view==="audio"?"active":""} onClick={()=>go("audio")}>听书</button><button className={view==="discover"?"active":""} onClick={()=>go("discover")}>发现</button><button className={view==="me"?"active":""} onClick={()=>go("me")}>我</button></nav>:undefined}>
    {view==="home"&&<><header className="reading-head"><h1>书架</h1><button onClick={()=>go("search")}>搜索</button></header><div className="reading-summary"><b>9 本书</b><span>本周阅读 2小时16分</span></div><div className="bookshelf">{readingBooks.map((book,index)=><button data-testid={index===0?"app-effective-action":undefined} key={book} onClick={()=>{go("reader");emit("content.item.opened","reading.book.01",{book})}}><span className={`book-cover tone-${index}`}>{book.slice(0,4)}</span><b>{book}</b><small>{index===0?`${progress}%`:"未读"}</small></button>)}</div></>}
    {view==="reader"&&<article className="reader-page"><header><span>第三章</span><b>记录与整理</b></header><h1>记录不是记忆本身</h1><p>整理不是保存，整理只是决定以后先忘哪一部分。</p><p className="highlight">记录不是记忆本身，只是记忆留下的接口。</p><p>一份材料的价值，不只在它写了什么，也在于它从哪里来、经过了哪些修改。</p><footer><button onClick={()=>go("notes")}>批注</button><input aria-label="阅读进度" type="range" min="0" max="100" value={progress} onChange={event=>setUiFlag("wechatReading.progress",Number(event.target.value))}/><span>{progress}%</span></footer></article>}
    {view==="notes"&&<section className="reading-notes"><h2>我的划线</h2><blockquote>“记录不是记忆本身，只是记忆留下的接口。”</blockquote><p>同源副本不能算第二个证人。</p><button onClick={()=>emit("content.item.interacted","reading.book.01",{action:"annotation-saved"})}>保存批注</button></section>}
    {view==="audio"&&<section className="reading-notes"><h2>听书</h2>{readingBooks.slice(0,4).map((book,index)=><button key={book} onClick={()=>emit("content.item.interacted","reading.book.01",{action:"audio-play",book,index,source:"P"})}>▶ {book} · 第 {index+1} 章</button>)}</section>}
    {view==="discover"&&<section className="reading-notes"><h2>发现</h2>{["本周热门非虚构","城市观察书单","数字生活专题","摄影与档案"].map((title,index)=><button key={title} onClick={()=>emit("content.item.opened","app.wechat_reading",{surface:"discover",title,index,source:"P"})}>{title}</button>)}</section>}
    {view==="me"&&<section className="reading-notes"><h2>阅读账户</h2>{["阅读时长 126 小时","笔记 38 条","书单 6 个","设置"].map((title,index)=><button key={title} onClick={()=>emit("content.item.interacted","app.wechat_reading",{surface:"me",title,index,source:"P"})}>{title}</button>)}</section>}
    {view==="search"&&<section className="reading-notes"><input autoFocus placeholder="搜索书名或作者"/>{readingBooks.map((book,index)=><button key={book} onClick={()=>{go("reader");emit("app.search.submitted","app.wechat_reading",{query:book,index,source:"P"})}}>{book}</button>)}</section>}
  </UtilityShell>;
}

export function Railway12306App() {
  const {emit,setUiFlag}=useGame();
  const [view,setView]=useState("home");
  const go=(next:string)=>{setView(next);emitView(emit,"app.railway12306",next)};
  return <UtilityShell appId="app.railway12306" className="rail-real" title={view==="order"?"订单详情":view==="trips"?"我的行程":view==="passenger"?"乘车人":view==="profile"?"我的12306":"铁路12306"} view={view} onBack={()=>setView("home")} footer={view==="home"?<nav className="rail-nav"><button className="active" onClick={()=>go("home")}>首页</button><button onClick={()=>go("trips")}>行程</button><button onClick={()=>go("order")}>订单</button><button onClick={()=>go("profile")}>我的</button></nav>:undefined}>
    {view==="home"&&<><header className="rail-hero"><span>铁路出行服务</span><b>火车票</b></header><section className="rail-query"><div><button onClick={()=>setUiFlag("railway.city.from","天津")}>天津</button><i>⇄</i><button onClick={()=>setUiFlag("railway.city.to","杭州")}>杭州</button></div><p>7月18日 周六</p><button onClick={()=>emit("app.search.submitted","app.railway12306",{type:"train"})}>查询车票</button></section><div className="rail-tools">{["车站大屏","乘车人","正晚点","温馨服务"].map((label,index)=><button key={label} onClick={()=>{if(index===1)go("passenger");else{setUiFlag("railway.tool",label);emit("content.item.interacted","app.railway12306",{surface:"tools",label,source:"P"})}}}><i>{label.slice(0,1)}</i>{label}</button>)}</div><section className="rail-current"><h2>我的行程</h2><button data-testid="app-effective-action" onClick={()=>go("order")}><small>历史订单 · 已完成</small><b>上海虹桥 → 杭州东</b><span>2023年9月17日 · 2位</span></button></section></>}
    {view==="trips"&&<section className="rail-trips"><h1>历史行程</h1><button onClick={()=>go("order")}><b>上海虹桥 → 杭州东</b><span>2023年9月17日</span><small>已完成</small></button><p>暂无未出行订单</p></section>}
    {view==="order"&&<article className="rail-order"><span>已完成</span><h1>上海虹桥 → 杭州东</h1><div><b>2023年9月17日</b><small>乘车人 2 位</small></div><dl><div><dt>订单状态</dt><dd>已完成</dd></div><div><dt>行程备注</dt><dd>桥下咖啡 · 2位</dd></div></dl><button onClick={()=>go("passenger")}>查看乘车人</button></article>}
    {view==="passenger"&&<section className="rail-passengers"><h2>乘车人</h2><button onClick={()=>emit("content.item.opened","railway.passenger.shen",{source:"P"})}><span>沈</span><div><b>沈川</b><small>成人 · 已核验</small></div></button><button onClick={()=>emit("content.item.opened","railway.passenger.self",{source:"P"})}><span>我</span><div><b>本人</b><small>成人 · 已核验</small></div></button></section>}
    {view==="profile"&&<section className="rail-passengers"><h2>我的12306</h2>{["乘车人","我的保险","出行向导","温馨服务","设置"].map(label=><button key={label} onClick={()=>label==="乘车人"?go("passenger"):emit("content.item.interacted","app.railway12306",{surface:"profile",label,source:"P"})}><span>{label.slice(0,1)}</span><div><b>{label}</b><small>›</small></div></button>)}</section>}
  </UtilityShell>;
}

export function HealthApp() {
  const {emit}=useGame();
  const [view,setView]=useState("home");
  const [range,setRange]=useState("周");
  return <UtilityShell appId="app.health" className="health-real" title={view==="detail"?"步数":"摘要"} view={view} onBack={()=>setView("home")}>
    {view==="home"?<><header className="health-head"><h1>摘要</h1><span>沈</span></header><p className="health-date">今天 · 7月15日</p><section className="health-card"><header><b>活动</b><span>09:41 ›</span></header><div><strong>18,432</strong><small>步</small><i className="activity-rings"/></div><p>距离 12.4 公里</p><button data-testid="app-effective-action" onClick={()=>{setView("detail");emit("content.item.opened","health.steps.01",{surface:"health"})}}>显示全部健康数据</button></section><section className="health-card"><header><b>睡眠</b><span>今天 ›</span></header><strong>7小时18分</strong><p>过去 7 天平均</p></section><section className="health-card"><header><b>趋势</b><span>›</span></header><p>过去 30 天的步数保持稳定</p></section></>:<section className="health-detail"><Segmented items={["周","月","6个月","年"]} active={range} onChange={value=>{setRange(value);emit("app.health.range.changed","health.steps.01",{range:value})}}/><h1>18,432 步</h1><p>7月15日</p><div className="health-chart">{[42,55,35,68,73,61,88].map((height,index)=><i key={index} style={{height:`${height}%`}}/>)}</div><dl><div><dt>日均</dt><dd>12,806 步</dd></div><div><dt>30日趋势</dt><dd>稳定</dd></div></dl></section>}
  </UtilityShell>;
}

const hourly=["现在 33°","14时 33°","15时 32°","16时 31°","17时 30°","18时 29°"];
const forecast=["今天 27° / 33°","周四 26° / 32°","周五 25° / 31°","周六 26° / 34°","周日 27° / 35°","周一 26° / 33°","周二 25° / 31°"];
export function WeatherApp() {
  const {emit,setUiFlag}=useGame();
  const [view,setView]=useState("home");
  return <UtilityShell appId="app.weather" className="weather-real" title={view==="cities"?"地点":"杭州"} view={view} onBack={()=>setView("home")}>
    {view==="home"?<div className="weather-page"><header><button onClick={()=>setView("cities")}>地点</button><span>我的位置</span></header><h1>33°</h1><p>阵雨 · 最高33° 最低27°</p><section><b>未来一小时可能有阵雨</b><div className="hourly">{hourly.map(value=><span key={value}>{value}</span>)}</div></section><section><b>7日天气预报</b>{forecast.map((value,index)=><button data-testid={index===0?"app-effective-action":undefined} key={value} onClick={()=>emit("content.item.opened","weather.forecast.01",{day:index})}><span>{value.split(" ")[0]}</span><i>{index%3===0?"阵雨":"多云"}</i><strong>{value.slice(3)}</strong></button>)}</section></div>:<section className="weather-cities"><h1>天气</h1><input placeholder="搜索城市"/><button onClick={()=>{setUiFlag("weather.city","杭州");setView("home")}}><div><b>我的位置</b><span>杭州 · 阵雨</span></div><strong>33°</strong></button><button onClick={()=>{setUiFlag("weather.city","天津");emit("app.view.changed","app.weather",{view:"天津",source:"P"});setView("home")}}><div><b>天津</b><span>多云</span></div><strong>31°</strong></button></section>}
  </UtilityShell>;
}

export function ClockApp() {
  const {emit,state,setUiFlag}=useGame();
  const [tab,setTab]=useState("闹钟");
  const [running,setRunning]=useState(false);
  const [seconds,setSeconds]=useState(0);
  useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSeconds(value=>value+1),1000);return()=>window.clearInterval(id)},[running]);
  const alarms=[["07:20","工作日"],["08:10","周末"],["09:30","访谈提醒"],["18:40","缴费提醒"],["22:30","准备休息"]];
  return <UtilityShell appId="app.clock" className="clock-real" title={tab} view="home" onBack={()=>undefined} footer={<nav className="clock-tabs">{["世界时钟","闹钟","秒表","计时器"].map(item=><button className={tab===item?"active":""} key={item} onClick={()=>{setTab(item);emitView(emit,"app.clock",item)}}>{item}</button>)}</nav>}>
    {tab==="世界时钟"&&<section className="world-clocks"><h1>世界时钟</h1><button onClick={()=>emit("content.item.opened","clock.world.tianjin",{source:"P"})}><b>天津</b><strong>15:52</strong><small>今天</small></button><button onClick={()=>emit("content.item.opened","clock.world.hangzhou",{source:"P"})}><b>杭州</b><strong>15:52</strong><small>今天</small></button></section>}
    {tab==="闹钟"&&<section className="alarm-list"><header><button onClick={()=>setUiFlag("clock.editing",true)}>编辑</button><h1>闹钟</h1><button onClick={()=>{setUiFlag("clock.newAlarm",{time:"06:30",label:"新闹钟"});emit("content.item.created","clock.alarm.01",{source:"P"})}}>＋</button></header>{alarms.map(([time,label],index)=>{const active=state.world.flags[`ui.clock.alarm.${index}`]!==false;return <button data-testid={index===0?"app-effective-action":undefined} key={time} onClick={()=>{setUiFlag(`clock.alarm.${index}`,!active);emit("content.item.interacted","clock.alarm.01",{index,active:!active})}}><div><strong>{time}</strong><span>{label}</span></div><i className={active?"on":""}/></button>})}</section>}
    {tab==="秒表"&&<section className="stopwatch"><output>{new Date(seconds*1000).toISOString().slice(14,19)}.<small>{String(seconds%100).padStart(2,"0")}</small></output><div><button onClick={()=>{setRunning(false);setSeconds(0)}}>复位</button><button className={running?"stop":""} onClick={()=>{setRunning(value=>!value);emit("app.tool.used","app.clock",{tool:"stopwatch",running:!running})}}>{running?"停止":"启动"}</button></div><p>计次</p></section>}
    {tab==="计时器"&&<section className="timer"><div><strong>00</strong><span>小时</span><strong>10</strong><span>分钟</span><strong>00</strong><span>秒</span></div><button onClick={()=>{setRunning(value=>!value);emit("app.tool.used","app.clock",{tool:"timer",running:!running})}}>{running?"暂停":"启动"}</button></section>}
  </UtilityShell>;
}

export function CameraApp() {
  const {emit}=useGame();
  const [mode,setMode]=useState("照片");
  const [captured,setCaptured]=useState(false);
  return <UtilityShell appId="app.camera" className="camera-real" title="相机" view="home" onBack={()=>undefined}>
    <div className={`camera-viewfinder ${captured?"captured":""}`}><span>游戏内取景</span><i/><div className="camera-focus"/></div>
    <div className="camera-modes">{["慢动作","视频","照片","人像"].map(item=><button className={mode===item?"active":""} key={item} onClick={()=>{setMode(item);emitView(emit,"app.camera",item)}}>{item}</button>)}</div>
    <div className="camera-controls"><button className="recent" onClick={()=>emit("app.view.changed","app.photos",{source:"camera"})}>最近照片</button><button className="shutter" data-testid="app-effective-action" aria-label="快门" onClick={()=>{setCaptured(value=>!value);emit("app.tool.used","app.camera",{mode,action:"capture"})}}/><button className="switch" onClick={()=>emit("app.tool.used","app.camera",{action:"switch-camera"})}>翻转</button></div>
  </UtilityShell>;
}

const memoItems:[string,string][]=[["雨声_0703","00:48"],["访谈提纲口述","02:16"],["通勤备忘","00:31"]];
const firstMemo=memoItems[0]!;
export function VoiceMemosApp() {
  const {emit,setUiFlag}=useGame();
  const [view,setView]=useState("home");
  const [selected,setSelected]=useState<[string,string]>(firstMemo);
  const [recording,setRecording]=useState(false);
  const [playing,setPlaying]=useState(false);
  return <UtilityShell appId="app.voice_memos" className="memos-real" title={view==="detail"?selected[0]:view==="record"?"新录音":"语音备忘录"} view={view} onBack={()=>setView("home")}>
    {view==="home"&&<><header className="memos-head"><button onClick={()=>setUiFlag("voiceMemos.editing",true)}>编辑</button><h1>所有录音</h1><button onClick={()=>setUiFlag("voiceMemos.folder","所有录音")}>文件夹</button></header><div className="memo-list">{memoItems.map((memo,index)=><button data-testid={index===0?"app-effective-action":undefined} key={memo[0]} onClick={()=>{setSelected(memo);setView("detail");emit("content.item.opened","voice.memo.01",{name:memo[0]})}}><b>{memo[0]}</b><span>7月{index+3}日</span><small>{memo[1]}</small></button>)}</div><button className="record-button" onClick={()=>setView("record")} aria-label="新录音"/></>}
    {view==="detail"&&<section className="memo-detail"><div className="memo-wave">{Array.from({length:44},(_,index)=><i key={index} style={{height:`${8+(index*13)%46}px`}}/>)}</div><output>{selected[1]}</output><div><button onClick={()=>emit("content.item.interacted","voice.memo.01",{action:"skip-back",seconds:15,source:"P"})}>−15</button><button onClick={()=>{setPlaying(value=>!value);emit("content.item.interacted","voice.memo.01",{action:"playback",playing:!playing})}}>{playing?"Ⅱ":"▶"}</button><button onClick={()=>emit("content.item.interacted","voice.memo.01",{action:"skip-forward",seconds:15,source:"P"})}>＋15</button></div><button onClick={()=>setView("record")}>新录音</button></section>}
    {view==="record"&&<section className="memo-detail recording"><div className="memo-wave">{Array.from({length:44},(_,index)=><i key={index} style={{height:`${10+(index*17)%52}px`}}/>)}</div><output>{recording?"00:07.00":"00:00.00"}</output><button className="record-button" onClick={()=>{setRecording(value=>!value);emit("app.tool.used","app.voice_memos",{action:recording?"stop":"record"})}} aria-label={recording?"停止录音":"开始录音"}/></section>}
  </UtilityShell>;
}

export function CompassApp() {
  const {emit}=useGame();
  const [heading,setHeading]=useState(270);
  const cardinal=heading>=225&&heading<315?"西":heading>=135?"南":heading>=45?"东":"北";
  return <UtilityShell appId="app.compass" className="compass-real" title="指南针" view="home" onBack={()=>undefined}>
    <section className="compass-page">
      <div className="compass-dial" style={{transform:`rotate(${-heading}deg)`}}><i/><span className="north" style={{transform:`rotate(${heading}deg)`}}>北</span><span className="east" style={{transform:`rotate(${heading}deg)`}}>东</span><span className="south" style={{transform:`rotate(${heading}deg)`}}>南</span><span className="west" style={{transform:`rotate(${heading}deg)`}}>西</span></div>
      <output>{heading}° {cardinal}</output>
      <p>位置不可用 · 海拔 --</p>
      <input data-testid="app-effective-action" aria-label="旋转设备" type="range" min="0" max="359" value={heading} onChange={event=>{const value=Number(event.target.value);setHeading(value);emit("app.tool.used","app.compass",{heading:value,source:"device-simulation"})}}/>
      <small>拖动以模拟设备旋转。未绑定现实地点。</small>
    </section>
  </UtilityShell>;
}
