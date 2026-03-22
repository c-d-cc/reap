# Planning

## Summary

`reapdev.versionBump.md` 스킬에 Step 0 "배포 산출물 일관성 검증"을 추가한다. 에이전트가 bump 실행 전에 4가지 cross-check를 수행하고 불일치가 있으면 유저에게 보고한다. 변경 대상은 1개 파일(`src/templates/commands/reapdev.versionBump.md`, 신규 생성)이며, 기존 로직은 그대로 유지하고 앞에 검증 단계만 삽입한다.

## Technical Context
- **Tech Stack**: 스킬 프롬프트 (Markdown) — 런타임 코드 변경 없음
- **Constraints**: reapdev.* 스킬은 `src/templates/commands/`에 위치, `COMMAND_NAMES` 배열에 등록 필요

## Tasks

- [x] T001 `src/templates/commands/reapdev.versionBump.md` -- 기존 `.claude/commands/reapdev.versionBump.md` 내용을 `src/templates/commands/`로 이동 (배포 산출물로 관리)
- [x] T002 `src/templates/commands/reapdev.versionBump.md` -- Step 0 "배포 산출물 일관성 검증" 단계 추가 (4가지 검증 항목 포함)
- [x] T003 `src/cli/commands/init.ts` -- `COMMAND_NAMES` 배열에 `reapdev.versionBump` 추가 (아직 없는 경우)

## Dependencies

- T001 → T002 (파일 생성 후 내용 추가)
- T003은 독립적

## Verification

- `src/templates/commands/reapdev.versionBump.md` 파일이 존재하고 Step 0 검증 지시사항을 포함
- `COMMAND_NAMES`에 `reapdev.versionBump` 포함
- 기존 versionBump Steps 1-6이 그대로 유지됨
