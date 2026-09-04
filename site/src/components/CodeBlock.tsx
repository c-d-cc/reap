import { useState, ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
  className?: string;
}

export function CodeBlock({ children, language = "bash", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const text = typeof children === "string" ? children : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className={cn("relative group rounded-md overflow-hidden border border-border my-4 bg-[#111111]", className)}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d0d] border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <button
          onClick={copyToClipboard}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
          aria-label="Copy code"
          data-testid="btn-copy-code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="px-4 py-3 overflow-x-auto">
        <pre className="text-sm font-mono text-[#e0e0e0] leading-relaxed whitespace-pre">
          <code>{typeof children === "string" ? children.replace(/^\n/, "") : children}</code>
        </pre>
      </div>
    </div>
  );
}
