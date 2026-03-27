import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function MigrationGuidePage() {
  const t = useT();
  const m = t.migrationGuidePage;
  return (
    <DocLayout>
      <DocPage title={m.title} breadcrumb={m.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {m.intro}
        </p>

        {/* Overview */}
        <h2 className="text-base font-semibold text-foreground mb-2">{m.whyMigrateTitle}</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-6">
          {m.whyMigrateItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>

        {/* Migration Steps */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.stepsTitle}</h2>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          <strong className="text-foreground">Step 1:</strong> {m.step1}
        </p>
        <CodeBlock language="bash">npm install -g @c-d-cc/reap</CodeBlock>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          <strong className="text-foreground">Step 2:</strong> {m.step2}
        </p>
        <CodeBlock language="bash">/reap.update</CodeBlock>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          <strong className="text-foreground">Step 3:</strong> {m.step3}
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {m.step3Headers.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {m.step3Rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{row[0]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          <strong className="text-foreground">Step 4:</strong> {m.step4}
        </p>
        <CodeBlock language="bash">{`/reap.status
/reap.evolve`}</CodeBlock>

        {/* What Changes */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.whatChangesTitle}</h2>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {m.whatChangesHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {m.whatChangesRows.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{row[0]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interrupted Migration */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.interruptedTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {m.interruptedDesc}
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">{m.interruptedResume}</strong> {m.interruptedResumeDesc}</p>
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">{m.interruptedRestart}</strong> {m.interruptedRestartDesc}</p>
        </div>

        <CodeBlock language="yaml">{`# .reap/migration-state.yml (example)
version: "0.16"
phases:
  confirm: completed
  execute: completed
  genome-convert: in-progress
  vision: pending
  complete: pending`}</CodeBlock>

        {/* Backup */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.backupTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {m.backupDesc}
        </p>
        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mb-6">
          {m.backupItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>

        {/* Deprecated Commands */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{m.deprecatedTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {m.deprecatedDesc}
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {m.deprecatedHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {m.deprecatedRows.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-mono text-xs text-red-400 line-through">{row[0]}</td>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{row[1]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-l-2 border-primary/30 pl-4 py-2 mb-4 bg-muted/30 rounded-r-md">
          <p className="text-xs text-muted-foreground italic">
            {m.deprecatedNote}
          </p>
        </div>

      </DocPage>
    </DocLayout>
  );
}
