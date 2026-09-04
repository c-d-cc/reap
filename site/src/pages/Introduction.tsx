import { Link } from "wouter";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function Introduction() {
  const t = useT();
  const i = t.intro;
  return (
    <DocLayout>
      <DocPage title={i.title} breadcrumb={i.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{i.description}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{i.whatBuilds}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{i.changedTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{i.changedIntro}</p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mb-3">
          {i.changedItems.map((item, idx) => <li key={idx} className="leading-relaxed">{item}</li>)}
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          <Link href="/docs/concepts" className="text-primary hover:underline">{i.conceptsLinkText}</Link>
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{i.principlesTitle}</h2>
        <ol className="space-y-3 mb-4 list-none">
          {i.principles.map((p, idx) => (
            <li key={p.title} className="flex gap-3">
              <span className="font-mono text-xs text-primary shrink-0 w-5 text-right">{idx + 1}</span>
              <div>
                <span className="text-sm font-semibold text-foreground">{p.title}</span>
                <span className="text-sm text-muted-foreground"> — {p.desc}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          {i.principlesNote}{" "}
          <a href={i.principlesLinkHref} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            {i.principlesLinkText}
          </a>
          {i.principlesNoteAfter}
        </p>

        <p className="text-sm text-muted-foreground">
          {i.nextText} <Link href="/docs/install" className="text-primary hover:underline">{i.installLinkText}</Link>
        </p>
      </DocPage>
    </DocLayout>
  );
}
