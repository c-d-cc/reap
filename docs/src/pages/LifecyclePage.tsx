import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { Link } from "wouter";
import { useT } from "@/i18n";

export default function LifecyclePage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.lifecyclePage.title} breadcrumb={t.lifecyclePage.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.lifecyclePage.intro}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2">{t.workflow.evolveTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {t.workflow.evolveDesc}
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          {t.workflow.evolveNote.includes("Command Reference") ? (
            <>{t.workflow.evolveNote.split("Command Reference")[0]}<Link href="/docs/command-reference" className="text-primary hover:underline">Command Reference</Link>{t.workflow.evolveNote.split("Command Reference")[1]}</>
          ) : (
            <>{t.workflow.evolveNote.split("커맨드 레퍼런스")[0]}<Link href="/docs/command-reference" className="text-primary hover:underline">커맨드 레퍼런스</Link>{t.workflow.evolveNote.split("커맨드 레퍼런스")[1]}</>
          )}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.workflow.stageWalkthrough}</h2>

        <div className="space-y-5 mb-6">
          {t.workflow.stageDetails.map((stage) => (
            <div key={stage.title} className="border-l-2 border-border hover:border-primary transition-colors pl-3">
              <div className="text-sm font-semibold text-foreground mb-1">{stage.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                {stage.desc}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Output: <code className="bg-muted px-1 rounded">{stage.output.split(" — ")[0]}</code> — {stage.output.split(" — ").slice(1).join(" — ")}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.workflow.microLoop}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {t.workflow.microLoopDesc}
        </p>
        <p className="text-sm text-muted-foreground mb-2 font-medium text-foreground">{t.workflow.artifactHandling}</p>
        <ul className="text-xs text-muted-foreground space-y-1 mb-6 pl-3 border-l border-border">
          {t.workflow.artifactRules.map((rule) => (
            <li key={rule.label}><strong className="text-foreground">{rule.label}</strong> {rule.desc}</li>
          ))}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.workflow.minorFix}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.workflow.minorFixDesc}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.workflow.roleSeparation}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.workflow.roleHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.workflow.roles.map(([who, role]) => (
                <tr key={who}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{who}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </DocPage>
    </DocLayout>
  );
}
