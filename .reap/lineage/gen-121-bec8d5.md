---
id: gen-121-bec8d5
type: normal
parents:
  - gen-120-488e3e
goal: "feat: version bump 시 배포 산출물 일관성 검증 추가"
genomeHash: 4c796714
startedAt: 2026-03-22T07:52:21.084Z
completedAt: 2026-03-22T07:57:00.552Z
---

# gen-121-bec8d5
- **Goal**: feat: version bump 시 배포 산출물 일관성 검증 추가
- **Period**: 2026-03-22
- **Result**: pass
- **Key Changes**: `reapdev.versionBump.md` 스킬을 `src/templates/commands/`로 이동하고 Step 0 "배포 산출물 일관성 검증" 추가 (4가지 cross-check: 커맨드↔COMMAND_NAMES, run script 매핑, help 텍스트, guide 참조), COMMAND_NAMES에 등록

## Objective
`/reapdev.versionBump` 실행 시 배포 산출물 간 일관성을 자동 검증하는 단계를 추가하여, 커맨드 누락·help 텍스트 불일치·guide-readme-docs 간 용어 불일치를 version bump 전에 발견한다.

## Completion Conditions
1. versionBump 스킬에서 bump 실행 전 검증 단계가 호출된다
2. `src/templates/commands/` 실제 파일 목록과 `COMMAND_NAMES` 배열이 일치하지 않으면 경고를 출력한다
3. `src/templates/help/` (en.txt, ko.txt)가 현재 주요 슬래시 커맨드를 반영하는지 검증한다
4. `reap-guide.md`에 언급된 커맨드가 실제 존재하는지 cross-check한다
5. 검증 실패 시 유저에게 불일치 목록을 보여주고 계속 진행할지 묻는다
6. 검증 통과 시 기존 versionBump 흐름이 그대로 진행된다

## Result: pass

## Lessons
#### What Went Well
- 기존 versionBump 로직을 변경 없이 검증 단계만 추가하여 리스크 최소화
- reapdev 스킬을 src/templates/commands/로 이동하여 배포 산출물로 관리

## Genome Changes
| Backlog File | Target | Change Description | Applied |
|-------------|--------|-------------------|---------|
| - | - | - | - |
[...truncated]