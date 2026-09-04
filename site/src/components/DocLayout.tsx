import { ReactNode, useState } from "react";
import { AppSidebar, NavList, SidebarFooter } from "./AppSidebar";
import { AppNavbar } from "./AppNavbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface DocLayoutProps {
  children: ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden" style={{ "--sidebar-width": "176px" } as React.CSSProperties}>
      <AppNavbar onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1 w-full max-w-5xl mx-auto pt-11 md:pt-14 overflow-hidden">
        <AppSidebar />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-8">
            <div style={{ maxWidth: "800px" }}>
              {children}
            </div>
          </main>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0 pt-4 flex flex-col overflow-y-auto">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <NavList onNavigate={() => setMobileOpen(false)} />
          <SidebarFooter expanded />
        </SheetContent>
      </Sheet>
    </div>
  );
}
