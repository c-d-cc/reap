import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function MergeLifecyclePage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.mergeGeneration.title} breadcrumb={t.mergeGeneration.breadcrumb} badge="Need User Feedback">

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.mergeGeneration.intro}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.mergeGeneration.whyLonger}</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {t.mergeGeneration.whyLongerDesc}
        </p>
        <div className="flex flex-col gap-2 mb-6">
          {t.mergeGeneration.whyLongerPoints.map((point) => (
            <div key={point.label} className="border-l-2 border-primary/40 pl-3 py-1">
              <span className="text-xs font-semibold text-foreground">{point.label}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{point.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.mergeGeneration.whyGenomeFirst}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.mergeGeneration.whyGenomeFirstDesc}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3">{t.mergeGeneration.stageOrder}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.mergeGeneration.stageHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.mergeGeneration.stages.map((stage) => (
                <tr key={stage.name}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{stage.name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{stage.desc}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground"><code className="bg-muted px-1 rounded">{stage.artifact}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.mergeGeneration.conflictTypes}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.mergeGeneration.conflictHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.mergeGeneration.conflicts.map(([type, desc, resolution]) => (
                <tr key={type}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{type}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.mergeGeneration.regression}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.mergeGeneration.regressionDesc}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.mergeGeneration.currentYml}</h2>

      </DocPage>
    </DocLayout>
  );
}
