import { Link } from "wouter";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function CLIPage() {
  const t = useT();
  const c = t.cli;
  return (
    <DocLayout>
      <DocPage title={c.title} breadcrumb={c.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.intro}</p>

        <CodeBlock language="text">{c.usage}</CodeBlock>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.usageNote}</p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {c.commandHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {c.commands.map(([name, desc]) => (
                <tr key={name}>
                  <td className="px-4 py-2 font-mono text-xs text-primary whitespace-nowrap align-top">{name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          <Link href="/docs/code-index" className="text-primary hover:underline">{c.indexLinkText}</Link>{" · "}
          <Link href="/docs/orchestrate" className="text-primary hover:underline">{c.orchLinkText}</Link>
        </p>
      </DocPage>
    </DocLayout>
  );
}
