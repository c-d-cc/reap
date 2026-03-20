# Implementation

## Changes

### `src/templates/hooks/session-start.cjs` (Step 0)
- `fs.symlinkSync(src, dest)` → `fs.copyFileSync(src, dest)`
- 기존 symlink가 있으면 삭제 후 실제 파일로 복사 (하위 호환)
- 파일 내용이 동일하면 복사 스킵 (Buffer.equals 비교)
- 로그 메시지: 설치 수 + 미변경 수 표시
- .gitignore 코멘트도 "symlinks" → "files"로 업데이트

## Build
- `npm run build` 성공
