---
id: gen-0075-exec
slug: reap-v17-rebase
type: exec
backlog: bk-178d50
title: reap_v17 재구축 — v0.17.7 베이스에 다리를 다시 얹는다
startedAt: 2026-08-31T23:06:37Z
startCommit: 444b50b
status: closed
closedAt: 2026-08-31T23:15:52Z
endCommit: 57a2c56
---
## Intent

bk-178d50 — 사람 진단: origin/main은 v0.17.7 발행 후 v0.18 트랙 16커밋(gen-097~100·milestone 도입·carrier hash8 등)이 섞여 0.17.8의 베이스가 될 수 없다. `~/cdws/reap_v17`(GitHub clone, 브랜치 v0.17 @ 태그 v0.17.7=b4d3ae1)에 다리를 재작성한다 — 형태는 "구 관례 수동 준수"(사람): 코드는 patch, vision 문서는 구 형식으로, 구 파이프라인은 돌리지 않고 lineage를 손으로 위조하지도 않는다. reap-main과 미푸시 5커밋은 그대로 두되 폐기 예정으로 기록. 끝은 reap_v17에서 전체 unit + 다리 테스트 통과.

## Outcome

- **reap_v17** (GitHub clone, 브랜치 v0.17 @ 태그 v0.17.7=b4d3ae1) 커밋 5: f12ccd8(설계 문서 최종본) · c9c5c6a(다리 — 패치 재적용, gen-097 조각 제외) · be8da91(tests 서브모듈 v0.17-bridge=f4dbecb, ffd31ee 기반) · 6ce8a7d(9f13220 cherry-pick) · eedb291(79e40c4 번역 조각만). **unit 674 · e2e · scenario 전부 초록**, tsc·build 통과
- **베이스 자체 결함 발견·처리**: v0.17.7 태그 + 기록된 테스트 gitlink 조합은 daemon 위생 테스트가 빨갛다(태그 번역에 reap-daemon 잔존, 정리 커밋 9f13220·79e40c4는 태그 뒤). 태그 직후의 사용자 docs 정리만 선별 반입해 해소
- **~/cdws/reap-main worktree 삭제** (사람 지시 — main 위 0.17.8 작업은 폐기가 맞다). --force 필요했음(서브모듈 포함 worktree)
- **폐기 예정으로 남는 것**: main의 미푸시 4커밋(9e19d78·55c020d·363e6e3·440676a)과 reap-test의 4b29014 — 내용은 전부 reap_v17에 재작성됨. main 브랜치 자체의 리셋은 지시 없어 안 함

## Dead Ends

- **`bun test | tail` 뒤의 `&&`** — 종료 코드가 tail의 것이라 실패한 스위트로 커밋이 진행됐다. 검증 명령은 파이프 없이 exit를 받거나 `set -o pipefail`. lessons로 승격
- cherry-pick 진행 중 상태에서 잰 초록은 **미커밋 작업 트리의 초록**이었다 — skip 후 다시 빨개짐. 검증은 커밋된 상태에서
