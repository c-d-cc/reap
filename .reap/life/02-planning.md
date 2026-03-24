# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.
# Planning

## Summary
auto-update guard 메커니즘 구현 (3개 파일) + release-notes 문서 페이지 추가 + versionBump 스킬 업데이트

## Technical Context
- **Tech Stack**: TypeScript (src/), CJS (session-start hooks), React+Vite (docs/)
- **Constraints**: semver 비교 외부 dep 없이 인라인, Node.js >=18

## Tasks

### Task 1: package.json에 reap.autoUpdateMinVersion 추가
- **파일**: `package.json`
- **작업**: `"reap": { "autoUpdateMinVersion": "0.15.0" }` 필드 추가
- **위험도**: 낮음

### Task 2: semver 비교 유틸 함수 구현
- **파일**: `src/core/semver.ts` (신규)
- **작업**: `semverGte(a, b)` — 외부 dep 없이 인라인 semver 비교
- **위험도**: 낮음

### Task 3: selfUpgrade()에 autoUpdateMinVersion 체크 추가
- **파일**: `src/cli/commands/update.ts`
- **작업**:
  1. npm view로 최신 패키지의 `reap.autoUpdateMinVersion` 조회
  2. 설치 버전 < minVersion이면 SelfUpgradeResult에 `blocked: true`, `reason` 반환
  3. 기존 upgrade 로직 앞에 guard 추가
- **위험도**: 중간 (npm view 추가 호출)

### Task 4: session-start.cjs에 autoUpdateMinVersion guard 추가
- **파일**: `src/templates/hooks/session-start.cjs`
- **작업**:
  1. auto-update 분기(131줄 부근)에서 npm view로 minVersion 조회
  2. semverGte 인라인 함수로 비교
  3. 차단 시 autoUpdateMessage 대신 경고 메시지 + release-notes 링크
- **위험도**: 중간

### Task 5: opencode-session-start.js에 동일 guard 추가
- **파일**: `src/templates/hooks/opencode-session-start.js`
- **작업**: session-start.cjs와 동일 로직 적용 (44줄 부근 auto-update 체크)
- **위험도**: 중간

### Task 6: Release Notes 문서 페이지 추가
- **파일들**:
  - `docs/src/pages/ReleaseNotesPage.tsx` (신규)
  - `docs/src/App.tsx` (라우트 추가)
  - `docs/src/components/AppSidebar.tsx` (네비게이션 추가)
  - `docs/src/i18n/translations/en.ts` (번역 키 추가)
  - `docs/src/i18n/translations/ko.ts` (번역 키 추가)
  - `docs/src/i18n/translations/ja.ts` (번역 키 추가)
  - `docs/src/i18n/translations/zh-CN.ts` (번역 키 추가)
- **작업**:
  1. RELEASE_NOTICE.md 기반으로 0.15.x 버전별 섹션 구성
  2. 최신 버전 상단 배치
  3. 페이지 상단에 "0.16 breaking change 예정" 경고 카드
- **위험도**: 낮음

### Task 7: versionBump 스킬에 autoUpdateMinVersion 갱신 단계 추가
- **파일**: `.claude/commands/reapdev.versionBump.md`
- **작업**: step 5와 6 사이에 breaking change 감지 시 autoUpdateMinVersion 갱신 단계 추가
- **위험도**: 낮음

## Dependencies
- Task 1 먼저 (다른 모든 task의 기반)
- Task 2 먼저 (Task 3이 사용)
- Task 3, 4, 5는 독립적으로 병렬 가능 (단, Task 2 완료 후)
- Task 6은 독립적
- Task 7은 독립적
