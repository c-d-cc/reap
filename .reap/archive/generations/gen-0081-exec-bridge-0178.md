---
id: gen-0081-exec
slug: bridge-0178
type: exec
milestone: ms-019
title: 0.17.8 준비 — bump·릴리스 노트·upgrade agent URL·전 스위트
startedAt: 2026-09-03T15:10:34Z
startCommit: 212ed1e
status: closed
closedAt: 2026-09-04T00:16:38Z
endCommit: b69a7d6
---
## Intent

ms-019 task 3 — `~/cdws/reap_v17`(브랜치 v0.17)에서 0.17.8 bump, RELEASE_NOTES 0.17.8 절, docs 버전 정합, upgrade agent URL 결정, 전 스위트 초록, 커밋(push는 사람). Q2(언어)는 답 전이라 추천 A(한국어 전용 고지)로 적는다.

수행: subagent가 reap_v17에서. 이 기록은 주 세션이 쓴다.
## Outcome

reap_v17 v0.17 브랜치 커밋 0f25750 — 0.17.8 bump·RELEASE_NOTES 승격 구조·NOTICE·로케일 5·upgrade agent 3단계에 마켓플레이스 명령 구체화·머리에 main 실재 요구 한 줄. `check-docs-version.sh` 0 · `npm run build` 0 · `bun test` 1047 통과(90파일) · `check-self-diagnosis.sh` 전 항목 통과(OpenCode 설치돼 있어 SKIP 없음). push·태그 없음.

**남은 것**: 노트의 "v0.18은 한국어 전용" 문장은 사람 Q2 답(en 전환)으로 틀렸다 — ms-021 task 3이 지운다.

## Dead Ends

- subagent가 백그라운드로 돌린 `bun test`의 완료 알림을 못 받아 40분 넘게 멈췄다 — 주 세션이 프로세스 부재를 보고 재촉해서야 진행. 검증은 포그라운드에서 exit code를 직접 받는다(lessons의 파이프 규칙과 같은 결)
- v0.17 바이너리 실행이 홈에 자체 설치를 남겼다(lessons에 올림, 사람 승인 뒤 정리)
