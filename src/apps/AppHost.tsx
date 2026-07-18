import { AppChrome } from "@/shell/AppChrome";
import { appById } from "@/content/content-pack";
import { WeChatApp } from "./WeChatApp";
import { PhotosApp } from "./PhotosApp";
import { SafariApp } from "./SafariApp";
import { NotesApp } from "./NotesApp";
import { FilesApp } from "./FilesApp";
import { SettingsApp } from "./SettingsApp";
import { TiebaApp } from "./TiebaApp";
import { CalculatorApp } from "./CalculatorApp";
import { BaiduMapApp } from "./BaiduMapApp";
import { PhoneApp } from "./PhoneApp";
import { ZhihuApp } from "./ZhihuApp";
import {
  AlipayApp,
  BaiduNetdiskApp,
  DidiApp,
  DouyinApp,
  MeituanApp,
  QQMailApp,
  TaobaoApp,
  ToutiaoApp,
  XiaohongshuApp
} from "./PlatformApps";
import {
  CalendarApp,
  CameraApp,
  ClockApp,
  CompassApp,
  HealthApp,
  NeteaseMusicApp,
  Railway12306App,
  VoiceMemosApp,
  WeatherApp,
  WechatReadingApp
} from "./UtilityApps";

export function AppHost({appId}:{appId:string}) {
 if(appId==="app.wechat") return <WeChatApp/>;
 if(appId==="app.photos") return <PhotosApp/>;
 if(appId==="app.safari") return <SafariApp/>;
 if(appId==="app.notes") return <NotesApp/>;
 if(appId==="app.files") return <FilesApp/>;
 if(appId==="app.settings") return <SettingsApp/>;
 if(appId==="app.tieba") return <TiebaApp/>;
 if(appId==="app.calculator") return <CalculatorApp/>;
 if(appId==="app.baidu_map") return <BaiduMapApp/>;
 if(appId==="app.phone") return <PhoneApp/>;
 if(appId==="app.zhihu") return <ZhihuApp/>;
 if(appId==="app.xiaohongshu") return <XiaohongshuApp/>;
 if(appId==="app.douyin") return <DouyinApp/>;
 if(appId==="app.toutiao") return <ToutiaoApp/>;
 if(appId==="app.qqmail") return <QQMailApp/>;
 if(appId==="app.baidunetdisk") return <BaiduNetdiskApp/>;
 if(appId==="app.alipay") return <AlipayApp/>;
 if(appId==="app.didi") return <DidiApp/>;
 if(appId==="app.meituan") return <MeituanApp/>;
 if(appId==="app.taobao") return <TaobaoApp/>;
 if(appId==="app.calendar") return <CalendarApp/>;
 if(appId==="app.netease_music") return <NeteaseMusicApp/>;
 if(appId==="app.wechat_reading") return <WechatReadingApp/>;
 if(appId==="app.railway12306") return <Railway12306App/>;
 if(appId==="app.health") return <HealthApp/>;
 if(appId==="app.weather") return <WeatherApp/>;
 if(appId==="app.clock") return <ClockApp/>;
 if(appId==="app.camera") return <CameraApp/>;
 if(appId==="app.voice_memos") return <VoiceMemosApp/>;
 if(appId==="app.compass") return <CompassApp/>;
 const app=appById.get(appId);
 return <AppChrome title={app?.displayName??"应用"}><div className="empty-state">此应用不可用</div></AppChrome>;
}
