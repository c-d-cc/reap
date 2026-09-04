/**
 * The route table. One owner — App.tsx and the prerenderer both read this
 * file, and AppSidebar is checked against it by hand.
 */
import type { ComponentType } from "react";
import type { Translations } from "./i18n/translations/ko";

import { HeroPage } from "@/pages/HeroPage";
import Introduction from "@/pages/Introduction";
import InstallPage from "@/pages/InstallPage";
import QuickStartPage from "@/pages/QuickStartPage";
import ConceptsPage from "@/pages/ConceptsPage";
import SkillsPage from "@/pages/SkillsPage";
import CLIPage from "@/pages/CLIPage";
import HooksPage from "@/pages/HooksPage";
import CodeIndexPage from "@/pages/CodeIndexPage";
import OrchestratePage from "@/pages/OrchestratePage";
import MigrationPage from "@/pages/MigrationPage";
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
    path: "/docs/install",
    component: InstallPage,
    meta: (t) => ({ title: page(t.install.title), description: t.install.description }),
  },
  {
    path: "/docs/quick-start",
    component: QuickStartPage,
    meta: (t) => ({ title: page(t.quickstart.title), description: t.quickstart.description }),
  },
  {
    path: "/docs/concepts",
    component: ConceptsPage,
    meta: (t) => ({ title: page(t.concepts.title), description: t.concepts.description }),
  },
  {
    path: "/docs/skills",
    component: SkillsPage,
    meta: (t) => ({ title: page(t.skills.title), description: t.skills.description }),
  },
  {
    path: "/docs/cli",
    component: CLIPage,
    meta: (t) => ({ title: page(t.cli.title), description: t.cli.description }),
  },
  {
    path: "/docs/hooks",
    component: HooksPage,
    meta: (t) => ({ title: page(t.hooks.title), description: t.hooks.description }),
  },
  {
    path: "/docs/code-index",
    component: CodeIndexPage,
    meta: (t) => ({ title: page(t.codeIndex.title), description: t.codeIndex.description }),
  },
  {
    path: "/docs/orchestrate",
    component: OrchestratePage,
    meta: (t) => ({ title: page(t.orchestrate.title), description: t.orchestrate.description }),
  },
  {
    path: "/docs/migration",
    component: MigrationPage,
    meta: (t) => ({ title: page(t.migration.title), description: t.migration.description }),
  },
  {
    path: "/docs/release-notes",
    component: ReleaseNotesPage,
    meta: (t) => ({ title: page(t.releaseNotes.title), description: t.releaseNotes.description }),
  },
];
