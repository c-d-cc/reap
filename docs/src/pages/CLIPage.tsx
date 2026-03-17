import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function CLIPage() {
  return (
    <DocLayout>
      <DocPage title="CLI Reference" breadcrumb="Reference">

        <h2 className="text-base font-semibold text-foreground mb-2">reap init</h2>
        <p className="text-sm text-muted-foreground mb-2">Initialize a new REAP project. Creates the <code className="text-xs bg-muted px-1 rounded">.reap/</code> structure and installs slash commands and hooks to <code className="text-xs bg-muted px-1 rounded">~/.claude/</code>.</p>
        <CodeBlock language="bash">{`reap init [name] [options]`}</CodeBlock>
        <div className="mt-3 border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Option</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Values</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">--mode</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">greenfield | migration | adoption</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Project entry mode</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">--preset</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">e.g. bun-hono-react</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Bootstrap Genome with a pre-configured stack</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">reap status</h2>
        <p className="text-sm text-muted-foreground mb-2">Show current project and generation status.</p>
        <CodeBlock language="bash">{`reap status`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          Displays project name, entry mode, active generation (id, goal, stage), and total completed generations.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">reap update</h2>
        <p className="text-sm text-muted-foreground mb-2">Sync commands, templates, and hooks to the latest version.</p>
        <CodeBlock language="bash">{`reap update [--dry-run]`}</CodeBlock>
        <div className="mt-3 border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">--dry-run</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Show what would be updated without applying changes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">reap fix</h2>
        <p className="text-sm text-muted-foreground mb-2">Diagnose and repair the <code className="text-xs bg-muted px-1 rounded">.reap/</code> directory structure.</p>
        <CodeBlock language="bash">{`reap fix`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2">
          Checks for missing directories, verifies <code className="text-xs bg-muted px-1 rounded">config.yml</code> exists, validates <code className="text-xs bg-muted px-1 rounded">current.yml</code> stage, and recreates missing structure.
        </p>
      </DocPage>
    </DocLayout>
  );
}
