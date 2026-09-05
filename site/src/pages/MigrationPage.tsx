import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function MigrationPage() {
  const t = useT();
  const m = t.migration;
  return (
    <DocLayout>
      <DocPage title={m.title} breadcrumb={m.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{m.intro}</p>
        <CodeBlock language="bash">{m.updateCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{m.handoffDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.processTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{m.processDesc1}</p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{m.processDesc2}</p>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{m.processDesc3}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.preservedTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{m.preservedDesc}</p>
        <CodeBlock language="bash">{m.rollbackCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.afterTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{m.afterDesc1}</p>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{m.afterDesc2}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.lostTitle}</h2>
        <ul className="space-y-2 mb-2 list-none p-0">
          {m.lostItems.map(([title, desc]) => (
            <li key={title} className="text-sm leading-relaxed">
              <span className="font-semibold text-foreground">{title}</span>
              <span className="text-muted-foreground"> — {desc}</span>
            </li>
          ))}
        </ul>
      </DocPage>
    </DocLayout>
  );
}
