# Application

REAP는 AI와 사람이 소프트웨어를 함께 진화시키기 위한 **규약과 도구의 집합**이다. 작업의 모양을 결정하지 않고, 작업이 쓸 수 있는 도구와 저장 규약을 제공한다.

## 규범은 plan source가 소유한다

무엇이 참이어야 하는지는 전부 `ps-4f2a91`(`docs/superpowers/specs/reap/`)에 있다. **여기에 옮겨 적지 않는다** — 두 곳에 있으면 어긋나고, 어긋난 쪽을 다음 세대가 읽는다.

작업 전에 `01-concepts.md`의 일곱 원칙과 `02-flow.md`의 세 층을 읽는다. 새 기능이 어느 층(판단/확정/사실)에 속하는지 헷갈리면 그 기능은 잘못 설계된 것이다.

## 만드는 것 둘

- **바이너리** `reap` — TypeScript, Bun, `bun build --compile`. brew/curl로 배포
- **플러그인** `plugin/` — skill과 SessionStart 훅. 클라이언트가 설치

둘은 따로 설치되고 따로 갱신된다. **한쪽만 있는 상태를 정상으로 전제한다.**

## 작업 규약

- 테스트는 `bun test`. 구현 전에 실패하는 테스트를 먼저 쓴다. `tests/`는 private 리포 `c-d-cc/reap-test`(v0.18)의 submodule — CI는 직접 안 돌리고 dispatch한다
- 사용자 문자열은 카탈로그(`src/messages/`, en 기본·ko)를 거친다. skill·씨앗은 en
- 커밋 메시지는 한국어. 무엇을 왜 바꿨는지를 적는다
