# Handoff

## 어디까지 왔나

**Task 2.1·2.2·2.3·2.4·2.5 전부 완료. ms-002의 작업 갈래는 여기서 끝이다.**

Task 2.5는 `gen-0018-plan`이 "닫히는 즉시 archive"로 잘못 고쳤다가 `gen-0019-plan`이 되돌리고 spec에 **"`life/generations/`는 작업 세트다"** 절을 세운 뒤 생긴 것이다. spec은 이미 고쳐져 있었으므로 이 세대(`gen-0020-exec`)는 그 기준을 문서 셋에 반영만 했다:

- `plugin/skills/cleanup/SKILL.md` — 판단 기준을 "milestone 소속"에서 "이 세대를 앞으로 볼 일이 있는가"로 바꾸고, `life/generations/`가 작업 세트라는 것을 skill이 먼저 설명하게 했다
- `src/templates/map.md`·`.reap/map.md` — `life/`를 "열려 있는 작업이 쌓이는 곳"이 아니라 "아직 참고할 값이 있는 것이 쌓이는 곳"으로 고쳤다. 둘은 여전히 byte-identical하다
- `plugin/skills/complete/SKILL.md` — 이미 새 기준과 어긋나지 않아 손대지 않았다

**코드는 바뀌지 않았다.** `mark generation --closed`·`--archived`는 그대로다.

`bun test` 97 · `typecheck` 0 · `hook.test.sh` 5/5 · `build` 정상. 빈 임시 프로젝트에서 `init → make milestone → make generation(exec) → mark --closed → mark --archived → mark milestone --closed → ctx`를 손으로 돌려 이동 동작이 그대로임을 확인했다(임시 디렉토리라 이 리포에는 흔적이 없다). `.reap/` 안 모든 상대 링크를 프로그램으로 전수 검사해 깨진 것이 없다.

## 확인만 하고 손대지 않은 것

- **`.reap/vision/milestones/ms-002-.../tasks/2-3-fix-유형과-cleanup.md`**는 `cleanup`을 처음 만들 때(2.3)의 옛 기준("milestone에 속한 exec가 기본")을 그대로 담고 있다. **일부러 고치지 않았다** — task 2.3의 완료된 요구사항 기록이고, `milestone.md`의 작업 갈래 표 아래 문단이 이미 그 역사(2.3의 기준 → 실패 → gen-0018의 오진단 → gen-0019의 정정)를 정확히 서술한다. `gen-0018-plan`·`gen-0019-plan` 세대 기록도 마찬가지로 그때의 판단이라 손대지 않았다
- 옛 id 인용(`exec-006` 등)에 대한 이전 세션의 판단(고치지 않음)은 유효하며 다시 보지 않았다

## 남은 것 — 이 세션이 못 하는 것 하나

**실제 대화형 세션을 열어 SessionStart 훅 주입을 눈으로 보는 것은 검증하지 못했다.** `hook.test.sh`가 스크립트 자체를 검사하지만, Claude Code 세션을 실제로 새로 열어 상태 줄이 그대로 주입되는지는 사람이 확인해야 한다. (이전 세션에서도 남아 있던 항목이고 이번 세션은 문서만 바꿔 해당하지 않는다.)

## milestone이 끝났는가

작업 갈래 표의 다섯이 전부 완료다. **스스로 닫지 않는다** — `complete` skill 규칙대로 사람에게 fitness를 묻는다. `milestone.md`의 "증분 2가 끝나면 물어볼 것" 다섯 질문이 그 판단의 재료다.

## milestone을 닫을 때 — `cleanup`이 무엇을 할지 이미 정해졌다

**`life/generations/`의 14개를 전부 `archive/generations/`로 내린다.** 남길 것이 없다.

`gen-0019-plan`(life/generations는 작업 세트다)만 남길 후보였는데, 그것이 담은 교훈 둘을
**`vision/memory/lessons.md`로 졸업시켰다** — "구조를 적을 때 그 구조의 목적도 적는다",
"증상이 맞아도 원인이 틀리면 고친 것이 더 나빠진다". 졸업했으므로 세대 기록을 남길 이유가 없다.

