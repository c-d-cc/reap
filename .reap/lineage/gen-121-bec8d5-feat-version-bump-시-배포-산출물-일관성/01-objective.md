# Objective

## Goal

`/reapdev.versionBump` 실행 시 배포 산출물 간 일관성을 자동 검증하는 단계를 추가하여, 커맨드 누락·help 텍스트 불일치·guide-readme-docs 간 용어 불일치를 version bump 전에 발견한다.

## Completion Criteria

1. versionBump 스킬에서 bump 실행 전 검증 단계가 호출된다
2. `src/templates/commands/` 실제 파일 목록과 `COMMAND_NAMES` 배열이 일치하지 않으면 경고를 출력한다
3. `src/templates/help/` (en.txt, ko.txt)가 현재 주요 슬래시 커맨드를 반영하는지 검증한다
4. `reap-guide.md`에 언급된 커맨드가 실제 존재하는지 cross-check한다
5. 검증 실패 시 유저에게 불일치 목록을 보여주고 계속 진행할지 묻는다
6. 검증 통과 시 기존 versionBump 흐름이 그대로 진행된다

## Requirements

### Functional Requirements

1. **FR-1**: versionBump 스킬의 step 1(변경사항 분석) 전에 "배포 산출물 일관성 검증" 단계를 삽입
2. **FR-2**: 슬래시 커맨드 일치 검증 — `src/templates/commands/reap.*.md` + `reapdev.*.md` 파일 목록 vs `COMMAND_NAMES` 배열 (init.ts)
3. **FR-3**: run script 매핑 검증 — `COMMAND_NAMES`의 각 `reap.*` 항목이 `src/cli/commands/run/` 에 대응하는 `.ts` 파일을 가지는지 (reapdev.* 제외)
4. **FR-4**: help 텍스트 검증 — `src/templates/help/en.txt`, `ko.txt`의 슬래시 커맨드 섹션이 주요 커맨드(lifecycle + utility)를 포함하는지
5. **FR-5**: guide 커맨드 참조 검증 — `reap-guide.md`의 execution sequence 섹션에서 참조하는 `/reap.*` 커맨드가 실제 커맨드 파일로 존재하는지
6. **FR-6**: 검증 결과를 불일치 항목 목록으로 유저에게 제시하고, 계속/중단 선택을 받음
7. **FR-7**: 불일치가 없으면 "모든 검증 통과" 메시지 후 자동으로 기존 흐름 진행

### Non-Functional Requirements

1. **NFR-1**: 검증 로직은 에이전트가 실행하는 스킬 프롬프트 내 지시사항으로 구현 (별도 스크립트 불필요)
2. **NFR-2**: `.reap/` 폴더는 검증 대상에서 제외
3. **NFR-3**: 검증 단계 추가로 기존 versionBump 흐름이 변경되지 않음 (추가만)

## Design

### Approaches Considered

| Aspect | Approach A: 스킬 내 인라인 검증 | Approach B: 별도 검증 스크립트 |
|--------|-------------------------------|-------------------------------|
| Summary | versionBump.md 스킬에 검증 지시사항 추가 | 별도 .ts 스크립트를 만들어 versionBump에서 호출 |
| Pros | 단일 파일 수정, 에이전트가 직접 검증, 유연한 판단 | 기계적 검증, 재사용 가능 |
| Cons | 에이전트 의존적, 검증 정확도 가변적 | 파일 추가 필요, 빌드 파이프라인 수정 |
| Recommendation | **채택** — reapdev 스킬은 에이전트 전용이므로 프롬프트 지시가 적합 | 불채택 |

### Selected Design

**Approach A: 스킬 내 인라인 검증**

`reapdev.versionBump.md` 스킬에 Step 0으로 "배포 산출물 일관성 검증" 단계를 추가한다. 에이전트가 파일시스템을 직접 읽고 비교하여 불일치를 검출한다.

검증 항목:
1. `src/templates/commands/` 파일 목록 ↔ `COMMAND_NAMES` 배열 (init.ts)
2. `COMMAND_NAMES`의 `reap.*` 항목 ↔ `src/cli/commands/run/` 파일 매핑
3. `src/templates/help/{en,ko}.txt` 슬래시 커맨드 섹션 ↔ 주요 커맨드 목록
4. `reap-guide.md` 커맨드 참조 ↔ 실제 커맨드 파일 존재 여부

### Design Approval History

- 2026-03-22: 초기 설계 — 인라인 검증 방식 채택

## Scope
- **Related Genome Areas**: constraints.md (Slash Commands 섹션)
- **Expected Change Scope**: `src/templates/commands/reapdev.versionBump.md` (1파일 수정)
- **Exclusions**: `.reap/` 폴더, runtime 코드 변경 없음

## Genome Reference

- constraints.md: Slash Commands 목록, CLI 구조
- conventions.md: Git Conventions, Release Conventions
- source-map.md: CLI 컴포넌트 구조

## Backlog (Genome Modifications Discovered)
None

## Background

현재 versionBump 스킬은 변경사항 분석 → bump 유형 제안 → 실행 순서로 동작하지만, 배포 산출물(커맨드 템플릿, help 텍스트, guide, README) 간 불일치를 검출하는 단계가 없다. 커맨드가 추가/삭제될 때 일부 파일만 업데이트되고 나머지가 누락되는 경우가 반복될 수 있으므로, bump 전에 자동 검증하여 불일치를 사전에 잡는다.

## Regression

이전 objective 회귀 사항: 없음 (최초 진입)
