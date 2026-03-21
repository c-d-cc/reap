# Objective

## Goal

Script Orchestrator Architecture — Script가 실행 흐름을 완전히 주도하고, slash command(.md)는 1줄 wrapper로 축소

## Background & Motivation

### 현재 문제

1. **AI 재구현 문제**: 27개 slash command가 전부 Markdown prompt로 구현되어 있어, AI가 매번 해석하고 `src/core/`에 이미 있는 로직을 "재구현"한다. 예를 들어 `reap.start`는 generation ID 생성 알고리즘(sha256 hash)을 node one-liner로 설명하고 있지만, `generation.ts`의 `generateGenHash()`가 동일 로직을 이미 구현하고 있다.

2. **Gate 우회 가능**: precondition check가 "Read current.yml → If ... → ERROR + STOP"이라는 자연어 지시에 의존한다. AI가 이를 무시하거나 잘못 해석할 수 있어 safety net이 없다.

3. **비결정적 실행**: 상태 전환(`current.yml` 업데이트), artifact 파일 생성, archiving(lineage 이동), backlog 관리, lineage compression 등 100% deterministic한 작업을 AI가 비결정적으로 수행한다. 비용 낭비 + 일관성 리스크.

4. **Core 코드 활용 부재**: `src/core/`에 lifecycle, generation, lineage, compression, merge 등 핵심 로직이 TypeScript로 구현되어 있지만, CLI subcommand(init/status/fix/update)에서만 사용되고 slash command에서는 전혀 호출되지 않는다.

5. **Markdown 해석 불확실성**: Markdown이 orchestrator 역할을 하면 AI가 step을 건너뛰거나 순서를 바꿀 수 있다. 실행 흐름의 주도권이 AI에게 있어 deterministic 보장이 불가능하다.

### 아키텍처 전환

기존 "Markdown Orchestrator + CLI Primitives" 접근에서 "Script Orchestrator + 1줄 Markdown Wrapper"로 전환한다.

```
Slash Command (.md) — 1줄 wrapper
  "Run `reap run <command>` and follow the stdout instructions exactly."
         │
         ▼
reap run <command> [--phase <phase>] — Script가 실행 흐름 주도
  ├─ deterministic 단계를 직접 실행 (gate, state 전환, artifact 생성 등)
  ├─ creative 작업이 필요한 지점에서 structured JSON을 stdout으로 출력
  │   → AI에게 "이 작업을 수행하라" 지시
  │   → context (backlog 내용, 현재 상태 등) 함께 제공
  │   → 다음 phase 호출 명령 포함
  └─ AI 작업 완료 후 `reap run <command> --phase <next>` 로 재진입
         │
         ▼
src/core/ — 기존 로직 재사용
```

핵심 차이점:
- **Markdown은 1줄 wrapper** — 로직 없음, AI가 "해석"할 여지 제거
- **실행 흐름의 주도권이 script** — AI가 step을 건너뛸 수 없음
- **Phase 기반 재진입** — creative 작업 후 `--phase`로 다음 deterministic 구간 실행
- **Structured JSON output** — script가 AI에게 creative 작업을 지시할 때 사용

### 선행 작업

- gen-085: slash command 전면 정리 (책임 분리 + hook 배치) 완료
- gen-086: E2E command template 구조 검증 (58개 테스트) 완료
- 아키텍처 결정 완료: Node.js CLI, daemon 없음, Go/Bun 기각

## Scope

### Phase 1: 인프라 + 핵심 command scripts

- `reap run <command> [--phase <phase>]` entry point 구현 — command dispatch, phase 기반 재진입, exit code 규약
- command별 script 구현: 각 command가 gate → state 전환 → artifact 생성 등을 core 라이브러리 직접 호출로 수행
- structured JSON output 포맷 정의 및 구현 (creative 작업 지시용)
- 1줄 wrapper slash command(.md) 생성: `reap.next`, `reap.back` 등
- 대상 command: `next`, `back`, `start`

### Phase 2: completion/archive/compress

- `completion` command script 구현 (retrospective → genome → archive 등 multi-phase)
- archive 로직 통합 — lineage 디렉토리 이동 + `meta.yml` 생성
- compress 로직 통합 — lineage 압축 (L1/L2)
- backlog 관리 로직 command script 내부에서 직접 호출

### Phase 3: hook/commit + 전체 전환

- hook 처리 로직 command script 내부에 통합 — 파일 탐색, condition 평가, 실행
- commit 로직 통합 — submodule check + git commit
- 전체 slash command를 1줄 wrapper로 전환

### Phase 4: merge 계열

- merge lifecycle command scripts
- normal 안정화 후 진행

