---
type: genome-change
status: consumed
consumedBy: gen-025
target: genome/constraints.md
---
# constraints.md Claude Code 하드코딩 제거

"슬래시 커맨드, hook → ~/.claude/ (user-level)" 부분을 멀티 에이전트 지원으로 변경.
각 에이전트별 경로를 AgentAdapter가 관리하도록 기술.
