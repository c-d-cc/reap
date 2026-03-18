import { Link } from "wouter";
import { Github, Menu } from "lucide-react";
import logoPath from "@assets/favicon_1773735683357.png";
import { Button } from "./ui/button";
import { LanguageSelector } from "./LanguageSelector";
import { useT } from "@/i18n";

export function AppNavbar({ onMenuClick, showGetStarted }: { onMenuClick?: () => void; showGetStarted?: boolean }) {
  const t = useT();
  return (
    <header className="fixed top-0 left-0 right-0 h-11 md:h-14 bg-background/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-center">
      <div className="flex items-center justify-between w-full max-w-4xl px-4">
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button onClick={onMenuClick} className="md:hidden h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground">
            <Menu className="w-4 h-4" />
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logoPath} alt="REAP Logo" className="w-5 h-5" />
          <span className="font-semibold text-lg tracking-tight text-foreground">REAP</span>
          <span className="text-muted-foreground text-sm font-medium mt-1">docs</span>
          <span className="text-[10px] font-mono text-primary/80 border border-primary/30 rounded px-1.5 py-0.5 mt-1">v{__REAP_VERSION__}</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <a href="https://github.com/c-d-cc/reap" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors text-sm cursor-pointer rounded px-1.5 py-1">
            <Github className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">GitHub</span>
          </a>
          {showGetStarted && (
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/docs/introduction">{t.nav.getStarted}</Link>
            </Button>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
