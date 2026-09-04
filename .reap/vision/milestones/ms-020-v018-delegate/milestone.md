---
id: ms-020
slug: v018-delegate
title: evolve 위임 모드 — subagent가 세대를 수행하고 주 세션이 검토·닫는다
from: loop-0004-plan
refs:
  - ps-5e948f:07-i18n-docs-delegate.md
status: open
openedAt: 2026-09-04T00:04:12Z
---
## Background

사람 Q4 답 B(2026-09-04). v0.17 `/reap.evolve`의 값(주 세션 컨텍스트 보호)을 `evolve`의 선택지로. 규범은 [07-i18n-docs-delegate.md](../../../../docs/reap-plan/reap_v_0_18_release/07-i18n-docs-delegate.md)의 G12. loop-0004 자체가 이 모드로 돌았다 — gen-0076~0082의 subagent 지시문이 brief의 원형이다.

## Exit Criteria

- `evolve/SKILL.md`에 "직접 할 것인가, 위임할 것인가" 판단 절과 위임 절차(Intent → brief → subagent → 검토 → complete)가 있다. 신호 셋(맥락 부담·사람 요청·병렬)이 적혀 있다
- `evolve/references/delegate-brief.md` 템플릿 — 읽을 것·규율(id 발급 금지, `.reap/` 불가침, push 금지, 테스트 먼저, 파이프 없는 검증)·끝낼 때(Outcome·Dead Ends, 닫지 않음)·보고 형식. 채울 자리가 `{{...}}`로 표시
- `complete/SKILL.md`가 위임된 세대의 검토(diff 읽기·테스트 실행·subagent가 적은 Outcome 확인)를 커밋 규칙 앞에 둔다
- `06-agent.md`의 evolve 절에 위임 판단이 들어가고, "REAP는 여기서부터 관여하지 않는다"가 유지된다는 문장이 있다
- 실물: 이 리포에서 작은 exec 세대 하나를 **위임 모드로** 열어 subagent가 수행하고 주 세션이 닫는다 — 그 세대가 ms-021의 첫 세대여도 된다

## Out of Scope

- worktree 자동화·orchestrate 변경 — 병렬은 orchestrate skill이 이미 다룬다
- CLI 변경 — 위임은 skill 산문이다. `ctx --for-subagent` 같은 도구는 신호가 오면

## Plan Items

1. evolve·complete·06-agent·brief 템플릿 (tasks/1) — 한 세대
2. 실물 — ms-021 첫 세대를 위임 모드로 (ms-021이 담는다)

## 이 milestone이 끝나면 물어볼 것

- brief 템플릿을 그대로 준 subagent가 규율을 어겼는가 (어긴 것이 곧 템플릿의 구멍)
- 위임한 세대의 검토에 주 세션이 얼마나 읽어야 했는가 — 그것이 위임의 실제 절감이다
