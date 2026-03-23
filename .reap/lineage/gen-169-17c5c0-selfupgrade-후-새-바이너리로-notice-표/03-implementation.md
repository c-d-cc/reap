# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/cli/index.ts` — `--show-notice` 숨겨진 핸들러 추가 (process.argv 직접 파싱, program.parse() 전에 early exit) | 2026-03-24 |
| T002 | `src/cli/index.ts` — update action Step 4에서 selfUpgrade 성공 시 `execSync('reap --show-notice <version> --show-notice-lang <lang>')` 로 새 바이너리 호출 | 2026-03-24 |
| T003 | `src/cli/index.ts` — selfUpgrade 미발생 시 기존 `fetchReleaseNotice()` 직접 호출 유지 확인 | 2026-03-24 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| - | - | - | - |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | - | - |

## Implementation Notes
- Commander.js의 hidden option 대신 `process.argv` 직접 파싱 방식 채택. 이유: Commander가 파싱하기 전에 즉시 처리하여 다른 command 등록과 충돌 없이 동작.
- `upgrade` 변수를 `if (!options.dryRun)` 블록 밖으로 hoisting하여 Step 4에서 접근 가능하게 수정. dry-run 시 `{ upgraded: false }`로 초기화.
- `upgrade.to` 버전을 사용하여 새 바이너리에서 해당 버전의 notice를 가져옴 (현재 프로세스의 `getCurrentVersion()`이 아닌 새 버전).
- 타입체크 통과, 620 테스트 전체 통과 확인.
