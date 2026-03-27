import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function SelfEvolvingPage() {
  const t = useT();
  const s = t.selfEvolvingPage;
  return (
    <DocLayout>
      <DocPage title={s.title} breadcrumb={s.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {s.intro}
        </p>

        {/* Gap-Driven Goal Selection */}
        <h2 className="text-base font-semibold text-foreground mb-2">{s.gapDrivenTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {s.gapDrivenDesc}
        </p>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mb-4">
          {s.gapDrivenSteps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          {s.gapDrivenNote}
        </p>

        {/* Human Judges Fitness */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{s.fitnessTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {s.fitnessDesc}
        </p>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          {s.fitnessNote}
        </p>

        {/* Clarity-Driven Interaction */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{s.clarityTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {s.clarityDesc}
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {s.clarityHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {s.clarityRows.map((row, i) => (
                <tr key={i}>
                  <td className={`px-4 py-2 font-mono text-xs ${i === 0 ? "text-green-400" : i === 1 ? "text-yellow-400" : "text-red-400"}`}>{row[0]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Cruise Mode */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{s.cruiseTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {s.cruiseDesc}
        </p>

        <CodeBlock language="bash">{`# Enable cruise mode for 5 generations
reap cruise 5`}</CodeBlock>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">{s.cruiseActivation}</strong> {s.cruiseActivationDesc}</p>
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">{s.cruiseGoalSelection}</strong> {s.cruiseGoalSelectionDesc}</p>
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">{s.cruiseFitness}</strong> {s.cruiseFitnessDesc}</p>
        </div>

        <div className="border-l-2 border-primary/30 pl-4 py-2 mb-6 bg-muted/30 rounded-r-md">
          <p className="text-xs text-muted-foreground italic">
            <strong>{s.cruisePause}</strong> {s.cruisePauseDesc}
          </p>
        </div>

        {/* Memory System */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{s.memoryTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {s.memoryDesc}
        </p>

        <CodeBlock language="text">{`.reap/vision/memory/
  longterm.md    # Project lifetime — lasting lessons, decision rationale
  midterm.md     # Multi-generation — ongoing work context, plans
  shortterm.md   # 1-2 sessions — next session handoff, immediate context`}</CodeBlock>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {s.memoryHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {s.memoryRows.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{row[0]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[2]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mb-2"><strong className="text-foreground">{s.memoryRulesTitle}</strong></p>
        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mb-6">
          {s.memoryRules.map((rule, i) => <li key={i}>{rule}</li>)}
        </ul>

        {/* Vision & Gap-driven Evolution */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{s.visionEvolutionTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {s.visionEvolutionDesc}
        </p>

        <div className="space-y-3 mb-4">
          {s.visionSteps.map((step, i) => (
            <div key={i} className="border-l-2 border-border hover:border-primary transition-colors pl-3">
              <div className="text-sm font-semibold text-foreground mb-1">{step.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <CodeBlock language="markdown">{`# goals.md example
- [x] Core lifecycle engine (learning -> completion)
- [x] Genome 3-file structure
- [ ] Distributed merge workflow
  - [x] Detect + mate stages
  - [ ] Reconcile stage with genome-source consistency check
- [ ] Plugin system for custom stage logic`}</CodeBlock>

      </DocPage>
    </DocLayout>
  );
}
