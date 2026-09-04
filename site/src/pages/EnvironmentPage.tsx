import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function EnvironmentPage() {
  const t = useT();
  const e = t.environmentPage;
  return (
    <DocLayout>
      <DocPage title={e.title} breadcrumb={e.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{e.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{e.filesTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {e.filesHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {e.files.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{e.useTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{e.useDesc}</p>
        <div className="border-l-2 border-primary pl-4 py-2 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">{e.notUseNote}</p>
        </div>
      </DocPage>
    </DocLayout>
  );
}
