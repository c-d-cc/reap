---
type: task
status: consumed
priority: high
createdAt: 2026-07-26T01:39:55.355Z
consumedBy: gen-072-66bfbb
consumedAt: 2026-07-26T03:37:20.097Z
---

# resolve #21: v0.17.1 pruning policy를 reflect prompt + evolution 템플릿에 동기화

Issue: https://github.com/c-d-cc/reap/issues/21 (reporter: ImBrek, REAP 0.17.1)

## Problem

v0.17.1(gen-070)이 memory tier를 **lifespan 기준 → content-type 기준**으로 재정의하고 **reflect phase 의무 pruning 정책**을 도입했다. 그러나 이 규칙은 `reap-guide.md` 와 `src/templates/migration/v0.17.1.md` 2곳에만 반영됐고, **같은 규칙을 담고 있던 다른 두 carrier 가 pre-0.17.1 텍스트를 그대로 유지**하고 있다.

grep 검증 (repo HEAD `329fb68` = npm 0.17.1):

```
$ grep -rn "prun" src/
src/templates/reap-guide.md:57,89
src/templates/migration/v0.17.1.md:15,42,54
(src/cli/commands/update.ts 의 config field pruning 은 무관)
```

→ **CLI prompt 코드 0 매치, genome 템플릿 0 매치.**

### 1. reflect prompt 에 pruning 지시 전무 (`src/cli/commands/run/completion.ts:81-97`)

reflect prompt 는 **agent 가 memory 를 갱신하는 바로 그 순간 읽는 지시문**이다. 현재는 "무엇을 쓸지"만 있고 replace / delete / promote 가 없다:

```
3. Update memory (`.reap/vision/memory/`) following these criteria:
   - **Shortterm** (update every generation — mandatory): ...
   - **Midterm** (update when context changes): ...
   - **Longterm** (update only when lessons emerge): ...
   - **Do NOT write**: ...
```

분류 기준도 여전히 갱신 빈도 기반("update when context changes" / "update only when lessons emerge")이며 content-type decision tree 가 없다. guide 의 pruning 정책은 세션 앞쪽에 로드된 훨씬 큰 문서에 묻혀 있고, 실무에서는 phase 지시문이 이긴다.

step 2 도 additive-only 다: `"Update environment/summary.md with new knowledge from this generation"` — superseded content 제거 지시가 없다.

### 2. `src/templates/evolution.md:101-131` 이 폐기된 lifespan 분류 유지

```
- **longterm.md** — Project lifetime. Recurring lessons, decision backgrounds, architecture rationale
- **midterm.md** — Multi-generation span. Current work context, multi-gen plans
- **shortterm.md** — 1-2 sessions. Next-session handoff, immediate context
```

이것이 `migration/v0.17.1.md` 가 root cause 로 지목한 바로 그 휴리스틱("That heuristic forced the AI to predict the future and led to repeated misclassification + bloat"). § Memory Update Criteria 도 pruning 없이 additive-only. **오늘 `reap init` 하는 프로젝트는 폐기된 분류를 genome 으로 받는다.**

### 3. 관측된 downstream 피해

제보자 프로젝트 (generation 28, `lastMigratedVersion: 0.17.1`, migration 적용 완료):

| 파일 | 크기 | 가이드라인 |
|---|---|---|
| `vision/memory/longterm.md` | 41 KB / 83 paragraph-sections | ~30-50 lines |
| `environment/summary.md` | 66 KB, 21 섹션 중 8개가 per-generation changelog | — |

세션당 auto-load context ≈ 185 KB. 매 generation 추가만 되고 pruning 은 한 번도 일어나지 않음. **migration 을 적용해도 이후 generation 이 다시 비대해진다** — migration 은 1회성 정리이고 지속 정책은 reflect prompt 가 전달해야 하는데 그게 비어있기 때문.

(대조군: 본 repo 자신은 longterm 49 / midterm 37 / shortterm 37 lines 로 정상. gen-070 이 사람 손으로 직접 정리했기 때문이며, 자동 정책이 작동해서가 아니다.)

