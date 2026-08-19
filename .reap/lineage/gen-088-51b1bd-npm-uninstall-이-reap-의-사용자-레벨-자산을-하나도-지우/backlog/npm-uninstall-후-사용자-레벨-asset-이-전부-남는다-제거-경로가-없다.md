---
type: task
status: consumed
priority: high
createdAt: 2026-08-19T14:22:34.570Z
consumedBy: gen-088-51b1bd
consumedAt: 2026-08-19T21:39:16.772Z
---

# npm uninstall 후 사용자 레벨 asset 이 전부 남는다 — 제거 경로가 없다

## Problem

`npm uninstall -g @c-d-cc/reap` 는 REAP 가 사용자 홈에 쓴 것을 **하나도 지우지 않는다.**

근거 둘:
- `package.json` 의 `scripts` 에 `preuninstall` / `postuninstall` 이 없다. 그리고 **넣어도 소용이 없다 — npm 이 그 훅을 실행하지 않는다**(아래 § 측정 결과). 제거 시점에 REAP 코드가 실행될 기회 자체가 없다.
- 홈의 파일들은 npm 이 만든 것이 아니라 postinstall 이 실행한 REAP 코드(`syncUserLevelAssets`)가 쓴 것이다. npm 은 그 존재를 모르고, `<prefix>/lib/node_modules/@c-d-cc/reap` 와 bin 심볼릭 링크만 지운다.

남는 것 전수 (claude-code):

| 위치 | 내용 | 소유 코드 |
|---|---|---|
| `~/.claude/commands/reap.*.md` | slash command 19개 | `installSlashCommandsOnly` |
| `~/.claude/agents/reap-*.md` | `reap-evolve`, `reap-evaluate` | `installAgents` |
| `~/.claude/settings.json` | SessionStart hook 2개 (`reap check-version`, `reap load-context`) | `registerSessionHooks` |
| `~/.reap/reap-guide.md` | 가이드 | `installReapGuide` |
| `~/.reap/.install-stamp` | 클라이언트별 설치 버전 스탬프 | gen-087 |

opencode 는 여기에 `~/.config/opencode/commands/reap.*.md` + `~/.config/opencode/agent/reap-*.md` 가 더해진다 (`XDG_CONFIG_HOME` 설정 시 그쪽).

**해로움의 순위가 다르다.** 파일 잔여물은 쓰레기일 뿐이지만 `settings.json` 의 hook 엔트리는 **REAP 가 사라진 뒤에도 매 세션 없는 명령을 부른다.** 현재 `2>/dev/null || true` 로 감싸여 있어 세션이 깨지지는 않으나, 사용자가 JSON 을 손으로 편집하기 전까지 영구히 남는다. 사용자는 자기가 지운 도구의 흔적이 자기 설정 파일 안에 남아 있다는 것을 알 방법이 없다.

`reap destroy` 는 이 문제를 풀지 않는다 — **프로젝트 레벨만** 정리한다(`.reap/`, CLAUDE.md 의 REAP 절, `.gitignore` 항목). 사용자 레벨은 손대지 않고, 애초에 uninstall 이후에는 `reap` 바이너리가 없어 실행할 수도 없다. **순서 문제까지 있다.**

이것은 gen-087 의 대칭 결함이다. gen-087 은 "설치가 postinstall 훅 하나에만 걸려 있다"를 고쳤다. 제거는 그보다 나쁘다 — **걸 수 있는 훅 자체가 없다.**

### daemon 도 남는다 — 그리고 이것은 데이터다

`@c-d-cc/reap-daemon` 은 별도 패키지지만 **REAP 를 쓰려고 깔았다는 것 외의 용도가 없다.** daemon 단독 사용자는 존재하지 않는다. 남는 것:

- `~/.reap/daemon/registry.json` — 등록된 프로젝트 경로 목록
- `~/.reap/daemon/indexes/` — 프로젝트별 SQLite 심볼 그래프. **가장 큰 잔여물이며 사용자 소스 코드의 구조 정보를 담는다**
- `~/.reap/daemon/daemon.pid`
- 전역 패키지 `@c-d-cc/reap-daemon` 자체

**실행 중인 프로세스가 있다.** daemon 은 유휴 30분간 상주하므로, 파일부터 지우면 살아 있는 프로세스가 그 자리에 다시 쓴다. 반드시 stop 이 먼저다.

## 측정 결과 — npm 훅으로는 불가능하다 (2026-08-19 실측)

최소 probe 패키지(`pre/postinstall` + `pre/postuninstall` 이 각각 마커를 남김)를 격리 prefix 에 설치·제거해 측정했다.

