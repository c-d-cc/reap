---
id: bk-90be10
slug: setup-two-hosts
type: enhancement
title: setup이 두 호스트를 건다 — codex 감지·설치·훅 등록과 setup --remove
from: flux-0005-design
createdAt: 2026-09-20T04:43:29Z
status: consumed
consumedBy: gen-0121-exec
---

`flux-0005-design`이 정한 것을 실행한다. 무엇이 참이어야 하는지는 `ps-4f2a91`의 `08-delivery.md`에 있고 여기 옮겨 적지 않는다 — **이 항목은 할 일의 목록이다.**

## 해야 할 것

**`setup`이 있는 호스트를 전부 건다.** 지금은 `claude --version`으로 하나만 감지한다. `codex --version`을 같은 자리에 더하고, 둘 다 있으면 둘 다, 하나면 그것만 건다. 명령이 갈리는 곳은 두 군데뿐이다 — 설치가 `claude plugin install <p> -y` 대 `codex plugin add <p>`, 마켓플레이스 등록은 `marketplace add <source>`로 이름이 같다. 재실행 안전은 지금 구조 그대로 유지한다(이미 있으면 아무것도 안 한다).

**codex에서는 훅을 `~/.codex/hooks.json`에 등록한다.** codex는 플러그인 훅을 실행하지 않는다. 그 파일에는 남의 항목이 함께 사므로 **통째로 쓰지 않고 REAP 항목만 넣고 뺀다** — 나중에 알아볼 수 있는 표식이 필요하다. 훅이 부를 스크립트는 설치된 플러그인 안의 `session-start.sh` 한 벌이고, 출력 계약은 두 호스트가 같다.

**`setup --remove`를 만든다.** `setup`이 건 것을 되돌린다 — 플러그인과, 있다면 훅 항목까지. `setup`이 넣지 않은 것은 건드리지 않는다(`invariants.md`).

**`orchestrate` skill이 자기가 Claude Code를 요구한다고 본문에서 말한다.** `claude agents`·`SendMessage`가 codex에 없다. 흉내 내지 않는다.

**사용자 문자열은 카탈로그를 거친다**(en 기본·ko). 새로 생기는 줄이 여럿이다 — 감지 결과, 호스트별 설치 결과, `--remove` 결과.

## 검증해야 할 동작

- **codex가 `c-d-cc/plugins`를 Git 마켓플레이스로 받을 때 submodule까지 가져오는가.** 로컬 경로로만 확인됐다(flux-0005). 안 가져오면 codex 설치가 빈 디렉토리를 가리킨다 — 발견되면 `08-delivery.md`의 "구현 중 검증할 것"에서 그 줄을 내리고 답을 본문에 반영한다
- `setup` → `setup --remove` → `setup` 왕복 뒤 `~/.codex/hooks.json`이 처음과 같은가 (남의 항목 포함)
- codex만 있는 환경, claude만 있는 환경, 둘 다인 환경에서 각각 무엇을 말하는가
- 훅 항목이 이미 있는데 `setup`을 다시 부르면 중복이 생기지 않는가

## 하지 않는 것

- 어댑터 계층. 호스트 차이는 `setup`과 skill 본문 한 줄에 갇힌다
- codex용 마켓플레이스 사본. 하나를 두 호스트가 읽는다
- `plugin_hooks`가 되살아날 것을 전제한 대비 코드
