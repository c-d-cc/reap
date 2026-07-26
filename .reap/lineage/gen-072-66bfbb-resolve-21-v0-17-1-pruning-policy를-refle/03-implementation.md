# Implementation Log

## Completed Tasks

| # | 파일 | 내용 |
|---|---|---|
| T001 | `src/templates/evolution.md` | § Memory 를 content-type 3-tier 표 + 1-line decision rule 로 교체. bloat 임계 + "empty is normal" 추가 |
| T002 | `src/templates/evolution.md` | § Memory Classification Decision Tree 신설(4단계) + § Memory Update Criteria 를 tier 별 Write/Prune 대칭 구조로 재작성 |
| T003 | `src/templates/evolution.md` | § Environment Refresh at Completion 에 superseded 제거 + per-generation changelog 금지 절 추가 |
| T004 | `src/cli/commands/run/completion.ts` | reflect prompt step 3 을 content-type 분류 + decision tree + tier 별 prune 지시로 교체 |
| T005 | `src/cli/commands/run/completion.ts` | step 2 를 additive-only 에서 "반영 + 낡은 서술 제거 + changelog 누적 금지" 3항목으로 확장 |
| T006 | `src/core/integrity.ts` | `MEMORY_LINE_WARNING_THRESHOLDS`(50/70/60) + `ENV_SUMMARY_LINE_WARNING_THRESHOLD`(250) + `SIZE_WARNING_HINT` 추가. 각 수치의 근거를 주석에 명시 |
| T007 | `src/core/integrity.ts` | `checkMemorySize` 신설 — warnings only. `checkIntegrity` 에서 호출 |
| T008 | `src/cli/commands/fix.ts` | **변경 없음 (확인만)**. `fixProject` 는 memory 파일이 없을 때만 생성(L156 `if (!fileExists)`)하고 내용 미접촉 |
| T009 | `src/templates/migration/v0.17.2.md` | 신규. 3분기 판정 + 대조용 baseline 전문 + immutability 예외 사유 + v0.17.1 과의 차이 안내 |
| T010 | `package.json` | 0.17.1 → 0.17.2 |
| T011 | `RELEASE_NOTICE.md` | v0.17.2 절 (en/ko). 행동 변경임을 명시 |
| T012 | `tests/e2e/completion-reflect.test.ts` | 기존 5 assertion 유지 + 4 case 추가 (content-type / decision tree / tier 별 prune / environment superseded) |
| T013 | `tests/unit/integrity-memory-size.test.ts` | 신규 9 case — 임계 판정, 경계값, 미존재 파일, 해소 경로 문구, 비변경 보장 |
| T014 | `tests/e2e/fix-memory-warning.test.ts` | 신규 5 case — `--check` warning 3종 + **auto-fix 후 byte-identical** negative test |
| T015 | `tests/e2e/update-migration.test.ts` | v0.17.2 detection 5 case 추가 + **버전 하드코딩 제거**(아래 Discovered Issues 참조) |
| T016 | — | typecheck pass / unit 454-0 / e2e 263-1 (pre-existing) |
| T017 | — | 완료 기준 1~7 확인. 아래 Verification Results |

## Verification Results

| 기준 | 결과 |
|---|---|
| 1. `grep prun` src/cli/ + evolution.md | `completion.ts`, `evolution.md` 매치 (이전 0건) |
| 2. reflect prompt 에 replace/delete/dedup + environment superseded | T012 4 case 로 고정 |
| 3. 신규 `reap init` genome 이 content-type | 임시 프로젝트 생성 → 마커 5개 확인 |
| 4. v0.17.2 detection | 본 repo(`lastMigratedVersion: 0.17.1` + pkg 0.17.2) 에서 v0.17.2 **1건만** 노출, v0.17.1 미재노출 |
| 5. `fix --check` warning + `reap fix` 미변경 | T014 로 고정 |
| 6. 회귀 | typecheck pass / unit 445→454 (+9) / e2e 249→263 (+14), 실패는 동일 pre-existing 1건 |
| 7. 3분기 판정 | **본 repo 가 Branch B(no-op) 로 판정** — `.reap/genome/evolution.md` 가 이미 신규 형식(마커 3개). confirm 없이 통과, 설계대로 |

기준 7 은 dog-fooding 으로 실제 검증됐다. 2분기 설계였다면 본 repo 가 즉시 불필요한 confirm 을 띄웠을 것이다.

## Discovered Issues

### 1. genome line threshold(100) < 배포 템플릿(175줄) — backlog 등록

`GENOME_LINE_WARNING_THRESHOLD = 100` (`integrity.ts:21`) 이 REAP 자신이 배포하는 `evolution.md` 보다 작다. `reap init` 직후 첫 `fix --check` 에서 사용자가 아무 잘못 없이 warning 을 받는다.

