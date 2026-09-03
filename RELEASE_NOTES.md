## v0.18.0

REAP가 파이프라인 실행기에서 규약과 도구 제공자로 다시 만들어졌다.

**바뀐 것**

- 두 산출물로 나뉜다 — npm CLI `@c-d-cc/reap`과 Claude Code 플러그인. 플러그인은 마켓플레이스로 따로 설치·갱신한다
- 저장 구조가 3단이다 — `vision/`(하려는 것) · `life/`(지금 살아 있는 것) · `archive/`(더는 참고하지 않는 것)
- 작업 단위가 세 갈래다 — `loop`(새 의도를 만든다) · `milestone`(실행 가능한 단위로 잘라낸 계획) · `generation`(exec·fix — 코드를 실제로 진화시킨다)
- `reap doctor`가 확정적으로 검사할 수 있는 것을 검사하고 보고한다. 고치지는 않는다
- 코드 인덱스(`reap index`)를 계속 제공한다 — 15개 언어, 설치·백그라운드 프로세스 없음
- 이벤트 훅 여섯 종(`gen.made`·`gen.closed`·`milestone.made`·`milestone.closed`·`orch.claimed`·`orch.barrier.released`)과 `make hook`을 제공한다

**사라진 것**

- 5단계 lifecycle 강제와 그 흐름 명령(`run start/next/back/abort/early-close`, `/reap.*` 7종)
- `/reap.evolve`의 자율 실행 subagent 위임 — v0.18의 `evolve`는 주 세션이 직접 일한다
- `merge`/`pull`/`push` lifecycle
- `reap-evaluate` evaluator agent
- `status`·`config`·`check-version`·`uninstall` 명령
- 다국어 지원 — 한국어 전용이다

## 오는 법

v0.17.7 이하는 `reap update`가 0.17.8로 자동 올린다. 0.17.8이 설치하는 upgrade agent가 v0.18 CLI와 플러그인을 설치하고 `/reap:migrate`로 넘긴다. 원본 데이터는 `.reap-v0_17/`에 그대로 보존된다.

## 알아둘 것

- npm `next` 태그로 나간다 — `latest`가 아니므로 기존 사용자에게 자동으로 오지 않는다. 새로 설치하려면 `npm i -g @c-d-cc/reap@next`
- 한국어 전용이다. 비한국어 사용자는 이번 릴리스에서 다뤄지지 않는다
