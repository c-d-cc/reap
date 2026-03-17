import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppNavbar } from "./AppNavbar";

interface DocLayoutProps {
  children: ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  const style = {
    "--sidebar-width": "240px",
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppNavbar />
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex w-full pt-14">
          <AppSidebar />
          <div className="flex-1 min-w-0 flex flex-col relative md:ml-[var(--sidebar-width)]">
            <div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border px-3 py-1.5 flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="h-7 w-7" />
              <span className="text-xs text-muted-foreground">Menu</span>
            </div>
            <main className="flex-1 px-6 py-6 md:px-10 md:py-8 max-w-3xl">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
