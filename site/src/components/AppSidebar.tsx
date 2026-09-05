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
        { title: t.nav.items.autonomousEvolution, href: "/docs/autonomous-evolution" },
        { title: t.nav.items.v018change, href: "/docs/v018change" },
      ]
    },
    {
      label: t.nav.groups.coreConcepts,
      items: [
        { title: t.nav.items.twoAxes, href: "/docs/two-axes" },
        { title: t.nav.items.storage, href: "/docs/storage" },
      ]
    },
    {
      label: t.nav.groups.planAxis,
      items: [
        { title: t.nav.items.loop, href: "/docs/loop" },
        { title: t.nav.items.planSource, href: "/docs/plan-source" },
        { title: t.nav.items.idea, href: "/docs/idea" },
        { title: t.nav.items.carveMilestone, href: "/docs/carve-milestone" },
      ]
    },
    {
      label: t.nav.groups.execAxis,
      items: [
        { title: t.nav.items.generation, href: "/docs/generation" },
        { title: t.nav.items.delegation, href: "/docs/delegation" },
        { title: t.nav.items.backlog, href: "/docs/backlog" },
        { title: t.nav.items.closingMilestone, href: "/docs/closing-milestone" },
      ]
    },
    {
      label: t.nav.groups.knowledge,
      items: [
        { title: t.nav.items.genome, href: "/docs/genome" },
        { title: t.nav.items.environment, href: "/docs/environment" },
        { title: t.nav.items.visionMemory, href: "/docs/vision-memory" },
        { title: t.nav.items.codeIntelligence, href: "/docs/code-intelligence" },
      ]
    },
    {
      label: t.nav.groups.collaboration,
      items: [
        { title: t.nav.items.orchestrate, href: "/docs/orchestrate" },
        { title: t.nav.items.claimBarrier, href: "/docs/claim-barrier" },
        { title: t.nav.items.hooks, href: "/docs/hooks" },
      ]
    },
    {
      label: t.nav.groups.reference,
      items: [
        { title: t.nav.items.skillReference, href: "/docs/skill-reference" },
        { title: t.nav.items.cliReference, href: "/docs/cli-reference" },
        { title: t.nav.items.configuration, href: "/docs/configuration" },
        { title: t.nav.items.doctor, href: "/docs/doctor" },
      ]
    },
    {
      label: t.nav.groups.other,
      items: [
        { title: t.nav.items.comparison, href: "/docs/comparison" },
        { title: t.nav.items.migration, href: "/docs/migration" },
        { title: t.nav.items.releaseNotes, href: "/docs/release-notes" },
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
      <p className="text-xs text-muted-foreground/30 text-center">&copy; {__BUILD_YEAR__} C to D.<br />All rights reserved.</p>
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
