# Objective

## Goal

Legacy lineage 데이터의 무결성 문제를 정리한다:
1. `legacy-N` placeholder 날짜를 실제 git 커밋 시간 기반 ISO 날짜로 교정 (9건)
2. Compressed lineage .md 파일의 누락된 YAML frontmatter 복구 (7건)
3. `migration.ts`가 향후 migration 시 `legacy-N` 대신 git 커밋 시간을 사용하도록 개선

## Completion Criteria

- [ ] 9건의 legacy 날짜(`legacy-N`) 파일이 ISO 날짜로 교정됨
- [ ] 7건의 frontmatter 누락 파일에 올바른 YAML frontmatter가 추가됨
- [ ] `migration.ts`가 git log 기반 날짜 추정 헬퍼를 사용하도록 수정됨
- [ ] `reap fix --check`에서 관련 오류/경고 없음

## Requirements

### Functional Requirements

1. Legacy 날짜 교정: gen-004, gen-036, gen-039~045의 `startedAt/completedAt`를 git commit history에서 추정한 ISO 날짜로 교체
2. Frontmatter 복구: gen-102, gen-111, gen-113, gen-122~125의 .md 파일에 YAML frontmatter 추가 (id, type, parents, goal, genomeHash, startedAt, completedAt)
3. migration.ts 개선: L95-96의 `legacy-N` placeholder를 git log 기반 날짜 추정으로 대체

### Non-Functional Requirements

- 날짜는 정확할 필요 없으나 시간순이 맞아야 함
- 기존 lineage DAG 구조를 깨뜨리지 않아야 함
- git history가 없는 경우 전후 generation 시간에서 보간

## Design

### Approaches Considered

| Aspect | Approach A: 수동 교정 + migration.ts 수정 | Approach B: reap fix 명령 확장 |
|--------|-----------|-----------|
| Summary | 직접 lineage 파일 편집 + migration.ts 코드 수정 | reap fix에 자동 복구 로직 추가 |
| Pros | 단순하고 즉시 적용 가능 | 재사용 가능한 자동화 |
| Cons | 일회성 작업 | 과도한 엔지니어링 |
| Recommendation | **선택** — 일회성 데이터 정리에 적합 | |

### Selected Design

Approach A: 수동 교정 + migration.ts 수정
- git log로 각 generation의 실제 커밋 시간을 추출
- lineage .md 파일의 frontmatter를 직접 수정
- migration.ts에 git 커밋 시간 추정 헬퍼 함수 추가

### Design Approval History

- 2026-03-23: 초기 설계 확정

## Scope
- **Related Genome Areas**: lineage, migration
- **Expected Change Scope**: `.reap/lineage/*.md` (16건), `src/core/migration.ts`
- **Exclusions**: integrity.ts 변경 없음, reap fix 로직 확장 없음

## Genome Reference

- constraints.md: lineage 무결성 규칙
- conventions.md: ISO 날짜 형식

## Backlog (Genome Modifications Discovered)
None

## Background

`reap fix --check` 실행 시 legacy lineage 데이터에서 두 가지 문제가 발견됨:
1. migration.ts가 legacy generation을 마이그레이션할 때 날짜를 `legacy-N` placeholder로 채움
2. 일부 compressed lineage 파일이 YAML frontmatter 없이 생성됨
