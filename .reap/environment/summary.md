# Environment

## Project

- Source: `~/cdws/reap/` (branch: v0.16.0)
- Package: `@c-d-cc/reap` v0.16.0
- Config language: korean

## Tech Stack

- Runtime: Bun (build), Node.js (execution)
- Build: `bun build` → single bundle (`dist/cli/index.js`, ~400KB)
- Dependencies: `yaml` v2 (유일한 production dependency)
- CLI Framework: 자체 구현 (`src/libs/cli.ts`) — commander/yargs 대신
- Crypto: Node.js native `crypto` (nonce, hash)
- VCS: Git (child_process 직접 호출)
- Type System: TypeScript 5.7, strict mode, ESM

## Source Structure

```
src/
├── types/index.ts              — 타입 정의 (GenerationState, ReapConfig, ReapOutput 등)
├── core/                       — 핵심 로직 (25 modules)
│   ├── lifecycle.ts            — stage 순서 정의 (next/prev) + transition graph (NORMAL_TRANSITIONS, MERGE_TRANSITIONS, getTransitions)
│   ├── generation.ts           — generation CRUD, ID 생성
│   ├── paths.ts                — .reap/ 경로 상수 (ReapPaths 인터페이스, memory/resources/docs 경로 포함)
│   ├── nonce.ts                — 암호학적 token (SHA256) — 순수 함수, generateToken/verifyToken
│   ├── artifact-check.ts        — artifact 미작성 감지 (core placeholder 기반)
│   ├── stage-transition.ts     — transition graph 기반 nonce 검증 (verifyTransition, setTransitionNonces, prepareStageEntry), artifact 검증, stage 전환
│   ├── maturity.ts             — bootstrap/growth/cruise 감지, 완성 기준 16항목
│   ├── lineage.ts              — 아카이브 DAG, genome diff (3-way), lineage 읽기
│   ├── compression.ts          — 2-level lineage 압축 (L1: 5gen, L2: 100files)
│   ├── genome-suggest.ts       — init 시 genome 초안 생성
│   ├── backlog.ts              — backlog scan, consume, revert, create
│   ├── archive.ts              — generation 아카이빙 (life → lineage)
│   ├── cruise.ts               — cruise mode 관리 ("N/M" 포맷, parse/advance/clear/set)
│   ├── git.ts                  — git 연동 (commit, diff, push, pull, fetch, branch analysis)
│   ├── hooks.ts                — lifecycle hook engine (조건부 실행, 순서 제어, 상세 결과)
│   ├── clarity.ts              — clarity level 자동 판단 (규칙 기반, high/medium/low + signals)
│   ├── prompt.ts               — subagent prompt 공통 모듈 (loadReapKnowledge, buildBasePrompt, buildStrictSection, memory 로딩, cruise loop 지시, clarity 주입, strict mode HARD-GATE)
│   ├── scanner.ts              — 프로젝트 스캔 (init용)
│   ├── fs.ts                   — 파일 유틸리티
│   ├── output.ts               — JSON 출력 (emitOutput, emitError)
│   ├── integrity.ts            — .reap/ 구조 진단 (checkIntegrity, checkUserLevelArtifacts, detectV15, cleanupLegacyProjectSkills)
│   ├── notice.ts               — release notice (fetchReleaseNotice: RELEASE_NOTICE.md에서 버전+언어별 노트 추출)
│   ├── report.ts               — auto issue report (autoReport: gh issue create wrapper, best-effort)
│   ├── template.ts             — artifact 템플릿 복사
│   └── vision.ts               — vision goals 파싱, gap 분석, 다음 goal 제안, 프로젝트 진단, vision 발전 제안 (adapt phase 지원). lineage 편향 분석 제거됨 (gen-030)
├── cli/
│   ├── index.ts                — CLI 진입점, 커맨드 라우팅 (init, status, config, run, make, cruise, install-skills, fix, destroy, clean, check-version, update, daemon)
│   └── commands/
│       ├── init/               — 프로젝트 초기화 (greenfield/adoption 자동 감지, --repair, --migrate 지원)
│       ├── migrate.ts          — v0.15→v0.16 마이그레이션 (multi-phase: confirm→execute→vision→complete)
│       ├── check-version.ts    — postinstall/SessionStart용: v0.15 legacy cleanup + autoUpdate 자동 업데이트 + autoUpdateMinVersion guard + release notice 표시 (semverGte, queryAutoUpdateMinVersion, queryLatestVersion, performAutoUpdate, handOffToNewBinary, checkAutoUpdateGuard)
│       ├── run/                — stage 실행 (21 handlers)
│       │   ├── start.ts        — generation 생성 (scan → create)
│       │   ├── learning.ts     — 탐구 (work → complete)
│       │   ├── planning.ts     — 계획 (work → complete)
│       │   ├── implementation.ts — 구현 (work → complete)
│       │   ├── validation.ts   — 검증 (work → complete)
│       │   ├── completion.ts   — 완료 (reflect → fitness → adapt → commit)
│       │   ├── evolve.ts       — 전체 lifecycle 자동 실행
│       │   ├── detect.ts       — merge: 분기점 감지
│       │   ├── mate.ts         — merge: genome 교차
│       │   ├── merge.ts        — merge: 소스 병합
│       │   ├── reconcile.ts    — merge: 정합성 검증
│       │   ├── next.ts         — 다음 stage 자동 진행
│       │   ├── back.ts         — 이전 stage 회귀
│       │   ├── abort.ts        — generation 중단 (2-phase: confirm → execute)
│       │   ├── push.ts         — git push (상태 검증 포함)
│       │   ├── pull.ts         — git fetch + branch 분석 + prompt 반환
│       │   ├── knowledge.ts    — genome/environment/vision/memory 관리 (reload/genome/environment/memory)
│       │   └── report.ts       — 수동 issue report (AI prompt 기반, privacy gate 포함)
│       ├── config.ts            — 프로젝트 설정 조회 (config.yml → JSON 출력)
│       ├── status.ts           — 현재 상태 조회
│       ├── fix.ts              — .reap/ 구조 진단 및 복구 (--check 옵션)
│       ├── destroy.ts          — REAP 완전 제거 (--confirm 필수, .reap/ + CLAUDE.md + .gitignore)
│       ├── clean.ts            — 선택적 상태 초기화 (--lineage, --life, --backlog, --hooks)
│       ├── update.ts           — 프로젝트 업데이트 (v0.15→migrate 위임, v0.16→config backfill/디렉토리 보충/CLAUDE.md 보수, --post-upgrade 지원)
│       └── daemon/             — daemon 서브커맨드
│           ├── index.ts        — daemon 커맨드 라우팅 (start, stop, status, query)
│           ├── client.ts       — daemon HTTP 클라이언트 (auto-spawn)
│           └── lifecycle.ts    — generation 시작/완료 시 자동 인덱싱 훅
├── libs/cli.ts                 — 자체 CLI 프레임워크 (~858 lines)
├── adapters/claude-code/       — Claude Code 어댑터
│   ├── install.ts              — skill 파일 설치 (~/.claude/commands/)
│   └── skills/                 — 20 slash command files (.md, reap.update.md, reap.report.md 포함)
└── templates/                  — 템플릿 파일
    ├── reap-guide.md           — REAP 도구 가이드 (subagent prompt에 주입)
    ├── agents/                 — agent 정의 템플릿
    │   ├── reap-evolve.md      — evolve agent (generation lifecycle executor)
    │   └── reap-evaluate.md    — evaluator agent (독립 검증, fitness 평가, vision 관리)
    └── artifacts/              — stage별 artifact 템플릿
        ├── normal/             — 01~05 (learning~completion)
        └── merge/              — 01~06 (detect~completion)

daemon/                            — 별도 앱 (@c-d-cc/reap-daemon)
├── src/                           — daemon 소스 (9 모듈 + api/ + indexer/)
│   ├── index.ts                   — daemon 진입점
│   ├── server.ts                  — HTTP 서버 (localhost:17224)
│   ├── router.ts                  — HTTP 라우터
│   ├── registry.ts                — 프로젝트 레지스트리 (CRUD)
│   ├── process.ts                 — PID 파일, idle timer
│   ├── paths.ts                   — daemon 경로 상수
│   ├── types.ts                   — daemon 타입
│   ├── api/                       — API 핸들러 (health, projects, query)
│   └── indexer/                   — 인덱싱 파이프라인
│       ├── parser.ts              — Tree-sitter WASM 파서 (15개 언어)
│       ├── scanner.ts             — Git 기반 파일 스캔
│       ├── graph.ts               — 코드 그래프 (인메모리)
│       ├── storage.ts             — SQLite 영속화
│       ├── pipeline.ts            — 인덱싱 파이프라인 오케스트레이터
│       ├── import-resolver.ts     — import 해석
│       ├── call-resolver.ts       — call 해석
│       ├── impact.ts              — blast radius 분석
│       ├── community.ts           — 커뮤니티 탐지
│       └── process-tracer.ts      — 실행 플로우 추적
├── queries/                       — Tree-sitter SCM 쿼리 (15개 언어)
└── tests/                         — daemon 테스트 (21 파일, 114 tests)
```

