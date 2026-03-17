import { Link, useLocation } from "wouter";

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

export function AppSidebar() {
  return (
    <div className="border-r border-border border-l border-l-border/40 bg-sidebar pt-3 overflow-y-auto shrink-0 hidden md:block" style={{ width: "var(--sidebar-width)" }}>
      <NavList />
    </div>
  );
}
