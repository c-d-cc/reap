# Planning

## Summary
session-start.cjs (258줄)와 opencode-session-start.js (207줄)에서 중복되는 공통 로직을 `genome-loader.cjs`로 추출한다.

**추출 대상 로직:**
- Genome L1/L2 로딩 (파일 읽기 + 줄 수 budget + truncation)
- config.yml 파싱 (strict mode)
- current.yml 파싱 + stage→command 매핑
- Genome staleness 감지 + source-map drift 감지
- strict mode 섹션 빌드

**접근**: 공통 모듈은 함수를 export하는 순수 CJS 모듈. 각 hook 파일은 이 모듈의 함수를 호출하고, 자신만의 고유 로직 (Claude Code: JSON stdout, progress log, session-init format / OpenCode: plugin export, PATH resolution, language section)만 유지.

## Technical Context
- **Tech Stack**: CommonJS (.cjs/.js), Node.js fs (동기), child_process
- **Constraints**: 두 hook 모두 CJS 환경에서 require() 사용. 빌드 시 `src/templates/` → `dist/templates/` 전체 복사이므로 새 파일 자동 포함. init.ts 설치 로직 변경 불필요 (genome-loader.cjs는 hook 파일과 같은 디렉토리에 위치, require('./genome-loader.cjs')로 참조).

## Tasks

### Phase 1: 공통 모듈 생성
- [x] T001 `src/templates/hooks/genome-loader.cjs` 신규 생성 — 공통 유틸 함수 + Genome 로딩 + config/current 파싱 + staleness/drift 감지 + strict 섹션 빌드 export

### Phase 2: 기존 hook 리팩터링
- [x] T002 [P] `src/templates/hooks/session-start.cjs` — 공통 로직을 genome-loader.cjs import로 교체, Claude Code 고유 로직만 유지
- [x] T003 [P] `src/templates/hooks/opencode-session-start.js` — 공통 로직을 genome-loader.cjs import로 교체 + source-map.md L1 추가 + drift 감지 추가, OpenCode 고유 로직만 유지

### Phase 3: 검증
- [x] T004 `bun test` 실행
- [x] T005 `bunx tsc --noEmit` 실행
- [x] T006 `npm run build` 실행 + dist/templates/hooks/ 에 genome-loader.cjs 포함 확인

## Dependencies
- T002, T003 → T001 (공통 모듈 먼저 생성)
- T004~T006 → T002, T003 (리팩터링 완료 후 검증)
- T002, T003은 병렬 가능
