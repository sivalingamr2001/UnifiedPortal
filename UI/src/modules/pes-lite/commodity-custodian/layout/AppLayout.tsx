import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased">
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="w-full shrink-0 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <AppHeader />
        </header>

        <main className="mx-auto flex w-full flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
          <div className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
