# Validation Report

## Result

**pass**

모든 검증을 fresh 실행했다.

## Checks

### 빌드/타입/문서

| 항목 | 명령 | 결과 |
|---|---|---|
| TypeCheck | `npm run typecheck` | **pass** (error 0) |
| Build | `npm run build` | **pass** |
| 문서 정합성 | `bash scripts/check-docs-version.sh` | **pass** (v0.17.3) |

### 테스트 — 전 스위트 green

| 스위트 | baseline (gen-076) | 현재 | 판정 |
|---|---|---|---|
| unit | 470 / 0 | **470 / 0** | pass |
| e2e | 268 / **1** | **272 / 0** | **1 fail 해소** + 신규 4 |
| scenario | 44 / 0 | **44 / 0** | pass |

**gen-072 이래 처음으로 세 스위트가 모두 0 fail 이다.**

### 완료 기준 (02-planning.md)

| # | 기준 | 결과 |
|---|---|---|
| 1 | e2e 0 fail | **pass** |
| 2 | 수정 근거 기록 | **pass** — 테스트 수정 + 구현 수정 양쪽의 근거를 03 에 기록 |
| 3 | 반복 실행 무해 확인 | **pass** — 3회 실행 test |
| 4 | 비대칭 근거 주석 | **pass** — `common.ts` ↔ `integrity.ts` 상호 참조 |
| 5 | 3경로 커버 | **pass** — marker / legacy heading / 참조만 (+반복 = 4 case) |
| 6 | environment baseline | reflect 에서 |
| 7 | unit/scenario 회귀 | **pass** |

### 계획 대비 변경 — 구현 수정이 추가됨

planning 은 "테스트만 고친다"였으나 **`repair.ts` 의 구현 결함이 드러나 함께 고쳤다.**

`ensureClaudeMd` 반환값 4종 중 `"updated"` 가 `skipped` 로 분류되어, **파일을 실제로 갈아엎고도 "이미 있어서 건너뜀"으로 보고**하고 있었다. 사용자가 출력만 보고는 무슨 일이 일어났는지 알 수 없는 상태였다.

genome § "인과로 묶인 검증 동작 fix" 기준을 적용했다 — 본 세대의 목적이 "이 테스트를 통과시키는 것"인데 그 테스트가 검증하려는 동작 자체가 깨져 있었으므로, 분리하면 테스트가 잘못된 동작을 고정하게 된다.

## Edge Cases

- **marker 해시 의존 회피**: fixture 에 marker 를 하드코딩하지 않고 두 번 실행. 템플릿이 바뀌어도 테스트가 깨지지 않는다
- **반복 실행**: 참조만 있는 CLAUDE.md 에 3회 실행 — 1회 append 후 marker 가 생겨 이후는 skipped. 반복 오염 없음
- **사용자 산문 보존**: append 케이스에서 원래 문장(`"Some content with .reap/genome/ reference."`)이 남아 있는지 확인
- **`"updated"` 분류**: 이제 부정형 분기(`=== "skipped"` 만 skipped)라 `ensureClaudeMd` 반환값이 늘어도 자동으로 올바른 쪽에 들어간다

## Issues

### 세 번째 "한쪽만 갱신됨" 사례

| 이슈 | 갱신된 곳 | 빠진 곳 |
|---|---|---|
| #21 | reap-guide, migration note | reflect prompt, evolution 템플릿 |
| #22 | installer, README | integrity checker |
| **본 건** | `ensureClaudeMd` 반환 타입(`"updated"` 추가, gen-054) | **`repair.ts` 호출부 분기** |

세 번 다 "타입/값은 늘렸는데 그것을 소비하는 쪽은 그대로"다. 다음 세대(`릴리즈-자기진단-게이트-...`)의 canary token 설계에 이 사례를 반영할 것 — **반환값 union 확장**도 carrier 가 여러 곳인 사실의 한 종류다.

관련하여 03 의 Deferred Items 에 적은 대로, `ensureClaudeMd` 반환값에 exhaustive check 를 강제하는 타입 설계가 근본 예방책이나 본 세대 범위 밖이다.

## Notes

`config.evaluator: true` 이나 부모 에이전트가 직접 검증했다. advisor 모델이므로 허용된다.
