import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function HookReferencePage() {
  return (
    <DocLayout>
      <DocPage title="Hook Reference" breadcrumb="Reference">

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          REAP hooks let you run automation at key lifecycle events. Define them in <code className="text-xs bg-muted px-1 rounded">.reap/config.yml</code> and the AI agent executes them at the right moment.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3">Hook Types</h2>
        <p className="text-sm text-muted-foreground mb-3">Each hook entry supports one of two types:</p>
        <div className="space-y-3 mb-6">
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">command</div>
            <p className="text-xs text-muted-foreground">A shell command. Executed in the project root directory by the AI agent. Use for scripts, CLI tools, build commands.</p>
          </div>
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">prompt</div>
            <p className="text-xs text-muted-foreground">An AI agent instruction. The agent reads the prompt and performs the described task — code analysis, file modifications, documentation updates, etc. Use for tasks that require judgment.</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-6">Only one of <code className="bg-muted px-1 rounded">command</code> or <code className="bg-muted px-1 rounded">prompt</code> per entry. Multiple entries per event are executed in order.</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Events</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground w-52">Event</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">When it fires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">onGenerationStart</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">After <code className="bg-muted px-1 rounded">/reap.start</code> creates a new generation and writes <code className="bg-muted px-1 rounded">current.yml</code></td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">onStageTransition</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">After <code className="bg-muted px-1 rounded">/reap.next</code> advances to the next stage and creates the new artifact</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">onGenerationComplete</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">After <code className="bg-muted px-1 rounded">/reap.next</code> archives a completed generation. Runs <strong>after the git commit</strong>, so changes from hooks are uncommitted</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">onRegression</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">After <code className="bg-muted px-1 rounded">/reap.back</code> returns to a previous stage</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Configuration</h2>
        <CodeBlock language="yaml">{`# .reap/config.yml
hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "npm run lint"
  onGenerationComplete:
    - command: "reap update"
    - prompt: |
        Review the changes made in this generation.
        Update README.md and docs if any features, CLI commands,
        or slash commands were added or modified.
        Skip if no documentation updates are needed.
  onRegression:
    - command: "echo 'Regressed to previous stage'"
    - prompt: "Log the regression reason to a tracking file."
`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">SessionStart Hook</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Separate from REAP project hooks, the <strong className="text-foreground">SessionStart hook</strong> is a Claude Code mechanism that runs at the start of every AI session. REAP registers it during <code className="text-xs bg-muted px-1 rounded">reap init</code>.
        </p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          It injects the full REAP workflow guide, current generation state, and lifecycle rules into the AI agent — ensuring the agent understands the project context even in a brand-new session.
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Registered in <code className="bg-muted px-1 rounded">~/.claude/settings.json</code>. The hook script lives in the REAP package and reads from the project's <code className="bg-muted px-1 rounded">.reap/</code> directory.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Execution Notes</h2>
        <ul className="text-xs text-muted-foreground space-y-2 pl-3 border-l border-border">
          <li>Hooks are executed by the <strong className="text-foreground">AI agent</strong>, not the CLI. The agent reads the config and runs each hook.</li>
          <li><code className="bg-muted px-1 rounded">command</code> hooks run in the <strong className="text-foreground">project root directory</strong>.</li>
          <li><code className="bg-muted px-1 rounded">prompt</code> hooks are interpreted by the AI agent in the current session context.</li>
          <li>Hooks within the same event run <strong className="text-foreground">sequentially</strong>, in the order defined.</li>
          <li><code className="bg-muted px-1 rounded">onGenerationComplete</code> hooks run <strong className="text-foreground">after the git commit</strong> — any file changes from hooks will be uncommitted.</li>
        </ul>

      </DocPage>
    </DocLayout>
  );
}
