---
id: gen-0109-exec
slug: archive-on-close-cli
type: exec
milestone: ms-028
title: CLI — closed·consumed가 곧 archive 이동, flux overflow 삭제
startedAt: 2026-09-05T08:32:28Z
startCommit: f8b655f
status: closed
closedAt: 2026-09-05T08:36:06Z
endCommit: 03c796c
---

## Intent

ms-028 tasks/1. `mark generation --closed`·`mark flux --closed`·`mark backlog --consumed`가 표시와 함께 `archive/`로 옮긴다(사람 결정 2026-09-05). `--aborted`는 삭제 그대로. `--archived`는 옛 규칙으로 life에 남은 것을 내리는 용도로 남기되 이미 archive면 거부. `CLOSED_FLUXS_KEPT`·overflow 삭제. 테스트가 세 이동과 재이동 없음을 검사한다. skill·spec·문서는 tasks/2·3.

## References

- ms-028 milestone.md Background · `src/entries.ts` markGeneration/markFlux/markBacklog(개정 전)

## Outcome

commit 03c796c(주 트리)·tests 1267af2. bun test 238 통과, typecheck, doctor 결함 0.

- `entries.ts`: `moveToArchive` 하나로 세 이동. `markGeneration --closed`는 patch·hooks 뒤 이동, `markFlux --closed`는 patch 뒤 이동(`CLOSED_FLUXS_KEPT`·`archiveOverflowFlux` 삭제), `markBacklog --consumed`는 patch 뒤 이동. 이미 archive에 있으면 옮기지 않는다. `--archived`는 archive면 `entries.already_archived`로 거부
- 테스트: 옛 "life에 남는다" 검사 셋을 archive 검사로, overflow 검사를 즉시 이동 검사로, backlog consumed 이동 검사 둘 추가
- 이 세대의 기록 자체가 이 규칙의 첫 실물 — 닫히면 archive로 간다
- summary.md: 해당 없음. 독립 검증: 생략 — 변경이 함수 셋이고 테스트 238이 덮는다(한 줄 판단, 검증 절의 "몇 줄이면 생략" 조항)

## Dead Ends

- `--archived` 플래그 삭제 — migrate 매핑 #3·이 리포의 옛 잔여(닫힌 채 life에 있는 세대 7)를 내릴 길이 필요하다. 남긴다
