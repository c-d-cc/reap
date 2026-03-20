# Planning

## Summary
Hook event 체계를 stage-level로 전면 교체. Stash에 WIP 복구 후 미완료 부분 마무리.

## Technical Context
- **Stash**: `reap-abort: gen-081-2747cc hook system overhaul WIP` — types, genome, command templates, hook files 일부 변경 완료
- **미완료**: reap.next에서 stage별 개별 hook 발동 로직, docs 번역, README, reap-guide, migrate 스크립트

## Tasks

### Phase 1: WIP 복구 + 검증
- [ ] T001 `git stash pop` — WIP 코드 복구
- [ ] T002 빌드 확인 (복구 후 상태 점검)

### Phase 2: reap.next stage별 hook 발동
- [ ] T003 `reap.next.md` — stage 전환 시 `onLifeTransited` + 해당 stage 완료 hook 모두 발동
  - objective → planning: `onLifeObjected` + `onLifeTransited`
  - planning → implementation: `onLifePlanned` + `onLifeTransited`
  - implementation → validation: `onLifeImplemented` + `onLifeTransited`
  - validation → completion: `onLifeValidated` + `onLifeTransited`
  - completion → archive: `onLifeCompleted`

### Phase 3: reap-guide + docs + README
- [ ] T004 `reap-guide.md` — hook event 목록 업데이트
- [ ] T005 docs 번역 4개 (en, ko, ja, zh-CN) — hook event 테이블
- [ ] T006 README 4개 — hook event 테이블

### Phase 4: 하위호환 migrate 스크립트
- [ ] T007 `.reap/hooks/` 스캔 시 구 이벤트명 파일 감지하면 경고 + 리네임 안내

### Phase 5: 빌드 + 테스트
- [ ] T008 `npm run build` + `bun test` + `bunx tsc --noEmit`

## E2E Test Scenarios
(lifecycle 변경이므로 필수)
1. reap.next 실행 시 해당 stage의 개별 hook + onLifeTransited 모두 발동 확인
2. reap.back 실행 시 onLifeRegretted 발동 확인
3. 구 이벤트명 hook 파일 존재 시 경고 메시지 확인
