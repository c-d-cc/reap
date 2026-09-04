import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function ReleaseNotesPage() {
  const t = useT();
  const r = t.releaseNotes;
  return (
    <DocLayout>
      <DocPage title={r.title} breadcrumb={r.breadcrumb}>
        <p className="text-xs text-muted-foreground mb-6">
          {r.sourceNote}{" "}
          <a href="https://github.com/c-d-cc/reap/blob/main/RELEASE_NOTES.md" target="_blank" rel="noreferrer" className="text-primary hover:underline">
            RELEASE_NOTES.md
          </a>
        </p>

        <div className="border border-border rounded-md p-5">
          <h2 className="text-base font-semibold text-foreground mb-3">v{r.version}</h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{r.summary}</p>

          <h3 className="text-sm font-semibold text-foreground mb-2">{r.changedTitle}</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mb-5">
            {r.changed.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
          </ul>

          <h3 className="text-sm font-semibold text-foreground mb-2">{r.removedTitle}</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mb-5">
            {r.removed.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
          </ul>

          <h3 className="text-sm font-semibold text-foreground mb-2">{r.comingTitle}</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{r.comingDesc}</p>

          <h3 className="text-sm font-semibold text-foreground mb-2">{r.goodToKnowTitle}</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
            {r.goodToKnow.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
          </ul>
        </div>
      </DocPage>
    </DocLayout>
  );
}