### 4. 제보 환경

- REAP: 0.17.1 (npm latest — repo HEAD `329fb68` 과 동일 릴리즈)
- Node: v24.5.0
- OS: Darwin 24.6.0
- Agent: Claude Code

→ 본 repo 개발 환경과 동일 버전/플랫폼. **환경 차이로 인한 증상이 아니라 코드 자체의 누락**이며, 별도 재현 셋업 없이 소스 검토만으로 확인 가능하다 (실제로 grep 2회로 확인됨).

### 5. 근본 원인 — dog-fooding 대응표의 사각지대

`genome/application.md` § Dog-fooding 의 대응 관계는 `CLAUDE.md ↔ claude-md-section.md`, `.reap/reap-guide.md ↔ src/templates/reap-guide.md` 등 **파일 ↔ 파일** 만 명시한다. **prompt 코드(`src/cli/commands/run/*.ts`) 안에 하드코딩된 규칙 텍스트**는 대응표에 없어서, gen-070 이 규칙을 바꿀 때 동기화 대상으로 인식되지 않았다.

## Solution

### Scope A — 핵심 (이슈 본문)

**A1. `completion.ts` reflect prompt 에 content-type 분류 + pruning 정책 주입**

- step 3 의 tier 설명을 lifespan/빈도 기반 → **content-type 1-line decision rule** 로 교체
  (shortterm = session handoff "지금 당장 필요한가?" / midterm = ongoing tracks "완료 안 된 큰 트랙인가?" / longterm = design lessons "같은 실수를 막는가?")
- decision tree 4단계 명시 — 특히 **4번 "완료됐고 교훈 없음 → 기록하지 않음"** (lineage/git 이 보존)
- 기존 "what to write" 목록과 **대칭인 "what to prune" 지시** 추가:
  - Shortterm: 이전 핸드오프 **replace(덮어쓰기)**, 누적 금지
  - Midterm: 트랙 완료 시 핵심만 longterm 승격 후 해당 섹션 **삭제**
  - Longterm: genome 중복 섹션 삭제, "이 교훈 없으면 다음 agent 가 같은 실수를 하는가?" No → 삭제
- bloat 임계 명시 (longterm ~30-50 lines / midterm ~50-70 lines)

**A2. `src/templates/evolution.md` § Memory + § Memory Update Criteria 동기화**

- 3-tier 를 content-type 기준으로 재기술 + decision tree + pruning 정책 반영
- 본 repo 의 `.reap/genome/evolution.md` (한국어, 이미 v0.17.1 반영됨) 와 **내용 1:1 일치**시키되 템플릿은 영어 유지
- 참고: `.reap/genome/evolution.md` 는 이미 올바른 상태 → 템플릿만 뒤처져 있음 (dog-fooding 역방향 누락)

**A3. reflect step 2 에 "superseded content 제거" 절 추가**

- `environment/summary.md` 갱신 지시를 additive-only 에서 **replace-and-remove** 로:
  - 변경된 섹션만 갱신 (기존 원칙 유지)
  - **더 이상 사실이 아닌 서술 제거** (삭제된 파일/모듈, 폐기된 결정)
  - **per-generation changelog 누적 금지** — summary.md 는 "현재 상태" 서술이지 변경 이력 아카이브가 아님 (이력은 lineage/git 담당)

### Scope B — `integrity.ts` 크기 휴리스틱 (채택)

**B1. memory tier + environment summary 크기 warning**

`GENOME_LINE_WARNING_THRESHOLD = 100` (`src/core/integrity.ts:21,482`) 와 동일 패턴으로:

- `MEMORY_LINE_WARNING_THRESHOLDS = { longterm: 50, midterm: 70, shortterm: 60 }`
- `ENV_SUMMARY_LINE_WARNING_THRESHOLD` (본 repo 192 lines 기준 → 250 정도가 현실적, 확정 필요)
- `reap fix --check` warnings 에 노출 → 정책이 advisory 에서 **verifiable** 로 전환

