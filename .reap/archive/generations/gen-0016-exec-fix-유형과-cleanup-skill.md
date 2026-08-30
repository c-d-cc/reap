---
id: gen-0016-exec
slug: fix-유형과-cleanup-skill
type: exec
milestone: ms-002
title: fix 유형과 cleanup skill
startedAt: 2026-08-23T01:20:56Z
startCommit: f05c5db
status: closed
closedAt: 2026-08-23T01:27:26Z
endCommit: 129d098
---

## Intent

ms-002 Task 2.3. `make generation`이 `--milestone`·`--plan`·`--fix` 중 정확히 하나를 받게 하고,
`mark generation --archived`(위치만 옮기고 status는 안 건드림)와 `mark milestone --focus|--closed`(후자는
디렉토리째 archive/milestones/로 이동)를 새로 만든다. `cleanup` skill을 만들고 `evolve`를 세 축으로 고친다.

끝나면: `bun test` 전부 통과, `bun run typecheck` 0 오류, `./tests/hook.test.sh` 통과, 빈 프로젝트에서
exec·plan·fix 세 세대를 열고 닫고 archive까지 손으로 한 바퀴 확인.

## Working Plan

1. `src/entries.ts`의 `makeGeneration` — `plan?: boolean` 이항을 milestone/plan/fix 삼항으로 바꾼다
2. `src/entries.ts`에 `markMilestone`(focus/closed) 추가, `markGeneration`에 `archived` 분기 추가
3. `src/cli.ts` — make/mark 배선, USAGE 갱신
4. `plugin/skills/cleanup/SKILL.md` 신설
5. `plugin/skills/evolve/SKILL.md` — 축 셋, 안티패턴 추가, fix 기록 규율(References)
6. 테스트는 구현 전에 실패를 먼저 본다 (entries.test.ts, ctx.test.ts)

## References

- `docs/superpowers/specs/reap/01-concepts.md` — generation 유형 표, "fix가 milestone을 갖지 않는 이유는 작아서가 아니다"
- `docs/superpowers/specs/reap/02-flow.md` — "fix는 예외가 아니다" 절, "무엇이 강제되지 않는가"
- `docs/superpowers/specs/reap/04-commands.md` — `make`·`mark` 명령 표면, `mark generation --archived`가 status를 건드리지 않는다는 규정
- `docs/superpowers/specs/reap/06-agent.md` — "evolve의 첫 판단", `cleanup` skill 한 줄 설명
- `.reap/vision/milestones/ms-002-저장-구조와-세대-유형/tasks/2-3-fix-유형과-cleanup.md`

## Outcome

**`src/entries.ts`**
- `makeGeneration`: `plan?: boolean` 이항 분기를 `{ milestone?, plan?, fix? }` 셋 중 정확히 하나 검사로 바꿨다. `[milestone !== undefined, plan === true, fix === true]`를 세어 1이 아니면 거부하고, 메시지에 세 플래그를 전부 언급한다. fix 세대는 plan과 같은 모양(milestone 필드 없음)으로 만들어진다 — 기존 분기가 이미 `milestone`을 null로 두는 경로를 공유하고 있어서 자연히 그렇게 됐다
- `markGeneration`: `flag` 유니온에 `"archived"`를 추가했다. `life/generations/`에서 `archive/generations/`로 파일만 옮기고 frontmatter는 patch하지 않는다 — status가 그대로 남는다
- `markMilestone` 신설: `--focus`는 `focus: true`만 patch. `--closed`는 `status`·`closedAt`을 patch한 뒤 milestone 디렉토리 전체를 `renameSync`로 `archive/milestones/<id>-<slug>/`로 옮긴다 — 파일별 복사가 아니라 디렉토리째이므로 tasks/나 손으로 추가한 파일도 함께 간다

**`src/cli.ts`**
- `make generation`에 `--fix` 플래그 배선
- `mark`를 kind별로 분기하도록 재작성 — `generation`은 `--closed`·`--aborted`·`--archived`, `milestone`은 `--focus`·`--closed`. 둘 다 아니면 거부
- USAGE 갱신

