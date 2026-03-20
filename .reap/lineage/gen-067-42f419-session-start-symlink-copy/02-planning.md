# Planning

## Summary
session-start.cjs의 Step 0 (커맨드 설치) 로직에서 `fs.symlinkSync` → `fs.copyFileSync`로 변경

## Technical Context
- **Tech Stack**: Node.js (CJS), session-start hook
- **Constraints**: 빌드된 dist/ 파일도 동기화 필요 (npm run build)

## Tasks
1. `src/templates/hooks/session-start.cjs` 수정
   - `fs.symlinkSync(src, dest)` → `fs.copyFileSync(src, dest)`
   - symlink 체크 로직을 파일 내용 비교로 변경
   - 기존 symlink 존재 시 삭제 후 복사 (하위 호환)
2. 빌드 실행 (`npm run build`)
3. 테스트 실행 (`bun test`)

## Dependencies
없음 — 단일 파일 수정
