## task 2를 위한 자리

`src/hooks.ts`가 준비한 것:

```ts
export const HOOK_EVENTS = ["gen.made", "gen.closed", "milestone.made", "milestone.closed", "orch.claimed", "orch.barrier.released"] as const;
export function runHooks(root: string, event: string, ctx: { id?: string } = {}, options?: { timeoutMs?: number; conditionTimeoutMs?: number }): { outputs: { file: string; text: string }[]; failures: { file: string; reason: string }[] };
```

**절대 throw하지 않는다.** `outputs`를 명령 출력 뒤에 붙이면 된다(`.md`는 본문 그대로, `.sh`는 trim된 stdout). `failures`는 보고용 — 03-hooks에 따르면 명령 자체는 실패시키지 않는다(어떻게 보여줄지는 task 2의 판단).

붙일 지점 여섯(발화는 파일 쓰기가 끝난 **뒤**):

| 지점 | event | ctx.id |
|---|---|---|
| `make generation` | `gen.made` | 발급된 gen id |
| `mark generation --closed` | `gen.closed` | gen id |
| `make milestone` | `milestone.made` | ms id |
| `mark milestone --closed` | `milestone.closed` | ms id |
| `orch claim`(성공) | `orch.claimed` | claim한 resource |
| `orch barrier`(해제, `r.released`일 때만) | `orch.barrier.released` | barrier name |

`entries.ts`의 각 `make*`/`mark*` 함수는 지금 `root`만 받고 순수하게 파일을 쓴다 — `runHooks`를 그 안에 넣을지 `cli.ts`의 호출부(파일 쓰기 성공 뒤)에서 부를지는 task 2가 정한다. 후자를 미는 이유: `entries.ts`는 테스트에서 hook 부작용 없이 단위 검증하기 쉬워야 하고, `Result`에 hook 출력을 실어 메시지를 조립하는 지점이 `cli.ts` 쪽이 자연스럽다.

이 세대가 안 한 것: 여섯 지점 실제 연결, `doctor`의 hooks 검사(규약 밖 파일명·모르는 이벤트·없는 조건 스크립트), `init`의 `hooks/conditions/always.sh` 씨앗(템플릿 `condition-always.sh`는 이미 BUNDLED에 있다 — `store.ts`의 `SEEDS`에 추가하면 된다. `DIRS`의 `hooks/conditions`는 이미 있다).
