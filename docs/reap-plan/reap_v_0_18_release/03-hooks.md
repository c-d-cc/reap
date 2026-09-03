# hooks — v0.18의 이벤트 훅

사람(2026-09-01, gen-0074 기록): **v0.18도 hooks를 제공한다. lifecycle만 다르다.** ps-4f2a91 `07-orchestrate.md`의 "아직 만들지 않는다"는 이 결정으로 만료됐고, 그 문서의 이벤트 정의(여섯)·파일 규약(`{event}.{name}.{md|sh}`, `condition`·`order`, `hooks/conditions/`)은 그대로 규범이다. 이 milestone이 끝나면 07의 "언제 만드는가" 절을 결정으로 갱신한다.

## 무엇이 참이어야 하는가

- `reap make hook --event <e> --name <n> [--type md|sh] [--condition <c>] [--order <n>]`이 `.reap/hooks/{event}.{name}.{ext}`를 놓는다. 이벤트는 `gen.made` · `gen.closed` · `milestone.made` · `milestone.closed` · `orch.claimed` · `orch.barrier.released` 여섯뿐이고 그 밖은 거부한다
- `make generation`·`mark generation --closed`·`make milestone`·`mark milestone --closed`·`orch claim`(성공)·`orch barrier`(해제)가 해당 이벤트를 **발화**한다. 발화는 그 명령의 파일 쓰기가 끝난 뒤다
- `.sh`는 프로젝트 루트에서 실행되고 stdout이 명령 출력 뒤에 붙는다. `.md`는 실행하지 않고 본문을 명령 출력 뒤에 붙인다 — agent가 읽고 따른다(v0.17과 같은 방식)
- `condition`(기본 `always`)은 `hooks/conditions/<c>.sh`의 종료 코드 0으로 판정. `order` 오름차순, 동률은 파일명순
- **훅 실패는 명령을 실패시키지 않는다.** 훅의 종료 코드·stderr는 보고하되 `make`·`mark`의 결과(이미 쓴 파일)는 그대로다 — 훅이 세대를 못 열게 만들면 그것은 게이트이고, REAP는 게이트를 두지 않는다
- 타임아웃은 `.sh`에만 있고 값은 spec이 정한다(v0.17은 60초, 조건 10초). 매달리는 훅이 `mark`를 영영 붙잡지 않는다
- `doctor`가 hooks/의 파일명이 규약에 안 맞거나 모르는 이벤트를 쓰면 **결함**으로, 조건 스크립트가 없으면 결함으로 낸다
- `.reap/.session`·환경변수 `REAP_HOOK_EVENT`·`REAP_HOOK_ID`(발화 대상 id)를 `.sh`에 준다 — 훅이 무엇 때문에 불렸는지 알아야 한다

## v0.17 훅의 이주

v0.17 이벤트 14종 중 v0.18 여섯에 대응하는 것만 옮긴다. 매핑은 `migrate` skill의 migration-map이 소유한다([04-migrate-docs.md](04-migrate-docs.md)). 대응 없는 것(`onLearned`·`onPlanned`·`onImplemented`·`onValidated`·merge 계열)은 기록 파일에 "대응 이벤트 없음"으로 남긴다.

| v0.17 | v0.18 |
|---|---|
| `onLifeStarted` | `gen.made` |
| `onLifeCompleted` | `gen.closed` |
| 나머지 12 | 없음 |

## 검증할 동작

- 훅이 `exit 1`해도 `make generation`이 세대 파일과 `.session`을 남긴다
- 조건 스크립트가 0이 아니면 훅이 돌지 않고, 조건 파일이 없으면 doctor 결함
- `.md` 훅 본문이 `mark generation --closed` 출력 뒤에 그대로 붙는다
- `tests/hook.test.sh`가 아니라 `bun test`의 새 파일(`hooks.test.ts`)이 위를 덮는다
