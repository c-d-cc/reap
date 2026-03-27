import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function GenomePage() {
  const t = useT();
  const g = t.genomePage;
  return (
    <DocLayout>
      <DocPage title={g.title} breadcrumb={g.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-4">{g.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{g.structureTitle}</h2>
        <CodeBlock language="text">{g.structure}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.principlesTitle}</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
          {g.principles.map((p, i) => <li key={i}>{p}</li>)}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.immutabilityTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{g.immutabilityDesc}</p>
        <div className="border-l-2 border-primary/30 pl-4 py-2 mb-4 bg-muted/30 rounded-r-md">
          <p className="text-sm text-muted-foreground italic">{g.immutabilityWhy}</p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.contextTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{g.contextDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.evolutionTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{g.evolutionDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.syncTitle}</h2>
        <p className="text-sm text-muted-foreground">{g.syncDesc}</p>
      </DocPage>
    </DocLayout>
  );
}
