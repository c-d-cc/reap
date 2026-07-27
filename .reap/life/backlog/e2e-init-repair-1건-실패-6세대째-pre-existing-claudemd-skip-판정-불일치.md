---
type: task
status: pending
priority: medium
createdAt: 2026-07-27T12:31:52.895Z
---

# e2e init-repair 1건 실패 — 6세대째 pre-existing, CLAUDE.md skip 판정 불일치

## Problem

`bun test tests/e2e/` 가 6세대 연속 1건 실패 중이다. 매번 "pre-existing 이므로 무관" 으로 넘어갔다.

```
tests/e2e/init-repair.test.ts:103
  expect(result.context.skipped).toContain("CLAUDE.md (REAP section already present)")
  Expected to contain: "CLAUDE.md (REAP section already present)"
  Received: []
```

**시나리오** (L98-103): `.reap/config.yml` 이 있고 `CLAUDE.md` 에 `.reap/genome/` 참조가 이미 있는 프로젝트에서 `reap init --repair` 를 돌리면, "이미 있으니 건너뛴다"가 `skipped` 에 담겨야 한다. 실제로는 `skipped` 가 비어 있다.

`repair.ts` (전체 48줄)는 `ensureClaudeMd` 의 반환값으로 분기한다:

```ts
const claudeMdAction = await ensureClaudeMd(paths.root, projectName);
if (claudeMdAction === "created" || claudeMdAction === "appended") {
  repaired.push(...);
} else {
  skipped.push("CLAUDE.md (REAP section already present)");
}
```

`skipped` 가 비었다는 것은 `ensureClaudeMd` 가 `"created"` 또는 `"appended"` 를 반환했다는 뜻이다. 즉 **테스트가 준비한 CLAUDE.md 를 REAP 섹션 없음으로 판정**하고 있다.

유력한 원인: gen-054 의 marker-hash sync 도입 이후 `ensureClaudeMd` 가 `.reap/genome/` 문자열 존재가 아니라 **`<!-- reap:start {hash} -->` 마커**로 판정하도록 바뀌었을 가능성. 그렇다면 테스트의 fixture(마커 없는 plain CLAUDE.md)가 낡은 것이고, `"updated"` 를 반환하고 있을 수 있다. **확인 필요 — 아직 추정이다.**

## 왜 지금 backlog 로 만드는가

gen-072~076 에서 6번 관찰됐고 6번 다 "다음 세대 hints" 로만 넘어갔다.

gen-076(interview) 이 longterm 에 남긴 교훈이 정확히 이것이다:

> **Hints are not backlog**: an item repeated in "next generation hints" for five generations was read and passed over every time; the same class of problem got fixed one generation after it became a backlog file.

scenario 5건도 같은 경로를 밟다가 **backlog 가 된 다음 세대에서 고쳐졌다**(gen-074). 교훈을 적어놓고 같은 항목을 7번째로 미루면 그 교훈은 무의미하다.

## 왜 방치가 비용인가

- 매 세대 validation 에서 "이게 회귀인가 기존인가"를 판단해야 한다. environment baseline 기록으로 비용이 낮아졌을 뿐 사라지지 않았다
- **그 테스트가 무엇을 지키려 했는지 아무도 모르는 상태**로 시간이 간다. 6세대면 도입 맥락이 흐려진다
- e2e 가 "1 fail 이 정상" 인 상태면, 진짜 회귀가 1건 더 생겨도 "2 fail 인데 원래 1 fail 이었지" 로 넘어갈 여지가 생긴다

## Out of Scope

- `ensureClaudeMd` 의 marker-hash sync 동작 자체를 바꾸는 것 — gen-054 의 설계이고 잘 동작 중이다. 본 건은 **테스트와 현재 동작의 불일치**를 해소하는 것
- 다른 pre-existing 항목 (현재 없음)

## Solution 방향 (조사 후 확정)

먼저 **어느 쪽이 틀렸는지** 판정한다:

**(a) 테스트가 낡았다** — `ensureClaudeMd` 가 마커 기준으로 바뀌었고 fixture 가 그것을 반영하지 않음
→ fixture 에 마커를 넣거나, 기대값을 `"updated"` 로 수정

**(b) 구현이 틀렸다** — 마커 없는 기존 CLAUDE.md 를 만나면 `"skipped"` 여야 하는데 매번 갱신하고 있음
→ 실사용 영향 확인 필요. 사용자가 `init --repair` 를 돌릴 때마다 CLAUDE.md 가 재작성된다면 그 자체가 문제

**(b)일 경우가 더 중요하다.** 단순히 테스트를 고치고 넘어가면 실제 결함을 덮는다. `git log -- src/cli/commands/init/common.ts` 로 `ensureClaudeMd` 의 판정 로직 변경 이력을 확인하고, 테스트가 도입된 시점의 의도와 대조한다.

## Files to Change

- `tests/e2e/init-repair.test.ts` — (a) 채택 시
- `src/cli/commands/init/common.ts` `ensureClaudeMd` — (b) 채택 시
- `.reap/environment/summary.md` § Tests — baseline 수치 갱신 (e2e 1 fail → 0)

## Acceptance

1. `bun test tests/e2e/` → **0 fail**
2. 어느 쪽이 틀렸는지 판정 근거가 artifact 에 기록됨 (테스트를 고쳤다면 왜 구현이 옳은지, 반대면 왜 테스트가 옳았는지)
3. (b)였다면 실사용 영향 확인 — `init --repair` 반복 실행 시 CLAUDE.md 가 불필요하게 재작성되지 않는지
4. environment baseline 이 `e2e 0 fail` 로 갱신되어 다음 세대가 "1 fail 이 정상" 이라고 읽지 않음

## Open Decisions

- [ ] (a)/(b) 판정 — 조사 선행
