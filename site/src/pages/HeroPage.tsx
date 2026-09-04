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
      <div className="max-w-5xl mx-auto">
        <div className="max-w-5xl">
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
  const h = t.hero;
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <AppNavbar showGetStarted />
      <main className="flex-1 pt-11 md:pt-14 overflow-hidden flex justify-center">
        <div className="w-full max-w-5xl overflow-y-auto flex flex-col">

        {/* Header */}
        <section className="border-b border-border px-6 py-10 md:px-8">
          <div className="max-w-5xl mx-auto">
          <div className="max-w-5xl">
            <div className="text-xs font-mono text-muted-foreground border border-border rounded px-2 py-0.5 inline-block mb-4">
              {h.tagline}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight flex items-center gap-3">
              <img src={logoPath} alt="REAP" className="w-8 h-8" />
              {h.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-5 max-w-3xl leading-relaxed">
              {h.description}
            </p>
            <div className="flex items-center gap-3">
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-sm">
                <Link href="/docs/introduction">{h.getStarted}</Link>
              </Button>
              <a href="https://github.com/c-d-cc/reap" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer rounded px-2 py-1">
                <Github className="w-4 h-4" />GitHub
              </a>
            </div>
          </div>
          </div>
        </section>

        {/* Why REAP */}
        <Section title={h.whyReap}>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {h.whyReapDesc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
            {h.problems.map((item) => (
              <div key={item.problem} className="border border-border rounded-md p-3 bg-card">
                <div className="text-xs font-semibold text-foreground mb-1">{item.problem}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.solution}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Three Layers */}
        <Section title={h.threeLayer}>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {h.threeLayerDesc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            {h.layers.map((item) => (
              <div key={item.label} className="border border-border rounded-md p-3 bg-card">
                <div className="font-semibold text-foreground text-sm">{item.label}</div>
                <div className="text-xs text-primary mt-0.5 mb-1">{item.sub}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Install */}
        <Section title={h.installation}>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">{h.installStep1}</div>
              <CodeBlock language="bash">{`npm i -g @c-d-cc/reap@next`}</CodeBlock>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">{h.installStep2}</div>
              <CodeBlock language="bash">{`claude
> /reap:init
> /reap:evolve`}</CodeBlock>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {h.installNote}{" "}
            <Link href="/docs/install" className="text-primary hover:underline">{h.installLinkText}</Link>
          </p>
        </Section>

        {/* Key Principles */}
        <Section title={h.keyConcepts}>
          <div className="space-y-3">
            {h.concepts.map((item) => (
              <div key={item.label} className="border-l-2 border-border hover:border-primary transition-colors pl-3 py-0.5">
                <div className="text-xs font-semibold text-foreground mb-0.5">{item.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Docs Links */}
        <section className="px-6 py-8 pb-24 md:px-8 md:pb-8">
          <div className="max-w-5xl mx-auto">
        <div className="max-w-5xl">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{h.documentation}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {h.docLinks.map((item) => (
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
