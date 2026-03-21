import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function AdvancedPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.advanced.title} breadcrumb={t.advanced.breadcrumb}>

        <h2 className="text-base font-semibold text-foreground mb-2">{t.advanced.signatureTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {t.advanced.signatureDesc}
        </p>
        <CodeBlock language="text">{t.advanced.signatureFlow}</CodeBlock>

        <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">{t.advanced.signatureHow}</h3>
        <ol className="list-decimal list-inside text-sm text-muted-foreground mb-4 space-y-1">
          {t.advanced.signatureHowItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>

        <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">{t.advanced.signatureComparisonTitle}</h3>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.advanced.signatureComparisonHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.advanced.signatureComparisonItems.map(([threat, promptOnly, signatureBased]) => (
                <tr key={threat}>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{threat}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{promptOnly}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{signatureBased}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          📄 Related Article:{" "}
          <a href="https://dev.to/casamia918/new-workflow-control-method-for-harness-engineering-signature-based-locking-3bmj" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            New workflow control method for harness engineering — Signature-Based Locking
          </a>
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2">{t.advanced.compressionTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {t.advanced.compressionDesc}
        </p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.advanced.compressionHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.advanced.compressionItems.map(([level, input, output, maxLines, trigger]) => (
                <tr key={level}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{level}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{input}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{output}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{maxLines}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          {t.advanced.compressionProtection}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.advanced.presetsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {t.advanced.presetsDesc}
        </p>
        <CodeBlock language="bash">{`reap init my-project --preset bun-hono-react`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          {t.advanced.presetsNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.advanced.entryModes}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {t.advanced.entryModesDesc}
        </p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.advanced.entryModeHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.advanced.entryModeItems.map(([mode, desc]) => (
                <tr key={mode}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{mode}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </DocPage>
    </DocLayout>
  );
}
