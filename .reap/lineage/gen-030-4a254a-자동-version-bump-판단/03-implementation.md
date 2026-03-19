# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `.reap/config.yml` onGenerationComplete hooks 첫 번째에 version bump 판단 prompt 추가 | 2026-03-18 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- version bump prompt를 기존 hooks 앞에 배치하여 후속 hook(reap update, docs, release notes)이 새 버전을 참조 가능
- `npm version {type} --no-git-tag-version` 사용하여 package.json만 수정 (커밋/태그 자동 생성 안 함)
- docs-only 변경은 version bump skip 규칙 포함
