import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function AdvancedPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.advanced.title} breadcrumb={t.advanced.breadcrumb}>

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

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.advanced.comparison}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t.advanced.comparisonDesc}
        </p>
        <div className="space-y-3 text-sm mb-4">
          {t.advanced.comparisonItems.map((item) => (
            <div key={item.title} className="border-l border-border pl-3">
              <div className="text-xs font-semibold text-foreground mb-0.5">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </DocPage>
    </DocLayout>
  );
}
