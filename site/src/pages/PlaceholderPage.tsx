import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";
import type { Translations } from "@/i18n/translations/ko";

type PlaceholderKey = keyof Translations["placeholder"]["pages"];

/** One component per placeholder route, built from its `placeholder.pages` entry. */
export function makePlaceholderPage(key: PlaceholderKey) {
  return function PlaceholderPage() {
    const t = useT();
    const page = t.placeholder.pages[key];
    return (
      <DocLayout>
        <DocPage title={page.title} breadcrumb={page.breadcrumb} description={page.description}>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.placeholder.notice}</p>
        </DocPage>
      </DocLayout>
    );
  };
}
