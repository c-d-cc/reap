# Hook System

> REAP lifecycle event에 자동 실행되는 hook 규칙

## Events

| Event | Trigger | Timing |
|-------|---------|--------|
| onGenerationStart | `/reap.start` 후 | generation 생성 직후 |
| onStageTransition | `/reap.next` 후 | stage 전진 직후 |
| onGenerationComplete | `/reap.next` (archiving) 후 | git commit 이후, 변경사항 uncommitted |
| onRegression | `/reap.back` 후 | stage 회귀 직후 |

## Hook Types

### command
- shell 명령어 실행
- project root directory에서 실행
- 예: `reap update`, `npm run lint`

### prompt
- AI 에이전트에게 지시하는 텍스트
- 에이전트가 읽고 판단하여 실행
- 판단이 필요한 작업에 적합 (문서 업데이트, 코드 리뷰 등)
- 예: "이번 Generation 변경사항을 README에 반영하라"

## Execution Rules

- 같은 event 내 hook은 정의 순서대로 순차 실행
- command와 prompt 중 하나만 사용 (entry 당)
- onGenerationComplete hook은 커밋 이후 실행 → 변경사항이 있으면 별도 커밋 필요

## Config Format

```yaml
# .reap/config.yml
hooks:
  onGenerationComplete:
    - command: "reap update"
    - prompt: "README를 업데이트하라."
```

## SessionStart Hook (별도)

- Claude Code의 `~/.claude/settings.json`의 `hooks.SessionStart`에 등록 (REAP project hook과 별도)
- 매 세션 시작 시 REAP guide + generation 상태 주입
- `reap init`/`reap update`가 자동 관리
- hooks.json에서 settings.json으로 migration: `reap update` 실행 시 자동 수행
