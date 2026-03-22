---
type: task
status: consumed
priority: high
consumedBy: gen-135-7e8f8a
---

# Evolve subagent가 tests submodule 커밋을 누락하는 문제

## 문제

subagent가 src/ 코드와 tests/ 코드를 모두 수정하지만, 커밋 시 parent repo만 커밋하고 tests submodule 내부에서 별도 커밋+push를 하지 않음. completion의 dirty submodule 감지가 prompt로 안내하지만 subagent가 따르지 않음.

## 원인

- evolve.ts의 subagentPrompt에 submodule 관련 지시가 없음
- completion이 "Dirty submodules detected" prompt를 출력하지만 subagent가 무시

## 개선 방향

1. evolve.ts의 `buildSubagentPrompt()`에 submodule 커밋 규칙 추가:
   - "커밋 전 `git submodule foreach git status`로 dirty submodule 확인"
   - "dirty submodule이 있으면 submodule 내부에서 먼저 커밋+push 후 parent repo에서 submodule ref 커밋"
2. completion의 dirty submodule prompt를 더 강하게 — 단순 안내가 아닌 blocking gate로 변경 가능
