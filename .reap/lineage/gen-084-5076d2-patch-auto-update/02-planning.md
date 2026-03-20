# Planning

## Summary
`src/templates/commands/reap.update.md`의 Step 2에서 patch vs minor/major 버전 분기를 추가한다.
patch 업데이트는 유저 확인 없이 자동 실행, minor/major는 기존대로 유저 확인.

## Technical Context
- **Tech Stack**: Markdown 슬래시 커맨드 템플릿 (에이전트가 해석)
- **Constraints**: 소스 템플릿은 영어 유지, 기존 Step 1/3/4 로직 변경 없음

## Tasks

### T1: reap.update.md Step 2 수정
- **파일**: `src/templates/commands/reap.update.md`
- **변경**: "If installed < latest" 블록을 patch/minor-major 분기로 분리
  - patch (same major.minor, different patch): 자동 진행 메시지 출력 후 Step 3
  - minor/major: 기존 유저 확인 flow 유지
- **검증**: `bunx tsc --noEmit`, `npm run build`, `bun test`

## Dependencies
- 없음 (단일 파일 수정)
