# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | src/templates/genome/source-map.md 빈 템플릿 생성 | 2026-03-19 |
| T002 | templates/genome/principles.md Birth→Completion, Layer Map→Source Map | 2026-03-19 |
| T003 | templates/genome/conventions.md, constraints.md Birth→Completion | 2026-03-19 |
| T004 | init.ts genomeTemplates에 source-map.md 추가 | 2026-03-19 |
| T005 | session-start.sh L1 루프에 source-map.md 추가 | 2026-03-19 |
| T006 | .reap/hooks/ 파일 리네임 + frontmatter (event prefix naming) | 2026-03-19 |
| T007 | .reap/config.yml hooks 섹션 제거 | 2026-03-19 |
| T009 | slash commands (next, start, back) hook 실행 지시 → 파일 스캔 방식 | 2026-03-19 |
| T010 | reap-guide.md hooks 문서 업데이트 | 2026-03-19 |
| - | preset/bun-hono-react/source-map.md 추가 (테스트 실패 수정) | 2026-03-19 |

## Implementation Notes
- preset 디렉토리에도 source-map.md가 필요했음 (init --preset 테스트에서 발견)
- .sh 파일은 frontmatter 대신 comment 헤더 사용 (# condition: always)
