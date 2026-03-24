import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function ReleaseNotesPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.releaseNotes.title} breadcrumb={t.releaseNotes.breadcrumb}>

        {/* Breaking change banner card */}
        <div className="rounded-lg border-2 border-orange-500/50 bg-orange-500/10 p-5 mb-8">
          <h2 className="text-lg font-bold text-orange-400 mb-2">
            {t.releaseNotes.breakingBannerTitle}
          </h2>
          <p className="text-sm text-orange-300/90 leading-relaxed">
            {t.releaseNotes.breakingBannerDesc}
          </p>
        </div>

        {/* Version entries — newest first */}
        <div className="space-y-6">
          {t.releaseNotes.versions.map((entry) => (
            <div key={entry.version} className="border border-border rounded-md p-4">
              <h3 className="text-base font-semibold text-foreground mb-2">
                v{entry.version}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {entry.notes}
              </p>
            </div>
          ))}
        </div>

      </DocPage>
    </DocLayout>
  );
}
