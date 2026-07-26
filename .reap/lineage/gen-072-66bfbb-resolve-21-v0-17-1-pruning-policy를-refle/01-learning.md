# Learning

## Project Overview

REAP v0.17.1, embryo generation 72. TypeScript/Bun CLI (`@c-d-cc/reap`), zero-dependency (`yaml` only), 파일 기반 상태(`.reap/`), JSON stdout 규약.

본 generation 은 GitHub issue #21 해결이며, 성격은 **규칙 텍스트의 carrier 동기화 + 기존 사용자 도달**이다. 새 기능 추가가 아니라 v0.17.1 이 남긴 불완전한 전파를 완결시키는 작업.

## Source Backlog

`resolve-21-v0171-pruning-policy를-reflect-prompt-evolution-템플릿에-동기화.md` (consumed by gen-072-66bfbb)

### 배경

v0.17.1(gen-070)이 memory tier 를 **lifespan 기준 → content-type 기준**으로 재정의하고 **reflect phase 의무 pruning 정책**을 도입했다. 그러나 규칙이 `reap-guide.md` 와 `migration/v0.17.1.md` 2곳에만 반영됐고, 같은 규칙을 담고 있던 다른 carrier 들은 pre-0.17.1 텍스트를 유지하고 있다.

제보자(ImBrek, REAP 0.17.1, generation 28, `lastMigratedVersion: 0.17.1` 적용 완료) 프로젝트 실측:

| 파일 | 크기 | 가이드라인 |
|---|---|---|
| `vision/memory/longterm.md` | 41 KB / 83 paragraph-sections | ~30-50 lines |
| `environment/summary.md` | 66 KB, 21 섹션 중 8개가 per-generation changelog | — |

세션당 auto-load ≈ 185 KB. **migration 을 적용했는데도 비대화가 계속된다** — migration 은 1회성 정리이고 지속 정책의 전달 경로인 reflect prompt 가 비어 있기 때문.

### Scope (backlog 확정본)

- **A** — reflect prompt 에 content-type 분류 + pruning 정책 주입 / evolution 템플릿 동기화 / environment superseded 제거 절
- **B** — `integrity.ts` 크기 warning (warning-only, auto-fix 금지)
- **C** — dog-fooding 대응표에 prompt 코드 추가 (adapt phase)
- **D** — `migration/v0.17.2.md` 신설, 기존 프로젝트 genome 도달. **3분기 판정**(원본일치 silent / 이미신규 no-op / 사용자수정 confirm)

## Key Findings

### 1. reflect prompt 현황 (`src/cli/commands/run/completion.ts:74-99`)

prompt 배열 실물 확인. step 2 는 `"Update environment/summary.md with new knowledge from this generation"` 한 줄로 **additive-only**. step 3 는 tier 별 "무엇을 쓸지"만 나열하며 분류 기준이 **갱신 빈도 기반**("update when context changes" / "update only when lessons emerge"). replace / delete / promote 지시 없음. decision tree 없음.

`grep -rn "prun" src/` → `reap-guide.md`, `migration/v0.17.1.md` 만 매치. **CLI prompt 코드 0, genome 템플릿 0** 확인.

### 2. evolution 템플릿 현황 (`src/templates/evolution.md`)

- L101-109 § Memory — lifespan 분류 3줄 그대로("Project lifetime" / "Multi-generation span" / "1-2 sessions")
- L112-131 § Memory Update Criteria — additive-only
- L137-141 § Environment Refresh at Completion — superseded 제거 없음

대조: `.reap/genome/evolution.md` 는 **이미 content-type 기준으로 갱신됨**(gen-070). 즉 dog-fooding 역방향(genome → 템플릿)이 누락된 상태.

### 3. Scope D 의 근거 — 템플릿은 기존 사용자에게 도달하지 않는다

`src/templates/evolution.md` 소비 지점 전수 확인:

```
grep -rn "evolution" src/cli/commands/init/
→ common.ts:79-80  (2줄이 전부)
```

- `initCommon` (`init/common.ts:79-80`) — `reap init` 시에만 실행
- `reap update` (`update.ts`) — genome 미접촉 (config backfill / 디렉토리 / entry-point / session integration)
- `reap init --repair` (`init/repair.ts`, 전체 48줄) — **CLAUDE.md 만** 수리

genome 을 덮어쓰지 않는 것은 user-owned 자산으로서 올바른 설계다. 결과적으로 A2 의 수혜자는 신규 프로젝트뿐이며, **기존 프로젝트는 업그레이드 후 "genome=lifespan vs prompt=content-type" 모순 상태**가 된다. `reap-guide.md` Critical Rules #4("Genome is the authoritative source of truth")를 따르면 genome 이 이기고, 이슈 논리를 따르면 prompt 가 이겨 **예측 불가**. → migration note 가 유일한 도달 채널.

### 4. Scope B 는 구조상 안전하다 (중요 발견)

`integrity.ts` 와 `fix.ts` 의 auto-fix 는 **서로 다른 함수**다:

