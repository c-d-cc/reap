---
name: reapdev.localInstall
description: Use when this reap working tree must become the reap that actually runs on this machine - right after a clone, or after editing src/ or plugin/ while the running binary and the installed plugin still hold the old files. Trigger on "localInstall", "localUpdate", "로컬 설치", "로컬 반영", "클론했는데 설치", "빌드하고 설치", "이 리포로 reap 쓰기", or on a fresh clone with no reap on PATH.
---

# localInstall — 작업 트리를 이 머신의 reap로

REAP를 만드는 사람만 쓴다. 사용자에게 배포되는 것이 아니라 **이 리포의 개발용 도구**다.

## 한 명령이다

```bash
bash scripts/local-install.sh
```

**처음 설치와 변경 반영이 같은 명령이다.** 재실행 안전하므로 클론 직후에도, `git pull` 뒤에도, 소스를 고친 뒤에도 이것만 친다.

하는 일: `bun install` → `bun run build`·`build:node` → `npm link`(전역 `reap` → 이 트리의 `dist/node/reap.js`) → `~/.claude/dev-marketplaces/reap-dev`에 `./plugin` 심링크와 marketplace.json → 있는 호스트마다 마켓플레이스 등록과 플러그인 **재설치** → 끝에 `reap --version`과 플러그인 캐시 = 작업 트리를 확인한다.

## 왜 매번 필요한가

REAP는 따로 설치되고 따로 낡는 표면이 **둘**이다.

| 표면 | 실제로 도는 것 | 리포를 고쳐도 |
|---|---|---|
| 바이너리 | `dist/reap` · `dist/node/reap.js` | 안 바뀐다 — 빌드해야 한다 |
| 플러그인 | `~/.claude/plugins/cache/reap-dev/reap/<version>/` | 안 바뀐다 — 재설치해야 한다 |

둘 다 **조용히** 낡는다. 경고가 없다. 특히 `tests/hook.test.sh`는 `dist/reap`를 복사해 쓰므로, 빌드를 빠뜨리면 **옛 바이너리를 검사하고 초록불을 낸다.**

**커밋하지 않아도 된다.** 설치는 git HEAD가 아니라 **작업 트리**를 복사한다.

## 전제

- Bun, Node 20+, 호스트 CLI(`claude` 또는 `codex`)가 있어야 한다. 없으면 스크립트가 무엇이 없는지 말하고 멈춘다
- `tests/` submodule은 private(reap-test)이라 `--recurse-submodules` 없이 클론해도 된다. 빌드에 필요 없다
- 정식 배포본(`npm i -g @c-d-cc/reap` + `reap setup`)과 같은 머신에 두지 않는다 — PATH의 `reap`가 어느 것인지 스크립트가 경고한다

## 플러그인 없이 CLI만

```bash
bash scripts/local-install.sh --no-plugin
claude --plugin-dir ./plugin      # 세션 한 번만 플러그인을 얹을 때
```

## 왜 재설치인가 — 더 짧은 길은 없다

probe로 확인한 것이다. 다음에 이 절차를 줄이려는 사람이 같은 실험을 다시 하지 않도록 적어둔다.

- **`claude plugin update <plugin>`** — 버전을 본다. `plugin.json`의 `version`이 그대로면 `이미 최신 버전입니다`라며 **파일을 건드리지 않는다.**
- **`claude plugin marketplace update <marketplace>`** — 마켓플레이스 메타데이터만 갱신한다. 플러그인 파일을 복사하지 않는다.
- **`claude plugin install --force`** — 그런 옵션이 없다.

버전을 올리지 않고 파일을 반영하는 경로는 `uninstall` → `install`뿐이다.

## 두 마켓플레이스를 구별한다

**배포는 `ctod-plugins`, 개발은 `reap-dev`다.**

| | `ctod-plugins` | `reap-dev` |
|---|---|---|
| 어디 | `~/cdws/ctod-plugins` (`c-d-cc/plugins`) | `~/.claude/dev-marketplaces/reap-dev` |
| 무엇을 싣나 | **릴리스된 것** | **작업 트리** (심링크) |
| 언제 쓰나 | 남이 설치할 때 · 배포 확인 | 개발 루프 |

**개발 중에는 `reap-dev`만 쓴다.**

`source`는 **마켓플레이스 디렉토리 안쪽만** 가리킬 수 있다 — 절대경로도 `../`도 거부당한다(둘 다 시도해 `source: Invalid input`). 그래서 `reap-dev` 안에 작업 트리로 가는 **심링크**를 두고 `source: "./plugin"`으로 가리킨다.

## 반영됐는지 확인한다

스크립트가 끝에 확인하지만, 의심스러우면 직접 돌린다. **말로 때우지 않는다.**

```bash
# 1) 바이너리·번들이 src보다 새것인가 — 둘 다 0이어야 한다
find src -type f -newer dist/reap | wc -l
find src -type f -newer dist/node/reap.js | wc -l

# 2) PATH의 reap가 이 리포인가
readlink -f "$(command -v reap)"

# 3) 캐시본이 리포와 같은가 — 차이가 없어야 한다
V=$(node -p 'require("./plugin/.claude-plugin/plugin.json").version')
diff -r plugin ~/.claude/plugins/cache/reap-dev/reap/"$V"
```

## 그리고 세션을 다시 열어야 한다

**훅과 skill은 세션이 시작될 때 읽힌다.** 재설치해도 지금 세션에는 반영되지 않는다. 바이너리는 매번 새로 실행되므로 즉시 반영된다.

그러므로 반영 후에는 사람에게 **세션을 다시 열라고 말한다.** 열지 않은 채로 "반영됐다"고 하는 것은 거짓이다. Codex 앱은 새 대화가 아니라 **앱 자체를 다시 띄워야** 훅 목록을 새로 읽는다.

## 막히면

- `npm link`가 권한으로 실패 → npm prefix를 홈으로(`npm config set prefix ~/.npm-global`, PATH 추가) 하거나 `sudo npm link`
- `warning: 'reap' on PATH is …` → 다른 reap(배포본이나 옛 리포)가 PATH에서 앞선다. 그것을 지우거나 PATH 순서를 바꾼다. **훅은 PATH의 `reap`를 부른다**
- 세션에 REAP 맥락이 안 들어온다 → 플러그인이 아니라 **PATH를 먼저 의심한다.** `command -v reap`. 훅은 `reap`가 없으면 조용히 `exit 0` 한다 (`plugin/hooks/session-start.sh`)
- 플러그인 캐시가 작업 트리와 다르다 → 스크립트를 다시 돌린다. 그래도 다르면 `claude plugin uninstall reap@reap-dev && claude plugin install reap@reap-dev -y`
- **배포본을 확인하려면** `ctod-plugins`에서 플러그인 파일을 옮기고 `python3 tools/validate_marketplace.py`를 돌린다
