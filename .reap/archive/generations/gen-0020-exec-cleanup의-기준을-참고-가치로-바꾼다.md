---
id: gen-0020-exec
slug: cleanup의-기준을-참고-가치로-바꾼다
type: exec
milestone: ms-002
title: cleanup의 기준을 참고 가치로 바꾼다
startedAt: 2026-08-23T02:03:18Z
startCommit: 298dde4
status: closed
closedAt: 2026-08-23T02:06:59Z
endCommit: 0eaa4fe
---

## Intent

ms-002 Task 2.5. `03-storage.md`의 "`life/generations/`는 작업 세트다" 절(`gen-0019-plan`이 씀)이 이미 규범을 확정했다 — `cleanup`이 물어야 할 것은 milestone 소속이 아니라 "이 세대를 앞으로 볼 일이 있는가"다. spec은 고치지 않는다. 코드도 안 바뀐다(`--closed`·`--archived` 지금이 맞다).

바뀌는 것은 이 기준을 아직 반영하지 못한 문서들이다:
- `plugin/skills/cleanup/SKILL.md` — 판단 기준이 여전히 "milestone 소속"이다
- `src/templates/map.md`·`.reap/map.md` — `life/`를 "지금 열려 있는 작업이 쌓이는 곳"이라고 적어 열린 것만 담는 곳처럼 읽힌다
- `plugin/skills/complete/SKILL.md` — cleanup을 가리키는 문장이 새 기준과 어긋나는지 확인

끝나면: 살아 있는 문서 어디에도 "milestone에 속한 것을 옮긴다"나 "닫히는 즉시 archive"가 남지 않고, `map.md` 둘이 byte-identical하며, 기존 테스트 넷이 그대로 통과한다(동작 변경이 없으므로).

## Outcome

셋을 고쳤다.

- **`plugin/skills/cleanup/SKILL.md`** — description과 본문 전체를 새 기준으로 바꿨다. `life/generations/`가 무엇인지(작업 세트) 설명하는 절을 새로 넣었고, "무엇을 옮기고 무엇을 남기는가"를 "묻는 것은 하나다: 이 세대를 앞으로 볼 일이 있는가"로 다시 썼다 — milestone 소속(exec 기본·plan/fix 사람 판단)이 아니라, plan은 반영 여부로·exec는 milestone과 함께 산출물이 반영됐는지로·fix는 같은 질문으로 판단하고, 살아 있는 결정·막다른 길이 있으면 유형과 무관하게 남긴다
- **`src/templates/map.md`·`.reap/map.md`** — `life/`를 "지금 열려 있는 작업이 쌓이는 곳"에서 "아직 참고할 값이 있는 것이 쌓이는 곳"으로 고치고, 상단 다이어그램의 `life/`·`archive/` 설명도 spec의 "지금 살아 있는 것"·"더는 참고하지 않는 것"에 맞췄다. `life/generations/` 항목 설명도 "열려 있거나 이제 막 닫힌"에서 "참고할 값이 남은(열린 것 + 닫혔지만 읽을 이유가 있는 것)"으로 바꿨다. `diff`로 byte-identical 확인
- **`plugin/skills/complete/SKILL.md`** — 확인만 했다. cleanup을 가리키는 문장("그것은 archive/generations/로 따로 내려가고 ... 참고 가치를 보고 따로 내린다")이 이미 새 기준과 일치해 고칠 것이 없었다

**코드는 건드리지 않았다.** `src/`에 diff 없음.

**검증** — `bun test` 97 pass · `bun run typecheck` 오류 0 · `./tests/hook.test.sh` 5/5 · `bun run build` 정상. 빈 임시 프로젝트(`/private/tmp/reap-manual-2-5`, 삭제함)에서 `init → make milestone → make generation(exec) → commit → mark --closed → mark --archived → mark milestone --closed → ctx`를 손으로 돌려, `--closed`는 파일을 안 옮기고 `--archived`가 옮기는 지금 동작이 그대로임을 확인했다. `init`이 새 map.md 씨앗을 정확히 놓는 것도 확인했다.

`.reap/` 안 모든 `.md`의 상대 링크를 스크립트로 전수 검사해 깨진 것이 없었다. `plugin/`·`docs/`·`.reap/vision/`·`.reap/map.md`를 훑어 "milestone에 속한 것을 옮긴다"나 "닫히는 즉시 archive"가 남아 있는지 확인했다 — 남은 두 건(`milestone.md`·`tasks/2-3-...md`)은 그 실패를 서술하는 역사 문단이라 문제가 아니다.

## Dead Ends

없음. spec(`gen-0019-plan`)이 기준을 이미 확정해 놓아 설계 판단이 필요 없었고, 세 파일을 그 기준에 맞추는 것으로 끝났다.

## Notes — 고치지 않기로 판단한 것

`.reap/vision/milestones/ms-002-.../tasks/2-3-fix-유형과-cleanup.md`가 옛 기준("milestone에 속한 exec 세대가 기본")을 여전히 담고 있다. task 2.5 브리프의 제외 목록(`archive/generations/`, `life/generations/`의 옛 세대 기록)에 이 파일이 명시되어 있지는 않지만, 이것도 **완료된 task 2.3이 그때 요구한 것을 적은 기록**이라 같은 성격으로 보고 손대지 않았다. `milestone.md`의 작업 갈래 문단이 이미 이 역사를 정확히 서술하므로 오독의 위험도 낮다고 판단했다.