현재 codebase 는 memory tier / environment summary 의 크기·내용을 **아무것도 검사하지 않는다**.

**B2. auto-fix 금지 — 사용자 데이터 보호 (필수 제약)**

`reap fix` 는 `--check` 없이 호출하면 **auto-fix 모드**다 (`src/cli/commands/fix.ts:47`). 크기 검사를 auto-fix 대상에 넣으면 **사용자 memory 를 자동 삭제**하게 되고, 41 KB longterm 을 가진 사용자가 `reap fix` 한 번으로 수십 generation 분 기록을 잃는다.

- 크기 초과는 **warning-only**. auto-fix 분기에 절대 넣지 않는다.
- warning 문구에 **해소 경로를 함께 안내** — "다음 `completion --phase reflect` 에서 pruning 정책에 따라 정리됩니다". 경로 없이 경고만 띄우면 사용자가 수동 삭제를 시도하다 손실을 자초한다.
- e2e 에 **negative test 필수**: `reap fix` (auto-fix) 실행 후 memory 파일 내용이 byte-identical 인지 검증.

**B3. 소음 관리**

기존 사용자 상당수가 임계 초과 상태로 업그레이드한다. 첫 `fix --check` 에서 일제히 warning 이 뜨는 것은 의도된 동작이지만, B2 의 해소 경로 안내가 없으면 "고장난 줄 알았다"는 오인을 부른다.

### Scope C — 재발 방지 (채택)

**C1. dog-fooding 대응표에 prompt 코드 추가**

`genome/application.md` § Dog-fooding 에 다음 대응 관계 명시 (adapt phase 에서 적용):

- `.reap/genome/evolution.md` ↔ `src/templates/evolution.md`
- `.reap/genome/application.md` ↔ (템플릿 없음 — genome-suggest 가 생성)
- **lifecycle 규칙 텍스트 ↔ `src/cli/commands/run/*.ts` 의 prompt 문자열**

판단 기준 명문화: "이 규칙이 agent 행동을 좌우하는가?" → Yes 면 **guide / genome 템플릿 / phase prompt 3곳 모두** 확인. 규칙의 carrier 는 문서만이 아니다.

### Scope D — 기존 프로젝트 도달 (신설, 필수)

**배경 — Scope A2 는 기존 사용자에게 도달하지 않는다.**

`src/templates/evolution.md` 의 소비 지점은 `initCommon` (`src/cli/commands/init/common.ts:79-80`) **단 1곳**이며, `reap init` 시에만 실행된다. 확인 결과:

- `reap update` — genome 미접촉 (config backfill / 디렉토리 / entry-point / session integration 만)
- `reap init --repair` — `repair.ts` 전체 48줄, **CLAUDE.md 만** 수리. genome 미접촉
- `grep -rn "evolution" src/cli/commands/init/` → `common.ts` 2줄이 전부

genome 을 덮어쓰지 않는 것은 user-owned 자산으로서 **올바른 설계**다. 그러나 그 결과 A2 의 수혜자는 신규 프로젝트뿐이고, **이미 lifespan 분류를 받아간 기존 프로젝트 전부**(= 더 큰 모집단, 제보자 본인 포함)는 방치된다.

**더 심각한 문제 — 지시 충돌.**

업그레이드 후 기존 프로젝트의 세션에서는:

- `@.reap/genome/evolution.md` (CLAUDE.md static import) → lifespan 분류 + additive-only (구버전)
- reflect phase prompt → content-type 분류 + 의무 pruning (신규)

두 지시가 정면 충돌한다. `reap-guide.md` Critical Rules #4 는 **"Genome is the authoritative source of truth"** 이므로 genome 이 이길 근거가 있고, 이슈 본문의 논리("phase 지시문이 큰 문서를 이긴다")를 따르면 prompt 가 이긴다. **어느 쪽이 이길지 예측 불가**하며 generation 마다 달라질 수 있다. 개선을 배포하고 모순을 남기는 것은 개선하지 않는 것보다 나쁘다.

