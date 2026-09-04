# 개념

REAP가 하는 일 전부는 이 문서 하나로 요약된다. 근거와 전문은 REAP의 plan source([`docs/superpowers/specs/reap/`](https://github.com/c-d-cc/reap/tree/main/docs/superpowers/specs/reap))에 있다 — 여기는 그것을 옮겨 적지 않고, 실제로 REAP를 쓸 때 무엇을 어디서 찾는지만 정리한다.

## 세 개의 층

REAP에서 일어나는 모든 일은 셋 중 하나에 속한다.

| 층 | 누가 | 무엇을 |
|---|---|---|
| **판단** | skill을 읽는 agent | 무엇을 할지, 언제 할지, 됐는지 |
| **확정** | `reap` CLI | 확률에 맡길 수 없는 사실을 못 박는다 — id 발급, frontmatter, 원자적 선점 |
| **사실** | git, 파일시스템 | 실제로 무슨 일이 있었는가 — 커밋 유무, 작업 트리 상태 |

agent는 판단하고, CLI에게 확정을 요청하고, 사실은 git에게 직접 묻는다. CLI가 사실을 감싸지 않는 이유는 agent가 이미 `git status`를 쓸 수 있기 때문이다.

## 작업 단위 — loop·milestone·generation

기획과 실행은 서로 다른 사이클로 돈다.

- **loop** — 새 의도를 만든다. 유형은 `plan`·`design`·`uiux`·`idea` 넷. 여러 세션에 걸치는 것이 정상이고, 여럿이 나란히 열릴 수 있다. 산출물이 자리를 찾으면(milestone을 낳거나, plan source에 쓰거나) 닫힌다
- **milestone** — loop에서 잘라낸 실행 가능한 단위. 경계와 종료 조건을 가지며, **공유 context가 쌓이는 자리**이자 사람의 fitness 평가를 받는 단위다
- **generation** — 소스코드를 진화시키는 작업 사이클. 세션에 바인딩되고 하나만 열린다

generation은 둘로 갈린다.

| 유형 | 무엇을 | milestone 소속 |
|---|---|---|
| **exec** | 새 의도를 실현한다 | 반드시 소속 — 근거는 milestone 또는 backlog 항목 |
| **fix** | 이미 있는 의도로 되돌린다 (버그, 깨진 빌드, 낡은 의존성) | 무소속 |

fix가 milestone을 갖지 않는 이유는 작아서가 아니다. milestone은 *새 의도*에 경계를 주는 장치인데, 되돌리는 일은 새 의도를 만들지 않는다 — 되돌아갈 곳 자체가 이미 경계다. 크기는 축을 가르는 기준이 아니다: 작은 새 기능도 fix가 아니라 exec이다.

## 3단 저장소

`.reap/` 최상위를 가르는 것은 유형이 아니라 **시간**이다.

```
vision/    하려는 것 — 기억(memory/), 잘라낸 실행 단위(milestones/)
life/      지금 살아 있는 것 — generations/, backlog/, loops/
archive/   더는 참고하지 않는 것
```

`life/`는 "열려 있는 것"이 아니라 **"아직 참고할 값이 있는 것"**이 쌓이는 곳이다. 닫힌 generation도 참고할 값이 남아 있으면 거기 있다 — 닫힘은 *상태*이고 archive는 *위치*이며, 둘은 다른 질문에 답한다. milestone이 닫힐 때 `cleanup` skill이 `life/generations/`를 훑어 참고 가치가 다한 것을 `archive/`로 내린다.

이 3단과 나란히, 시간축에 얹히지 않는 넷이 최상위에 선다.

- **`plan/`** — 리포 밖일 수 있는 plan source의 등록부(`sources.yml`)와 그것을 읽고 쓰는 법(`conventions/`)
- **`genome/`** — `application.md`(제품 정체성) · `evolution.md`(AI 행동 규칙) · `invariants.md`(절대 제약, 사람만 수정)
- **`environment/`** — 현재 기술 스택, 소스 구조, 빌드·테스트 방법
- **`idea/`** — 아직 단단하지 않은 지식 — `research/`(결론 없는 조사) · `freememo/`(자유 메모) · `files/`(외부 참고자료)

## 상태 줄이 지도다

세션이 열릴 때 매번 실리는 것은 `genome/`과 `environment/summary.md`의 본문, 그리고 **상태 줄**뿐이다. `milestone.md`도 `handoff.md`도 세대 기록 본문도 그 안에 실리지 않는다 — 상태 줄은 열린 milestone·generation·loop의 **경로와 이름만** 알리고, 그것을 열지 말지는 agent가 그때그때 판단한다.

전체 배치를 이름만으로는 읽을 수 없다. 그래서 각 프로젝트는 `.reap/map.md`를 갖는다 — 이 디렉토리가 무엇을 어디에 두는지 설명하는 지도다. `init`이 한 번 놓고, 매 세션 주입되지는 않는다. 상태 줄이 `구조: .reap/map.md`로 자리만 알리면, 필요한 agent가 그때 연다.

[첫 사용](/quick-start)에서 찍은 상태 줄 예시로 돌아가 보면, 이 구조가 그대로 문장이 된 것을 볼 수 있다.