**id로 찾기가 이동 후에도 동작하는 이유** — `doc.ts`의 `listEntries`가 이미 `generation`은 `[p.generations, p.archiveGenerations]`를, `milestone`은 `[p.milestones, p.archiveMilestones]`를 함께 스캔한다(Task 2.1의 산출). 이번 세대에서 그 코드를 건드리지 않았다 — 이미 옳게 되어 있었다.

**`ctx`의 fix 세대 노출** — `ctx.ts`의 `openGeneration`은 이미 `listEntries(root, "generation")` 하나를 쓰고 유형을 안 가른다(Task 2.2의 산출). 코드는 그대로 두고 `tests/ctx.test.ts`에 fix 세대가 상태 줄에 나오는 것을 못박는 테스트만 추가했다.

**`plugin/skills/cleanup/SKILL.md` 신설.** milestone을 닫은 뒤 관련된 닫힌 세대를 `archive/generations/`로 내리는 skill. 관련 판단(무엇을 옮기고 무엇을 남기는가)은 skill의 산문이 지고, CLI(`mark generation --archived`)는 이동만 한다. 열린 세대는 옮기지 않는다, exec가 기본이고 plan·fix는 사람 판단, 옮긴 목록을 handoff.md에 남긴다 — 세 가지를 명시했다.

**`plugin/skills/evolve/SKILL.md` 갱신.** 축 표를 둘에서 셋으로, 안티패턴을 둘에서 셋으로("작다는 이유로 새 기능을 fix로 짓기") 늘렸다. fix 기록에는 `References`에 무엇의 의도로 되돌리는지 적어야 한다는 절을 추가했다 — frontmatter 필드로 못 박지 않는 이유(되돌릴 대상이 항상 id를 갖지 않음)까지 spec 그대로 옮겼다. frontmatter 예시의 `sequence/exec-generation.md`는 Task 2.2에서 이미 `sequence/generation.md` 하나로 합쳐졌는데 evolve 문서가 옛 이름을 그대로 갖고 있었다 — 발견한 김에 고쳤다.

**검증**: `bun test` 94 pass(entries 22개·ctx 1개 새 테스트 포함, 구현 전 실패 확인함) · `bun run typecheck` 오류 0 · `./tests/hook.test.sh` 전부 통과 · `bun run build` 재생성 · 빈 임시 프로젝트에서 손으로 한 바퀴: milestone 하나에 exec·plan·fix 세 세대를 열고, 축 위반(0개·2개 지정) 거부를 확인하고, 셋 다 닫고, milestone을 focus한 뒤 closed로 archive/milestones/에 통째로 옮기고, exec 세대 하나를 archive/generations/로 옮긴 뒤 id로 다시 찾아 닫아지는 것까지 확인했다. `ctx`가 각 단계에서 상태 줄을 정확히 냈다(옮긴 뒤 "현재 milestone"·"열린 세대" 줄이 사라짐).

## Dead Ends

- **`markMilestone`을 `flag: "focus" | "closed"`로 만들면서 `focus`가 다른 milestone의 `focus`를 자동으로 해제하게 할지 고민했다.** 하지 않기로 했다 — spec(04-commands.md)의 `doctor` 검사 항목에 "두 개 이상의 `focus: true`"가 명시되어 있다. 이것은 `mark`가 막을 게 아니라 `doctor`가 사후에 보고할 대상이라는 뜻이다. 막으면 원칙 1(흐름을 제어하지 않는다)을 어긴다
- **`make generation --milestone`이 닫힌(archive로 옮겨진) milestone을 가리키면 거부할지 고민했다.** 손 테스트로 확인해보니 지금은 통과한다. spec 어디에도 이 검사를 요구하지 않고, 이것도 "확률에 맡길 수 없는 것"이 아니라 판단의 영역이라 CLI가 막을 이유가 없다고 판단해 그대로 뒀다 — 다만 향후 `doctor`가 "닫힌 milestone을 가리키는 exec 세대"를 검사 항목에 넣을 만하다고 보여 report에 남긴다
