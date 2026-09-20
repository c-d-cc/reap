---
id: gen-0123-exec
slug: resolve-issue-34
type: exec
backlog: bk-d46db0
title: "resolve #34: 한 항목을 닫은 뒤 다음으로 넘어갈 의무를 적어 둘 자리가 없다"
startedAt: 2026-09-20T22:43:06Z
startCommit: 72cf374
status: open
---

## Intent

자율 실행 중 한 항목을 닫은 뒤 다음으로 넘어갈 의무를 REAP가 적어 둘 자리를
만든다. **새 저장 개념 없이** — `complete`의 규율 한 절과, 이미 있으나 어디서도
가리키지 않는 `gen.closed` 훅을 드러내는 것으로 한다.

끝나는 조건은 issue의 expected 그대로다 — *"남은 항목이 있는 한 에이전트가
계속 다음 항목으로 넘어간다."* 이 세대가 그것을 보장하지는 못한다(스킬
텍스트는 턴을 만들지 못한다). 이 세대가 책임지는 것은 **그 의무를 적을 자리가
있고, 에이전트가 닫는 순간 그것을 읽는다**까지다.

## References

- github.com/c-d-cc/reap/issues/34 — *"REAP에는 '아직 끝나지 않았으니 넘기지
  말라'를 표현할 자리가 없다. (…) complete가 끝나면 그 다음을 가리키는 것이
  아무것도 없다."*
- 같은 issue의 2026-09-11 코멘트 둘 — `life/run` 설계를 수락했다가 세 세대
  만에 통째로 물린 경위. 사람의 판단은 **"이 상태를 아예 기록하지 않는다"**
  였고, `gen.closed` 훅을 *"the honest answer"*로 지목했다
- bk-d46db0 — 이 세대의 근거. 사람이 2026-09-21에 고쳐 잡은 진단(턴이 끝나는
  조건은 "말했다"가 아니라 "도구 호출 없이 메시지를 냈다")이 거기 있다
- ps-4f2a91:06-agent.md · 02-flow.md — 규범이 갈 자리
- src/entries.ts:186 · src/cli.ts:449 — 훅이 발화하고 출력이 닫힘 메시지 뒤로
  붙는 실물 지점

## Outcome

#34가 말한 공백에 **저장을 늘리지 않고** 자리를 만들었다. 닫은 직후 멈추지 말라는
의무가 이제 규범(`02-flow.md`)·skill(`complete`·`evolve`)·훅(`gen.closed`) 세 곳에
있고, 이 리포 자신이 그 훅을 걸고 돈다.

- **`02-flow.md` — `### 닫은 다음`.** 흐름도의 마지막 줄을 *"다음 세션이 이어받는다"*
  에서 *"남은 것이 있으면 같은 세션이"*로 고쳤다. 턴이 끝나는 조건은 "사람에게
  말했다"가 아니라 "도구 호출 없이 메시지를 냈다"라는 것, 보고는 이미 기록·handoff·
  이월에 다 쓰였다는 것, **규율이지 보장이 아니라는 것**, 그리고 멈추는 것이 맞는
  경우 셋을 함께 적는다
- **`07-orchestrate.md` — `### gen.closed — 첫 실제 용례`.** 판정 기준 3(프로젝트마다
  다르다)을 만족하므로 REAP는 문장을 싣지 않고 자리만 준다. 같은 절이 가리키던
  **`03-hooks.md`가 없는 파일이어서** 규범 포인터를 실제 자리(03·04·이 절)로 돌렸다
- **`complete` — `## After closing: is anything left`.** 닫힘은 한 항목의 끝이라는 것,
  산문 보고 한 번의 대가가 실행 종료라는 것, 멈추는 것이 맞는 네 경우, 그리고
  `gen.closed`로 이 의무를 프로젝트에 적는 법
- **`evolve` — `## If you just closed one`.** 닫고 바로 온 것은 확인할 일이 아니다
- **`.reap/hooks/gen.closed.continue.md`.** 이 리포의 멈춤 조건 넷(남은 것 없음, 사람이
  건 조건, 커밋 규칙 어긋남, 사람의 것 — fitness·push·방향 전환)
