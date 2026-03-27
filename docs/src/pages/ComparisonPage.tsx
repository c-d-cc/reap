import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function ComparisonPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.comparison.title} breadcrumb={t.comparison.breadcrumb}>

        <h2 className="text-base font-semibold text-foreground mb-3">{t.comparison.heading}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t.comparison.desc}
        </p>
        <div className="space-y-4 text-sm mb-4">
          {t.comparison.items.map((item) => (
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
