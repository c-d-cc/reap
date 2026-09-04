import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function AutonomousEvolutionPage() {
  const t = useT();
  const a = t.autonomousEvolution;
  return (
    <DocLayout>
      <DocPage title={a.title} breadcrumb={a.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{a.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{a.sessionStartTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{a.sessionStartDesc}</p>
        <div className="space-y-3 mb-6">
          {a.injectedItems.map((item) => (
            <div key={item.label} className="border-l-2 border-border hover:border-primary transition-colors pl-3 py-0.5">
              <div className="text-sm font-semibold text-foreground mb-0.5">{item.label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-2 mt-6">{a.statusLineTitle}</h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{a.statusLineDesc}</p>
        <CodeBlock language="text">{a.statusLineExample}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-8">{a.judgmentsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{a.judgmentsDesc}</p>
        <ol className="space-y-3 mb-6 list-none">
          {a.judgments.map((j, idx) => (
            <li key={j.title} className="flex gap-3">
              <span className="font-mono text-xs text-primary shrink-0 w-5 text-right">{idx + 1}</span>
              <div>
                <span className="text-sm font-semibold text-foreground">{j.title}</span>
                <span className="text-sm text-muted-foreground"> — {j.desc}</span>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{a.autonomousTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{a.autonomousDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{a.commitRuleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{a.commitRuleDesc}</p>
        <CodeBlock language="bash">{a.commitRuleCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{a.fitnessTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{a.fitnessDesc}</p>
      </DocPage>
    </DocLayout>
  );
}
