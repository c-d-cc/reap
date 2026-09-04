import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function IdeaPage() {
  const t = useT();
  const i = t.ideaPage;
  return (
    <DocLayout>
      <DocPage title={i.title} breadcrumb={i.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{i.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{i.kindsTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {i.kindHeaders.map((h, idx) => (
                  <th key={idx} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {i.kinds.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.makeTitle}</h2>
        <CodeBlock language="bash">{i.makeCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{i.makeDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.exampleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{i.exampleDesc}</p>
        <CodeBlock language="text">{i.exampleCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.graduationTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{i.graduationDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.doctorTitle}</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 mb-6 pl-3 border-l border-border">
          {i.doctorItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.archiveTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{i.archiveDesc}</p>
        <CodeBlock language="bash">{i.archiveCode}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
