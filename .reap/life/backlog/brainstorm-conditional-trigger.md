---
type: task
status: pending
---
# Brainstorming 조건부 실행

현재 모든 목표가 brainstorming을 거치도록 되어 있으나, 복잡한 요구사항일 때만 실행해야 함.

스킵 조건 (brainstorming 불필요):
- 단순 bugfix, config 변경, docs-only
- 명확한 단일 태스크로 설계 탐색이 불필요한 경우

실행 조건 (brainstorming 필요):
- 새 기능 추가, 아키텍처 변경, 멀티 컴포넌트 작업
- 유저의 요구사항을 더 자세하게 디벨롭해야 하는 경우

수정 대상: `src/templates/commands/reap.objective.md` Step 5 진입 조건 추가
