import { useState } from "react";
import { AppChrome } from "@/shell/AppChrome";
import { useGame } from "@/app/GameContext";

export function CalculatorApp(){
  const {emit}=useGame();
  const [value,setValue]=useState("0");
  const [stored,setStored]=useState<number|null>(null);
  const [op,setOp]=useState<string|null>(null);
  const press=(key:string)=>{
    emit("app.tool.used","app.calculator",{key,source:"P"});
    if(/\d/.test(key)) setValue(current=>current==="0"?key:(current+key).slice(0,12));
    else if(key===".") setValue(current=>current.includes(".")?current:`${current}.`);
    else if(key==="±") setValue(current=>String(-Number(current)));
    else if(key==="%") setValue(current=>String(Number(current)/100));
    else if(key==="C"){setValue("0");setStored(null);setOp(null)}
    else if(key==="="){
      if(stored!==null&&op){const n=Number(value);const r=op==="+"?stored+n:op==="−"?stored-n:op==="×"?stored*n:stored/n;setValue(String(Number.isFinite(r)?r:0).slice(0,12));setStored(null);setOp(null)}
    } else {setStored(Number(value));setOp(key);setValue("0")}
  };
  return <AppChrome title="计算器"><div className="calculator"><output>{stored!==null&&op&&<small>{stored} {op}</small>}{value}</output><div>{["C","±","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","0",".","="].map(k=><button className={op===k?"active":""} data-testid={k==="1"?"app-effective-action":undefined} key={k} onClick={()=>press(k)}>{k}</button>)}</div></div></AppChrome>;
}
