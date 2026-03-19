# Planning

## Summary

Generation ID를 hash 기반으로 전환하고, lineage를 DAG 구조로 변경하며, 기존 프로젝트의 migration을 지원한다. Minor version bump 0.3.4 → 0.4.0.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, Commander.js, YAML
- **Constraints**: 외부 서비스 의존 없음, 로컬 파일시스템만 사용, Node.js crypto 모듈 사용 가능

## Tasks

### Task 1: Generation ID hash 생성 유틸
- **파일**: `src/core/generation.ts`
- **내용**:
  - `generateGenHash(parents, goal, genomeHash, machineId, startedAt)` → 6자리 hex
  - Node.js `crypto.createHash('sha256')` 사용
  - `getmachineId()` — `os.hostname()` 기반
  - `computeGenomeHash(genomePath)` — genome/ 디렉토리 전체의 content hash
  - `formatGenId(seq, hash)` → `gen-{seq}-{hash}`

### Task 2: current.yml 스키마 확장
- **파일**: `src/types/index.ts`
- **내용**:
  - `GenerationState`에 필드 추가:
    - `type`: `'normal' | 'merge'` (기본값: `'normal'`)
    - `parents`: `string[]` (부모 generation ID 배열)
    - `genomeHash`: `string` (시작 시점 genome hash)
  - 기존 필드 유지 (backward compat)

### Task 3: Generation 생성 로직 변경
- **파일**: `src/core/generation.ts`
- **내용**:
  - `nextGenId()` → `nextGenId()` + hash 생성 결합
  - seq 계산: 기존 로직 유지 (lineage 스캔)
  - hash 계산: Task 1의 유틸 사용
  - `create()` 메서드: parents, genomeHash, type 포함하여 current.yml 작성
  - 새 generation의 parent = 직전 완료된 generation ID

### Task 4: DAG lineage 저장
- **파일**: `src/core/generation.ts`
- **내용**:
  - `complete()` 메서드: lineage 디렉토리명을 `gen-{seq}-{hash}-{goal-slug}` 형식으로
  - lineage 디렉토리 내 `meta.yml` 생성:
    ```yaml
    id: gen-042-a3f8c2
    type: normal
    parents: [gen-041-7b2e1f]
    goal: "..."
    genomeHash: abc123
    startedAt: ...
    completedAt: ...
    ```
  - `listCompleted()`: meta.yml 파싱하여 DAG 구조 반환

### Task 5: Backward compatibility
- **파일**: `src/core/generation.ts`, `src/core/lifecycle.ts`
- **내용**:
  - 구 형식 감지: `gen-NNN` (hash 없음) vs `gen-NNN-{hash}`
  - `resolveGenId(idOrLegacy)` — 구 ID 입력 시 매핑 테이블에서 새 ID 반환
  - current.yml 읽기: type/parents 없으면 기본값 적용 (`type: 'normal'`, `parents: []`)
  - lineage 스캔: meta.yml 없는 디렉토리는 legacy로 처리

### Task 6: Migration 로직
- **파일**: `src/core/migration.ts` (신규)
- **내용**:
  - `migrateLineage(reapDir)`:
    1. `.reap/lineage/` 스캔
    2. meta.yml 없는 디렉토리 = legacy
    3. 각 legacy generation에 대해:
       - 디렉토리명에서 seq 추출 (`gen-NNN-...`)
       - goal: 01-objective.md에서 추출 (또는 디렉토리명의 slug)
       - parents: 이전 seq의 generation ID (선형이므로)
       - genomeHash: genome 스냅샷 없으므로 `'legacy'` 표기
       - hash 생성 → meta.yml 작성
    4. 디렉토리 rename: `gen-NNN-slug` → `gen-NNN-{hash}-slug`
    5. 활성 generation 있으면 current.yml도 변환
  - `needsMigration(reapDir)` → boolean
  - `reap update` 명령에 migration 호출 추가

### Task 7: update 명령 연동
- **파일**: `src/commands/update.ts`
- **내용**:
  - `reap update` 시 `needsMigration()` 체크
  - migration 필요 시 사용자에게 안내 후 실행
  - migration 결과 리포트 출력

### Task 8: status 명령 DAG 표시
- **파일**: `src/commands/status.ts`
- **내용**:
  - lineage 표시 시 parents 관계 출력
  - 현재는 선형이므로 크게 바뀌지 않지만, DAG 준비

### Task 9: 테스트
- **파일**: `tests/`
- **내용**:
  - hash 생성 유틸 테스트
  - generation create/complete with new ID 테스트
  - migration 테스트 (legacy lineage → new format)
  - backward compat 테스트 (구 형식 current.yml 읽기)

### Task 10: Version bump + 슬래시 커맨드 템플릿 업데이트
- **파일**: `package.json`, `src/templates/commands/`
- **내용**:
  - `0.3.4` → `0.4.0`
  - 슬래시 커맨드에서 gen ID 참조하는 부분 업데이트 (있다면)

## Dependencies

```
Task 1 (hash 유틸)
  ↓
Task 2 (타입 확장) → Task 3 (생성 로직) → Task 4 (DAG 저장)
                                              ↓
Task 5 (backward compat) → Task 6 (migration) → Task 7 (update 연동)
                                                    ↓
Task 8 (status) ─────────────────────────────────→ Task 9 (테스트)
                                                    ↓
                                                 Task 10 (version bump)
```
