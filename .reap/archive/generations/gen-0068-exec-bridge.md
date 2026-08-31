---
id: gen-0068-exec
slug: bridge
type: exec
milestone: ms-014
title: 0.17.8 다리 — 일일 캐시·next 안내·upgrade agent 경로
startedAt: 2026-08-30T23:57:13Z
startCommit: cf5a843
status: closed
closedAt: 2026-08-31T00:01:34Z
endCommit: 4bc5059
---
## Intent

ms-014 task 3 — main 구 코드에 §9 다리 셋: ① check-version의 npm 조회 일일 캐시(~/.reap/), ② `next` 태그에 0.18↑ 있으면 이행 안내, ③ `reap update`의 upgrade agent 설치 경로(네트워크 실패 시 중단). 발행·bump 없음. 끝은 main 스위트+새 테스트 통과.

## Outcome

main **363e6e3** (tests 서브모듈 4b29014) — §9 다리 셋:
- `src/core/upgrade-bridge.ts` — 일일 캐시(getRegistryVersionsDaily, 실패는 캐시 안 함)와 안내(upgradeAnnouncement, floor 0.18.0·prerelease 제외)
- `check-version` — queryNextVersion 추가, execute가 캐시를 통해 performAutoUpdate의 기존 seam에 주입(결정 순서 무변경), next 안내 출력
- `reap update` — installUpgradeAgent(전부-또는-전무, 실패 시 수동 안내)와 배선. agent 정의 stub은 `docs/upgrade-agent/reap-upgrade.md`(본문은 M3 뒤)
- 검증: 새 테스트 11 + 전체 unit 829 통과, tsc 무결. 발행·bump 없음

## References

- reap main: 363e6e3 · reap-test: 4b29014 · 설계: 승계 §9 (latest→next 조정을 코드 주석에 남김)
