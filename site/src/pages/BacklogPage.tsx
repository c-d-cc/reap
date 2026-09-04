import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function BacklogPage() {
  const t = useT();
  const b = t.backlogPage;
  return (
    <DocLayout>
      <DocPage title={b.title} breadcrumb={b.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{b.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{b.makeTitle}</h2>
        <CodeBlock language="bash">{b.makeCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{b.makeDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.groundsTitle}</h2>
        <CodeBlock language="bash">{b.groundsCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{b.groundsDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.consumeTitle}</h2>
        <CodeBlock language="bash">{b.consumeCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{b.consumeDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.lifeTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{b.lifeDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.overlapTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{b.overlapDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.exampleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{b.exampleDesc}</p>
        <CodeBlock language="text">{b.exampleCode}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
