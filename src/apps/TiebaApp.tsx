import { useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";
import { activeBody, unlockedItemsForApp } from "@/content/selectors";
import { generatedAvatar } from "@/content/avatar-assets";

type Floor={floor?:number,author?:string,text?:string,cacheOnly?:boolean};

export function TiebaApp(){
  const {state,emit}=useGame();
  const [onlyOwner,setOnlyOwner]=useState(false);
  const floors=unlockedItemsForApp(state,"app.tieba");
  const shown=onlyOwner?floors.filter(i=>(activeBody(state,i) as Floor).author==="楼主"):floors;
  return <AppChrome title="潘博文事件吧">
    <div className="tieba-head"><b>旧帖存档对比</b><button data-testid="app-effective-action" onClick={()=>setOnlyOwner(v=>!v)}>{onlyOwner?"查看全部":"只看楼主"}</button></div>
    {shown.sort((a,b)=>Number((activeBody(state,a) as Floor).floor)-Number((activeBody(state,b) as Floor).floor)).map(i=>{
      const f=activeBody(state,i) as Floor;
      const content=<><header><span className="tieba-author"><img src={generatedAvatar(112+(Number(f.floor??0)%8))} alt={`${f.author??"贴吧用户"}头像`}/><b>{f.author}</b></span><span>{f.floor}楼</span></header><p>{f.text}</p>{f.cacheOnly&&<small>仅本机缓存可见</small>}</>;
      return i.id==="forum.tieba.floor417"
        ?<button className={`floor floor-button ${f.cacheOnly?"cache-floor":""}`} data-testid="inspect-floor-417" key={i.id} onClick={()=>emit("forum.floor.inspected",i.id,{floor:f.floor??417})}>{content}</button>
        :<article className={`floor ${f.cacheOnly?"cache-floor":""}`} key={i.id}>{content}</article>;
    })}
  </AppChrome>;
}
