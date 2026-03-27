import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function CLIPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.cli.title} breadcrumb={t.cli.breadcrumb}>

        <h2 className="text-base font-semibold text-foreground mb-2">{t.cli.initTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{t.cli.initDesc}</p>
        <CodeBlock language="bash">{`reap init [name] [options]`}</CodeBlock>
        <div className="mt-3 border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.cli.initHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.cli.initOptions.map(([opt, vals, desc]) => (
                <tr key={opt}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{opt}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{vals}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.cli.statusTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{t.cli.statusDesc}</p>
        <CodeBlock language="bash">{`reap status`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          {t.cli.statusNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.cli.runTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{t.cli.runDesc}</p>
        <CodeBlock language="bash">{`reap run <command> [--phase <phase>]`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          {t.cli.runNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.cli.fixTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{t.cli.fixDesc}</p>
        <CodeBlock language="bash">{`reap fix [--check]`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          {t.cli.fixNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.cli.cleanTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{t.cli.cleanDesc}</p>
        <CodeBlock language="bash">{`reap clean`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          {t.cli.cleanNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.cli.destroyTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{t.cli.destroyDesc}</p>
        <CodeBlock language="bash">{`reap destroy`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          {t.cli.destroyNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.cli.makeBacklogTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{t.cli.makeBacklogDesc}</p>
        <CodeBlock language="bash">{`reap make backlog --type <type> --title <title> [--body <body>] [--priority <priority>]`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          {t.cli.makeBacklogNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.cli.cruiseTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{t.cli.cruiseDesc}</p>
        <CodeBlock language="bash">{`reap cruise <count>`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          {t.cli.cruiseNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.cli.helpTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{t.cli.helpDesc}</p>
        <CodeBlock language="bash">{`reap help`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2">
          {t.cli.helpNote}
        </p>
      </DocPage>
    </DocLayout>
  );
}
