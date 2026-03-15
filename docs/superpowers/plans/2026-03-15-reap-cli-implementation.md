# REAP CLI Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** REAP CLI MVP를 Bun + TypeScript로 구현하여, `reap init` / `reap evolve` / `reap status`로 진화적 개발 파이프라인을 관리할 수 있게 한다.

**Architecture:** CLI(Bun+TS)가 상태 머신과 파일 관리를 담당하고, AI Agent 커맨드(markdown 프롬프트)가 각 Life Cycle 단계의 실제 워크플로우를 안내하는 2계층 구조. CLI는 .reap/ 디렉토리의 4축(genome, environment, life, lineage)을 관리하고, Life Cycle 상태 전이를 제어한다.

**Tech Stack:** Bun, TypeScript, YAML(yaml 라이브러리), Markdown, Commander.js(CLI 프레임워크)

**Spec:** `docs/superpowers/specs/2026-03-15-reap-pipeline-architecture-design.md`

---

## File Structure

```
reap-wf/
  src/
    cli/
      index.ts                    # CLI entry point (reap command)
      commands/
        init.ts                   # reap init
        evolve.ts                 # reap evolve
        status.ts                 # reap status
        scan.ts                   # reap scan (Phase 2)
        diff.ts                   # reap diff (Phase 2)
    core/
      lifecycle.ts                # Life Cycle 상태 머신 (8단계)
      generation.ts               # Generation 생성/완료/Birth 로직
      genome.ts                   # Genome 읽기/쓰기/버저닝
      mutation.ts                 # Mutation 기록/조회
      adaptation.ts               # Adaptation 기록/조회
      config.ts                   # config.yml 읽기/쓰기
      paths.ts                    # .reap/ 경로 상수 및 유틸리티
    types/
      index.ts                    # 공통 타입 정의
    templates/
      commands/                   # AI Agent 슬래시 커맨드 (markdown)
        conception.md             # /reap.conception
        formation.md              # /reap.formation
        planning.md               # /reap.planning
        growth.md                 # /reap.growth
        fitness.md                # /reap.fitness
        adaptation.md             # /reap.adaptation
        birth.md                  # /reap.birth
      genome/                     # 초기 Genome 템플릿
        cheatsheet.md
        architecture/
          application.md
      config.yml                  # 기본 config.yml 템플릿
  tests/
    core/
      lifecycle.test.ts
      generation.test.ts
      genome.test.ts
      mutation.test.ts
      adaptation.test.ts
    commands/
      init.test.ts
      evolve.test.ts
      status.test.ts
    helpers/
      setup.ts                   # 테스트용 임시 .reap/ 생성 유틸리티
  package.json
  tsconfig.json
  bunfig.toml
```

---

## Chunk 1: 프로젝트 초기화 + 핵심 타입 + 경로 유틸리티

### Task 1: 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `bunfig.toml`

- [ ] **Step 1: Bun 프로젝트 초기화**

```bash
cd /Users/hichoi/cdws/reap-wf
bun init -y
```

- [ ] **Step 2: package.json 수정**

```json
{
  "name": "reap",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "reap": "./src/cli/index.ts"
  },
  "scripts": {
    "dev": "bun run src/cli/index.ts",
    "test": "bun test"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "yaml": "^2.0.0"
  }
}
```

- [ ] **Step 3: 의존성 설치**

```bash
bun install
```

- [ ] **Step 4: tsconfig.json 생성**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 5: 커밋**

```bash
git add package.json tsconfig.json bun.lockb
git commit -m "chore: init Bun + TypeScript project for REAP CLI"
```

### Task 2: 공통 타입 정의

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/core/types.test.ts
import { describe, expect, test } from "bun:test";
import type { LifeCycleStage, GenerationState, ReapConfig } from "../../src/types";

