# Technical Constraints

> **작성 원칙**: 이 파일은 ~100줄 이내의 **맵(map)**이어야 한다.
> 기술 선택의 "무엇"뿐 아니라 "왜"를 반드시 기록하라.
> Completion 단계에서만 수정된다.

## Tech Stack

- **Language**: TypeScript 5.x — 타입 안전성 + 에이전트 친화적 코드 생성
- **Runtime**: Node.js >=18 호환 (Bun은 개발/테스트용) — npm publish 시 Node.js에서도 동작
- **CLI Framework**: Commander.js — 성숙한 생태계, 서브커맨드 체인
- **Config Format**: YAML (yaml 라이브러리) — 사람+에이전트 모두 읽기/쓰기 용이
- **Package Manager**: npm (배포), bun (개발)
- **npm Package**: @c-d-cc/reap (scoped) — CLI 명령어는 `reap`

## Constraints

- 파일 I/O는 Node.js fs/promises 사용 (Bun API 직접 사용 금지) — `src/core/fs.ts` 유틸 경유
- 외부 서비스 의존 없음 — 로컬 파일시스템만 사용
- `.reap/` 디렉토리 구조는 init이 보장, 사용자가 수동 생성할 필요 없음
- 슬래시 커맨드, hook → AgentAdapter가 에이전트별 경로에 설치 (Claude Code: `~/.claude/`, OpenCode: `~/.config/opencode/`)
- **postinstall**: `npm install -g` 시 `scripts/postinstall.cjs`가 감지된 에이전트에 slash commands 자동 설치 (graceful failure)
- artifact 템플릿, domain 가이드 → `~/.reap/templates/` (user-level)
- genome 파일 → `.reap/genome/` (프로젝트 소유)

## CLI Subcommands

8개: init, status, fix, update, help, destroy, clean, run
- `reap run <command> [--phase <phase>]` — command script dispatcher. deterministic 로직 실행 + structured JSON output

## Slash Commands

### Normal (18개)
reap.objective, reap.planning, reap.implementation, reap.validation, reap.completion, reap.evolve, reap.evolve.recovery, reap.start, reap.next, reap.back, reap.abort, reap.status, reap.sync, reap.sync.genome, reap.sync.environment, reap.update, reap.report, reap.help

### Collaboration (11개)
reap.pull, reap.push, reap.merge, reap.merge.start, reap.merge.detect, reap.merge.mate, reap.merge.merge, reap.merge.sync, reap.merge.validation, reap.merge.completion, reap.merge.evolve

- `reap.pull` — fetch + full merge generation lifecycle (distributed /reap.evolve)
- `reap.push` — REAP 상태 검증 + git push
- `reap.merge` — full merge generation lifecycle 단축 실행
- `reap.merge.start` — merge generation 생성 (branch 지정)
- `reap.merge.detect` ~ `reap.merge.completion` — 각 merge stage 실행 (6단계)
- `reap.merge.evolve` — merge full lifecycle 자동 실행
- `reap.next`/`reap.back`은 type: merge에서도 동작 (stage 분기)

## Hooks

16개 event (stage-level):
- Normal (8): onLifeStarted, onLifeObjected, onLifePlanned, onLifeImplemented, onLifeValidated, onLifeCompleted, onLifeTransited, onLifeRegretted
- Merge (8): onMergeStarted, onMergeDetected, onMergeMated, onMergeMerged, onMergeSynced, onMergeValidated, onMergeCompleted, onMergeTransited
파일 기반: `.reap/hooks/{event}.{name}.{md|sh}`. frontmatter: condition, order
Conditions: `.reap/hooks/conditions/{name}.sh` (exit 0=true). 기본 3개 + 유저 커스텀

## Validation Commands

| 용도 | 명령어 | 설명 |
|------|--------|------|
| 테스트 | `bun test` | 전체 단위/통합 테스트 |
| 타입체크 | `bunx tsc --noEmit` | TypeScript 컴파일 검증 |
| 빌드 | `npm run build` | Node.js 호환 번들 + templates 복사 |
| E2E | `tests/e2e/migration-e2e.sh` | OpenShell sandbox에서 버전 호환성 테스트 (**필수**) |

**E2E 테스트 필수 요건**: OpenShell CLI (`openshell`)가 설치되어 있어야 함. 미설치 시 테스트 스크립트가 에러로 중단됨. 설치: `uv tool install -U openshell`

## Release Pipeline

- **CI**: GitHub Actions (`.github/workflows/release.yml`, `docs.yml`)
- **트리거**: `v*` tag push
- **Secret**: `NPM_TOKEN` (GitHub repo secret)
- **버전 주입**: `scripts/build.js` — `package.json` 버전을 `--define`으로 번들에 주입. 소스에 버전 하드코딩 금지

## Generation ID

- **형식**: `gen-{seq}-{hash}` (예: `gen-042-a3f8c2`)
- **seq**: 로컬 DAG 순회로 계산한 표시용 순번 (3자리 zero-pad)
- **hash**: content hash 6자리 hex — `sha256(parents, goal, genomeHash, machineId, startedAt)`
- **DAG**: 각 Generation이 `parents` 배열로 부모를 참조하는 그래프 구조
- **meta.yml**: lineage 디렉토리에 DAG 메타데이터 저장 (id, type, parents, genomeHash)
- **Migration**: `reap update` 시 `config.yml` version 기반 자동 migration (`src/core/migrations/`). registry 패턴으로 버전별 migration 등록

## Test Infrastructure

- **테스트 소스**: private git submodule (`c-d-cc/reap-test`) — `tests/` 디렉토리
- **이유**: 테스트 전략/커버리지 비공개 보호
- **clone 시**: `git clone --recurse-submodules` 또는 `git submodule update --init`
- **CI**: GitHub Actions에서 SSH deploy key로 private submodule fetch
- **npm publish**: tests 미포함 (`package.json` `files` 필드로 제외)

## External Dependencies

- 없음 (순수 로컬 CLI 도구)
