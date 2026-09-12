---
id: ms-028
slug: archive-on-close
title: 닫는 즉시 archive — generation·flux·backlog가 완료와 함께 옮겨진다, cleanup 은퇴
from: flux-0004-plan
status: closed
openedAt: 2026-09-05T08:32:28Z
closedAt: 2026-09-12T03:00:30Z
---
## Background

사람 결정(2026-09-05): life의 generation·flux·backlog를 완료 뒤에도 남겨 두지 않고 닫는 즉시 archive로 옮긴다. 지금은 세 종류가 제각각이다 — 세대는 milestone 종료 시 `cleanup` skill이 "참고 가치"를 판단해 내리고, flux는 닫힌 것 10개를 넘으면 CLI가 오래된 것부터 내리고, backlog는 consumed 뒤 `--archived`를 따로 불러야 한다. 이번 세션의 실측: 닫힌 세대를 다시 읽은 경우는 전부 handoff.md를 거쳤고, cleanup의 판단은 스킬 본문 스스로가 "근거 없이 남겼다"고 적을 만큼 흔들렸다. 위치 이동은 판단이 아니라 결정적인 일이니 CLI가 한다. archive는 위치일 뿐이라 잃는 것은 없다.

## Exit Criteria

- `mark generation --closed`·`mark flux --closed`·`mark backlog --consumed`가 표시와 함께 `archive/`로 옮긴다. `--aborted`는 그대로 삭제. `--archived`는 옛 규칙으로 life에 남은 것을 내리는 용도로 남는다. `CLOSED_FLUXS_KEPT`와 overflow 로직 삭제. 테스트가 세 이동을 검사한다
- `cleanup` skill 삭제. carve-milestone의 종료 순서는 fitness → `mark milestone --closed` 둘. complete·help·evolve·flux·migrate(매핑 #3)에서 cleanup과 "닫혔지만 남는다" 전제가 사라진다. skill 10종, 메뉴 8종
- spec(ps-4f2a91) 03-storage "life는 작업 세트다" 절과 02-flow·04-commands·05-knowledge·06-agent·08-delivery의 cleanup 언급이 새 규칙으로. `src/templates/map.md`와 이 리포의 `.reap/map.md` 동기화
- README en·ko·사이트(storage·closing milestone·generation·backlog·skill 표·v018change)가 새 규칙을 말한다. ClosingMilestonePage의 cleanup 절 삭제
- 이 리포의 life에 남은 닫힌 것들(세대 7·backlog 5·flux)이 archive로 내려가 있고 doctor 결함 0

## Out of Scope

- 옛 규칙으로 남은 것을 자동으로 내리는 migration — `--archived`를 손으로 부르면 된다(0.18.0 미발행이라 사용자 없음)
- idea의 archive 규칙 — 그대로(`mark idea --archived`, 판단)

## Plan Items

1. CLI 세 이동 + 테스트 (tasks/1)
2. skill·spec·map.md (tasks/2)
3. 문서·사이트 + 이 리포 life 정리 (tasks/3)

## Fitness (사람, 2026-09-12)

- **상태 파악** — "더 명확해졌다. life/를 보면 열린 것만 있어서 지금 무엇이 진행 중인지 바로 보인다." 이 milestone이 노린 것이 그것이었다. 위치 이동을 판단에서 떼어낸 대가로 얻으려던 것이 실제로 얻어졌다
- **cleanup 은퇴** — "닫힌 세대를 다시 찾아야 했던 적이 없다. handoff.md로 충분했다." 폐기의 근거였던 실측(닫힌 세대를 다시 읽은 경우는 전부 handoff를 거쳤다)이 은퇴 뒤에도 그대로 유지됐다. 되살릴 이유 없음
- 미뤄진 답 없음 — `idea/research/`로 옮길 것이 없다

## 닫으며 정리한 것

세 task 뒤에도 `cleanup`을 부르는 서술이 넷 남아 있었다 — `entries.ts` 주석, spec `06-agent`의 종료 절차 3단, spec `03-storage`의 idea archive 주체, `environment/summary.md`의 증분 목록. 커밋 16cc500과 이 세대 밖 정리로 전부 새 규칙에 맞췄다.
