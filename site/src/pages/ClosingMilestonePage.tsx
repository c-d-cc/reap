import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function ClosingMilestonePage() {
  const t = useT();
  const c = t.closingMilestonePage;
  return (
    <DocLayout>
      <DocPage title={c.title} breadcrumb={c.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{c.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{c.judgeTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.judgeDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.fitnessTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.fitnessDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.orderTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{c.orderDesc}</p>
        <ol className="space-y-3 mb-6 list-none">
          {c.orderSteps.map((step) => (
            <li key={step.title} className="border-l-2 border-border hover:border-primary transition-colors pl-3 py-0.5">
              <div className="text-sm font-semibold text-foreground mb-0.5">{step.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{step.desc}</div>
            </li>
          ))}
        </ol>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.cleanupTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{c.cleanupDesc}</p>
        <div className="border-l-2 border-primary pl-4 py-2 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">{c.cleanupTestNote}</p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.handoffTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.handoffDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.lessonsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.lessonsDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.exampleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{c.exampleDesc}</p>
        <CodeBlock language="text">{c.exampleCode}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
