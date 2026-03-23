# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/core/notice.ts` — `fetchReleaseNotice(version, language)` 함수 생성 | yes |
| T002 | `src/core/notice.ts` — `extractLanguageSection(body, language)` 헬퍼 함수 | yes |
| T003 | `src/cli/index.ts` — update command에 notice fetch + 표시 통합 | yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| - | - | - | - |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | - | - |

## Implementation Notes
- `src/core/notice.ts` 신규 생성: GraphQL로 GitHub Discussions 조회, 버전 매칭, 언어별 섹션 추출
- `src/cli/index.ts`의 update action에 Step 4로 notice fetch 로직 추가 (integrity check 이후)
- 모든 외부 호출은 try-catch로 래핑, 실패 시 graceful skip
- `getCurrentVersion()` import 추가, `AgentRegistry.readLanguage()` 기존 import 재사용
