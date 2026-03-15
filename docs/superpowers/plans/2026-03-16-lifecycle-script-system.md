# Life Cycle Script System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** REAP의 각 Life Cycle stage에 slash command + prompt template 시스템을 구현하여 AI Agent가 워크플로우를 실행할 수 있게 한다.

**Architecture:** 기존 CLI MVP 위에 (1) ReapPaths/Types 업데이트, (2) 7개 slash command + 7개 artifact template 작성, (3) init 변경, (4) Legacy 자동화 구현. slash command 원본은 `.reap/commands/`에 저장하고 `.claude/commands/`로 복사.

**Tech Stack:** Bun, TypeScript, Commander.js, yaml

**Spec:** `docs/superpowers/specs/2026-03-16-lifecycle-script-system-design.md`

---

## File Structure

### 수정할 파일
- `src/core/paths.ts` — genome 경로 변경, commands/templates 경로 추가
- `src/types/index.ts` — MutationRecord 필드 변경
- `src/cli/commands/init.ts` — 새 디렉토리 구조, genome 파일, commands/templates 복사
- `src/core/generation.ts` — Legacy 자동화 (life/ → lineage/ 이동)
- `src/core/mutation.ts` — 새 MutationRecord 포맷 반영
- `src/cli/commands/fix.ts` — 새 디렉토리 구조 검증
- `tests/commands/init.test.ts` — 새 구조 검증
- `tests/core/paths.test.ts` — 새 경로 검증
- `tests/core/mutation.test.ts` — 새 포맷 검증
- `tests/commands/fix.test.ts` — 새 검증 로직
- `tests/integration/full-lifecycle.test.ts` — Legacy 자동화 검증

### 삭제할 파일
- `src/templates/commands/*.md` — 기존 slash command 템플릿 (새 것으로 교체)
- `src/templates/genome/cheatsheet.md` — genome 구조 변경
- `src/templates/config.yml` — init.ts에서 직접 생성하므로 불필요

### 생성할 파일
- `src/templates/commands/reap.conception.md` — Conception slash command
- `src/templates/commands/reap.formation.md` — Formation slash command
- `src/templates/commands/reap.planning.md` — Planning slash command
- `src/templates/commands/reap.growth.md` — Growth slash command
- `src/templates/commands/reap.validation.md` — Validation slash command
- `src/templates/commands/reap.adaptation.md` — Adaptation slash command
- `src/templates/commands/reap.birth.md` — Birth slash command
- `src/templates/artifacts/01-conception-goal.md` — Goal 템플릿
- `src/templates/artifacts/02-formation-spec.md` — Spec 템플릿
- `src/templates/artifacts/03-planning-plan.md` — Plan 템플릿
- `src/templates/artifacts/04-growth-log.md` — Growth log 템플릿
- `src/templates/artifacts/05-validation-report.md` — Validation report 템플릿
- `src/templates/artifacts/06-adaptation-retrospective.md` — Retrospective 템플릿
- `src/templates/artifacts/07-birth-changelog.md` — Changelog 템플릿
- `src/templates/genome/principles.md` — 초기 genome: 아키텍처 원칙
- `src/templates/genome/conventions.md` — 초기 genome: 개발 컨벤션
- `src/templates/genome/constraints.md` — 초기 genome: 기술 제약

---

## Chunk 1: Types & Paths 업데이트

### Task 1: MutationRecord 타입 업데이트

**Files:**
- Modify: `src/types/index.ts`
- Test: `tests/core/types.test.ts`

- [ ] **Step 1: types.test.ts에 새 MutationRecord 필드 테스트 추가**

```typescript
// tests/core/types.test.ts 에 추가
test("MutationRecord has target, reason, suggestedChange fields", () => {
  const mutation: MutationRecord = {
    id: "mut-001",
    generationId: "gen-001",
    target: "genome/domain/auth.md",
    description: "API 인증 방식 변경 필요",
    reason: "외부 서비스 연동 요구사항",
    suggestedChange: "OAuth2 + OIDC 연동",
    createdAt: "2026-03-16T10:00:00Z",
  };
  expect(mutation.target).toBe("genome/domain/auth.md");
  expect(mutation.reason).toBe("외부 서비스 연동 요구사항");
  expect(mutation.suggestedChange).toBe("OAuth2 + OIDC 연동");
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `~/.bun/bin/bun test tests/core/types.test.ts`
Expected: FAIL (MutationRecord에 target, reason, suggestedChange 필드 없음)

- [ ] **Step 3: MutationRecord 타입 수정**

`src/types/index.ts`의 MutationRecord를:

```typescript
export interface MutationRecord {
  id: string;
  generationId: string;
  target: string;          // 변경 대상 genome 파일 경로
  description: string;
  reason: string;          // 변이 발생 사유
  suggestedChange: string; // 제안 변경 내용
  createdAt: string;
}
```

기존 `file` 필드를 `target`으로 변경. `reason`, `suggestedChange` 추가.

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `~/.bun/bin/bun test tests/core/types.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/types/index.ts tests/core/types.test.ts
git commit -m "feat: update MutationRecord with target, reason, suggestedChange fields"
```

### Task 2: ReapPaths 업데이트

**Files:**
- Modify: `src/core/paths.ts`
- Test: `tests/core/paths.test.ts`

- [ ] **Step 1: paths.test.ts에 새 경로 테스트 추가**

```typescript
// tests/core/paths.test.ts 에 추가/수정

