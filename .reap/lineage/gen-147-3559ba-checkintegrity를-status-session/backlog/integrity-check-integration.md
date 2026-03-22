---
type: task
status: consumed
priority: high
consumedBy: gen-147-3559ba
---

# checkIntegrity를 status, session-init, update 후에 호출

## 목표

`checkIntegrity()`가 0.1초로 빠르므로, 주요 진입점에서 자동 실행하여 문제를 조기 감지한다.

## 호출 지점

| 위치 | 시점 | 표시 방식 |
|------|------|-----------|
| `reap status` | 상태 출력 시 | errors/warnings 카운트 표시, 상세는 `reap fix --check` 안내 |
| session-start hook | 세션 시작 시 | session init 블록에 integrity 상태 표시 (예: `🔴 Integrity: 3 errors`) |
| `reap update` | 업데이트 완료 후 | 설치/마이그레이션 결과와 함께 integrity 검사 결과 출력 |

## 구현 방향

- `reap status`: `cli/commands/status.ts`에서 `checkIntegrity()` 호출, 결과 요약 출력
- session-start hook: `session-start.cjs`에서 `reap fix --check` 실행하고 exit code로 판단, 또는 integrity 로직을 CJS로 포팅
- `reap update`: `cli/commands/update.ts` 마지막에 `checkIntegrity()` 호출, 문제 발견 시 경고 출력

## 고려사항

- session-start hook은 CJS(Node.js)로 동작 → integrity.ts는 ESM/TypeScript → 빌드 시 CJS 번들에 포함하거나 `reap fix --check` 서브프로세스 호출
- 성능: 0.1초이므로 세 곳 모두에서 호출해도 UX 영향 없음
- falsy 검사(user-level skills/commands)도 이 통합 시점에 함께 추가 (migration-spec-use-integrity backlog 참조)
