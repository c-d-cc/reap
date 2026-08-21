/**
 * Splitting a release-note string into the sections the page renders.
 *
 * A note is written as `**Title** description **Title** description`. Every
 * `**...**` starts a section; the text after it is that section's description.
 * The page draws `Title — description`, and **it supplies the dash**.
 *
 * Which is where this function earns its existence. Authors have been writing
 * the dash themselves since v0.16.5 — `**Title** — description` reads correctly
 * in the source file and in every diff — and the page then rendered `Title — —
 * description`. Sixty-two of them, across five locales and eight versions,
 * before anyone looked at the rendered page closely enough to notice. Stripping
 * it here fixes all of them at once and leaves the translations alone; fixing
 * the sixty-two strings instead would leave the sixty-third to the next author.
 *
 * The separators are stripped in the order a human writes them: sentence
 * punctuation first (`**Title**. description`), then a dash, then whatever
 * whitespace is left.
 *
 * The dash is `—`, `——`, `–` or one or two hyphens. `——` is there because
 * zh-CN writes it that way — it is the correct Chinese dash, not a doubled one,
 * and stripping a single `—` left the other half on the page. The sweep over
 * every shipped note found it; a rule written from the English entries alone
 * would not have.
 *
 * One separator goes, not every leading dash: a description that genuinely
 * opens with a dashed clause keeps it.
 */
export interface NoteSection {
  title: string;
  desc: string;
}

/**
 * Remove the sentence-ending punctuation an author wrote on a section title.
 *
 * The page draws `Title — description`, so a title that ends in a full stop
 * renders as `Title. — description`. Same shape as the leading dash: the
 * author wrote punctuation the layout already supplies. `。` is here because
 * ja and zh-CN end sentences with it.
 *
 * Only a terminal stop goes. `?` and `!` carry meaning a full stop does not,
 * and a title ending in `...` is saying something.
 */
export function stripTrailingStop(title: string): string {
  return title.trim().replace(/(?<!\.)[.。]$/, "").trim();
}

/** Remove the separator an author wrote between a section title and its text. */
export function stripLeadingSeparator(desc: string): string {
  return desc
    .trim()
    .replace(/^[.,:;]\s*/, "")
    .replace(/^(?:—{1,2}|–|-{1,2})\s*/, "")
    .trim();
}

/**
 * The sections of a note, or an empty array when it has no `**...**` markers.
 *
 * An empty array means "render this as a plain paragraph" — older entries were
 * written that way and are still readable.
 */
export function noteSections(notes: string): NoteSection[] {
  const parts = notes.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return [];

  const sections: NoteSection[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({
      title: stripTrailingStop(parts[i]),
      desc: stripLeadingSeparator(parts[i + 1] || ""),
    });
  }
  return sections;
}
