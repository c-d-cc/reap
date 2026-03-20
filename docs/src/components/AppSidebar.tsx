import { Link, useLocation } from "wouter";
import logoPath from "@assets/favicon_1773735683357.png";
import { useT } from "@/i18n";

export function useNavGroups() {
  const t = useT();
  return [
    {
      label: t.nav.groups.gettingStarted,
      items: [
        { title: t.nav.items.introduction, href: "/docs/introduction" },
        { title: t.nav.items.quickStart, href: "/docs/quick-start" },
        { title: t.nav.items.comparison, href: "/docs/comparison" },
      ]
    },
    {
      label: t.nav.groups.guide,
      items: [
        { title: t.nav.items.coreConcepts, href: "/docs/core-concepts" },
        { title: t.nav.items.genome, href: "/docs/genome" },
        { title: t.nav.items.environment, href: "/docs/environment" },
        { title: t.nav.items.lifecycle, href: "/docs/lifecycle" },
        { title: t.nav.items.lineage, href: "/docs/lineage" },
        { title: t.nav.items.backlog, href: "/docs/backlog" },
        { title: t.nav.items.hooks, href: "/docs/hooks" },
        { title: t.nav.items.advanced, href: "/docs/advanced" },
      ]
    },
    {
      label: t.nav.groups.collaboration,
      items: [
        { title: t.nav.items.collaborationOverview, href: "/docs/distributed-workflow" },
        { title: t.nav.items.mergeGeneration, href: "/docs/merge-generation" },
        { title: t.nav.items.mergeCommands, href: "/docs/merge-commands" },
      ]
    },
    {
      label: t.nav.groups.reference,
      items: [
        { title: t.nav.items.cliReference, href: "/docs/cli-reference" },
        { title: t.nav.items.commandReference, href: "/docs/command-reference" },
      ]
    },
    {
      label: t.nav.groups.other,
      items: [
        { title: t.nav.items.configuration, href: "/docs/configuration" },
      ]
    }
  ];
}

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const navGroups = useNavGroups();

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
                <li key={item.href}>
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
      <div className="min-h-8" />
      <SidebarFooter />
    </div>
  );
}
