# Objective

## Goal
fix: .md hook이 evolve subagent에서 실행되도록 completion output 개선

## Completion Criteria
1. completion.ts의 `phase: "commit"` output에서 `.md` hook content가 `prompt` 필드에 포함됨
2. evolve.ts의 subagentPrompt에 "completion output의 prompt에 hook 지시가 있으면 반드시 따르라"는 안내가 포함됨
3. `.sh` hook 처리는 기존 동작 유지 (변경 없음)
4. `status: "skipped"`인 .md hook은 prompt에 포함되지 않음
5. `bun test`, `bunx tsc --noEmit`, `npm run build` 모두 통과

## Requirements

### Functional Requirements
1. completion.ts에서 hookResults 중 `type: "md"` + `status: "executed"` + `content`가 있는 항목을 수집
2. 수집된 .md hook content를 completion output의 `prompt` 필드에 추가 (기존 prompt 뒤에 append)
3. 추가 형식: "다음 hook prompt를 순서대로 실행하라:" + 각 hook의 name과 content
4. evolve.ts의 buildSubagentPrompt()에 hook prompt 실행 안내 추가

### Non-Functional Requirements
1. 기존 .sh hook 로직 변경 없음
2. hook-engine.ts 수정 없음
3. TypeScript strict mode 준수

## Design

### Approaches Considered

| Aspect | Approach A: prompt 문자열에 append | Approach B: 별도 필드 추가 |
|--------|----------------------------------|--------------------------|
| Summary | 기존 prompt 문자열 끝에 .md hook content를 연결 | context에 mdHookPrompts 필드를 별도로 추가 |
| Pros | subagent가 prompt만 읽으면 자동으로 실행, 변경 최소 | 구조적으로 깔끔, 파싱 용이 |
| Cons | prompt가 길어질 수 있음 | subagent가 별도 필드를 인식하는 로직이 필요 |
| Recommendation | **선택** — AI subagent는 prompt를 자연어로 읽으므로 가장 자연스러움 | - |

### Selected Design
Approach A: completion.ts에서 hookResults를 확인하여 .md hook content를 prompt 문자열에 append.

구현 세부사항:
1. `buildMdHookPrompt(hookResults)` 헬퍼 함수 추가
2. hookResults에서 `type === "md" && status === "executed" && content` 필터링
3. 결과를 "\n\n## Hook Prompts\n다음 hook prompt를 순서대로 실행하라:\n\n### {name}\n{content}" 형식으로 조합
4. completion.ts의 두 곳(phase "genome"과 phase "archive")의 prompt에 append
5. evolve.ts의 subagentPrompt에 hook prompt 실행 안내 추가

### Design Approval History
- 2026-03-22: 초기 설계 (Approach A 선택)

## Scope
- **Related Genome Areas**: hook-engine, completion lifecycle, evolve subagent
- **Expected Change Scope**: completion.ts (hookResults -> prompt 통합), evolve.ts (subagentPrompt 안내)
- **Exclusions**: hook-engine.ts 수정 없음, .sh hook 처리 변경 없음

## Genome Reference
- conventions.md: TypeScript strict mode, async/await
- constraints.md: Validation — bun test, bunx tsc --noEmit, npm run build

## Backlog (Genome Modifications Discovered)
None

## Background
`.md` hook은 AI prompt로 실행되어야 하지만, hook-engine.ts의 executeMdHook()은 content를 읽어서 hookResults에 담아 반환만 함. subagent가 completion output의 hookResults를 파싱하고 .md hook content를 실행하는 로직이 없어서, onLifeCompleted.docs-update.md 같은 .md hook이 evolve subagent에서 무시됨.

