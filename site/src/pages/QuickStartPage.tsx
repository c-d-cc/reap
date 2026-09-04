import { Link } from "wouter";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function QuickStartPage() {
  const t = useT();
  const q = t.quickstart;
  return (
    <DocLayout>
      <DocPage title={q.title} breadcrumb={q.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{q.intro}</p>

        {q.steps.map((step) => (
          <div key={step.title}>
            <h2 className="text-base font-semibold text-foreground mb-2 mt-6">
              <span className="font-mono text-primary mr-2">{step.command}</span>
              {step.title}
            </h2>
            <CodeBlock language="text">{step.command}</CodeBlock>
            <p className="text-sm text-muted-foreground mt-2 mb-2 leading-relaxed">{step.desc}</p>
          </div>
        ))}

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{q.statusLineTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{q.statusLineDesc1}</p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{q.statusLineDesc2}</p>
        <CodeBlock language="text">{q.statusLineExample}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {q.statusLineNote}{" "}
          <Link href="/docs/concepts" className="text-primary hover:underline">{q.conceptsLinkText}</Link>
          {q.statusLineNoteAfter}
        </p>
      </DocPage>
    </DocLayout>
  );
}
