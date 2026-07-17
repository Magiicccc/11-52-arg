import { useState } from "react";
import { useGame } from "@/app/GameContext";
export function PasscodeScreen(){
 const {submitPasscode,closeApp}=useGame(); const [digits,setDigits]=useState(""); const [shake,setShake]=useState(false);
 const press=(d:string)=>{ const next=(digits+d).slice(0,6); setDigits(next); if(next.length===6){ const ok=submitPasscode(next); if(!ok){setShake(true);setTimeout(()=>{setDigits("");setShake(false)},420);} }};
 return <div className="passcode-screen" data-testid="passcode-screen"><button className="passcode-cancel" onClick={closeApp}>取消</button><h2>输入密码</h2><p>密码用于解锁这部 iPhone</p><div className={`passcode-dots ${shake?"shake":""}`}>{[0,1,2,3,4,5].map(i=><i key={i} className={digits.length>i?"filled":""}/>)}</div><div className="keypad">{["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d,i)=>d?<button key={i} data-testid={`key-${d}`} onClick={()=>d==="⌫"?setDigits(v=>v.slice(0,-1)):press(d)}>{d}</button>:<span key={i}/>)}</div><small>线索存在于壁纸日期、票根与出行记录中</small></div>;
}
