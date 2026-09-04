# hooks

REAP가 직접 매개하는 지점(`make`·`mark`·orchestrate의 원자적 연산)에 이벤트 훅을 걸 수 있다. 메시지 송수신처럼 REAP가 관측할 수 없는 지점에는 훅이 없다.

## 여섯 이벤트

`make generation`·`mark generation --closed`·`make milestone`·`mark milestone --closed`·`orch claim`(성공)·`orch barrier`(해제)가 각각 하나씩 낸다.

| 이벤트 | 언제 |
|---|---|
| `gen.made` | 세대를 열었을 때 |
| `gen.closed` | 세대를 닫았을 때 |
| `milestone.made` | milestone을 잘랐을 때 |
| `milestone.closed` | milestone을 닫았을 때 |
| `orch.claimed` | 자원 선점이 성공했을 때 |
| `orch.barrier.released` | barrier가 `--expect`를 채워 풀렸을 때 |

발화는 해당 명령이 파일 쓰기를 끝낸 뒤다. 이벤트를 여섯 밖으로 늘리려면 같은 동작이 세대마다 반복되고, REAP가 직접 매개하는 지점에 걸리고, 프로젝트마다 달라야 하는 셋을 모두 만족해야 한다.

## 파일 규약

`.reap/hooks/{event}.{name}.{md|sh}`. `make hook`이 이 이름으로 파일을 놓는다.

```bash
reap make hook --event gen.closed --name notify --type sh --condition always --order 50
```

## `.md`와 `.sh`의 차이

`.sh`는 프로젝트 루트에서 실행되고 stdout이 명령 출력 뒤에 붙는다. `.md`는 실행하지 않는다 — 본문이 명령 출력 뒤에 그대로 붙고, agent가 그것을 읽고 따른다.

## condition과 order

`condition`(기본 `always`)은 `hooks/conditions/<c>.sh`의 종료 코드가 0일 때만 훅을 돈다. 조건 스크립트가 없으면 `doctor`가 결함으로 낸다. `order`는 오름차순으로 실행 순서를 정하고(기본 50), 같으면 파일명 순이다.

## 실패해도 명령은 성공한다

훅의 종료 코드와 stderr는 보고되지만 `make`·`mark`가 이미 쓴 파일은 그대로 남는다. 훅이 세대를 못 열게 만들면 그것은 게이트이고, REAP는 게이트를 두지 않는다. `.sh` 훅에는 타임아웃이 있어 매달리는 훅이 명령을 영영 붙잡지 않는다.

## 조건 스크립트

`hooks/conditions/`에 두는 별도 스크립트다. `init`이 기본으로 `always.sh`(항상 0을 반환)를 씨앗으로 놓는다. 훅마다 다른 조건이 필요하면 `hooks/conditions/`에 새 스크립트를 추가하고 `--condition`으로 가리킨다.

`.reap/.session`과 환경변수 `REAP_HOOK_EVENT`·`REAP_HOOK_ID`가 `.sh` 훅에 전달되어, 훅이 무엇 때문에 불렸는지 알 수 있다.