| npm | install 훅 | uninstall 훅 (pre/post) |
|---|---|---|
| 10.9.4 전역 | 실행됨 | **실행 안 됨** |
| 10.9.4 로컬 | 실행됨 | **실행 안 됨** |
| 12.0.2 전역 | **차단됨** (allowScripts 미포함 경고) | **실행 안 됨** |

**부재가 스스로 증명된다** — 같은 `probe.js` 가 install 단계에서는 마커를 남겼다. 스크립트도 경로도 정상이고 uninstall 단계에서만 호출되지 않는다. npm 은 `preuninstall`/`postuninstall` 을 문서에 남겨두고 있으나 arborist 이후 실행하지 않는다.

**따라서 `scripts/postuninstall.sh` 는 만들지 않는다.** 앞선 초안의 (b) 안은 이 측정으로 폐기됐다.

**별개 관측 (미해결)**: npm 12 가 경고에서 안내한 `--allow-scripts=reap-uninstall-probe` 를 그대로 주었는데도 install 훅이 실행되지 않았다. node 22.22.0 미지원 경고가 함께 떴으므로 측정 환경 탓일 수 있다. **gen-087 이 사용자 우회로를 문서에 적는다면 그 문법을 지원 node 버전에서 따로 검증해야 한다.**

## Solution

npm 이 제거 시점에 코드를 실행해주지 않으므로, **실행 주체를 REAP 쪽으로 가져온다.** 사용자가 치는 명령은 하나다.

### (a) `reap uninstall` — npm 제거까지 자기가 수행한다

순서가 중요하다. 각 단계는 앞 단계가 끝나야 의미가 있다:

1. **`ensureUserLevelAssets` 를 건너뛴다** — 아래 gen-087 절 참조. 이걸 안 하면 지우기 직전에 자기가 설치한다
2. **daemon stop** — 상주 프로세스가 살아 있으면 지운 파일을 다시 쓴다
3. **홈 자산 제거** — slash commands / agents / `settings.json` hook 엔트리 / `~/.reap/reap-guide.md` / `.install-stamp` / `~/.reap/daemon/`
4. **`npm uninstall -g @c-d-cc/reap-daemon @c-d-cc/reap`** — reap 이 자기를 지운다

4단계는 자기 자신을 지우지만 unix 에서는 동작한다 — node 가 번들을 이미 읽었고 npm 이 지우는 것은 실행 중인 인터프리터가 아니다. **Windows 는 파일 잠금으로 실패할 수 있다.** 실패해도 안전하다: 3단계까지 끝났으므로 남는 것은 패키지뿐이고, 출력이 사용자에게 명령을 그대로 건네면 된다. **npm 호출 실패를 전체 실패로 만들지 말 것.**

설계 판단이 필요한 지점:

- **어느 prefix 인가.** `import.meta.url` 로 자기 위치를 알 수 있다. 전역/로컬/`npx` 임시 설치를 구분해야 하고, 판단이 서지 않으면 **실행하지 말고 명령만 안내한다** — 사용자의 다른 설치를 지우는 것보다 안 지우는 쪽이 낫다
- **`daemonBin` 이 소스 체크아웃을 가리키는 경우 그 체크아웃은 절대 건드리지 않는다.** npm 이 관리하지 않는 사용자 작업 트리다. `DaemonAvailability.source` 가 `checkout` 이면 npm 제거 대상에서 뺀다 — gen-084 가 같은 구분을 `staleDaemonRemedy` 에서 이미 하고 있다
- **prefix-anchored 제거만 한다.** `reap.*` / `reap-*` 만. 사용자 파일과 `reapdev.*` 는 보존 — `syncUserLevelAssets` 의 기존 규칙과 동일
- **`settings.json` 은 REAP 엔트리만 골라 뺀다.** 파일을 지우거나 통째로 덮어쓰지 않는다
- **2-phase (확인 → `--confirm`)**. 사용자 홈과 전역 패키지를 건드리므로 `destroy` 보다 확인이 더 필요하다. 무엇을 지울지 목록을 먼저 보여준다
- **agentClient 를 못 읽는 경우** — 프로젝트 밖에서 실행될 수 있고, 클라이언트를 오간 이력이 있으면 한쪽만 지우면 나머지가 남는다. **양쪽 adapter 를 모두 정리하는 편이 맞다** (없으면 no-op 이므로 손해가 없다)

### (b) 이미 지워버린 사용자의 회수 경로 — `npx`

**오늘까지의 모든 사용자가 여기 해당한다.** 그들에게는 `reap` 이 없다.

```
npx @c-d-cc/reap uninstall
```

