import type { ReactNode } from "react";
import { useGame } from "@/app/GameContext";
export function AppChrome({title,children,actions}:{title:string;children:ReactNode;actions?:ReactNode}){ const {goBack}=useGame(); return <div className="app-window"><header className="app-header"><button data-testid="app-back" onClick={goBack}>‹</button><strong>{title}</strong><span>{actions}</span></header><div className="app-content">{children}</div></div>; }
