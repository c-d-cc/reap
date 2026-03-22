---
type: task
status: consumed
consumedBy: gen-142-610ca8
---

# .reap/ 구조적 완전성 검사 도구

## 배경

REAP 프로젝트가 활발히 개발되면서 새 기능이 추가/변경될 때 .reap/ 폴더의 구조적 일관성이 깨질 수 있음. 자동 검사 도구가 필요.

## 요구사항

### 검사 대상 (`src/core/integrity.ts` 신규)

1. **config.yml 구조 검증**
   - 필수 필드 존재 여부 (project, entryMode, strict, language 등)
   - 필드 타입 검증 (string, boolean, object 등)
   - `ReapConfig` 타입과 일치 여부

2. **current.yml 구조 검증** (active generation 있을 때)
   - 필수 필드 (id, goal, stage, genomeVersion, startedAt, timeline, type, parents)
   - stage 값이 유효한 lifecycle stage인지
   - type이 유효한 GenerationType인지 ("normal" | "merge" | "recovery")
   - recovery type이면 recovers 필드 존재 여부

3. **lineage 구조 검증**
   - 각 generation 디렉토리에 meta.yml 존재
   - meta.yml 필수 필드 (id, type, parents, goal, genomeHash, startedAt, completedAt)
   - completedAt이 유효한 ISO 날짜인지 (NaN 버그 방지)
   - parents가 실제 존재하는 generation을 참조하는지
   - 압축된 .md 파일의 frontmatter 구조 검증

4. **genome 구조 검증**
   - L1 파일 존재 여부 (principles.md, conventions.md, constraints.md, source-map.md)
   - 줄 수 한도 (~100줄) 초과 경고
   - placeholder 패턴 감지

5. **backlog 구조 검증**
   - frontmatter 필수 필드 (type, status)
   - type이 유효한 값인지 (task, genome-change, environment-change)
   - status가 유효한 값인지 (pending, consumed)
   - consumed이면 consumedBy 필드 존재 여부

6. **artifact 구조 검증** (active generation 있을 때)
   - 현재 stage 이전 artifact 파일들 존재 여부
   - REAP MANAGED 헤더 존재 여부

### 통합 방식

- `reap fix --check` (또는 별도 `reap check`) CLI 커맨드로 실행 가능
- **onLifeCompleted hook으로 등록** — `.reap/hooks/onLifeCompleted.integrity-check.sh`
  - generation 완료 시 자동 실행
  - 검사 실패 시 warning 출력 (commit은 차단하지 않음, 경고만)
- 함수 시그니처: `checkIntegrity(paths: ReapPaths): Promise<IntegrityResult>`
  - `IntegrityResult = { errors: string[], warnings: string[] }`
  - errors: 반드시 수정 필요 (예: 필수 파일 누락)
  - warnings: 주의 필요 (예: 줄 수 초과, placeholder 감지)
