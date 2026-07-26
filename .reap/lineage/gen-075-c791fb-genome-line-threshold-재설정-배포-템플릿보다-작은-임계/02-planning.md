# Planning

## Goal

genome 크기 warning 을 **파일별 개별 threshold** 로 재설계하고, 각 수치에 근거를 붙여 코드와 문서 양쪽에 남긴다. 부수로 environment summary 기준의 docs↔코드 불일치를 해소한다.

완료 시: `reap init` 직후 `fix --check` 가 genome 관련 크기 warning 을 내지 않으며, 실제로 비대해진 genome 은 여전히 잡는다.

## Completion Criteria

1. `reap init` 직후 `reap fix --check` → genome 크기 warning **0건**
2. 임계를 크게 넘긴 genome 파일 → warning **발생** (검사가 무력화되지 않음)
3. 세 파일의 threshold 각각에 **근거가 코드 주석에 명시**됨
4. 크기 기준이 `reap-guide.md` 에 문서화됨 (memory 기준과 동일한 대우)
5. docs 5개 로케일의 `summary.md ~100 lines` 표기가 코드값과 일치
6. `tests/e2e/fix-memory-warning.test.ts` 의 genome 예외 주석·필터 **제거** 후에도 통과 (gen-072 가 남긴 해결 확인 지표)
7. unit/e2e/scenario 회귀 없음 (baseline: 454-0 / 263-1 / 44-0)

## Background

01-learning.md 참조. 핵심:
- `reap init` 직후 `evolution.md` 193줄 > threshold 100 → 사용자가 아무 잘못 없이 warning
- threshold 100 은 **근거가 코드에도 문서에도 없다**
- docs 는 `summary.md ~100 lines`, 코드는 250 → 불일치

## Approach

### D안 — 파일별 threshold + 근거 있는 수치

```ts
const GENOME_LINE_WARNING_THRESHOLDS = {
  application: 250,
  evolution: 300,
  invariants: 50,
} as const;
```

**근거** (각 파일이 무엇을 담는가에서 도출):

| 파일 | 배포 시점 | 임계 | 근거 |
|---|---|---|---|
| `invariants.md` | 7줄 | **50** | 인간만 수정하는 절대 제약. 길어지는 것 자체가 신호 — 제약이 50줄을 넘으면 그건 제약이 아니라 규칙 집합이고 evolution 으로 가야 한다 |
| `evolution.md` | **193줄** | **300** | AI 행동 규칙. 배포분이 이미 193이며 프로젝트가 자기 규칙을 더하는 것이 정상. 여유 ~100줄. 300 을 넘으면 규칙이 중복되었거나 environment 로 갈 내용이 섞인 것 |
| `application.md` | 16줄(뼈대) | **250** | 프로젝트 정체성·아키텍처. `genome-suggest` 가 스캔해 채우므로 프로젝트 규모에 비례. 본 repo 205줄이 대형 프로젝트의 현실적 상한 근처 |

**"경고를 없애려 올린 것"이 아님을 분명히 한다**: 100 은 배포 템플릿(193)보다 작아 REAP 스스로 만족할 수 없는 기준이었다. 재설정의 정당성은 여기 있고, 새 수치는 위 근거에서 도출한다.

### C안(기준선 대비)을 택하지 않은 이유

의미론적으로는 "사용자가 얼마나 더했는가"가 정확하다. 그러나 integrity check 가 `dist/templates/` 를 런타임에 읽어야 하고 실패 경로(파일 부재/경로 분기)가 생긴다. **진단 도구는 단순해야 한다** — 자기가 고장나면 진단을 못 한다. 상수 + 명시된 근거로 충분하다.

### 문서화 위치

- **코드 주석** — 각 수치의 근거 (필수)
- **`reap-guide.md`** — memory 기준이 문서화돼 있으므로 genome 도 같은 대우. `src/templates/reap-guide.md` + `~/.reap/reap-guide.md` 동기화
- **docs 사이트** — genome 크기 언급이 현재 없으므로 신설하지 않는다. 단 **environment summary 의 `~100 lines` 오기는 수정**(5 로케일)

gen-073 이 genome 에 넣은 carrier 4중 확인을 적용: guide O / genome 템플릿 X(행동 규칙 아님, 진단 수치) / prompt X / docs — summary 항목만 O.

## Risk Assessment

| 리스크 | 대응 |
|---|---|
| "경고 없애려 임계 올렸다"는 인상 | 근거를 코드·guide 양쪽에 명시. 100 이 근거 없었다는 사실 기록 |
| 임계를 올려 실제 비대를 놓침 | 기준 2로 negative test — 크게 넘긴 파일은 여전히 warning |
| 본 repo 가 새 임계도 초과 | 실측 확인 (application 205<250, evolution 270<300 → 통과) |
| docs 5 로케일 중 일부 누락 | `~100 lines` 문자열을 5개 파일에서 grep 으로 전수 확인 |

## Scope

**변경 대상**
- `src/core/integrity.ts` — 상수 + `checkGenome` 판정부
- `src/templates/reap-guide.md` (+ `.reap/reap-guide.md`) — 크기 기준 문서화
- `docs/src/i18n/translations/*.ts` — `summary.md ~100 lines` → 실제값 (5 로케일)
- `tests/unit/integrity.test.ts` — 기존 genome 크기 케이스
- `tests/e2e/fix-memory-warning.test.ts` — gen-072 예외 제거
- `tests/unit/integrity-genome-size.test.ts` (신규) — 파일별 판정

**out of scope**
- `src/templates/evolution.md` 축소 (B안 기각)
- genome 템플릿 / prompt (진단 수치는 행동 규칙이 아님)

## Tasks

- [ ] T001 `integrity.ts` — `GENOME_LINE_WARNING_THRESHOLDS` 도입, 근거 주석
- [ ] T002 `integrity.ts` — `checkGenome` 이 파일별 임계 사용
- [ ] T003 `tests/unit/integrity-genome-size.test.ts` 신규 — 파일별 판정 + 경계 + 비변경
- [ ] T004 `tests/unit/integrity.test.ts` — 기존 genome 크기 케이스 확인/수정
- [ ] T005 `tests/e2e/fix-memory-warning.test.ts` — genome 예외 필터·주석 제거
- [ ] T006 `src/templates/reap-guide.md` — genome/memory/environment 크기 기준 절 추가
- [ ] T007 `.reap/reap-guide.md` 동기화
- [ ] T008 `docs/*.ts` 5 로케일 — `~100 lines` 오기 수정
- [ ] T009 `reap init` 직후 warning 0건 실측
- [ ] T010 빌드 + typecheck + docs build + check-docs-version
- [ ] T011 unit/e2e/scenario 회귀 확인

## Dependencies

T001 → T002 → T003~T005
T006 → T007
T009 는 T002 이후, T010~T011 은 전부 이후
