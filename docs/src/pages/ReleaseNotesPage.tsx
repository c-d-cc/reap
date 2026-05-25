import type { ReactNode } from "react";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { useT } from "@/i18n";

/**
 * Render inline backticks as <code> spans, leaving other text untouched.
 */
function renderInline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((seg, i) => {
    if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 1) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 bg-muted text-foreground/90 rounded text-[0.85em] font-mono"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{seg}</span>;
  });
}

/**
 * Render notes string with optional `**Title**` section markers.
 *  - With markers: each `**Title**` starts a new section (bold heading + description).
 *  - Without markers: rendered as plain paragraph (backward compat with older entries).
 */
function renderNotes(notes: string): ReactNode {
  const parts = notes.split(/\*\*([^*]+)\*\*/g);

  if (parts.length === 1) {
    // No section markers — plain paragraph.
    return (
      <p className="text-sm text-muted-foreground leading-relaxed">
        {renderInline(notes)}
      </p>
    );
  }

  const sections: { title: string; desc: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({
      title: parts[i],
      desc: (parts[i + 1] || "").trim().replace(/^[.,:;]\s*/, ""),
    });
  }

  return (
    <ul className="space-y-3 list-none p-0 m-0">
      {sections.map((s, i) => (
        <li key={i} className="leading-relaxed">
          <span className="font-semibold text-foreground">{s.title}</span>
          {s.desc && (
            <>
              <span className="text-muted-foreground"> — </span>
              <span className="text-sm text-muted-foreground">
                {renderInline(s.desc)}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function ReleaseNotesPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.releaseNotes.title} breadcrumb={t.releaseNotes.breadcrumb}>

        {/* Version entries — newest first */}
        <div className="space-y-6">
          {t.releaseNotes.versions.map((entry) => (
            <div key={entry.version} className="border border-border rounded-md p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">
                v{entry.version}
              </h3>
              {renderNotes(entry.notes)}
            </div>
          ))}
        </div>

      </DocPage>
    </DocLayout>
  );
}
