import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function RecoveryGenerationPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.recovery.title} breadcrumb={t.recovery.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.recovery.intro}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3">{t.recovery.triggerTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {t.recovery.triggerDesc}
        </p>
        <CodeBlock language="bash">{`/reap.evolve.recovery gen-042-a3f8c2`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">{t.recovery.criteriaTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.recovery.criteriaHeaders.map((h) => (
                  <th key={h} className={`text-left px-4 py-2 text-xs font-semibold text-muted-foreground ${h === t.recovery.criteriaHeaders[0] ? "w-40" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.recovery.criteriaItems.map(([criterion, desc]) => (
                <tr key={criterion}>
                  <td className="px-4 py-2 text-xs text-primary font-medium">{criterion}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">{t.recovery.processTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {t.recovery.processDesc}
        </p>
        <CodeBlock language="text">{t.recovery.processFlow}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">{t.recovery.stagesTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {t.recovery.stagesDesc}
        </p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.recovery.stageHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.recovery.stageItems.map(([stage, normal, recovery]) => (
                <tr key={stage}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{stage}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{normal}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{recovery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">{t.recovery.currentYmlTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {t.recovery.currentYmlDesc}
        </p>
        <CodeBlock language="yaml">{`type: recovery
recovers:
  - gen-042-a3f8c2
parents:
  - gen-045-3785e0  # DAG parent (latest generation)`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">{t.recovery.notesTitle}</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground mb-6 space-y-1">
          {t.recovery.notes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>

      </DocPage>
    </DocLayout>
  );
}
