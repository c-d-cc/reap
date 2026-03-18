# Implementation Log

## Regression
- **From**: validation
- **Reason**: scope 확장(v0.2.2 version bump 추가) + 템플릿 동기화 필요
- **Refs**: tests/commands/update.test.ts:22, src/templates/hooks/session-start.sh
- **Affected**: 04-validation.md (재검증 필요)

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `session-start.sh` staleness 감지 `git rev-list --count`에 `-- src/ tests/ package.json tsconfig.json scripts/` 경로 필터 추가 | 2026-03-18 |
| T002 | `package.json` version 0.2.1 → 0.2.2 | 2026-03-18 |
| T003 | `npm run build && reap update`로 템플릿/hook 동기화 | 2026-03-18 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- `git rev-list --count HASH..HEAD -- path1 path2` 형태로 경로 필터 추가
- 코드 관련 경로만 카운트: `src/`, `tests/`, `package.json`, `tsconfig.json`, `scripts/`
- docs/, README.md, .reap/ 등의 변경은 staleness 카운트에서 제외됨
- version bump 후 build + reap update로 설치된 hook/commands 동기화 완료
- 다음 generation 목표로 자동 version bump 판단 기능을 backlog에 기록
