# Validation Report

## Result

**pass**

모든 검증을 fresh 실행했다. 이전 실행 결과를 재사용하지 않았고, `git stash` 복원 후에도 재확인했다.

## Checks

### 빌드/타입

| 항목 | 명령 | 결과 |
|---|---|---|
| TypeCheck | `npm run typecheck` | **pass** (오류 0) |
| Build | `npm run build` | **pass** — `dist/cli/index.js` 0.77 MB |

### 테스트

| 스위트 | baseline (gen-071) | 현재 | 판정 |
|---|---|---|---|
| unit | 445 pass / 0 fail | **454 pass / 0 fail** | pass — 신규 9 (integrity-memory-size) |
| e2e | 249 pass / 1 fail | **263 pass / 1 fail** | pass — 신규 14, 실패는 동일 pre-existing |
| scenario | (baseline 미기록) | 35 pass / 5 fail | **pre-existing 확인** — 아래 Issues 참조 |

e2e 신규 14건 내역: `completion-reflect` +4, `fix-memory-warning` +5, `update-migration` +5.

### 완료 기준 (02-planning.md)

| # | 기준 | 결과 |
|---|---|---|
| 1 | `grep -rn "prun" src/cli/ src/templates/evolution.md` 매치 | **pass** — `completion.ts`, `evolution.md` (이전 0건) |
| 2 | reflect prompt 에 replace/delete/dedup + environment superseded | **pass** — `completion-reflect.test.ts` 4 case 로 고정 |
| 3 | 신규 `reap init` genome 이 content-type | **pass** — 임시 프로젝트 생성 후 마커 5개 확인 |
| 4 | v0.17.2 note detection + `--mark-migrated` 후 미노출 | **pass** — `update-migration.test.ts` 5 case + 본 repo 실측 |
| 5 | `fix --check` warning / `reap fix` 미변경 | **pass** — `fix-memory-warning.test.ts` 5 case (byte-identical 포함) |
| 6 | typecheck + 회귀 없음 | **pass** — 위 표 |
| 7 | migration note 3분기 + baseline 전문 포함 | **pass** — 본 repo 가 **Branch B(no-op)** 로 판정됨 |

### 기준 7 — dog-fooding 실측

```
$ reap update
lastMigratedVersion: 0.17.1 | packageVersion: 0.17.2
pendingMigrations: ["0.17.2"]
```

v0.17.2 note 만 노출되고 v0.17.1 은 재노출되지 않는다. `.reap/genome/evolution.md` 는 이미 신규 형식(마커 3개)이므로 Branch B 에 해당 — **confirm 없이 통과**가 설계된 동작이며 그대로 확인됐다.

2분기 설계였다면 본 repo 가 즉시 Branch C(사용자 수정)로 오판되어 불필요한 confirm 을 띄웠을 것이다.

## Edge Cases

- **경계값**: 임계값과 정확히 같은 줄 수는 warning 을 내지 않는다(`>` 비교). unit test 로 고정
- **파일 부재**: memory tier 가 없어도 크기 warning 을 내지 않는다. 빈/부재 memory 는 유효한 상태이며, missing 은 `checkRequiredFiles` 가 담당하는 별개 관심사
- **auto-fix 경로**: `reap fix` 는 memory 파일이 **없을 때만 생성**(`fix.ts:156`)하고 기존 내용을 읽지도 쓰지도 않는다. 120/150/140/400줄 파일로 실행 후 byte-identical 확인

## Issues

### 1. scenario multi-generation 5건 실패 — pre-existing (backlog 등록)

원인은 gen-065 의 backlog gate. `run start` 가 pending backlog 존재 시 `status: "prompt"` 를 반환하는데 테스트가 `"ok"` 를 기대한다(`multi-generation.test.ts:78-79`). 나머지 4건은 gen2 미생성으로 인한 연쇄 실패.

**gen-072 무관함 확인 절차**: 변경 파일 목록(`completion.ts` / `integrity.ts` / `evolution.md` / `migration/v0.17.2.md` / `package.json` / `RELEASE_NOTICE.md` / 테스트 3개)과 실패 원인(backlog gate)을 먼저 대조해 인과 없음을 판단한 뒤, `git stash` 로 확증했다 — stash 상태에서도 동일하게 5 fail. 복원 후 unit 454-0 / 신규 e2e 25-0 재확인.

→ backlog `scenario-multi-generation-5건-실패-gen-065-backlog-gate-도입-후-테스트-미갱신.md`

**부수 발견**: `environment/summary.md` § Tests 가 scenario baseline 을 기록하지 않아, 이 실패가 pre-existing 인지 신규 회귀인지 판단할 근거가 없었다. 위 backlog 의 S2 로 포함했고, 본 세대 reflect 에서 scenario 수치를 추가한다.

### 2. genome line threshold(100) < 배포 템플릿(175줄) — pre-existing (backlog 등록)

`reap init` 직후 첫 `fix --check` 에서 사용자가 아무 잘못 없이 genome warning 을 받는다. 템플릿이 146줄이던 시점부터 이미 초과였으며 gen-072 가 +29줄로 악화시켰을 뿐 원인은 아니다.

→ backlog `genome-line-threshold100-가-배포-템플릿evolutionmd-175줄보다-작아-신규-init-이-즉시-warning.md`

### 3. migration e2e 버전 하드코딩 — 본 세대에서 근본 수정

0.17.2 bump 로 4건이 실패했다. assertion 값만 바꾸면 다음 릴리즈에 같은 실패가 반복되므로 `package.json` 에서 읽도록 수정. genome § "인과로 묶인 검증 동작 fix" 적용 — 버전 bump 는 본 세대 필수 작업이고 이 테스트가 그것에 직접 의존한다.

v0.17.1 note 자체를 검증하는 2건은 대상이 "특정 note" 이므로 하드코딩을 의도적으로 유지했다.

## Notes

프로젝트에 `config.evaluator: true` 가 설정되어 validation prompt 에 evaluator 절이 포함됐으나, 본 세대는 부모 에이전트가 직접 검증을 수행했다. evaluator subagent 미호출 — genome 상 advisor 모델이므로 호출 실패/미호출 시 통상 진행이 허용된다.
