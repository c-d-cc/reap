# Planning

## Summary
`src/core/integrity.ts` 신규 모듈 생성, `reap fix --check` CLI 옵션 추가, onLifeCompleted hook 템플릿 설치.

## Technical Context
- **Tech Stack**: TypeScript, Commander.js, YAML
- **Constraints**: fs.ts 유틸 사용, Node.js fs/promises

## Tasks

### Phase 1: Core Integrity Module
- [x] T001 `src/core/integrity.ts` — IntegrityResult 타입 정의 및 checkIntegrity() 함수 신규 생성
  - config.yml 검증: 필수 필드(project, entryMode), 타입 검증
  - current.yml 검증: active일 때 필수 필드(id, goal, stage, genomeVersion, startedAt, timeline, type, parents), stage/type 유효성, recovery→recovers
  - lineage 검증: meta.yml 존재/필수 필드, completedAt ISO 유효성, parents 참조, 압축 .md frontmatter
  - genome 검증: L1 파일 존재(principles/conventions/constraints/source-map.md), ~100줄 초과 경고, placeholder 감지
  - backlog 검증: frontmatter(type, status) 필수/유효값, consumed→consumedBy
  - artifact 검증: 현재 stage 이전 artifact 존재, REAP MANAGED 헤더

### Phase 2: CLI Integration
- [x] T002 `src/cli/commands/fix.ts` — checkIntegrity import 및 checkProject() 함수 export
- [x] T003 `src/cli/index.ts` — fix 커맨드에 --check 옵션 추가, checkProject 호출

### Phase 3: Hook Template + Init
- [x] T004 `src/templates/hooks/onLifeCompleted.integrity-check.sh` — shell script 신규 생성
- [x] T005 `src/cli/commands/init.ts` — hook 템플릿 설치 로직 추가

## Dependencies
- T002 → T001 (integrity 모듈 필요)
- T003 → T002 (fix.ts의 checkProject 필요)
- T004, T005는 독립적이나 T004가 먼저 (템플릿이 있어야 설치)
