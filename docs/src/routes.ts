/**
 * The route table. One owner.
 *
 * There were two before gen-096: the `<Route path="…">` list in App.tsx and the
 * `href` list in AppSidebar.tsx. `tests/unit/docs-wiring.test.ts` exists because
 * those two could disagree in a way no type system notices — two well-typed
 * string literals that differ by one character, whose only symptom is a sidebar
 * entry leading to NotFound.
 *
 * Prerendering needs the list too, and a third copy is where the next silent
 * disagreement would have come from. So App.tsx and the prerenderer both read
 * this file, and the sidebar — which orders and groups the pages for a human,
 * a genuinely separate concern — is still checked against it by that test.
 *
 * `meta` is a function of the translations rather than a stored string because
 * the title of `/ko/docs/quick-start` is the Korean one. Every value is a
 * string in the translation files; nothing is composed here.
 *
 * All 23 routes carry a description. Four of them had no sentence anywhere in
 * the translations that described the page — quick-start, core-concepts,
 * release-notes and advanced — and this file said so, because writing one
 * meant authoring it in five languages, which is a decision for a person
 * rather than a build step. A person made it: `description` was added to those
 * four keys in all five locale files (gen-096), so the 20 pages that shipped
 * with nothing but a `<title>` now describe themselves in a search result.
 */
import type { ComponentType } from "react";
import type { Translations } from "./i18n/translations/en";

import { HeroPage } from "@/pages/HeroPage";
import Introduction from "@/pages/Introduction";
import QuickStartPage from "@/pages/QuickStartPage";
import CoreConceptsPage from "@/pages/CoreConceptsPage";
import LifecyclePage from "@/pages/LifecyclePage";
import GenomePage from "@/pages/GenomePage";
import EnvironmentPage from "@/pages/EnvironmentPage";
import LineagePage from "@/pages/LineagePage";
import BacklogPage from "@/pages/BacklogPage";
import VisionPage from "@/pages/VisionPage";
import AdvancedPage from "@/pages/AdvancedPage";
import CommandReferencePage from "@/pages/CommandReferencePage";
import HookReferencePage from "@/pages/HookReferencePage";
import HooksPage from "@/pages/HooksPage";
import CodeIntelligencePage from "@/pages/CodeIntelligencePage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import ComparisonPage from "@/pages/ComparisonPage";
import DistributedOverviewPage from "@/pages/DistributedOverviewPage";
import MergeLifecyclePage from "@/pages/MergeLifecyclePage";
import MergeCommandsPage from "@/pages/MergeCommandsPage";
import SelfEvolvingPage from "@/pages/SelfEvolvingPage";
import MigrationGuidePage from "@/pages/MigrationGuidePage";
import ReleaseNotesPage from "@/pages/ReleaseNotesPage";

export const SITE_NAME = "REAP";

export interface RouteMeta {
  /** The full `<title>`, already including the site name. */
  title: string;
  /** `meta description`. Required: every route describes itself. */
  description: string;
}

export interface RouteDef {
  /** Locale-independent path — what `<Route>` declares and the sidebar links to. */
  path: string;
  component: ComponentType;
  meta: (t: Translations) => RouteMeta;
}

/** `"Quick Start"` -> `"Quick Start — REAP"`. */
const page = (title: string): string => `${title} — ${SITE_NAME}`;

export const ROUTES: RouteDef[] = [
  {
    path: "/",
    component: HeroPage,
    meta: (t) => ({ title: `${SITE_NAME} — ${t.hero.tagline}`, description: t.hero.description }),
  },
  {
    path: "/docs/introduction",
    component: Introduction,
    meta: (t) => ({ title: page(t.intro.title), description: t.intro.description }),
  },
  {
    path: "/docs/quick-start",
    component: QuickStartPage,
    meta: (t) => ({ title: page(t.quickstart.title), description: t.quickstart.description }),
  },
  {
    path: "/docs/core-concepts",
    component: CoreConceptsPage,
    meta: (t) => ({ title: page(t.concepts.title), description: t.concepts.description }),
  },
  {
    path: "/docs/lifecycle",
    component: LifecyclePage,
    meta: (t) => ({ title: page(t.lifecyclePage.title), description: t.lifecyclePage.intro }),
  },
  {
    path: "/docs/genome",
    component: GenomePage,
    meta: (t) => ({ title: page(t.genomePage.title), description: t.genomePage.intro }),
  },
  {
    path: "/docs/vision",
    component: VisionPage,
    meta: (t) => ({ title: page(t.visionPage.title), description: t.visionPage.intro }),
  },
  {
    path: "/docs/environment",
    component: EnvironmentPage,
    meta: (t) => ({ title: page(t.environmentPage.title), description: t.environmentPage.intro }),
  },
  {
    path: "/docs/lineage",
    component: LineagePage,
    meta: (t) => ({ title: page(t.lineagePage.title), description: t.lineagePage.intro }),
  },
  {
    path: "/docs/backlog",
    component: BacklogPage,
    meta: (t) => ({ title: page(t.backlogPage.title), description: t.backlogPage.intro }),
  },
  {
    path: "/docs/hooks",
    component: HooksPage,
    meta: (t) => ({ title: page(t.hooks.title), description: t.hooks.intro }),
  },
  {
    path: "/docs/code-intelligence",
    component: CodeIntelligencePage,
    meta: (t) => ({
      title: page(t.codeIntelligencePage.title),
      description: t.codeIntelligencePage.intro,
    }),
  },
  {
    path: "/docs/hook-reference",
    component: HookReferencePage,
    // Both hook pages render `t.hooks.title`, so their `<h1>` is already the
    // same word. The sidebar distinguishes them and its label is used here
    // rather than a new string being written.
    meta: (t) => ({ title: page("Hook Reference"), description: t.hooks.intro }),
  },
  {
    path: "/docs/command-reference",
    component: CommandReferencePage,
    meta: (t) => ({ title: page(t.commands.title), description: t.commands.intro }),
  },
  {
    path: "/docs/configuration",
    component: ConfigurationPage,
    meta: (t) => ({ title: page(t.config.title), description: t.config.intro }),
  },
  {
    path: "/docs/comparison",
    component: ComparisonPage,
    meta: (t) => ({ title: page(t.comparison.title), description: t.comparison.desc }),
  },
  {
    path: "/docs/distributed-workflow",
    component: DistributedOverviewPage,
    meta: (t) => ({ title: page(t.collaboration.title), description: t.collaboration.intro }),
  },
  {
    path: "/docs/merge-generation",
    component: MergeLifecyclePage,
    meta: (t) => ({ title: page(t.mergeGeneration.title), description: t.mergeGeneration.intro }),
  },
  {
    path: "/docs/merge-commands",
    component: MergeCommandsPage,
    meta: (t) => ({ title: page(t.mergeCommands.title), description: t.mergeCommands.intro }),
  },
  {
    path: "/docs/self-evolving",
    component: SelfEvolvingPage,
    meta: (t) => ({ title: page(t.selfEvolvingPage.title), description: t.selfEvolvingPage.intro }),
  },
  {
    path: "/docs/migration-guide",
    component: MigrationGuidePage,
    meta: (t) => ({
      title: page(t.migrationGuidePage.title),
      description: t.migrationGuidePage.intro,
    }),
  },
  {
    path: "/docs/release-notes",
    component: ReleaseNotesPage,
    meta: (t) => ({ title: page(t.releaseNotes.title), description: t.releaseNotes.description }),
  },
  {
    path: "/docs/advanced",
    component: AdvancedPage,
    meta: (t) => ({ title: page(t.advanced.title), description: t.advanced.description }),
  },
];
