# Validation

## Test Results
- invenio에서 3개 generation 완료, lineage 정상 아카이브
- 모든 `reap run` command JSON 출력 유효
- back regression, abort, backlog consumption 동작 확인
- `bun test`: 518 pass / 0 fail (기존 테스트 영향 없음)

## Issues Found
1. backlog title: frontmatter title 무시 (minor)
2. abort: consumed backlog 미복원 (medium)
3. init: 기존 프로젝트 자동 adoption 미전환 (medium)
