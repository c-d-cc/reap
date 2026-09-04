import { Link } from "wouter";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function InstallPage() {
  const t = useT();
  const i = t.install;
  return (
    <DocLayout>
      <DocPage title={i.title} breadcrumb={i.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{i.description}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{i.cliTitle}</h2>
        <CodeBlock language="bash">{i.cliCode}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">{i.cliNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.pluginTitle}</h2>
        <CodeBlock language="bash">{i.pluginCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.verifyTitle}</h2>
        <CodeBlock language="bash">{i.verifyCode}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">{i.verifyNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.uninstallTitle}</h2>
        <CodeBlock language="bash">{i.uninstallCode}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-2">{i.removeProjectNote}</p>
        <CodeBlock language="bash">{i.removeProjectCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.fromV017Title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {i.fromV017Desc}{" "}
          <Link href="/docs/migration" className="text-primary hover:underline">{i.migrationLinkText}</Link>
        </p>

        <p className="text-sm text-muted-foreground">
          {i.nextText} <Link href="/docs/quick-start" className="text-primary hover:underline">{i.quickStartLinkText}</Link>
        </p>
      </DocPage>
    </DocLayout>
  );
}
