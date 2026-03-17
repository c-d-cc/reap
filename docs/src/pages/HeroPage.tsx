import { Link } from "wouter";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import logoPath from "@assets/favicon_1773735683357.png";
import { AppNavbar } from "@/components/AppNavbar";
import { Footer } from "@/components/Footer";

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border px-6 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="max-w-3xl">
          {title && (
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{title}</div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

export function HeroPage() {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <AppNavbar showGetStarted />
      <main className="flex-1 pt-11 md:pt-14 overflow-hidden flex justify-center">
        <div className="w-full max-w-4xl overflow-y-auto flex flex-col">

        {/* Header */}
        <section className="border-b border-border px-6 py-10 md:px-8">
          <div className="max-w-4xl mx-auto">
          <div className="max-w-3xl">
            <div className="text-xs font-mono text-muted-foreground border border-border rounded px-2 py-0.5 inline-block mb-4">
              Recursive Evolutionary Autonomous Pipeline
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight flex items-center gap-3">
              <img src={logoPath} alt="REAP" className="w-8 h-8" />
              REAP Documentation
            </h1>
            <p className="text-sm text-muted-foreground mb-5 max-w-2xl leading-relaxed">
              A development pipeline where AI and humans collaborate to incrementally evolve an Application across successive Generations. Persistent context, structured lifecycle, living design docs.
            </p>
            <div className="flex items-center gap-3">
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-sm">
                <Link href="/docs/introduction">Get Started →</Link>
              </Button>
              <a href="https://github.com/c-d-cc/reap" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-4 h-4" />GitHub
              </a>
            </div>
          </div>
          </div>
        </section>

        {/* Why REAP */}
        <Section title="Why REAP?">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            AI agents are powerful — but without structure, development becomes chaotic. Context resets every session. Code changes scatter without purpose. Design docs drift from reality. Lessons from past work vanish.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
            {[
              { problem: "Context loss", solution: "SessionStart Hook injects full project context into every new session" },
              { problem: "Scattered development", solution: "Each generation focuses on one objective through a structured lifecycle" },
              { problem: "Design–code drift", solution: "Genome mutations discovered during implementation feed back via backlog" },
              { problem: "Forgotten lessons", solution: "Retrospectives accumulate in Genome. Lineage archives all generations" },
            ].map((item) => (
              <div key={item.problem} className="border border-border rounded-md p-3 bg-card">
                <div className="text-xs font-semibold text-foreground mb-1">{item.problem}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.solution}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 3-Layer Model */}
        <Section title="3-Layer Model">
          <p className="text-sm text-muted-foreground mb-4">
            Every REAP project consists of three conceptual layers. The Genome defines what to build. The Evolution process builds it. The Civilization is the result.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch border border-border rounded-md overflow-hidden text-sm mb-4">
            {[
              { label: "Genome", sub: "Design & Knowledge", path: ".reap/genome/", desc: "Architecture principles, business rules, conventions, technical constraints. Never modified mid-generation." },
              { label: "Evolution", sub: "Generational Process", path: ".reap/life/ → .reap/lineage/", desc: "Each Generation runs Objective → Planning → Implementation → Validation → Completion. On completion, archived to lineage." },
              { label: "Civilization", sub: "Source Code", path: "your codebase/", desc: "Everything outside .reap/. Grows and improves with each completed generation." },
            ].map((item, i, arr) => (
              <div key={item.label} className={`flex-1 px-4 py-3 bg-card ${i < arr.length - 1 ? "border-b sm:border-b-0 sm:border-r border-border" : ""}`}>
                <div className="font-semibold text-foreground text-sm">{item.label}</div>
                <div className="text-xs text-primary mt-0.5 mb-1">{item.sub}</div>
                <div className="text-xs font-mono text-muted-foreground mb-2">{item.path}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Generation Lifecycle */}
        <Section title="Generation Lifecycle">
          <p className="text-sm text-muted-foreground mb-4">
            Each generation progresses through five stages, from goal definition to retrospective and archiving.
          </p>
          <div className="flex items-center gap-1.5 flex-wrap mb-5">
            {["Objective", "→", "Planning", "→", "Implementation", "⟷", "Validation", "→", "Completion"].map((s, i) =>
              s === "→" || s === "⟷"
                ? <span key={i} className="text-xs text-muted-foreground">{s}</span>
                : <span key={i} className="text-xs font-mono bg-muted text-foreground border border-border rounded px-2 py-0.5">{s}</span>
            )}
          </div>
          <div className="border border-border rounded-md overflow-x-auto text-sm">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground w-32">Stage</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">What happens</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground w-48">Artifact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Objective", "Define goal, requirements, and acceptance criteria", "01-objective.md"],
                  ["Planning", "Break down tasks, choose approach, map dependencies", "02-planning.md"],
                  ["Implementation", "Build with AI + human collaboration", "03-implementation.md"],
                  ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
                  ["Completion", "Retrospective + apply Genome changes + archive generation", "05-completion.md"],
                ].map(([stage, what, artifact]) => (
                  <tr key={stage}>
                    <td className="px-3 py-2 font-mono text-xs text-primary">{stage}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{what}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{artifact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Install */}
        <Section title="Installation">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">1. Install globally</div>
              <CodeBlock language="bash">{`# npm
npm install -g @c-d-cc/reap

# or Bun
bun install -g @c-d-cc/reap`}</CodeBlock>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">2. Initialize your project</div>
              <CodeBlock language="bash">{`# New project
reap init my-project

# Existing project
cd my-project
reap init`}</CodeBlock>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">3. Run your first generation (in Claude Code)</div>
              <CodeBlock language="bash">{`claude
> /reap.evolve "Implement user authentication"`}</CodeBlock>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <code className="bg-muted px-1 rounded">/reap.evolve</code> runs the full generation lifecycle — Objective through Completion — interactively.
            You can also control each stage manually with <Link href="/docs/workflow" className="text-primary hover:underline">stage commands</Link>.
          </p>
        </Section>

        {/* Key Concepts */}
        <Section title="Key Concepts">
          <div className="space-y-3">
            {[
              {
                label: "Genome Immutability",
                desc: "The Genome is never modified mid-generation. Design issues discovered during Implementation are logged to the backlog as genome-change items and applied only at Completion."
              },
              {
                label: "Backlog & Deferral",
                desc: "Items in .reap/life/backlog/ carry a type: genome-change | environment-change | task. Partial completion is normal — deferred tasks carry forward to the next generation's Objective."
              },
              {
                label: "SessionStart Hook",
                desc: "Every new Claude session automatically injects the full Genome, current generation state, and workflow rules — eliminating context loss between sessions."
              },
              {
                label: "Lineage",
                desc: "Completed generations are archived in .reap/lineage/. Retrospectives accumulate there. Over time they're compressed (Level 1 → gen-XXX.md, Level 2 → epoch-XXX.md) to stay manageable."
              },
              {
                label: "Four-Axis Structure",
                desc: "Everything under .reap/ maps to four axes: Genome (design), Environment (external context), Life (current generation), Lineage (archive of past generations)."
              },
            ].map((item) => (
              <div key={item.label} className="border-l-2 border-border hover:border-primary transition-colors pl-3 py-0.5">
                <div className="text-xs font-semibold text-foreground mb-0.5">{item.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </Section>



        {/* Docs Links */}
        <section className="px-6 py-8 md:px-8">
          <div className="max-w-4xl mx-auto">
        <div className="max-w-3xl">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Documentation</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { href: "/docs/introduction", title: "Introduction", desc: "What is REAP, why use it, 3-layer model, four-axis structure." },
                { href: "/docs/quick-start", title: "Quick Start", desc: "Install and run your first generation step by step." },
                { href: "/docs/core-concepts", title: "Core Concepts", desc: "Genome, Life Cycle, Backlog & Deferral in depth." },
                { href: "/docs/workflow", title: "Workflow", desc: "/reap.evolve, stage commands, micro loop, hooks." },
                { href: "/docs/cli", title: "CLI Reference", desc: "reap init, status, update, fix with all options." },
                { href: "/docs/commands", title: "Command Reference", desc: "/reap.evolve, stage commands, /reap.status — all slash commands." },
                { href: "/docs/hooks", title: "Hook Reference", desc: "Lifecycle hooks: command and prompt types, events, SessionStart." },
                { href: "/docs/advanced", title: "Advanced", desc: "Lineage compression, presets, entry modes, comparisons." },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="group flex items-start justify-between border border-border rounded-md p-3 bg-card hover:border-primary/50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                  </div>
                  <span className="text-muted-foreground group-hover:text-primary text-xs mt-0.5 ml-3 shrink-0 transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>
          </div>
        </section>

        <Footer />
        </div>
      </main>
    </div>
  );
}
