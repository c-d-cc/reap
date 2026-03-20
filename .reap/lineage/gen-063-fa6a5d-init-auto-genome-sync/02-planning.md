# Planning

## Summary
adoption/migration init 시 프로젝트 파일을 스캔하여 genome을 자동 생성.

## Technical Context
- **Tech Stack**: TypeScript, Node.js fs/promises
- **Constraints**: AI 없이 파일 기반 추론만, src/core/fs.ts 유틸 사용

## Tasks
- [ ] T001 `src/core/genome-sync.ts` — 프로젝트 스캔 + genome 내용 생성 모듈
- [ ] T002 `src/cli/commands/init.ts` — adoption/migration 시 genome-sync 호출
- [ ] T003 검증

## Dependencies
T001 → T002 → T003
