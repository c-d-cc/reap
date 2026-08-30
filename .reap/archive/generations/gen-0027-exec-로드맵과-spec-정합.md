---
id: gen-0027-exec
slug: 로드맵과-spec-정합
type: exec
milestone: ms-003
title: 로드맵과 spec 정합
startedAt: 2026-08-23T03:57:14Z
startCommit: ba090aa
status: closed
closedAt: 2026-08-23T04:00:17Z
endCommit: 1e674eb
---

## Intent

`ms-003` task 3.4. 3.1~3.3이 코드·spec·skill을 크게 움직였다. **문서가 그것을 모른 채 남으면 다음 milestone이 옛 로드맵을 읽고 자른다.**

**무엇이 되면 끝인가:** 로드맵이 실제와 맞고, `environment/summary.md`가 지금 있는 명령과 skill을 맞게 적고, spec 안에 어긋남이 없고, 플러그인 설치본이 리포와 같다.

## Outcome

**문서가 3.1~3.3의 결과와 맞는다.**

| 무엇 | 어떻게 |
|---|---|
| 로드맵 증분 4 | `make backlog`·`make idea`가 `ms-003`으로 갔다. 남은 것은 **만든 뒤의 수명** — 표시(`bk-ce5006`)와 이동(`bk-c92489`). 왜 당겨왔는지도 적었다 |
| 로드맵 증분 3 | "plan generation"을 지웠다. `make generation --plan`은 증분 1부터 돈다 |
| 어휘 문서 | **spec을 리포에 맞췄다.** `08-delivery`가 파일 둘을 적었지만 실제로는 `record-vocabulary.md` 하나가 둘을 담는다. 그게 맞는 이유도 적었다 — 나누면 어느 것을 링크할지가 skill마다 판단이 된다 |
| `environment/summary.md` | 매 세션 주입되므로 낡으면 매번 틀린 것을 읽힌다. milestone 디렉토리 구성 · ISO 시간 규범 · 지금 있는 명령 · **spec이 약속한 skill 7종 중 셋만 있다**는 사실 |

`ms-002`가 미룬 Minor 넷의 마지막(`record-vocabulary.md`가 두 어휘를 한 파일에)이 여기서 닫혔다 — **고칠 것은 파일이 아니라 spec이었다.**

## 검증

- 전수 검사 범위를 넓혔다: spec 10 + plugin 6 + `map.md` + `summary.md` + genome 3 = **19개 파일 · 링크 16 · 경로 인용 11 · 깨진 것 0**
- 사라진 것(`context.md`·`build-context`·`decisions.md`·`reap decide`·`milestone-vocabulary`)의 잔여 셋은 전부 **왜 없어졌는지를 설명하는 서술**이다
- `bun test` 103 · `typecheck` 0 · `hook.test.sh` 통과 · `build` 정상
- **플러그인을 반영했다** — `localUpdate` 절차대로. `find src -newer dist/reap` = 0, 캐시본과 리포 `diff` 차이 없음
- **실제 새 세션을 열어 주입을 눈으로 확인했다**(`claude -p`). 상태 줄에 `milestone.md · handoff.md`만 나오고 `context.md`도 `decisions.md`도 없다. **이것은 `ms-001`부터 handoff가 "이 세션이 못 하는 것"으로 남겨온 항목이었다**
