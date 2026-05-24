# Completion

## Summary

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

## Lessons Learned

### 잘된 점

- **명확한 source backlog 덕분에 자율 진행 가능**: 13개 verification 기준이 backlog에 정리되어 있어 implementation 중 사용자 확인 없이도 결정 트리가 명확. clarity-driven 원칙이 잘 작동.
- **abort 패턴 차용**으로 transition graph 우회를 합법화: `verifyTransition`을 호출하지 않는 종료 path 패턴이 이미 abort에 있었기에 early-close 도 동일 패턴으로 자연스럽게 구성. 새 transition graph 추가 없이 stage 가드만으로 안전성 확보.
- **archive helper 분리 vs 옵션 확장 선택**: `writeArchive` private helper로 두 path 가 깔끔하게 공통화. 외부 호출 시그니처 무변경 → 회귀 위험 최소화.

### 발견/개선

- **bun:test default timeout 5초 vs daemon triggerIndexing 누적**: e2e setup에서 여러 CLI 호출이 쌓이면 daemon health check + spawn 시도가 누적되어 5초를 초과. 본 generation에서 setup test 에 `30000ms` 명시로 해결했지만, 향후 e2e 테스트 작성 시 daemon-heavy 시나리오는 timeout 명시가 사실상 필수가 될 수 있음. 또는 테스트 환경에서 daemon 호출을 disable 하는 옵션이 있으면 좋을 듯 (out of scope, backlog 후보).
- **deferred task 추출 정규식의 한계**: 03-implementation.md에서 task 표기 형식이 자유로움. 본 generation의 implementation artifact는 `### T001` heading 기반이라 `- [ ]` 라인이 없어 자동 추출 결과 0건. early-close 가 작성자에게 task 표기 일관성을 암묵적으로 요구하게 됨. → 향후 planning template/implementation template 에 task 표기 가이드 강화 검토 가능.
- **commit message `[early-close]` 태그**: planning 단계에서 자체 결정. fitness에서 사용자 확인 받을 항목.

## Next Generation Hints

### 직접 follow-up (early-close 관련)

- 실제 early-close 사용 시 사용자 경험 관찰: reflect interactive prompt 가 충분한지, 자동 추출이 의미 있는 task 수를 잡아내는지.
- deferred backlog 본문이 다음 generation의 source backlog로 자연스럽게 동작하는지 (start.ts hint를 통한 흐름).
- merge generation에서의 early-close 지원 검토 (현재 out of scope).

### 인접 영역

- **init-repair pre-existing failure 해결** — `tests/e2e/init-repair.test.ts > skips when REAP section already present`. shortterm memory에 미해결로 기록된 상태. 본 generation에서 손대지 않음.
- **Evaluator agent 코드 통합** (longstanding) — `prompt.ts` + `completion.ts`에 evaluator context 빌더 + 호출 로직 통합 미진행. midterm memory 참조.
- **API 레벨 incremental indexing** — daemon Phase 미진행.
- **getIndexManager 의 존재하지 않는 project ID 처리** — gen-060에서 발견된 리소스 누수 가능성. 미해결.
- **테스트 환경에서 daemon 호출 disable 옵션** — e2e 테스트 timeout 문제의 근본 해결. (본 generation에서 발견, 자율 추가 금지 — 사용자 결정 후 backlog 등록 권장.)

## Change Proposals

### Genome 변경 제안 — 없음 (adapt 단계에서 다시 검토)

본 generation은 lifecycle 추가 작업으로 application.md/evolution.md 의 원칙 변경 없이 진행. genome 변경 backlog 없음.

### Environment 변경

`environment/summary.md` 의 다음 섹션 업데이트 필요 (reflect 에서 직접 반영):
- Source Structure → `src/cli/commands/run/early-close.ts` 추가 (handler 22 → 23개).
- Source Structure → core 모듈 설명 갱신 (archive.ts 에 archiveEarlyClose 추가, backlog.ts 에 createDeferredBacklog 등 추가, lineage.ts 에 getLastLineageEntry 추가).
- Source Structure → adapter skills (.md) 카운트 19 → 20개.
- Source Structure → Tests 섹션에 `tests/unit/early-close.test.ts`, `tests/e2e/early-close.test.ts` 추가.

### Backlog (in-scope)

- 미생성. 본 generation 작업은 early-close 도입으로 완결. 다음 generation 후보는 hints 에 기술.

## Project Diagnosis

