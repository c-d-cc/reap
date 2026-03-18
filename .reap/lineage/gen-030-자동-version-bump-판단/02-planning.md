# Planning

## Summary

`.reap/config.yml`의 `onGenerationComplete` hooks 첫 번째 항목으로 version bump 판단 prompt를 추가한다. patch는 AI 자동, minor/major는 유저 확인. 소스 코드 변경 없이 config 변경만으로 구현.

## Technical Context
- **Tech Stack**: YAML config (`.reap/config.yml`)
- **Constraints**: hook prompt는 AI 에이전트가 읽고 실행. `npm version {type} --no-git-tag-version` 사용.

## Tasks

### Phase 1: Config 수정
- [x] T001 `.reap/config.yml` — `onGenerationComplete` hooks 첫 번째에 version bump 판단 prompt 추가

### Phase 2: 검증
- [ ] T002 `bun test` — 전체 테스트 통과 확인
- [ ] T003 `bunx tsc --noEmit` — TypeScript 컴파일 확인

## Dependencies

T001 → T002, T003 (순차)
T002, T003 (병렬 가능)
