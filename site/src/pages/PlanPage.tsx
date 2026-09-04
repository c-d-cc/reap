import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function PlanPage() {
  const t = useT();
  const p = t.planPage;
  return (
    <DocLayout>
      <DocPage title={p.title} breadcrumb={p.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{p.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{p.registerTitle}</h2>
        <CodeBlock language="bash">{p.registerCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{p.registerDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{p.registryTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{p.registryDesc}</p>
        <CodeBlock language="yaml">{p.registryCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{p.conventionTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.conventionDesc}</p>
        <div className="text-sm font-medium text-foreground mb-2">{p.conventionRulesTitle}</div>
        <ol className="space-y-2 mb-6 list-none">
          {p.conventionRules.map((rule, idx) => (
            <li key={rule} className="flex gap-3">
              <span className="font-mono text-xs text-primary shrink-0 w-5 text-right">{idx + 1}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{p.citeTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{p.citeDesc}</p>
        <CodeBlock language="yaml">{p.citeCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{p.lifespanTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{p.lifespanDesc}</p>
        <CodeBlock language="markdown">{p.lifespanCode}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
