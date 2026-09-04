/**
 * The route table. One owner — App.tsx and the prerenderer both read this
 * file, and AppSidebar is checked against it by hand.
 */
import type { ComponentType } from "react";
import type { Translations } from "./i18n/translations/ko";

import { HeroPage } from "@/pages/HeroPage";
import Introduction from "@/pages/Introduction";
import QuickStartPage from "@/pages/QuickStartPage";
import AutonomousEvolutionPage from "@/pages/AutonomousEvolutionPage";
import V018ChangePage from "@/pages/V018ChangePage";
import SkillsPage from "@/pages/SkillsPage";
import CLIPage from "@/pages/CLIPage";
import HooksPage from "@/pages/HooksPage";
import CodeIndexPage from "@/pages/CodeIndexPage";
import OrchestratePage from "@/pages/OrchestratePage";
import MigrationPage from "@/pages/MigrationPage";
import ReleaseNotesPage from "@/pages/ReleaseNotesPage";
import TwoAxesPage from "@/pages/TwoAxesPage";
import ThreeLayersPage from "@/pages/ThreeLayersPage";
import StoragePage from "@/pages/StoragePage";
import LoopPage from "@/pages/LoopPage";
import PlanPage from "@/pages/PlanPage";
import IdeaPage from "@/pages/IdeaPage";
import CarveMilestonePage from "@/pages/CarveMilestonePage";
import { makePlaceholderPage } from "@/pages/PlaceholderPage";

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

/** A placeholder route's title/description come from its own `placeholder.pages` entry. */
const placeholderMeta =
  (key: keyof Translations["placeholder"]["pages"]) =>
  (t: Translations): RouteMeta => {
    const p = t.placeholder.pages[key];
    return { title: page(p.title), description: p.description };
  };

export const ROUTES: RouteDef[] = [
  {
    path: "/",
    component: HeroPage,
    meta: (t) => ({ title: `${SITE_NAME} — ${t.hero.tagline}`, description: t.hero.description }),
  },

  // 시작하기
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
    path: "/docs/autonomous-evolution",
    component: AutonomousEvolutionPage,
    meta: (t) => ({ title: page(t.autonomousEvolution.title), description: t.autonomousEvolution.description }),
  },
  {
    path: "/docs/v018change",
    component: V018ChangePage,
    meta: (t) => ({ title: page(t.v018change.title), description: t.v018change.description }),
  },

  // 핵심 개념
  {
    path: "/docs/two-axes",
    component: TwoAxesPage,
    meta: (t) => ({ title: page(t.twoAxesPage.title), description: t.twoAxesPage.description }),
  },
  {
    path: "/docs/three-layers",
    component: ThreeLayersPage,
    meta: (t) => ({ title: page(t.threeLayersPage.title), description: t.threeLayersPage.description }),
  },
  {
    path: "/docs/storage",
    component: StoragePage,
    meta: (t) => ({ title: page(t.storagePage.title), description: t.storagePage.description }),
  },

  // Plan 축
  {
    path: "/docs/loop",
    component: LoopPage,
    meta: (t) => ({ title: page(t.loopPage.title), description: t.loopPage.description }),
  },
  {
    path: "/docs/plan-source",
    component: PlanPage,
    meta: (t) => ({ title: page(t.planPage.title), description: t.planPage.description }),
  },
  {
    path: "/docs/idea",
    component: IdeaPage,
    meta: (t) => ({ title: page(t.ideaPage.title), description: t.ideaPage.description }),
  },
  {
    path: "/docs/carve-milestone",
    component: CarveMilestonePage,
    meta: (t) => ({ title: page(t.carveMilestonePage.title), description: t.carveMilestonePage.description }),
  },

  // Execution 축
  {
    path: "/docs/generation",
    component: makePlaceholderPage("generation"),
    meta: placeholderMeta("generation"),
  },
  {
    path: "/docs/delegation",
    component: makePlaceholderPage("delegation"),
    meta: placeholderMeta("delegation"),
  },
  {
    path: "/docs/backlog",
    component: makePlaceholderPage("backlog"),
    meta: placeholderMeta("backlog"),
  },
  {
    path: "/docs/closing-milestone",
    component: makePlaceholderPage("closingMilestone"),
    meta: placeholderMeta("closingMilestone"),
  },

  // 지식
  {
    path: "/docs/genome",
    component: makePlaceholderPage("genome"),
    meta: placeholderMeta("genome"),
  },
  {
    path: "/docs/environment",
    component: makePlaceholderPage("environment"),
    meta: placeholderMeta("environment"),
  },
  {
    path: "/docs/vision-memory",
    component: makePlaceholderPage("visionMemory"),
    meta: placeholderMeta("visionMemory"),
  },
  {
    path: "/docs/code-intelligence",
    component: CodeIndexPage,
    meta: (t) => ({ title: page(t.codeIndex.title), description: t.codeIndex.description }),
  },

  // 협업
  {
    path: "/docs/orchestrate",
    component: OrchestratePage,
    meta: (t) => ({ title: page(t.orchestrate.title), description: t.orchestrate.description }),
  },
  {
    path: "/docs/claim-barrier",
    component: makePlaceholderPage("claimBarrier"),
    meta: placeholderMeta("claimBarrier"),
  },
  {
    path: "/docs/hooks",
    component: HooksPage,
    meta: (t) => ({ title: page(t.hooks.title), description: t.hooks.description }),
  },

  // 레퍼런스
  {
    path: "/docs/skill-reference",
    component: SkillsPage,
    meta: (t) => ({ title: page(t.skills.title), description: t.skills.description }),
  },
  {
    path: "/docs/cli-reference",
    component: CLIPage,
    meta: (t) => ({ title: page(t.cli.title), description: t.cli.description }),
  },
  {
    path: "/docs/configuration",
    component: makePlaceholderPage("configuration"),
    meta: placeholderMeta("configuration"),
  },
  {
    path: "/docs/doctor",
    component: makePlaceholderPage("doctor"),
    meta: placeholderMeta("doctor"),
  },

  // 기타
  {
    path: "/docs/comparison",
    component: makePlaceholderPage("comparison"),
    meta: placeholderMeta("comparison"),
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
