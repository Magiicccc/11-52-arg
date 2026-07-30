import type { ReactNode } from "react";
import { useGame } from "@/app/GameContext";
export function AppChrome({
  title,
  children,
  actions,
  onBack
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
}) {
  const { goBack } = useGame();
  return <div className="app-window">
    <header className="app-header">
      <button data-testid="app-back" aria-label="返回" onClick={onBack ?? goBack}>‹</button>
      <strong>{title}</strong>
      <span>{actions}</span>
    </header>
    <div className="app-content">{children}</div>
  </div>;
}
