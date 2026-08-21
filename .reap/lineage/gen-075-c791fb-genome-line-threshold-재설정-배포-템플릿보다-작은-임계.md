---
id: gen-075-c791fb
type: embryo
goal: "genome line threshold 재설정 — 배포 템플릿보다 작은 임계로 인한 신규 init 즉시 warning 해소"
parents: ["gen-074-72bf54"]
---
# gen-075-c791fb
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