# Planning

## Summary

hook condition을 하드코딩된 문자열에서 `.reap/hooks/conditions/{name}.sh` 스크립트 기반으로 전환. 기본 3개 제공, 유저 커스텀 가능.

## Tasks

### Phase 1: Condition 스크립트 생성
- [ ] T001 `src/templates/conditions/` — always.sh, has-code-changes.sh, version-bumped.sh 생성
- [ ] T002 `.reap/hooks/conditions/` — 이 프로젝트에 동일 스크립트 설치
- [ ] T003 `src/cli/commands/init.ts` — conditions 디렉토리 복사 로직 추가

### Phase 2: 템플릿 업데이트
- [ ] T004 slash commands (reap.next, reap.start, reap.back) — condition 평가를 스크립트 실행으로 변경
- [ ] T005 `src/templates/hooks/reap-guide.md` — conditions 커스터마이징 문서
- [ ] T006 `.reap/life/backlog/` — genome 변경 backlog (hook-system.md, constraints.md)

### Phase 3: 빌드 + 검증
- [ ] T007 `npm run build` + source `reap update`
- [ ] T008 `bun test` + `bunx tsc --noEmit`

## Dependencies
T001 → T003 (템플릿 먼저)
T001, T002 병렬
T004, T005, T006 병렬
T007 → 전체 후
