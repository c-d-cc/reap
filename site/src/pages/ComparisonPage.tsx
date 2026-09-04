import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function ComparisonPage() {
  const t = useT();
  const c = t.comparisonPage;
  return (
    <DocLayout>
      <DocPage title={c.title} breadcrumb={c.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{c.intro}</p>

        <div className="space-y-5">
          {c.items.map((item) => (
            <div key={item.title} className="border-l-2 border-border hover:border-primary transition-colors pl-4 py-1">
              <div className="text-sm font-semibold text-foreground mb-1">{item.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </DocPage>
    </DocLayout>
  );
}