- **gen-072 이전부터 존재** — 템플릿이 146줄이던 시점에도 초과. 본 세대가 +29줄로 악화시켰을 뿐 원인이 아니다
- T014 의 "stays quiet" 대조군 테스트가 이 warning 에 걸려 발견
- 본 세대 scope 밖(memory 크기 검사가 목표) → backlog `genome-line-threshold100-가-배포-템플릿evolutionmd-175줄보다-작아-신규-init-이-즉시-warning.md` 등록. A/B/C/D 4개 방향 제시
- 테스트는 필터를 gen-072 대상(`vision/memory/`, `environment/summary.md`)으로 좁히고 **주석에 예외 사유 + 해결 시 제거할 것**을 명시. 그 예외 제거가 해결 확인 지표가 된다

### 2. migration e2e 의 버전 하드코딩 — 본 세대에서 수정

`tests/e2e/update-migration.test.ts` 가 `expect(...).toBe("0.17.1")` 로 패키지 버전을 하드코딩하고 있어 0.17.2 bump 로 **4건이 일제히 실패**했다.

버전 bump 는 본 세대의 필수 작업(T010)이고 이 테스트는 그것에 직접 의존하므로, genome § "인과로 묶인 검증 동작 fix" 기준에 따라 본 세대에서 처리했다. 회피(assertion 값만 0.17.2 로 교체)하면 **다음 릴리즈에서 같은 실패가 반복**되므로 근본 수정을 택했다:

```ts
const PKG_VERSION: string = JSON.parse(
  await readFile(join(import.meta.dir, "../../package.json"), "utf-8"),
).version;
```

단, v0.17.1 note 자체의 존재/내용을 검증하는 2건(`versions).toContain("0.17.1")` 등)은 **의도적으로 하드코딩 유지** — 그 케이스의 대상은 "현재 릴리즈"가 아니라 "v0.17.1 이라는 특정 note" 이기 때문이다.

## Architecture Decisions

### 텍스트를 창작하지 않고 `reap-guide.md` 를 기준으로 복제

세 carrier(guide / evolution 템플릿 / reflect prompt)가 같은 규칙을 담는다. 각자 다르게 표현하면 **이번 이슈와 동일한 drift 가 재발**한다. 따라서 이미 v0.17.1 에서 갱신된 `src/templates/reap-guide.md` § Memory 의 영어 서술을 기준으로 삼고 나머지 둘을 그에 맞췄다.

부수 효과로 `~/.reap/reap-guide.md` 와 `src/templates/reap-guide.md` 는 이미 동일(diff 0)하여 본 세대에서 손댈 필요가 없었다.

### 기존 assertion 문자열 보존

`"mandatory"` / `"Do NOT write"` 를 새 prompt 에서도 유지했다. 테스트 수정을 줄이려는 편의가 아니라, 두 문구가 새 정책에서도 그대로 유효한 의미를 갖기 때문이다(shortterm 은 여전히 매 generation 의무, 금지 목록도 여전히 필요). 의미가 달라졌다면 문구를 바꾸고 테스트를 고치는 쪽이 옳았을 것이다.

### warning-only 를 구조로 보장

`checkIntegrity`(진단)와 `fixProject`(자동 수정)가 **별개 함수**라는 점을 이용해, 크기 검사를 전자에만 추가하고 후자를 건드리지 않았다. 플래그나 조건 분기로 "auto-fix 하지 않기"를 구현하면 나중에 누가 실수로 뒤집을 수 있지만, 애초에 그 코드 경로에 없으면 뒤집힐 여지가 없다.

e2e negative test(T014 4번째 case)는 이 불변을 고정한다 — 41 KB longterm 을 가진 사용자가 `reap fix` 한 번으로 수십 generation 분 기록을 잃는 시나리오를 영구 차단.

### migration note 를 2분기가 아닌 3분기로

"원본과 일치 / 불일치" 2분기로 설계하면 **이미 올바른 프로젝트가 매번 confirm 을 받는다**. 본 repo 자신이 그 케이스이므로 즉시 드러났을 문제다. Branch B(이미 신규 형식 → no-op)를 명시적으로 두어, 선반영한 프로젝트와 손대지 않은 프로젝트를 구분한다.

### baseline 텍스트를 note 안에 인라인

Branch A 판정("원본과 정확히 일치")은 대조 대상이 없으면 불가능하다. note 본문에 v0.17.0/v0.17.1 시점의 § Memory + § Memory Update Criteria 전문을 `<details>` 블록으로 실었다.

영어 1종으로 충분하다 — `initCommon`(`init/common.ts:79-80`)이 프로젝트 언어와 무관하게 영어 템플릿을 복사하기 때문. 한국어로 번역해 쓰는 사용자는 자연히 Branch C(confirm)로 가며, 이는 의도한 동작이다.

## Deferred Items

- **Scope C (dog-fooding 대응표에 prompt 코드 추가)** — `.reap/genome/application.md` § Dog-fooding 확장. genome 수정이므로 **adapt phase 가 정위치**. 본 이슈의 근본 원인에 대한 대책이라 반드시 수행할 것
- **`RELEASE_NOTES.md` / `docs/` 갱신** — 다음 generation 의 `release-직전-문서-버전-일치-검증-reapcc-문서-갱신` backlog 담당. 본 세대에서 손대면 그 backlog 와 충돌
- **genome threshold 문제** — 위 Discovered Issues 1. backlog 등록 완료
