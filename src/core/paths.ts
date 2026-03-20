import { join, dirname } from "path";
import { homedir } from "os";
import { existsSync } from "fs";
import { stat } from "fs/promises";
import { fileURLToPath } from "url";

export class ReapPaths {
  readonly projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  get root(): string { return join(this.projectRoot, ".reap"); }
  get config(): string { return join(this.root, "config.yml"); }

  // Genome (principles/conventions/constraints)
  get genome(): string { return join(this.root, "genome"); }
  get principles(): string { return join(this.genome, "principles.md"); }
  get domain(): string { return join(this.genome, "domain"); }
  get conventions(): string { return join(this.genome, "conventions.md"); }
  get constraints(): string { return join(this.genome, "constraints.md"); }
  get sourceMap(): string { return join(this.genome, "source-map.md"); }

  // Environment (3-layer: summary + docs + resources)
  get environment(): string { return join(this.root, "environment"); }
  get environmentSummary(): string { return join(this.environment, "summary.md"); }
  get environmentDocs(): string { return join(this.environment, "docs"); }
  get environmentResources(): string { return join(this.environment, "resources"); }

  // Life (current generation)
  get life(): string { return join(this.root, "life"); }
  get currentYml(): string { return join(this.life, "current.yml"); }
  get backlog(): string { return join(this.life, "backlog"); }
  /** @deprecated Use backlog with type: genome-change instead */
  get mutations(): string { return join(this.life, "mutations"); }
  artifact(name: string): string { return join(this.life, name); }

  // Lineage (completed generations)
  get lineage(): string { return join(this.root, "lineage"); }
  generationDir(genId: string): string { return join(this.lineage, genId); }

  // User-level Claude Code integration
  /** @deprecated Use ClaudeCodeAdapter instead */
  static get userClaudeDir(): string { return join(homedir(), ".claude"); }
  /** @deprecated Use ClaudeCodeAdapter.getCommandsDir() instead */
  static get userClaudeCommands(): string { return join(ReapPaths.userClaudeDir, "commands"); }
  /** @deprecated Use ClaudeCodeAdapter.migrate() instead */
  static get userClaudeHooksJson(): string { return join(ReapPaths.userClaudeDir, "hooks.json"); }
  /** @deprecated Use ClaudeCodeAdapter instead */
  static get userClaudeSettingsJson(): string { return join(ReapPaths.userClaudeDir, "settings.json"); }

  // User-level REAP templates and commands
  static get userReapDir(): string { return join(homedir(), ".reap"); }
  static get userReapTemplates(): string { return join(ReapPaths.userReapDir, "templates"); }
  static get userReapCommands(): string { return join(ReapPaths.userReapDir, "commands"); }

  // Package-internal template paths
  // Dev: src/core/ → ../templates = src/templates/
  // Dist: dist/ → templates = dist/templates/ (copied during build)
  static get packageTemplatesDir(): string {
    const dir = dirname(fileURLToPath(import.meta.url));
    const distPath = join(dir, "templates");
    if (existsSync(distPath)) return distPath;
    return join(dir, "../templates");
  }
  static get packageCommandsDir(): string { return join(ReapPaths.packageTemplatesDir, "commands"); }
  static get packageArtifactsDir(): string { return join(ReapPaths.packageTemplatesDir, "artifacts"); }
  static get packageHooksDir(): string { return join(ReapPaths.packageTemplatesDir, "hooks"); }
  static get packageGenomeDir(): string { return join(ReapPaths.packageTemplatesDir, "genome"); }

  // Legacy paths (for migration cleanup)
  /** @deprecated Project-level commands removed in gen-007 */
  get legacyCommands(): string { return join(this.root, "commands"); }
  /** @deprecated Project-level templates removed in gen-007 */
  get legacyTemplates(): string { return join(this.root, "templates"); }
  // .reap/hooks/ is now used for hook execute files (gen-031+), no longer legacy
  get hooks(): string { return join(this.root, "hooks"); }
  /** @deprecated Project-level .claude/commands removed in gen-007 */
  get legacyClaudeCommands(): string { return join(this.projectRoot, ".claude", "commands"); }
  /** @deprecated Project-level .claude/hooks.json removed in gen-007 */
  get legacyClaudeHooksJson(): string { return join(this.projectRoot, ".claude", "hooks.json"); }

  async isReapProject(): Promise<boolean> {
    try {
      const s = await stat(this.root);
      return s.isDirectory();
    } catch {
      return false;
    }
  }
}
