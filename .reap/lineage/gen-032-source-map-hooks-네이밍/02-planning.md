# Planning

## Summary

3개 축으로 진행:
1. source-map.md를 정식 genome 파일로 등록 (템플릿 + init + session-start 로딩)
2. hooks를 config.yml에서 완전 분리 → `.reap/hooks/{event}.{name}.{ext}` 파일 기반
3. templates/genome/ 용어 수정 (Birth → Completion, Layer Map → Source Map)

## Technical Context
- **Hooks 새 구조**: config.yml에서 hooks 섹션 제거. `.reap/hooks/` 디렉토리를 스캔하여 파일명에서 event 파싱.
- **네이밍**: `{event}.{name}.{md|sh}` — md=prompt, sh=command
- **Frontmatter**: `condition`, `order` (order 기본값: 50, 같으면 알파벳순)
- **AI 실행**: slash command 템플릿이 AI에게 "`.reap/hooks/` 스캔 → event 매칭 → condition 평가 → 실행" 지시

## Tasks

### Phase 1: Genome 템플릿 정비
- [ ] T001 `src/templates/genome/source-map.md` — 빈 템플릿 생성
- [ ] T002 `src/templates/genome/principles.md` — "Birth phase" → "Completion", Layer Map → Source Map 참조
- [ ] T003 `src/templates/genome/conventions.md`, `constraints.md` — "Birth phase" → "Completion"
- [ ] T004 `src/cli/commands/init.ts` — genomeTemplates에 `source-map.md` 추가
- [ ] T005 `src/templates/hooks/session-start.sh` — L1 루프에 source-map.md 추가

### Phase 2: Hooks 파일 기반 전환
- [ ] T006 `.reap/hooks/` — 파일 리네임 + frontmatter 추가:
  - `onGenerationComplete.version-bump.md` (condition: has-code-changes, order: 10)
  - `onGenerationComplete.reap-update.sh` (condition: always, order: 20)
  - `onGenerationComplete.docs-update.md` (condition: has-code-changes, order: 30)
  - `onGenerationComplete.release-notes.md` (condition: version-bumped, order: 40)
- [ ] T007 `.reap/config.yml` — hooks 섹션 제거
- [ ] T008 `src/types/index.ts` — ReapConfig에서 hooks 필드를 optional로 유지 (하위 호환)
- [ ] T009 slash command 템플릿 (reap.next, reap.start, reap.back) — hook 실행 지시를 파일 스캔 방식으로 변경
- [ ] T010 `src/templates/hooks/reap-guide.md` — hooks 문서를 파일 기반 구조로 업데이트

### Phase 3: 빌드 + 검증
- [ ] T011 `npm run build && reap update` (소스에서)
- [ ] T012 `bun test` + `bunx tsc --noEmit`

## Dependencies

T001~T005 독립 (병렬)
T006~T010 독립 (병렬, T001~T005 완료 불필요)
T011 → T001~T010 완료 후
T012 → T011 후