**D1. `src/templates/migration/v0.17.2.md` 신설**

gen-071 migration instruction layer 는 **기존 프로젝트 genome 에 도달하는 유일한 채널**이다. note 는 다음을 지시한다:

1. `.reap/genome/evolution.md` 의 § Memory / § Memory Update Criteria 를 content-type 분류 + pruning 정책으로 교체
2. (프로젝트 language 가 korean 이면 한국어판, 아니면 영어판 — 본 repo `.reap/genome/evolution.md` 와 `src/templates/evolution.md` 가 각각 기준 텍스트)
3. 적용 후 `reap update --mark-migrated`

**D2. genome immutability 예외 — 조건부 silent edit (유저 승인 완료)**

원칙상 genome 수정은 backlog → adapt 경로를 거쳐야 하나, 본 건은 **REAP 자신의 결함으로 배포된 잘못된 텍스트를 회수하는 성격**이므로 유저가 강제 수정을 허용했다. 단 무조건 덮어쓰기는 사용자가 손수 다듬은 genome 을 파괴하므로 **정확 일치 조건**을 건다:

**3분기로 판정한다** (2분기로 설계하면 이미 올바른 프로젝트가 매번 불필요한 confirm 을 받는다):

1. **구버전 원본과 정확 일치** → **silent edit**. 사용자가 손댄 적 없는 순수 템플릿 산출물이므로 교체해도 잃는 것이 없다.
2. **이미 신규(content-type) 형식** → **no-op, confirm 없이 통과**. 본 repo 처럼 gen-070 에서 선반영했거나, 사용자가 guide 를 보고 먼저 고친 경우가 여기 해당. 판정 키: content-type 분류의 특징 문구(1-line decision rule / decision tree / pruning 정책) 존재 여부.
3. **그 외 — 구버전도 신규도 아님** (사용자가 수정/추가/번역했음) → **user confirm 필수**. diff 를 제시하고 승인 후에만 적용. 거절 시 skip 하고 `--mark-migrated` 를 실행하지 않아 다음 세션에 재노출.

분기 2 를 빠뜨리면 본 repo 자신이 즉시 분기 3 에 걸린다 — dog-fooding 으로 바로 드러나는 결함이므로 note 작성 시 최우선 확인.

이를 위해 migration note 는 **비교 기준이 될 원본 텍스트(v0.17.0/v0.17.1 시점의 § Memory + § Memory Update Criteria 전문)를 note 안에 그대로 포함**해야 한다. agent 가 대조할 대상이 없으면 정확 일치 판정이 불가능하다. 영어판(템플릿 산출물)과 한국어판(본 repo genome) 양쪽 원본을 모두 실어야 한다.

note 본문에 예외 사유를 명시할 것 — "이것은 genome immutability 의 예외이며, REAP 배포 결함 회수 목적으로 v0.17.2 에 한해 허용된다". 선례로 오용되지 않도록.

**D3. 코호트별 결과 확인**

| 코호트 | v0.17.2 적용 후 |
|---|---|
| ≤0.17.0 | pending migration 2건(v0.17.1 + v0.17.2) 동시 노출. 순서대로 적용되면 정합 |
| 0.17.1 미적용 | 위와 동일 |
| 0.17.1 적용 완료 | v0.17.2 1건만 노출. **"이미 마이그레이션했는데 왜 또"** 오인 방지를 위해 note 도입부에 "v0.17.1 은 memory 내용을, v0.17.2 는 genome 규칙 텍스트를 다룹니다 — 대상이 다릅니다" 명시 |
| 신규 init | migration 불필요 (템플릿이 이미 정합) |

**D4. 버전 = 0.17.2 (확정)**

migration note 파일명이 버전과 결합(`^v\d+\.\d+\.\d+\.md$`)되므로 0.17.2 로 고정. `package.json` bump 와 파일명이 일치해야 `detectPendingMigrations` 의 `lastMigratedVersion < v <= pkgVersion` 범위에 들어온다.

