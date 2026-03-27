import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function HookReferencePage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.hooks.title} breadcrumb={t.hooks.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.hooks.intro}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3">{t.hooks.hookTypes}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.hooks.hookTypesIntro}</p>
        <div className="space-y-3 mb-6">
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">{t.hooks.commandType}</div>
            <p className="text-xs text-muted-foreground">{t.hooks.commandTypeDesc}</p>
          </div>
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">{t.hooks.promptType}</div>
            <p className="text-xs text-muted-foreground">{t.hooks.promptTypeDesc}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-6">{t.hooks.hookTypeNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.hooks.fileNaming}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.hooks.fileNamingDesc}</p>
        <p className="text-sm text-muted-foreground mb-3">{t.hooks.fileNamingFrontmatter}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.hooks.frontmatterHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.hooks.frontmatterItems.map(([field, desc]) => (
                <tr key={field}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{field}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.hooks.events}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.hooks.eventHeaders.map((h) => (
                  <th key={h} className={`text-left px-4 py-2 text-xs font-semibold text-muted-foreground ${h === t.hooks.eventHeaders[0] ? "w-52" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.hooks.eventItems.map(([event, when]) => (
                <tr key={event}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{event}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.hooks.configuration}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.hooks.configurationDesc}</p>
        <CodeBlock language="text">{t.hooks.configExample}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.hooks.hookSuggestion}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t.hooks.hookSuggestionDesc}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.hooks.executionNotes}</h2>
        <ul className="text-xs text-muted-foreground space-y-2 pl-3 border-l border-border">
          {t.hooks.executionItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

      </DocPage>
    </DocLayout>
  );
}
