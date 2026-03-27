import { ReactNode } from "react";

interface DocPageProps {
  title: string;
  description?: string;
  breadcrumb?: string;
  badge?: string;
  children: ReactNode;
}

export function DocPage({ title, description, breadcrumb, badge, children }: DocPageProps) {
  return (
    <div>
      {breadcrumb && (
        <div className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">
          {breadcrumb}
        </div>
      )}
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {badge && (
          <a href="https://github.com/c-d-cc/reap/issues" target="_blank" rel="noreferrer" className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 whitespace-nowrap hover:bg-red-500/25 transition-colors">
            {badge}
          </a>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
      )}
      <div className="h-px bg-border w-full mb-6" />
      <div className="doc-content">
        {children}
      </div>
    </div>
  );
}
