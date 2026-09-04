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
import ClaimBarrierPage from "@/pages/ClaimBarrierPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import DoctorPage from "@/pages/DoctorPage";
import ComparisonPage from "@/pages/ComparisonPage";
import MigrationPage from "@/pages/MigrationPage";
import ReleaseNotesPage from "@/pages/ReleaseNotesPage";
import TwoAxesPage from "@/pages/TwoAxesPage";
import ThreeLayersPage from "@/pages/ThreeLayersPage";
import StoragePage from "@/pages/StoragePage";
import LoopPage from "@/pages/LoopPage";
import PlanPage from "@/pages/PlanPage";
import IdeaPage from "@/pages/IdeaPage";
import CarveMilestonePage from "@/pages/CarveMilestonePage";
import GenerationPage from "@/pages/GenerationPage";
import DelegationPage from "@/pages/DelegationPage";
import BacklogPage from "@/pages/BacklogPage";
import ClosingMilestonePage from "@/pages/ClosingMilestonePage";
import GenomePage from "@/pages/GenomePage";
import EnvironmentPage from "@/pages/EnvironmentPage";
import VisionMemoryPage from "@/pages/VisionMemoryPage";

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
    component: GenerationPage,
    meta: (t) => ({ title: page(t.generationPage.title), description: t.generationPage.description }),
  },
  {
    path: "/docs/delegation",
    component: DelegationPage,
    meta: (t) => ({ title: page(t.delegationPage.title), description: t.delegationPage.description }),
  },
  {
    path: "/docs/backlog",
    component: BacklogPage,
    meta: (t) => ({ title: page(t.backlogPage.title), description: t.backlogPage.description }),
  },
  {
    path: "/docs/closing-milestone",
    component: ClosingMilestonePage,
    meta: (t) => ({ title: page(t.closingMilestonePage.title), description: t.closingMilestonePage.description }),
  },

  // 지식
  {
    path: "/docs/genome",
    component: GenomePage,
    meta: (t) => ({ title: page(t.genomePage.title), description: t.genomePage.description }),
  },
  {
    path: "/docs/environment",
    component: EnvironmentPage,
    meta: (t) => ({ title: page(t.environmentPage.title), description: t.environmentPage.description }),
  },
  {
    path: "/docs/vision-memory",
    component: VisionMemoryPage,
    meta: (t) => ({ title: page(t.visionMemoryPage.title), description: t.visionMemoryPage.description }),
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
    component: ClaimBarrierPage,
    meta: (t) => ({ title: page(t.claimBarrierPage.title), description: t.claimBarrierPage.description }),
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
    component: ConfigurationPage,
    meta: (t) => ({ title: page(t.configurationPage.title), description: t.configurationPage.description }),
  },
  {
    path: "/docs/doctor",
    component: DoctorPage,
    meta: (t) => ({ title: page(t.doctorPage.title), description: t.doctorPage.description }),
  },

  // 기타
  {
    path: "/docs/comparison",
    component: ComparisonPage,
    meta: (t) => ({ title: page(t.comparisonPage.title), description: t.comparisonPage.description }),
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
