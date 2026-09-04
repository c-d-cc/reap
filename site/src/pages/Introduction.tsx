import { Link } from "wouter";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function Introduction() {
  const t = useT();
  const i = t.intro;
  return (
    <DocLayout>
      <DocPage title={i.title} breadcrumb={i.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{i.description}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{i.whatBuilds}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{i.whyReapTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{i.problemHeader}</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{i.solutionHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {i.problems.map(([problem, solution]) => (
                <tr key={problem}>
                  <td className="px-4 py-2.5 text-muted-foreground align-top">{problem}</td>
                  <td className="px-4 py-2.5 text-foreground align-top">{solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{i.structureTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{i.structureDesc}</p>
        <ul className="text-sm space-y-3 mb-8">
          {i.structureItems.map((item) => (
            <li key={item.label} className="flex flex-col sm:flex-row sm:gap-4">
              <span className="shrink-0 sm:w-40">
                <span className="text-foreground font-semibold">{item.label}</span>
                <span className="text-primary block sm:inline sm:ml-1.5 text-xs sm:text-sm">{item.sub}</span>
              </span>
              <span className="text-muted-foreground">
                {item.desc}{" "}
                <span className="font-mono text-xs text-muted-foreground/70">{item.path}</span>
              </span>
            </li>
          ))}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{i.projectStructureTitle}</h2>
        <CodeBlock language="text">{i.projectStructureTree}</CodeBlock>

        <p className="text-sm text-muted-foreground mt-8">
          {i.nextText} <Link href="/docs/quick-start" className="text-primary hover:underline">{i.quickStartLinkText}</Link>
        </p>
      </DocPage>
    </DocLayout>
  );
}
