import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function CommandReferencePage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.commands.title} breadcrumb={t.commands.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {t.commands.intro}
        </p>
        <div className="border-l-2 border-primary pl-3 py-1 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.commands.cliCommandsDesc}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            {t.commands.slashCommandsDesc}
          </p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">{t.commands.slashTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {t.commands.slashIntro}
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.commands.commandHeaders.map((h) => (
                  <th key={h} className={`text-left px-4 py-2 text-xs font-semibold text-muted-foreground ${h === t.commands.commandHeaders[0] ? "w-48" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.commands.commands.map(([cmd, desc]) => (
                <tr key={cmd}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top">{cmd}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-2">{t.commands.lifecycleFlow}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t.commands.lifecycleFlowDesc}
        </p>
        <div className="border-l border-border pl-3 space-y-1 text-xs text-muted-foreground mb-6">
          <div>1. <code className="bg-muted px-1 rounded">/reap.start</code> → Create generation</div>
          <div>2. <code className="bg-muted px-1 rounded">/reap.objective</code> → Define goal</div>
          <div>3. <code className="bg-muted px-1 rounded">/reap.next</code></div>
          <div>4. <code className="bg-muted px-1 rounded">/reap.planning</code> → Plan tasks</div>
          <div>5. <code className="bg-muted px-1 rounded">/reap.next</code></div>
          <div>6. <code className="bg-muted px-1 rounded">/reap.implementation</code> → Build</div>
          <div>7. <code className="bg-muted px-1 rounded">/reap.next</code></div>
          <div>8. <code className="bg-muted px-1 rounded">/reap.validation</code> → Verify</div>
          <div>9. <code className="bg-muted px-1 rounded">/reap.next</code></div>
          <div>10. <code className="bg-muted px-1 rounded">/reap.completion</code> → Retrospect</div>
          <div>11. <code className="bg-muted px-1 rounded">/reap.next</code> → Archive, generation ends</div>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-2">{t.commands.commandStructure}</h3>
        <p className="text-xs text-muted-foreground mb-6">
          {t.commands.commandStructureDesc}
        </p>

      </DocPage>
    </DocLayout>
  );
}
