import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function MergeCommandsPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.mergeCommands.title} breadcrumb={t.mergeCommands.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.mergeCommands.intro}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3">{t.mergeCommands.primaryCommands}</h2>
        <div className="space-y-5 mb-6">
          {t.mergeCommands.primaryItems.map((item) => (
            <div key={item.cmd} className="border-l-2 border-border hover:border-primary transition-colors pl-3">
              <div className="text-sm font-semibold text-foreground mb-1"><code className="bg-muted px-1 rounded">{item.cmd}</code></div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.mergeCommands.stageCommands}</h2>
        <div className="space-y-5 mb-6">
          {t.mergeCommands.stageItems.map((item) => (
            <div key={item.cmd} className="border-l-2 border-border hover:border-primary transition-colors pl-3">
              <div className="text-sm font-semibold text-foreground mb-1"><code className="bg-muted px-1 rounded">{item.cmd}</code></div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.mergeCommands.mergeHooks}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.mergeCommands.mergeHookHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.mergeCommands.mergeHookItems.map(([event, when]) => (
                <tr key={event}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{event}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          {t.mergeCommands.mergeHookNote}
        </p>

      </DocPage>
    </DocLayout>
  );
}
