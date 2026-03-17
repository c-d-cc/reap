import { ReactNode, useState } from "react";
import { AppSidebar, NavList } from "./AppSidebar";
import { AppNavbar } from "./AppNavbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface DocLayoutProps {
  children: ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden" style={{ "--sidebar-width": "160px" } as React.CSSProperties}>
      <AppNavbar onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1 w-full max-w-4xl mx-auto pt-11 md:pt-14 overflow-hidden">
        <AppSidebar />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
            <div className="max-w-3xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0 pt-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <NavList onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
