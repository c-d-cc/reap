---
id: gen-0070-exec
slug: migrate-core
type: exec
milestone: ms-015
title: migrate skill 골격 — 판정·차단·고지·격리
startedAt: 2026-08-31T14:09:37Z
startCommit: 46fca34
status: closed
closedAt: 2026-08-31T14:09:38Z
endCommit: a659750
---
## Intent

ms-015 task 1 — `plugin/skills/migrate/SKILL.md` 신설(앞 절반: 판정 지문·차단 둘·고지와 동의·격리·되돌리기), 미결 3건 확정(열린 generation은 block / design→idea/files + 승격 안내 / lineage·sequence 비승계). 판정 지문은 실측 교정 반영 — agentClient는 v0.18에도 있어 지문이 못 된다.

## Outcome

- v0.18에 `plugin/skills/migrate/SKILL.md` — 8단계 절차(각 단계 N/8 표시), 판정 지문(교정: agentClient·language는 양쪽에 있어 지문이 아님 — v0.17 전용 config 필드 + 구조 표지로), 차단 둘(uncommitted·열린 generation), 고지 셋(분량 실측·토큰·비파괴), 격리와 **되돌리기 한 줄**, init 시 language·agentClient 승계. 6/8 이주는 references/migration-map.md로 위임(task 2)
- 미결 3건 확정 → 04-migration-skill.md 갱신: block / idea·files+안내 / 비승계

## References

- reap v0.18: 직후 커밋. 판정 교정 실측: v0.18 config.yml = language·agentClient 두 줄뿐
