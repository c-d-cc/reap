import { ReactNode } from "react";

interface DocPageProps {
  title: string;
  description?: string;
  breadcrumb?: string;
  children: ReactNode;
}

export function DocPage({ title, description, breadcrumb, children }: DocPageProps) {
  return (
    <div>
      {breadcrumb && (
        <div className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">
          {breadcrumb}
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
        {title}
      </h1>
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