test("genome paths reflect new structure", () => {
  const paths = new ReapPaths("/tmp/test");
  expect(paths.principles).toBe("/tmp/test/.reap/genome/principles.md");
  expect(paths.domain).toBe("/tmp/test/.reap/genome/domain");
  expect(paths.conventions).toBe("/tmp/test/.reap/genome/conventions.md");
  expect(paths.constraints).toBe("/tmp/test/.reap/genome/constraints.md");
});

test("commands and templates paths", () => {
  const paths = new ReapPaths("/tmp/test");
  expect(paths.commands).toBe("/tmp/test/.reap/commands");
  expect(paths.templates).toBe("/tmp/test/.reap/templates");
});

test("artifact path helper", () => {
  const paths = new ReapPaths("/tmp/test");
  expect(paths.artifact("01-conception-goal.md")).toBe("/tmp/test/.reap/life/01-conception-goal.md");
});
```

기존 `sourceMap`, `cheatsheet`, `architecture` 테스트는 제거.

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `~/.bun/bin/bun test tests/core/paths.test.ts`
Expected: FAIL

- [ ] **Step 3: ReapPaths 수정**

```typescript
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
  get mutations(): string { return join(this.life, "mutations"); }
  get backlog(): string { return join(this.life, "backlog"); }
  artifact(name: string): string { return join(this.life, name); }

  // Lineage (완료된 세대)
  get lineage(): string { return join(this.root, "lineage"); }
  generationDir(genId: string): string { return join(this.lineage, genId); }

  // Commands & Templates (에이전트 독립)
  get commands(): string { return join(this.root, "commands"); }
  get templates(): string { return join(this.root, "templates"); }

  // Claude Code integration
  get claudeCommands(): string { return join(this.projectRoot, ".claude", "commands"); }

  async isReapProject(): Promise<boolean> {
    try {
      const s = await stat(this.root);
      return s.isDirectory();
    } catch {
      return false;
    }
  }
}
```

`sourceMap`, `cheatsheet`, `architecture`, `origins`, `claude`, `adaptationsDir` 제거.

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `~/.bun/bin/bun test tests/core/paths.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/core/paths.ts tests/core/paths.test.ts
git commit -m "feat: update ReapPaths for new genome/commands/templates structure"
```

### Task 3: MutationManager 업데이트

**Files:**
- Modify: `src/core/mutation.ts`
- Test: `tests/core/mutation.test.ts`

- [ ] **Step 1: mutation.test.ts 업데이트**

기존 `record()` 테스트의 파라미터를 새 시그니처에 맞게 수정:

```typescript
test("records a mutation", async () => {
  const mgr = new MutationManager(paths);
  const result = await mgr.record("gen-001", {
    target: "genome/domain/auth.md",
    description: "Need auth middleware",
    reason: "외부 서비스 연동 요구사항",
    suggestedChange: "OAuth2 추가",
  });
  expect(result.id).toMatch(/^mut-/);
  expect(result.target).toBe("genome/domain/auth.md");
  expect(result.reason).toBe("외부 서비스 연동 요구사항");
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `~/.bun/bin/bun test tests/core/mutation.test.ts`
Expected: FAIL

- [ ] **Step 3: MutationManager 수정**

```typescript
interface RecordMutationInput {
  target: string;
  description: string;
  reason: string;
  suggestedChange: string;
}

export class MutationManager {
  constructor(private paths: ReapPaths) {}

  async record(generationId: string, input: RecordMutationInput): Promise<MutationRecord> {
    const id = `mut-${Date.now()}-${mutCounter++}`;
    const mutation: MutationRecord = {
      id,
      generationId,
      target: input.target,
      description: input.description,
      reason: input.reason,
      suggestedChange: input.suggestedChange,
      createdAt: new Date().toISOString(),
    };
    await Bun.write(
      join(this.paths.mutations, `${id}.yml`),
      YAML.stringify(mutation),
    );
    return mutation;
  }

  // list() and clear() unchanged
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `~/.bun/bin/bun test tests/core/mutation.test.ts`
Expected: PASS

- [ ] **Step 5: 전체 테스트에서 기존 record() 호출 수정**

`tests/integration/full-lifecycle.test.ts`의 `mutMgr.record(...)` 호출도 새 시그니처로 수정.

- [ ] **Step 6: 전체 테스트 실행**

Run: `~/.bun/bin/bun test`
Expected: ALL PASS

- [ ] **Step 7: 커밋**

```bash
git add src/core/mutation.ts tests/core/mutation.test.ts tests/integration/full-lifecycle.test.ts
git commit -m "feat: update MutationManager with new record format (target, reason, suggestedChange)"
```

---

## Chunk 2: Slash Command 템플릿 작성

### Task 4: 기존 템플릿 삭제 및 새 slash command 작성

**Files:**
- Delete: `src/templates/commands/conception.md` 외 6개, `src/templates/genome/cheatsheet.md`
- Create: `src/templates/commands/reap.conception.md` 외 6개

- [ ] **Step 1: 기존 템플릿 삭제**

```bash
rm src/templates/commands/conception.md src/templates/commands/formation.md \
   src/templates/commands/planning.md src/templates/commands/growth.md \
   src/templates/commands/validation.md src/templates/commands/adaptation.md \
   src/templates/commands/birth.md src/templates/genome/cheatsheet.md
```

- [ ] **Step 2: reap.conception.md 작성**

`src/templates/commands/reap.conception.md`:

```markdown
---
description: "REAP Conception — 이번 Generation의 목표를 설정합니다"
---

# Conception (목표 설정)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `conception`인지 확인하라
- 미충족 시: "현재 stage가 conception이 아닙니다. `reap evolve`로 새 Generation을 시작하거나 `reap status`로 현재 상태를 확인하세요." 출력 후 중단

## Steps
1. `.reap/environment/` 디렉토리의 모든 파일을 읽어라 (외부 환경 변화 파악)
2. `.reap/lineage/`에서 가장 최근 세대의 `06-adaptation-retrospective.md`가 있으면 읽어라 (이전 세대 교훈 참조)
3. `.reap/life/backlog/`의 모든 파일을 읽어라 (예정된 목표 확인)
4. `.reap/genome/`의 principles.md, conventions.md, constraints.md를 읽어라 (현재 genome 상태 파악)
5. 위 정보를 바탕으로 인간과 대화하여 이번 세대의 goal을 구체화하라
6. 좋은 goal의 기준: 하나의 Generation에서 달성 가능한 크기, 검증 가능한 완료 조건, 관련 genome 영역이 명확

## 산출물 생성
- `.reap/templates/01-conception-goal.md`를 읽어라
- 위 Steps에서 확정된 내용을 반영하여 채워라
- `.reap/life/01-conception-goal.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Formation 단계로 진행하라고 안내하라
```

- [ ] **Step 3: reap.formation.md 작성**

`src/templates/commands/reap.formation.md`:

```markdown
---
description: "REAP Formation — 목표 달성에 필요한 명세를 정의합니다"
---

# Formation (명세 정의)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `formation`인지 확인하라
- `.reap/life/01-conception-goal.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/01-conception-goal.md`에서 goal과 범위를 읽어라
2. `.reap/genome/`에서 goal과 관련된 명세를 읽어라:
   - `principles.md` — 관련 아키텍처 원칙
   - `domain/` — 관련 비즈니스 규칙
   - `conventions.md` — 적용될 개발 규칙
   - `constraints.md` — 기술 제약
3. goal 달성에 필요한 명세가 부족하면 보완 계획을 수립하라
4. genome 수정이 필요한 부분을 발견하면 `.reap/life/mutations/`에 YAML 파일로 기록하라
5. 인간과 함께 spec을 확정하라

## 산출물 생성
- `.reap/templates/02-formation-spec.md`를 읽어라
- 위 Steps의 결과를 반영하여 채워라
- `.reap/life/02-formation-spec.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Planning 단계로 진행하라고 안내하라
```

- [ ] **Step 4: reap.planning.md 작성**

`src/templates/commands/reap.planning.md`:

```markdown
---
description: "REAP Planning — 구현 계획을 수립합니다"
---

# Planning (계획 수립)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `planning`인지 확인하라
- `.reap/life/02-formation-spec.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/02-formation-spec.md`에서 요구사항을 읽어라
2. `.reap/genome/constraints.md`에서 기술 제약을 확인하라
3. 구현 계획을 수립하라 (아키텍처 접근법, 기술 선택)
4. 태스크를 분해하라 (순서, 의존관계, 병렬 가능 여부)
   - 태스크는 `- [ ] T001 설명` 형식의 체크리스트로 작성
5. 인간과 함께 계획을 확정하라

## 산출물 생성
- `.reap/templates/03-planning-plan.md`를 읽어라
- 위 Steps의 결과를 반영하여 채워라
- `.reap/life/03-planning-plan.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Growth 단계로 진행하라고 안내하라
```

- [ ] **Step 5: reap.growth.md 작성**

`src/templates/commands/reap.growth.md`:

```markdown
---
description: "REAP Growth — AI+Human 협업으로 코드를 구현합니다"
---

# Growth (구현)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `growth`인지 확인하라
- `.reap/life/03-planning-plan.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/03-planning-plan.md`에서 태스크 목록을 읽어라
2. 이미 `04-growth-log.md`가 존재하면 읽어라 (Validation에서 복귀한 경우 — 기존 기록 유지)
3. 미완료(`[ ]`) 태스크부터 순서대로 구현하라
4. 명세와 다르게 구현해야 할 부분을 발견하면:
   a. `.reap/life/mutations/`에 YAML 파일로 기록하라
   b. 해당 mutation에 의존하는 태스크를 `03-planning-plan.md`에서 `[deferred]`로 마킹하라
   c. deferred 사유를 기록하라
5. 완료된 태스크는 `[x]`로 마킹하라

## 산출물 생성
- `.reap/templates/04-growth-log.md`를 읽어라 (또는 기존 log가 있으면 append)
- 완료 태스크, deferred 태스크(사유 포함), 발생한 mutation, 구현 메모를 기록하라
- `.reap/life/04-growth-log.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Validation 단계로 진행하라고 안내하라
- Validation에서 문제 발견 시 `reap evolve --back`으로 돌아올 수 있음을 안내하라
```

- [ ] **Step 6: reap.validation.md 작성**

`src/templates/commands/reap.validation.md`:

```markdown
---
description: "REAP Validation — 테스트와 검증으로 목표 달성을 확인합니다"
---

# Validation (검증)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `validation`인지 확인하라
- `.reap/life/04-growth-log.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/01-conception-goal.md`에서 완료 조건을 읽어라
2. `.reap/life/04-growth-log.md`에서 deferred 태스크 목록을 확인하라
3. deferred 태스크를 제외한 범위에서 완료 조건을 재평가하라
4. 테스트를 실행하라 (완료된 범위에 대해서만)
5. goal의 완료 조건을 하나씩 점검하라 (deferred로 인해 부분 달성도 허용)
6. 문제 발견 시: 개발자에게 `reap evolve --back`으로 Growth 복귀를 안내하라

## 산출물 생성
- `.reap/templates/05-validation-report.md`를 읽어라
- 테스트 결과, 완료 조건 체크, deferred 항목 목록을 기록하라
- 결과를 pass / partial / fail 로 판정하라
- `.reap/life/05-validation-report.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Adaptation 단계로 진행하라고 안내하라
```

- [ ] **Step 7: reap.adaptation.md 작성**

`src/templates/commands/reap.adaptation.md`:

```markdown
---
description: "REAP Adaptation — 회고하고 다음 세대를 위한 Genome diff를 작성합니다"
---

# Adaptation (회고)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `adaptation`인지 확인하라
- `.reap/life/05-validation-report.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/mutations/` 디렉토리의 모든 파일을 읽어라 (mutation 전체 리뷰)
2. `.reap/life/04-growth-log.md`에서 deferred 태스크 목록을 읽어라
3. 이번 세대에서 얻은 교훈을 정리하라
4. genome에 반영할 변경 사항을 adaptation으로 기록하라 (어떤 genome 파일을 어떻게 수정할지)
5. deferred 태스크를 다음 세대 목표로 `.reap/life/backlog/`에 마크다운 파일로 추가하라
6. 그 외 다음 세대 목표 후보도 backlog에 추가하라
7. 인간과 함께 회고를 확정하라

## 산출물 생성
- `.reap/templates/06-adaptation-retrospective.md`를 읽어라
- 교훈, genome 변경 제안, deferred 태스크 인계, 다음 세대 backlog을 기록하라
- `.reap/life/06-adaptation-retrospective.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Birth 단계로 진행하라고 안내하라
```

- [ ] **Step 8: reap.birth.md 작성**

`src/templates/commands/reap.birth.md`:

```markdown
---
description: "REAP Birth — Genome을 진화시키고 세대를 마무리합니다"
---

# Birth (출산)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `birth`인지 확인하라
- `.reap/life/06-adaptation-retrospective.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/mutations/` 디렉토리의 모든 mutation을 읽어라
2. 각 mutation의 `target`과 `suggestedChange`를 확인하라
3. `.reap/life/06-adaptation-retrospective.md`에서 genome 변경 제안을 읽어라
4. mutation과 adaptation을 `.reap/genome/`의 해당 파일에 반영하라:
   - `principles.md`, `domain/`, `conventions.md`, `constraints.md` 중 해당하는 파일 수정
5. 변경된 genome 내용을 인간에게 보여주고 확인을 받아라
6. 변경 내역을 changelog에 기록하라

## 산출물 생성
- `.reap/templates/07-birth-changelog.md`를 읽어라
- genome에 반영한 변경 목록 (mutation별, adaptation별)을 기록하라
- `.reap/life/07-birth-changelog.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Legacy 단계로 진행하라고 안내하라
- Legacy 진입 시 CLI가 자동으로 lineage 아카이빙을 수행함을 안내하라
```

- [ ] **Step 9: 커밋**

```bash
git rm src/templates/commands/conception.md src/templates/commands/formation.md \
  src/templates/commands/planning.md src/templates/commands/growth.md \
  src/templates/commands/validation.md src/templates/commands/adaptation.md \
  src/templates/commands/birth.md src/templates/genome/cheatsheet.md
git add src/templates/commands/reap.*.md
git commit -m "feat: replace slash commands with gate/steps/artifact structure"
```

---

## Chunk 3: Artifact 템플릿 + Genome 초기 파일

### Task 5: 7개 artifact 템플릿 작성

**Files:**
- Create: `src/templates/artifacts/01-conception-goal.md` 외 6개

- [ ] **Step 1: artifacts 디렉토리 생성 및 01-conception-goal.md**

```bash
mkdir -p src/templates/artifacts
```

`src/templates/artifacts/01-conception-goal.md`:

```markdown
# Generation Goal

## 목표
[이번 세대에서 달성할 목표를 구체적으로 기술]

## 완료 조건
- [ ] [검증 가능한 완료 조건 1]
- [ ] [검증 가능한 완료 조건 2]
- [ ] [검증 가능한 완료 조건 3]

## 범위
- **관련 Genome 영역**: [principles.md / domain/xxx.md / conventions.md / constraints.md]
- **예상 변경 범위**: [어떤 부분이 영향을 받는지]
- **제외 사항**: [이번 세대에서 하지 않을 것]

## 배경
[이 목표를 설정한 배경. backlog, 이전 세대 adaptation, 환경 변화 등 참조]
```

- [ ] **Step 2: 02-formation-spec.md**

`src/templates/artifacts/02-formation-spec.md`:

```markdown
# Formation Spec

## 요구사항

### 기능 요구사항
- **FR-001**: [구체적 기능 요구사항]
- **FR-002**: [구체적 기능 요구사항]

### 비기능 요구사항
- [성능, 보안, 접근성 등]

## Genome 참조
[이 spec을 만들기 위해 참조한 genome 내용 요약]

## 수용 기준
- [ ] [수용 기준 1]
- [ ] [수용 기준 2]

## Mutations (발견된 genome 수정 필요 사항)
[Formation 중 발견한 genome 수정 필요 사항. 없으면 "없음"]
```

- [ ] **Step 3: 03-planning-plan.md**

`src/templates/artifacts/03-planning-plan.md`:

```markdown
# Implementation Plan

## Summary
[구현 접근법 요약. 아키텍처 결정, 기술 선택]

## Technical Context
- **Tech Stack**: [사용 기술]
- **Constraints**: [genome/constraints.md에서 참조한 제약]

## Tasks

### Phase 1: [Phase 이름]
- [ ] T001 [태스크 설명]
- [ ] T002 [태스크 설명]

### Phase 2: [Phase 이름]
- [ ] T003 [태스크 설명]
- [ ] T004 [태스크 설명]

## Dependencies
[태스크 간 의존관계, 병렬 실행 가능 여부]
```

- [ ] **Step 4: 04-growth-log.md**

`src/templates/artifacts/04-growth-log.md`:

```markdown
# Growth Log

## 완료된 태스크
| Task | 설명 | 완료일 |
|------|------|--------|
| | | |

## Deferred 태스크
| Task | 설명 | 사유 | 관련 Mutation |
|------|------|------|---------------|
| | | | |

## 발생한 Mutations
| Mutation ID | Target | 설명 |
|-------------|--------|------|
| | | |

## 구현 메모
[구현 중 특이 사항, 결정 사항, 참고 내용]
```

- [ ] **Step 5: 05-validation-report.md**

`src/templates/artifacts/05-validation-report.md`:

```markdown
# Validation Report

## 결과: [pass / partial / fail]

## 완료 조건 점검
| 조건 | 결과 | 비고 |
|------|------|------|
| [01-conception-goal.md의 완료 조건] | pass/fail/deferred | |

## 테스트 결과
[테스트 실행 결과 요약]

## Deferred 항목
[04-growth-log.md에서 deferred된 태스크 목록과 Validation 범위 제외 사유]

## 발견된 문제
[Validation 중 발견된 문제. Growth로 복귀가 필요한 경우 명시]
```

- [ ] **Step 6: 06-adaptation-retrospective.md**

`src/templates/artifacts/06-adaptation-retrospective.md`:

```markdown
# Adaptation Retrospective

## 교훈
### 잘된 점
- [이번 세대에서 잘 된 점]

### 개선할 점
- [다음 세대에서 개선할 점]

## Genome 변경 제안
| 대상 파일 | 변경 내용 | 사유 |
|-----------|-----------|------|
| [genome/xxx.md] | [어떻게 변경할지] | [왜 변경해야 하는지] |

## Deferred 태스크 인계
| Task | 설명 | 원래 Mutation | Backlog 파일 |
|------|------|---------------|-------------|
| | | | |

## 다음 세대 Backlog
[`.reap/life/backlog/`에 추가한 목표 후보 목록]
```

- [ ] **Step 7: 07-birth-changelog.md**

`src/templates/artifacts/07-birth-changelog.md`:

```markdown
# Birth Changelog

## Genome 변경 내역

### Mutations 반영
| Mutation ID | Target | 변경 내용 | 반영 여부 |
|-------------|--------|-----------|-----------|
| | | | |

### Adaptations 반영
| 대상 파일 | 변경 내용 | 반영 여부 |
|-----------|-----------|-----------|
| | | |

## Genome Version
- Before: v[N]
- After: v[N+1]

## 변경된 Genome 파일
- [수정된 파일 목록]
```

- [ ] **Step 8: 커밋**

```bash
git add src/templates/artifacts/
git commit -m "feat: add 7 artifact templates for lifecycle stages"
```

### Task 6: Genome 초기 파일 템플릿

**Files:**
- Delete: `src/templates/genome/cheatsheet.md` (이미 Task 4에서 삭제)
- Create: `src/templates/genome/principles.md`, `src/templates/genome/conventions.md`, `src/templates/genome/constraints.md`

- [ ] **Step 1: 3개 genome 템플릿 작성**

`src/templates/genome/principles.md`:

```markdown
# Architecture Principles

이 프로젝트의 아키텍처 원칙과 결정을 기록합니다.
세대를 거치며 Birth 단계에서만 수정됩니다.

## Principles

- (여기에 아키텍처 원칙 추가)

## Decisions

| ID | 결정 | 사유 | 날짜 |
|----|------|------|------|
| | | | |
```

`src/templates/genome/conventions.md`:

```markdown
# Development Conventions

이 프로젝트의 개발 규칙과 컨벤션을 기록합니다.
AI Agent가 작업 시 수시로 참조합니다.

## Code Style

- (여기에 코드 스타일 규칙 추가)

## Naming Conventions

- (여기에 네이밍 규칙 추가)

## Git Conventions

- (여기에 커밋/브랜치 규칙 추가)
```

`src/templates/genome/constraints.md`:

```markdown
# Technical Constraints

이 프로젝트의 기술 제약과 선택을 기록합니다.

## Tech Stack

- **Language**: (언어 및 버전)
- **Framework**: (프레임워크)
- **Database**: (데이터베이스)
- **Runtime**: (런타임 환경)

## Constraints

- (여기에 기술 제약 추가)

## External Dependencies

- (외부 서비스, API 등)
```

- [ ] **Step 2: 커밋**

```bash
git add src/templates/genome/
git commit -m "feat: add initial genome template files (principles, conventions, constraints)"
```

---

## Chunk 4: Init 명령 수정

### Task 7: initProject 함수 재작성

**Files:**
- Modify: `src/cli/commands/init.ts`
- Test: `tests/commands/init.test.ts`

- [ ] **Step 1: init.test.ts 업데이트**

기존 테스트를 새 구조에 맞게 수정:

```typescript
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
    const entries = await readdir(join(tempDir, ".reap"));
    expect(entries).toContain("config.yml");
    expect(entries).toContain("genome");
    expect(entries).toContain("environment");
    expect(entries).toContain("life");
    expect(entries).toContain("lineage");
    expect(entries).toContain("commands");
    expect(entries).toContain("templates");
  });

  test("creates genome with new structure", async () => {
    await initProject(tempDir, "test-project", "greenfield");
    const genomeEntries = await readdir(join(tempDir, ".reap", "genome"));
    expect(genomeEntries).toContain("principles.md");
    expect(genomeEntries).toContain("conventions.md");
    expect(genomeEntries).toContain("constraints.md");
    expect(genomeEntries).toContain("domain");
  });

  test("creates commands/ with reap.{stage}.md files", async () => {
    await initProject(tempDir, "test-project", "greenfield");
    const cmdEntries = await readdir(join(tempDir, ".reap", "commands"));
    expect(cmdEntries).toContain("reap.conception.md");
    expect(cmdEntries).toContain("reap.formation.md");
    expect(cmdEntries).toContain("reap.planning.md");
    expect(cmdEntries).toContain("reap.growth.md");
    expect(cmdEntries).toContain("reap.validation.md");
    expect(cmdEntries).toContain("reap.adaptation.md");
    expect(cmdEntries).toContain("reap.birth.md");
  });

  test("creates templates/ with artifact templates", async () => {
    await initProject(tempDir, "test-project", "greenfield");
    const tplEntries = await readdir(join(tempDir, ".reap", "templates"));
    expect(tplEntries).toContain("01-conception-goal.md");
    expect(tplEntries).toContain("02-formation-spec.md");
    expect(tplEntries).toContain("03-planning-plan.md");
    expect(tplEntries).toContain("04-growth-log.md");
    expect(tplEntries).toContain("05-validation-report.md");
    expect(tplEntries).toContain("06-adaptation-retrospective.md");
    expect(tplEntries).toContain("07-birth-changelog.md");
  });

  test("copies commands to .claude/commands/ with reap.{stage}.md naming", async () => {
    await initProject(tempDir, "test-project", "greenfield");
    const claudeEntries = await readdir(join(tempDir, ".claude", "commands"));
    expect(claudeEntries).toContain("reap.conception.md");
    expect(claudeEntries).toContain("reap.birth.md");
    expect(claudeEntries).toHaveLength(7);
  });

  test("creates life subdirectories", async () => {
    await initProject(tempDir, "test-project", "greenfield");
    const lifeEntries = await readdir(join(tempDir, ".reap", "life"));
    expect(lifeEntries).toContain("backlog");
    expect(lifeEntries).toContain("mutations");
  });

  test("creates config.yml with project info", async () => {
    await initProject(tempDir, "test-project", "greenfield");
    const config = await Bun.file(join(tempDir, ".reap", "config.yml")).text();
    expect(config).toContain("project: test-project");
    expect(config).toContain("entryMode: greenfield");
  });

  test("fails if .reap/ already exists", async () => {
    await initProject(tempDir, "test-project", "greenfield");
    await expect(initProject(tempDir, "test-project", "greenfield")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `~/.bun/bin/bun test tests/commands/init.test.ts`
Expected: FAIL

- [ ] **Step 3: init.ts 재작성**

```typescript
import { mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";
import type { ReapConfig } from "../../types";

const COMMAND_NAMES = [
  "reap.conception", "reap.formation", "reap.planning", "reap.growth",
  "reap.validation", "reap.adaptation", "reap.birth",
];

const ARTIFACT_NAMES = [
  "01-conception-goal", "02-formation-spec", "03-planning-plan",
  "04-growth-log", "05-validation-report", "06-adaptation-retrospective",
  "07-birth-changelog",
];

export async function initProject(
  projectRoot: string,
  projectName: string,
  entryMode: "greenfield" | "migration" | "adoption",
): Promise<void> {
  const paths = new ReapPaths(projectRoot);

  if (await paths.isReapProject()) {
    throw new Error(".reap/ already exists. This is already a REAP project.");
  }

  // Create 4-axis structure
  await mkdir(paths.genome, { recursive: true });
  await mkdir(paths.domain, { recursive: true });
  await mkdir(paths.environment, { recursive: true });
  await mkdir(paths.life, { recursive: true });
  await mkdir(paths.mutations, { recursive: true });
  await mkdir(paths.backlog, { recursive: true });
  await mkdir(paths.lineage, { recursive: true });
  await mkdir(paths.commands, { recursive: true });
  await mkdir(paths.templates, { recursive: true });

  // Write config
  const config: ReapConfig = { version: "0.1.0", project: projectName, entryMode };
  await ConfigManager.write(paths, config);

  // Copy genome templates
  const genomeTemplates = ["principles.md", "conventions.md", "constraints.md"];
  for (const file of genomeTemplates) {
    const src = join(import.meta.dir, "../../templates/genome", file);
    const dest = join(paths.genome, file);
    await Bun.write(dest, await Bun.file(src).text());
  }

  // Copy slash commands to .reap/commands/
  for (const cmd of COMMAND_NAMES) {
    const src = join(import.meta.dir, "../../templates/commands", `${cmd}.md`);
    const dest = join(paths.commands, `${cmd}.md`);
    await Bun.write(dest, await Bun.file(src).text());
  }

  // Copy artifact templates to .reap/templates/
  for (const art of ARTIFACT_NAMES) {
    const src = join(import.meta.dir, "../../templates/artifacts", `${art}.md`);
    const dest = join(paths.templates, `${art}.md`);
    await Bun.write(dest, await Bun.file(src).text());
  }

  // Copy commands to .claude/commands/ (Claude Code integration)
  const claudeDir = paths.claudeCommands;
  await mkdir(claudeDir, { recursive: true });
  for (const cmd of COMMAND_NAMES) {
    const src = join(paths.commands, `${cmd}.md`);
    const dest = join(claudeDir, `${cmd}.md`);
    await Bun.write(dest, await Bun.file(src).text());
  }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `~/.bun/bin/bun test tests/commands/init.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/cli/commands/init.ts tests/commands/init.test.ts
git commit -m "feat: rewrite init for new commands/templates/genome structure"
```

---

## Chunk 5: Legacy 자동화 + Fix 업데이트

### Task 8: Legacy 자동화 (generation.ts complete 재작성)

**Files:**
- Modify: `src/core/generation.ts`
- Test: `tests/core/generation.test.ts`

- [ ] **Step 1: generation.test.ts에 Legacy 테스트 추가**

```typescript
test("complete() moves life artifacts to lineage", async () => {
  const mgr = new GenerationManager(paths);
  await mgr.create("Test goal", 1);

  // Advance to legacy
  for (let i = 0; i < 7; i++) await mgr.advance();

  // Create fake artifacts in life/
  await Bun.write(paths.artifact("01-conception-goal.md"), "# Goal");
  await Bun.write(paths.artifact("07-birth-changelog.md"), "# Changelog");

  await mgr.complete();

  // Check lineage directory
  const genDirs = await readdir(paths.lineage);
  expect(genDirs.length).toBe(1);
  const genDir = genDirs[0];
  expect(genDir).toMatch(/^gen-001/);

  const archiveEntries = await readdir(join(paths.lineage, genDir));
  expect(archiveEntries).toContain("01-conception-goal.md");
  expect(archiveEntries).toContain("07-birth-changelog.md");
  expect(archiveEntries).toContain("08-legacy-summary.md");

  // Current should be cleared
  const current = await mgr.current();
  expect(current).toBeNull();
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `~/.bun/bin/bun test tests/core/generation.test.ts`
Expected: FAIL

- [ ] **Step 3: generation.ts의 complete() 재작성**

```typescript
import { readdir, mkdir, rename, rm } from "fs/promises";
import { join } from "path";

// complete() 메서드 교체:
async complete(): Promise<void> {
  const state = await this.current();
  if (!state) throw new Error("No active generation");
  if (state.stage !== "legacy") throw new Error("Generation must be in legacy stage to complete");

  // Generate lineage directory name: gen-001-short-goal
  const goalSlug = state.goal
    .toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "")
    .slice(0, 30);
  const genDirName = `${state.id}-${goalSlug}`;
  const genDir = this.paths.generationDir(genDirName);
  await mkdir(genDir, { recursive: true });

  // Move artifacts from life/ to lineage/
  const ARTIFACT_PATTERNS = /^\d{2}-[a-z]+-[a-z]+\.md$/;
  const lifeEntries = await readdir(this.paths.life);
  for (const entry of lifeEntries) {
    if (ARTIFACT_PATTERNS.test(entry)) {
      await rename(
        join(this.paths.life, entry),
        join(genDir, entry),
      );
    }
  }

  // Move mutations/ to lineage
  const mutDir = join(genDir, "mutations");
  await mkdir(mutDir, { recursive: true });
  try {
    const mutEntries = await readdir(this.paths.mutations);
    for (const entry of mutEntries) {
      await rename(
        join(this.paths.mutations, entry),
        join(mutDir, entry),
      );
    }
  } catch { /* no mutations */ }

  // Count mutations
  let mutCount = 0;
  try {
    mutCount = (await readdir(mutDir)).length;
  } catch { /* empty */ }

  // List archived files
  const archivedFiles = await readdir(genDir);

  // Generate 08-legacy-summary.md
  const summary = `# Generation ${state.id} Summary
- Goal: ${state.goal}
- Started: ${state.startedAt}
- Completed: ${state.completedAt}
- Genome Version: ${state.genomeVersion} → ${state.genomeVersion + 1}
- Mutations: ${mutCount}건
- Files: ${archivedFiles.join(", ")}
`;
  await Bun.write(join(genDir, "08-legacy-summary.md"), summary);

  // Clear current
  await Bun.write(this.paths.currentYml, "");
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `~/.bun/bin/bun test tests/core/generation.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/core/generation.ts tests/core/generation.test.ts
git commit -m "feat: implement Legacy automation - move life/ artifacts to lineage/"
```

### Task 9: Fix 명령 업데이트

**Files:**
- Modify: `src/cli/commands/fix.ts`
- Test: `tests/commands/fix.test.ts`

- [ ] **Step 1: fix.test.ts 업데이트**

새 디렉토리 구조에 맞게 테스트 수정. `genome` 디렉토리 재생성 테스트는 유지, `commands/`, `templates/` 체크 추가:

```typescript
test("recreates missing commands/ directory", async () => {
  await rm(join(tempDir, ".reap", "commands"), { recursive: true });
  const result = await fixProject(tempDir);
  expect(result.fixed.some(f => f.includes("commands"))).toBe(true);
});

test("recreates missing templates/ directory", async () => {
  await rm(join(tempDir, ".reap", "templates"), { recursive: true });
  const result = await fixProject(tempDir);
  expect(result.fixed.some(f => f.includes("templates"))).toBe(true);
});
```

- [ ] **Step 2: fix.ts 업데이트**

requiredDirs 배열에 `commands`, `templates`, `domain` 추가:

```typescript
const requiredDirs = [
  { path: paths.genome, name: "genome" },
  { path: paths.domain, name: "genome/domain" },
  { path: paths.environment, name: "environment" },
  { path: paths.life, name: "life" },
  { path: paths.lineage, name: "lineage" },
  { path: paths.mutations, name: "life/mutations" },
  { path: paths.backlog, name: "life/backlog" },
  { path: paths.commands, name: "commands" },
  { path: paths.templates, name: "templates" },
];
```

- [ ] **Step 3: 테스트 실행 — 통과 확인**

Run: `~/.bun/bin/bun test tests/commands/fix.test.ts`
Expected: PASS

- [ ] **Step 4: 커밋**

```bash
git add src/cli/commands/fix.ts tests/commands/fix.test.ts
git commit -m "feat: update fix command for new directory structure"
```

### Task 10: AdaptationManager 정리

**Files:**
- Modify: `src/core/adaptation.ts`

현재 AdaptationManager는 lineage에 직접 기록하는데, 새 설계에서 adaptation은 `06-adaptation-retrospective.md` 산출물로 대체된다. AI Agent가 slash command를 통해 직접 파일을 생성하므로, AdaptationManager의 역할이 줄어든다.

- [ ] **Step 1: AdaptationManager는 현재 그대로 유지**

추후 필요 시 리팩토링. 현재는 하위 호환성 유지. 이 태스크는 no-op.

---

## Chunk 6: 통합 테스트 + 불필요 파일 정리

### Task 11: 통합 테스트 업데이트

**Files:**
- Modify: `tests/integration/full-lifecycle.test.ts`

- [ ] **Step 1: 통합 테스트에 Legacy 자동화 검증 추가**

```typescript
test("complete lifecycle with legacy automation", async () => {
  await initProject(tempDir, "test-app", "greenfield");
  await evolve(tempDir, "Build user auth");

  // Advance through all stages
  for (let i = 0; i < 7; i++) {
    await advanceStage(tempDir);
  }
  // Now at legacy

  // Create artifacts that would normally be created by AI
  const paths = new ReapPaths(tempDir);
  await Bun.write(paths.artifact("01-conception-goal.md"), "# Goal\nBuild user auth");
  await Bun.write(paths.artifact("07-birth-changelog.md"), "# Changelog");

  // Complete the generation (legacy automation)
  const { GenerationManager } = await import("../../src/core/generation");
  const mgr = new GenerationManager(paths);
  await mgr.complete();

  // Verify lineage
  const { readdir } = await import("fs/promises");
  const lineageEntries = await readdir(paths.lineage);
  expect(lineageEntries.length).toBe(1);
  expect(lineageEntries[0]).toMatch(/^gen-001/);

  // Verify summary exists
  const archiveDir = join(paths.lineage, lineageEntries[0]);
  const archiveEntries = await readdir(archiveDir);
  expect(archiveEntries).toContain("08-legacy-summary.md");

  // Verify current is cleared
  const current = await mgr.current();
  expect(current).toBeNull();
});
```

- [ ] **Step 2: 테스트 실행**

Run: `~/.bun/bin/bun test tests/integration/full-lifecycle.test.ts`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add tests/integration/full-lifecycle.test.ts
git commit -m "test: update integration test for legacy automation and new structure"
```

### Task 12: 불필요 파일 정리 + 전체 테스트

- [ ] **Step 1: src/templates/config.yml 삭제 (init에서 직접 생성하므로)**

```bash
rm -f src/templates/config.yml
```

- [ ] **Step 2: 빈 genome 디렉토리 정리**

```bash
rmdir src/templates/genome 2>/dev/null || true
```

(genome 템플릿은 Task 6에서 새로 작성했으므로, 기존 cheatsheet.md만 삭제되면 됨. principles.md 등이 이미 있으면 디렉토리 유지)

- [ ] **Step 3: 전체 테스트 실행**

Run: `~/.bun/bin/bun test`
Expected: ALL PASS

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: cleanup obsolete template files"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-03-16-lifecycle-script-system.md`. Ready to execute?
