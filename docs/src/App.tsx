import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { LanguageProvider } from "@/i18n";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

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
import ConfigurationPage from "@/pages/ConfigurationPage";
import ComparisonPage from "@/pages/ComparisonPage";
import DistributedOverviewPage from "@/pages/DistributedOverviewPage";
import MergeLifecyclePage from "@/pages/MergeLifecyclePage";
import MergeCommandsPage from "@/pages/MergeCommandsPage";
import SelfEvolvingPage from "@/pages/SelfEvolvingPage";
import MigrationGuidePage from "@/pages/MigrationGuidePage";
import ReleaseNotesPage from "@/pages/ReleaseNotesPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HeroPage} />
      <Route path="/docs/introduction" component={Introduction} />
      <Route path="/docs/quick-start" component={QuickStartPage} />
      <Route path="/docs/core-concepts" component={CoreConceptsPage} />
      <Route path="/docs/lifecycle" component={LifecyclePage} />
      <Route path="/docs/genome" component={GenomePage} />
      <Route path="/docs/vision" component={VisionPage} />
      <Route path="/docs/environment" component={EnvironmentPage} />
      <Route path="/docs/lineage" component={LineagePage} />
      <Route path="/docs/backlog" component={BacklogPage} />
      <Route path="/docs/hooks" component={HooksPage} />
      <Route path="/docs/hook-reference" component={HookReferencePage} />
      <Route path="/docs/command-reference" component={CommandReferencePage} />
      <Route path="/docs/configuration" component={ConfigurationPage} />
      <Route path="/docs/comparison" component={ComparisonPage} />
      <Route path="/docs/distributed-workflow" component={DistributedOverviewPage} />
      <Route path="/docs/merge-generation" component={MergeLifecyclePage} />
      <Route path="/docs/merge-commands" component={MergeCommandsPage} />
      <Route path="/docs/self-evolving" component={SelfEvolvingPage} />
      <Route path="/docs/migration-guide" component={MigrationGuidePage} />
      <Route path="/docs/release-notes" component={ReleaseNotesPage} />
      <Route path="/docs/advanced" component={AdvancedPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ScrollToTop />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
