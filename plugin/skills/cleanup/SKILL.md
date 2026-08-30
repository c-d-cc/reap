---
name: cleanup
description: Use right after a human confirms fitness to close a milestone in a REAP project, before calling mark milestone --closed - deciding which generations in life/generations/ have lost their reference value and moving those to archive. Trigger on "정리", "cleanup", "archive로 옮겨", or right after the human confirms fitness for a milestone in a repo containing .reap/.
---

# cleanup — 참고 가치가 다한 세대를 archive로 내린다

## 언제 부르는가

사람이 fitness를 말해 milestone을 닫기로 한 직후, **`mark milestone --closed`를 부르기 전.** 또는 사람이 "정리해줘"라고 할 때.

**순서가 중요하다.** `mark milestone --closed`는 milestone 디렉토리를 통째로 `archive/milestones/`로 옮긴다 — `handoff.md`도 함께 옮겨진다. 그 뒤에 이 skill을 부르면 옮긴 세대 목록을 적을 `handoff.md`가 이미 archive에 있고, `ctx`의 milestone 선택은 닫힌 milestone을 건너뛰므로 다음 세션이 그 `handoff.md`를 읽을 길이 없다. 그래서 종료 순서는 **사람의 fitness → `cleanup` → `mark milestone --closed`**다 — 이 skill이 먼저 돌아 `handoff.md`에 기록을 남기고, 그다음에야 milestone이 archive로 옮겨간다.

## `life/generations/`가 무엇인가

`life/generations/`는 "열려 있는 세대만 담는 곳"이 아니다. **지금 일에 참고할 값이 남은 세대를 담는 작업 세트다** — 열린 것과, 닫혔지만 아직 읽을 이유가 있는 것. milestone을 진행하는 agent는 지난 세대를 참고하는데, 세대는 계속 늘어나므로 수백 개가 한 곳에 있으면 참고할 수 있다는 것이 참고할 수 없다는 뜻이 된다. 그래서 agent는 `life/generations/`만 보면 되고, `archive/generations/`는 특정한 것을 찾을 때만 연다. 이 skill이 그 경계를 관리한다.

## 무엇을 하는가

milestone은 아직 `vision/milestones/<ms-id>-<slug>/`에 있다 — `mark milestone --closed`는 이 skill 다음에 부른다. `.reap/life/generations/`를 훑어, 참고 가치가 다한 세대를 골라 `.reap/archive/generations/`로 내리는 것이 이 skill의 일이다. **milestone 디렉토리 자체는 이 skill이 옮기지 않는다** — 그것은 뒤이어 부르는 `mark milestone --closed`가 한다.

**옮기는 시점이 milestone이 닫힐 때인 이유는, 세대가 닫히는 순간에는 그것을 다시 볼지 아직 모르기 때문이다** — milestone이 끝나야 그 답이 나온다.

**무엇을 옮길지는 판단이다. CLI는 이동만 한다** — `mark generation --archived`는 계산하지 않고 옮기기만 한다.

## 무엇을 옮기고 무엇을 남기는가

**묻는 것은 하나다: 이 세대를 앞으로 볼 일이 있는가.** milestone 소속이 아니다. frontmatter의 `milestone` 필드는 옮길지 말지를 정하지 않는다 — 소속과 참고 가치는 다른 질문이다.

**열린 세대는 옮기지 않는다.** `status: open`인 세대를 archive로 내리면 다음 세션이 상태 줄에서 그것을 찾지 못한다 — 세션이 죽은 것처럼 보이고, `evolve`가 그 위에 새 세대를 열어버린다. `.reap/life/generations/`를 열어 `status`를 먼저 본다.

**옛 plan 세대(`gen-NNNN-plan`, loop 이전의 것)는 그 plan이 실제로 반영됐으면 내린다.** spec이나 계획 문서에 이미 반영되어 지금은 그 결과물(반영된 spec, 완료된 milestone)을 보면 되는 plan은 더 볼 일이 없다. 아직 반영 중이거나 다음 작업이 그 plan을 직접 참고해야 하면 남긴다.

**exec 세대는 그 일이 milestone과 함께 끝났으면 내린다.** 이 milestone이 끝났다는 것은 그 milestone에 속한 exec가 낳은 산출물이 이미 코드·spec·문서에 반영되어 있다는 뜻이다 — 산출물을 보면 되지 세대 기록을 다시 볼 이유가 없다.

**fix도 같은 질문으로 판단한다.** milestone과 무관하지만, 그 fix가 되돌린 문제나 남긴 교훈을 지금 하는 일이 다시 참고할 이유가 있으면 남긴다.

