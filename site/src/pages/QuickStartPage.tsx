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

        <h2 className="text-base font-semibold text-foreground mb-2">{q.prerequisitesTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {q.prerequisiteHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {q.prerequisites.map((item) => (
                <tr key={item.name}>
                  <td className="px-4 py-2 text-sm align-top">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className={`ml-2 text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${item.required ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {item.required ? q.requiredLabel : q.optionalLabel}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground align-top">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{q.installTitle}</h2>
        <div className="space-y-3 mb-6">
          <div>
            <div className="text-xs text-muted-foreground mb-1">{q.installStep1}</div>
            <CodeBlock language="bash">{q.installCliCode}</CodeBlock>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">{q.installStep2}</div>
            <CodeBlock language="bash">{q.installPluginCode}</CodeBlock>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{q.installVerifyNote}</p>

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
        <p className="text-sm text-muted-foreground mt-3 mb-8 leading-relaxed">
          {q.statusLineNote}{" "}
          <Link href="/docs/autonomous-evolution" className="text-primary hover:underline">{q.conceptsLinkText}</Link>
          {q.statusLineNoteAfter}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{q.nextTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {q.nextLinks.map((item) => (
            <Link key={item.href} href={item.href}
              className="group flex items-start justify-between border border-border rounded-md p-3 bg-card hover:border-primary/50 transition-colors">
              <div>
                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
              <span className="text-muted-foreground group-hover:text-primary text-xs mt-0.5 ml-3 shrink-0 transition-colors">→</span>
            </Link>
          ))}
        </div>
      </DocPage>
    </DocLayout>
  );
}
