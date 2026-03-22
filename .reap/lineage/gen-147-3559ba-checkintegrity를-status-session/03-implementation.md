# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/cli/commands/status.ts` — `ProjectStatus`에 `integrity` 필드 추가, `getStatus()`에서 `checkIntegrity()` 호출 | Yes |
| T002 | `src/cli/index.ts` — status 핸들러에서 integrity 결과 출력 (errors/warnings 카운트 + 안내) | Yes |
| T003 | `src/cli/index.ts` — update 핸들러 마지막에 `checkProject()` 호출, 결과 출력 | Yes |
| T004 | `src/templates/hooks/session-start.cjs` — `reap fix --check` 서브프로세스 호출, stdout 파싱, session init 블록에 integrity 상태 추가 | Yes |
| T005 | 빌드 확인 — `node scripts/build.js` 성공 | Yes |
| T006 | 타입체크 — `bunx tsc --noEmit` 통과 | Yes |
| T007 | 기존 테스트 — `bun test` 600 pass, 0 fail | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes

### 변경 파일 요약

1. **`src/cli/commands/status.ts`**: `checkIntegrity` import 추가, `ProjectStatus`에 `integrity` 필드 추가, `getStatus()`에서 호출
2. **`src/cli/index.ts`**:
   - status 핸들러: integrity 카운트 출력 (OK 또는 N errors, M warnings)
   - update 핸들러: 마지막에 `checkProject()` 호출하여 integrity 상태 출력 (best-effort, try-catch)
3. **`src/templates/hooks/session-start.cjs`**:
   - totalSteps 7→8
   - `reap fix --check` 서브프로세스 호출, exit code/stdout 파싱
   - session init 블록에 integrity 상태 한 줄 추가 (OK/errors+warnings/check failed)

### 설계 결정

- update에서는 `checkProject()` (fix.ts에서 이미 export) 재사용 — `checkIntegrity()` 직접 import 대신
- session-start.cjs에서 integrity 체크 실패 시 `🟡 Integrity — check failed`로 표시 (서브프로세스 실행 자체 실패)
- update의 integrity 체크는 try-catch로 감싸서 REAP 프로젝트가 아닌 경우에도 안전하게 동작