npx 는 패키지를 임시로 받아 실행하므로 바이너리 없이도 정리가 가능하다. **단 (a)의 1단계가 여기서 결정적이다** — `ensureUserLevelAssets` 를 건너뛰지 않으면 npx 실행이 자산을 새로 깔고 나서 지우는 꼴이 되고, 최악의 경우 스탬프만 남긴 채 끝난다. **e2e 로 이 경로를 직접 재현할 것.**

### (c) 발견성 — 있는 줄 모르면 없는 것과 같다

README 5개 언어 + `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts`. 그리고 문서 밖에도 둔다:

- `reap --help` 에 노출
- `reap destroy`(프로젝트 제거) 출력이 "REAP 자체를 지우려면 `reap uninstall`" 로 이어지게 한다 — 프로젝트를 지우는 사람이 다음으로 할 일이다

### 기각한 대안 — 근거를 남긴다

- **`postuninstall` 훅**: 위 측정으로 불가능. npm 이 실행하지 않는다
- **자산을 symlink 로 두고 실체를 패키지에 둔다**: npm 이 패키지를 지우면 실체가 사라지지만 **dangling symlink 가 남고**, 클라이언트가 그것을 읽다 오류를 낼 수 있다. `settings.json` 엔트리와 `~/.reap/` 는 여전히 남으므로 문제의 절반도 못 푼다. 이득 대비 위험이 크다
- **hook 에 자가 정리 셸을 심는다**(`command -v reap || rm ...`): 사용자 설정 파일 안에 REAP 이 심어둔 `rm` 이 상주하게 된다. hook 엔트리 자신은 자기를 못 지우므로 JSON 은 결국 남고, gen-087 의 자동 설치와도 충돌한다(스크립트가 다시 깔린다). 기각

## gen-087 과의 상호작용 — 제거 직후 재설치된다

gen-087 이 `ensureUserLevelAssets` 를 **모든 명령 진입 앞**에 두었다. `reap uninstall` 도 그 경로를 지나므로 **자기가 지우기 직전에 자기가 설치한다.** 이것은 gen-087 의 결함이 아니라 의도된 동작이며, 제거 명령이 그 위에서 설계돼야 한다:

- `uninstall` 만은 진입 훅을 건너뛰는 예외 목록에 넣는다
- 그러고도 **`reap uninstall` 은 npm 제거 전에 유효하다.** (a)가 npm 제거까지 하므로 순서 문제는 사라진다 — 사용자가 순서를 기억할 필요가 없게 만드는 것이 이 설계의 요점이다

## Files to Change

- `src/cli/commands/uninstall.ts` (신설)
- `src/cli/index.ts` — 명령 라우팅 + **`ensureUserLevelAssets` 예외 처리**
- `src/adapters/types.ts` — `AdapterModule` 에 제거 계약 (`removeUserLevelAssets(home?)`)
- `src/adapters/claude-code/install.ts` — 제거 구현 (`installSlashCommandsOnly` / `installAgents` / `registerSessionHooks` / `installReapGuide` 의 역연산)
- `src/adapters/opencode/install.ts` — 제거 구현 (`XDG_CONFIG_HOME` 경유)
- `src/cli/commands/daemon/` — stop + `~/.reap/daemon/` 제거. `source === "checkout"` 예외
- `src/cli/commands/destroy.ts` — 출력에 `reap uninstall` 안내
- `README*.md` + `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts`
- `tests/e2e/` — 아래 검증

## 검증

- e2e: 격리 `HOME` + `XDG_CONFIG_HOME` 양축(gen-082)에서 `syncUserLevelAssets` → `reap uninstall` → **네 표면 + daemon 데이터 부재**
- **negative**: 사용자 파일(`other-tool.md`)과 `reapdev.*.md`, 사용자의 다른 SessionStart hook 을 심어두고 **살아남는지** 확인. 지워지면 fail
- **부재 단언은 스스로 증명하게 한다**(gen-083): `status: "ok"` 와 개수를 먼저 요구한 뒤에야 부재를 읽는다
- **(b)의 npx 경로를 직접 재현한다** — 자산을 깔고, 스탬프를 지운 상태에서 `uninstall` 을 불러 **재설치가 일어나지 않는지** 확인. 이것이 gen-087 상호작용의 유일한 실증
- **`source === "checkout"` 인 daemon 이 살아남는지** 확인. npm 제거 호출은 seam 을 두어 주입 가능하게 하고, 실제 npm 을 부르지 않고 **어떤 인자로 부르려 했는지**를 단언한다
- npm 제거 실패가 **전체 실패로 번지지 않는지** — 실패를 주입하고 앞 단계 결과가 보존되는지 확인
