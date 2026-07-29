import { useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";

export function CalculatorApp(){
  const {emit}=useGame();
  const [value,setValue]=useState("0");
  const [stored,setStored]=useState<number|null>(null);
  const [op,setOp]=useState<string|null>(null);
  const [feedback,setFeedback]=useState("可以开始计算");
  const press=(key:string)=>{
    emit("app.tool.used","app.calculator",{key,source:"P"});
    if(/\d/.test(key)){setValue(current=>current==="0"?key:(current+key).slice(0,12));setFeedback(`已输入 ${key}`)}
    else if(key==="."){setValue(current=>current.includes(".")?current:`${current}.`);setFeedback("已输入小数点")}
    else if(key==="±"){setValue(current=>String(-Number(current)));setFeedback(`正负号已切换`)}
    else if(key==="%"){setValue(current=>String(Number(current)/100));setFeedback("已换算为百分比")}
    else if(key==="C"){setValue("0");setStored(null);setOp(null);setFeedback("已清除")}
    else if(key==="="){
      if(stored!==null&&op){const n=Number(value);const r=op==="+"?stored+n:op==="−"?stored-n:op==="×"?stored*n:stored/n;setValue(String(Number.isFinite(r)?r:0).slice(0,12));setStored(null);setOp(null);setFeedback("计算完成")}
      else setFeedback("请输入完整算式");
    } else {setStored(Number(value));setOp(key);setValue("0");setFeedback(`已选择 ${key}`)}
  };
  return <AppChrome title="计算器"><div className="calculator"><output>{stored!==null&&op&&<small>{stored} {op}</small>}{value}</output><p className="calculator-feedback" role="status">{feedback}</p><div>{["C","±","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","0",".","="].map(k=><button className={op===k?"active":""} data-testid={k==="1"?"app-effective-action":undefined} key={k} onClick={()=>press(k)}>{k}</button>)}</div></div></AppChrome>;
}
