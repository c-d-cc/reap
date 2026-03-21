---
type: task
status: consumed
consumedBy: gen-104-e65f10
---

# help topic 모드에서 reap-guide.md를 context로 포함

## 현상
- help topic 요청 시 context에 REAP 지식이 없음
- AI가 session-start hook으로 로드된 genome에 의존하지만, 그건 사용자 프로젝트의 genome
- REAP 자체의 lifecycle, hooks, merge 규칙 등은 reap-guide.md에 있음

## 기대 동작
- help topic 모드일 때 REAP 패키지의 reap-guide.md 내용을 context에 포함
- AI가 정확한 REAP 지식 기반으로 topic 설명

## 관련 코드
- `src/cli/commands/run/help.ts` — topic 모드 emitOutput의 context에 추가
- `src/core/paths.ts` — ReapPaths.packageHooksDir로 reap-guide.md 경로 접근
