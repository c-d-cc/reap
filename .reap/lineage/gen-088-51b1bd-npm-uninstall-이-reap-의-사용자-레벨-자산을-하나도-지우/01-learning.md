# Learning

## Project Overview

REAP(`@c-d-cc/reap` v0.17.5)는 자기참조적으로 자신을 진화시키는 CLI 파이프라인이다. 이번 세대의 대상은
**설치의 대칭인 제거 경로**다. gen-087 이 "설치가 `postinstall` 훅 하나에만 걸려 있다"를 고쳤고,
그 대칭 결함 — **제거 시점에 REAP 코드가 실행될 기회 자체가 없다** — 이 남았다.

## Source Backlog

`npm-uninstall-후-사용자-레벨-asset-이-전부-남는다-제거-경로가-없다.md` (type: task, priority: high,
consumedBy: gen-088-51b1bd)

요지:

- `npm uninstall -g @c-d-cc/reap` 는 REAP 가 홈에 쓴 것을 하나도 지우지 않는다. npm 이 지우는 것은
  `<prefix>/lib/node_modules/@c-d-cc/reap` 와 bin 심볼릭 링크뿐이고, 홈의 파일은 npm 이 만든 것이 아니라
  postinstall 이 실행한 REAP 코드(`syncUserLevelAssets`)가 쓴 것이다.
- **`postuninstall` 훅은 답이 아니다 — 측정으로 폐기됐다.** 최소 probe 패키지로 npm 10.9.4(전역/로컬)와
  12.0.2(전역)에서 측정한 결과 `preuninstall`/`postuninstall` 이 **한 번도 실행되지 않았다**. 같은
  `probe.js` 가 install 단계에서는 마커를 남겼으므로 **부재가 스스로 증명된다**. 따라서
  `scripts/postuninstall.sh` 는 만들지 않는다.
- 해법은 실행 주체를 REAP 쪽으로 가져오는 것 — `reap uninstall` 이 홈 정리 + daemon 정리 + npm 제거까지
  수행하고, 이미 지워버린 사용자를 위해 `npx @c-d-cc/reap uninstall` 회수 경로를 연다.

backlog 의 미해결 관측 하나: npm 12 가 안내한 `--allow-scripts=<pkg>` 가 probe 에서 동작하지 않았다
(미지원 node 경고 동반). **이번 세대는 그 문법에 의존하지 않는다** — 계획이 그것을 필요로 하지 않으므로
재측정도 하지 않는다. 필요해지면 지원 node 에서 측정해야 한다는 사실만 인계한다.

## Key Findings — 코드 실측

### 1. 지울 대상 전수 (코드에서 확인)

| 위치 | 내용 | 쓰는 코드 |
|---|---|---|
| `~/.claude/commands/reap.*.md` | slash command 19개 | `installSlashCommandsOnly` (`claude-code/install.ts:60`) |
| `~/.claude/agents/reap-*.md` | `reap-evolve`, `reap-evaluate` | `installAgents` (`claude-code/install.ts:167`) |
| `~/.claude/settings.json` | SessionStart hook 2개 | `registerSessionHooks` (`claude-code/install.ts:236`) |
| `~/.reap/reap-guide.md` | 가이드 | `installReapGuide` (양 adapter) |
| `~/.reap/.install-stamp` | client 별 설치 버전 | `installStampPath` (`adapters/index.ts:76`) |
| `<opencodeConfigDir>/commands/reap.*.md` | opencode slash command | `installSlashCommands` (`opencode/install.ts:330`) |
| `<opencodeConfigDir>/agent/reap-*.md` | opencode agent 정의 | `installAgents` (`opencode/install.ts:515`) |
| `~/.reap/daemon/` | `registry.json`, `indexes/`, `daemon.pid` | daemon 패키지 (`daemon/src/paths.ts`) |

