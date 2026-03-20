import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function Introduction() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.intro.title} breadcrumb={t.intro.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {t.intro.description}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.intro.threeLayer}</h2>
        <div className="flex items-stretch border border-border rounded-md overflow-hidden text-sm mb-6">
          {t.intro.layerItems.map((item, i, arr) => (
            <div key={item.label} className={`flex-1 px-4 py-3 ${i < arr.length - 1 ? "border-r border-border" : ""}`}>
              <div className="font-semibold text-foreground text-sm">{item.label}</div>
              <div className="text-xs text-primary mt-0.5 mb-1">{item.sub}</div>
              <div className="text-xs font-mono text-muted-foreground">{item.path}</div>
            </div>
          ))}
        </div>

        <ul className="text-sm space-y-2 mb-8">
          {t.intro.layerItems.map((item, i) => (
            <li key={item.label} className="flex gap-4">
              <span className="text-primary font-mono mt-0.5 shrink-0 w-28">{item.label}</span>
              <span className="text-muted-foreground">{t.intro.layerDescs[i]}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.intro.whyReap}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{t.intro.problemHeader}</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{t.intro.solutionHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.intro.problems.map(([problem, solution]) => (
                <tr key={problem}>
                  <td className="px-4 py-2.5 text-muted-foreground align-top">{problem}</td>
                  <td className="px-4 py-2.5 text-foreground align-top">{solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.intro.projectStructure}</h2>
        <CodeBlock language="text">{`my-project/
├── src/                          # Civilization (your code)
└── .reap/
    ├── config.yml                # Project configuration
    ├── genome/                   # Genetic information
    │   ├── principles.md
    │   ├── domain/
    │   ├── conventions.md
    │   └── constraints.md
    ├── environment/              # External context
    ├── life/                     # Current generation
    │   ├── current.yml
    │   └── backlog/
    └── lineage/                  # Completed generation archive

~/.claude/                        # Claude Code (installed by reap init)
├── commands/                     # Slash commands (/reap.*)
└── settings.json                 # SessionStart hook registration

~/.config/opencode/               # OpenCode (if detected)
└── plugins/                      # SessionStart plugin`}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
