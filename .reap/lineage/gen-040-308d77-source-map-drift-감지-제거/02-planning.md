# Planning

## Summary
genome-loader.cjs에서 source-map drift 감지 로직을 제거하고, 두 hook 파일에서 drift 관련 참조를 정리한다.

## Technical Context
- **Tech Stack**: CommonJS, Node.js fs
- **Constraints**: `fileExists`는 `buildGenomeHealth`에서도 사용 → export 유지. `detectStaleness`의 시그니처/반환값 변경 필요.

## Tasks

### Phase 1: genome-loader.cjs 수정
- [ ] T001 `src/templates/hooks/genome-loader.cjs` — `detectStaleness()`에서 drift 관련 코드 제거 (151~164줄), 반환값에서 sourcemapDriftWarning/documented/actual 제거, l1Lines 파라미터 제거
- [ ] T002 `src/templates/hooks/genome-loader.cjs` — `buildGenomeHealth()`에서 drift 관련 파라미터(sourcemapDriftWarning, documented, actual) 및 로직(200~205줄) 제거

### Phase 2: hook 파일 수정
- [ ] T003 [P] `src/templates/hooks/session-start.cjs` — drift 관련 변수 참조 제거 (61, 76~78, 91줄)
- [ ] T004 [P] `src/templates/hooks/opencode-session-start.js` — drift 관련 참조 제거 (102~104줄)

### Phase 3: 검증
- [ ] T005 `bun test` 실행
- [ ] T006 `bunx tsc --noEmit` 실행
- [ ] T007 `npm run build` 성공

## Dependencies
- T003, T004 → T001, T002
- T005~T007 → T003, T004
