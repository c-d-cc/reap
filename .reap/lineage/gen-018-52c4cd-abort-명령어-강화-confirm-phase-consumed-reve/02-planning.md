# Planning — gen-018-52c4cd

## Goal

abort 명령어를 2-phase(confirm → execute)로 강화하여, 사용자 확인, consumed backlog revert, 소스 코드 처리, 진행 상황 backlog 저장 기능을 복원한다.

## Completion Criteria

1. `reap run abort` (phase 없음) → confirm prompt 출력 (status: "prompt")
2. `reap run abort --phase execute --reason "..." --source-action none` → life/ 정리 + consumed backlog revert
3. `--save-backlog` 옵션 사용 시 `aborted-{genId}.md` backlog 파일 생성
4. `revertBacklogConsumed(backlogDir, genId)` 함수가 consumed → pending 으로 정상 revert
5. CLI에 `--source-action`, `--save-backlog` 옵션 추가
6. reap.abort.md 스킬 파일 업데이트
7. e2e 테스트 통과 (confirm, execute, backlog revert)
8. 기존 테스트 전체 통과

## Approach

### abort.ts 2-phase 설계

**confirm phase** (default, phase 없음):
- GenerationManager에서 현재 상태 조회
- `emitOutput({ status: "prompt" })` 로 사용자에게 현재 generation 정보 표시
- 프롬프트에서 reason 입력, git diff 확인, source-action 선택, backlog 저장 여부 안내
- 다음 명령어 제시: `reap run abort --phase execute --reason '...' --source-action <action> [--save-backlog]`

**execute phase** (`--phase execute`):
- extra 파라미터에서 reason, sourceAction, saveBacklog 파싱
- save-backlog 시 `aborted-{genId}.md` 생성 (createBacklog 패턴 활용은 아님 — 직접 작성)
- `revertBacklogConsumed(backlogDir, genId)` 호출
- life/ 디렉토리 정리 (기존 로직 유지)
- `emitOutput({ status: "ok" })` 로 결과 출력

### extra 전달 방식

run/index.ts에서 abort일 때 options를 JSON으로 직렬화하여 extra로 전달:
```
if (stage === "abort") {
  extra = JSON.stringify({ reason: options.reason, sourceAction: options.sourceAction, saveBacklog: options.saveBacklog });
}
```

### revertBacklogConsumed

backlog 디렉토리 스캔 → consumedBy === genId인 항목 → frontmatter에서 status를 pending으로 변경, consumedBy/consumedAt 제거.

## Scope

**변경 파일:**
- `src/cli/commands/run/abort.ts` — 2-phase 구현
- `src/core/backlog.ts` — revertBacklogConsumed 추가
- `src/cli/commands/run/index.ts` — abort에 extra args 전달
- `src/cli/index.ts` — --source-action, --save-backlog 옵션 추가
- `src/adapters/claude-code/skills/reap.abort.md` — 스킬 파일 업데이트
- `tests/e2e/abort.test.ts` — 신규 e2e 테스트

**Out of Scope:**
- 실제 git rollback/stash 실행 (프롬프트에서 안내만, 실행은 사용자)
- source-action의 실제 구현 (confirm에서 안내, execute에서 기록만)

## Tasks

- [ ] T001 `src/core/backlog.ts` — revertBacklogConsumed 함수 추가
- [ ] T002 `src/cli/index.ts` — --source-action, --save-backlog CLI 옵션 추가
- [ ] T003 `src/cli/commands/run/index.ts` — abort일 때 options를 JSON으로 extra에 전달
- [ ] T004 `src/cli/commands/run/abort.ts` — 2-phase (confirm/execute) 구현
- [ ] T005 `src/adapters/claude-code/skills/reap.abort.md` — 스킬 파일 업데이트
- [ ] T006 `tests/e2e/abort.test.ts` — e2e 테스트 작성
- [ ] T007 빌드 및 전체 테스트 통과 확인

## Dependencies

T001 → T004 (revertBacklogConsumed가 abort에서 사용됨)
T002, T003 → T004 (CLI 옵션과 extra 전달이 abort handler에서 필요)
T004 → T005, T006 (abort 구현 완료 후 스킬/테스트)
T006 → T007 (테스트 작성 후 전체 검증)
