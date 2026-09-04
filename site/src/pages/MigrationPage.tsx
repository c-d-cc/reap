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

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{m.stepsTitle}</h2>
        <ol className="space-y-3 mb-6 list-none">
          {m.steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="font-mono text-xs text-primary shrink-0 w-5 text-right">{i + 1}</span>
              <div>
                <span className="text-sm font-semibold text-foreground">{step.title}</span>
                <span className="text-sm text-muted-foreground"> — {step.desc}</span>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.preservedTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{m.preservedDesc}</p>
        <CodeBlock language="bash">{m.rollbackCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.recordExampleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{m.recordExampleDesc}</p>
        <CodeBlock language="text">{m.recordExampleCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.backlogJudgeTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{m.backlogJudgeDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.designLinksTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{m.designLinksDesc}</p>

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
