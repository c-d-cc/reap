# Implementation Log — gen-006-52bd76

## Completed Tasks

| Task | File | Description | Status |
|------|------|-------------|--------|
| T001 | `src/cli/index.ts` | `reap make backlog` command 추가. `reap make <resource>` 패턴으로 향후 확장 가능. 기존 `backlog create`와 동일한 `createBacklog` 함수 사용. | DONE |
| T002 | `src/cli/commands/run/evolve.ts` | Backlog Rules 섹션을 v0.15 규칙으로 교체: `reap make backlog` 사용 의무화, Write 직접 생성 금지, Edit으로 편집 안내 | DONE |
| T003 | `src/cli/commands/run/implementation.ts` | Genome/Environment Changes 섹션의 backlog 생성 안내를 `reap make backlog` 사용으로 수정 | DONE |
| T004 | `src/cli/commands/run/planning.ts` | Echo Chamber Prevention 섹션 뒤에 "Backlog Rules" 블록 추가 | DONE |
| T005 | - | `npm run typecheck` + `npm run build` 통과 | DONE |
| T006 | - | localInstall 후 `reap make backlog` e2e 테스트 성공, `reap backlog create` 하위 호환 확인 | DONE |

## Architecture Decisions

- `reap make <resource>` 패턴 채택: 현재는 `backlog`만 지원하지만, 향후 `reap make template`, `reap make goal` 등 확장 가능
- `reap backlog create` 제거하지 않음: 하위 호환 유지. 기존 스크립트/습관 깨지 않음
- evolve.ts Backlog Rules는 한국어로 작성: evolution.md의 language 설정(korean)을 따름
