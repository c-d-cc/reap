import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function ConfigurationPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.config.title} breadcrumb={t.config.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.config.intro}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3">{t.config.structure}</h2>
        <CodeBlock language="yaml">{`# .reap/config.yml
version: 0.1.0
project: my-project
entryMode: greenfield    # greenfield | migration | adoption
strict: false            # enable strict mode (default: false)
hooks:
  onGenerationComplete:
    - command: "reap update"
    - prompt: "Update docs if needed."
`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">{t.config.fields}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.config.fieldHeaders.map((h) => (
                  <th key={h} className={`text-left px-4 py-2 text-xs font-semibold text-muted-foreground ${h === t.config.fieldHeaders[0] ? "w-36" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.config.fieldItems.map(([field, desc]) => (
                <tr key={field}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{field}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">{t.config.strictMode}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {t.config.strictModeDesc}
        </p>
        <CodeBlock language="yaml">{`# Enable strict mode
strict: true   # default: false`}</CodeBlock>
        <div className="mt-3 border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.config.strictHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.config.strictRules.map(([ctx, behavior]) => (
                <tr key={ctx}>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{ctx}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          {t.config.strictNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">{t.config.entryModes}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.config.entryModeHeaders.map((h) => (
                  <th key={h} className={`text-left px-4 py-2 text-xs font-semibold text-muted-foreground ${h === t.config.entryModeHeaders[0] ? "w-32" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.config.entryModeItems.map(([mode, desc]) => (
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
