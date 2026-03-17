import { join } from "path";
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

  // Commands & Templates (에이전트 독립)
  get commands(): string { return join(this.root, "commands"); }
  get templates(): string { return join(this.root, "templates"); }

  // Hooks
  get hooks(): string { return join(this.root, "hooks"); }

  // Claude Code integration
  get claudeCommands(): string { return join(this.projectRoot, ".claude", "commands"); }
  get claudeHooksJson(): string { return join(this.projectRoot, ".claude", "hooks.json"); }

  async isReapProject(): Promise<boolean> {
    try {
      const s = await stat(this.root);
      return s.isDirectory();
    } catch {
      return false;
    }
  }
}