나머지 열셋은 이렇게 갈린다.
- `gen-0004`~`0007-plan` · `gen-0014-plan` — 결론이 spec과 코드에 전부 반영됐다. 반영된 plan은 끝난 것이다
- `gen-0011-plan` — fitness는 `ms-001`의 `milestone.md`로 옮겨졌고 ms-002는 닫힌다
- `gen-0012`~`0017-exec` · `gen-0020-exec` — ms-002의 실행 세대들. milestone과 함께 끝났다
- `gen-0018-plan` — 되돌려진 설계. 왜 틀렸는지는 lessons에 있다

**결과적으로 `life/generations/`가 빈다.** 그것이 문제가 아니라 **졸업이 제대로 돌았다는 뜻이다** —
가져갈 것이 전부 spec·lessons·`map.md`로 올라갔으므로 다음 milestone은 세대 기록을 읽을 필요가 없다.

**이것이 `cleanup`의 첫 실제 실행이다.** 판단이 맞았는지는 ms-003을 진행하면서 드러난다 —
읽고 싶은데 archive에 있는 것이 생기면 기준이 너무 빡빡했던 것이다.

---

## cleanup 실행 결과 (2026-08-23) — 첫 실행

**14개 전부 내렸다. `life/generations/`가 비었다.** archive는 20개가 됐다.

| 내린 것 | 판단 |
|---|---|
| `gen-0004`~`0007-plan` · `gen-0014-plan` | 결론이 spec과 코드에 반영됐다. 산출물을 보면 되지 기록을 다시 볼 이유가 없다 |
| `gen-0011-plan` | fitness는 `ms-001`의 `milestone.md`로, milestone 자르기는 ms-002가 실현했다 |
| `gen-0012`·`0013`·`0015`~`0017`·`0020-exec` | ms-002와 함께 끝났다 |
| `gen-0018-plan` | 되돌려진 설계. 왜 틀렸는지는 `decisions.md`와 `lessons.md`에 있다 |
| `gen-0019-plan` | 담고 있던 교훈 둘이 `lessons.md`로 **졸업했다**. 결론은 `03-storage.md`에 있다 |

**남긴 것은 없다.** 열린 세대도 없었다.

**빈 작업 세트가 정상 상태다.** 가져갈 것이 전부 spec · `lessons.md` · `map.md` · `decisions.md`로 올라갔으므로 다음 milestone은 세대 기록을 읽을 필요가 없다. 그것이 졸업이 제대로 돌았다는 뜻이다.

**판정은 ms-003이 한다** — 읽고 싶은데 archive에 있는 것이 생기면 기준이 너무 빡빡했던 것이고, 그것이 다음 fitness의 재료다.

## ms-003을 여는 세션에게

**열린 milestone이 없다.** `evolve`가 plan 축을 고를 것이다. 로드맵(`ps-4f2a91:09-roadmap.md`)의 다음 칸은 **증분 2 "맥락이 쌓인다"** — `build-context` skill · `reap decide` · `handoff.md` 흐름이다. ms-002가 그 앞에 끼어든 것이므로 이제 그것이 다음이다.

**사람이 정한 것 둘을 지킨다.**
- **ms-003은 사람이 직접 한다.** subagent 위임은 이번에 느렸다 — 품질이 아니라 왕복이 문제였다
- **`fix` 유형이 실제로 쓰이는지 본다.** ms-002에서 한 번도 안 쓰였다

**미룬 것** — 최종 리뷰의 Minor 넷이 남아 있다. `02-flow.md`의 세션 흐름 도식이 아직 옛 `ctx`(milestone 본문·memory·idea를 주입)를 그린다(ms-001부터 어긋나 있다) · 세대 괄호 밖 커밋 여섯 · `tests/store.test.ts`의 `paths()` 되읊기 · `record-vocabulary.md`가 두 어휘를 한 파일에 담는 것.
