import { Link } from "wouter";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import logoPath from "@assets/favicon_1773735683357.png";
import { AppNavbar } from "@/components/AppNavbar";
import { Footer } from "@/components/Footer";
import { useT } from "@/i18n";

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
  const t = useT();
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
              {t.hero.tagline}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight flex items-center gap-3">
              <img src={logoPath} alt="REAP" className="w-8 h-8" />
              {t.hero.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-5 max-w-2xl leading-relaxed">
              {t.hero.description}
            </p>
            <div className="flex items-center gap-3">
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-sm">
                <Link href="/docs/introduction">{t.hero.getStarted}</Link>
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
        <Section title={t.hero.whyReap}>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {t.hero.whyReapDesc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
            {t.hero.problems.map((item) => (
              <div key={item.problem} className="border border-border rounded-md p-3 bg-card">
                <div className="text-xs font-semibold text-foreground mb-1">{item.problem}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.solution}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 3-Layer Model */}
        <Section title={t.hero.threeLayer}>
          <p className="text-sm text-muted-foreground mb-4">
            {t.hero.threeLayerDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch border border-border rounded-md overflow-hidden text-sm mb-4">
            {t.hero.layers.map((item, i, arr) => (
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
        <Section title={t.hero.lifecycle}>
          <p className="text-sm text-muted-foreground mb-4">
            {t.hero.lifecycleDesc}
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
                  {t.hero.stageHeaders.map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {t.hero.stages.map(([stage, what, artifact]) => (
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
        <Section title={t.hero.installation}>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t.hero.installStep1}</div>
              <CodeBlock language="bash">{`# npm
npm install -g @c-d-cc/reap

# or Bun
bun install -g @c-d-cc/reap`}</CodeBlock>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t.hero.installStep2}</div>
              <CodeBlock language="bash">{`# New project
reap init my-project

# Existing project
cd my-project
reap init`}</CodeBlock>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t.hero.installStep3}</div>
              <CodeBlock language="bash">{`claude
> /reap.evolve "Implement user authentication"`}</CodeBlock>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <code className="bg-muted px-1 rounded">{t.hero.installNote[0].code}</code>{t.hero.installNote[0].after}
            <Link href="/docs/workflow" className="text-primary hover:underline">{t.hero.installNote[1].linkText}</Link>{t.hero.installNote[1].after}
          </p>
        </Section>

        {/* Key Concepts */}
        <Section title={t.hero.keyConcepts}>
          <div className="space-y-3">
            {t.hero.concepts.map((item) => (
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
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t.hero.documentation}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {t.hero.docLinks.map((item) => (
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
