import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function DelegationPage() {
  const t = useT();
  const d = t.delegationPage;
  return (
    <DocLayout>
      <DocPage title={d.title} breadcrumb={d.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{d.intro}</p>
        <div className="border-l-2 border-primary pl-4 py-2 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">{d.defaultNote}</p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2">{d.signalsTitle}</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 mb-6 pl-3 border-l border-border">
          {d.signals.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.briefTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.briefDesc}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {d.briefHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {d.brief.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.disciplineTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.disciplineDesc}</p>
        <ul className="text-sm text-muted-foreground space-y-1.5 mb-6 pl-3 border-l border-border">
          {d.disciplineItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.reviewTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.reviewDesc}</p>
        <ul className="text-sm text-muted-foreground space-y-1.5 mb-6 pl-3 border-l border-border">
          {d.reviewItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.parallelTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{d.parallelDesc}</p>
      </DocPage>
    </DocLayout>
  );
}
