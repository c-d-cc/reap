# Validation Report

## Result

**pass**

모든 검증을 fresh 실행했다. implementation 단계의 결과를 재사용하지 않고 재실행했다.

## Checks

### 빌드/타입

| 항목 | 명령 | 결과 |
|---|---|---|
| TypeCheck | `npm run typecheck` | **pass** (출력 없음) |
| Build (CLI) | `npm run build` | **pass** — `dist/cli/index.js` 0.77 MB |
| Build (docs) | `cd docs && npx vite build` | **pass** — 2.76s. TS 객체 배열 수정 후 구문 오류 없음 |
| 문서 검증 | `bash scripts/check-docs-version.sh` | **pass** — "All document checks passed for v0.17.2" |

### 테스트

| 스위트 | baseline | 현재 | 판정 |
|---|---|---|---|
| unit | 454 / 0 | **454 / 0** | pass |
| e2e | 263 / 1 | **263 / 1** | pass — 동일 pre-existing (`init-repair`) |
| scenario | 35 / 5 | **35 / 5** | pass — 동일 pre-existing (backlog 등록됨) |

본 세대는 소스 코드를 바꾸지 않았다(문서 · 스크립트 · workflow · skill 만). 테스트 수치가 gen-072 baseline 과 정확히 일치하는 것이 예상된 결과이며, 실제로 일치한다.

gen-072 가 environment 에 baseline 을 기록해둔 덕분에 이번에는 `git stash` 없이 즉시 판단할 수 있었다 — 그 조치의 효과가 한 세대 만에 확인됐다.

### 완료 기준 (02-planning.md)

| # | 기준 | 결과 |
|---|---|---|
| 1 | 스크립트 fail → pass 양방향 | **pass** — 수정 전 8건 fail(로케일 최신 5 + 집합 불일치 3), 수정 후 전건 통과 |
| 2 | 로케일 되돌림 시 집합 불일치 감지 | **pass** — ja 에서 0.16.5 제거 → `FAIL ja.ts differs from en.ts / missing: 0.16.5`, 복원 후 재통과 |
| 3 | 5 로케일 최신 0.17.2 + 항목 수 동일 | **pass** — 전부 20 항목 |
| 4 | 5 로케일에서 Lifespan 축 제거 | **pass** — memoryHeaders/memoryRows 에 lifespan 계열 단어 매치 0 (`Lifespan`/`수명`/`寿命`/`Lebensdauer`/`生命周期`) |
| 5 | RELEASE_NOTES 승격 | **pass** — What's New = 0.17.2 내용, `## v0.17.1` 아카이브 생성 |
| 6 | docs 빌드 + 루트 빌드/타입체크 + 회귀 없음 | **pass** — 위 두 표 |
| 7 | release.yml 이 publish 전 검증 | **pass** — `npm ci` → **검증** → `npm run build` → `npm publish` 순서 확인 |

### 검사 항목별 동작 확인 (스크립트 자체 검증)

스크립트가 "통과만 하는" 무력한 검사가 아님을 확인했다:

| 검사 | 실증 |
|---|---|
| 3. 로케일별 최신 버전 | 수정 전 5건 fail → 수정 후 통과 |
| 4. 로케일 집합 동일성 | 수정 전 3건 fail(0.16.5 누락) + negative test 로 재확인 |
| 1. NOTICE 버전 | gen-072 가 이미 갱신해둬 처음부터 통과 |
| 2. NOTES 승격 | 승격 전 상태에서도 통과했음 — 아래 Issues 2 참조 |
| 5. migration note 상한 | v0.17.2 <= v0.17.2 로 통과 |

## Edge Cases

- **`What's New` 에 버전 번호가 없음**: 직접 비교가 불가능해 "직전 버전이 아카이브로 승격됐는가"로 간접 검증하도록 설계. 최상단 아카이브 헤더가 현재 버전과 같으면 What's New 미갱신으로 판정
- **로케일 파일이 늘어날 경우**: `LOCALES` 배열에 추가하면 되며, 집합 비교는 en 을 기준으로 하므로 자동으로 새 로케일도 검사 대상이 된다
- **migration note 가 없는 프로젝트**: `ls` 결과가 비면 "no migration notes" 로 통과 (본 repo 에는 2개 존재)

## Issues

### 1. backlog 사실 오류 (implementation 에서 정정, 여기 재기록)

backlog 는 "RELEASE_NOTES.md 최신 = 0.17.0 ❌" 로 적었으나 실제로는 `## What's New` 에 v0.17.1 내용이 정상적으로 있었다. `grep -n "^## "` 로 헤더만 보고 판단한 오류다. 실제 필요 작업은 "추가"가 아니라 "승격"이었고, 그에 맞게 수행했다.

### 2. 검사 2(NOTES 승격)는 이번 케이스를 잡지 못했을 것 — 한계 명시

승격 전 상태에서도 검사 2가 통과했다. 당시 최상단 아카이브가 `## v0.17.0`(현재 버전 0.17.2 와 다름)이었고 What's New 에 항목이 2개 있었기 때문이다.

즉 이 검사는 **"현재 버전이 아카이브에 잘못 들어간 경우"** 는 잡지만, **"직전 버전 승격을 건너뛴 경우"** 는 잡지 못한다. 후자를 잡으려면 "최상단 아카이브 == 직전 버전"을 엄격히 요구해야 하는데, 그러려면 스크립트가 직전 버전을 알아야 한다(git tag 조회 등) — 릴리즈 흐름에 따라 태그 시점이 달라 오탐 위험이 있다.

**현 설계는 의도적 타협**이다. 완전한 검증이 아님을 여기 명시하고, 필요해지면 git tag 기반으로 강화한다. 다른 4개 검사는 이번 실제 결함 8건을 모두 잡았다.

### 3. scenario 5건 — pre-existing 유지

gen-072 에서 원인 규명 후 backlog 등록 완료(`scenario-multi-generation-...`). 본 세대는 소스 미변경이므로 영향 없음.

## Notes

`config.evaluator: true` 로 validation prompt 에 evaluator 절이 포함됐으나, 본 세대는 부모 에이전트가 직접 검증했다. advisor 모델이므로 미호출 시 통상 진행이 허용된다.
