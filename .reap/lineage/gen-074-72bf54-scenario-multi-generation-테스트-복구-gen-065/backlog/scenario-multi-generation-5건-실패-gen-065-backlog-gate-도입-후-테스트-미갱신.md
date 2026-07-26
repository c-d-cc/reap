---
type: task
status: consumed
priority: medium
createdAt: 2026-07-26T03:55:38.415Z
consumedBy: gen-074-72bf54
consumedAt: 2026-07-26T05:17:48.943Z
---

# scenario multi-generation 5건 실패 — gen-065 backlog gate 도입 후 테스트 미갱신

## Problem

`bun test tests/scenario/` 가 5건 실패한다 (35 pass / 5 fail). 전부 `tests/scenario/multi-generation.test.ts` 한 파일.

```
(fail) scenario: multi-generation lifecycle > gen2: start
(fail) scenario: multi-generation lifecycle > gen2: learning → validation
(fail) scenario: multi-generation lifecycle > gen2: completion
(fail) scenario: multi-generation lifecycle > lineage has >= 2 entries
(fail) scenario: multi-generation lifecycle > git log has feat(gen-*) commits
```

**루트 코즈** — `multi-generation.test.ts:78-79`:

```ts
const result = await cli(dir, "run", "start", "--goal", "second generation", "--type", "embryo");
expect(result.status).toBe("ok");   // Received: "prompt"
```

gen-065 가 도입한 **backlog gate** 때문이다. `--backlog` / `--no-backlog` 없이 pending backlog 가 존재하면 `run start` 는 `status: "prompt"` + `phase: "select-backlog"` 를 emit 하고 generation 을 만들지 않는다 (설계된 동작, `src/cli/commands/run/start.ts`).

gen1 이 남긴 backlog 가 pending 상태로 있으므로 gen2 start 가 gate 에 걸린다. 후속 4건은 gen2 가 생성되지 않은 결과로 연쇄 실패한 것이다 (독립 결함 아님).

## 확인 절차 (gen-072 에서 수행)

gen-072 변경분(`src/`, `package.json`, `RELEASE_NOTICE.md`, `tests/`)을 `git stash` 한 뒤 재실행 → **동일하게 5 fail**. 본 실패는 gen-072 와 무관한 pre-existing 이다.

longterm 의 "Debug stash needs causal matching first" 교훈에 따라, stash 전에 변경 파일 목록과 실패 원인(backlog gate)을 대조해 무관함을 먼저 판단했고 stash 는 확증용으로만 사용했다.

## 왜 지금까지 방치됐나

`environment/summary.md` 의 Tests 절이 **unit / e2e 수치만 baseline 으로 기록**하고 scenario 는 기록하지 않는다. 그래서 매 세대 validation 에서 "scenario 5 fail" 을 봐도 pre-existing 인지 신규 회귀인지 판단할 근거가 없었다.

## Solution

### S1. 테스트를 gen-065 동작에 맞게 갱신

두 방향 중 택일:

- **A. `--no-backlog` 명시** — `cli(dir, "run", "start", "--goal", "...", "--no-backlog")`. 최소 변경이나 gate 자체는 검증하지 않게 된다
- **B. gate 를 시나리오에 편입** — gen2 start 에서 prompt 를 받고, `--backlog` 로 재호출해 소비까지 확인. **scenario test 의 목적(실제 사용 흐름 재현)에는 이쪽이 부합**한다. gen-065 가 추가한 흐름이 실사용 경로이기 때문

권장: B. 다만 A 로 먼저 green 을 만들고 B 를 별도 case 로 추가하는 것도 가능.

### S2. scenario baseline 을 environment 에 기록

`.reap/environment/summary.md` § Tests 에 scenario 결과를 unit/e2e 와 같은 형식으로 기록한다. 그래야 다음 세대가 회귀와 pre-existing 을 구분할 수 있다.

**이것이 재발 방지의 핵심**이다 — 테스트만 고치면 다음에 같은 상황에서 또 판단 불가에 빠진다.

### S3. 다른 scenario 파일도 점검

`tests/scenario/` 의 나머지 3개 파일(35 pass)도 `run start` 를 호출한다면 같은 취약성을 가진다. pending backlog 유무에 따라 통과/실패가 갈리는 테스트는 불안정하다.

## Files to Change

- `tests/scenario/multi-generation.test.ts` — L78 인근 gen2 start
- `tests/scenario/` 나머지 — S3 점검 결과에 따라
- `.reap/environment/summary.md` § Tests — scenario baseline 추가 (reflect phase 에서)

## Verification

1. `bun test tests/scenario/` → 40 pass / 0 fail
2. B 채택 시: gen2 가 backlog gate prompt 를 받고 `--backlog` 재호출로 소비까지 진행하는지
3. pending backlog 가 **없는** 상태에서도 통과하는지 (양쪽 경로 모두 안정)
4. environment/summary.md 에 scenario 수치가 기록되어 다음 세대가 baseline 을 확인 가능

## Open Decisions

- [ ] S1 의 A/B 중 선택
- [ ] scenario 를 CI 에 포함할 것인가 — 현재 `npm run test` 에는 있으나 실패 상태로 방치돼 있었다는 것은 아무도 안 보고 있었다는 뜻
