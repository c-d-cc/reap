# Map — `.reap/` 지도

REAP를 처음 보는 사람과 agent를 위한 것이다. 각 디렉토리가 무엇을 담는지 여기서 안다. 규범 자체는 REAP plan source(`plan/conventions/`가 가리키는 곳)가 소유한다 — 여기는 그것을 옮겨 적지 않고, 이 프로젝트의 `.reap/`를 열었을 때 필요한 만큼만 쓴다.

## 최상위를 가르는 것은 유형이 아니라 시간이다

```
vision/    하려는 것 — 아는 것(memory), 잘라낸 실행 단위(milestones)
life/      지금 살아 있는 것 — generations, backlog, loops
archive/   더는 참고하지 않는 것 — generations, milestones, backlog, loops, idea
```

**`plan/`은 이 3단 밖에서 최상위로 선다** — plan source는 리포 밖을 가리키는 등록부라 "하려는 것 / 사는 것 / 끝난 것"이라는 시간축에 얹히지 않는다. `genome/`·`environment/`·`idea/`와 나란하다. **loop는 여기가 아니라 `life/loops/`다** — loop는 열리고 닫히고 archive로 가므로 시간축에 얹힌다. 등록부가 아니다.

`vision/`은 바뀌지 않는 한 계속 참조된다. `life/`는 "열려 있는 것"이 아니라 **"아직 참고할 값이 있는 것"** 이 쌓이는 곳이다 — 닫힌 세대도 참고할 값이 남아 있으면 거기 있다. 닫힘은 *상태*이고 archive는 *위치*이며, 둘은 다른 질문에 답한다. milestone이 닫히면 그 디렉토리가 통째로 `archive/milestones/`로 옮겨가고, 그때 `cleanup` skill이 `life/generations/`를 훑어 참고 가치가 다한 세대를 골라 `archive/generations/`로 따로 내려보낸다 — **archive의 두 디렉토리는 서로를 담지 않는다.**

## 세대(generation)는 유형과 무관하게 한 곳에 쌓인다

`life/generations/`(끝나면 `archive/generations/`) 하나뿐이다. 유형별 폴더로 가르지 않는다 — 유형이 늘 때마다 최상위가 늘어나는 것을 피하기 위해서다. 대신:

- **유형은 id 안에 있다** — `gen-<순번>-<exec|fix>`. 순번은 유형과 무관한 하나의 계열이므로 이름순 정렬이 곧 시간순이다. `gen-NNNN-plan`은 `loop-0001` 이전의 역사다 — 더 발급하지 않는다
- **milestone 소속은 frontmatter의 `milestone` 필드가 말한다.** exec만 이 필드를 갖는다. fix는 무소속이다

| 단위 | 하는 일 | 근거 |
|---|---|---|
| loop (`life/loops/`) | 새 의도를 만든다 — 유형 `plan\|design\|uiux\|idea` | 선택 |
| exec generation | 새 의도를 실현한다 | milestone 또는 backlog 필수 |
| fix generation | 이미 있는 의도로 되돌린다 | 없음 |

## 디렉토리별로 무엇이 사는가

- `vision/memory/` — `lessons.md`(프로젝트 전역 교훈) 하나다. **물음은 닫히는 것이고 교훈은 쌓이는 것이라** 한 파일에 섞으면 어느 쪽도 정리되지 않는다. 결론 안 난 물음은 `idea/research/`가 갖는다
- `plan/` — `sources.yml`(등록된 plan source), `conventions/<ps-id>-<slug>.md`(그 소스를 읽고 쓰는 법)
- `life/loops/` — 열린 loop와 최근 닫힌 loop 10개(`Question`·`Dialogue`·`Dead Ends`·`Outcome`). 넘치면 `mark loop --closed`가 오래된 것부터 `archive/loops/`로
- `vision/milestones/<ms-id>-<slug>/` — `milestone.md`(경계와 종료 조건), `handoff.md`(다음 세션 인계), `tasks/<n>-<slug>.md`(작업 상세)
- `life/generations/` — 참고할 값이 남은 세대 기록 (열린 것과, 닫혔지만 아직 읽을 이유가 있는 것). milestone이 닫힐 때 `cleanup`이 걸러낸다
- `life/backlog/` — 아직 참고할 값이 있는 항목 (안 한 것과, 소비됐지만 아직 읽을 이유가 있는 것). `cleanup`이 걸러 `archive/backlog/`로 내린다
- `genome/` — `application.md`(제품 정체성·아키텍처), `evolution.md`(AI 행동 규칙), `invariants.md`(절대 제약, 사람만 수정)
- `environment/` — `summary.md`(현재 기술 스택·빌드·테스트), `source-map.md`(선택, 코드 구조), `resources/`(채택한 외부 스펙)
- `idea/` — 아직 단단하지 않은 지식. `research/`(조사, 결론 없음) · `freememo/`(자유 메모) · `files/`(외부 참고자료)
- `sequence/` — id 레지스트리. `<type>.md` 하나씩, append-only
- `hooks/` — `{event}.{name}.{md|sh}`. 이벤트는 `gen.made`·`gen.closed`·`milestone.made`·`milestone.closed`·`orch.claimed`·`orch.barrier.released` 여섯뿐이다. `conditions/<c>.sh`가 조건 스크립트다 — `init`이 `always.sh`를 놓는다(씨앗 목록에는 안 든다)
- `templates/` — 이 프로젝트가 번들 템플릿을 덮어쓸 때 쓰는 자리 (있으면 씨앗보다 이긴다)

## id 형식

id를 갖는 것은 전부 `<id>-<slug>`다 (예외 없음). id 자체의 형식:

| 종류 | 형식 | 예 |
|---|---|---|
| milestone | `ms-<순번>` | `ms-004-auth-session/` |
| loop | `loop-<순번>-<plan\|design\|uiux\|idea>` | `loop-0001-plan-plan-loop.md` |
| generation | `gen-<순번>-<exec\|fix>` | `gen-0002-exec-token-rotation.md` |
| backlog | `bk-<해시>` | `bk-a3f8c2-token-rotation-retry.md` |
| idea | `idea-<해시>` | `idea-a3f8c2-oauth-device-flow.md` |
| plan source | `ps-<해시>` | 규약 파일 `ps-4f2a91-reap.md` |

`sequence/<type>.md`, `hooks/{event}.{name}.{ext}`, milestone 안의 `tasks/<n>-<slug>.md`는 id가 없으므로 이 규칙 밖이다.

참조는 언제나 id를 담는다 — slug는 제목이 바뀌면 함께 바뀌므로 저장되는 참조에는 들어가지 않는다.

## 이 파일 자체

**씨앗이다.** `init`이 없을 때만 놓고, 있으면 건드리지 않는다 — 프로젝트가 이 지도에 자기 사정을 덧붙일 수 있어야 한다. 그래서 REAP가 레이아웃을 바꿔도 이 파일은 저절로 안 바뀐다. `doctor`가 번들 템플릿과 비교해 어긋남을 알려주면 그때 사람이 고친다.

**매 세션 주입되지 않는다.** 상태 줄이 `구조: .reap/map.md`로 있다는 사실만 알리고, 필요한 agent가 연다.
