import { Link, useLocation } from "wouter";
import logoPath from "@assets/favicon_1773735683357.png";

export const navGroups = [
  {
    label: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs/introduction" },
      { title: "Quick Start", href: "/docs/quick-start" },
    ]
  },
  {
    label: "Core Concepts",
    items: [
      { title: "Core Concepts", href: "/docs/core-concepts" },
    ]
  },
  {
    label: "Workflow",
    items: [
      { title: "Workflow", href: "/docs/workflow" },
    ]
  },
  {
    label: "Reference",
    items: [
      { title: "CLI Reference", href: "/docs/cli" },
      { title: "Command Reference", href: "/docs/commands" },
      { title: "Hook Reference", href: "/docs/hooks" },
      { title: "Configuration", href: "/docs/configuration" },
      { title: "Advanced", href: "/docs/advanced" },
    ]
  }
];

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();

  return (
    <>
      {navGroups.map((group) => (
        <div key={group.label} className="py-0 px-0">
          <div className="text-[9px] font-normal text-muted-foreground/60 tracking-wider uppercase px-3 py-0 mt-3 mb-1">
            {group.label}
          </div>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`block text-[13px] px-3 py-1.5 rounded-none ${isActive ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export function SidebarFooter({ expanded }: { expanded?: boolean }) {
  return (
    <div className="mt-auto border-t border-border px-3 py-4 flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        {expanded && (
          <>
            <img src={logoPath} alt="REAP" className="w-5 h-5" />
            <span className="text-sm font-semibold text-muted-foreground">REAP</span>
          </>
        )}
        <span className="text-xs text-muted-foreground/50">made by</span>
        <a href="https://c-d.cc" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
          <img src="/ctod-logo.png" alt="C to D" className="h-5" />
        </a>
      </div>
      <p className="text-xs text-muted-foreground/30 text-center">&copy; {new Date().getFullYear()} C to D.<br />All rights reserved.</p>
    </div>
  );
}

export function AppSidebar() {
  return (
    <div className="border-r border-border border-l border-l-border/40 bg-sidebar pt-3 overflow-y-auto shrink-0 hidden md:flex md:flex-col" style={{ width: "var(--sidebar-width)" }}>
      <NavList />
      <SidebarFooter />
    </div>
  );
}
