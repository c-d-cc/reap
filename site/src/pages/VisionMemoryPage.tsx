import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

export default function VisionMemoryPage() {
  const t = useT();
  const v = t.visionMemoryPage;
  return (
    <DocLayout>
      <DocPage title={v.title} breadcrumb={v.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{v.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{v.visionTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{v.visionDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.memoryTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{v.memoryDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.graduationTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{v.graduationDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.handoffVsLessonsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{v.handoffVsLessonsDesc}</p>

        <div className="border-l-2 border-primary pl-4 py-2 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">{v.notInjectedNote}</p>
        </div>
      </DocPage>
    </DocLayout>
  );
}
