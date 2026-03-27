import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function SelfEvolvingPage() {
  return (
    <DocLayout>
      <DocPage title="Self-Evolving Features" breadcrumb="Guide">

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          REAP is not a static framework. The AI automatically selects goals from vision and memory, the human judges fitness through natural language feedback, and the pipeline adjusts its communication style based on context clarity. These features work together to create a development pipeline that genuinely evolves alongside your project.
        </p>

        {/* Gap-Driven Goal Selection */}
        <h2 className="text-base font-semibold text-foreground mb-2">Gap-Driven Goal Selection</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          At the end of each generation (adapt phase), the AI analyzes the gap between the project's vision and its current state to propose the next goal. This is the core mechanism that makes REAP self-evolving.
        </p>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mb-4">
          <li>Read unchecked goals from <code className="bg-muted px-1 rounded">vision/goals.md</code></li>
          <li>Cross-reference with pending backlog items for priority boost</li>
          <li>Rank by impact — goals with related backlog tasks score higher</li>
          <li>Propose the top candidate to the human for approval</li>
        </ol>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          In cruise mode, goal selection happens automatically between generations without human intervention.
        </p>

        {/* Human Judges Fitness */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Human Judges Fitness</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          There are no quantitative metrics. The human's natural language feedback during the fitness phase is the only fitness signal. The AI is explicitly prohibited from scoring its own success — only self-assessment (metacognition) is allowed.
        </p>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          This ensures the project evolves toward what the human values, not toward what the AI can optimize for.
        </p>

        {/* Clarity-Driven Interaction */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Clarity-Driven Interaction</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          The AI dynamically assesses how well-defined the current context is and adjusts its communication depth accordingly. Clarity is evaluated at the start of each generation during the learning stage.
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Clarity</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Signals</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">AI Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-green-400">High</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Clear goal, defined tasks, established patterns</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Execute with minimal questions. Report results.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-yellow-400">Medium</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Direction exists, details unclear</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Present 2-3 options with tradeoffs. Let human choose.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-red-400">Low</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Ambiguous goal, conflicting constraints</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Active dialogue with examples to build shared understanding.</td>
              </tr>
            </tbody>
          </table>
        </div>


        {/* Cruise Mode */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Cruise Mode</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Pre-approve N generations for autonomous execution. The AI selects goals from vision gaps and backlog tasks, runs the full lifecycle, and self-assesses (not self-scores) each generation.
        </p>

        <CodeBlock language="bash">{`# Enable cruise mode for 5 generations
reap cruise 5`}</CodeBlock>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">Activation:</strong> Sets <code className="bg-muted px-1 rounded">cruiseCount: 1/5</code> in <code className="bg-muted px-1 rounded">config.yml</code>. The counter increments after each generation completes.</p>
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">Goal selection:</strong> During <code className="bg-muted px-1 rounded">adapt</code>, the AI analyzes gaps between <code className="bg-muted px-1 rounded">vision/goals.md</code> and the current state, then picks the highest-value next goal.</p>
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">Fitness:</strong> In cruise mode, the fitness phase uses self-assessment (metacognition) instead of waiting for human feedback. The AI is explicitly prohibited from scoring its own success.</p>
        </div>

        <div className="border-l-2 border-primary/30 pl-4 py-2 mb-6 bg-muted/30 rounded-r-md">
          <p className="text-xs text-muted-foreground italic">
            <strong>Pause conditions:</strong> Cruise automatically pauses and requests human input when: (1) uncertainty exceeds the AI's confidence threshold, (2) a decision requires human judgment (e.g., breaking API changes), or (3) the backlog contains conflicting priorities. After all N generations complete, the human reviews the batch.
          </p>
        </div>

        {/* Memory System */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Memory System</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Memory is a free-form recording system where the AI persists context across sessions and generations. Unlike Genome (modification-constrained) or Lineage (compressed over time), Memory is always accessible and freely writable.
        </p>

        <CodeBlock language="text">{`.reap/vision/memory/
  longterm.md    # Project lifetime — lasting lessons, decision rationale
  midterm.md     # Multi-generation — ongoing work context, plans
  shortterm.md   # 1-2 sessions — next session handoff, immediate context`}</CodeBlock>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Tier</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Lifespan</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Content</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Update Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">longterm</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Project lifetime</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Recurring patterns, architecture choice reasons, design lessons</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">When lessons emerge</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">midterm</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Multiple generations</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Ongoing task flow, multi-gen plans, agreed directions</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">When context changes</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">shortterm</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">1-2 sessions</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Session handoff, unfinished discussions, backlog snapshots</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Every generation (mandatory)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mb-2"><strong className="text-foreground">Rules:</strong></p>
        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mb-6">
          <li>Read and write at any time — no phase restriction, no permission needed</li>
          <li>Content and timing are the AI's judgment. No mandatory format</li>
          <li>Place content in the tier matching its expected lifespan. Promote/demote as relevance shifts</li>
          <li>Keep it scannable — bullet points over paragraphs. Empty files are a valid state</li>
          <li>Memory is git-committed with the project, accessible to any AI agent</li>
        </ul>

        {/* Vision & Gap-driven Evolution */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Vision & Gap-Driven Evolution</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Vision is the primary driver of each generation. The file <code className="bg-muted px-1 rounded">.reap/vision/goals.md</code> defines north-star objectives for the project. During the <code className="bg-muted px-1 rounded">adapt</code> phase, the AI performs gap analysis: comparing vision goals against the current state of the codebase.
        </p>

        <div className="space-y-3 mb-4">
          <div className="border-l-2 border-border hover:border-primary transition-colors pl-3">
            <div className="text-sm font-semibold text-foreground mb-1">1. Goals Definition</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The human writes high-level objectives in <code className="bg-muted px-1 rounded">goals.md</code>. Each goal is a markdown checkbox item. Goals can be nested for sub-objectives.
            </p>
          </div>
          <div className="border-l-2 border-border hover:border-primary transition-colors pl-3">
            <div className="text-sm font-semibold text-foreground mb-1">2. Gap Analysis (adapt phase)</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The AI compares unchecked goals against the current codebase, environment, and generation history. It identifies the highest-value gap and suggests it as the next generation's goal.
            </p>
          </div>
          <div className="border-l-2 border-border hover:border-primary transition-colors pl-3">
            <div className="text-sm font-semibold text-foreground mb-1">3. Auto Check-Marking</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When a generation achieves a vision goal, the AI marks the corresponding checkbox in <code className="bg-muted px-1 rounded">goals.md</code> during the adapt phase. This provides a persistent view of project progress.
            </p>
          </div>
          <div className="border-l-2 border-border hover:border-primary transition-colors pl-3">
            <div className="text-sm font-semibold text-foreground mb-1">4. Continuous Cycle</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Vision evolves too. The human updates goals as the project's direction changes. The AI references both completed and remaining goals to maintain trajectory.
            </p>
          </div>
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