### Out of Scope

- Go 재작성, Bun 우선 사용 등 런타임 변경
- Daemon/long-running process 도입
- 완전히 새로운 slash command 추가
- 기존 CLI subcommand(init/status/fix/update)의 리팩토링

## Completion Criteria

1. `reap run <command>` 실행 시 deterministic 단계(gate, state 전환, artifact 생성 등)가 script 내부에서 자동 실행된다
2. creative 작업 지점에서 structured JSON이 stdout으로 출력되어 AI에게 작업을 지시한다
3. `reap run <command> --phase <next>` 로 재진입 시 다음 deterministic 구간이 실행된다
4. 모든 slash command(.md)가 1줄 wrapper로 축소된다 — 로직, 조건문, 다단계 지시 없음
5. gate 실패 시 exit code 1 + 사유 JSON stdout 출력, AI가 step을 건너뛸 수 없음
6. `reap.next`, `reap.back`, `reap.start`, `reap.completion`이 Script Orchestrator 패턴으로 전환된다
7. archive, compress, backlog, hook, commit 로직이 command script 내부에서 core 라이브러리 직접 호출로 동작한다
8. 기존 테스트 전체 통과 유지 + command script에 대한 단위 테스트 추가
9. `bunx tsc --noEmit` 통과
10. `npm run build` 통과

## Functional Requirements

### FR-001: `reap run <command> [--phase <phase>]` 인터페이스

- Commander.js 기반 command dispatch
- `--phase` 옵션으로 특정 phase부터 실행 (재진입 지원)
- exit code 규약: 0=성공, 1=gate fail/비즈니스 에러, 2=시스템 에러
- stdout: structured JSON 출력 (AI에게 creative 작업 지시 or 최종 결과)
- stderr: 사람 판독용 에러/디버그 메시지

### FR-002: Structured JSON Output 스키마

- command script가 creative 작업이 필요한 지점에서 출력하는 JSON 포맷:
  ```json
  {
    "phase": "string — 현재 phase 이름",
    "completed": ["string — 이미 완료된 deterministic 단계들"],
    "context": { "— creative 작업에 필요한 데이터 (backlog 내용, 현재 상태 등)" },
    "prompt": "string — AI에게 수행할 작업 지시",
    "nextCommand": "reap run <command> --phase <next> — 작업 완료 후 실행할 명령"
  }
  ```
- `nextCommand`가 없으면 command 완료를 의미

### FR-003: Command Script 내부 로직

- 각 command script가 gate, state 전환, artifact 생성, archive, compress, backlog, hook, commit 등을 core 라이브러리(`src/core/`)를 직접 호출하여 수행
- 별도 subcommand(`reap run gate`, `reap run state` 등)가 아닌, command script 내부에서 core 모듈을 import하여 실행
- gate 검증: `LifeCycle`, `MergeLifeCycle`, `GenerationManager.current()` 활용
- state 전환: `GenerationManager.advance()`, `LifeCycle.next()` 활용
- ID 생성: `generateGenHash()`, `formatGenId()`, `nextSeq()`, `resolveParents()` 활용
- artifact 생성: `ReapPaths.artifact()`, `fs.ts` 활용
- archive: `GenerationManager.complete()` 활용
- compress: `compressLineageIfNeeded()` 활용

### FR-004: 1줄 Markdown Wrapper

- 모든 slash command(.md)를 1줄로 축소
- 형식: `Run "reap run <command>" and follow the stdout instructions exactly.`
- 로직, 조건문, 다단계 지시 일체 없음

## Non-Functional Requirements

- **NFR-001**: `reap run <command>` deterministic 구간은 100ms 이내 실행 (cold start 포함)
- **NFR-002**: JSON 출력은 machine-parseable하되 에러 시 사람이 읽을 수 있는 메시지도 stderr로 출력
- **NFR-003**: 기존 `src/core/` 모듈을 최대한 재사용하여 코드 중복 방지
- **NFR-004**: 새 command script는 기존 테스트에 영향 없이 추가 가능해야 함
- **NFR-005**: `npm run build` 결과물에 `reap run` 포함
- **NFR-006**: 각 command script는 단위 테스트 가능 — phase 단위로 입력/출력이 명확하여 mock 없이도 테스트 가능한 구조

## src/core/ 모듈 사용처 분석 및 재사용 매핑

### CLI에서 사용 중 (init/status/fix/update)

