---
id: gen-072-66bfbb
type: embryo
goal: "resolve #21: v0.17.1 pruning policy를 reflect prompt + evolution 템플릿 + migration note 에 동기화 (0.17.2)"
parents: ["gen-071-c9cdd9"]
---
# gen-072-66bfbb
**Goal**: GitHub issue #21 해결 — v0.17.1 이 도입한 content-type memory 분류 + reflect pruning 정책을 규칙의 모든 carrier 에 동기화하고, 이미 구버전 텍스트를 받아간 기존 프로젝트까지 도달시킨다. 버전 0.17.2.

**결과**: 완전 구현. Scope A(규칙 동기화) / B(크기 검사) / D(migration note) 모두 완료. Scope C 는 adapt phase 대상.

**핵심 변경**:
- `src/cli/commands/run/completion.ts` — reflect prompt step 2/3 재작성. content-type 분류 + 4단계 decision tree + tier 별 prune 지시 + environment superseded 제거
- `src/templates/evolution.md` — § Memory / § Memory Classification Decision Tree(신설) / § Memory Update Criteria / § Environment Refresh 갱신
- `src/templates/migration/v0.17.2.md` (신규) — 기존 프로젝트 genome 도달 채널. 3분기 판정 + 대조용 baseline 전문
- `src/core/integrity.ts` — `MEMORY_LINE_WARNING_THRESHOLDS`(50/70/60) + `ENV_SUMMARY_LINE_WARNING_THRESHOLD`(250) + `checkMemorySize` (warnings only)
- `package.json` 0.17.2 / `RELEASE_NOTICE.md` v0.17.2 (en/ko)

**테스트**: typecheck pass / build 0.77MB / unit 454-0 (+9) / e2e 263-1 (+14, pre-existing 1건 유지) / scenario 35-5 (pre-existing, backlog 등록)