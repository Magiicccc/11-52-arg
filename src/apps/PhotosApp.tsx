import { useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, getContentItem, unlockedItemsForApp } from "@/content/selectors";
import { getPath } from "@/engine/path-utils";
import { assetUrl } from "@/lib/asset-url";

type Photo={title?:string;date?:string;src?:string;people?:number;peopleVisible?:number;facesDetected?:number;location?:string;caption?:string;frame?:number;description?:string};
type SiteSlot={slot:string;file:string;subject:string};
type SitePhotosBody={
  assetStatus:string;
  placeholderSrc:string;
  slots:SiteSlot[];
  metadata:{file:string;size:string;dateTimeOriginal:string;fileCreateDate:string;fileModifyDate:string;gps:string;device:string;hash:string};
};
type VideoBody={
  duration:number;
  placeholderSrc:string;
  assetStatus:string;
  created:string;
  modified:string;
  device:string;
  location:string;
  cues:{atMs:number;at:string;text:string}[];
  conclusion:string;
};
type SyncBody={familyAlbumCount?:number;familyPhotoCrop?:string};

export function PhotosApp(){
  const {state,activeDeviceId,emit}=useGame();
  const [selected,setSelected]=useState<string|null>(null);
  const [siteSlot,setSiteSlot]=useState<string|null>(null);
  const [selectMode,setSelectMode]=useState(false);
  const items=unlockedItemsForApp(state,"app.photos");
  const list=activeDeviceId==="player"?items.filter(i=>i.id.startsWith("photo.player")):items.filter(i=>i.id.startsWith("photo.shenchuan")||i.id.startsWith("video."));
  const item=list.find(i=>i.id===selected);
  const siteItem=getContentItem("a3.site.photos");
  const videoItem=getContentItem("a3.site.video");
  const syncItem=getContentItem("a3.player.sync");
  const siteUnlocked=state.content.unlockedContentIds.includes("a3.site.photos");
  const videoUnlocked=state.content.unlockedContentIds.includes("a3.site.video");

  if(selected==="a3.site.photos"&&siteItem){
    const body=activeBody(state,siteItem) as SitePhotosBody;
    const slot=body.slots.find(value=>value.slot===siteSlot);
    const inspected=Boolean(
      getPath(state,"world.flags.a3.photos.serviceDoor")===true
      && getPath(state,"world.flags.a3.photos.window")===true
      && getPath(state,"world.flags.a3.photos.bus")===true
    );
    if(slot) return <AppChrome title={slot.file} actions={<button onClick={()=>setSiteSlot(null)}>十二张</button>}>
      <div className="photo-detail">
        <img src={assetUrl(body.placeholderSrc)} alt={`${slot.slot} temporary placeholder`}/>
        <div className="photo-meta"><b>{slot.slot} · {slot.file}</b><span>{slot.subject}</span><strong>TEMPORARY · 正式现场媒体尚未交付</strong></div>
        {["P-A3-05","P-A3-06","P-A3-07"].includes(slot.slot)&&<button className="primary-action" data-testid={`inspect-${slot.slot}`} onClick={()=>emit("photo.site.difference.inspected",slot.slot,{file:slot.file})}>标记现场差异</button>}
      </div>
    </AppChrome>;
    return <AppChrome title="沈川现场照片" actions={<button onClick={()=>setSelected(null)}>所有照片</button>}>
      <section className="temporary-media-note"><b>12 个 TEMPORARY 槽位</b><span>仅复用仓库既有占位图；瑕疵不构成线索。</span></section>
      <div className="photo-grid a3-photo-grid">{body.slots.map(slotValue=><button data-testid={`site-photo-${slotValue.slot}`} key={slotValue.slot} onClick={()=>setSiteSlot(slotValue.slot)}><img src={assetUrl(body.placeholderSrc)} alt="temporary"/><span>{slotValue.slot}<br/>{slotValue.subject}</span></button>)}</div>
      {!state.story.completedSceneIds.includes("A3-03")&&<button className="primary-action" data-testid="confirm-site-photos" disabled={!inspected} onClick={()=>emit("photo.site.series.opened","a3.site.photos",{slots:12})}>确认三处现场差异</button>}
      {state.story.completedSceneIds.includes("A3-03")&&!state.story.completedSceneIds.includes("A3-04")&&<section className="metadata-sheet" data-testid="site-photo-metadata">
        <h3>{body.metadata.file}</h3>
        <dl>
          <div><dt>拍摄日期</dt><dd>{body.metadata.dateTimeOriginal}</dd></div>
          <div><dt>文件创建时间</dt><dd>{body.metadata.fileCreateDate}</dd></div>
          <div><dt>文件修改时间</dt><dd>{body.metadata.fileModifyDate}</dd></div>
          <div><dt>GPS</dt><dd>{body.metadata.gps}</dd></div>
          <div><dt>设备</dt><dd>{body.metadata.device}</dd></div>
          <div><dt>哈希状态</dt><dd>{body.metadata.hash}</dd></div>
        </dl>
        <button className="primary-action" data-testid="confirm-photo-metadata" onClick={()=>emit("photo.metadata.signature.confirmed",body.metadata.file,{fields:["capture","create","modify","gps","device","hash"]})}>确认 11:52 元数据签名</button>
      </section>}
    </AppChrome>;
  }

  if(selected==="a3.site.video"&&videoItem){
    const body=activeBody(state,videoItem) as VideoBody;
    const progress=Number(getPath(state,"world.flags.a3.video.progressMs")??0);
    const fallback=getPath(state,"world.flags.a3.videoFallbackUsed")===true;
    const next=body.cues.find(cue=>cue.atMs>progress);
    return <AppChrome title="现场视频 · 26.4秒" actions={<button onClick={()=>setSelected(null)}>所有照片</button>}>
      <div className="video-contract" data-testid="a3-site-video">
        <img src={assetUrl(body.placeholderSrc)} alt="temporary video placeholder"/>
        <div className="video-progress"><i style={{width:`${Math.min(100,progress/body.duration/10)}%`}}/><span>{(progress/1000).toFixed(progress===11520?2:0)} / {body.duration.toFixed(1)} 秒</span></div>
        <strong>TEMPORARY · 不显示人物正脸、身份或手机交付</strong>
        <ol className="video-cues">{body.cues.filter(cue=>fallback||cue.atMs<=progress).map(cue=><li key={cue.atMs}><time>{cue.at}</time><span>{cue.text}</span></li>)}</ol>
        {next&&<button className="primary-action" data-testid="advance-site-video" onClick={()=>emit("video.playback.progressed",`cue.${next.atMs}`,{atMs:next.atMs})}>播放到 {next.at}</button>}
        {!next&&!state.story.completedSceneIds.includes("A3-10")&&<button className="primary-action" data-testid="complete-site-video" onClick={()=>emit("video.playback.completed","a3.site.video",{duration:body.duration})}>播放至 26.4 秒并确认</button>}
        <button className="secondary-action" data-testid="video-load-fallback" onClick={()=>emit("video.fallback.opened","a3.site.video",{reason:"media-load-failed"})}>视频无法加载：显示时间轴替代</button>
        {(fallback||state.story.completedSceneIds.includes("A3-10"))&&<p className="video-conclusion">{body.conclusion}</p>}
      </div>
    </AppChrome>;
  }

  if(item){
    const b=activeBody(state,item) as Photo;
    return <AppChrome title={b.title??"照片"} actions={<button onClick={()=>setSelected(null)}>所有照片</button>}>
      <div className="photo-detail"><img src={assetUrl(b.src)} alt="临时剧情媒体"/><div className="photo-meta"><b>{b.date}</b><span>{b.location}</span>{b.facesDetected&&<strong>检测到 {b.facesDetected} 张人脸 · 画面可见 {b.peopleVisible}</strong>}{b.description&&<strong>{b.description}</strong>}</div>{item.id==="photo.shenchuan.group.01"&&!state.story.completedSceneIds.includes("A1-05")&&<button className="primary-action" data-testid="inspect-photo-face" onClick={()=>emit("photo.item.inspected",item.id,{panel:"people"})}>查看人物信息</button>}{item.id==="video.corridor.frame417"&&<button className="primary-action" onClick={()=>emit("video.frame.inspected",item.id,{frame:417})}>检查第417帧</button>}</div>
    </AppChrome>;
  }

  const sync=syncItem?activeBody(state,syncItem) as SyncBody:{};
  return <AppChrome title="照片" actions={<button data-testid="app-effective-action" onClick={()=>setSelectMode(v=>!v)}>{selectMode?"完成":"选择"}</button>}>
    {activeDeviceId==="player"&&state.story.completedSceneIds.includes("A3-09")&&<section className="album-sync-card" data-testid="player-album-eroded"><b>家庭相册 · {sync.familyAlbumCount} 张</b><span>{sync.familyPhotoCrop}</span></section>}
    <div className={`photo-grid ${selectMode?"select-mode":""}`}>{list.map(i=>{const b=activeBody(state,i) as Photo;return <button data-testid={`photo-${i.id}`} key={i.id} onClick={()=>setSelected(i.id)}><img src={assetUrl(b.src)} alt=""/><span>{b.title}</span></button>})}
      {activeDeviceId==="investigation"&&siteUnlocked&&<button data-testid="photo-a3.site.photos" onClick={()=>setSelected("a3.site.photos")}><img src={assetUrl("/media/case-001/placeholders/corridor-frame-417.svg")} alt="temporary"/><span>现场照片 · 12</span></button>}
      {activeDeviceId==="investigation"&&videoUnlocked&&<button data-testid="photo-a3.site.video" onClick={()=>setSelected("a3.site.video")}><img src={assetUrl("/media/case-001/placeholders/corridor-frame-417.svg")} alt="temporary"/><span>现场视频 · 26.4秒</span></button>}
    </div>
    {list.length===0&&!siteUnlocked&&!videoUnlocked&&<button className="empty-state" data-testid="app-effective-action">没有照片 · 点击刷新</button>}
  </AppChrome>;
}
