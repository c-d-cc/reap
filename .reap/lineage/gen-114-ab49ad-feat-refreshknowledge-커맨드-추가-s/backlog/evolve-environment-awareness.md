---
type: task
status: consumed
priority: medium
consumedBy: gen-114-ab49ad
---

# refreshKnowledge 커맨드 추가 — subagent REAP context 로딩

## 문제

- SessionStart hook은 subagent에서 실행되지 않음 (Claude Code 확인)
- `reap run evolve`의 subagentPrompt에 Genome Summary만 포함, Environment Summary 누락
- subagent가 environment 불일치를 감지할 수 없음
- 실제 사례: gen-112에서 `.claude/commands/` → `.claude/skills/` 마이그레이션 시 environment outdated 미인지

## 개선 방향

### `reap run refreshKnowledge` 커맨드 신규 추가

- session-start.cjs의 context 생성 로직 재사용
- stdout로 REAP guide + Genome + Environment + current state 출력
- subagent가 실행하여 full REAP context 확보

### evolve subagentPrompt 경량화

- 기존: Genome Summary를 subagentPrompt에 직접 임베딩
- 변경: "먼저 `reap run refreshKnowledge`를 실행하여 REAP context를 로드하라" 지시만 포함
- 장점: prompt 경량화, 항상 최신 context, 범용 사용 가능

### completion 단계 개선

- environment 변경 필요성 검토 항목 추가
- 필요 시 `type: environment-change` backlog 생성 유도
