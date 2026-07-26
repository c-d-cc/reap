# Completion

## Summary

**Goal**: genome 크기 warning 을 파일별 threshold 로 재설계하고, 각 수치에 근거를 붙여 코드와 문서 양쪽에 남긴다.

**결과**: 완료. `reap init` 직후 크기 warning 0건, 비대한 genome 은 여전히 감지.

**핵심 변경**:
- `src/core/integrity.ts` — `GENOME_LINE_WARNING_THRESHOLDS { application: 250, evolution: 300, invariants: 50 }` + 각 수치의 도출 근거 주석
- `src/templates/reap-guide.md` (+ `.reap/`, `~/.reap/`) — § File Size Guidelines 신설. 7개 파일 표 + warning-only 원칙
- `docs/*.ts` 5 로케일 — `summary.md ~100 lines` → `~250` (코드값과 불일치 해소)
- `tests/unit/integrity-genome-size.test.ts` 신규 7 case
- `tests/e2e/fix-memory-warning.test.ts` — gen-072 가 남긴 genome 예외 제거

**0.17.2 릴리즈 노트 보강** (본 세대가 0.17.2 마지막 작업이므로): `RELEASE_NOTICE.md` en/ko, `RELEASE_NOTES.md` What's New, docs changelog 5 로케일에 gen-073/074/075 내용 추가.

**검증**: typecheck 0 / CLI+docs build / 문서 게이트 pass / unit **461-0**(+7) / e2e 263-1(pre-existing) / scenario 44-0

## Lessons Learned

### 잘 된 것 — 문제를 "수치가 작다"가 아니라 "근거가 없다"로 정의했다

threshold 100 을 그냥 올렸다면 "왜 300인가"라는 같은 질문이 남는다. 실제 문제는 **100 의 근거가 코드에도 문서에도 없었다**는 것이고, 그래서 배포 템플릿보다 작다는 명백한 모순이 오래 방치됐다.

새 수치는 각각 "그 파일이 무엇을 담는가"에서 도출했다 — invariants 는 길어지는 것 자체가 신호(50), evolution 은 규칙이 쌓이는 게 정상(배포 193 + 여유 100), application 은 프로젝트 규모에 비례(250). 도출 과정을 코드 주석과 guide 표에 남겨 다음 사람이 대조할 수 있게 했다.

### 잘 된 것 — 임계를 올렸으므로 무력화되지 않았음을 명시적으로 확인했다

"경고를 없애려 기준을 낮췄다"는 의심을 살 수 있는 변경이다. 그래서 검사가 여전히 작동함을 3개 case(400/300/80줄)로 고정하고, 경계값·독립성·비변경까지 검증했다.

Goodhart 회피와 같은 맥락이다 — 지표를 바꿀 때는 그 지표가 여전히 무엇을 측정하는지 확인해야 한다.

### 잘 된 것 — gen-072 가 남긴 해결 지표가 작동했다

gen-072 는 e2e 대조군 테스트의 필터를 좁히면서 **"해결 시 이 예외를 제거할 것"** 을 주석에 남겼다. 본 세대에서 그 예외를 제거하고 통과시킨 것이 곧 해결 확인이 됐다.

**임시 우회를 넣을 때 해제 조건을 함께 적으면, 그것이 다음 세대의 완료 판정 기준이 된다.**

### 잘 된 것 — carrier 4중 확인이 실제로 불일치를 잡았다

gen-073 이 genome 에 docs 사이트를 4번째 carrier 로 추가했다. 그 덕에 이번에 `summary.md ~100 lines` 라는 docs↔코드 불일치를 발견했다 — 코드는 250, 문서는 100, 실제 파일은 212줄이었다.

carrier 목록에 docs 가 없었다면 코드만 고치고 넘어갔을 것이고, 사용자는 계속 100줄로 압축하려 했을 것이다.

### 개선점 — pre-existing 을 4세대째 넘기고 있다

e2e `init-repair` 1건이 gen-072/073/074/075 연속으로 "pre-existing" 처리됐다. gen-074 에서 "3세대째, 반복되면 부채"라고 적었고 이번이 4세대째다.

scenario 5건도 정확히 같은 경로를 밟다가 gen-074 에서 고쳤다. **판단 비용은 baseline 기록으로 낮아졌지만 판단 자체는 매번 해야 하고, 무엇보다 그 테스트가 무엇을 지키려 했는지 아무도 모르는 상태로 시간이 간다.**

### 개선점 — evolution.md 여유가 30줄로 좁다

본 repo `genome/evolution.md` 는 270줄, 임계 300. gen-072/073 이 규칙을 추가한 결과다.

이것은 임계를 다시 올릴 신호가 아니라 **다음에 규칙을 추가할 때 기존 규칙과 중복되지 않는지 먼저 확인하라는 신호**로 읽어야 한다. gen-072/073 에서 longterm pruning 으로 genome 중복 9건을 삭제한 것과 같은 작업이 evolution.md 자체에도 필요해질 수 있다.

## Next Generation Hints

1. **0.17.2 릴리즈** — 문서·노트 모두 정합. `git tag v0.17.2 && git push origin main v0.17.2` (**유저 확인 필수**). 이후 issue #21 코멘트 + close
2. **e2e `init-repair` 1 fail** — 4세대째. backlog 화 권장
3. **interview 기능** (backlog, 0.18.0) — 3건 orchestrate 의 마지막. gen-073 교훈 적용: "지시를 자세히 쓰는" 접근이 아니라 "빈칸이 남았는지 검사하는" 접근
4. **evolution.md 중복 점검** — 여유 30줄. 규칙 추가 전 기존과 중복 확인
5. daemon 2건은 유저 보류

## Change Proposals

### genome 변경 없음

본 세대의 교훈은 기존 원칙의 적용 사례다:
- "근거 있는 수치" — gen-072 completion 에서 이미 지적, 본 세대가 실행
- "검사가 무력해지지 않았는지 확인" — evolution.md § "검사를 만들 때 — 먼저 실패시켜라"(gen-073)의 연장
- "carrier 4중 확인" — gen-073 이 추가한 것이 작동한 사례

**새로 명문화할 것이 없다.** evolution.md 여유가 30줄인 상황에서 중복 규칙을 더하는 것은 특히 피해야 한다.

### 신규 backlog 없음

발견한 docs↔코드 불일치는 본 세대에서 처리했다.
