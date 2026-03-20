import logoPath from "@assets/favicon_1773735683357.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-6 py-14 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <img src={logoPath} alt="REAP" className="w-5 h-5" />
          <span className="text-sm font-semibold text-foreground">REAP</span>
          <span className="text-xs text-muted-foreground mx-1">made by</span>
          <a href="https://c-d.cc" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="/ctod-logo.png" alt="C to D" className="h-5" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground/50">
          &copy; {new Date().getFullYear()} C to D. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
