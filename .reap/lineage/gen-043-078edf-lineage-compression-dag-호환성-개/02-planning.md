# Planning

## Summary

Compression이 DAG 메타데이터를 보존하도록 개선하고, 정렬/보호 로직을 DAG 호환으로 전환. OpenShell E2E 테스트를 필수 validation으로 추가.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, YAML frontmatter
- **Constraints**: 기존 압축된 .md 파일(frontmatter 없음)과 backward compat 필요

## Tasks

### Task 1: Level 1 압축에 DAG frontmatter 추가
- **파일**: `src/core/compression.ts`
- **내용**:
  - `compressLevel1()`: 압축 전 meta.yml 읽기
  - 출력 .md에 YAML frontmatter 추가 (id, type, parents, genomeHash, completedAt)
  - meta.yml 없는 경우(legacy) frontmatter 생략 (backward compat)

### Task 2: 정렬 로직 completedAt 기반 전환
- **파일**: `src/core/compression.ts`
- **내용**:
  - `LineageEntry`에 `completedAt` 필드 추가
  - `scanLineage()`: meta.yml 또는 .md frontmatter에서 completedAt 파싱
  - 정렬: completedAt 기준 (없으면 genNum fallback)

### Task 3: DAG leaf node 기반 보호 로직
- **파일**: `src/core/compression.ts`
- **내용**:
  - `compressLineageIfNeeded()`: "최근 3개"를 completedAt 기준으로 선정
  - 추가로 DAG leaf node(다른 generation의 parent로 참조되지 않는 것)는 보호
  - leaf node 판정: listMeta()로 전체 parents 수집 → 참조되지 않은 ID = leaf

### Task 4: listMeta()에서 압축된 .md frontmatter 읽기
- **파일**: `src/core/generation.ts`
- **내용**:
  - `listMeta()`: 디렉토리 meta.yml + 파일 frontmatter 모두 수집
  - `readCompressedMeta(filePath)`: .md frontmatter에서 GenerationMeta 파싱
  - frontmatter 없는 legacy .md는 skip

### Task 5: E2E 테스트 환경 검증
- **파일**: `tests/e2e/migration-e2e.sh`
- **내용**:
  - 스크립트 시작 시 `openshell` CLI 존재 확인
  - 없으면 에러 메시지 + exit 1:
    "ERROR: openshell CLI not found. OpenShell E2E tests are mandatory. Install: uv tool install -U openshell"
  - sandbox 접속 불가 시에도 명확한 에러

### Task 6: Compression 테스트
- **파일**: `tests/core/compression.test.ts`
- **내용**:
  - Level 1 압축 후 frontmatter에 meta 보존 확인
  - completedAt 기반 정렬 확인
  - leaf node 보호 확인
  - frontmatter 없는 legacy .md backward compat

### Task 7: Genome 업데이트 (Completion에서 반영)
- constraints.md: Validation Commands에 OpenShell E2E 추가
- source-map.md: compression.ts 설명 업데이트

## Dependencies

```
Task 1 (frontmatter 추가)
  ↓
Task 2 (정렬 전환) → Task 3 (보호 로직)
  ↓
Task 4 (listMeta 확장) → Task 6 (테스트)
                           ↓
Task 5 (E2E 환경 검증) → Task 7 (Genome)
```
