---
id: gen-0072-exec
slug: agent-body
type: exec
milestone: ms-015
title: upgrade agent 본문 — placeholder를 채운다
startedAt: 2026-08-31T14:11:53Z
startCommit: d19201d
status: closed
closedAt: 2026-08-31T14:12:06Z
endCommit: 73acbe3
---
## Intent

ms-015 task 3 — main의 `docs/upgrade-agent/reap-upgrade.md` placeholder를 실제 흐름(전제 확인 → @next 설치·검증 → 플러그인 설치 안내 → /reap:migrate 호출 → 마무리)으로. 실패 시 중단·수동 안내, 절반 상태 금지. 끝은 placeholder 문구 소멸 + main unit 스위트 무회귀.

## Outcome

main **440676a** — agent 본문 완성: 5단계(전제·@next 설치·플러그인 안내·/reap:migrate 위임·마무리), 모든 단계 실패=중단+수동 안내, 데이터는 migrate의 격리 전 무접촉 명시. placeholder 문구 소멸. unit 829 무회귀.
