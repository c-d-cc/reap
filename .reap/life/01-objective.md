# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.
# Objective

## Goal
auto-update guard 구현: 0.16.0 breaking change 대비 자동 업데이트 차단 + release-notes 문서 페이지 추가

## Completion Criteria
1. package.json에 `reap.autoUpdateMinVersion` 필드 존재 (초기값 "0.15.0")
2. `selfUpgrade()`가 npm에서 minVersion 조회 후 installed < minVersion이면 차단 (SelfUpgradeResult에 blocked 상태 반영)
3. session-start.cjs에서 auto-update 전 minVersion 체크, 차단 시 경고 메시지 + release-notes 링크
4. opencode-session-start.js에서 동일한 minVersion 체크 적용
5. 차단 메시지에 https://reap.cc/docs/release-notes 링크 포함
6. docs/ 사이트에 /docs/release-notes 페이지 추가 (0.15.x 릴리스 노트, breaking change 카드)
7. versionBump 스킬에 breaking change 시 autoUpdateMinVersion 갱신 단계 추가

## Requirements

### Functional Requirements
1. `autoUpdateMinVersion` 메커니즘: npm registry에서 최신 패키지의 minVersion을 조회, 현재 설치 버전이 minVersion 미만이면 자동 업데이트 차단
2. 차단 시 사용자에게 breaking change 경고 + 수동 업데이트 안내 (release-notes 링크 포함)
3. session-start hooks(CJS, OpenCode)에서도 동일한 guard 적용
4. release-notes 문서 페이지: 0.15.x 버전별 변경사항, 상단에 breaking change 안내 카드
5. versionBump 스킬: breaking change 시 autoUpdateMinVersion 업데이트 단계 추가

### Non-Functional Requirements
1. semver 비교는 외부 의존성 없이 인라인 구현
2. npm view 실패 시 업데이트를 차단하지 않음 (graceful fallback)
3. docs 페이지는 기존 docs 사이트 패턴(DocLayout, DocPage, i18n) 준수

## Design

### Approaches Considered

| Aspect | Approach A: npm view 기반 | Approach B: 로컬 semver range 기반 |
|--------|-----------|-----------|
| Summary | npm view로 최신 패키지의 minVersion 조회 | 로컬에 허용 range를 하드코딩 |
| Pros | 배포 시점에 제어 가능, 유연 | 네트워크 불필요 |
| Cons | npm view 추가 호출 | 버전마다 코드 수정 필요, 유연성 낮음 |
| Recommendation | **선택** | |

### Selected Design
**Approach A: npm view 기반 autoUpdateMinVersion**

- package.json의 `reap.autoUpdateMinVersion` 필드에 최소 호환 버전 기록
- npm view로 최신 패키지의 이 필드를 조회
- 설치 버전 < minVersion이면 차단, 사용자에게 경고 + release-notes 링크

### Design Approval History
- 2026-03-24: 이전 세션에서 설계 합의 완료 (notes/auto-update-guard.md)

## Scope
- **Related Genome Areas**: constraints.md (semver 비교 인라인), conventions.md (커밋 형식)
- **Expected Change Scope**: package.json, src/cli/commands/update.ts, src/templates/hooks/session-start.cjs, src/templates/hooks/opencode-session-start.js, docs/src/pages/ReleaseNotesPage.tsx, docs/src/App.tsx, docs i18n files, .claude/commands/reapdev.versionBump.md
- **Exclusions**: 실제 0.16.0 배포는 이번 세대 범위 밖

## Genome Reference
- constraints.md: "semver 비교는 외부 dep 없이 인라인 구현"
- conventions.md: 함수 단일 책임 50줄 이하, async/await, 커밋 형식

## Backlog (Genome Modifications Discovered)
None

## Background
REAP 0.16.0에서 breaking change가 예정되어 있어, 0.15.x 사용자가 자동 업데이트로 의도치 않게 0.16.x로 올라가는 것을 방지해야 한다. notes/auto-update-guard.md에 상세 설계가 기록되어 있다.
