# Planning

## Goal

v0.17.1 이 도입한 **memory content-type 분류 + reflect pruning 정책**을 규칙의 모든 carrier 에 동기화하고, **이미 구버전 텍스트를 받아간 기존 프로젝트까지 도달**시킨다. 버전 0.17.2.

완료 시 달라지는 것:
- reflect prompt 가 "무엇을 쓸지"뿐 아니라 **"무엇을 지울지"**를 지시한다
- 신규 `reap init` 프로젝트가 content-type 분류를 genome 으로 받는다
- 기존 프로젝트가 migration note 를 통해 genome 을 갱신받는다
- 정책이 advisory 에서 **검사 가능(verifiable)** 으로 바뀐다 (`reap fix --check`)

## Completion Criteria

1. `grep -rn "prun" src/cli/ src/templates/evolution.md` → 매치 존재
2. `reap run completion --phase reflect` 출력 prompt 에 shortterm **replace** / midterm **delete** / longterm **dedup** 3개 지시 + environment superseded 제거 절 포함
3. 신규 `reap init` 산출 `genome/evolution.md` 의 tier 설명이 content-type 기준
4. `lastMigratedVersion: 0.17.1` + pkg 0.17.2 sandbox 에서 v0.17.2 note 만 pending 노출, `--mark-migrated` 후 미노출
5. 임계 초과 memory sandbox 에서 `reap fix --check` warning + 해소 경로 노출, **`reap fix` 는 파일 미변경**
6. `npm run typecheck` pass, unit/e2e 회귀 없음 (baseline unit 445-0 / e2e 249-1 pre-existing)
7. migration note 가 **3분기**(원본일치 silent / 이미신규 no-op / 사용자수정 confirm)를 명시하고 대조용 원본 전문을 포함

## Background

01-learning.md § Key Findings 참조. 요약:

- 규칙이 `reap-guide.md` + `migration/v0.17.1.md` 에만 반영되고 **reflect prompt 와 evolution 템플릿은 pre-0.17.1 상태**
- 템플릿은 `initCommon` 단 1곳에서만 소비되어 **기존 프로젝트에 도달 0** → migration note 가 유일 채널
- 근본 원인: dog-fooding 대응표가 **prompt 코드를 carrier 로 인식하지 않음**

## Approach

### 텍스트 기준(single source) 확정

세 곳의 규칙 텍스트가 일치해야 한다:

| 위치 | 언어 | 현 상태 |
|---|---|---|
| `src/templates/reap-guide.md` § Memory | 영어 | ✅ 이미 v0.17.1 반영 |
| `.reap/genome/evolution.md` § Vision 활용 원칙 | 한국어 | ✅ 이미 v0.17.1 반영 |
| `src/templates/evolution.md` § Memory | 영어 | ❌ 구버전 |
| `completion.ts` reflect prompt | 영어 | ❌ 구버전 |

→ **`src/templates/reap-guide.md` 의 영어 서술을 기준**으로 나머지 둘을 맞춘다. 새 문구를 창작하지 않는다(carrier 간 표현 차이가 다시 drift 를 만든다).

### reflect prompt 설계 원칙

- 기존 "what to write" 목록과 **대칭 구조**로 "what to prune" 을 배치. 비대칭이면 한쪽만 읽힌다
- 기존 assertion 문자열 `"mandatory"` / `"Do NOT write"` **보존** → 테스트 수정 최소화 + 의미도 유지됨
- prompt 길이는 ~20줄 → ~40줄. generation 당 1회이므로 비용 무시 가능

### migration note 3분기 판정

```
기존 § Memory / § Memory Update Criteria 텍스트 검사
├─ 구버전 원본과 정확 일치        → silent edit (확인 없음)
├─ 이미 content-type 형식         → no-op (확인 없음)   ← 본 repo 가 여기
└─ 그 외 (사용자가 수정/번역)      → diff 제시 + confirm, 거절 시 skip + --mark-migrated 미실행
```

분기 2 판정 키: "1-line decision rule" / "decision tree" / "pruning" 문구 존재 여부.

note 에 **대조용 구버전 원본 전문**(영어, `src/templates/evolution.md` L101-133)을 그대로 실어야 분기 1 판정이 가능하다. 프로젝트 언어가 한국어여도 genome 템플릿은 영어로 배포되므로(`initCommon` 이 언어 무관하게 영어 템플릿 복사) **baseline 은 영어 1종으로 충분**하다.

### Scope B 안전 설계

01-learning.md § 4 발견에 따라: `checkGenome` 옆에 `checkMemorySize` 를 추가하고 `warnings.push` 만 한다. `fix.ts`의 `fixProject` 는 **손대지 않는다** — 그것이 곧 auto-fix 금지 보장. e2e negative test 로 불변 고정.

임계값:
- longterm 50 / midterm 70 / shortterm 60 (guide 의 "30~50", "50~70" 상한 채택, shortterm 은 guide 에 수치가 없어 60 으로 설정 — 본 repo 37줄 기준 여유)
- environment summary 250 (본 repo 192줄 기준 여유)

## Risk Assessment

