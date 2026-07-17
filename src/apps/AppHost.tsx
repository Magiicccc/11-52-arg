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
import { GenericApp } from "./GenericApp";

export function AppHost({appId}:{appId:string}) {
 if(appId==="app.wechat") return <WeChatApp/>;
 if(appId==="app.photos") return <PhotosApp/>;
 if(appId==="app.safari") return <SafariApp/>;
 if(appId==="app.notes") return <NotesApp/>;
 if(appId==="app.files") return <FilesApp/>;
 if(appId==="app.settings") return <SettingsApp/>;
 if(appId==="app.tieba") return <TiebaApp/>;
 if(appId==="app.calculator") return <CalculatorApp/>;
 const app=appById.get(appId); return <AppChrome title={app?.displayName??appId}><GenericApp appId={appId}/></AppChrome>;
}
