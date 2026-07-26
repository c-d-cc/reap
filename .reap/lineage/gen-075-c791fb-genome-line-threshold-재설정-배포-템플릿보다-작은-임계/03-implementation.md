# Implementation Log

## Completed Tasks

| # | 내용 |
|---|---|
| T001 | `integrity.ts` — `GENOME_LINE_WARNING_THRESHOLDS { application: 250, evolution: 300, invariants: 50 }`. 각 수치의 도출 근거를 주석에 명시 |
| T002 | `checkGenome` 이 파일별 임계 사용 (`genomeFiles` 항목에 `threshold` 추가, 메시지도 해당 값 표시) |
| T003 | `tests/unit/integrity-genome-size.test.ts` 신규 7 case |
| T004 | `tests/unit/integrity.test.ts` — genome 크기 케이스 **없음 확인**. 수정 불필요 |
| T005 | `tests/e2e/fix-memory-warning.test.ts` — gen-072 가 남긴 genome 예외 필터·주석 **제거**. 이제 무필터로 통과 |
| T006 | `src/templates/reap-guide.md` — § File Size Guidelines 신설 (7개 파일 표 + 근거 + warning-only 원칙) |
| T007 | `.reap/reap-guide.md` + `~/.reap/reap-guide.md` 동기화 |
| T008 | docs 5 로케일 — `summary.md ~100 lines` → `~250` (코드값 일치) |
| T009 | `reap init` 직후 `fix --check` → 크기 warning **0건** 실측 |
| T010 | typecheck 0 error / CLI build / docs vite build / `check-docs-version.sh` pass |
| T011 | unit **461-0** (+7) / e2e 263-1 (pre-existing) / scenario 44-0 |

## Verification Results

| 기준 | 결과 |
|---|---|
| 1. init 직후 genome warning 0건 | **pass** — 임시 프로젝트 실측 |
| 2. 비대한 genome 은 여전히 감지 | **pass** — 400/300/80줄 각각 warning 발생 (T003) |
| 3. 세 threshold 근거가 코드 주석에 | **pass** — 파일별 역할에서 도출한 근거 명시 |
| 4. `reap-guide.md` 문서화 | **pass** — § File Size Guidelines. memory 기준과 동일 대우 |
| 5. docs 의 summary 표기가 코드값과 일치 | **pass** — 5 로케일 `~250` |
| 6. gen-072 예외 제거 후 통과 | **pass** — 해결 확인 지표 충족 |
| 7. 회귀 없음 | **pass** |

### 본 repo 실측 (새 임계 대비)

| 파일 | 크기 | 임계 | 여유 |
|---|---|---|---|
| `application.md` | 205 | 250 | 45 |
| `evolution.md` | 270 | 300 | 30 |
| `invariants.md` | 7 | 50 | 43 |

`fix --check` 크기 warning 0건. **evolution.md 의 여유가 30줄로 가장 좁다** — gen-072/073 이 규칙을 추가한 결과이며, 다음에 규칙을 더할 때는 기존 규칙과 중복되지 않는지 먼저 확인해야 한다는 신호로 읽어야 한다.

## Architecture Decisions

### 단일 상수(A안)가 아니라 파일별(D안)

세 파일은 담는 것이 다르다. `invariants.md` 는 배포 7줄이고 길어지는 것 자체가 문제 신호인 반면, `evolution.md` 는 배포 193줄이고 프로젝트가 규칙을 더하는 것이 정상이다. 하나의 숫자로 둘 다 재는 것은 애초에 맞지 않았다.

gen-072 의 `MEMORY_LINE_WARNING_THRESHOLDS` 와 같은 형태라 코드 일관성도 유지된다.

### C안(배포 템플릿 대비 측정)을 택하지 않은 이유

"사용자가 얼마나 더했는가"가 의미론적으로는 가장 정확하다. 그러나 integrity check 가 `dist/templates/` 를 런타임에 읽어야 하고 경로 분기(dist/dev)와 파일 부재 처리가 붙는다.

**진단 도구는 단순해야 한다 — 자기가 고장나면 진단을 못 한다.** 상수 + 명시된 근거로 충분하다고 판단했다.

### 수치의 근거를 코드와 guide 양쪽에 남겼다

이번 문제의 본질은 "100 이 너무 작다"가 아니라 **"100 의 근거가 어디에도 없다"** 였다. 근거 없는 수치는 맞는지 틀린지 판단할 수 없고, 실제로 배포 템플릿보다 작다는 명백한 모순이 오래 방치됐다.

따라서 새 수치는 각각 "그 파일이 무엇을 담는가"에서 도출하고, 그 도출 과정을 코드 주석과 `reap-guide.md` 표에 적었다. 다음 사람이 수치를 바꿀 때 근거를 대조할 수 있다.

### "경고를 없애려 올린 것"과 구분

의심을 살 수 있는 변경이므로 정당성을 명확히 한다: threshold 100 은 REAP 이 배포하는 evolution.md(193줄)보다 작아 **어떤 프로젝트도 만족할 수 없는 기준**이었다. gen-072 이전(146줄)에도 이미 초과였다. 검사가 상시 red 이면 신호 가치가 0이므로 재설정이 필요했다.

동시에 검사가 무력해지지 않았음을 T003 의 3개 case(400/300/80줄)로 고정했다.

## Discovered Issues

### docs↔코드 불일치 — 본 세대에서 함께 수정

`docs/src/i18n/translations/*.ts` 가 `summary.md ~100 lines` 로 안내하는데 gen-072 가 코드에 250 을 넣었다. 본 repo 실제 파일은 212줄로, **문서를 믿으면 불필요하게 압축하고 코드를 믿으면 문서가 틀린** 상태였다.

크기 기준을 다루는 본 세대와 같은 축이고 수정 범위가 작아(5 로케일 각 2곳) genome § "인과로 묶인 fix" 기준에 따라 함께 처리했다.

**gen-073 이 genome 에 넣은 carrier 4중 확인의 실효 사례**다 — docs 를 carrier 로 인식하지 않았다면 이 불일치는 계속 남았을 것이다.

## Deferred Items

없음. Open Decisions 3건(A/B/C/D 선택, 문서화 위치, application.md 초과 여부)은 모두 본 세대에서 해소했다.
