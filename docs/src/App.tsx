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
import WorkflowPage from "@/pages/WorkflowPage";
import CLIPage from "@/pages/CLIPage";
import AdvancedPage from "@/pages/AdvancedPage";
import CommandReferencePage from "@/pages/CommandReferencePage";
import HookReferencePage from "@/pages/HookReferencePage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import ComparisonPage from "@/pages/ComparisonPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HeroPage} />
      <Route path="/docs/introduction" component={Introduction} />
      <Route path="/docs/quick-start" component={QuickStartPage} />
      <Route path="/docs/core-concepts" component={CoreConceptsPage} />
      <Route path="/docs/workflow" component={WorkflowPage} />
      <Route path="/docs/cli" component={CLIPage} />
      <Route path="/docs/commands" component={CommandReferencePage} />
      <Route path="/docs/hooks" component={HookReferencePage} />
      <Route path="/docs/configuration" component={ConfigurationPage} />
      <Route path="/docs/comparison" component={ComparisonPage} />
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
