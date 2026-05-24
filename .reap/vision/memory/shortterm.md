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
- Fitness: 사용자 만족, agent 자체 결정(commit tag 포맷, deferred 정규식) 그대로 수용. 다음 후보 4건(아래)은 즉시 backlog 등록 보류 — 사용자가 향후 별도 판단.
- Genome 업데이트(adapt 단계): `application.md` 에 Termination Paths 3종 사실 추가, `evolution.md` 에 early-close 판단 가이드 절 추가. invariants 변경 없음.
- Commit: `74641b3` (parent), tests submodule `d54d95e`. push 보류(유저 컨펌 후).

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