| 모듈 | CLI 사용처 | 설명 |
|------|-----------|------|
| `paths.ts` | init, status, fix, update | 모든 CLI 명령에서 경로 해석 |
| `config.ts` | init, status, update | config.yml 읽기/쓰기 |
| `lifecycle.ts` | index, fix | stage 유효성 검증 |
| `generation.ts` | status | 현재 generation 읽기 |
| `fs.ts` | init, fix, update | 파일 I/O 유틸 |
| `agents/` | init, update | 에이전트 감지, commands 설치 |
| `hooks.ts` | update | hook 등록/동기화 |
| `migrations/` | update | 버전 migration |

### Slash command에서 AI가 "재구현"하는 로직 vs Core에 이미 있는 코드

| Slash Command 동작 | Core 모듈 (이미 구현됨) | 재구현 여부 |
|---|---|---|
| current.yml 읽기/파싱 | `GenerationManager.current()` | 재구현 (AI가 YAML 직접 파싱) |
| stage 전환 + timeline 기록 | `GenerationManager.advance()`, `LifeCycle.next()` | 재구현 (AI가 직접 YAML 수정) |
| generation ID 생성 (seq+hash) | `generateGenHash()`, `formatGenId()`, `nextSeq()` | 재구현 (node one-liner로 설명) |
| lineage archiving | `GenerationManager.complete()` | 재구현 (AI가 파일 이동 직접 수행) |
| lineage compression (L1/L2) | `compressLineageIfNeeded()` | 재구현 (AI가 압축 규칙 수동 적용) |
| merge generation 생성 | `MergeGenerationManager.create()` | 재구현 |
| merge divergence detection | `detectDivergenceFromRefs()` | 재구현 |
| backlog status 관리 | 없음 (core에 미구현) | AI만 수행 |
| hook condition 평가 | 없음 (core에 미구현) | AI만 수행 |
| submodule commit check | 없음 (core에 미구현) | AI만 수행 |

### `reap run` primitive와의 매핑 — 재사용 vs 신규

| Primitive | 재사용 가능 Core 모듈 | 신규 구현 필요 |
|-----------|---------------------|---------------|
| gate | `LifeCycle`, `MergeLifeCycle`, `GenerationManager.current()` | gate 조건 로직 조합 |
| state read | `GenerationManager.current()` | JSON 변환 출력 |
| state advance | `GenerationManager.advance()`, `LifeCycle.next()` | 얇은 CLI wrapper |
| state regress | `LifeCycle.prev()`, `LifeCycle.canTransition()` | regress 로직 (현재 advance만 있음) |
| id | `generateGenHash()`, `formatGenId()`, `nextSeq()`, `resolveParents()` | 얇은 CLI wrapper |
| artifact | `ReapPaths.artifact()`, `fs.ts` | template 복사 로직 |
| backlog | `ReapPaths.backlog`, `fs.ts` | frontmatter 파싱/수정 CRUD 전체 |
| archive | `GenerationManager.complete()` | 기존 complete() 분리 (archive만 추출) |
| compress | `compressLineageIfNeeded()` | 얇은 CLI wrapper |
| hook | `ReapPaths.hooks` | condition 평가, 파일 탐색 로직 신규 |
| commit | `git.ts` 일부 | submodule check + commit 로직 신규 |

### Dead code 또는 low-usage 모듈

| 모듈 | 상태 | 판단 |
|------|------|------|
| `adaptation.ts` | CLI/slash 어디서도 호출 안됨 | 잠재적 dead code — `reap run`에서 활용 가능성 검토 후 판단 |
| `genome-sync.ts` | `reap init`에서만 사용 | 유지 (init 전용) |
| `migration.ts` (lineage migration) | `reap update` migration에서 간접 사용 | 유지 |
| `merge.ts` | slash command에서 AI가 재구현 | `reap run` primitive로 노출하여 직접 호출되도록 전환 |

## Open Questions

1. **Structured JSON Output 스키마 상세 정의**: `context` 필드에 포함할 데이터의 범위와 구조. command별로 다른 context가 필요하므로 공통 스키마 vs command별 스키마 결정 필요. Phase 1에서 결정.

2. **`.md` hook 처리 방식**: command script가 hook 파일 내용을 JSON context에 포함하여 AI에게 전달하는 방식(pull) vs AI가 `.reap/hooks/` 디렉토리를 직접 읽는 방식(push). Pull 방식이 condition 평가를 script에서 일괄 처리할 수 있어 유리. Phase 3에서 결정.

3. **evolve 모드에서 User 확인 스킵**: `reap.evolve`가 호출할 때 `reap.completion`의 "Human confirmation" 단계를 스킵하는 로직을 CLI flag(`--skip-confirm`)에 넣을지 structured JSON의 prompt에서 조건부로 처리할지. Phase 2에서 결정.
