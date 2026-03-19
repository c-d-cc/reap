# Completion

## Summary
- **Goal**: stage 전환 시 current.yml 직접 수정 방지 — /reap.next 강제 사용 규칙 강화
- **Period**: 2026-03-17
- **Genome Version**: v15 → v16
- **Result**: pass
- **Key Changes**: reap-guide.md Critical Rules, reap.evolve.md HARD-GATE 추가

## Retrospective
### Lessons Learned
- 프롬프트에 명시적 금지 규칙이 없으면 AI가 shortcut을 취할 수 있음
- HARD-GATE 패턴이 AI 행동 제어에 효과적
