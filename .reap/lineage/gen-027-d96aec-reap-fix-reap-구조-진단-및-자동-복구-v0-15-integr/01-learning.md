# REAP MANAGED — DO NOT EDIT MANUALLY

# Learning — gen-027-d96aec

## Goal
reap fix -- .reap/ 구조 진단 및 자동 복구 (v0.15 integrity.ts 포팅)

## Source Backlog
`reap-fix-reap-구조-진단-및-자동-복구-v015-integrityts-포팅.md` (task, high priority)
- v0.15의 integrity.ts (~500줄)를 v16 구조에 맞게 포팅하여 `reap fix` CLI 명령 구현

## Project Overview
- REAP v0.16.0, TypeScript, Bun build, Node.js 실행
- CLI는 자체 프레임워크 (`src/libs/cli.ts`), 모든 출력은 JSON (`ReapOutput`)
- 파일 기반 상태 관리 (`.reap/` 내 YAML/Markdown)
- Command 패턴: `src/cli/commands/` 아래 별도 파일의 `execute()` 함수

## Key Findings

### v15 integrity.ts 분석
v15에는 완전한 integrity 시스템이 이미 존재:
1. **checkIntegrity()** — 디렉토리 구조, config.yml, current.yml, lineage, genome, backlog, artifacts 검증
2. **checkUserLevelArtifacts()** — 사용자 레벨 레거시 파일 감지
3. **IntegrityResult** — `{ errors: string[], warnings: string[] }` 반환

### v15 fix.ts 분석
1. **checkProject()** — read-only 진단 (integrity + user-level 합산)
2. **fixProject()** — 누락 디렉토리 생성, genome 파일 복원, 손상된 current.yml 리셋

### v16 적응이 필요한 차이점
| 항목 | v15 | v16 |
|------|-----|-----|
| Genome 파일 | principles, conventions, constraints, source-map | application, evolution, invariants |
| Config 필수 필드 | project, entryMode | project, language, autoSubagent, strict, agentClient, autoUpdate |
| Generation type | normal, merge, recovery | embryo, normal, merge |
| vision/ | 없음 | 있음 (goals.md, docs/) |
| hooks/conditions/ | 있음 (paths에 포함) | 코드에서 참조하나 paths 인터페이스에 미포함 |
| source-map | genome/ 내 | environment/ 내 (sourceMap) |
| Paths 구현 | class ReapPaths | interface + createPaths() 함수 |

### v16 코드 패턴 관찰
- `createPaths()` 함수로 paths 객체 생성 (v15는 class)
- `emitOutput()` / `emitError()` 로 JSON 출력, `process.exit(0)` 항상
- command는 `execute()` 함수를 export
- `readTextFile()`, `fileExists()`, `ensureDir()` 유틸리티 (`src/core/fs.ts`)
- lifecycle.ts에 `LIFECYCLE_STAGES`, `MERGE_STAGES` 상수와 next/prev 함수

### Pending Backlog 확인
3개 항목 중 현재 goal과 직접 관련 없음. `reap clean`/`reap destroy`는 유사한 .reap/ 관리 명령이지만 별도 scope.

## Context for This Generation
- Clarity: **High** — goal이 구체적이고, v15 참조 코드가 명확한 가이드 역할
- Embryo generation이지만 코드베이스가 충분히 성숙
- v15 코드를 v16 구조에 맞게 적응하는 작업으로, 설계 불확실성 낮음

## Implementation Direction
1. `src/core/integrity.ts` — v16 구조에 맞는 checkIntegrity(), checkUserLevelArtifacts()
2. `src/cli/commands/fix.ts` — checkProject() (--check), fixProject() with execute()
3. `src/cli/index.ts` — `reap fix` 명령 등록
4. Unit tests + E2E tests
