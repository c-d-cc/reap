import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

function CommandTable({ headers, commands }: { headers: string[]; commands: string[][] }) {
  return (
    <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {headers.map((h, i) => (
              <th key={h} className={`text-left px-4 py-2 text-xs font-semibold text-muted-foreground ${i === 0 ? "w-52" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {commands.map(([cmd, desc]) => (
            <tr key={cmd}>
              <td className="px-4 py-2 font-mono text-xs text-primary align-top">{cmd}</td>
              <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CommandReferencePage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.commands.title} breadcrumb={t.commands.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {t.commands.slashIntro}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3">{t.commands.normalTitle}</h2>
        <CommandTable headers={t.commands.commandHeaders} commands={t.commands.normalCommands} />

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.commands.mergeTitle}</h2>
        <CommandTable headers={t.commands.commandHeaders} commands={t.commands.mergeCommands} />

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.commands.generalTitle}</h2>
        <CommandTable headers={t.commands.commandHeaders} commands={t.commands.generalCommands} />

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.commands.commandStructure}</h2>
        <p className="text-xs text-muted-foreground mb-3">
          {t.commands.commandStructureDesc}
        </p>

        <h3 className="text-sm font-semibold text-muted-foreground mb-2 mt-8">CLI Commands (reference)</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t.commands.cliCommandsDesc}
        </p>

      </DocPage>
    </DocLayout>
  );
}
