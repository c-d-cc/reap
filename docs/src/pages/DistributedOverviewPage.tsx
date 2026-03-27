import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function DistributedOverviewPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.collaboration.title} breadcrumb={t.collaboration.breadcrumb} badge="Need User Feedback">

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {t.collaboration.intro}
        </p>

        <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-md px-4 py-3 mb-6">
          <p className="text-xs text-yellow-200/80 leading-relaxed">
            ⚠ {t.collaboration.caution}{" "}
            <a href={t.collaboration.cautionUrl} target="_blank" rel="noreferrer" className="text-yellow-300 hover:underline">{t.collaboration.cautionLink}</a>
          </p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2">{t.collaboration.howItWorks}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {t.collaboration.howItWorksDesc}
        </p>
        <ol className="text-xs text-muted-foreground space-y-1 mb-6 pl-3 border-l border-border list-decimal list-inside">
          {t.collaboration.flowSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.collaboration.principles}</h2>
        <div className="space-y-5 mb-6">
          {t.collaboration.principleItems.map((item) => (
            <div key={item.label} className="border-l-2 border-border hover:border-primary transition-colors pl-3">
              <div className="text-sm font-semibold text-foreground mb-1">{item.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.collaboration.scenarios}</h2>
        <div className="space-y-5 mb-6">
          {t.collaboration.scenarioItems.map((item) => (
            <div key={item.label} className="border-l-2 border-border hover:border-primary transition-colors pl-3">
              <div className="text-sm font-semibold text-foreground mb-1">{item.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                {item.desc}
              </p>
              {"example" in item && item.example && (
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.example}</code>
              )}
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.collaboration.pullPush}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {t.collaboration.pullDesc}
        </p>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.collaboration.pushDesc}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.collaboration.merge}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.collaboration.mergeDesc}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.collaboration.gitRefReading}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.collaboration.gitRefDesc}
        </p>

      </DocPage>
    </DocLayout>
  );
}
