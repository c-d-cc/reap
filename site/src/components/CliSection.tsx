import { Link } from "wouter";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

/** 개념 페이지 끝에 두는 CLI 명령 모음. 본문은 사람이 읽는 서술이고, 명령은 여기 한 곳에만 둔다. */
export function CliSection({ code }: { code: string }) {
  const t = useT();
  const c = t.cliSection;
  return (
    <>
      <h2 className="text-base font-semibold text-foreground mb-2 mt-8">{c.title}</h2>
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
        {c.note}{" "}
        <Link href="/docs/cli-reference" className="text-primary hover:underline">{c.linkText}</Link>
      </p>
      <CodeBlock language="bash">{code}</CodeBlock>
    </>
  );
}
