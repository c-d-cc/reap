import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function ConfigurationPage() {
  return (
    <DocLayout>
      <DocPage title="Configuration" breadcrumb="Reference">

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          REAP projects are configured through <code className="text-xs bg-muted px-1 rounded">.reap/config.yml</code>. This file is created during <code className="text-xs bg-muted px-1 rounded">reap init</code> and controls project settings, strict mode, and lifecycle hooks.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3">Config File Structure</h2>
        <CodeBlock language="yaml">{`# .reap/config.yml
version: 0.1.0
project: my-project
entryMode: greenfield    # greenfield | migration | adoption
strict: false            # enable strict mode (default: false)
hooks:
  onGenerationComplete:
    - command: "reap update"
    - prompt: "Update docs if needed."
`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">Fields</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground w-36">Field</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["version", "Config schema version"],
                ["project", "Project name (set during init)"],
                ["entryMode", "How REAP was initialized: greenfield, migration, or adoption"],
                ["strict", "Enable strict mode to restrict code changes (see below)"],
                ["hooks", "Lifecycle hooks (see Hook Reference)"],
              ].map(([field, desc]) => (
                <tr key={field}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{field}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">Strict Mode</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          When <code className="text-xs bg-muted px-1 rounded">strict: true</code> is set, the AI agent is restricted from modifying code outside the REAP workflow. This ensures all changes go through the structured lifecycle.
        </p>
        <CodeBlock language="yaml">{`# Enable strict mode
strict: true   # default: false`}</CodeBlock>
        <div className="mt-3 border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Context</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["No active generation / non-implementation stage", "Code modifications are fully blocked"],
                ["Implementation stage", "Only modifications within the scope of 02-planning.md are allowed"],
                ["Escape hatch", 'User explicitly requests "override" or "bypass strict" to allow modifications'],
              ].map(([ctx, behavior]) => (
                <tr key={ctx}>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{ctx}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Strict mode is disabled by default. Reading files, analyzing code, and answering questions are always allowed regardless of strict mode.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">Entry Modes</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground w-32">Mode</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Use case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["greenfield", "New project starting from scratch"],
                ["adoption", "Applying REAP to an existing codebase"],
                ["migration", "Migrating from an existing system to a new architecture"],
              ].map(([mode, desc]) => (
                <tr key={mode}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{mode}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </DocPage>
    </DocLayout>
  );
}
