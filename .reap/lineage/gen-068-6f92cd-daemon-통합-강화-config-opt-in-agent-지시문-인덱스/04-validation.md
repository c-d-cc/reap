# Validation Report

## Result

**partial** — 모든 신규 변경 (T001~T017) 의 typecheck/build/unit/e2e 회귀 0. 단, 본 generation 범위 밖의 pre-existing scenario fail 5건 (multi-generation lifecycle) 및 e2e fail 1건 (init-repair) 존재. 모두 본 generation 변경과 인과 무관.

## Checks

### TypeCheck (fresh)

| 대상 | 명령 | 결과 |
|---|---|---|
| 메인 (`@c-d-cc/reap`) | `npm run typecheck` | pass (0 errors) |
| daemon (`@c-d-cc/reap-daemon`) | `cd daemon && npm run typecheck` | 2 errors — pre-existing (`storage.ts` 의 `bun:sqlite` 타입 모듈 / globalThis index). gen-052 이후 존재, 본 generation 변경 외부. backlog 후보. |

### Build (fresh)

| 대상 | 명령 | 결과 |
|---|---|---|
| 메인 | `npm run build` | pass — `dist/cli/index.js` 0.57 MB / 150 modules / 8ms |

### Tests (fresh — 새로 실행)

| Suite | 결과 | 비고 |
|---|---|---|
| `bun test tests/unit/` | **427 pass / 0 fail** / 1167 expect / 6.57s | 회귀 0. 신규 daemon 통합은 호출 측 게이트 위주라 unit 단의 검증 surface 가 크지 않음. |
| `bun test tests/e2e/` | **218 pass / 1 fail** / 697 expect / 38.34s | 유일 fail: `init-repair > skips when REAP section already present` — gen-067 shortterm 의 deferred 후보 3번에 이미 기록된 pre-existing fail. 본 generation 변경 무관. |
| `bun test tests/scenario/` | **35 pass / 5 fail** / 61 expect / 4.62s | `multi-generation lifecycle` 5건 fail. 원인: `reap run start --goal "..."` 가 pending backlog 존재 시 `prompt` 를 반환 (Issue #18, gen-065 fix). scenario 테스트가 gen-065 변경 이후 업데이트되지 않음. 본 generation 변경 무관 (pre-existing). |

### Completion Criteria (02-planning.md 대조)

| # | 기준 | 결과 | 증거 |
|---|---|---|---|
| 1 | `ReapConfig.daemon?: boolean` 추가, 미설정 시 기존 사용자 회귀 0 | pass | T001 — `src/types/index.ts` JSDoc 명시. typecheck pass. e2e 218 pass (daemon: undefined 사용자 일반 흐름). |
| 2 | 4 lifecycle 진입점 (start / learning / implementation / completion) 에서 `config.daemon === true` 일 때 `triggerIndexing` 호출 | pass | T002~T005 — 4 파일 modify. `config?.daemon === true` 게이트 + dynamic import. |
| 3 | daemon 측에 `lastIndexedCommit` 필드 노출 (commit hash staleness check 기반) | pass | T011~T014 — `ProjectEntry.lastIndexedCommit?: string \| null` + `register` null 초기화 + pipeline 4 path 모두 `lastCommit` 반환 + index handler 가 registry 에 전달. |
| 4 | static knowledge (SessionStart hook 출력 + dump-state) 에 daemon 절 추가 | pass | T006 — `buildDaemonStaticSection()` 단일 export 양 builder 가 호출. byte-identical 보장 (sync/async test). |
| 5 | agent prompt (`buildBasePrompt`) 에 daemon 절 조건부 포함 | pass | T007 — `config?.daemon === true` 분기. |
| 6 | reap-guide template + 양 reap-guide.md sync + agent 템플릿 (evolve / evaluate) 갱신 | pass | T008~T010 + T015. template "Code Intelligence (Daemon)" 절 + agent 양쪽 daemon 지시 + cp sync 완료. |
| 7 | dog-fooding `.reap/config.yml: daemon: true` 활성화 | pass | T016. |
| 8 | typecheck / build / 기존 테스트 회귀 0 | pass | 위 fresh 결과 — 본 generation 변경분 회귀 0. pre-existing fail 만 잔존. |

## Self-dogfooding 확인

본 generation 의 `npx reap run validation` 호출 결과:
- `config.evaluator === true` → evaluator prompt 정상 emit (gen-067 패턴 회귀 0).
- `config.daemon === true` → 본 명령 종료 시 daemon dump 가 emitOutput sync path 에서 자동 시도. daemon process 미기동 환경에서도 silent skip (의도된 fallback).

## Performance Notes

- 메인 build: 150 modules / 8ms. 본 generation 의 4 lifecycle 호출 측 dynamic import 추가 + helper 1개 추가가 bundle size 에 의미있는 영향 없음 (0.57MB 유지).
- daemon 측 `lastCommit` 추가는 path 별 1줄 변경 — runtime overhead negligible.

## Edge Cases

- `config.daemon === undefined` (기존 사용자 시나리오): 4 호출 측 모두 `config?.daemon === true` 비교라 false. 기존 사용자 daemon 미트리거 보장. e2e 218 pass 로 회귀 0 입증.
- daemon process 미기동: `triggerIndexing` 내부 silent fail 그대로 존속 — 호출 측 게이트는 추가 안전망.
- daemon `register` 시 신규 entry: `lastIndexedCommit: null` 명시 초기화. 기존 registry.json 엔트리 (필드 없음): optional 이라 그대로 load. backward compat.
- pipeline 4 path (full / incremental / no-change / git 비활성): 모두 `lastCommit?: string | null` 반환. git 없는 환경 대응.

## Issues

### 본 generation 변경 관련: 없음

### Pre-existing (본 generation 범위 외)

| 항목 | 위치 | 영향 | 처리 |
|---|---|---|---|
| `daemon/src/indexer/storage.ts` 2 TS error | `bun:sqlite` import + globalThis index | daemon typecheck 노이즈. runtime (bun) 에선 동작. | gen-067 deferred 후보로 이월. 본 generation hint. |
| `tests/e2e/init-repair.test.ts` 1 fail | `skipped` 메시지 누락 | e2e 회귀 신호 부정확. | gen-067 shortterm 의 deferred 후보 3번 (`init-repair-skipped-message-fix`) 이월. |
| `tests/scenario/multi-generation.test.ts` 5 fail | `run start` 가 pending backlog 존재 시 `prompt` 반환 (gen-065 Issue #18 fix) | scenario test 가 gen-065 변경에 맞춰 업데이트되지 않음. | 본 generation hint — scenario 테스트 보강 (`--no-backlog` 명시 또는 sandbox 의 pending backlog 정리). |

## Evaluator Section (advisor, not gate)

본 generation 의 builder agent 는 Task tool spawn 권한이 보장되지 않는 manual lifecycle 환경 (`npx reap run validation` 직접 호출). gen-066 longterm "Builder 가 manual workflow 로 실행될 때 subagent 권한 부재 가능" 의 케이스에 해당.

**적용한 fallback** (validation prompt 명시):
- evaluator subagent 미호출.
- 통상 validation 진행 — typecheck/build/tests fresh 실행 결과로 verdict.
- `report-evaluator` CLI 호출 skip (concern 없음).

자기 검토 (builder 가 본 generation 의 변경을 직접 review):
- T002~T005 4 호출 측 게이트의 `config?.daemon === true` 비교가 모두 동일 패턴인지 확인 완료.
- `buildDaemonStaticSection()` 가 sync/async 양 builder 양쪽에서 호출되는지 확인 완료 (`grep "buildDaemonStaticSection"` 으로 2 caller 확인).
- T015 의 `~/.reap/reap-guide.md` 와 `.reap/reap-guide.md` 가 template (`src/templates/reap-guide.md`) 와 동일한지 확인 완료 (cp).
- application.md 의 "Adapter Layer" 와 evolution.md 의 "사용자 UX gap" 4-항목 원칙을 본 generation 의 변경에 매핑 시 daemon 통합은 (1) 자동 로드 (knowledge 절 추가) / (2) refresh (lifecycle hook 호출) / (3) entry-point (reap-guide.md) / (4) trigger (agent prompt 의 명시 지시 — slash command 가 아니라 agent 가 직접 호출) 모두 충족.

## Verdict

**partial — 본 generation 변경분은 회귀 0 으로 모두 pass. pre-existing fail 6건 (e2e 1 + scenario 5) 은 본 generation 의 인과 범위 외 → 정상 완료 진행.**

`reap run validation --phase complete` 로 completion 진입.
