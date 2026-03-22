# Objective

## Goal
fix: versionBump Step 0에서 docsUpdate를 선행 실행하여 내용 불일치 gate

## Completion Criteria
1. `reapdev.versionBump.md`의 기존 Step 0 앞에 "Pre-check: Docs Consistency Gate" 단계가 추가되어 있다
2. 해당 단계에서 `/reapdev.docsUpdate` 스킬 실행을 지시한다
3. 불일치 발견 시 수정 후 유저 확인을 받도록 명시되어 있다
4. 문서 최신 상태 확인 후에만 기존 Step 0으로 진행하도록 되어 있다
5. 기존 Step 0 (0-A ~ 0-D 구조적 검증)은 변경 없이 유지된다

## Requirements

### Functional Requirements
1. versionBump 스킬의 Step 0 앞에 "Pre-check: Docs Consistency Gate" 단계를 추가한다
2. 해당 단계에서 `/reapdev.docsUpdate` 스킬을 실행하도록 지시한다
3. docsUpdate에서 불일치가 발견되면 수정 후 유저 확인을 받도록 한다
4. 문서가 최신 상태임이 확인된 후에만 Step 0 이하로 진행하도록 한다

### Non-Functional Requirements
1. 기존 Step 0 ~ Step 6의 내용은 변경하지 않는다

## Design

### Approaches Considered

| Aspect | Approach A: Step 0 앞에 별도 단계 추가 |
|--------|---------------------------------------|
| Summary | 기존 Step 0 앞에 "Pre-check: Docs Consistency Gate" 섹션을 삽입 |
| Pros | 기존 로직 변경 없음, 역할 분리 명확 (내용 검증 vs 구조 검증) |
| Cons | 없음 |
| Recommendation | 채택 |

### Selected Design
Step 0 앞에 "Pre-check: Docs Consistency Gate" 섹션을 추가. docsUpdate가 내용적 불일치(reap-guide vs README 등)를 잡고, 기존 Step 0이 구조적 불일치를 잡는 이중 검증 구조.

### Design Approval History
- 2026-03-22: 유저가 태스크 지시에서 설계 확정

## Scope
- **Related Genome Areas**: constraints.md (Slash Commands)
- **Expected Change Scope**: `src/templates/commands/reapdev.versionBump.md` 1개 파일
- **Exclusions**: docsUpdate 스킬 자체 수정 없음, 기존 Step 0~6 변경 없음

## Genome Reference
- constraints.md: reapdev.versionBump 슬래시 커맨드 등록 확인

## Backlog (Genome Modifications Discovered)
None

## Background
이전 세대(gen-121)에서 versionBump에 구조적 검증(Step 0)을 추가했으나, reap-guide.md vs README.md 같은 내용적 불일치는 잡지 못했다. docsUpdate 스킬이 이미 이런 내용적 불일치를 감지/수정하는 기능을 갖고 있으므로, versionBump 시작 시 docsUpdate를 선행 실행하면 내용+구조 양쪽 불일치를 모두 잡을 수 있다.

