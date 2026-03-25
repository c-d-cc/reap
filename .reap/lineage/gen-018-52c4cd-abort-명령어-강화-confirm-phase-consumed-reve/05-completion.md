# Completion — gen-018-52c4cd

## Summary

abort 명령어를 2-phase(confirm → execute)로 강화하여 v0.15의 핵심 기능을 복원했다.

### Changes
- `src/core/backlog.ts` — `revertBacklogConsumed` 함수 추가 (consumed → pending revert)
- `src/cli/index.ts` — `--source-action`, `--save-backlog` CLI 옵션 추가
- `src/cli/commands/run/index.ts` — abort일 때 options를 JSON으로 extra에 전달
- `src/cli/commands/run/abort.ts` — 2-phase 구현 (confirm prompt + execute 동작)
- `src/adapters/claude-code/skills/reap.abort.md` — 스킬 파일 업데이트
- `tests/e2e/abort.test.ts` — 신규 9개 e2e 테스트

### Validation: PASS (typecheck, build, 168/168 tests)

## Lessons Learned

- run/index.ts의 extra 파라미터가 단일 string이어서 여러 옵션 전달이 제약됨. JSON.stringify 방식으로 우회했지만, 향후 handler에 options 객체를 직접 전달하는 방식으로 리팩토링하면 더 깔끔할 것.
- confirm → execute 2-phase 패턴은 사용자 확인이 필요한 파괴적 작업에 효과적. 다른 명령어에도 적용 가능한 패턴.

## Next Generation Hints

- extra 파라미터 전달 구조의 리팩토링 (JSON 우회 → 직접 options 전달) 검토 가능
- source-action의 실제 실행 (git checkout, git stash)은 현재 프롬프트 안내만 하고 있음. 필요시 자동화 가능.
