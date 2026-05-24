# Shortterm Memory

## 세션 요약 (2026-05-24)

### gen-061: early-close lifecycle path 도입 (Issue #16 해결)

abort/completion 사이의 세 번째 lightweight 종료 경로 `early-close` 도입.

- 신규: `early-close.ts` 핸들러, `reap.early-close.md` slash command, `archiveEarlyClose`, `createDeferredBacklog`, `getLastLineageEntry`, `extractUncheckedTasks`/`countCheckedTasks` helpers.
- abort confirm prompt에 early-close 선택지 안내 추가.
- start scan phase에 직전 early-close 감지 시 hint 노출 (`previousEarlyClose` context).
- dog-fooding 동기화: `reap-guide.md` + `claude-md-section.md` + `help.ts`.
- 테스트: unit 18건 + e2e 22건 추가, 모두 pass.
- 회귀: 없음. init-repair 1건 failure는 pre-existing (gen-060부터).

### 다음 세션

- **init-repair 1건 failure** 해결 (지속적 미해결).
- **Evaluator agent 코드 통합** (longstanding) — prompt.ts/completion.ts에 evaluator context 빌더 + 호출 로직 통합.
- **API 레벨 incremental indexing** (daemon Phase).
- **테스트 환경에서 daemon 호출 disable 옵션** — gen-061에서 발견된 e2e timeout 근본 원인 해결 후보. 백로그 등록 권장 (사용자 결정).
- **early-close 사용 후 follow-up 관찰** — 실제 사용 시 reflect interactive prompt와 자동 task 추출 품질 확인.

### Backlog 상태

- `early-close-lifecycle.md` (task, medium) — gen-061에서 **consumed**.
- `daemon-e2e-tests.md` (task, medium) — gen-060에서 consumed.
- `fix-migrate-update-tests.md` — gen-059 consumed.
- `strict-merge-mode-bypass-for-merge-gen.md` — gen-058 consumed.
