# Planning — gen-006-52bd76

## Goal

`reap make backlog` CLI 명령어를 추가하고, evolve.ts 및 stage prompt에 backlog 작성 규칙을 명시하여 AI가 Write로 직접 backlog를 생성하는 것을 방지한다.

## Completion Criteria

1. `reap make backlog --type task --title "test"` 실행 시 backlog 파일이 정상 생성됨
2. `reap backlog create` 기존 명령이 여전히 동작함 (하위 호환)
3. evolve.ts의 Backlog Rules 섹션에 `reap make backlog` 사용 규칙이 포함됨
4. implementation.ts stage prompt에 backlog 규칙이 포함됨
5. planning.ts stage prompt에 backlog 규칙이 포함됨
6. typecheck (`npm run build`) 통과
7. e2e 테스트 통과

## Scope

### 변경 파일
- `src/cli/index.ts` — `reap make backlog` command 추가
- `src/cli/commands/run/evolve.ts` — Backlog Rules 섹션 수정
- `src/cli/commands/run/implementation.ts` — backlog 규칙 추가
- `src/cli/commands/run/planning.ts` — backlog 규칙 추가

### Out of Scope
- `reap make` 하위의 다른 subcommand (향후 확장)
- `reap backlog create` 제거
- 기존 backlog.ts 핵심 로직 변경

## Tasks

- [ ] T001 `src/cli/index.ts` — `reap make backlog` command 추가 (기존 `backlog create` 로직 재사용)
- [ ] T002 `src/cli/commands/run/evolve.ts` — Backlog Rules 섹션을 v0.15 규칙으로 교체
- [ ] T003 `src/cli/commands/run/implementation.ts` — backlog 생성 안내를 `reap make backlog` 사용으로 수정
- [ ] T004 `src/cli/commands/run/planning.ts` — echo chamber prevention 섹션에 backlog 규칙 추가
- [ ] T005 typecheck + build 확인
- [ ] T006 localInstall + e2e 테스트

## Dependencies

- T001 → T005 (CLI 추가 후 빌드 확인)
- T002, T003, T004는 독립적으로 가능
- T005 → T006 (빌드 통과 후 e2e)
