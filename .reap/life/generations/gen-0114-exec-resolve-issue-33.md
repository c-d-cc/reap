---
id: gen-0114-exec
slug: resolve-issue-33
type: exec
backlog: bk-b65f03
title: "resolve #33: complete에 genome 갱신 절차 추가"
startedAt: 2026-09-11T01:33:33Z
startCommit: 761458c
status: open
---

## Intent

`complete`가 `environment/summary.md` 낡음을 검사하듯 **genome 낡음도 같은 자리에서 검사한다.** 끝나는 조건은 issue의 expected 그대로다 — `complete`에 genome을 다루는 절차가 있고, `make backlog --type genome`을 **누가 언제 소비하는지**가 스킬 본문에 적혀 있다.

## References

- <https://github.com/c-d-cc/reap/issues/33> — "genome은 **매 세션 주입되는 파일**이라, 낡은 채로 두면 그 뒤 모든 세션이 틀린 전제로 시작한다. `summary.md`가 위험한 것과 정확히 같은 이유인데 검사는 `summary.md`에만 있다."
- 작성자가 남긴 판단 위임 — "별도 스킬(`sync-genome` 같은)로 빼는 편이 나을 수도 있다 … 어느 쪽이 맞는지는 REAP 쪽 판단"
- `plugin/skills/migrate/references/migration-map.md:40,43` — v0.17에서 오는 프로젝트에 `make backlog --type genome`을 약속한다. **소비자가 어느 스킬에도 없다.** 이 리포 안에서 이미 어긋나 있는 자리
- `plugin/skills/complete/SKILL.md:48` — `summary.md` 검사 표. genome 절은 이 표와 같은 모양이어야 한다
- `plugin/skills/carve-milestone/SKILL.md:83` — "check that everything this milestone settled has been reflected." genome을 이름으로 부르지 않는다

## Outcome

issue #33의 expected를 채웠다 — `complete`에 genome을 다루는 절이 있고, `make backlog --type genome`을 누가 언제 소비하는지가 그 절에 적혀 있다.

- `plugin/skills/complete/SKILL.md` — `## Before closing: does \`genome/\` still hold?`. `summary.md` 표와 같은 모양의 다섯 줄, `invariants.md`는 사람의 것이라는 선, `--type genome` backlog를 여기서 소비한다는 문장, genome 항목이 그 세대의 근거는 아니라는 한 줄
- `plugin/skills/carve-milestone/SKILL.md` — 닫기 절에 milestone 단위 genome 훑기. 세대별로는 안 보이는 다세대 구조 변경의 낡음(작성자가 실제로 겪은 것)을 잡는 자리
- `tests/plugin-skills.test.sh` — 넷째 계약. issue의 repro(`grep "^## "`에 genome 절 없음)가 상시 검사가 됐다
- `site/src/i18n/translations/ko.ts` — complete 설명, "Genome 불변성" 개념 설명, v0.17 대조표의 `genome 직접 편집`
- `RELEASE_NOTES.md`·`site/release-notes-content.md`·사이트 ko 릴리스 노트 — #33 한 줄

검사: `bun test` 243 pass · `plugin-skills` · `migrate-scripts` · `hook.test.sh` 전부 통과 · `tsc --noEmit`(루트·site) · `reap doctor` 결함 0. localUpdate 반영 후 캐시가 리포와 동일함을 `diff -r`로 확인.

summary.md: 해당 없음 — 최상위 구조·의존성·빌드 명령이 그대로다.
genome: 해당 없음 — 스킬 절차가 늘었을 뿐 이 리포의 만드는 것·작업 규약·AI 행동 규칙이 바뀌지 않았다.

독립 검증: 새 subagent가 Intent·diff·검사를 대조했다. 판정은 "결함 넷을 고치면 닫아도 된다". **넷 다 이 세대 안에서 고쳤다**(커밋 `058c5ed`) — 미룬 것 없음.

1. `complete`가 "이 질문은 `evolution.md`가 이미 갖고 있다"고 주장했는데 **거짓이었다.** v0.18 씨앗에도 이 리포의 `evolution.md`에도 없고, `migrate`로 이주해 온 프로젝트에만 있다. 출처 주장을 뺐다
2. 사이트의 "Genome 불변성" 개념 설명이 새 절과 정면으로 어긋났다
3. v0.17 대조표의 `genome 직접 편집`이 낡았다
4. 릴리스 노트 누락 — 직전 #32 세대의 선례대로 세 곳에 넣었다

그 밖에 검증이 짚은 것: 새 검사 넷이 `grep -q` 존재 확인이라 절의 순서나 링크 대상까지는 안 본다. 사이트 문자열을 덮는 검사는 여전히 없다. 둘 다 지금 메우지 않았다 — 존재 확인만으로 issue의 repro는 막힌다.

## Dead Ends

**별도 스킬 `sync-genome`을 만들지 않았다.** issue 작성자가 제안한 선택지고, "세대마다 묻는 것보다 milestone이 닫힐 때 한 번"이라는 근거도 타당했다. 접은 이유는 둘이다 — 스킬 표면을 늘리는 것은 방향이 바뀌는 변경이라 사람 검토가 필요하고, 작성자가 원한 "milestone 단위 훑기"는 `carve-milestone`의 닫기 절에 얹으면 새 표면 없이 그대로 된다. 세대별 검사와 milestone 단위 훑기를 **둘 다** 둔 것은 fix 세대가 milestone에 속하지 않기 때문이다 — milestone 단위만 두면 fix 세대의 낡음은 영영 안 잡힌다.

**genome 판정 질문을 씨앗 `genome-evolution.md`에 심지 않았다.** 검증이 지적한 거짓 출처를 "씨앗에 질문을 넣어" 참으로 만드는 길도 있었다. 규범은 한 곳이라는 원칙을 따라 **쓰이는 자리**(`complete`)에 두고 출처 주장만 뺐다. 씨앗은 프로젝트가 채우는 물음 문장이지 REAP의 규범을 담는 자리가 아니다.

