import { Link } from "wouter";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function ClaimBarrierPage() {
  const t = useT();
  const c = t.claimBarrierPage;
  return (
    <DocLayout>
      <DocPage title={c.title} breadcrumb={c.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{c.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{c.sharedStateTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.sharedStateDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.claimTitle}</h2>
        <CodeBlock language="bash">{c.claimCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-3 leading-relaxed">{c.claimDesc}</p>
        <h3 className="text-sm font-semibold text-foreground mb-2 mt-4">{c.claimExampleTitle}</h3>
        <CodeBlock language="text">{c.claimExampleCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-8">{c.barrierTitle}</h2>
        <CodeBlock language="bash">{c.barrierCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-3 leading-relaxed">{c.barrierDesc}</p>
        <h3 className="text-sm font-semibold text-foreground mb-2 mt-4">{c.barrierExampleTitle}</h3>
        <CodeBlock language="text">{c.barrierExampleCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-8">{c.rosterStatusTitle}</h2>
        <CodeBlock language="bash">{c.rosterStatusCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{c.rosterStatusDesc}</p>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/orchestrate" className="text-primary hover:underline">{c.backLinkText}</Link>
        </p>
      </DocPage>
    </DocLayout>
  );
}