describe("types", () => {
  test("LifeCycleStage has all 8 stages", () => {
    const stages: LifeCycleStage[] = [
      "conception", "formation", "planning", "growth",
      "fitness", "adaptation", "birth", "legacy"
    ];
    expect(stages).toHaveLength(8);
  });

  test("GenerationState has required fields", () => {
    const state: GenerationState = {
      id: "gen-001",
      goal: "Initial setup",
      stage: "conception",
      genomeVersion: 1,
      startedAt: "2026-03-15T00:00:00Z",
    };
    expect(state.id).toBe("gen-001");
    expect(state.stage).toBe("conception");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/core/types.test.ts
```
Expected: FAIL - module not found

- [ ] **Step 3: 타입 구현**

```typescript
// src/types/index.ts
export type LifeCycleStage =
  | "conception"
  | "formation"
  | "planning"
  | "growth"
  | "fitness"
  | "adaptation"
  | "birth"
  | "legacy";

export const LIFECYCLE_ORDER: readonly LifeCycleStage[] = [
  "conception", "formation", "planning", "growth",
  "fitness", "adaptation", "birth", "legacy",
] as const;

export interface GenerationState {
  id: string;
  goal: string;
  stage: LifeCycleStage;
  genomeVersion: number;
  startedAt: string;
  completedAt?: string;
}

export interface ReapConfig {
  version: string;
  project: string;
  stack?: string;
  entryMode: "greenfield" | "migration" | "adoption";
}

export interface MutationRecord {
  id: string;
  generationId: string;
  file: string;
  description: string;
  createdAt: string;
}

export interface AdaptationRecord {
  id: string;
  generationId: string;
  targetFile: string;
  description: string;
  diff: string;
  createdAt: string;
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
bun test tests/core/types.test.ts
```
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/types/ tests/core/types.test.ts
git commit -m "feat: define core types for Life Cycle, Generation, Config"
```

### Task 3: 경로 유틸리티

**Files:**
- Create: `src/core/paths.ts`
- Create: `tests/core/paths.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/core/paths.test.ts
import { describe, expect, test } from "bun:test";
import { ReapPaths } from "../../src/core/paths";

describe("ReapPaths", () => {
  const paths = new ReapPaths("/tmp/test-project");

  test("root returns .reap/ path", () => {
    expect(paths.root).toBe("/tmp/test-project/.reap");
  });

  test("config returns config.yml path", () => {
    expect(paths.config).toBe("/tmp/test-project/.reap/config.yml");
  });

  test("genome returns genome/ path", () => {
    expect(paths.genome).toBe("/tmp/test-project/.reap/genome");
  });

  test("life returns life/ path", () => {
    expect(paths.life).toBe("/tmp/test-project/.reap/life");
  });

  test("currentYml returns life/current.yml", () => {
    expect(paths.currentYml).toBe("/tmp/test-project/.reap/life/current.yml");
  });

  test("mutations returns life/mutations/", () => {
    expect(paths.mutations).toBe("/tmp/test-project/.reap/life/mutations");
  });

  test("lineage returns lineage/ path", () => {
    expect(paths.lineage).toBe("/tmp/test-project/.reap/lineage");
  });

  test("environment returns environment/ path", () => {
    expect(paths.environment).toBe("/tmp/test-project/.reap/environment");
  });

  test("generationDir returns lineage/gen-NNN/", () => {
    expect(paths.generationDir("gen-001")).toBe("/tmp/test-project/.reap/lineage/gen-001");
  });

  test("isReapProject detects .reap/ existence", async () => {
    expect(await paths.isReapProject()).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/core/paths.test.ts
```
Expected: FAIL

- [ ] **Step 3: 구현**

```typescript
// src/core/paths.ts
import { join } from "path";

export class ReapPaths {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  get root(): string {
    return join(this.projectRoot, ".reap");
  }

  get config(): string {
    return join(this.root, "config.yml");
  }

  get genome(): string {
    return join(this.root, "genome");
  }

  get sourceMap(): string {
    return join(this.genome, "source-map.json");
  }

  get cheatsheet(): string {
    return join(this.genome, "cheatsheet.md");
  }

  get architecture(): string {
    return join(this.genome, "architecture");
  }

  get environment(): string {
    return join(this.root, "environment");
  }

  get life(): string {
    return join(this.root, "life");
  }

  get currentYml(): string {
    return join(this.life, "current.yml");
  }

  get mutations(): string {
    return join(this.life, "mutations");
  }

  get backlog(): string {
    return join(this.life, "backlog");
  }

  get lineage(): string {
    return join(this.root, "lineage");
  }

  get origins(): string {
    return join(this.root, "origins");
  }

  get claude(): string {
    return join(this.root, "claude");
  }

  generationDir(genId: string): string {
    return join(this.lineage, genId);
  }

  adaptationsDir(genId: string): string {
    return join(this.generationDir(genId), "adaptations");
  }

  async isReapProject(): Promise<boolean> {
    const file = Bun.file(this.root);
    return file.exists();
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
bun test tests/core/paths.test.ts
```
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/core/paths.ts tests/core/paths.test.ts
git commit -m "feat: add ReapPaths utility for .reap/ directory paths"
```

---

## Chunk 2: Life Cycle 상태 머신 + Config 관리

### Task 4: Life Cycle 상태 머신

**Files:**
- Create: `src/core/lifecycle.ts`
- Create: `tests/core/lifecycle.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/core/lifecycle.test.ts
import { describe, expect, test } from "bun:test";
import { LifeCycle } from "../../src/core/lifecycle";

describe("LifeCycle", () => {
  test("next stage from conception is formation", () => {
    expect(LifeCycle.next("conception")).toBe("formation");
  });

  test("next stage from adaptation is birth", () => {
    expect(LifeCycle.next("adaptation")).toBe("birth");
  });

  test("next stage from birth is legacy", () => {
    expect(LifeCycle.next("birth")).toBe("legacy");
  });

  test("next stage from legacy is null (generation complete)", () => {
    expect(LifeCycle.next("legacy")).toBeNull();
  });

  test("canTransition returns true for valid forward transition", () => {
    expect(LifeCycle.canTransition("conception", "formation")).toBe(true);
  });

  test("canTransition returns false for skipping stages", () => {
    expect(LifeCycle.canTransition("conception", "growth")).toBe(false);
  });

  test("canTransition allows growth -> fitness -> growth loop", () => {
    expect(LifeCycle.canTransition("fitness", "growth")).toBe(true);
  });

  test("canTransition disallows arbitrary backward", () => {
    expect(LifeCycle.canTransition("adaptation", "conception")).toBe(false);
  });

  test("label returns Korean description", () => {
    expect(LifeCycle.label("conception")).toBe("목표 설정");
    expect(LifeCycle.label("growth")).toBe("Build");
    expect(LifeCycle.label("birth")).toBe("출산");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/core/lifecycle.test.ts
```
Expected: FAIL

- [ ] **Step 3: 구현**

```typescript
// src/core/lifecycle.ts
import { type LifeCycleStage, LIFECYCLE_ORDER } from "../types";

const LABELS: Record<LifeCycleStage, string> = {
  conception: "목표 설정",
  formation: "Define",
  planning: "Plan",
  growth: "Build",
  fitness: "Verify",
  adaptation: "Retrospect",
  birth: "출산",
  legacy: "완료",
};

export class LifeCycle {
  static next(stage: LifeCycleStage): LifeCycleStage | null {
    const idx = LIFECYCLE_ORDER.indexOf(stage);
    if (idx === -1 || idx === LIFECYCLE_ORDER.length - 1) return null;
    return LIFECYCLE_ORDER[idx + 1];
  }

  static canTransition(from: LifeCycleStage, to: LifeCycleStage): boolean {
    // Allow growth <-> fitness loop
    if (from === "fitness" && to === "growth") return true;

    const fromIdx = LIFECYCLE_ORDER.indexOf(from);
    const toIdx = LIFECYCLE_ORDER.indexOf(to);
    return toIdx === fromIdx + 1;
  }

  static label(stage: LifeCycleStage): string {
    return LABELS[stage];
  }

  static isComplete(stage: LifeCycleStage): boolean {
    return stage === "legacy";
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
bun test tests/core/lifecycle.test.ts
```
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/core/lifecycle.ts tests/core/lifecycle.test.ts
git commit -m "feat: implement Life Cycle state machine with 8 stages"
```

### Task 5: Config 관리

**Files:**
- Create: `src/core/config.ts`
- Create: `tests/core/config.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/core/config.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { ConfigManager } from "../../src/core/config";
import { ReapPaths } from "../../src/core/paths";

describe("ConfigManager", () => {
  let tempDir: string;
  let paths: ReapPaths;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "reap-test-"));
    paths = new ReapPaths(tempDir);
    await Bun.write(join(tempDir, ".reap", "config.yml"), "");
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test("create writes config.yml", async () => {
    const config = { version: "0.1.0", project: "test", entryMode: "greenfield" as const };
    await ConfigManager.write(paths, config);

    const content = await Bun.file(paths.config).text();
    expect(content).toContain("project: test");
    expect(content).toContain("entryMode: greenfield");
  });

  test("read parses config.yml", async () => {
    const yaml = "version: '0.1.0'\nproject: test\nentryMode: greenfield\n";
    await Bun.write(paths.config, yaml);

    const config = await ConfigManager.read(paths);
    expect(config.project).toBe("test");
    expect(config.entryMode).toBe("greenfield");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/core/config.test.ts
```
Expected: FAIL

- [ ] **Step 3: 구현**

```typescript
// src/core/config.ts
import YAML from "yaml";
import type { ReapConfig } from "../types";
import type { ReapPaths } from "./paths";

export class ConfigManager {
  static async read(paths: ReapPaths): Promise<ReapConfig> {
    const content = await Bun.file(paths.config).text();
    return YAML.parse(content) as ReapConfig;
  }

  static async write(paths: ReapPaths, config: ReapConfig): Promise<void> {
    const content = YAML.stringify(config);
    await Bun.write(paths.config, content);
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
bun test tests/core/config.test.ts
```
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/core/config.ts tests/core/config.test.ts
git commit -m "feat: add ConfigManager for config.yml read/write"
```

---

## Chunk 3: Generation 관리 + reap init

### Task 6: Generation 관리

**Files:**
- Create: `src/core/generation.ts`
- Create: `tests/core/generation.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/core/generation.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { GenerationManager } from "../../src/core/generation";
import { ReapPaths } from "../../src/core/paths";

describe("GenerationManager", () => {
  let tempDir: string;
  let paths: ReapPaths;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "reap-test-"));
    paths = new ReapPaths(tempDir);
    await mkdir(join(tempDir, ".reap", "life", "mutations"), { recursive: true });
    await mkdir(join(tempDir, ".reap", "life", "backlog"), { recursive: true });
    await mkdir(join(tempDir, ".reap", "lineage"), { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test("create writes current.yml with generation state", async () => {
    const mgr = new GenerationManager(paths);
    await mgr.create("Build user auth module", 1);

    const state = await mgr.current();
    expect(state).not.toBeNull();
    expect(state!.goal).toBe("Build user auth module");
    expect(state!.stage).toBe("conception");
    expect(state!.genomeVersion).toBe(1);
    expect(state!.id).toMatch(/^gen-\d{3}$/);
  });

  test("advance transitions to next stage", async () => {
    const mgr = new GenerationManager(paths);
    await mgr.create("Test goal", 1);
    await mgr.advance();

    const state = await mgr.current();
    expect(state!.stage).toBe("formation");
  });

  test("current returns null when no active generation", async () => {
    const mgr = new GenerationManager(paths);
    const state = await mgr.current();
    expect(state).toBeNull();
  });

  test("nextGenId returns gen-001 for first generation", async () => {
    const mgr = new GenerationManager(paths);
    const id = await mgr.nextGenId();
    expect(id).toBe("gen-001");
  });

  test("complete moves generation to lineage", async () => {
    const mgr = new GenerationManager(paths);
    await mgr.create("Test goal", 1);

    // Advance through all stages to legacy
    for (let i = 0; i < 7; i++) {
      await mgr.advance();
    }

    const state = await mgr.current();
    expect(state!.stage).toBe("legacy");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/core/generation.test.ts
```
Expected: FAIL

- [ ] **Step 3: 구현**

```typescript
// src/core/generation.ts
import YAML from "yaml";
import { readdir, mkdir } from "fs/promises";
import type { GenerationState } from "../types";
import type { ReapPaths } from "./paths";
import { LifeCycle } from "./lifecycle";

export class GenerationManager {
  constructor(private paths: ReapPaths) {}

  async current(): Promise<GenerationState | null> {
    const file = Bun.file(this.paths.currentYml);
    if (!(await file.exists())) return null;
    const content = await file.text();
    if (!content.trim()) return null;
    return YAML.parse(content) as GenerationState;
  }

  async create(goal: string, genomeVersion: number): Promise<GenerationState> {
    const id = await this.nextGenId();
    const state: GenerationState = {
      id,
      goal,
      stage: "conception",
      genomeVersion,
      startedAt: new Date().toISOString(),
    };
    await Bun.write(this.paths.currentYml, YAML.stringify(state));
    return state;
  }

  async advance(): Promise<GenerationState> {
    const state = await this.current();
    if (!state) throw new Error("No active generation");

    const next = LifeCycle.next(state.stage);
    if (!next) throw new Error(`Cannot advance from ${state.stage}`);

    state.stage = next;
    if (LifeCycle.isComplete(next)) {
      state.completedAt = new Date().toISOString();
    }
    await Bun.write(this.paths.currentYml, YAML.stringify(state));
    return state;
  }

  async complete(): Promise<void> {
    const state = await this.current();
    if (!state) throw new Error("No active generation");
    if (state.stage !== "legacy") throw new Error("Generation must be in legacy stage to complete");

    // Move to lineage
    const genDir = this.paths.generationDir(state.id);
    await mkdir(genDir, { recursive: true });
    await mkdir(this.paths.adaptationsDir(state.id), { recursive: true });
    await Bun.write(`${genDir}/summary.md`, `# ${state.id}\n\n**Goal:** ${state.goal}\n**Genome Version:** ${state.genomeVersion}\n**Started:** ${state.startedAt}\n**Completed:** ${state.completedAt}\n`);

    // Clear current
    await Bun.write(this.paths.currentYml, "");
  }

  async save(state: GenerationState): Promise<void> {
    await Bun.write(this.paths.currentYml, YAML.stringify(state));
  }

  async listCompleted(): Promise<string[]> {
    try {
      const entries = await readdir(this.paths.lineage);
      return entries.filter(e => e.startsWith("gen-")).sort();
    } catch {
      return [];
    }
  }

  async nextGenId(): Promise<string> {
    const genDirs = await this.listCompleted();
    if (genDirs.length === 0) {
      // Check if there's an active generation
      const current = await this.current();
      if (current) {
        const num = parseInt(current.id.replace("gen-", ""), 10);
        return `gen-${String(num + 1).padStart(3, "0")}`;
      }
      return "gen-001";
    }
    const last = genDirs[genDirs.length - 1];
    const num = parseInt(last.replace("gen-", ""), 10);
    return `gen-${String(num + 1).padStart(3, "0")}`;
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
bun test tests/core/generation.test.ts
```
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/core/generation.ts tests/core/generation.test.ts
git commit -m "feat: implement GenerationManager for Life Cycle state tracking"
```

### Task 7: reap init 커맨드

**Files:**
- Create: `src/cli/index.ts`
- Create: `src/cli/commands/init.ts`
- Create: `src/templates/config.yml`
- Create: `src/templates/genome/cheatsheet.md`
- Create: `tests/commands/init.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/commands/init.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, readdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { initProject } from "../../src/cli/commands/init";

describe("reap init", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "reap-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test("creates .reap/ with 4-axis structure", async () => {
    await initProject(tempDir, "test-project", "greenfield");

    const reapDir = join(tempDir, ".reap");
    const entries = await readdir(reapDir);
    expect(entries).toContain("config.yml");
    expect(entries).toContain("genome");
    expect(entries).toContain("environment");
    expect(entries).toContain("life");
    expect(entries).toContain("lineage");
  });

  test("creates config.yml with project info", async () => {
    await initProject(tempDir, "test-project", "greenfield");

    const config = await Bun.file(join(tempDir, ".reap", "config.yml")).text();
    expect(config).toContain("project: test-project");
    expect(config).toContain("entryMode: greenfield");
  });

  test("creates genome subdirectories", async () => {
    await initProject(tempDir, "test-project", "greenfield");

    const genomeEntries = await readdir(join(tempDir, ".reap", "genome"));
    expect(genomeEntries).toContain("architecture");
    expect(genomeEntries).toContain("cheatsheet.md");
  });

  test("creates life subdirectories", async () => {
    await initProject(tempDir, "test-project", "greenfield");

    const lifeEntries = await readdir(join(tempDir, ".reap", "life"));
    expect(lifeEntries).toContain("backlog");
    expect(lifeEntries).toContain("mutations");
  });

  test("fails if .reap/ already exists", async () => {
    await initProject(tempDir, "test-project", "greenfield");
    await expect(initProject(tempDir, "test-project", "greenfield")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/commands/init.test.ts
```
Expected: FAIL

- [ ] **Step 3: 템플릿 파일 생성**

```yaml
# src/templates/config.yml
version: "0.1.0"
project: ""
entryMode: greenfield
```

```markdown
<!-- src/templates/genome/cheatsheet.md -->
# Cheatsheet

프로젝트 고유의 개발 규칙을 여기에 작성합니다.
AI가 작업 시 수시로 참조합니다.

## Rules

- (여기에 규칙 추가)
```

- [ ] **Step 4: init 커맨드 구현**

```typescript
// src/cli/commands/init.ts
import { mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";
import type { ReapConfig } from "../../types";

export async function initProject(
  projectRoot: string,
  projectName: string,
  entryMode: "greenfield" | "migration" | "adoption",
): Promise<void> {
  const paths = new ReapPaths(projectRoot);

  if (await paths.isReapProject()) {
    throw new Error(".reap/ already exists. This is already a REAP project.");
  }

  // Create 4-axis directory structure
  await mkdir(paths.root, { recursive: true });
  await mkdir(join(paths.genome, "architecture"), { recursive: true });
  await mkdir(paths.environment, { recursive: true });
  await mkdir(paths.mutations, { recursive: true });
  await mkdir(paths.backlog, { recursive: true });
  await mkdir(paths.lineage, { recursive: true });

  // Write config
  const config: ReapConfig = {
    version: "0.1.0",
    project: projectName,
    entryMode,
  };
  await ConfigManager.write(paths, config);

  // Write initial genome files
  await Bun.write(
    paths.cheatsheet,
    "# Cheatsheet\n\n프로젝트 고유의 개발 규칙을 여기에 작성합니다.\nAI가 작업 시 수시로 참조합니다.\n\n## Rules\n\n- (여기에 규칙 추가)\n"
  );
}
```

- [ ] **Step 5: CLI entry point 구현**

```typescript
// src/cli/index.ts
#!/usr/bin/env bun
import { program } from "commander";
import { initProject } from "./commands/init";

program
  .name("reap")
  .description("REAP — Recursive Evolutionary Application Pipeline")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize a new REAP project (Genesis)")
  .argument("<project-name>", "Project name")
  .option("-m, --mode <mode>", "Entry mode: greenfield, migration, adoption", "greenfield")
  .action(async (projectName: string, options: { mode: string }) => {
    try {
      const mode = options.mode as "greenfield" | "migration" | "adoption";
      await initProject(process.cwd(), projectName, mode);
      console.log(`✓ REAP project "${projectName}" initialized (${mode} mode)`);
      console.log(`  .reap/ directory created with genome, environment, life, lineage`);
      console.log(`\nNext: run 'reap evolve' to start your first Generation`);
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });

program.parse();
```

- [ ] **Step 6: 테스트 통과 확인**

```bash
bun test tests/commands/init.test.ts
```
Expected: PASS

- [ ] **Step 7: 수동 테스트**

```bash
cd /tmp && mkdir reap-manual-test && cd reap-manual-test
bun run /Users/hichoi/cdws/reap-wf/src/cli/index.ts init my-app
ls -la .reap/
```

- [ ] **Step 8: 커밋**

```bash
git add src/cli/ src/templates/ tests/commands/
git commit -m "feat: implement reap init command with 4-axis directory scaffolding"
```

---

## Chunk 4: reap evolve + reap status

### Task 8: reap evolve 커맨드

**Files:**
- Create: `src/cli/commands/evolve.ts`
- Create: `tests/commands/evolve.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/commands/evolve.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { initProject } from "../../src/cli/commands/init";
import { evolve, advanceStage } from "../../src/cli/commands/evolve";

describe("reap evolve", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "reap-test-"));
    await initProject(tempDir, "test", "greenfield");
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test("starts a new generation with goal", async () => {
    const state = await evolve(tempDir, "Implement user login");
    expect(state.goal).toBe("Implement user login");
    expect(state.stage).toBe("conception");
    expect(state.id).toBe("gen-001");
  });

  test("fails if generation already active", async () => {
    await evolve(tempDir, "Goal A");
    await expect(evolve(tempDir, "Goal B")).rejects.toThrow();
  });

  test("advance moves to next stage", async () => {
    await evolve(tempDir, "Test goal");
    const state = await advanceStage(tempDir);
    expect(state.stage).toBe("formation");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/commands/evolve.test.ts
```
Expected: FAIL

- [ ] **Step 3: 구현**

```typescript
// src/cli/commands/evolve.ts
import { ReapPaths } from "../../core/paths";
import { GenerationManager } from "../../core/generation";
import { ConfigManager } from "../../core/config";
import { LifeCycle } from "../../core/lifecycle";
import type { GenerationState } from "../../types";

export async function evolve(projectRoot: string, goal: string): Promise<GenerationState> {
  const paths = new ReapPaths(projectRoot);
  const mgr = new GenerationManager(paths);

  const current = await mgr.current();
  if (current) {
    throw new Error(`Generation ${current.id} is already active (stage: ${current.stage}). Complete it before starting a new one.`);
  }

  const config = await ConfigManager.read(paths);
  const genCount = (await mgr.listCompleted()).length;
  const state = await mgr.create(goal, genCount + 1);
  return state;
}

export async function advanceStage(projectRoot: string): Promise<GenerationState> {
  const paths = new ReapPaths(projectRoot);
  const mgr = new GenerationManager(paths);
  return mgr.advance();
}

export async function regressStage(projectRoot: string): Promise<GenerationState> {
  const paths = new ReapPaths(projectRoot);
  const mgr = new GenerationManager(paths);
  const current = await mgr.current();
  if (!current) throw new Error("No active Generation");

  // Only fitness -> growth is allowed
  if (current.stage !== "fitness") {
    throw new Error(`Cannot go back from ${current.stage}. Only Fitness → Growth is supported.`);
  }
  current.stage = "growth";
  await mgr.save(current);
  return current;
}
```

- [ ] **Step 4: CLI에 evolve 커맨드 등록**

`src/cli/index.ts`에 추가:

```typescript
import { evolve, advanceStage, regressStage } from "./commands/evolve";

program
  .command("evolve")
  .description("Start a new Generation or advance the current Life Cycle stage")
  .argument("[goal]", "Goal for the new Generation")
  .option("--advance", "Advance to the next Life Cycle stage")
  .option("--back", "Go back to the previous stage (Growth ↔ Fitness loop)")
  .action(async (goal: string | undefined, options: { advance?: boolean; back?: boolean }) => {
    try {
      if (options.back) {
        const state = await regressStage(process.cwd());
        console.log(`✓ Returned to ${state.stage} (${LifeCycle.label(state.stage)})`);
      } else if (options.advance) {
        const state = await advanceStage(process.cwd());
        console.log(`✓ Advanced to ${state.stage} (${LifeCycle.label(state.stage)})`);
      } else if (goal) {
        const state = await evolve(process.cwd(), goal);
        console.log(`✓ Generation ${state.id} started`);
        console.log(`  Goal: ${state.goal}`);
        console.log(`  Stage: ${state.stage} (${LifeCycle.label(state.stage)})`);
      } else {
        console.error("Error: provide a goal or use --advance");
        process.exit(1);
      }
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
bun test tests/commands/evolve.test.ts
```
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add src/cli/commands/evolve.ts tests/commands/evolve.test.ts src/cli/index.ts
git commit -m "feat: implement reap evolve command for Generation lifecycle"
```

### Task 9: reap status 커맨드

**Files:**
- Create: `src/cli/commands/status.ts`
- Create: `tests/commands/status.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/commands/status.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { initProject } from "../../src/cli/commands/init";
import { evolve } from "../../src/cli/commands/evolve";
import { getStatus } from "../../src/cli/commands/status";

describe("reap status", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "reap-test-"));
    await initProject(tempDir, "test-project", "greenfield");
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test("returns project info when no active generation", async () => {
    const status = await getStatus(tempDir);
    expect(status.project).toBe("test-project");
    expect(status.generation).toBeNull();
  });

  test("returns generation info when active", async () => {
    await evolve(tempDir, "Build login");
    const status = await getStatus(tempDir);
    expect(status.generation).not.toBeNull();
    expect(status.generation!.goal).toBe("Build login");
    expect(status.generation!.stage).toBe("conception");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/commands/status.test.ts
```
Expected: FAIL

- [ ] **Step 3: 구현**

```typescript
// src/cli/commands/status.ts
import { readdir } from "fs/promises";
import { ReapPaths } from "../../core/paths";
import { GenerationManager } from "../../core/generation";
import { ConfigManager } from "../../core/config";
import type { GenerationState, ReapConfig } from "../../types";

export interface ReapStatus {
  project: string;
  entryMode: string;
  generation: GenerationState | null;
  totalGenerations: number;
}

export async function getStatus(projectRoot: string): Promise<ReapStatus> {
  const paths = new ReapPaths(projectRoot);
  const config = await ConfigManager.read(paths);
  const mgr = new GenerationManager(paths);
  const generation = await mgr.current();

  let totalGenerations = 0;
  try {
    const entries = await readdir(paths.lineage);
    totalGenerations = entries.filter(e => e.startsWith("gen-")).length;
  } catch {}

  return {
    project: config.project,
    entryMode: config.entryMode,
    generation,
    totalGenerations,
  };
}
```

- [ ] **Step 4: CLI에 status 커맨드 등록**

`src/cli/index.ts`에 추가:

```typescript
import { getStatus } from "./commands/status";
import { LifeCycle } from "../core/lifecycle";

program
  .command("status")
  .description("Show current Generation and project status")
  .action(async () => {
    try {
      const status = await getStatus(process.cwd());
      console.log(`Project: ${status.project} (${status.entryMode})`);
      console.log(`Completed Generations: ${status.totalGenerations}`);
      if (status.generation) {
        console.log(`\nActive Generation: ${status.generation.id}`);
        console.log(`  Goal: ${status.generation.goal}`);
        console.log(`  Stage: ${status.generation.stage} (${LifeCycle.label(status.generation.stage)})`);
        console.log(`  Genome: v${status.generation.genomeVersion}`);
        console.log(`  Started: ${status.generation.startedAt}`);
      } else {
        console.log(`\nNo active Generation. Run 'reap evolve <goal>' to start one.`);
      }
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
bun test tests/commands/status.test.ts
```
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add src/cli/commands/status.ts tests/commands/status.test.ts src/cli/index.ts
git commit -m "feat: implement reap status command"
```

---

## Chunk 5: AI Agent 커맨드 (슬래시 커맨드 프롬프트)

### Task 10: Claude Code 슬래시 커맨드 생성

**Files:**
- Create: `src/templates/commands/conception.md`
- Create: `src/templates/commands/formation.md`
- Create: `src/templates/commands/planning.md`
- Create: `src/templates/commands/growth.md`
- Create: `src/templates/commands/fitness.md`
- Create: `src/templates/commands/adaptation.md`
- Create: `src/templates/commands/birth.md`

- [ ] **Step 1: conception 커맨드 작성**

```markdown
<!-- src/templates/commands/conception.md -->
---
description: "REAP Conception — 이번 Generation의 목표를 설정합니다"
---

# Conception (목표 설정)

현재 Generation의 목표를 설정하는 단계입니다.

## 해야 할 것

1. `.reap/environment/`를 읽고 외부 환경 변화를 파악하세요
2. `.reap/life/backlog/`에 예정된 목표가 있는지 확인하세요
3. 이전 세대의 Adaptation이 있다면 `.reap/lineage/`에서 참조하세요
4. 인간과 대화하여 이번 세대의 목표를 구체화하세요
5. 목표가 확정되면 `reap evolve --advance`로 다음 단계로 진행하세요

## 좋은 목표의 기준

- 하나의 Generation에서 달성 가능한 크기
- 검증 가능한 완료 조건이 있음
- Genome의 어떤 부분이 관련되는지 명확함
```

- [ ] **Step 2: formation 커맨드 작성**

```markdown
<!-- src/templates/commands/formation.md -->
---
description: "REAP Formation — 목표 달성에 필요한 명세를 정의합니다"
---

# Formation (Define)

목표 달성에 필요한 명세를 Genome으로부터 읽고 보완하는 단계입니다.

## 해야 할 것

1. `.reap/genome/`에서 관련 명세를 읽으세요
2. 목표 달성에 필요한 명세가 부족하면 보완 계획을 세우세요
3. 현재 Genome에서 수정이 필요한 부분이 있다면 Mutation으로 기록하세요:
   - `.reap/life/mutations/`에 YAML 파일로 기록
4. 명세 정리가 완료되면 `reap evolve --advance`로 다음 단계로 진행하세요
```

- [ ] **Step 3: planning 커맨드 작성**

```markdown
<!-- src/templates/commands/planning.md -->
---
description: "REAP Planning — 구현 계획을 수립합니다"
---

# Planning (Plan)

구현 계획을 수립하고 작업을 분해하는 단계입니다.

## 해야 할 것

1. Formation에서 정리한 명세를 바탕으로 구현 계획을 세우세요
2. 작업을 분해하여 구체적인 태스크 목록을 만드세요
3. 각 태스크의 예상 범위와 순서를 정하세요
4. 계획이 완료되면 `reap evolve --advance`로 다음 단계로 진행하세요
```

- [ ] **Step 4: growth 커맨드 작성**

```markdown
<!-- src/templates/commands/growth.md -->
---
description: "REAP Growth — AI+Human 협업으로 코드를 구현합니다"
---

# Growth (Build)

AI와 Human이 협업하여 Civilization(Source Code)을 구현하는 단계입니다.

## 해야 할 것

1. Planning에서 세운 계획에 따라 코드를 구현하세요
2. 명세(Genome)와 다르게 구현해야 할 부분을 발견하면 Mutation으로 기록하세요:
   - `.reap/life/mutations/`에 YAML 파일로 기록 (id, file, description, createdAt)
3. 구현이 완료되면 `reap evolve --advance`로 Fitness 단계로 진행하세요
4. Fitness에서 문제가 발견되면 `reap evolve --back`으로 다시 Growth로 돌아올 수 있습니다
```

- [ ] **Step 5: fitness 커맨드 작성**

```markdown
<!-- src/templates/commands/fitness.md -->
---
description: "REAP Fitness — 테스트와 검증으로 목표 달성을 확인합니다"
---

# Fitness (Verify)

테스트와 검증을 통해 목표 달성을 확인하는 단계입니다.

## 해야 할 것

1. 테스트를 실행하여 구현이 올바른지 확인하세요
2. 목표에서 정의한 완료 조건을 점검하세요
3. 문제가 발견되면 `reap evolve --back`으로 Growth로 돌아가세요 (Growth ↔ Fitness 루프)
4. 검증이 완료되면 `reap evolve --advance`로 Adaptation 단계로 진행하세요
```

- [ ] **Step 6: adaptation 커맨드 작성**

```markdown
<!-- src/templates/commands/adaptation.md -->
---
description: "REAP Adaptation — 회고하고 다음 세대를 위한 Genome diff를 작성합니다"
---

# Adaptation (Retrospect)

이번 세대를 회고하고 다음 세대를 위한 적응을 기록하는 단계입니다.

## 해야 할 것

1. 이번 Generation에서 기록된 Mutation들을 리뷰하세요: `.reap/life/mutations/`
2. 교훈을 정리하세요:
   - Genome에서 수정해야 할 것 (아키텍처, 명세, 규칙)
   - 다음 세대에서 개선해야 할 것
3. Adaptation을 기록하세요 (Genome diff)
4. 다음 세대의 목표 후보를 `.reap/life/backlog/`에 추가하세요
5. `reap evolve --advance`로 Birth 단계로 진행하세요
```

- [ ] **Step 7: birth 커맨드 작성**

```markdown
<!-- src/templates/commands/birth.md -->
---
description: "REAP Birth — Genome을 진화시키고 다음 세대의 초기 상태를 생성합니다"
---

# Birth (출산)

Mutation과 Adaptation을 Genome에 반영하고 다음 세대의 초기 상태를 생성하는 단계입니다.

## 해야 할 것

1. `.reap/life/mutations/`의 Mutation들을 Genome에 반영하세요
2. Adaptation에서 기록한 Genome diff를 적용하세요
3. 변경된 Genome을 검토하세요 (인간 확인)
4. `reap evolve --advance`로 Legacy 단계로 진행하세요
   - CLI가 자동으로 다음 세대의 초기 상태를 생성합니다
   - 현재 세대 기록이 Lineage로 이동합니다
```

- [ ] **Step 8: reap init에서 커맨드 파일 복사 로직 추가**

`src/cli/commands/init.ts`에 Claude Code 커맨드 등록 로직 추가:

```typescript
// init.ts의 initProject 함수에 추가
import { readdir } from "fs/promises";

// Create claude commands directory
const claudeCommandsDir = join(projectRoot, ".claude", "commands");
await mkdir(claudeCommandsDir, { recursive: true });

// Copy command templates
const commandsDir = join(import.meta.dir, "../../templates/commands");
const commands = ["conception", "formation", "planning", "growth", "fitness", "adaptation", "birth"];
for (const cmd of commands) {
  const src = join(commandsDir, `${cmd}.md`);
  const dest = join(claudeCommandsDir, `reap-${cmd}.md`);
  const content = await Bun.file(src).text();
  await Bun.write(dest, content);
}
```

- [ ] **Step 9: 커밋**

```bash
git add src/templates/commands/ src/cli/commands/init.ts
git commit -m "feat: add AI agent slash commands for all Life Cycle stages"
```

---

## Chunk 6: Mutation 기록 + 통합 테스트

### Task 11: Mutation 기록 기능

**Files:**
- Create: `src/core/mutation.ts`
- Create: `tests/core/mutation.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/core/mutation.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { MutationManager } from "../../src/core/mutation";
import { ReapPaths } from "../../src/core/paths";

describe("MutationManager", () => {
  let tempDir: string;
  let paths: ReapPaths;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "reap-test-"));
    paths = new ReapPaths(tempDir);
    await mkdir(paths.mutations, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test("record creates a mutation file", async () => {
    const mgr = new MutationManager(paths);
    const mutation = await mgr.record("gen-001", "genome/modules/order/data.yml", "Add status field to Order entity");

    expect(mutation.id).toMatch(/^mut-/);
    expect(mutation.generationId).toBe("gen-001");
    expect(mutation.file).toBe("genome/modules/order/data.yml");
  });

  test("list returns all mutations", async () => {
    const mgr = new MutationManager(paths);
    await mgr.record("gen-001", "file1", "change 1");
    await mgr.record("gen-001", "file2", "change 2");

    const mutations = await mgr.list();
    expect(mutations).toHaveLength(2);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/core/mutation.test.ts
```
Expected: FAIL

- [ ] **Step 3: 구현**

```typescript
// src/core/mutation.ts
import YAML from "yaml";
import { readdir, unlink } from "fs/promises";
import { join } from "path";
import type { MutationRecord } from "../types";
import type { ReapPaths } from "./paths";

export class MutationManager {
  constructor(private paths: ReapPaths) {}

  async record(generationId: string, file: string, description: string): Promise<MutationRecord> {
    const id = `mut-${Date.now()}`;
    const mutation: MutationRecord = {
      id,
      generationId,
      file,
      description,
      createdAt: new Date().toISOString(),
    };
    await Bun.write(
      join(this.paths.mutations, `${id}.yml`),
      YAML.stringify(mutation),
    );
    return mutation;
  }

  async list(): Promise<MutationRecord[]> {
    try {
      const entries = await readdir(this.paths.mutations);
      const mutations: MutationRecord[] = [];
      for (const entry of entries.filter(e => e.endsWith(".yml"))) {
        const content = await Bun.file(join(this.paths.mutations, entry)).text();
        mutations.push(YAML.parse(content) as MutationRecord);
      }
      return mutations.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } catch {
      return [];
    }
  }

  async clear(): Promise<void> {
    const entries = await readdir(this.paths.mutations);
    for (const entry of entries.filter(e => e.endsWith(".yml"))) {
      await unlink(join(this.paths.mutations, entry));
    }
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
bun test tests/core/mutation.test.ts
```
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/core/mutation.ts tests/core/mutation.test.ts
git commit -m "feat: implement MutationManager for recording genome mutations"
```

### Task 11b: Adaptation 기록 기능

**Files:**
- Create: `src/core/adaptation.ts`
- Create: `tests/core/adaptation.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// tests/core/adaptation.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { AdaptationManager } from "../../src/core/adaptation";
import { ReapPaths } from "../../src/core/paths";

describe("AdaptationManager", () => {
  let tempDir: string;
  let paths: ReapPaths;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "reap-test-"));
    paths = new ReapPaths(tempDir);
    // lineage/gen-001/adaptations/ 디렉토리 생성
    await mkdir(join(paths.lineage, "gen-001", "adaptations"), { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test("record creates an adaptation file", async () => {
    const mgr = new AdaptationManager(paths);
    const adaptation = await mgr.record("gen-001", "genome/architecture/application.md", "Add caching strategy section");

    expect(adaptation.id).toMatch(/^adapt-/);
    expect(adaptation.generationId).toBe("gen-001");
    expect(adaptation.targetFile).toBe("genome/architecture/application.md");
  });

  test("list returns all adaptations for a generation", async () => {
    const mgr = new AdaptationManager(paths);
    await mgr.record("gen-001", "file1", "change 1");
    await mgr.record("gen-001", "file2", "change 2");

    const adaptations = await mgr.list("gen-001");
    expect(adaptations).toHaveLength(2);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
bun test tests/core/adaptation.test.ts
```
Expected: FAIL

- [ ] **Step 3: 구현**

```typescript
// src/core/adaptation.ts
import YAML from "yaml";
import { readdir } from "fs/promises";
import { join } from "path";
import type { AdaptationRecord } from "../types";
import type { ReapPaths } from "./paths";

export class AdaptationManager {
  constructor(private paths: ReapPaths) {}

  async record(generationId: string, targetFile: string, description: string, diff?: string): Promise<AdaptationRecord> {
    const id = `adapt-${Date.now()}`;
    const adaptation: AdaptationRecord = {
      id,
      generationId,
      targetFile,
      description,
      diff: diff ?? "",
      createdAt: new Date().toISOString(),
    };
    const dir = join(this.paths.lineage, generationId, "adaptations");
    await Bun.write(
      join(dir, `${id}.yml`),
      YAML.stringify(adaptation),
    );
    return adaptation;
  }

  async list(generationId: string): Promise<AdaptationRecord[]> {
    try {
      const dir = join(this.paths.lineage, generationId, "adaptations");
      const entries = await readdir(dir);
      const adaptations: AdaptationRecord[] = [];
      for (const entry of entries.filter(e => e.endsWith(".yml"))) {
        const content = await Bun.file(join(dir, entry)).text();
        adaptations.push(YAML.parse(content) as AdaptationRecord);
      }
      return adaptations.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } catch {
      return [];
    }
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
bun test tests/core/adaptation.test.ts
```
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/core/adaptation.ts tests/core/adaptation.test.ts
git commit -m "feat: implement AdaptationManager for recording genome diffs"
```

### Task 12: 전체 통합 테스트

**Files:**
- Create: `tests/integration/full-lifecycle.test.ts`

- [ ] **Step 1: 통합 테스트 작성**

```typescript
// tests/integration/full-lifecycle.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, readdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { initProject } from "../../src/cli/commands/init";
import { evolve, advanceStage } from "../../src/cli/commands/evolve";
import { getStatus } from "../../src/cli/commands/status";
import { MutationManager } from "../../src/core/mutation";
import { ReapPaths } from "../../src/core/paths";

describe("Full Generation Lifecycle", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "reap-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test("complete lifecycle: init → evolve → advance through all stages", async () => {
    // Genesis
    await initProject(tempDir, "test-app", "greenfield");
    let status = await getStatus(tempDir);
    expect(status.project).toBe("test-app");
    expect(status.generation).toBeNull();

    // Start Generation
    await evolve(tempDir, "Build user authentication");
    status = await getStatus(tempDir);
    expect(status.generation!.stage).toBe("conception");

    // Advance: conception → formation
    await advanceStage(tempDir);
    status = await getStatus(tempDir);
    expect(status.generation!.stage).toBe("formation");

    // Advance: formation → planning
    await advanceStage(tempDir);
    expect((await getStatus(tempDir)).generation!.stage).toBe("planning");

    // Advance: planning → growth
    await advanceStage(tempDir);
    expect((await getStatus(tempDir)).generation!.stage).toBe("growth");

    // Record a mutation during growth
    const paths = new ReapPaths(tempDir);
    const mutMgr = new MutationManager(paths);
    await mutMgr.record("gen-001", "genome/architecture/application.md", "Need to add auth middleware layer");

    // Advance: growth → fitness
    await advanceStage(tempDir);
    expect((await getStatus(tempDir)).generation!.stage).toBe("fitness");

    // Advance: fitness → adaptation
    await advanceStage(tempDir);
    expect((await getStatus(tempDir)).generation!.stage).toBe("adaptation");

    // Advance: adaptation → birth
    await advanceStage(tempDir);
    expect((await getStatus(tempDir)).generation!.stage).toBe("birth");

    // Advance: birth → legacy
    await advanceStage(tempDir);
    expect((await getStatus(tempDir)).generation!.stage).toBe("legacy");
  });
});
```

- [ ] **Step 2: 테스트 실행**

```bash
bun test tests/integration/full-lifecycle.test.ts
```
Expected: PASS

- [ ] **Step 3: 전체 테스트 실행**

```bash
bun test
```
Expected: ALL PASS

- [ ] **Step 4: 커밋**

```bash
git add tests/integration/
git commit -m "test: add full lifecycle integration test"
```

---

## Phase 1 완료 기준

Phase 1이 완료되면 다음이 가능해야 한다:

```bash
# Genesis
reap init my-app

# Start a Generation
reap evolve "Build user authentication"

# Check status
reap status
# → Project: my-app (greenfield)
# → Active Generation: gen-001
# → Stage: conception (목표 설정)

# Advance through Life Cycle
reap evolve --advance   # → formation
reap evolve --advance   # → planning
reap evolve --advance   # → growth
reap evolve --advance   # → fitness
reap evolve --advance   # → adaptation
reap evolve --advance   # → birth
reap evolve --advance   # → legacy (complete)

# Start next Generation
reap evolve "Add order management module"
```

---

## Phase 2 계획 (별도 plan 문서에서 상세화)

Phase 1 완료 후 다음을 구현한다:

1. **reap scan** — TypeScript/Java 소스 파싱 → source-map.json 생성
2. **reap diff** — Genome 명세와 Civilization(코드) 비교
3. **Birth 자동화** — Mutation/Adaptation을 Genome에 자동 반영하는 메커니즘
4. **Genome 버저닝** — genomeVersion 자동 증가 및 추적
5. **Claude Code 연동 강화** — CLAUDE.md 자동 생성, context 주입
