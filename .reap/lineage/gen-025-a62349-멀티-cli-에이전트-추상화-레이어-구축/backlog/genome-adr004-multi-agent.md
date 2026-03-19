---
type: genome-change
status: consumed
consumedBy: gen-025
target: genome/principles.md
---
# ADR-004 멀티 에이전트 추상화로 변경

현재 ADR-004는 "슬래시 커맨드 = ~/.claude/commands/ 설치"로 Claude Code에 하드코딩되어 있다.
AgentAdapter 추상화 도입에 따라 "슬래시 커맨드 = 감지된 에이전트의 commands 경로에 설치"로 변경 필요.
