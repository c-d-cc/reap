import { Link } from "wouter";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function QuickStartPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.quickstart.title} breadcrumb={t.quickstart.breadcrumb}>

        <div className="border border-orange-500/30 bg-orange-500/5 rounded-md px-4 py-3 mb-6">
          <p className="text-sm text-orange-400">
            Upgrading from v0.15? See the <Link href="/docs/migration-guide" className="text-orange-300 underline hover:text-orange-200">Migration Guide</Link> instead.
          </p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2">{t.quickstart.prerequisites}</h2>
        <div className="space-y-1.5 mb-6">
          {t.quickstart.prerequisiteItems.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${item.required ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                {item.required ? t.quickstart.required : t.quickstart.optional}
              </span>
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="text-xs text-muted-foreground">— {item.desc}</span>
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2">{t.quickstart.install}</h2>
        <p className="text-xs text-muted-foreground mb-2">Global installation required. Local project-level installation is blocked.</p>
        <CodeBlock language="bash">{`# npm
npm install -g @c-d-cc/reap

# or Bun
bun install -g @c-d-cc/reap`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.quickstart.initProject}</h2>
        <CodeBlock language="bash">{`# In Claude Code, initialize REAP in your project
> /reap.init`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.quickstart.runFirst}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.quickstart.runFirstDesc}</p>
        <CodeBlock language="bash">{`# Start a generation — /reap.start will prompt for a goal
> /reap.evolve`}</CodeBlock>

        <div className="border-l-2 border-primary pl-4 py-2 mt-4 mb-6">
          <div className="text-sm font-semibold text-foreground mb-1">
            <code className="text-primary">/reap.evolve</code> {t.quickstart.evolveTitle.replace(/^\/?reap\.evolve\s?/, "")}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.quickstart.evolveDesc}
          </p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.quickstart.manualControl}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.quickstart.manualControlDesc}</p>
        <CodeBlock language="bash">{`> /reap.start            # Start a new generation (prompts for goal)
> /reap.next             # Advance to next stage
> /reap.back             # Return to previous stage`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.quickstart.whatHappens}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.quickstart.stageHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.quickstart.stages.map(([stage, what, artifact]) => (
                <tr key={stage}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{stage}</td>
                  <td className="px-4 py-2 text-muted-foreground">{what}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{artifact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{t.quickstart.commandLoading}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.quickstart.commandLoadingDesc}</p>
        <div className="space-y-2">
          {t.quickstart.commandLoadingDetails.map((item) => (
            <div key={item.label} className="flex gap-2 text-sm">
              <span className="font-mono text-xs text-primary whitespace-nowrap">{item.label}</span>
              <span className="text-muted-foreground">— {item.desc}</span>
            </div>
          ))}
        </div>
      </DocPage>
    </DocLayout>
  );
}