**전파 경로 (실측)**

| 변경물 | 소비 지점 | 기존 프로젝트 도달 |
|---|---|---|
| `completion.ts` prompt | `dist/cli/index.js` 번들 | ✅ 업그레이드 즉시 전원 |
| `templates/evolution.md` | `initCommon` 단 1곳 | ❌ 신규 init 만 |
| `templates/migration/v0.17.2.md` | `detectPendingMigrations` → update / SessionStart / dump-state | ✅ **기존 genome 도달 유일 채널** |
| `templates/reap-guide.md` | postinstall → `installSkills` → `installReapGuide` → `~/.reap/` | ✅ npm 업그레이드 시 |
| `integrity.ts` | `reap fix --check` 수동 호출 | ⚠️ 명시 호출 시에만 |

`autoUpdate: true` 가 기본값(`update.ts:49`)이므로 대다수는 다음 세션 `check-version` 에서 자동 업그레이드된다.

**알려진 인접 갭 (본 generation scope 밖, 관찰만)**: `registerSessionIntegration` (= `reap update` 경로) 은 `installReapGuide()` 를 호출하지 않는다 (`src/adapters/claude-code/index.ts:37-41`). 현재는 npm postinstall 이 커버하므로 실害 없으나, gen-064 가 slash command / agent 에서 고친 것과 **같은 계열의 누락**이다. 별도 backlog 후보.

## Files to Change

**Scope A**
- `src/cli/commands/run/completion.ts` — reflect phase prompt 배열 (L74-99). step 2 + step 3 재작성
- `src/templates/evolution.md` — § Memory (L101-109), § Memory Update Criteria (L112-131), § Environment Refresh at Completion (L137-141)

**Scope B**
- `src/core/integrity.ts` — threshold 상수 + `checkIntegrity` 내 memory/environment 크기 검사 분기 (L21, L482 인근 패턴 차용). **warning 배열에만 push, auto-fix 분기 미접촉**
- `src/cli/commands/fix.ts` — warning 출력에 해소 경로 문구 추가 (auto-fix 로직은 변경 없음을 명시적으로 확인)

**Scope C** (adapt phase)
- `.reap/genome/application.md` — § Dog-fooding 대응표 확장 (본 repo 는 embryo 라 직접 수정 가능하나 **adapt phase 처리**)

**Scope D**
- `src/templates/migration/v0.17.2.md` (신규) — 기존 프로젝트 genome 갱신 지시 + 대조용 원본 텍스트(영/한) 전문 포함 + immutability 예외 사유 명시
- `package.json` — version 0.17.2
- `RELEASE_NOTICE.md` — 0.17.2 노트 (버전+언어별 추출 형식 준수)

**테스트** (genome § Testing Principles: CLI command 수정 → e2e / init 구조 변경 → scenario)
- `tests/e2e/completion-reflect.test.ts` (**기존 파일 수정**) — L27-31 이 `"mandatory"` / `"Do NOT write"` 문자열을 assert 중. 신규 문구에서 두 문자열을 보존하거나 assertion 을 갱신. **미조치 시 회귀 fail**
- `tests/e2e/completion-reflect-prompt.test.ts` (신규 또는 위 파일에 추가) — pruning 지시 / content-type 분류 / decision tree / superseded 제거 절 포함 검증
- `tests/scenario/` — `reap init` 산출 `genome/evolution.md` 가 content-type 분류 포함
- `tests/unit/integrity-memory-size.test.ts` (신규) — 임계 판정 로직
- `tests/e2e/fix-memory-warning.test.ts` (신규) — (a) `fix --check` 가 초과 시 warning, (b) **`reap fix` auto-fix 실행 후 memory 파일 byte-identical** (B2 negative test)
- `tests/e2e/` migration detection — `lastMigratedVersion: 0.17.1` + pkg 0.17.2 일 때 v0.17.2 note 만 pending 으로 노출 (v0.17.1 은 제외)

