import { useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, unlockedItemsForApp } from "@/content/selectors";
type FileBody={name?:string,size?:string,content?:unknown};

export function FilesApp(){
  const {state,activeDeviceId,navigate,goBack}=useGame();
  const [browse,setBrowse]=useState(false);
  const items=unlockedItemsForApp(state,"app.files");
  const route=state.devices[activeDeviceId].appStack.at(-1)??"root";
  const selectedId=route.startsWith("file:")?route.slice(5):null;
  const item=items.find(i=>i.id===selectedId);

  if(item){
    const b=activeBody(state,item) as FileBody;
    return <AppChrome title={b.name??"文件"} actions={<button onClick={goBack}>完成</button>}>
      <pre className="json-file">{JSON.stringify(b.content,null,2)}</pre>
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
