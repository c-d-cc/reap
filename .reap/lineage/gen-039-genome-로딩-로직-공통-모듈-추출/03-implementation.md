# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/templates/hooks/genome-loader.cjs` 신규 생성 — 공통 유틸 + Genome 로딩 + config/current 파싱 + staleness/drift + strict 섹션 + health 빌드 | Yes |
| T002 | `src/templates/hooks/session-start.cjs` — genome-loader.cjs import로 리팩터링, 258→113줄 | Yes |
| T003 | `src/templates/hooks/opencode-session-start.js` — genome-loader.cjs import + source-map.md 추가 + drift 감지 추가, 207→119줄 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- genome-loader.cjs는 source-map.md의 줄 수 한도 헤더 파싱 로직도 포함
- L1_FILES 상수에 source-map.md 포함하여 opencode 측 누락 자동 해결
- opencode 쪽 genome-loader.cjs 로딩은 여러 경로 후보를 순차 탐색 (plugins/ 설치 위치 차이 대응)
