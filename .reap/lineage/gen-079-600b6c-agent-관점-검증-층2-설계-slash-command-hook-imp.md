---
id: gen-079-600b6c
type: embryo
goal: "agent 관점 검증 (층2) 설계 — slash command·hook·import 가 실제로 동작하는지 확인하는 절차"
parents: ["gen-078-f00d1b"]
---
# gen-079-600b6c
**Goal**: agent 가 REAP 설치물을 실제로 읽고 동작하는지 확인하는 검증(층 2). 0.17.3 묶음 3/3.

**결과**: 완료. **backlog 는 "설계 필요"였으나 실측으로 구현까지 갔다.**

**핵심 산출물**: `scripts/check-agent-integration.sh` — 헤드리스 agent 를 구동하고 **파일 시스템 상태로 판정**. gen-063 재현 시 잡는 것을 실증.

**부수**: `reapdev.versionBump` Step 5-2, `reap-guide.md` § Verifying a Release, 0.17.3 릴리즈 노트 3세대분 일괄 보강

**검증**: 게이트 4종 전부 pass / unit 470-0 / e2e 272-0 / scenario 44-0