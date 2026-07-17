import { useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, unlockedItemsForApp } from "@/content/selectors";
import { coordinateSources, validateCoordinateAssembly } from "@/a3/coordinate-assembly";
import { isQaMode } from "@/lib/qa-mode";
type FileBody={name?:string,size?:string,content?:unknown};

export function FilesApp(){
  const {state,activeDeviceId,navigate,goBack,emit}=useGame();
  const [browse,setBrowse]=useState(false);
  const [latitudeSource,setLatitudeSource]=useState("");
  const [longitudeTailSource,setLongitudeTailSource]=useState("");
  const [directionSource,setDirectionSource]=useState("");
  const [assemblyError,setAssemblyError]=useState(false);
  const qaMode=isQaMode();
  const items=unlockedItemsForApp(state,"app.files");
  const route=state.devices[activeDeviceId].appStack.at(-1)??"root";
  const selectedId=route.startsWith("file:")?route.slice(5):null;
  const item=items.find(i=>i.id===selectedId);

  if(item){
    const b=activeBody(state,item) as FileBody;
    const a2Ready=state.story.currentSceneId==="A2-11"||state.story.completedSceneIds.includes("A2-11");
    const a3Started=state.story.currentSceneId==="A3-01"||state.story.completedSceneIds.includes("A3-01");
    const choose=(setter:(value:string)=>void,value:string)=>{
      setter(value);
      if(value) emit("coordinate.source.inspected",value,{workbench:"PZ-010"});
    };
    const submitAssembly=()=>{
      const accepted=validateCoordinateAssembly({latitudeSource,longitudeTailSource,directionSource});
      setAssemblyError(!accepted);
      emit(accepted?"coordinates.assembled":"coordinates.assembly.rejected",accepted?"LOC_RIVER_EDU_OLD_01":"PZ-010",{latitudeSource,longitudeTailSource,directionSource});
    };
    return <AppChrome title={b.name??"文件"} actions={<button onClick={goBack}>完成</button>}>
      <pre className="json-file">{JSON.stringify(b.content,null,2)}</pre>
      {item.id==="file.417_index"&&a2Ready&&!a3Started&&<button className="primary-action" data-testid="start-a3-coordinate" onClick={()=>emit("a3.coordinate.started","a3.coordinate.case",{from:"A2-11"})}>组合三个来源的坐标</button>}
      {item.id==="file.417_index"&&a3Started&&!state.story.completedSceneIds.includes("A3-01")&&<section className="coordinate-workbench" data-testid="coordinate-workbench">
        <header><b>组合坐标</b>{qaMode&&<small>A3-01 · REFERENCE-GAP · 不显示或猜测真实经纬度</small>}</header>
        <label>纬度主体来源<select data-testid="coordinate-latitude" value={latitudeSource} onChange={event=>choose(setLatitudeSource,event.target.value)}><option value="">请选择</option>{coordinateSources.map(source=><option key={source.value} value={source.value}>{source.label}</option>)}</select></label>
        <label>经度末位来源<select data-testid="coordinate-longitude" value={longitudeTailSource} onChange={event=>choose(setLongitudeTailSource,event.target.value)}><option value="">请选择</option>{coordinateSources.map(source=><option key={source.value} value={source.value}>{source.label}</option>)}</select></label>
        <label>方向与末两位来源<select data-testid="coordinate-direction" value={directionSource} onChange={event=>choose(setDirectionSource,event.target.value)}><option value="">请选择</option>{coordinateSources.map(source=><option key={source.value} value={source.value}>{source.label}</option>)}</select></label>
        <p>半径：80 米 · 校验序列：4-1-7{qaMode&&" · 输出：LOC_RIVER_EDU_OLD_01"}</p>
        {assemblyError&&<strong data-testid="coordinate-error">来源槽位不匹配，请重新核对 EXIF、论坛原图与通话/号码残片。</strong>}
        <button className="primary-action" data-testid="submit-coordinate" onClick={submitAssembly}>验证组合</button>
      </section>}
      {item.id==="file.417_index"&&state.story.completedSceneIds.includes("A3-01")&&<section className="reference-gap-card" data-testid="coordinate-result"><b>{qaMode?"LOC_RIVER_EDU_OLD_01":"坐标组合已保存"}</b>{qaMode&&<span>生产令牌已建立；现实地点仍未绑定。</span>}</section>}
    </AppChrome>;
  }

  return <AppChrome title="文件">
    <button className="file-toolbar" data-testid="app-effective-action" onClick={()=>setBrowse(v=>!v)}>{browse?"浏览 · iCloud云盘":"最近项目 · 浏览"}</button>
    <div className="list">{items.map(i=>{
      const b=activeBody(state,i) as FileBody;
      return <button className="list-row" data-testid={`file-${i.id}`} key={i.id} onClick={()=>navigate(`file:${i.id}`)}>
        <span className="file-icon">JSON</span><span><b>{b.name}</b><small>{b.size}</small></span>
      </button>;
    })}{items.length===0&&<div className="empty-state">最近没有文件</div>}</div>
  </AppChrome>;
}