`opencodeConfigDir(home, xdgConfigHome)` 는 `XDG_CONFIG_HOME` 이 설정되면 `$XDG_CONFIG_HOME/opencode`
를 쓴다 (`opencode/install.ts:292`, carrier `opencode-config-path`). 제거도 같은 함수를 경유해야 한다.

### 2. `~/.reap/` 를 통째로 지우면 안 된다 — 실측 근거

개발자 머신의 `~/.reap/` 실제 내용:

```
.install-stamp   reap-guide.md   daemon/   reap-portal.2026-02-17.private-key.pem
```

마지막 항목은 **REAP 이 만들지 않은 사용자 파일이며 private key** 다. `rm -rf ~/.reap` 는 명백히 파괴적이다.
제거는 디렉토리 단위가 아니라 **항목 단위(item-anchored)** 여야 하고, 비지 않은 디렉토리는 남긴다.
(이 사실은 backlog 에 없었다 — 코드가 아니라 실제 홈을 봐서 나왔다.)

### 3. gen-087 상호작용 — 지우기 직전에 자기가 설치한다

`src/cli/index.ts:207` 이 `program.parse()` **앞에서** `ensureUserLevelAssets` 를 무조건 호출한다.
명령을 가리지 않는 것이 gen-087 의 의도다("차단된 사용자가 가진 것은 바이너리 하나이므로 부르는 것 자체가
조건이어야 한다"). 따라서 `reap uninstall` 은 그 훅을 **명시적으로 건너뛰어야** 하며, 그렇지 않으면:

- 설치 → 제거 (무해하지만 낭비), 혹은
- npx 경로에서 **설치 → 제거 → 스탬프만 남김** (최악)

`ensureUserLevelAssets` 는 `stamp[adapter.id] === version` 이면 `"current"` 로 조기 반환하므로
(`adapters/index.ts:135`), **스탬프가 없는 상태**(= 갓 npx 로 받은 사람, 혹은 이미 지운 사람)에서만
실제 설치가 일어난다. e2e 는 그 조건 — **자산 있음 + 스탬프 없음** — 을 만들어야 유효하다.

### 4. daemon — 파일보다 프로세스가 먼저다

- `DAEMON_ROOT = ~/.reap/daemon` (`daemon/client.ts:15`), `daemon/src/paths.ts` 와 동일 값.
- daemon 은 유휴 30분 상주하므로 **파일부터 지우면 살아 있는 프로세스가 다시 쓴다.** stop 이 먼저다.
- **함정**: 현재 `daemon stop` 은 `daemonRequest("GET", "/health")` 를 쓰는데
  (`daemon/index.ts:122`), `daemonRequest` 는 첫 줄에서 `ensureDaemon()` 을 부른다
  (`client.ts:134`) → **꺼져 있으면 띄운 다음 죽인다.** uninstall 이 이 경로를 쓰면 지우려는 그 순간에
  daemon 을 기동시킨다. 기동하지 않는 stop 경로가 필요하다.
- `resolveDaemonAvailability().source === "checkout"` 이면 그 경로는 사용자 작업 트리다 —
  npm 제거 대상에서 빼야 한다 (gen-084 가 `staleDaemonRemedy` 에서 이미 같은 구분을 한다).

### 5. npm 제거를 언제 실행해도 되는가

`import.meta.url` 로 자기 패키지 루트를 알 수 있다. 구분이 필요한 상황:

- **전역 설치** — `npm root -g` 와 패키지의 `node_modules` 부모가 일치. 이때만 실제 `npm uninstall -g` 를 부른다.
- **npx 임시 설치** — 경로에 `_npx` 가 있다. npx 캐시를 지우는 것은 의미 없고, 사용자의 전역 설치 여부는
  이 프로세스가 알 수 없다.
- **로컬 `node_modules`** — 프로젝트 의존. 전역 명령을 부르면 남의 설치를 지운다.
- **소스 체크아웃(dev)** — 지금 이 세대가 돌고 있는 상태. npm 이 관리하지 않는다.

backlog 의 지침대로 **판단이 서지 않으면 실행하지 않고 명령만 안내한다.**

### 6. 기존 패턴 (따라야 할 것)

- 2-phase 확인: `destroy.ts:119` (`--confirm` 없으면 `status: "prompt"` 로 `emitOutput` → `process.exit(0)`).
  `emitOutput` 은 항상 종료하므로(`core/output.ts:30`) 흐름 분기가 필요 없다.
- prefix-anchored 제거: `SKILL_PATTERN = /^reap\..+\.md$/`, `AGENT_PATTERN = /^reap-.+\.md$/`.
  `reapdev.*` 는 두 패턴 모두에 걸리지 않는다 (dot 유무가 경계).
- seam 주입: `DaemonResolveDeps` (`client.ts:216`) 가 "가짜 세계를 서술해 실제 설치 없이 결과를 검증"하는
  기존 사례다. npm 호출도 같은 형태의 seam 을 둔다.
- e2e HOME 격리: `cliWithHome` 이 `HOME` 을 바꾸면서 `XDG_CONFIG_HOME` 을 **제거**한다
  (`tests/e2e/user-level-selfheal.test.ts:28`). 두 축을 함께 다뤄야 격리가 성립한다 (gen-082).

### 7. 발견성 표면

- `reap --help` — `src/libs/cli.ts` 가 `program.command(...).description(...)` 에서 자동 생성.
  명령 등록만으로 노출된다.
- `reap destroy` 출력 — 프로젝트를 지우는 사람이 다음으로 할 일이므로 `reap uninstall` 을 가리켜야 한다.
- `README*.md` 5개 + `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` 5개.
  docs 는 `docs/src/pages/CLIPage.tsx` 가 `t.cli.<x>Title/Desc/Note` 3키를 렌더한다 —
  컴포넌트 1곳 + 로케일 5곳이 함께 바뀌어야 한다. `scripts/check-docs-version.sh` 가 로케일 파리티를 검사한다.

## Backlog

이번 세대의 source backlog 는 위에 전재했다. 나머지 pending 6건은 **전부 0.18 별도 브랜치 트랙**
(plugin 전환 · interview skill · milestone · idea · plan · `/reap.plan` skill)이며 본 goal 과 무관하다.
midterm memory 가 "0.18 은 별도 브랜치"로 못박고 있으므로 이번 세대에서 건드리지 않는다.

## Context

- Generation type: **embryo** (genome 자유 수정 가능하나, 팀 리드 지시 + evolution.md 원칙에 따라
  **immutable 로 취급**한다. genome 이슈는 backlog 로 남겨 adapt 에서 처리)
- 기준 baseline: unit 568 / e2e 292 / scenario 44 / daemon 130, 전부 0 fail
- `fix --check`: 0 error / 4 warning (lineage parent ×2, longterm.md 51줄, environment/summary.md ~296줄) — 전부 기존
- 버전 무변경, tag/push/publish 없음
- daemon: 기동 중이며 index 는 이 세대 시작 시 갱신됨

## Clarity Level

**HIGH.**

근거:
- source backlog 이 문제·측정·해법·기각 대안·검증 항목까지 담고 있다. 재도출할 것이 거의 없다.
- 스코프 결정(daemon 포함, checkout 예외, prefix-anchored, settings.json 부분 편집)이 **이미 유저가 내렸다.**
- 따라야 할 기존 패턴(2-phase, prefix 패턴, seam, HOME/XDG 격리)이 코드에 전부 존재한다.

남은 판단은 둘뿐이며 planning 에서 닫는다:
1. npm 제거를 실행할 설치 형태를 어떻게 판정하는가 (§5)
2. `daemon stop` 의 기동 부작용을 이번 세대에서 함께 고칠 것인가 (§4 — 인과로 묶여 있음)
