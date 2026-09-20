---
id: gen-0126-exec
slug: handoff-skill
type: exec
backlog: bk-f6f1cb
title: handoff skill 신설 — 사람이 세션을 끝낼 때 부른다
startedAt: 2026-09-20T23:50:10Z
startCommit: 1bfd9f4d
status: open
---

## Intent

인계를 **사람이 직접 부를 수 있는 skill**로 만든다. 끝나는 조건은 `/reap:handoff`가 `/` 메뉴에
있고, `complete`를 거치지 않는 세션도 인계를 남길 수 있으며, 절차의 정본이 한 곳(새 skill)에만
있는 것이다.

규범(언제 쓰는가)은 `ps-4f2a91`의 `03-storage.md`가 그대로 갖는다 — 새 skill은 **절차**를
갖는다. 할 일 목록은 `bk-f6f1cb`에 있다.

## References

- bk-f6f1cb — 근거이자 목록. 사람 지시(2026-09-21)와 왜 훅으로는 못 막는지
- ps-4f2a91:03-storage.md `### 언제 쓰는가` — gen-0125가 세운 규범. 여기를 옮겨 적지 않는다
- ps-4f2a91:06-agent.md — skill 표. "skill을 하나 더 만들면 '언제 부르는가'가 하나 더
  생긴다"는 경고가 있는 자리다. `init`이 그 경고를 어떻게 통과했는지가 선례다

## Outcome

`handoff` skill을 신설했다. **사람이 `/` 메뉴에서 부를 수 있고**, `complete`는 멈추기로 했을
때 그것을 부른다. skill 10종 → 11종, 사람이 부르는 것 8 → 9.

- **`plugin/skills/handoff/SKILL.md`** — 절차의 정본. 첫 단계가 *"인계가 필요한가"* 이고
  **아니라고 답하는 것이 흔한 정상**임을 못 박았다. 어느 쪽을 골랐는지 말하라고도 적었다 —
  인계를 부탁한 사람이 침묵을 받으면 판단인지 누락인지 못 가린다. 열린 세대가 있을 때(닫고
  갈지 열어둔 채 적을지), 이어받은 절을 지우는 것, 상태 줄에 이미 있는 것을 옮겨 적지
  않는 것
- **`complete`** — 절차를 옮겨 적지 않고 가리킨다(`carve-milestone` 방식). 남기는 것은
  **타이밍 하나**뿐이다 — 남은 항목이 있는 동안은 부르지 않는다
- **`ps-4f2a91`** — `06-agent.md`의 skill 표에 행 하나와 `### handoff — 세션이 끝나는
  순간은 도구가 못 본다` 절(왜 훅으로 못 막는지, 왜 경합이 아닌지). `03-storage.md`는
  절차의 주인이 skill임을 가리키고, `08-delivery.md`는 열한 종
- **숫자** — README 둘(설치 안내·skill 표), 사이트(nav·목차·비교표·skill 레퍼런스 제목·
  설명·표·skillList), `help` skill의 표와 제안 규칙, 릴리스 노트 둘

**summary.md: 해당 없음**(소스 구조·명령·빌드 불변). **genome: 해당 없음.**

## Verification

`bun test` 290 pass·0 fail, `typecheck`, `./tests/hook.test.sh`, `tests/plugin-skills.test.sh`
**all passed**, `check-docs-surface.sh`(새 skill 이름이 README 둘과 사이트에서 발견됨),
`check-docs-prerender.sh` 29쪽, 사이트 빌드, `doctor` 결함 0. `local-install.sh` 뒤
`diff -r plugin <캐시>` 차이 없고 캐시에 `skills/handoff/`가 실렸다.

**`tests/plugin-skills.test.sh`가 조용히 깨져 있었다.** 행 매칭 정규식이 `^| [`name`]`로
닫는 대괄호를 요구하는데 `orchestrate` 행 제목에 `(Claude Code 전용)` 꼬리표가 붙어 있어
README 둘에서 실패하고 있었다. `git stash`로 이 세대 이전에도 같은 3건이 남을 확인했다.
이 세대가 건드리는 바로 그 속성(누가 부르는 skill인가)을 지키는 검사라 함께 고쳤고,
`handoff`를 그 목록에 넣었다.

**독립 검증 생략** — 실행 코드가 한 줄도 안 바뀌었다. skill·spec·문서 산문과 셸 테스트
정규식 하나뿐이고, 게이트가 표면을 전부 기계적으로 확인한다.

## Dead Ends

- **`user-invocable: true`를 명시하는 안.** 사람이 부르는 기존 여덟은 전부 필드를 생략해
  기본값에 기댄다. `plugin-skills.test.sh`도 *"must stay user-invocable (field present)"*
  로 **필드가 있으면 실패**시킨다 — 명시가 규약 위반이다. 생략했다
- **`complete`에 절차를 남겨두고 skill이 가리키게 하는 안.** 방향이 거꾸로다. 사람이 부르는
  쪽이 정본을 갖고 agent 전용인 쪽이 가리켜야, `complete` 없이 끝나는 세션도 완전한 절차를
  받는다
