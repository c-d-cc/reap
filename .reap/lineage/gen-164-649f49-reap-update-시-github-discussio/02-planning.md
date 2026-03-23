# Planning

## Summary
`reap update` 완료 후 GitHub Discussions에서 현재 버전의 release notice를 fetch하여 표시하는 기능 추가.
새 모듈 `src/core/notice.ts` 생성, CLI update action에 통합.

## Technical Context
- **Tech Stack**: TypeScript, Node.js >=18, Commander.js
- **Constraints**:
  - `execSync`로 `gh api graphql` 호출 (report.ts, update.ts 기존 패턴)
  - 외부 서비스 의존 없음 원칙 — notice fetch는 best-effort (실패 시 skip)
  - 함수 50줄 이하, 단일 책임

## Tasks

### Phase 1: Core Module
- [x] T001 `src/core/notice.ts` -- 신규 모듈 생성: `fetchReleaseNotice(version, language)` 함수
  - GraphQL 쿼리로 Announcements 카테고리 discussions 조회
  - 제목에서 버전 매칭 (예: "v0.16.0" 포함 여부)
  - body에서 language 섹션 추출 (`## ko`, `## en` 등)
  - 실패 시 null 반환 (try-catch 전체 래핑)
- [x] T002 `src/core/notice.ts` -- `extractLanguageSection(body, language)` 헬퍼 함수
  - `## {lang}` 헤더 이후 ~ 다음 `## ` 헤더 전까지 추출
  - 매칭 섹션 없으면 null 반환

### Phase 2: CLI Integration
- [x] T003 `src/cli/index.ts` -- update command action에 notice fetch + 표시 로직 추가
  - integrity check 이후, try-catch 내에서 호출
  - language 감지: `AgentRegistry.readLanguage()` 사용
  - notice가 있으면 구분선 + 내용 표시

## Dependencies
- T002 → T001 (T002는 T001 내에서 사용)
- T003 → T001 (T003은 T001의 함수를 import)
- Phase 1 완료 후 Phase 2 진행
