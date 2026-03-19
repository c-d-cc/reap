# Implementation

## Progress

### Task 1: Generation ID hash 생성 유틸
- [x] `generateGenHash()` 함수 — crypto.createHash('sha256'), 6자리 hex
- [x] `getMachineId()` 함수 — os.hostname()
- [x] `computeGenomeHash()` 함수 — genome/ 전체 content hash, 8자리 hex
- [x] `formatGenId()` 함수 — `gen-{seq}-{hash}`
- [x] `parseGenSeq()`, `parseGenHash()`, `isLegacyId()` 헬퍼

### Task 2: current.yml 스키마 확장
- [x] `GenerationType` 타입: `'normal' | 'merge'`
- [x] `GenerationState`에 `type?`, `parents?`, `genomeHash?` 추가
- [x] `GenerationMeta` 인터페이스 (lineage meta.yml용)

### Task 3: Generation 생성 로직 변경
- [x] `create()` — hash 기반 ID 생성, parents/genomeHash 포함
- [x] `nextSeq()` — seq 계산 분리
- [x] `resolveParents()` — 마지막 완료 gen을 parent로

### Task 4: DAG lineage 저장
- [x] `complete()` — meta.yml 생성, completedAt 기록
- [x] `readMeta()`, `listMeta()` — meta.yml 기반 DAG 조회

### Task 5: Backward compatibility
- [x] `current()` — type/parents 없으면 기본값 적용
- [x] `nextGenId()` — deprecated로 유지 (슬래시 커맨드 호환)
- [x] compression.ts — 새 ID 형식 regex 업데이트

### Task 6: Migration 로직
- [x] `migration.ts` 신규 생성
- [x] `needsMigration()` — meta.yml 없는 디렉토리 감지
- [x] `migrateLineage()` — legacy → DAG 변환 + 디렉토리 rename + parent chain

### Task 7: update 명령 연동
- [x] `reap update` 시 needsMigration → migrateLineage 실행

### Task 8: status 명령 DAG 표시
- [x] ProjectStatus에 type, parents, genomeHash 추가

### Task 9: 테스트
- [x] hash 유틸 테스트 (deterministic, 형식, 다른 입력)
- [x] computeGenomeHash 테스트 (deterministic, 변경 감지, 빈 디렉토리)
- [x] generation create/complete with new ID + meta.yml 테스트
- [x] parent chain 테스트 (2세대 연결)
- [x] backward compat 테스트 (legacy current.yml 읽기)
- [x] migration 테스트 (legacy 변환, parent chain, skip migrated, active gen)
- [x] integration test 업데이트 (새 ID 형식 regex)

### Task 10: Version bump
- [x] 0.3.5 → 0.4.0

## Validation Results
- `bun test`: 97 pass, 0 fail
- `bunx tsc --noEmit`: pass
- `npm run build`: pass (0.36 MB)

## Notes
- `e2path()` 헬퍼: Bun은 `path`, Node 20+는 `parentPath` 사용 — 둘 다 지원
- `nextGenId()`는 deprecated로 유지 — 슬래시 커맨드 템플릿에서 아직 참조할 수 있으므로

## Backlog (Genome Modifications Discovered)
- conventions.md: 커밋 메시지 형식 `feat(gen-NNN)` → `feat(gen-NNN-hash)` 반영 필요
- source-map.md: generation.ts 구조 변경 반영 필요 (hash 유틸, migration 모듈 추가)
- constraints.md: Generation ID 형식 변경 문서화 필요