| 리스크 | 대응 |
|---|---|
| 기존 e2e `completion-reflect.test.ts` 회귀 | `"mandatory"` / `"Do NOT write"` 문자열 보존으로 회피. 그래도 T009 에서 명시 확인 |
| migration note 가 본 repo 를 분기 3으로 오판 | 분기 2 판정 키를 명확히. dog-fooding 으로 즉시 검증 (T012) |
| 크기 warning 이 기존 사용자에게 일괄 발생 | 의도된 동작. warning 문구에 해소 경로 동봉으로 오인 방지 |
| prompt 길이 증가로 기존 흐름 교란 | 구조를 바꾸지 않고 각 tier 항목에 prune 지시를 병기 |
| 버전/파일명 불일치로 note 미노출 | T013 에서 `package.json` 0.17.2 와 `v0.17.2.md` 동시 확인 |

## Scope

**변경 대상**
- `src/cli/commands/run/completion.ts` — reflect prompt (L74-99)
- `src/templates/evolution.md` — § Memory, § Memory Update Criteria, § Environment Refresh at Completion
- `src/templates/migration/v0.17.2.md` (신규)
- `src/core/integrity.ts` — 임계 상수 + `checkMemorySize`
- `package.json` — 0.17.2
- `RELEASE_NOTICE.md` — v0.17.2 (en/ko)
- 테스트 3종

**명시적 out of scope**
- `.reap/genome/application.md` § Dog-fooding 확장 → **adapt phase** 에서 처리 (Scope C, genome 수정은 adapt 가 정위치)
- `RELEASE_NOTES.md` / `docs/` 갱신 → **다음 generation** (`release-직전-문서-버전-일치-검증` backlog 담당). 본 세대에서 손대면 그 backlog 와 충돌
- `fix.ts` 의 `fixProject` — 의도적 미변경
- daemon 관련 일체

## Tasks

**Scope A — 규칙 텍스트 동기화**
- [ ] T001 `src/templates/evolution.md` — § Memory 를 content-type 3-tier + 1-line decision rule 표로 교체
- [ ] T002 `src/templates/evolution.md` — § Memory Update Criteria 를 decision tree 4단계 + tier 별 pruning 정책으로 재작성. `"mandatory"` / `"Do NOT write"` 문구 유지
- [ ] T003 `src/templates/evolution.md` — § Environment Refresh at Completion 에 superseded 제거 + per-generation changelog 금지 절 추가
- [ ] T004 `src/cli/commands/run/completion.ts` — reflect prompt step 3 을 content-type 분류 + decision tree + tier 별 prune 지시로 교체
- [ ] T005 `src/cli/commands/run/completion.ts` — reflect prompt step 2 에 superseded 제거 절 추가

**Scope B — 크기 검사**
- [ ] T006 `src/core/integrity.ts` — `MEMORY_LINE_WARNING_THRESHOLDS` + `ENV_SUMMARY_LINE_WARNING_THRESHOLD` 상수 추가
- [ ] T007 `src/core/integrity.ts` — `checkMemorySize` 신설(warnings only) + `checkIntegrity` 에서 호출. warning 문구에 해소 경로 포함
- [ ] T008 `src/cli/commands/fix.ts` — **변경 없음을 확인만** (auto-fix 경로 미접촉 검증)

**Scope D — migration note + 버전**
- [ ] T009 `src/templates/migration/v0.17.2.md` (신규) — 3분기 판정 + 대조용 원본 전문 + genome immutability 예외 사유 + v0.17.1 과의 차이 안내
- [ ] T010 `package.json` — version 0.17.2
- [ ] T011 `RELEASE_NOTICE.md` — v0.17.2 절 (en/ko). prompt 행동 변화 명시

**테스트**
- [ ] T012 `tests/e2e/completion-reflect.test.ts` — 기존 assertion 유지 확인 + pruning/content-type/decision-tree 검증 case 추가
- [ ] T013 `tests/unit/integrity-memory-size.test.ts` (신규) — 임계 판정 로직
- [ ] T014 `tests/e2e/fix-memory-warning.test.ts` (신규) — (a) `fix --check` warning, (b) **`reap fix` 후 memory byte-identical**
- [ ] T015 `tests/e2e/` — migration v0.17.2 detection (`lastMigratedVersion: 0.17.1` + pkg 0.17.2 → v0.17.2 만 노출)

**검증**
- [ ] T016 `npm run build` + `npm run typecheck` + unit/e2e 전체 실행, baseline 대비 회귀 확인
- [ ] T017 완료 기준 1~7 수동 확인 (특히 3분기 판정이 본 repo 에서 no-op 인지)

## Dependencies

- T001~T003 → T009 (migration note 가 새 텍스트를 인용하므로 확정 후)
- T004~T005 → T012 (prompt 확정 후 테스트)
- T006~T007 → T013, T014
- T010 → T015 (버전 bump 후 detection 검증)
- 전부 → T016 → T017

## Additional Findings

- `initCommon` 은 프로젝트 언어와 무관하게 **영어 evolution.md 템플릿**을 복사한다(`init/common.ts:79-80`). 따라서 migration note 의 대조 baseline 은 영어 1종이면 충분하다. 한국어로 번역해 쓰는 사용자는 자연히 분기 3(confirm) 으로 간다 — 의도한 동작.
- `checkGenome` 의 `GENOME_LINE_WARNING_THRESHOLD` 패턴이 그대로 재사용 가능하다. 별도 설계 불필요.
