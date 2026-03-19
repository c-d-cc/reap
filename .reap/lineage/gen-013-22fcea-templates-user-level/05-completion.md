# Completion

## Summary
- **Goal**: artifact templates + domain guide를 ~/.reap/templates/로 이전
- **Period**: 2026-03-17
- **Genome Version**: v13 → v14
- **Result**: pass
- **Key Changes**: templates를 user-level ~/.reap/templates/에 설치, 프롬프트 경로 일괄 변경

## Retrospective
### Lessons Learned
- commands와 동일한 패턴(user-level 고정 경로)으로 templates도 관리하는 것이 일관성 있음
- global npm 패키지 경로 의존을 피하고 AI 에이전트가 확정된 경로를 참조하게 함
