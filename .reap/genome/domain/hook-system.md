# Hook System

> REAP lifecycle event에 자동 실행되는 hook 규칙

## Events

| Event | Trigger | Timing |
|-------|---------|--------|
| onGenerationStart | `/reap.start` 후 | generation 생성 직후 |
| onStageTransition | `/reap.next` 후 | stage 전진 직후 |
| onGenerationComplete | `/reap.next` (archiving) 후 | git commit 이후, 변경사항 uncommitted |
| onRegression | `/reap.back` 후 | stage 회귀 직후 |

## File-Based Hooks

`.reap/hooks/` 디렉토리에 개별 파일로 정의. 네이밍: `{event}.{name}.{ext}`

```
.reap/hooks/
├── onGenerationComplete.version-bump.md
├── onGenerationComplete.reap-update.sh
├── onGenerationComplete.docs-update.md
└── onGenerationComplete.release-notes.md
```

- `.md` → AI prompt (에이전트가 읽고 실행)
- `.sh` → shell script (project root에서 실행)

## Frontmatter / Comment Headers

`.md` 파일: YAML frontmatter
```yaml
---
condition: has-code-changes
order: 10
---
```

`.sh` 파일: comment header
```bash
# condition: always
# order: 20
```

## Conditions

- `always` (기본값) — 항상 실행
- `has-code-changes` — src/ 파일이 이번 generation에서 변경됨
- `version-bumped` — package.json version ≠ 마지막 git tag

## Execution Rules

- 같은 event 내 hook은 `order` 순 (같으면 알파벳순)
- condition이 충족되지 않으면 skip
- onGenerationComplete hook은 커밋 이후 실행 → 변경사항은 별도 커밋

## Hook Suggestion

- Completion Phase 5에서 최근 3개 generation 분석
- 반복 패턴 감지 시 유저에게 event/condition/name/내용을 순차 확인 후 hook 파일 생성
- 한 번에 최대 2개 제안

## SessionStart Hook (별도)

- Claude Code의 `~/.claude/settings.json`의 `hooks.SessionStart`에 등록
- 매 세션 시작 시 REAP guide + generation 상태 주입
- `reap init`/`reap update`가 자동 관리
