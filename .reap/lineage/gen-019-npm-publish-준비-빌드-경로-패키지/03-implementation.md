# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `paths.ts` — existsSync로 dev/dist 경로 감지 | ✅ |
| T002 | `package.json` — bin→dist/cli.js, files→dist/, scripts.build, engines | ✅ |
| T003 | 빌드 + dist/templates/ 정상 생성 확인 | ✅ |
| T004 | bun test 93 pass, tsc pass | ✅ |
| T005 | npm publish --dry-run: 29 files, 97.7kB, 중복 없음 | ✅ |

## Implementation Notes
- build 스크립트에 `rm -rf dist/templates` 추가하여 재빌드 시 중복 방지
- npm pkg fix로 repository.url, bin 정규화
