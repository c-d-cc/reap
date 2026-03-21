# Completion

## Summary
- **Goal**: slash command 전면 정리 — 책임 분리 + hook 배치 + 일관성
- **Period**: 2026-03-21T13:00:00Z ~ 2026-03-21T13:30:00Z
- **Genome Version**: v85 → v86
- **Result**: pass
- **Key Changes**: reap.next에서 hook/archiving 분리, 각 stage command에 hook 추가, reap.completion에 archiving 흡수

## Retrospective

### Lessons Learned
1. 마크다운 템플릿 수정은 TypeScript 소스 변경 없이도 AI 워크플로우를 근본적으로 변경할 수 있다 — 테스트가 깨지지 않지만 검증이 구조적 분석(grep)으로 대체되어야 한다
2. hook 실행 로직의 공통 패턴화(4줄)로 17개 파일의 일관성을 유지할 수 있다 — 기존 reap.start/reap.back의 10줄+ 중복이 제거됨
3. reap.evolve의 lifecycle loop에서 completion stage의 종료 조건을 명확히 해야 한다 — reap.next가 archiving을 하지 않으므로 loop 종료 로직이 변경됨

### Genome Change Proposals
(없음 — 이번 generation은 genome 변경 불필요)

## Garbage Collection
(convention 위반 없음, 새로운 기술 부채 없음)

## Deferred Task Handoff
(없음)

## Next Generation Backlog
(없음 — backlog에 pending 항목 없음)

## Genome Changelog
(변경 없음)
