# Learning

## Project Overview

REAP v0.17.5. 이번 세대가 다루는 것은 **배포 경로 하나**다 — npm 이 전역 설치의 lifecycle script 를
기본 차단하면서, REAP 의 사용자 레벨 통합 전체가 설치되지 않는다.

REAP 의 사용자 레벨 자산은 넷이다:

| 자산 | 위치 (claude-code) | 위치 (opencode) | 없으면 |
|---|---|---|---|
| slash command 19개 | `~/.claude/commands/reap.*.md` | `~/.config/opencode/commands/reap.*.md` | `/reap.*` 자체가 없다 |
| agent 정의 2개 | `~/.claude/agents/reap-*.md` | `~/.config/opencode/agent/reap-*.md` | `reap-evolve` / `reap-evaluate` 소환 불가 |
| `reap-guide.md` | `~/.reap/reap-guide.md` | 동일 | CLAUDE.md 의 `@` import 가 빈 곳을 가리킨다 |
| SessionStart hook | `~/.claude/settings.json` | (plugin 이 대신) | dynamic context 미주입 |

이 넷을 놓는 코드는 존재하고 정상이다. **그것을 부르는 경로가 `postinstall` 하나뿐**인 것이 결함이다.

## Key Findings

### 1. 결함 재현 — [실행]

오늘 빌드한 0.17.5 tarball 을 격리 HOME/prefix 에 두 번 설치해 비교했다.
차단 조건은 `--ignore-scripts` 로 **명시 강제**했다 — npm 12 의 기본 동작과 같은 결과이고,
러너의 npm 버전에 의존하지 않는다.

```
== A: 정상 설치 ==
  ~/.reap:            reap-guide.md
  ~/.claude/commands: 19 files
  ~/.claude/agents:   2 files
  settings.json:      yes

== B: install script 차단 ==
  ~/.reap:            (비어 있음)
  ~/.claude/commands: 0 files
  ~/.claude/agents:   0 files
  settings.json:      no
  binary works:       0.17.5+dev.0a8ae9a      ← 바이너리는 멀쩡하다
```

명령: `npm i -g [--ignore-scripts] --prefix "$P" "$PWD/$TB"` (HOME 격리).

**바이너리는 동작하고 통합만 없다.** 오류도, 경고도 없다.

### 2. 사용자가 빠져나갈 문이 없다 — [실행]

차단 설치 상태에서 `reap init` 을 돌렸다.

```
init ok
  after init — ~/.claude/commands: 0 files      ← init 은 사용자 레벨을 건드리지 않는다
  after init — ~/.reap:            0 files
  CLAUDE.md refs reap-guide:       2            ← 없는 파일을 두 번 가리킨다
  that file exists:                NO
```

README 의 Quick Start 는 **`/reap.init`** 이다 — 없는 그 slash command 다.
사용자에게 남는 것은 `reap` 바이너리 하나뿐이며, 그 어떤 CLI 명령도 상태를 고치지 않는다.

### 3. REAP 이 못 하는 일을 시킨다 — [실행]

같은 상태에서 `reap fix --check`:

```
errors: ["reap-guide.md missing — run 'npm install -g @c-d-cc/reap' to reinstall"]
```

**그 재설치가 바로 차단되는 동작이다.** 지시를 따르면 같은 자리로 돌아온다.
gen-086 의 `gitPush` 문구와 같은 형태 — 원인을 모르는 쪽이 추측을 진단처럼 말한다.
(`reap fix` 는 실제로 guide 를 복원한다. 틀린 것은 `--check` 의 문구뿐이다.)

### 4. 부르는 곳은 정확히 한 곳 — [독해]

`grep -rn "installSkills\|registerSessionIntegration\|installAgents\|installReapGuide\|registerSessionHooks" src/ scripts/`

| 진입점 | 사용자 레벨 자산을 놓는가 |
|---|---|
| `scripts/postinstall.sh` | **전부** (`install-skills` + `check-version`) |
| `reap install-skills` | 전부 — 그러나 사용자가 존재를 알아야 한다 |
| `reap update` → `registerSessionIntegration` | slash + agents + hooks. **`reap-guide.md` 는 빠져 있다** |
| `reap init` / `--repair` | **없음** (`init/common.ts:94` 에 "install-skills 가 한다"는 주석만) |
| 그 외 모든 명령 | 없음 |

`reap update` 가 guide 를 빼는 것은 의도된 주석("postinstall 과 install-skills 의 몫")이나,
postinstall 이 안 돈다는 전제에서는 그 분담이 성립하지 않는다.

### 5. 기존 패턴 — 세 번째 caller 가 아니라 단일 소유자로

양 adapter 는 이미 gen-064/066 의 교훈대로 silent helper 를 뽑아 두 caller
(`installSkills` / `registerSessionIntegration`)가 공유한다. 여기에 세 번째 caller 를
덧붙이면 gen-064 가 고친 형태가 재발한다 — **"사용자 레벨 자산 일습"을 소유하는 함수 하나**를
만들고 기존 둘이 그것을 부르게 하는 것이 같은 교훈의 연장이다.

### 6. 테스트 격리 — 확인한 제약

`tests/helpers/setup.ts` 의 `cli()` 는 **HOME 을 격리하지 않는다**. 따라서 매 CLI 호출마다
무조건 자산을 다시 놓는 설계는 테스트 실행이 개발자의 실제 `~/.claude/` 를 수백 번 덮어쓴다.
사용자 레벨을 다루는 e2e (`install-agents.test.ts`, `opencode-install.test.ts`) 는
`cliWithHome` 으로 이미 격리하고 있으므로, **재동기화 여부를 값싸게 판정하는 장치**가 필요하다.

## Backlog

pending 6건 — **전부 0.18 트랙**(plugin 전환 · interview skill · milestone · idea · plan · `/reap.plan`).
이번 goal 과 인과 관계가 없어 `--no-backlog` 로 시작했다. 신설도 하지 않는다(유저 지시).

## Context

### 이번 세대가 아닌 것

- 릴리즈: `package.json` 0.17.5 **무변경**. 태그·push·publish 없음
- 무엇을 설치할지: 바꾸지 않는다. **언제·어디서 트리거되는가**만 바꾼다
- 문서 안내 추가: genome 이 금한다 — 반복 누락은 지시가 아니라 검사로 막는다

### 설계 제약 (goal + genome 에서 도출)

1. 사용자가 이상을 **몰라도** 고쳐져야 한다 → 항상 지나는 진입점이어야 한다
2. 멱등 + cleanup-then-copy — 기존 `installSkills` 계약 유지
3. 새 자산 없음, 새 caller 난립 없음 → 단일 소유자
4. 검사는 npm 12 조건을 **재현**해야 한다 (`--ignore-scripts` 명시 강제, npm 버전 비의존)
5. 소스 diff ~6 파일 이내

### Clarity Level

**HIGH.** 결함이 실측됐고, 원인 지점이 단일하며, 범위가 goal 에 명시적으로 고정돼 있다.
남은 판단은 "어느 진입점에 매달 것인가" 하나이며 planning 에서 트레이드오프로 정리한다.
