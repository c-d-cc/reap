import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navGroups = [
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

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-border bg-sidebar fixed top-14 left-0 pt-3 h-[calc(100vh-3.5rem)] overflow-y-auto z-30" collapsible="none">
      <SidebarContent className="pt-0">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-0">
            <SidebarGroupLabel className="text-[9px] font-normal text-muted-foreground/60 tracking-wider uppercase px-3 py-0 mt-3 mb-1 h-auto rounded-none">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`text-[13px] px-3 py-1.5 h-8 rounded-sm ${isActive ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                      >
                        <Link href={item.href}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
