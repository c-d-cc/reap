import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function SkillsPage() {
  const t = useT();
  const s = t.skills;
  return (
    <DocLayout>
      <DocPage title={s.title} breadcrumb={s.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{s.intro}</p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-3">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {s.tableHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {s.table.map(([name, when]) => (
                <tr key={name}>
                  <td className="px-4 py-2 font-mono text-xs text-primary whitespace-nowrap align-top">{name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-8 leading-relaxed">{s.tableNote}</p>

        <div className="space-y-6">
          {s.skillList.map((skill) => (
            <div key={skill.name} className="border border-border rounded-md p-4">
              <h2 className="text-sm font-mono font-semibold text-primary mb-2">{skill.name}</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold text-foreground">{s.whenLabel}</span> <span className="text-muted-foreground">{skill.when}</span></p>
                <p><span className="font-semibold text-foreground">{s.whatLabel}</span> <span className="text-muted-foreground">{skill.what}</span></p>
                <p><span className="font-semibold text-foreground">{s.notCalledLabel}</span> <span className="text-muted-foreground">{skill.notCalled}</span></p>
              </div>
            </div>
          ))}
        </div>
      </DocPage>
    </DocLayout>
  );
}
