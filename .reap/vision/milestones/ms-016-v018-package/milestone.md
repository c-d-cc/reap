---
id: ms-016
slug: v018-package
title: 배포 패키지 — npm(node) 번들과 release 워크플로
from: loop-0004-plan
refs:
  - ps-5e948f:02-distribution.md
  - ps-5e948f:06-release.md
status: open
focus: true
openedAt: 2026-09-03T14:40:21Z
---
## Background

0.17.8 다리와 upgrade agent가 `npm i -g @c-d-cc/reap@next`를 전제하는데 v0.18은 `reap 0.1.0 private` + Bun 전용 엔트리다(01-gap G1·G6). probe(2026-09-03): `bun build --target=node`가 도는 번들을 내고 막히는 곳은 `Bun.YAML`·`Bun.sleep`·wasm 경로 셋뿐. 결정은 [02-distribution.md](../../../../docs/reap-plan/reap_v_0_18_release/02-distribution.md).

## Exit Criteria

- `npm pack`으로 만든 tarball을 `npm i -g <tarball>`(임시 prefix)로 설치한 `reap`이 **Bun 없이** `--version`(0.18.0)·`init`·`make`·`mark`·`ctx --hook`·`doctor`·`plan sources`·`index update/status/search`·`orch claim/release`를 낸다
- `bun test`·`tests/hook.test.sh`·`bun run typecheck`·`bun run build`(compile) 전부 초록 — Bun 쪽이 깨지지 않는다
- `.github/workflows/release.yml`이 태그 `v0.18.*`에서 `npm publish --tag next --access public`만 한다. `--tag next` 없는 publish 문자열이 워크플로에 없다
- `.github/workflows/ci.yml`이 push·PR에서 test·hook.test·typecheck·build·`npm pack --dry-run`을 돈다
- `package.json`: `@c-d-cc/reap` 0.18.0 · private 없음 · `bin.reap` · `files` · `engines.node` · `reap.autoUpdateMinVersion: "0.18.0"`. `plugin.json` version 0.18.0
- `environment/summary.md`의 빌드 절이 node 번들 경로를 적는다

## Out of Scope

- brew/curl 바이너리 채널 — npm 뒤의 일 (02-distribution)
- 실제 publish·태그 push — 사람 (06-release)
- README — ms-018

## Plan Items

1. node 호환 — YAML 손 파서 · sleep · wasm 경로 (tasks/1)
2. 패키지 모양과 빌드 스크립트 (tasks/2)
3. 워크플로 ci.yml · release.yml (tasks/3)

## Constraints

- 의존을 들이지 않는 방향이 먼저다. `yaml` 패키지는 손 파서가 sources.yml 형식을 못 읽을 때만
- 소스는 하나 — Bun 컴파일과 node 번들이 같은 `src/`에서 나온다. 런타임 분기(`typeof Bun`)는 최소

## 이 milestone이 끝나면 물어볼 것

- Bun 없는 머신에서 설치 → 첫 세대까지 막힘 없이 갔는가
- 번들 크기(wasm 포함)가 설치 체감을 해쳤는가
- release.yml을 사람이 읽고 "latest로 갈 길이 없다"를 확신할 수 있는가
