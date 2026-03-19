# Planning

## Summary
init.ts에 progress 콜백 추가, index.ts의 init action에 단계별 출력, help 템플릿 간결화 + REAP 소개 추가, OpenCode 플러그인 autoUpdate PATH 해결.

## Technical Context
- **Tech Stack**: TypeScript, Node.js 호환, Commander.js
- **Constraints**: fs/promises 사용, `src/core/fs.ts` 유틸 경유

## Tasks

### Phase 1: init UX 개선
- [ ] T001 `src/cli/commands/init.ts` — progress 콜백 파라미터 추가, 각 단계에서 호출
- [ ] T002 `src/cli/index.ts` — init action에서 progress 콜백으로 단계별 메시지 출력 + 완료 안내 개선

### Phase 2: help 성능 최적화
- [ ] T003 `src/templates/commands/reap.help.md` — REAP 소개 추가, Step 5 간결화 (reap --version/backlog/lineage 제거), 템플릿 정리

### Phase 3: OpenCode autoUpdate PATH
- [ ] T004 `src/templates/hooks/opencode-session-start.js` — execSync에 PATH 환경 변수 주입 (사용자 쉘 PATH 전달)

### Phase 4: 버전 + 검증
- [ ] T005 `package.json` — 이미 0.2.1 범프 완료 확인
- [ ] T006 테스트 + 빌드 검증

## Dependencies
```
T001 → T002 (init 콜백 먼저)
T003, T004: 독립 (병렬 가능)
T001~T004 → T006 (검증)
```
