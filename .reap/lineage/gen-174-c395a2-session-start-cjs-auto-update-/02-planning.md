# Planning

## Summary
session-start.cjs에 두 가지 기능 추가:
1. auto-update 성공 후 RELEASE_NOTICE.md에서 새 버전 notice를 파싱하여 표시
2. breaking change blocked 시 유저 친화적 메시지 + AI 지시 강화

## Technical Context
- **Tech Stack**: Node.js CJS (session-start.cjs), TypeScript import 불가
- **Constraints**: try/catch로 감싸서 실패 시 무해하게

## Tasks
- [ ] T001 `src/templates/hooks/session-start.cjs` -- fetchReleaseNoticeCJS(version, language) 인라인 함수 추가 (notice.ts 참조 CJS 포팅)
- [ ] T002 `src/templates/hooks/session-start.cjs` -- auto-update 성공 블록(라인 152 부근) 뒤에서 notice 파싱 후 autoUpdateNotice 변수 설정
- [ ] T003 `src/templates/hooks/session-start.cjs` -- initLines에 autoUpdateNotice 추가 (autoUpdateMessage 다음)
- [ ] T004 `src/templates/hooks/session-start.cjs` -- breaking change blocked 시 initLines 메시지를 유저 친화적으로 변경
- [ ] T005 `src/templates/hooks/session-start.cjs` -- breaking change blocked 시 updateSection AI 지시 강화
- [ ] T006 `package.json` -- version bump 0.15.16 → 0.15.17
- [ ] T007 검증: bun test, bunx tsc --noEmit, npm run build

## Dependencies
- T001 → T002 → T003 (순차)
- T004, T005 (독립, 병렬 가능)
- T006 (독립)
- T007 (T001~T006 완료 후)
