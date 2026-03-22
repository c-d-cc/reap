---
type: task
status: consumed
priority: high
consumedBy: gen-115-dc9f09
---

# .md hook이 evolve subagent에서 실행되지 않는 문제

## 문제

`.md` hook은 AI prompt로 실행되어야 하지만, `executeMdHook()`은 내용을 읽어서 `hookResults`에 담아 반환만 함.
evolve subagent가 completion output의 `hookResults`를 파싱하고 `.md` hook content를 실행하는 로직이 없음.

결과: `onLifeCompleted.docs-update.md` 같은 .md hook이 evolve subagent에서 무시됨.

## 발견 경위

gen-110~114에서 src/ 변경이 있었으나 docs-update hook이 한번도 실행되지 않음.
`has-code-changes` condition은 통과하지만, subagent가 hookResults의 .md content를 따르지 않음.

## 개선 방향

1. completion script의 output에 `.md` hook content가 있으면, `prompt` 필드에 "다음 hook prompt를 실행하라" 지시 포함
2. 또는 evolve.ts의 subagentPrompt에 "completion 후 hookResults의 .md hook을 실행하라" 명시
3. hook content가 유저 확인을 요구하는 경우(docs-update처럼) evolve autonomous mode에서의 처리 방안 필요
