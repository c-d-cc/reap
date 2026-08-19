---
type: task
status: pending
priority: low
createdAt: 2026-08-19T13:04:57.015Z
---

# list-carriers 가 산문 속 예시 문법을 carrier 로 센다 — `reap:carrier(id)` 오탐

## Problem

`scripts/list-carriers.sh` 는 `reap:carrier(<id>)` 를 grep 해 ID 별 파일 목록을 만든다. **그 문법을 설명하는 산문도 함께 걸린다.**

`RELEASE_NOTES.md:27` 이 기능을 사용자에게 설명하며 `` `reap:carrier(id)` `` 라고 적었고, 스크립트는 이것을 **`id` 라는 이름의 carrier** 로 센다. 실제로 그런 사실은 존재하지 않는다.

이 오탐은 gen-085 까지 **조용했다** — `.reap/vision/memory/longterm.md` 의 교훈 하나도 같은 예시 문법을 갖고 있어 "2 files" 로 잡혔고, `--orphans` 는 2개 이상이면 말하지 않는다. gen-085 가 그 교훈을 (genome 에 명문화됐으므로) 삭제하자 남은 하나가 **고아로 보고되기 시작했다.**

```
$ bash scripts/list-carriers.sh --orphans
id  (1 file — orphan)
    RELEASE_NOTES.md
```

**왜 고치는 값어치가 있나**: `--orphans` 의 쓸모는 "여기 나온 것은 전부 진짜 누락"이라는 데 있다. 상시로 가짜 항목을 하나 내면 사람이 그 출력을 훑고 넘기게 된다 — genome § "게이트를 무디게 하는 것을 같이 넣지 마라" 가 말하는 상태다.

## Solution

세 방향. **(A) 를 권한다.**

- **(A) 자리표시자 문법을 정하고 스캐너가 무시한다** — 산문에서는 `reap:carrier(<id>)` 처럼 꺾쇠를 쓰기로 하고, 스크립트가 `<` 또는 `>` 를 포함한 ID 를 건너뛴다. 1줄 필터 + 문서 1글자. **`~/.reap/reap-guide.md` 와 `.reap/genome/application.md` 의 예시도 같이 봐야 한다** — 그쪽은 실제 ID(`claude-code-commands-path`)를 예로 들고 있어 정상 집계되며, 그 성질을 유지할지 판단할 것
- **(B) 특정 파일 제외** — `RELEASE_NOTES.md` 를 스캔에서 뺀다. 임의적이고 다음 문서에서 재발한다
- **(C) 그대로 두고 문서화** — `--orphans` 출력에 알려진 오탐이 있다고 적는다. 검사를 무디게 하는 쪽이라 권하지 않는다

**먼저 실패시킬 것**: 고치기 전에 `--orphans` 가 `id` 를 보고하는지 확인하고(현재 상태가 그것이다), 고친 뒤 사라지는지 + **진짜 고아**(아무 파일에나 새 ID 하나를 심어서)는 여전히 보고되는지 둘 다 확인한다. 후자가 없으면 필터가 과하게 먹었는지 알 수 없다.

## Files to Change

- `scripts/list-carriers.sh` — ID 추출 필터
- `RELEASE_NOTES.md:27` — 자리표시자 표기 (릴리즈 문서이므로 소유자 확인 후)
- `~/.reap/reap-guide.md` / `src/templates/reap-guide.md` / `.reap/genome/application.md` — 예시 표기 일관성 판단
