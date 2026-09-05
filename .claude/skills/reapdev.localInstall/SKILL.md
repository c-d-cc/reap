---
name: reapdev.localInstall
description: Use right after cloning the reap repository on a machine that should run this unpublished working tree - builds the CLI, links it globally, registers the plugin from ./plugin through a dev marketplace, and verifies. Trigger on "localInstall", "로컬 설치", "클론했는데 설치", "이 리포로 reap 쓰기", or on a fresh clone with no reap on PATH.
---

# localInstall — 클론한 작업 트리를 이 머신의 reap로

정식 배포 전에 다른 머신에서 써 볼 때 쓴다. 스크립트 하나가 전부 한다 — 재실행 안전하므로 `git pull` 뒤에도 같은 명령이다.

```bash
bash scripts/local-install.sh
```

하는 일: `bun install` → `bun run build`·`build:node` → `npm link`(전역 `reap` → 이 트리의 `dist/node/reap.js`) → `~/.claude/dev-marketplaces/reap-dev`에 `./plugin` 심링크와 marketplace.json → `claude plugin marketplace add` → `claude plugin install reap@reap-dev`. 끝에 `reap --version`과 플러그인 캐시 = 작업 트리를 확인한다.

## 전제

- Bun, Node 20+, Claude Code CLI(`claude`)가 있어야 한다. 없으면 스크립트가 무엇이 없는지 말하고 멈춘다
- `tests/` submodule은 private(reap-test)이라 `--recurse-submodules` 없이 클론해도 된다. 빌드에 필요 없다
- 정식 배포본(`npm i -g @c-d-cc/reap` + `reap setup`)과 같은 머신에 두지 않는다 — PATH의 `reap`가 어느 것인지 스크립트가 경고한다

## 플러그인 없이 CLI만

```bash
bash scripts/local-install.sh --no-plugin
claude --plugin-dir ./plugin      # 세션 한 번만 플러그인을 얹을 때
```

## 그 뒤

세션을 새로 연다 — skill과 훅은 세션 시작 때 읽힌다. `/` 메뉴에 `/reap:` 여덟, 상태 줄이 보이면 된 것이다. 소스를 고친 뒤 반영은 [localUpdate](../reapdev.localUpdate/SKILL.md).

## 막히면

- `npm link`가 권한으로 실패 → npm prefix를 홈으로(`npm config set prefix ~/.npm-global`, PATH 추가) 하거나 `sudo npm link`
- `warning: 'reap' on PATH is …` → 다른 reap(배포본이나 옛 리포)가 PATH에서 앞선다. 그것을 지우거나 PATH 순서를 바꾼다
- 플러그인 캐시가 작업 트리와 다르다 → `claude plugin uninstall reap@reap-dev && claude plugin install reap@reap-dev -y` 를 직접
