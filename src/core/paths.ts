import { join } from "path";
import { stat } from "fs/promises";

export class ReapPaths {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  get root(): string { return join(this.projectRoot, ".reap"); }
  get config(): string { return join(this.root, "config.yml"); }
  get genome(): string { return join(this.root, "genome"); }
  get sourceMap(): string { return join(this.genome, "source-map.json"); }
  get cheatsheet(): string { return join(this.genome, "cheatsheet.md"); }
  get architecture(): string { return join(this.genome, "architecture"); }
  get environment(): string { return join(this.root, "environment"); }
  get life(): string { return join(this.root, "life"); }
  get currentYml(): string { return join(this.life, "current.yml"); }
  get mutations(): string { return join(this.life, "mutations"); }
  get backlog(): string { return join(this.life, "backlog"); }
  get lineage(): string { return join(this.root, "lineage"); }
  get origins(): string { return join(this.root, "origins"); }
  get claude(): string { return join(this.root, "claude"); }

  generationDir(genId: string): string { return join(this.lineage, genId); }
  adaptationsDir(genId: string): string { return join(this.generationDir(genId), "adaptations"); }

  async isReapProject(): Promise<boolean> {
    try {
      const s = await stat(this.root);
      return s.isDirectory();
    } catch {
      return false;
    }
  }
}
