# G1 — npm(node) 배포 패키지

**미결 (probe 진행 중, 2026-09-03).** 결정된 것만 아래에 있다. 실측 diff·tarball 크기·package.json 모양은 probe 보고 뒤에 채운다.

## 결정 — npm이 0.18.0의 1차 채널이다

ps-4f2a91 `08-delivery.md`는 단일 바이너리(brew/curl)를 배포 형태로 정하고 "npm 배포는 선택"이라 했다. 0.17.8 다리와 upgrade agent는 `npm i -g @c-d-cc/reap@next`를 전제한다. 둘 다 참이려면 **0.18.0은 npm으로 나가고, 바이너리(brew/curl)는 그 뒤의 채널**이다. 이것은 방향 전환이 아니라 순서다 — spec이 npm을 배제하지 않았고, npm 문제의 원인(설치 스크립트)은 postinstall 없는 순수 JS 번들에는 없다.

- 패키지 이름 `@c-d-cc/reap`, 버전 `0.18.0`, `private` 제거, `reap.autoUpdateMinVersion: "0.18.0"` 유지
- 엔트리는 `bun build --target=node`가 낸 번들. Bun 전용 API(`Bun.YAML`·`Bun.sleep`)를 node에서도 도는 것으로 바꾼다 — 소스는 하나이고 Bun 컴파일 바이너리도 같은 소스에서 나온다
- tree-sitter wasm 15개(약 28MB)는 패키지에 싣고 번들 위치 기준으로 찾는다
- `postinstall` 없음. 설치는 파일 복사뿐이다
- `plugin/`은 패키지에 싣지 않는다 — 플러그인은 마켓플레이스가 설치한다. `--plugin-dir` 개발용은 리포에서 한다
