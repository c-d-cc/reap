# Planning

## Summary

`session-start.sh`의 genome staleness 감지 로직에서 `git rev-list --count`에 코드 관련 경로 필터(`-- src/ tests/ package.json tsconfig.json scripts/`)를 추가하여, docs-only 커밋이 staleness 카운트에 포함되지 않도록 수정한다.

## Technical Context
- **Tech Stack**: Bash (session-start.sh), git CLI
- **Constraints**: 기존 hook 성능(10x 최적화) 유지 필수. git `--` path filter는 추가 비용 거의 없음.

## Tasks

### Phase 1: 수정
- [x] T001 `src/templates/hooks/session-start.sh` 107-117줄 — `git rev-list --count` 명령에 `-- src/ tests/ package.json tsconfig.json scripts/` 경로 필터 추가

### Phase 2: Version Bump
- [x] T002 `package.json` — version 0.2.1 → 0.2.2
- [x] T003 템플릿 동기화 — `npm run build && reap update`로 설치된 파일과 소스 동기화

### Phase 3: 검증
- [ ] T004 `bun test` — 전체 테스트 통과 확인
- [ ] T005 `bunx tsc --noEmit` — TypeScript 컴파일 확인

## Dependencies

T001 → T002, T003 (순차)
T002, T003 (병렬 가능)
