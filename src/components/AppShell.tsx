import type { ReactNode } from "react";
import { PlayerBar } from "./PlayerBar";
import { SiteHeader } from "./SiteHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <SiteHeader />
      <div className="pb-28">{children}</div>
      <PlayerBar />
    </div>
  );
}
