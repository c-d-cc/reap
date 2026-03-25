# Learning — gen-016-3f239d

## Project Overview

REAP e2e/scenario 테스트를 bash에서 TypeScript(bun:test)로 전환하는 generation.
현재 tests/e2e/에 7개 bash 스크립트, tests/scenario/에 4개 bash 스크립트가 존재.
unit 테스트는 이미 bun:test 기반 .test.ts로 작성되어 있음.

## Key Findings

### 현재 테스트 구조
- **tests/unit/**: bun:test 기반 TypeScript (6 files) — 이미 전환 완료
- **tests/e2e/**: bash 스크립트 (7 files + run.sh)
  - test-init-basic.sh, test-init-claude-md.sh, test-make-backlog.sh
  - test-backlog-consume.sh, test-archive-backlog.sh, test-cli-commands.sh
  - test-legacy-init.sh (builds itself, uses bun directly)
- **tests/scenario/**: bash 스크립트 (4 files + run.sh)
  - test-init-start-status.sh, test-legacy-lifecycle.sh
  - test-legacy-merge.sh, test-legacy-multi-generation.sh

### bash 테스트 공통 패턴
1. `CLI="$PROJECT_ROOT/dist/cli/index.js"` — built CLI 사용 (e2e), 또는 `bun src/cli/index.ts` (legacy)
2. `TMPDIR=$(mktemp -d)` + `trap "rm -rf $TMPDIR" EXIT` — temp dir setup/cleanup
3. `check()` 함수: JSON output에서 `"status": "ok"` grep
4. `check_file()`, `check_dir()`, `check_contains()` — 파일/디렉토리/내용 검증
5. PASS/FAIL 카운터 + exit code

### e2e vs legacy 차이점
- **e2e (newer)**: `node dist/cli/index.js` 사용, 빌드된 결과물 테스트
- **legacy (scenario)**: `bun src/cli/index.ts` 직접 실행, 소스에서 직접 테스트
- legacy-merge.sh, legacy-multi-generation.sh는 git repo 생성 + full lifecycle 실행하는 복잡한 시나리오

### bun:test 기존 패턴 (unit tests 참고)
- `import { describe, test, expect, beforeEach, afterEach } from "bun:test"`
- `mkdtemp`, `rm` from `fs/promises` for temp dir management
- 직접적인 모듈 import로 함수 테스트

### TypeScript 전환 시 고려사항
1. **CLI 실행 방식**: `Bun.$` shell literal 또는 `Bun.spawn`으로 CLI 호출
2. **JSON 파싱**: CLI는 JSON stdout 출력 → `JSON.parse()` 가능
3. **git 필요 테스트**: archive-backlog, legacy-merge, legacy-multi-generation은 git repo 필요
4. **병렬 실행**: bun:test는 파일 단위 병렬 → 각 테스트가 독립 temp dir 사용하므로 충돌 없음
5. **빌드 의존성**: e2e 테스트는 `npm run build` 후 dist/ 사용. TypeScript 전환 후에도 동일

### setup helper 설계
- `cli(cwd, ...args)`: CLI 실행 + JSON 파싱
- `setupProject(name?)`: temp dir + reap init
- `setupGeneration(goal, opts?)`: init + start
- `setupFullLifecycle(goal)`: 전체 lifecycle 통과
- `cleanup(dir)`: temp dir 삭제

## Previous Generation Reference

gen-015: e2e 테스트 5개 작성 (71 assertions PASS). CLAUDE.md, make backlog, backlog consume, archive 분리, CLI commands 모두 검증됨. 교훈: work phase 진입(nonce 설정) 필수, CLI 에러 핸들링 일관성 개선 여지.

## Backlog Review

5개 pending backlog 중 이번 generation과 직접 관련된 것은 없음.
- `e2e-init-claude-md-scenarios.md`: gen-015에서 이미 구현됨 (중복 backlog)
- 나머지는 별도 기능/리팩토링 작업

## Context for This Generation

- **Clarity: High** — goal이 명확하고 (bash → TypeScript 전환), 대상 파일 목록과 전환 패턴이 구체적
- **Maturity**: growth 단계 (16세대째)
- **Risk**: legacy-merge.sh, legacy-multi-generation.sh는 복잡도 높음 → bash 유지 또는 단계적 전환 고려
- **Test runner 변경**: package.json scripts에서 `bash tests/e2e/run.sh` → `bun test tests/e2e/` 전환 필요