- `checkIntegrity` (`integrity.ts:32`) → `checkGenome` (`integrity.ts:461-490`) 이 `warnings.push` 만 수행. `GENOME_LINE_WARNING_THRESHOLD = 100` (L21, L482) 이 선례
- `fixProject` (`fix.ts:47`) 는 별도 함수. genome 파일도 **missing 보고만 하고 auto-create 하지 않는다**(L114-127)

→ 크기 검사를 `checkIntegrity` 계열에 warnings 로만 추가하면 **B2(auto-fix 금지)가 구조적으로 보장**된다. `fixProject` 를 건드리지 않는 것이 곧 안전장치. e2e negative test 는 이 불변을 고정하는 용도.

경로는 이미 존재: `paths.memoryLongterm` / `memoryMidterm` / `memoryShortterm` (`paths.ts:25-27, 65-67`), `paths.environmentSummary` (L12, L52).

### 5. 깨질 기존 테스트

`tests/e2e/completion-reflect.test.ts:27-31` 이 reflect prompt 에 대해 assert:

```ts
expect(prompt).toContain("Shortterm"); // "Midterm", "Longterm"
expect(prompt).toContain("mandatory");
expect(prompt).toContain("Do NOT write");
```

`"mandatory"` / `"Do NOT write"` 를 보존하거나 assertion 을 갱신해야 한다. 미조치 시 회귀 fail.

### 6. 본 repo 는 D2 분기 2에 해당

`.reap/genome/evolution.md` 는 gen-070 에서 이미 content-type 으로 갱신됨. v0.17.2 note 가 2분기(원본일치/불일치)로만 설계되면 본 repo 가 즉시 "사용자 수정" 분기에 걸려 불필요한 confirm 이 발생한다. **3분기 필수** — dog-fooding 으로 바로 검증 가능.

### 7. 버전/migration 결합

`detectPendingMigrations` 는 `lastMigratedVersion < v <= pkgVersion` 범위를 선택한다. 현재 config `lastMigratedVersion: 0.17.1`(본 세션에서 선마감), `package.json` 0.17.1. → **0.17.2 로 bump 해야 v0.17.2.md 가 노출된다.** 파일명(`^v\d+\.\d+\.\d+\.md$`)과 package version 이 일치해야 함.

## Previous Generation Reference

gen-071 (migration instruction layer) 이 본 세대의 직접적 전제다. `detectPendingMigrations` / `buildPendingMigrationsSection` / `--mark-migrated` / SessionStart 주입이 이미 동작하므로, Scope D 는 **note 파일 1개 추가만으로 성립**한다. 인프라 재구축 불필요.

gen-071 교훈 중 본 세대에 적용되는 것: `CONFIG_DEFAULTS` 에 optional tracking 필드를 넣으면 spurious diff 발생. 본 세대는 config 필드를 추가하지 않으므로 해당 없음.

## Backlog Review

**Source**: 위 항목 (consumed)

**Pending 4건** — 본 generation 과의 관계:

| backlog | 관계 |
|---|---|
| interview 기능 | 무관. 후속 generation (0.18.0 예정) |
| release 문서 검증 | **연관** — 본 세대가 0.17.2 를 만들고, 다음 세대가 문서에 반영. release 게이트 설계 시 중복 주의 |
| daemon 배포 결함 | 무관. 유저 결정으로 0.17.2 이후 보류 |
| daemon SCIP 검토 | 무관. 위와 동일 |

## Context for This Generation

### Clarity Level: **High**

근거:
- backlog 가 파일·라인 단위까지 특정된 상태로 작성됨 (Scope A~D, Files to Change, Verification 7항목)
- Open Decisions 5건이 사전 협의로 확정 (Scope B 포함, C 포함, D 신설, genome 강제수정 조건, 버전 0.17.2)
- 본 세션에서 코드 확인이 이미 수행되어 추가 탐색 부담 낮음
- 이슈 본문이 재현 가능한 grep 근거 포함

→ evolution.md § Clarity-driven Interaction 기준 "간단 확인 후 실행, 질문 최소화".

### 특수 제약

1. **genome immutability 예외** — Scope D2 는 사용자 genome 을 직접 수정하도록 지시하는 migration note 다. 유저가 명시 허용(2026-07-26)했으며, note 본문에 예외 사유와 v0.17.2 한정임을 기재해야 한다. 선례 오용 방지.
2. **회귀 0 원칙** — prompt 변경은 전 사용자 agent 행동에 영향. 구조적 breaking change 는 없으나(`ReapOutput` 스키마 / nonce / transition graph / config 필드 불변) RELEASE_NOTICE 에 행동 변화 명시 필요.
3. **dog-fooding** — 본 세대의 reflect phase 가 **새 prompt 의 첫 사용자**가 된다. 구현 후 즉시 자기 검증 가능 (gen-066 self-dogfooding timing 패턴).

### 참조할 genome 원칙

- § Dog-fooding — 메타 파일 변경 시 `src/templates/` 동기화. **본 이슈의 근본 원인이 이 대응표의 사각지대**(prompt 코드 미포함)이므로 Scope C 로 확장
- § Testing Principles — CLI command 수정 → e2e / init 구조 변경 → scenario
- § Workaround 금지 — 인과로 묶인 fix 는 본 세대에서 처리
