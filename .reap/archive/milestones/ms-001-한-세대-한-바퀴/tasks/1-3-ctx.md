# Task 1.3 — `ctx`

**1차 구현 완료 (gen-0003-exec, `0f96dc0`). gen-0004-plan·002·003으로 재작업 필요.**

## 공개 인터페이스

```ts
export function assemble(root: string, milestone?: string): string;   // 주입될 본문
```

```bash
reap ctx [--milestone <ms-id>] [--hook]
```

규범은 [agent 층](../../../../../docs/superpowers/specs/reap/06-agent.md)이 소유한다.

## 조립하는 것

`genome/` 전체 · `environment/summary.md` · **상태 줄**. 그것이 전부다.

**milestone 본문도 `memory/`도 `idea/`도 조립하지 않는다.** 상태 줄이 어디 있는지 말하고 무엇을 읽을지는 agent가 정한다.

`memory/`를 뺀 이유는 누적되는 문서이기 때문이다. 자라기만 하는 것을 매 세션 실으면 오늘 필요 없는 교훈이 오늘 필요한 지식의 자리를 밀어낸다.

1차 구현에서 실었던 milestone 넷과 세대 기록 본문을 **빼는 것이 이 재작업의 절반이다.**

## 상태 줄

```
현재 milestone: ms-001 한 세대 한 바퀴 (focus, open)
  .reap/milestones/ms-001-한-세대-한-바퀴/
    milestone.md · decisions.md · handoff.md
    tasks/1-1-저장소-레이아웃과-init.md · tasks/1-2-id-문서-make-mark.md
    tasks/1-3-ctx.md · tasks/1-4-플러그인-훅-skill.md
열린 세대: gen-0008-exec ctx 재작업 — generations/gen-0008-exec-ctx-재작업.md
  2026-08-22T16:10:00Z 시작, 시작 커밋 c77ed32
기억: .reap/memory/lessons.md · tracks.md
작업을 시작하면 /reap:evolve, 마무리하면 /reap:complete
```

**이번 세대가 열 만한 것은 이름을, 있다는 사실만 알면 되는 것은 개수를 낸다.** milestone 문서와 `tasks/`와 `memory/`는 이름, `idea/`는 개수(`덜 단단한 것: .reap/idea/ (research 3 · freememo 1)`).

빈 파일은 이름을 내지 않는다 — 위 예시에서 `context.md`가 빠진 것이 그것이다. 빈 디렉토리는 줄 자체를 내지 않는다.

milestone이 없으면 그 묶음을 내지 않고, 열린 세대가 없으면 그 줄을 내지 않는다. **마지막 안내 줄은 항상 낸다.**

## milestone 선택

바인딩 > `--milestone` > focus. 가리키는 것이 없으면 조용히 다음 순위로 내려간다.

## `--hook`

`{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext": "<조립된 본문>"}}`.

**이스케이프는 문자열을 만든 쪽이 한다.** 실을 것이 없거나 REAP 프로젝트가 아니면 아무것도 내지 않고 성공으로 끝난다.

## 증명해야 할 동작

- `genome/`과 `environment/summary.md`의 본문이 실린다
- **`milestone.md`·`context.md`·`decisions.md`·`handoff.md`·`tasks/`·`memory/`·`idea/`·세대 기록의 본문이 실리지 않는다** — 각 파일 본문에만 있는 문자열로 확인한다
- 상태 줄에 `memory/`의 파일 이름과 `idea/`의 개수가 나온다. `idea/`가 비어 있으면 그 줄이 없다
- 상태 줄에 milestone id와 디렉토리 경로가 있고, **그 안의 파일 이름이 실제 파일과 일치한다**
- 빈 파일은 상태 줄의 이름 목록에서 빠진다
- 열린 세대가 있으면 id와 기록 경로가 나오고, 닫혀 있으면 그 줄이 없다
- milestone이 없어도, 열린 세대가 없어도, 갓 `init`한 프로젝트에서도 실패하지 않는다. 그래도 안내 줄은 나온다
- 바인딩된 milestone이 `--milestone`보다, `--milestone`이 focus보다 우선한다
- 없는 파일과 빈 파일은 똑같이 조용히 건너뛴다
- `--hook` 출력이 유효한 JSON이고, 줄바꿈·따옴표·백슬래시가 든 맥락에서도 파싱된다
- REAP 프로젝트가 아닌 곳에서 `--hook`은 빈 출력에 성공, `--hook` 없이는 실패

## 함정

- **상태 줄을 skill에 맡기지 않는다.** 그러면 agent가 매번 `.session`을 정확히 읽고 해석할 것을 기대하게 되고, 바인딩을 도구에 둔 이유와 어긋난다.
- 지도가 틀리면 자율이 무너진다. 경로를 조립할 때 milestone 디렉토리 이름을 추측하지 말고 실제 항목에서 가져온다.
- 상태 줄을 만드느라 파일을 열어 본문을 읽었다면, 그 본문이 결과에 새어들어가지 않게 한다.

## 완료 판정

`reap ctx --hook | python3 -c 'import json,sys; json.load(sys.stdin)'`이 통과한다.

그리고 이 리포에서 조립된 맥락에 **`handoff.md`의 문장이 한 줄도 없고, 상태 줄의 파일 목록이 실제 `ls`와 일치한다.**
