# Implementation Log — gen-032-4baaef

## Completed Tasks

| Task | File | Description |
|------|------|-------------|
| T001 | `src/cli/commands/destroy.ts` | destroy 명령 구현 — destroyProject 로직(reap/ 삭제, CLAUDE.md 정리, .gitignore 정리) + execute CLI entry(--confirm 없으면 prompt) |
| T002 | `src/cli/commands/clean.ts` | clean 명령 구현 — cleanProject 로직(lineage compress/delete, life 정리, backlog 삭제, hooks reset) + execute CLI entry(옵션 없으면 prompt) |
| T003 | `src/cli/index.ts` | destroy, clean 명령 등록 (import + command/option/action) |
| T004 | build | `npm run build` 성공 (127 modules, 0.43MB) |
| T005 | `tests/e2e/destroy.test.ts` | 6개 테스트 — prompt 반환, .reap/ 삭제, CLAUDE.md 정리(REAP-only 삭제, 기타 보존), .gitignore 정리, 미존재 시 skip |
| T006 | `tests/e2e/clean.test.ts` | 8개 테스트 — prompt 반환, --life, --backlog, --hooks reset, --lineage delete/compress, 복합 옵션, 보호 디렉토리 미변경 |
| T007 | tests/ | 전체 319 tests 통과 (unit 180 + e2e 98 + scenario 41) |

## Architecture Decisions

- **prompt 패턴**: `emitOutput`이 `never` 반환이므로, `--confirm`/옵션 없을 때 prompt를 반환하면 함수가 즉시 종료됨. 이를 활용해 prompt 후 실행 로직이 자연스럽게 분리.
- **CLAUDE.md 정리**: `## REAP` 제목부터 다음 `## ` 제목 또는 EOF까지를 regex로 캡처. 결과가 빈 파일이면 삭제.
- **clean의 genome/environment/vision 보호**: 옵션 자체를 제공하지 않아 실수로 건드릴 수 없게 함.
