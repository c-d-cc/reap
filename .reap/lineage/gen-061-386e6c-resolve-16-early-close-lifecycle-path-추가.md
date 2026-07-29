---
id: gen-061-386e6c
type: normal
goal: "resolve #16: early-close lifecycle path 추가 — generation 조기 종료 + 부분 가치 보존 + 다음 세대 자연 승계"
parents: ["gen-060-e3c492"]
---
# gen-061-386e6c
`early-close` lifecycle path 도입. Issue #16 해결.

abort(취소)와 completion(정식 완료) 사이의 세 번째 lightweight 종료 path. implementation/validation 단계에서 부분 완성된 가치를 lineage 에 보존하면서 미완 task 를 자동으로 다음 세대 deferred backlog 로 승계.

### 변경 내용

신규 파일:
- `src/cli/commands/run/early-close.ts` — 2-phase (confirm → execute) 핸들러
- `src/adapters/claude-code/skills/reap.early-close.md` — slash command
- `tests/unit/early-close.test.ts` — unit tests (18)
- `tests/e2e/early-close.test.ts` — e2e tests (22)

수정 파일:
- `src/core/archive.ts` — `writeArchive` private helper 추출 + `archiveEarlyClose` 신규 + `status: completed/partial` 기록
- `src/core/backlog.ts` — `createDeferredBacklog`, `extractUncheckedTasks`, `countCheckedTasks` 신규
- `src/core/lineage.ts` — `getLastLineageEntry` 신규
- `src/cli/commands/run/index.ts` — early-close 핸들러 라우팅 + extra 직렬화
- `src/cli/commands/run/abort.ts` — confirm prompt 에 early-close 옵션 안내 추가
- `src/cli/commands/run/start.ts` — scan phase 에 previous early-close hint 추가
- `src/cli/index.ts` — `--defer-tasks <value>` 옵션 추가
- `src/cli/commands/help.ts` — `/reap.early-close` 4개 언어 description
- `src/templates/reap-guide.md`, `.reap/reap-guide.md` — "Termination Paths" 절 + slash command 항목
- `src/templates/claude-md-section.md` — Termination Paths 미니 절
- `tests/unit/archive.test.ts` — `status: completed` 검증 1건 추가

### 결과

- 7 completion criteria 모두 충족. 13 verification 항목 모두 충족.
- unit 362 pass / e2e 169 pass (신규 40+1).
- 1건 init-repair failure 는 pre-existing (gen-060 부터 알려진 이슈) — 회귀 아님.