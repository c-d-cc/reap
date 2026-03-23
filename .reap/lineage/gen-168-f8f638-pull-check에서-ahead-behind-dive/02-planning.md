# Planning

## Summary
`src/cli/commands/run/pull.ts`의 check phase에서 lineage meta 기반 비교를 `git rev-list --left-right --count` 기반으로 대체하여 ahead/behind/diverged/up-to-date를 정확히 구분한다.

## Technical Context
- **Tech Stack**: TypeScript, execSync (child_process)
- **Constraints**: Node.js >=18 호환, TypeScript strict mode

## Tasks

- [x] T001 `src/cli/commands/run/pull.ts` -- check phase에서 `git rev-list --left-right --count HEAD...{target}` 실행하여 ahead/behind 카운트를 파싱하는 로직 추가
- [x] T002 `src/cli/commands/run/pull.ts` -- 카운트 기반 4분기 분류: up-to-date, ahead, behind(fast-forward), diverged(start-merge)
- [x] T003 `src/cli/commands/run/pull.ts` -- 기존 lineage meta 비교 + canFastForward 로직 제거, 미사용 import 정리 (lineageUtils, canFastForward, MergeGenerationManager)
- [x] T004 타입체크 (`bunx tsc --noEmit`) 및 테스트 (`bun test`) 통과 확인

## Dependencies
- T001 -> T002 -> T003 -> T004 (순차)

## E2E Test Scenarios

### Scenario 1: up-to-date
- Setup: HEAD와 target이 동일 커밋
- Action: `reap run pull --phase check origin/main`
- Assertion: phase "up-to-date" 출력

### Scenario 2: ahead
- Setup: local에 추가 커밋, remote는 동일
- Action: `reap run pull --phase check origin/main`
- Assertion: phase "ahead" 출력, push 안내

### Scenario 3: behind
- Setup: remote에 추가 커밋, local은 동일
- Action: `reap run pull --phase check origin/main`
- Assertion: phase "fast-forward" 출력, git merge --ff 안내

### Scenario 4: diverged
- Setup: 양쪽 모두 고유 커밋
- Action: `reap run pull --phase check origin/main`
- Assertion: phase "start-merge" 출력, merge generation 안내
