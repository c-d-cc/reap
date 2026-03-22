# Planning

## Summary
`reapdev.versionBump.md` 스킬 파일의 기존 Step 0 앞에 "Pre-check: Docs Consistency Gate" 섹션을 삽입한다. 단일 마크다운 파일 수정.

## Technical Context
- **Tech Stack**: 마크다운 스킬 파일 수정 (코드 변경 없음)
- **Constraints**: 기존 Step 0~6 내용 변경 불가

## Tasks
- [x] T001 `src/templates/commands/reapdev.versionBump.md` -- Step 0 앞에 "Pre-check: Docs Consistency Gate" 섹션 추가. `/reapdev.docsUpdate` 실행 지시, 불일치 시 수정 후 유저 확인, 확인 후에만 Step 0 진행.

## Dependencies
없음 (단일 태스크)

