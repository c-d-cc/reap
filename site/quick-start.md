# 첫 사용

프로젝트에서 (신규 폴더든 기존 코드베이스든) 세 skill만 있으면 된다.

## 1. `/reap:init` — 처음 한 번

```
/reap:init
```

정본 지식을 세운다 — plan source 등록, `.reap/environment/summary.md`, `.reap/genome/`. 프로젝트당 딱 한 번이다. 이 skill만 상태 줄이 안내하지 못한다 — `.reap/`가 없으면 SessionStart 훅이 침묵하므로 사람이 직접 불러야 한다.

## 2. `/reap:evolve` — 세대를 연다

```
/reap:evolve
```

새 의도를 만드는 일인지(`loop`), 만들어둔 의도를 실현하는 일인지(`exec` generation), 이미 있는 의도로 되돌리는 일인지(`fix` generation)를 판단하고 연다. 그다음은 자율 구간이다 — 탐색하고 짜고 고친다. 순서도 횟수도 REAP가 정하지 않는다.

## 3. `/reap:complete` — 세대를 닫는다

```
/reap:complete
```

커밋 규칙(`git status --porcelain`이 비어 있고, 시작 커밋 이후 새 커밋이 있는가)을 확인하고, 기록과 `handoff.md`를 정리한 뒤 세대를 닫는다.

## 상태 줄이 지도다

세션이 열릴 때마다 SessionStart 훅이 `reap ctx`를 불러 맥락을 주입한다. genome 본문과 environment 요약, 그리고 **상태 줄** — 지금 무엇이 열려 있고 무엇을 더 읽어야 하는지 경로로 가리키는 한 뭉치다.

아래는 빈 프로젝트에서 `reap init` 뒤 `reap make loop`·`reap make milestone --focus`·`reap make generation`을 차례로 거친 뒤 실제로 찍은 `reap ctx` 출력이다 (genome·environment 본문은 초기 씨앗 그대로다 — 채워 넣는 절차는 `/reap:init`이 한다):

```
<!-- reap 상태 -->
응답 언어: ko
현재 milestone: ms-001 로그인 붙이기 (focus, open)
  .reap/vision/milestones/ms-001-login/
    milestone.md
열린 세대: gen-0001-exec 로그인 폼과 세션 발급 — .reap/life/generations/gen-0001-exec-login-form.md
  2026-09-04T00:09:22Z 시작, 시작 커밋 c5c3264
열린 loop: loop-0001-plan 인증 붙이기 — .reap/life/loops/loop-0001-plan-auth.md
기억: .reap/vision/memory/lessons.md
구조: .reap/map.md
작업을 시작하면 /reap:evolve, 마무리하면 /reap:complete
```

`milestone.md`도 `handoff.md`도 본문이 이 안에 실려 있지 않다 — 상태 줄은 **경로와 이름**만 알리고, 그 경로를 열지 말지는 agent가 판단한다. 이 판단 순서와 저장 구조 전체는 [개념](/concepts)에서 다룬다.
