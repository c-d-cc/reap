import { Link } from "wouter";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function V018ChangePage() {
  const t = useT();
  const v = t.v018change;
  return (
    <DocLayout>
      <DocPage title={v.title} breadcrumb={v.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{v.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{v.tableTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {v.tableHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {v.table.map(([before, after]) => (
                <tr key={before}>
                  <td className="px-4 py-2 text-xs text-muted-foreground align-top">{before}</td>
                  <td className="px-4 py-2 text-xs text-foreground align-top">{after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.goneTitle}</h2>
        <ul className="space-y-2 mb-6 list-none p-0">
          {v.goneItems.map(([gone, replacement]) => (
            <li key={gone} className="text-sm leading-relaxed">
              <span className="text-muted-foreground">{gone}</span>
              <span className="text-foreground"> — {replacement}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.sameTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{v.sameDesc}</p>

        <p className="text-sm text-muted-foreground">
          {v.migrateNote}{" "}
          <Link href="/docs/migration" className="text-primary hover:underline">{v.migrateLinkText}</Link>
        </p>
      </DocPage>
    </DocLayout>
  );
}