- **Core functionality**: lifecycle/nonce/archive/backlog/lineage 모두 정상 동작. early-close 추가로 종료 path 가 3가지(completion/early-close/abort) 로 명확해짐.
- **Architecture stability**: transition graph + nonce 시스템은 gen-040+ 부터 안정. early-close 는 abort 패턴 차용으로 graph 변경 없이 통합되어 회귀 위험 낮음.
- **Modularity**: `writeArchive` private helper 추출로 두 archive path 공통화. core/cli 분리 잘 유지됨. `extractUncheckedTasks` 등 backlog 헬퍼도 단일 책임.
- **Error handling**: stage 가드, isReapInitialized, archive 충돌 검사, transition guard 모두 일관된 에러 메시지. 개선 여지 보다는 유지가 적절한 수준.
- **Test coverage**: unit 362 + e2e 169 (early-close 신규 40 포함). early-close 모든 경로(stage gate, 자동 추출, --defer-tasks, 멱등성) 커버.
- **Documentation**: reap-guide.md "Termination Paths" 절 + claude-md-section.md 미니 절 추가. slash command help 4개 언어 동기화.
- **Security**: 변경 없음. nonce 시스템 그대로 사용.
- **Performance**: early-close 는 lightweight path 로 archive/lineage 한 번씩만 기록. 성능 영향 없음.
- **Deployment readiness**: 0.16.4 stable. early-close 는 minor feature add 로 다음 patch/minor 배포 시점에 포함 가능.
- **Code quality**: TypeScript strict, 기존 convention 일치. 신규 파일 모두 단일 책임 함수 위주.
- **User experience**: 사용자 시나리오 — abort 하기 아까운 generation 을 1-2 명령으로 정리하고 다음 세대로 자연 승계. 실사용 관찰은 다음 generation 후보.
- **Integration layer**: 해당 없음 (외부 통합 무변경).
- **Domain maturity**: lifecycle 도메인이 한 단계 성숙. 종료 path 의 의미가 사실(termination paths)로 application.md 에 명시됨.
- **Governance compliance**: invariants 위반 없음. backlog 일치 진행. echo-chamber 방지(다음 generation 후보 backlog 자동 등록 보류).
- **Genome stability**: gen-061 에서 application.md + evolution.md 에 사실/판단가이드 추가. 원칙 변경 아님 — 안정 유지.

## Adapt Phase Results

### Genome 변경 (적용 완료)

- `application.md` — Generation Lifecycle 절에 **Termination Paths** 3종(completion/early-close/abort) 사실 추가.
- `evolution.md` — "중단된 Generation 복구" 뒤에 **조기 종료(early-close) 판단** 절 추가. AI 가 언제 early-close 를 고려해야 하는지 가이드.
- `invariants.md` — 변경 없음.

### Vision 업데이트

- `vision/goals.md` — 변경 없음. early-close 는 기존 vision 의 어느 항목과도 직접 매칭되지 않음(self-hosting/distribution/evaluator/adapter 어디에도 속하지 않는 lifecycle 자체 개선). auto-suggested 매칭(self-hosting 등)은 오매칭으로 판단해 무시.

### Memory 업데이트 계획 (commit 단계에서 처리)

- `shortterm.md` — gen-061 결과(early-close 도입, 40 신규 테스트, 1건 pre-existing failure 잔존) 기록.
- `midterm.md` — 미해결 follow-up 4건 그대로 유지(init-repair, evaluator 통합, daemon test disable, early-close 실사용 관찰) — 사용자가 즉시 backlog 등록은 보류 결정.
- `longterm.md` — 변경 없음 (원칙 변경 아님).

### 다음 Generation 후보 (Human Review)

backlog 자동 등록 금지(Adapt phase). 다음 후보들은 사용자가 별도 판단 후 backlog 화:
1. **init-repair pre-existing failure 해결** — `tests/e2e/init-repair.test.ts > skips when REAP section already present`. gen-060 부터 알려진 회귀.
2. **Evaluator agent 코드 통합** — `prompt.ts` + `completion.ts` 에 evaluator context 빌더 + 호출 로직. midterm memory 미해결.
3. **테스트 환경 daemon disable 옵션** — e2e timeout 문제 근본 해결.
4. **early-close 실사용 관찰** — 실 사용 사례 1-2건 누적 후 UX/추출 정확도 검토.

(사용자 결정: 위 4건은 즉시 backlog 등록 안 함. 향후 별도 판단 시 등록.)
