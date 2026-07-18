import type { DeviceId } from "@/contracts/game-state";
import { useGame } from "@/app/GameContext";
import { StatusBar } from "./StatusBar";
import { LockScreen } from "./LockScreen";
import { PasscodeScreen } from "./PasscodeScreen";
import { HomeScreen } from "./HomeScreen";
import { AppHost } from "@/apps/AppHost";
import { NotificationToast } from "./NotificationToast";

export function PhoneFrame({deviceId}:{deviceId:DeviceId}) {
  const {state}=useGame(); const device=state.devices[deviceId];
  const passcodeMode=device.activeAppId==="__passcode__";
  const screenId=device.locked?(passcodeMode?"passcode":"lock"):device.activeAppId?"app":"home";
  return <section className={`phone-frame ${deviceId}`} data-testid={`phone-${deviceId}`} data-screen-id={`${deviceId}.${screenId}`}>
    <div className="phone-screen">
      <StatusBar deviceId={deviceId}/>
      {device.locked ? (passcodeMode?<PasscodeScreen/>:<LockScreen deviceId={deviceId}/>) : device.activeAppId ? <div className="app-runtime" data-app-id={device.activeAppId}><AppHost appId={device.activeAppId}/></div> : <HomeScreen deviceId={deviceId}/>}
      <NotificationToast />
      <div className="home-indicator"/>
    </div>
  </section>;
}
