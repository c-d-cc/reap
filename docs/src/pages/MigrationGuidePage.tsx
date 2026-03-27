import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function MigrationGuidePage() {
  return (
    <DocLayout>
      <DocPage title="Migration Guide (v0.15 → v0.16)" breadcrumb="Other">

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          REAP v0.16 is a complete rewrite built on the Self-Evolving Pipeline architecture. The lifecycle, genome structure, configuration, and vision system have all been redesigned. A guided migration tool handles the transition automatically.
        </p>

        {/* Overview */}
        <h2 className="text-base font-semibold text-foreground mb-2">Why Migrate?</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-6">
          <li>Lifecycle redesigned: <code className="bg-muted px-1 rounded">learning</code> replaces <code className="bg-muted px-1 rounded">objective</code> as the first stage</li>
          <li>Genome restructured into 3 focused files (<code className="bg-muted px-1 rounded">application.md</code>, <code className="bg-muted px-1 rounded">evolution.md</code>, <code className="bg-muted px-1 rounded">invariants.md</code>)</li>
          <li>Vision layer with 3-tier memory for cross-generation context persistence</li>
          <li>Merge lifecycle with genome-first reconciliation</li>
          <li>File-based hooks replace inline hook configuration</li>
        </ul>

        {/* Migration Steps */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Migration Steps</h2>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          <strong className="text-foreground">Step 1:</strong> Install v0.16 globally. This automatically deploys v0.16 skills and removes legacy v0.15 project-level skills.
        </p>
        <CodeBlock language="bash">npm install -g @c-d-cc/reap</CodeBlock>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          <strong className="text-foreground">Step 2:</strong> Open Claude Code in your project and run the migration command.
        </p>
        <CodeBlock language="bash">/reap.update</CodeBlock>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          <strong className="text-foreground">Step 3:</strong> Follow the 5-phase guided migration:
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Phase</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">What Happens</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Your Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">confirm</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Shows what will change, creates backup at <code className="bg-muted px-1 rounded">.reap/v15/</code></td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Review and confirm</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">execute</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Restructures directories, migrates config/hooks/lineage/backlog</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Automatic</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">genome-convert</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">AI reconstructs genome from v0.15 files into new 3-file structure</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Review AI's work</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">vision</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Set up <code className="bg-muted px-1 rounded">vision/goals.md</code> and memory tier files</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Provide project direction</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">complete</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Summary of migration results</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Verify</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          <strong className="text-foreground">Step 4:</strong> Verify the migration succeeded.
        </p>
        <CodeBlock language="bash">{`/reap.status
/reap.evolve`}</CodeBlock>

        {/* What Changes */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">What Changes</h2>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Area</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">v0.15</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">v0.16</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Lifecycle</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">objective → planning → impl → validation → completion (5 phases)</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">learning → planning → impl → validation → completion (4 phases)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Genome</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Multiple files, flat structure</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">3 files: <code className="bg-muted px-1 rounded">application.md</code> + <code className="bg-muted px-1 rounded">evolution.md</code> + <code className="bg-muted px-1 rounded">invariants.md</code></td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Config</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">JSON-based configuration</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">YAML-based <code className="bg-muted px-1 rounded">config.yml</code> with cruiseCount, strictEdit, strictMerge, autoSubagent</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Vision</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">No vision system</td>
                <td className="px-4 py-2 text-xs text-muted-foreground"><code className="bg-muted px-1 rounded">vision/goals.md</code> + 3-tier memory</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Hooks</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Inline config</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">File-based: <code className="bg-muted px-1 rounded">.reap/hooks/{"{event}.{name}.{md|sh}"}</code></td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Environment</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Single knowledge file</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">2-tier: <code className="bg-muted px-1 rounded">summary.md</code> (always loaded) + <code className="bg-muted px-1 rounded">domain/</code> (on-demand)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Interrupted Migration */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Interrupted Migration</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          If the migration is interrupted (API error, session disconnect, etc.), progress is saved in <code className="bg-muted px-1 rounded">.reap/migration-state.yml</code>. This file tracks which phases have completed.
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">To resume:</strong> Run <code className="bg-muted px-1 rounded">/reap.update</code> again. It skips completed phases and continues from where it left off.</p>
          <p className="text-xs text-muted-foreground"><strong className="text-foreground">To restart:</strong> Delete <code className="bg-muted px-1 rounded">.reap/migration-state.yml</code> and run <code className="bg-muted px-1 rounded">/reap.update</code> again.</p>
        </div>

        <CodeBlock language="yaml">{`# .reap/migration-state.yml (example)
version: "0.16"
phases:
  confirm: completed
  execute: completed
  genome-convert: in-progress
  vision: pending
  complete: pending`}</CodeBlock>

        {/* Backup */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Backup</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          All v0.15 files are preserved at <code className="bg-muted px-1 rounded">.reap/v15/</code> during the <code className="bg-muted px-1 rounded">confirm</code> phase. This is a complete snapshot of your pre-migration state.
        </p>
        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mb-6">
          <li>The backup is created before any destructive changes occur</li>
          <li>After verifying the migration works (<code className="bg-muted px-1 rounded">/reap.status</code>, <code className="bg-muted px-1 rounded">/reap.evolve</code>), you can safely delete <code className="bg-muted px-1 rounded">.reap/v15/</code></li>
          <li>Keep the backup through at least one full generation to confirm everything works</li>
        </ul>

        {/* Deprecated Commands */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Deprecated Commands</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Several v0.15 slash commands have been renamed or consolidated in v0.16.
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">v0.15 Command</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">v0.16 Replacement</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-red-400 line-through">/reap.sync</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">/reap.knowledge</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Manages genome, environment, and context knowledge</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-red-400 line-through">/reap.refreshKnowledge</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">/reap.knowledge reload</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Reload all knowledge from disk</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-red-400 line-through">/reap.objective</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">/reap.run</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Per-stage commands replaced by <code className="bg-muted px-1 rounded">reap run &lt;stage&gt;</code></td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-red-400 line-through">/reap.complete</td>
                <td className="px-4 py-2 font-mono text-xs text-primary">/reap.run</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Per-stage commands replaced by <code className="bg-muted px-1 rounded">reap run &lt;stage&gt;</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-l-2 border-primary/30 pl-4 py-2 mb-4 bg-muted/30 rounded-r-md">
          <p className="text-xs text-muted-foreground italic">
            Legacy v0.15 project-level skill files are automatically removed during <code className="bg-muted px-1 rounded">npm install</code>. If any remain in <code className="bg-muted px-1 rounded">.claude/commands/</code>, they can be safely deleted.
          </p>
        </div>

      </DocPage>
    </DocLayout>
  );
}
