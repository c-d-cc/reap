---
type: task
status: consumed
consumedBy: gen-081-ce4de9
priority: high
aborted: true
abortedFrom: gen-081-2747cc
abortReason: "generation artifact 없이 implementation에 직행함. 표준 lifecycle으로 재시작"
stage: implementation
sourceAction: stash
stashRef: "reap-abort: gen-081-2747cc hook system overhaul WIP"
changedFiles:
  - src/types/index.ts
  - src/templates/commands/reap.start.md
  - src/templates/commands/reap.next.md
  - src/templates/commands/reap.back.md
  - src/templates/commands/reap.completion.md
  - src/templates/commands/reap.help.md
  - .reap/genome/constraints.md
  - .reap/genome/domain/hook-system.md
  - .reap/hooks/ (renamed files)
  - tests/commands/update.test.ts
---

# Hook System 전면 개편

## Goal
기존 hook event 명명을 stage-level로 전면 교체.

## 신규 이벤트 체계

### Normal Lifecycle (8개)
- onLifeStarted — generation 생성 후
- onLifeObjected — objective 완료 후
- onLifePlanned — planning 완료 후
- onLifeImplemented — implementation 완료 후
- onLifeValidated — validation 완료 후
- onLifeCompleted — completion + archiving 후
- onLifeTransited — 모든 stage 전환 시 (범용)
- onLifeRegretted — regression 시

### Merge Lifecycle (8개)
- onMergeStarted — merge generation 생성 후
- onMergeDetected — detect 완료 후
- onMergeMated — mate 완료 후
- onMergeMerged — merge 완료 후
- onMergeSynced — sync 완료 후
- onMergeValidated — validation 완료 후
- onMergeCompleted — completion + archiving 후
- onMergeTransited — 모든 merge stage 전환 시

## 수정 대상
- src/types/index.ts — ReapHookEvent
- .reap/genome/constraints.md — hook event 목록
- .reap/genome/domain/hook-system.md — 전면 재작성
- src/templates/commands/ — reap.start, reap.next, reap.back, reap.completion, reap.help
- .reap/hooks/ — 파일 리네임 (onGenerationComplete → onLifeCompleted 등)
- docs 번역 4개 — hook event 테이블
- README 4개 — hook event 테이블
- reap-guide.md — hook event 목록

## 하위호환성
- 별도 migration 로직 없음. 정의 안 된 이벤트 이름의 hook 파일이 있으면 migrate 지시 스크립트만 추가 (추후 삭제 예정)

## Resume Guide
`git stash pop`으로 코드 복구. 부분 완료 상태 — types, genome, command templates, hook files 일부 변경됨. docs/README는 미수정.
