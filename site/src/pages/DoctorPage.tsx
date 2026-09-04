import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function DoctorPage() {
  const t = useT();
  const d = t.doctorPage;
  return (
    <DocLayout>
      <DocPage title={d.title} breadcrumb={d.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{d.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{d.splitTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.splitDesc}</p>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{d.noFixDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.defectsTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {d.defectHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {d.defects.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.notesTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {d.noteHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {d.notes.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-foreground align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.guideTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.guideDesc}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {d.guideHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {d.guides.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 text-xs text-muted-foreground align-top">{row[0]}</td>
                  <td className="px-4 py-2 font-mono text-xs text-foreground align-top whitespace-nowrap">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.exampleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.exampleDesc}</p>
        <CodeBlock language="text">{d.exampleCode}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
