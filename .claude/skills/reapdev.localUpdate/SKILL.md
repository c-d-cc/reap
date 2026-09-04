---
name: reapdev.localUpdate
description: Use when developing REAP itself and local changes must reach the running environment - rebuilds the reap binary and reinstalls the plugin from the working tree. Trigger on "로컬 반영", "localUpdate", "빌드하고 설치", or after editing src/ or plugin/ in the reap repo.
---

# localUpdate — 리포의 변경을 로컬 환경에 반영한다

REAP를 만드는 사람만 쓴다. 사용자에게 배포되는 것이 아니라 **이 리포의 개발용 도구**다.

## 왜 필요한가

REAP는 따로 설치되고 따로 낡는 표면이 **둘**이다.

| 표면 | 실제로 도는 것 | 리포를 고쳐도 |
|---|---|---|
| 바이너리 | `dist/reap` | 안 바뀐다 — `bun run build` 해야 한다 |
| 플러그인 | `~/.claude/plugins/cache/reap-dev/reap/<version>/` | 안 바뀐다 — 재설치해야 한다 |

둘 다 **조용히** 낡는다. 경고가 없다. 특히 `tests/hook.test.sh`는 `dist/reap`를 복사해 쓰므로, 빌드를 빠뜨리면 **옛 바이너리를 검사하고 초록불을 낸다.**

## 절차

리포 루트에서:

```bash
cd "$(git rev-parse --show-toplevel)"
bun run build          # dist/reap — 컴파일 바이너리 (tests/hook.test.sh가 쓴다)
bun run build:node     # dist/node/reap.js — 사용자가 npm으로 받는 것과 같은 번들
claude plugin marketplace update reap-dev
claude plugin uninstall reap@reap-dev
claude plugin install reap@reap-dev -y
```

**처음 한 번은 `npm link`** — `package.json`의 `bin`(`dist/node/reap.js`)을 npm 전역 bin에 심링크한다. 그 뒤로는 `build:node`만 하면 PATH의 `reap`가 곧 이 작업 트리다. PATH 편집이 필요 없고 새 셸에서도 잡힌다. 사용자 설치와 같은 산출물로 개발한다.

```bash
npm link                      # 한 번. 풀 때는 npm unlink -g @c-d-cc/reap
readlink -f "$(command -v reap)"   # 이 리포의 dist/node/reap.js 여야 한다
```

**PATH에 다른 `reap`가 앞서 있으면 그것이 이긴다.** `command -v reap`가 이 리포 밖을 가리키면 그 항목을 PATH에서 빼야 한다 — 훅은 PATH의 `reap`를 부른다.

**커밋하지 않아도 된다.** 설치는 git HEAD가 아니라 **작업 트리**를 복사한다. `installed_plugins.json`의 `gitCommitSha`는 기록일 뿐 복사 기준이 아니다.

## 두 마켓플레이스를 구별한다

**배포는 `ctod-plugins`, 개발은 `reap-dev`다.**

| | `ctod-plugins` | `reap-dev` |
|---|---|---|
| 어디 | `~/cdws/ctod-plugins` (`c-d-cc/plugins`) | `~/.claude/dev-marketplaces/reap-dev` |
| 무엇을 싣나 | **push된 커밋** (submodule `plugins/reap`) | **작업 트리** (심링크) |
| 언제 쓰나 | 남이 설치할 때 · 배포 확인 | 개발 루프 |

**개발 중에는 `reap-dev`만 쓴다.** `ctod-plugins`는 submodule이라 push하고 포인터를 옮기기 전까지 옛 커밋을 가리키고, 그것이 정상이다.

`source`는 **마켓플레이스 디렉토리 안쪽만** 가리킬 수 있다 — 절대경로도 `../`도 거부당한다(둘 다 시도해 `source: Invalid input`). 그래서 `reap-dev` 안에 작업 트리로 가는 **심링크**를 두고 `source: "./plugin"`으로 가리킨다.

## 왜 재설치인가 — 더 짧은 길은 없다

probe로 확인한 것이다. 다음에 이 절차를 줄이려는 사람이 같은 실험을 다시 하지 않도록 적어둔다.

- **`claude plugin update <plugin>`** — 버전을 본다. `plugin.json`의 `version`이 그대로면 `이미 최신 버전입니다`라며 **파일을 건드리지 않는다.**
- **`claude plugin marketplace update <marketplace>`** — 마켓플레이스 메타데이터만 갱신한다. 플러그인 파일을 복사하지 않는다.
- **`claude plugin install --force`** — 그런 옵션이 없다.

버전을 올리지 않고 파일을 반영하는 경로는 `uninstall` → `install`뿐이다. 버전을 올리는 쪽도 되지만, 반영할 때마다 `plugin.json`과 `marketplace.json`을 함께 올려야 하므로 개발 루프에는 맞지 않는다.

## 반영됐는지 확인한다

```bash
# 1) 바이너리·번들이 src보다 새것인가 — 둘 다 0이어야 한다
find src -type f -newer dist/reap | wc -l
find src -type f -newer dist/node/reap.js | wc -l

# 1') PATH의 reap가 이 리포인가
readlink -f "$(command -v reap)"
reap --version

# 2) 캐시본이 리포와 같은가 — 차이가 없어야 한다
V=$(python3 -c 'import json;print(json.load(open("plugin/.claude-plugin/plugin.json"))["version"])')
diff -r plugin ~/.claude/plugins/cache/reap-dev/reap/"$V"
```

둘 다 통과하면 반영된 것이다. **말로 때우지 말고 실제로 돌린다.**

## 그리고 세션을 다시 열어야 한다

**훅과 skill은 세션이 시작될 때 읽힌다.** 재설치해도 지금 세션에는 반영되지 않는다. 바이너리는 매번 새로 실행되므로 즉시 반영된다.

그러므로 반영 후에는 사람에게 **세션을 다시 열라고 말한다.** 열지 않은 채로 "반영됐다"고 하는 것은 거짓이다.

## 막히면

- `claude plugin list`에 `reap@reap-dev`가 없다 → 개발 마켓플레이스가 등록돼 있지 않다. 아래 `개발 마켓플레이스를 잃었다면`을 본다
- **개발 마켓플레이스를 잃었다면** (새 머신, 설정 초기화) 다시 만든다:

  ```bash
  D=~/.claude/dev-marketplaces/reap-dev
  mkdir -p "$D/.claude-plugin"
  ln -sfn "$(git rev-parse --show-toplevel)/plugin" "$D/plugin"
  cat > "$D/.claude-plugin/marketplace.json" <<'JSON'
  { "name": "reap-dev",
    "description": "REAP 개발용 로컬 마켓플레이스 — 작업 트리를 직접 가리킨다",
    "owner": { "name": "HyeonIL Choi" },
    "plugins": [{ "name": "reap", "description": "REAP (개발 중인 작업 트리)", "source": "./plugin" }] }
  JSON
  claude plugin marketplace add "$D"
  ```

- **배포본을 확인하려면** `ctod-plugins`에서 submodule 포인터를 옮긴다:

  ```bash
  cd ~/cdws/ctod-plugins
  git -C plugins/reap pull origin main
  python3 tools/validate_marketplace.py
  git add plugins/reap && git commit -m "chore: bump reap"
  ```

- 세션에 REAP 맥락이 안 들어온다 → 플러그인이 아니라 **PATH를 먼저 의심한다.** `command -v reap`. 훅은 `reap`가 없으면 조용히 `exit 0` 한다 (`plugin/hooks/session-start.sh`)