## Build & Scripts

- `npm run build` — bun build → `dist/cli/index.js` (~400KB single bundle) + skill 복사
- `npm run dev` — bun으로 직접 실행 (빌드 불필요)
- `npm run typecheck` — tsc --noEmit
- `postinstall` — skill 자동 설치 + v0.15 감지 안내

## Tests

### tests/ submodule (reap-test repo, self-evolve branch)
- `tests/unit/` — bun:test 기반 unit tests (`bun test tests/unit/`)
- `tests/e2e/` — bun:test 기반 e2e tests (`bun test tests/e2e/`)
- `tests/scenario/` — bun:test 기반 scenario tests (`bun test tests/scenario/`)

### scripts/ (프로젝트 루트)
- `scripts/e2e-init.sh` — 초기화 테스트 (62 checks)
- `scripts/e2e-lifecycle.sh` — 단일 generation lifecycle (16 checks)
- `scripts/e2e-merge.sh` — merge workflow (25 checks)
- `scripts/e2e-multi-generation.sh` — 다세대 + compression (34 checks)

### npm scripts
- `npm run test:unit` — bun test tests/unit/
- `npm run test:e2e` — bash tests/e2e/run.sh
- `npm run test:scenario` — bash tests/scenario/run.sh
- `npm run test` — 전체 (unit + e2e + scenario)

## Types (주요 타입)
- `HookResult` — hook 실행 결과 (name, event, type, status, exitCode, stdout, stderr, content, skipReason)
- `ReapHookEvent` — 라이프사이클 hook 이벤트 union type (14개 이벤트)
- `ReapOutput.status` — `"ok" | "prompt" | "error" | "artifact-incomplete"`

## Key Design Decisions

- **Zero-dependency CLI**: 외부 CLI 라이브러리 없음 → supply chain 최소화
- **File-based state**: DB 없음, 모든 상태는 `.reap/` 내 YAML/Markdown
- **JSON stdout**: 모든 CLI 출력은 `ReapOutput` JSON → AI agent 파싱 용이
- **Transition graph + nonce**: 선언적 transition graph로 허용 전이 정의, pendingTransitions map으로 다중 nonce 동시 발행, stage 무결성 암호학적 보장
- **2-level compression**: lineage 무한 성장 방지 (L1: folder→md, L2: md→epoch)
- **Adapter pattern**: agent client 교체 가능 (현재 claude-code, 향후 opencode/codex)
- **`reap make` pattern**: template 기반 resource 생성 (`reap make backlog`). 향후 확장 가능
