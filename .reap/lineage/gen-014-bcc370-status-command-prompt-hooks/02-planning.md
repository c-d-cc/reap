# Planning

## Regression
- From: implementation
- Reason: planning artifact 누락 — current.yml 직접 수정으로 인한 프로세스 위반
- Affected: 03-implementation.md (일부 작성됨, 재진입 시 이어서 기록)

## Summary
3개 영역의 변경: (1) /reap.status slash command 신규, (2) hooks prompt 타입 지원, (3) 문서 업데이트.
코드 변경은 types + init COMMAND_NAMES + 신규 프롬프트. 나머지는 프롬프트/문서 수정.

## Technical Context
- Runtime: Bun, TypeScript
- Slash commands: 마크다운 프롬프트 파일
- Hooks: config.yml의 command/prompt → AI 에이전트가 실행

## Tasks

### Phase 1: /reap.status slash command
- [ ] T001 `src/templates/commands/reap.status.md` 신규 생성
- [ ] T002 `src/cli/commands/init.ts` — COMMAND_NAMES에 `reap.status` 추가

### Phase 2: hooks prompt 타입 지원
- [ ] T003 `src/types/index.ts` — ReapHookCommand에 `prompt?: string` 필드 추가
- [ ] T004 `src/templates/commands/reap.next.md` — hook 실행 시 prompt 타입 처리 지시
- [ ] T005 `src/templates/commands/reap.start.md` — 동일
- [ ] T006 `src/templates/commands/reap.back.md` — 동일
- [ ] T007 `src/templates/hooks/reap-guide.md` — hooks 섹션에 prompt 타입 설명 + 예시

### Phase 3: reap 프로젝트 config 업데이트
- [ ] T008 `.reap/config.yml` — onGenerationComplete에 문서 업데이트 prompt hook 추가

### Phase 4: 문서 업데이트
- [ ] T009 `README.md` — slash commands 테이블에 /reap.status, hooks 예시에 prompt 추가
- [ ] T010 `README.ko.md` — 동일
- [ ] T011 `docs/src/pages/WorkflowPage.tsx` — Stage Commands + hooks 업데이트
- [ ] T012 `docs/src/pages/HeroPage.tsx` — CLI Quick Reference 업데이트

### Phase 5: 검증
- [ ] T013 `bun test` 실행
- [ ] T014 backlog 정리 (01, 02 완료 처리)

## Dependencies
- Phase 1, 2 독립적
- Phase 3 → Phase 2 이후
- Phase 4 → Phase 1, 2 이후
- Phase 5 → 전체 이후
