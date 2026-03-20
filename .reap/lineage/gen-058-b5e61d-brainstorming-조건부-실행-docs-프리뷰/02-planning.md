# Planning

## Summary
두 가지 변경: (1) reap.objective의 brainstorming을 조건부로 전환, (2) docs-update hook에 프리뷰+컨펌 단계 추가.

## Technical Context
- **Tech Stack**: 슬래시 커맨드 템플릿 (.md), hook 파일 (.md), genome domain 파일
- **Constraints**: 소스 코드 변경 최소 — 주로 프롬프트 템플릿 수정

## Tasks

### Phase 1: Brainstorming 조건부 실행
- [ ] T001 `src/templates/commands/reap.objective.md` — Step 5 앞에 복잡도 판단 게이트 추가. 스킵 조건 명시, 스킵 시 기존 Goal+Spec 정의로 직행. 유저 override 가능
- [ ] T002 `src/templates/brainstorm/visual-companion-guide.md` — evolve 모드 동작 설명에 조건부 실행 반영
- [ ] T003 `.reap/genome/domain/brainstorm-protocol.md` — 조건부 실행 규칙 추가 [deferred — genome immutability, completion에서 적용]

### Phase 2: docs 프리뷰 컨펌
- [ ] T004 `.reap/hooks/onGenerationComplete.docs-update.md` — 문서 수정 후 docs 앱 실행 + 브라우저 프리뷰 + 유저 컨펌 대기 로직 추가. evolve에서도 컨펌 필수

### Phase 3: 검증
- [ ] T005 `bun test` 전체 통과 확인
- [ ] T006 `bunx tsc --noEmit` 통과 확인
- [ ] T007 `npm run build` 성공 확인

## Dependencies
```
T001, T002는 병렬 가능
T003은 deferred (completion에서 genome 적용)
T004는 독립
T001~T004 → T005~T007
```
