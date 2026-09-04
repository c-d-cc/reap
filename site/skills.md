# skill 10종

agent가 REAP를 다루는 통로는 skill이다. 플러그인이 배포한다.

| skill | 언제 |
|---|---|
| [`init`](#init) | 프로젝트당 한 번, 맨 처음 — 정본 지식을 세운다 |
| [`evolve`](#evolve) | 세대를 열 때 — loop·exec·fix 중 무엇인지 정한다 |
| [`complete`](#complete) | 세대를 닫을 때 |
| [`loop`](#loop) | 새 의도를 만들 때 — 기획·설계·화면·아직 자리 없는 것 |
| [`carve-milestone`](#carve-milestone) | plan을 실행 가능한 milestone으로 자를 때, 그리고 milestone을 닫을 때 |
| [`interview`](#interview) | 의도가 모호해 사람이 결정해야 할 때 |
| [`orchestrate`](#orchestrate) | 두 세션 이상이 같은 프로젝트에서 동시에 작업할 때 |
| [`cleanup`](#cleanup) | 사람이 fitness로 milestone을 닫기로 한 직후 |
| [`migrate`](#migrate) | v0.17 데이터를 v0.18 구조로 옮길 때 |
| [`report-issue`](#report-issue) | REAP 자체의 결함이나 빠진 기능을 만났을 때 |

각 skill의 전문은 `plugin/skills/<이름>/SKILL.md`에 있다. 아래는 언제·무엇을·부르지 않는 경우만 요약한다.

## init

**언제** — 프로젝트당 딱 한 번, 맨 처음. `.reap/`가 없거나 있어도 씨앗 그대로일 때. 상태 줄이 안내하지 못하는 유일한 skill이라 사람이 직접 부른다.

**무엇을** — `reap init` 뒤 plan source를 등록하고 `environment/summary.md`·`genome/application.md`·`evolution.md`를 채운 뒤 첫 milestone을 `carve-milestone`에 넘긴다.

**부르지 않는 경우** — `.reap/`가 있고 씨앗이 이미 채워져 있으면 이 skill의 일이 아니다.

## evolve

**언제** — 세대를 열 때, 새 작업을 시작할 때.

**무엇을** — 상태 줄과 `handoff.md`·`milestone.md`·task를 읽고 새 의도를 만드는 일(loop)인지 실현·되돌리는 일(generation)인지 정한 뒤 연다.

**부르지 않는 경우** — 이미 열린 세대가 있으면(내 것이면 이어가고 남의 것이면 새로 열지 않는다), 한 번의 편집·커밋으로 끝나는 일이면(세대를 열 값이 없다).

## complete

**언제** — 세대를 닫을 때, 작업을 마무리할 때.

**무엇을** — 위임된 세대면 Outcome·Dead Ends를 먼저 검토하고, 커밋 규칙(작업 트리가 비어 있고 새 커밋이 있는가)을 확인한 뒤 기록과 `handoff.md`를 정리해 닫는다.

**부르지 않는 경우** — 커밋 규칙이 안 맞으면 여기서 멈춘다. 커밋 없이 닫지 않는다.

## loop

**언제** — 새 의도를 만들 때 — 기획(`plan`)·설계(`design`)·화면·흐름(`uiux`)·아직 자리 없는 것(`idea`).

**무엇을** — loop를 열거나 이어 plan source에 쓰고 `Dialogue`를 기록하며, 자를 것이 정해지면 `carve-milestone`으로 넘겨 milestone을 낳고 닫는다.

**부르지 않는 경우** — 이미 실현할 의도가 서 있어 실행만 하면 될 때(그건 generation), 같은 물음을 다루는 loop가 이미 열려 있을 때(새로 열지 않고 잇는다).

## carve-milestone

**언제** — loop 안에서 plan을 실행 가능한 milestone으로 자를 때, 그리고 milestone을 닫을 때.

**무엇을** — 자르려는 전제를 실제 흔적에 대조한 뒤 경계·종료 조건·범위 밖과 task를 적어 자르거나, fitness·cleanup·mark 순서로 닫는다.

**부르지 않는 경우** — backlog 항목 하나로 충분하면(경계가 두 곳에 적힌다), 무엇을 만들지 아직 안 섰으면(그건 interview·loop의 일), 한 세대로 끝날 일이면 backlog 항목으로 충분하다.

## interview

**언제** — 의도가 모호해 사람이 결정해야 할 때. `evolve`·`loop`·`carve-milestone`·`init`이 가리킬 때.

**무엇을** — 코드·spec·기존 대화로 답이 나오는 질문을 걸러낸 뒤, 한 번에 하나·선택지 2~4개+자유입력·대가·근거 있는 추천·끝이 보이는 형식으로 사람에게 묻는다.

**부르지 않는 경우** — 명령 한 줄로 확정되는 사실, spec이나 `handoff.md`·`Dialogue`에 이미 답이 있는 것, 사람 몫이 아닌 판단에는 부르지 않는다.

## orchestrate

**언제** — 두 세션 이상이 같은 프로젝트에서 동시에 작업할 때.

**무엇을** — worktree로 역할을 가르고, 손대기 전에 `claim`하고, 합류점에 `barrier`를 두고, `SendMessage`로 조율한다.

**부르지 않는 경우** — 혼자 일할 때는 이 skill이 없는 것과 같다. 상태 줄에도 `doctor`에도 아무것도 안 나온다.

## cleanup

**언제** — 사람이 fitness로 milestone을 닫기로 확인한 직후, `mark milestone --closed`를 부르기 전.

**무엇을** — `life/generations/`를 훑어 참고 가치가 다한 세대를 `archive/generations/`로 내린다.

**부르지 않는 경우** — 열린 세대는 옮기지 않는다. 애매하면 남긴다 — 남길 이유를 억지로 만들지 않는다.

## migrate

**언제** — 프로젝트가 v0.17 시대 REAP 데이터(구 5단계 파이프라인 레이아웃)를 갖고 있을 때, 또는 upgrade agent가 설치 뒤 넘겨줄 때.

**무엇을** — 판정 → 사전 차단 → 고지·동의 → 격리 → 새 구조 → 이주(subagent) → 검증 → 기록의 8단계로 옮긴다. 원본은 `.reap-v0_17/`에 그대로 보존한다.

**부르지 않는 경우** — uncommitted 변경이나 열린 generation이 있으면 정리한 뒤 부른다. 판정이 `v018`이면 이미 이주할 것이 없다.

## report-issue

**언제** — REAP 자체의 결함이나 빠진 기능을 만났을 때.

**무엇을** — 누구의 문제인지 가르고, 재현 명령·기대·실제를 실어 이 프로젝트의 코드·경로를 뺀 issue를 써서 `gh`로 올린다.

**부르지 않는 경우** — 이 프로젝트의 코드·genome·backlog 판단이면 issue가 아니다. 헷갈리면 이 프로젝트의 backlog에 먼저 적는다.
