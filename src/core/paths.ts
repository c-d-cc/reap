import { join } from "path";
import { homedir } from "os";
import { stat } from "fs/promises";

export class ReapPaths {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  get root(): string { return join(this.projectRoot, ".reap"); }
  get config(): string { return join(this.root, "config.yml"); }

  // Genome (원칙/규칙/결정)
  get genome(): string { return join(this.root, "genome"); }
  get principles(): string { return join(this.genome, "principles.md"); }
  get domain(): string { return join(this.genome, "domain"); }
  get conventions(): string { return join(this.genome, "conventions.md"); }
  get constraints(): string { return join(this.genome, "constraints.md"); }

  // Environment
  get environment(): string { return join(this.root, "environment"); }

  // Life (현재 세대)
  get life(): string { return join(this.root, "life"); }
  get currentYml(): string { return join(this.life, "current.yml"); }
  get backlog(): string { return join(this.life, "backlog"); }
  /** @deprecated Use backlog with type: genome-change instead */
  get mutations(): string { return join(this.life, "mutations"); }
  artifact(name: string): string { return join(this.life, name); }

  // Lineage (완료된 세대)
  get lineage(): string { return join(this.root, "lineage"); }
  generationDir(genId: string): string { return join(this.lineage, genId); }

  // User-level Claude Code integration
  static get userClaudeDir(): string { return join(homedir(), ".claude"); }
  static get userClaudeCommands(): string { return join(ReapPaths.userClaudeDir, "commands"); }
  static get userClaudeHooksJson(): string { return join(ReapPaths.userClaudeDir, "hooks.json"); }

  // Package-internal template paths
  static get packageTemplatesDir(): string { return join(import.meta.dir, "../templates"); }
  static get packageCommandsDir(): string { return join(ReapPaths.packageTemplatesDir, "commands"); }
  static get packageArtifactsDir(): string { return join(ReapPaths.packageTemplatesDir, "artifacts"); }
  static get packageHooksDir(): string { return join(ReapPaths.packageTemplatesDir, "hooks"); }
  static get packageGenomeDir(): string { return join(ReapPaths.packageTemplatesDir, "genome"); }

  // Legacy paths (for migration cleanup)
  /** @deprecated Project-level commands removed in gen-007 */
  get legacyCommands(): string { return join(this.root, "commands"); }
  /** @deprecated Project-level templates removed in gen-007 */
  get legacyTemplates(): string { return join(this.root, "templates"); }
  /** @deprecated Project-level hooks removed in gen-007 */
  get legacyHooks(): string { return join(this.root, "hooks"); }
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