**빌드**
- `npm run build` 후 `dist/templates/evolution.md` + `dist/templates/migration/v0.17.2.md` 반영 확인 (build.sh 가 `src/templates/` 통째 복사)

## Verification

1. `grep -rn "prun" src/cli/ src/templates/evolution.md` → 매치 존재
2. `reap run completion --phase reflect` 출력 prompt 에 shortterm **replace** / midterm **delete** / longterm **dedup** 3개 지시 모두 포함 + environment superseded 제거 절 포함
3. 신규 프로젝트에서 `reap init` → `.reap/genome/evolution.md` 의 tier 설명이 content-type 기준
4. `npm run typecheck` pass / `bun test tests/unit tests/e2e` 회귀 없음 (baseline: unit 445-0, e2e 249-1 pre-existing). **`completion-reflect.test.ts` 가 fail 하지 않는지 특히 확인**
5. 임계 초과 memory 를 가진 sandbox 에서 `reap fix --check` 가 warning + 해소 경로 노출, **`reap fix` 는 파일 미변경**
6. `lastMigratedVersion: 0.17.1` sandbox + pkg 0.17.2 → SessionStart / `reap update` 에 v0.17.2 note 노출. `--mark-migrated` 후 미노출
7. **D2 3분기 검증**: (a) 원본 그대로인 genome → silent 교체, (b) 이미 신규 형식인 genome → **no-op + confirm 없음**, (c) 사용자가 한 줄 수정한 genome → confirm 요구 + 거절 시 미변경 + `--mark-migrated` 미실행. **(b) 는 본 repo 자신으로 실사용 검증 가능**

## Resolved Decisions

- [x] **Scope B 포함** — 단 warning-only, auto-fix 금지 (B2)
- [x] **Scope C 포함** — adapt phase 에서 처리
- [x] **Scope D 신설** — migration v0.17.2. genome immutability 예외를 유저가 허용
- [x] **genome 강제 수정 조건** — 원본 정확 일치 시 silent edit, 불일치 시 user confirm
- [x] **버전 0.17.2** 확정
- [x] **본 repo v0.17.1 마감 순서 = 순서 A (generation 시작 전 선마감)**

  `markMigratedNow` (`update.ts:130-141`) 는 `lastMigratedVersion` 을 **현재 패키지 버전으로 통째 전진**시키는 all-or-nothing 연산이다. "v0.17.1 만 완료 처리" 라는 선택지가 없다.

  - 순서 A (채택): bump 전에 `reap update --mark-migrated` → `lastMigratedVersion: 0.17.1`. 이후 0.17.2 bump 시 pending 은 v0.17.2 1건만.
  - 순서 B (기각): generation 후 마감 → pending 이 [v0.17.1, v0.17.2] 2건이 되고 한 번에 소멸. v0.17.1 을 **검토한 적 없이 "적용됨" 으로 기록**하게 된다. 실질 피해는 없으나(memory 이미 정상) migration layer 자신의 규율을 dog-fooding 프로젝트가 어기는 모양새라 기각.

  → **본 backlog 소비 전에 선행 조치로 실행.**

## Post-Resolution

- `gh issue comment 21` + `gh issue close 21`
- version bump: **0.17.2** (확정). prompt 변경이 전 사용자 agent 행동에 영향을 주고 autoUpdate 로 자동 배포되지만, 구조적 breaking change 없음 (`ReapOutput` 스키마 / nonce / transition graph / config 필드 모두 불변) — patch 로 처리하되 RELEASE_NOTICE 에 행동 변화를 명시
- 필요 시 `autoUpdateMinVersion` guard 검토 (급격한 행동 변화 우려 시)

## Follow-up Backlog 후보 (본 generation scope 밖)

- `registerSessionIntegration` 이 `installReapGuide()` 미호출 (`src/adapters/claude-code/index.ts:37-41`) — gen-064 가 slash command / agent 에서 고친 것과 동일 계열 누락. 현재는 npm postinstall 이 커버하여 실害 없음
