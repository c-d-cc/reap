import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function CodeIndexPage() {
  const t = useT();
  const d = t.codeIndex;
  return (
    <DocLayout>
      <DocPage title={d.title} breadcrumb={d.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{d.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{d.subcommandsTitle}</h2>
        <CodeBlock language="bash">{d.subcommandsCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{d.commitNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.whenTitle}</h2>
        <div className="space-y-3 mb-6">
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">{d.indexWhenTitle}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{d.indexWhenDesc}</p>
          </div>
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">{d.grepWhenTitle}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{d.grepWhenDesc}</p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.resolutionTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.resolutionDesc}</p>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{d.callResolutionNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{d.noInstallTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{d.noInstallDesc}</p>
      </DocPage>
    </DocLayout>
  );
}
