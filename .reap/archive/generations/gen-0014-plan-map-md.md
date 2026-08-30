---
id: gen-0014-plan
slug: map-md
type: plan
title: map.md — 저장 구조가 스스로를 설명한다
startedAt: 2026-08-23T00:57:04Z
startCommit: 4628522
status: closed
closedAt: 2026-08-23T01:00:19Z
endCommit: 443bcba
---

## Intent

`.reap/map.md`를 더한다. **각 폴더 계층이 무엇을 뜻하는지 그 파일 하나로 알 수 있어야 한다.**

vision · life · archive 3단은 이름만으로 안 읽힌다 — `vision`에 왜 `milestones`가 있고 `life`에 왜 `backlog`가 있는지가 자명하지 않다. 지금은 그 답이 `ps-4f2a91`에만 있는데, 그것은 REAP를 만드는 사람의 문서지 REAP를 쓰는 프로젝트의 것이 아니다.

**정해진 것 둘**
- `ctx`는 **상태 줄에 이름만 낸다.** 통째로 싣지 않는다 — `gen-0006-plan`·`gen-0007-plan`가 주입을 줄인 결론을 되돌리지 않는다
- **씨앗이다.** `init`이 한 번 쓰고 그다음은 프로젝트 것이다

**끝나면:** spec에 map.md의 자리와 규약이 있고, ms-002의 계획에 그것을 만드는 일이 들어가 있다. **구현은 하지 않는다** — 템플릿·`init`·`ctx` 한 줄은 Task 2.4다.

## References

- ps-4f2a91 `03-storage.md` · `06-agent.md`
- `.reap/vision/milestones/ms-002-저장-구조와-세대-유형/milestone.md`

## Outcome

`map.md`가 spec에 들어갔다.

- `03-storage.md` — 레이아웃에 `map.md`, 그리고 "`map.md` — 구조가 스스로를 설명한다" 절. **주입하지 않고 상태 줄이 이름만 낸다**는 것과 **씨앗이라 낡을 수 있다**는 대가를 함께 적었다
- `06-agent.md` — 상태 줄 예시에 `구조: .reap/map.md`
- `04-commands.md` — `doctor`가 `map.md`와 번들 템플릿의 어긋남을 보고한다. 씨앗의 대가를 검사로 갚는 자리

**씨앗을 고른 것은 낡을 위험을 받아들인 것이다.** 그 위험이 검사 가능하므로 `doctor` 항목으로 옮겼다 — 검증할 수 있는 것을 검증하지 않는 것도 원칙 6에 어긋난다.

ms-002의 Task 2.4가 `map.md`를 맡는다. 앞의 셋이 다 서야 내용이 확정되기 때문이다 — 2.2 전에 쓰면 `gen-0001-exec` 형식의 파일 이름을 적게 되고, 2.3 전에 쓰면 fix 세대와 `archive/generations/`의 관계를 못 적는다.

## Notes — 상대 링크가 한 칸씩 조용히 깨져 있었다

`vision/` 한 겹이 늘면서 기록 12개의 `../../../../docs/...`가 전부 어긋났다. **아무 에러도 안 났다.** `tracks.md`가 "한 칸 틀려도 아무 경고가 없다 — `doctor`가 잡을 후보"라고 적어둔 그대로다.

전부 다시 계산해 고쳤고, 34개를 전수 검사해 살아 있음을 확인했다. 정규식이 `docs/`만 보다가 `plugin/`을 가리키는 하나를 놓쳤고 **검사가 그것을 잡았다** — 고치는 코드보다 검사하는 코드가 값이 컸다.

`doctor`가 이것을 해야 한다는 근거가 이제 관측으로 있다.