- **사이트 자율 진화 흐름**에 "닫은 다음" 절(ko). 커밋 규칙과 fitness 사이
- **`04-commands.md`** — `mark backlog --consumed`가 *"위치는 그대로"*라고 적혀 있었다.
  실제로는 `archive/backlog/`로 옮기며 `05-knowledge.md`는 그렇게 적고 있었다. 04를
  실물에 맞췄다

**summary.md: 갱신** (`.reap/hooks/`가 이 리포에 처음 생겼다). **genome: 해당 없음** —
규범은 plan source가 갖는다는 기존 의도 그대로이고, 새 규율도 거기 넣었다.

## Verification

게이트 전부 초록 — `bun test` 282 pass·0 fail, `typecheck` 통과, `./tests/hook.test.sh` 전체
통과, `check-docs-surface.sh`·`check-docs-prerender.sh`(29쪽)·`check-release-version.sh` 통과,
사이트 빌드 통과, `doctor` 결함 0·참고 3(모두 기존). 실행 코드가 안 바뀌어 테스트가 새로
거치는 것은 없다.

**훅이 실제로 발화하는지는 빈 리포에서 확인했다** — scratchpad에 `reap init` → `make hook
--event gen.closed --name continue` → 세대 하나를 열고 닫자 `Closed: gen-0001-exec` 뒤에
`--- hooks ---`와 본문이 찍혔다. frontmatter는 `parseDoc`이 벗겨 본문만 나간다.
`.reap/hooks/conditions/`가 없어도 `condition: always`는 `src/hooks.ts`가 먼저 끊어 doctor가
결함을 내지 않는다.

**독립 검증** — verify-brief로 fresh subagent 하나. 차단 결함 없음, 판정은 *"close with
backlog items"*. 지적 여덟 중 여섯을 이 세대에서 고쳤다.

- 사이트 ko 문안의 경어 `-시-` 한 곳(`ko.ts` 2000줄 중 유일)과 한다체 절이 섞인 문장 → 고침
- 그 페이지의 meta description이 새 절을 안 세고 있었다 → 고침
- `complete`의 *"(the section above)"*가 실제로는 두 절 위를 가리켰다 → 제목으로 고침
- `02-flow.md`의 멈춤 목록이 **사람의 것**(fitness·push·방향 전환)을 빠뜨린 채 단정적으로
  읽혔다 → 이름으로 부르고, 무엇이 사람의 것인지는 프로젝트 훅이 적는다고 덧붙였다
- 같은 파일 `### 무엇이 강제되지 않는가`가 *"이 목록이 전부다"*라면서 새 규율을 안 세고
  있었다 → 여섯째 항목을 더했다
- `RELEASE_NOTES.md`와 사이트 릴리스 노트에 `#32`·`#33`은 있고 `#34`만 없었다 → 넣었다
- `--archived`는 이미 archive면 거부하고 `--consumed`는 멱등인 차이가 04에 없었다 → 한 줄

남은 둘 중 하나는 이월했다 — plan source 안의 **앵커 링크를 아무도 검사하지 않는다**
(`bk-7696f1`). 이 세대가 그 앵커를 처음 둘 만들었고, 제목을 고치면 조용히 죽는다.
나머지 하나(세 멈춤 목록의 개수 차이)는 **설계대로다** — 훅이 넷인 것은 이 리포의
`fitness·push·방향 전환`이 더해져서이고, 그것이 "프로젝트마다 다르다"의 실물이다.

## Dead Ends

- **보고 전용 파일을 새로 두는 안.** 사람의 최초 제안이 그 모양이었는데, `complete`가
  이미 기록 `Outcome`·`handoff.md`·이월까지 세 곳에 쓰고 있어 넷째 사본이 된다.
  `life/run`이 기각된 것과 같은 이유로 다시 기각될 자리였다
- **`init`이 `gen.closed` 씨앗을 놓는 안.** 판정 기준 3에 걸린다 — 모든 프로젝트가 같은
  문장을 원하면 그것은 훅이 아니라 도구의 일이다. 자리만 주고 문장은 프로젝트에 맡긴다
- **flux를 새로 여는 안.** 규범을 plan source에 쓰는 일이지만 분량이 절 둘이라
  milestone을 낳을 것이 없었다