**아직 살아 있는 결정이나 막다른 길을 담고 있으면 유형과 무관하게 남긴다.** 그것이 `life/generations/`가 존재하는 이유다. **애매하면 남긴다** — 잘못 옮기는 것보다 archive에 안 옮겨진 채 남는 것이 싸다.

**다만 "애매하면 남긴다"는 판단이 실제로 갈릴 때의 규칙이지, 남길 이유를 발명하라는 뜻이 아니다.** 그 구멍은 실제로 뚫렸다 — `ms-003`을 닫을 때 세대 하나의 교훈·규칙·관찰을 전부 `lessons.md`와 spec으로 졸업시켜 놓고, **그러고도 원본을 "관찰 중이니까"라며 남겼다.** 사람이 "다 완료한 건데 왜 저것만 남아 있는가"라고 물어서야 근거가 검증을 못 버틴다는 것이 드러났다.

**그러므로 남기기로 했다면 스스로에게 하나를 더 묻는다: 이것을 다시 열 상황을 구체적으로 말할 수 있는가.** "나중에 필요할지도"나 "아직 관찰 중이라"는 상황이 아니다. **어떤 세션이 무엇을 하다가 이 파일을 열게 되는지**를 한 문장으로 못 쓰면 그것은 애매한 것이 아니라 내리는 것이다.

**졸업시킨 것의 원본은 남길 이유가 아니라 내릴 이유다.** 가져갈 것을 이미 위로 올렸다는 뜻이기 때문이다.

## idea도 같은 질문으로 훑는다

`idea/`의 셋(research·freememo·files)도 작업 세트다. 물음은 같다 — **이것을 앞으로 볼 일이 있는가.** research는 졸업 조건이 이미 충족돼 plan source나 backlog로 갔으면 내리고, 아직 결론이 없으면 남긴다. freememo는 그 메모가 가리키던 일이 끝났으면 내린다. files는 채택돼 `environment/resources/`로 갔거나 버려졌으면 내린다. 상태 줄이 개수를 내므로 **내리지 않으면 개수가 영원히 는다.**

## backlog도 같은 질문으로 훑는다

**`life/backlog/`도 작업 세트다.** `life/`가 "열려 있는 것"이 아니라 "아직 참고할 값이 있는 것"이라는 규범은 세대에만 걸리는 것이 아니다. 그런데 backlog는 오래 그 경계를 관리할 장치가 없어 **한 번 쓰이면 영원히 쌓였다.**

묻는 것은 세대와 같다: **이 항목을 앞으로 볼 일이 있는가.**

**`status: consumed`는 기본 후보일 뿐 판단이 아니다.** 상태와 위치는 다른 질문이다. 소비된 항목이라도 **무엇을 물었고 답이 어떻게 뒤집혔는지**가 아직 읽을 값을 가질 수 있다 — 실제로 그런 항목이 있었다(`bk-15780b`은 트리거를 물었는데 답이 "기준이 틀렸다"로 뒤집혔고, 그 경위가 본문 맨 위에 남았다).

**`open`인 항목은 옮기지 않는다.** 아직 할 일이고, archive로 내리면 다음 세션이 그것을 못 본다.

**"하지 않기로 했다"도 소비다.** 상태 값을 따로 두지 않는다 — 그 항목의 물음이 끝났다는 점에서 같고, 왜 안 하기로 했는지는 본문이 담는다.

```bash
reap mark backlog <bk-id> --archived
reap mark idea <idea-id> --archived      # archive/idea/<kind>/ 로. status는 그대로
```

**`status`는 건드리지 않는다.** 세대와 같다 — archive는 상태가 아니라 위치다.

## 옮긴다

```bash
reap mark generation <gen-id> --archived
```

**`status`는 건드리지 않는다.** archive는 상태가 아니라 위치이므로, 이미 `closed`인 세대는 옮긴 뒤에도 `closed`다. id로 참조하는 다른 기록은 이동 뒤에도 그 세대를 계속 찾는다 — 참조는 경로가 아니라 id다.

## 기록한다

옮긴 세대와 backlog의 목록을 `handoff.md`에 남긴다 — 무엇을 옮겼고, 참고 가치가 남아 있어 보이는데 남긴 것이 있다면 왜 남겼는지(가치 판단이 불확실해서, 열려 있어서 등).

## 도구가 있으면 도구로

`reap` 바이너리가 있으면 이동은 `mark generation|backlog --archived`가 한다. 바이너리가 없으면 파일을 손으로 옮기고 frontmatter는 건드리지 않는다.
