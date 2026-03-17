import { Link } from "wouter";
import { Github } from "lucide-react";
import logoPath from "@assets/favicon_1773735683357.png";
import { Button } from "./ui/button";

export function AppNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b border-border z-50 flex items-center px-6 justify-between">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logoPath} alt="REAP Logo" className="w-5 h-5" />
          <span className="font-semibold text-lg tracking-tight text-foreground">REAP</span>
          <span className="text-muted-foreground text-sm font-medium mt-1">docs</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-4 mr-4 text-sm font-medium text-muted-foreground">
          <Link href="/docs/introduction" className="hover:text-foreground transition-colors">Documentation</Link>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-5 h-5" />
            <span className="sr-only">GitHub</span>
          </a>
          <Button asChild size="sm" className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/docs/introduction">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
