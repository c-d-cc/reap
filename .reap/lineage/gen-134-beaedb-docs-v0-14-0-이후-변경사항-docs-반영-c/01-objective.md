# Objective

## Goal
docs: v0.14.0 이후 변경사항 docs 반영 — clean/destroy CLI 커맨드 추가, stage auto-transition 설명 업데이트

## Completion Criteria
1. README.md CLI Commands 테이블에 `reap clean`, `reap destroy` 추가
2. README.ko.md, README.ja.md, README.zh-CN.md에 동일하게 반영
3. src/templates/help/en.txt, ko.txt에 clean/destroy 추가
4. docs/src/i18n/translations/ 4개 파일(en, ko, ja, zh-CN)에 clean/destroy 추가
5. lifecycle 설명에서 `--phase complete` 자동 전환 반영 (이미 반영된 경우 확인만)

## Requirements

### Functional Requirements
1. README.md CLI Commands 테이블에 `reap clean` — "Reset REAP project with interactive options" 추가
2. README.md CLI Commands 테이블에 `reap destroy` — "Remove all REAP files from project (requires confirmation)" 추가
3. 4개 i18n README에 동일 구조로 반영 (각 언어 자연스러운 표현)
4. help 텍스트 파일(en.txt, ko.txt)에 clean/destroy 추가
5. docs 번역 파일(en.ts, ko.ts, ja.ts, zh-CN.ts)에 clean/destroy 항목 추가

### Non-Functional Requirements
1. 각 언어별 자연스러운 표현 유지
2. 기존 문서 구조(표, 코드블록) 유지

## Design

### Approaches Considered

| Aspect | Approach A |
|--------|-----------|
| Summary | 모든 대상 파일에 clean/destroy를 직접 추가 |
| Pros | 단순, 직관적 |
| Cons | 없음 (문서 변경만이므로) |
| Recommendation | 채택 |

### Selected Design
모든 대상 파일에 clean/destroy CLI 커맨드를 추가. `reap fix` 다음 위치에 배치.

### Design Approval History
- 2026-03-22: 단순 문서 추가이므로 브레인스토밍 생략

## Scope
- **Related Genome Areas**: 없음 (docs 전용)
- **Expected Change Scope**: README 4개, help txt 2개, i18n ts 4개 = 10 파일
- **Exclusions**: reapdev.* 커맨드는 문서에 포함하지 않음, 내부 구현(token 통합, phase nonce) 문서 반영 불필요

## Genome Reference
없음

## Backlog (Genome Modifications Discovered)
None

## Background
v0.14.0 이후 `reap clean`과 `reap destroy` CLI 서브커맨드가 추가되었으나 문서에 반영되지 않음. stage auto-transition은 이미 문서에 반영되어 있음을 확인.
