# Generation gen-004 Summary

- **Goal**: genome/domain 작성 가이드 체계화
- **Started**: 2026-03-17T00:00:00.000Z
- **Completed**: 2026-03-17
- **Genome Version**: 4 → 5
- **Mutations**: 0건

## 주요 변경

1. `src/templates/genome/domain/README.md` 신규 — domain 작성 가이드 (비즈니스 도메인 단위 분리, 코드 외 지식 기록, 에이전트 행동 가능 수준)
2. `src/cli/commands/init.ts` — domain/README.md 자동 복사 로직 추가
3. 슬래시 커맨드 3개 업데이트 (conception, formation, birth) — domain/ 가이드 참조 강화
4. `genome/principles.md` — domain/ 비즈니스 규칙 원칙 추가
5. `genome/conventions.md` — 템플릿 추가 시 init 동기화 규칙 추가

## 배경

selfview 프로젝트에서 3개 domain 파일(interview-protocol, article-generation, moderation-policy) 작성 경험을 범용 패턴으로 추상화.
