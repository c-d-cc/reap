# Learning — gen-015-a006e7

## Goal
Test Phase 4: gen-002~011 신규 기능 e2e tests

## Source Backlog
`test-phase-4-gen-002011-신규-기능-e2e-tests.md` (consumed by gen-015-a006e7)

gen-002~011에서 추가된 기능에 e2e 테스트가 없음. 대상 7개 기능:
1. CLAUDE.md 생성/append (gen-002)
2. evolution.md template 로딩 (gen-002)
3. reap make backlog (gen-006)
4. --backlog consume (gen-005)
5. createdAt/consumedAt (gen-008)
6. archive consumed-only (gen-004)
7. CLI command 패턴 (gen-007)

## Project Overview
- REAP CLI tool (TypeScript, Bun build, Node.js execution)
- 기존 e2e 테스트: `tests/e2e/test-init-basic.sh` 1개 존재
- runner: `tests/e2e/run.sh` — `npm run build` 후 `test-*.sh` 파일 순차 실행
- tests/는 private submodule — 내부 커밋만, push는 유저 승인 필요

## Key Findings

### 테스트 패턴 (test-init-basic.sh 기준)
- `set -uo pipefail`, `SCRIPT_DIR`/`PROJECT_ROOT`/`CLI` 변수 설정
- `PASS=0; FAIL=0` 카운터 + `check()`, `check_dir()`, `check_file()` 헬퍼
- `mktemp -d` + `trap "rm -rf $TMPDIR" EXIT` 클린업
- CLI 실행: `node "$CLI" <command>` — JSON stdout 파싱
- 종료: `[ "$FAIL" -eq 0 ] || exit 1`

### CLAUDE.md 생성 로직 (src/cli/commands/init/common.ts)
- `initCommon()` 함수에서 처리
- 기존 CLAUDE.md 없음 → `# {projectName}\n` + REAP section 생성
- 기존 CLAUDE.md 있음 + `.reap/genome/` 미포함 → 끝에 REAP section append
- 기존 CLAUDE.md 있음 + `.reap/genome/` 포함 → skip (중복 방지)
- REAP section 내용: `.reap/genome/application.md`, `evolution.md`, `invariants.md` 참조

### evolution.md 템플릿
- `src/templates/evolution.md`에서 로드
- "Clarity-driven" 텍스트 포함 확인됨

### make backlog (src/cli/commands/make.ts + src/core/backlog.ts)
- `createBacklog()`: frontmatter (type, status, priority, createdAt) + 제목 + 섹션 템플릿
- `toKebabCase(title)` → filename
- valid types: genome-change, environment-change, task

### --backlog consume (src/cli/commands/run/start.ts)
- `start --phase create --goal "..." --backlog <filename>`
- generation 생성 후 `consumeBacklog(path, genId)` 호출
- frontmatter에 `status: consumed`, `consumedBy`, `consumedAt` 추가
- `state.sourceBacklog = backlog` 설정 후 save

### archive (src/core/archive.ts)
- consumed backlog → lineage archive에 복사 + life/backlog에서 삭제
- pending backlog → life/backlog에 유지 (carry-over)

## Previous Generation Reference
- gen-014: unit test 43개 작성 (backlog 22, nonce 7, generation 7, archive 5, compression 5)
- 전체 55/55 pass, typecheck/build/e2e 모두 통과
- 이번 gen: e2e test로 CLI 통합 수준 검증 (unit에서 다루지 않는 end-to-end 흐름)

## Backlog Review
- `e2e-init-claude-md-scenarios.md` — 이번 gen T001에서 직접 구현 (중복 backlog)
- 나머지 4개 (claude-md-migration, npx-support, remove-presets, remove-restart)는 이번 gen과 무관

## Context for This Generation
- build artifact: `dist/cli/index.js` (single bundle)
- T001~T005 구현 후 T006에서 전체 실행 + submodule 커밋
- Clarity Level: **High** — 7개 테스트 대상이 명시되고, implementation guide에 T001~T006 상세 명세 존재
