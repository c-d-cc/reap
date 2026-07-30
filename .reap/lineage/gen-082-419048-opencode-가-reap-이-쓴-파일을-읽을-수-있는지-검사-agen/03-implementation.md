# Implementation Log

## Completed Tasks

### T001·T002 `scripts/check-self-diagnosis.sh` — OpenCode 절 추가

기존 스크립트를 확장했다 (151 → 250줄). tarball·prefix 를 재사용하므로 추가 비용은 `install-skills` 1회 + `opencode agent list` 1회다.

흐름: 별도 `OC_HOME`/`OC_PROJECT` → `reap init` → `agentClient: opencode` 로 전환 → `install-skills` → `opencode agent list` 검증.

판정은 **두 가지를 함께** 요구한다:
1. exit 0
2. 출력에 `reap-evolve` **와** `reap-evaluate`

`opencode` 부재 시 amber SKIP + 설치 방법 안내. 검사한 opencode 버전을 출력한다 (로컬/CI 판정이 갈릴 때 근거).

주석에 **"왜 OpenCode 스키마 사본을 두지 않는가"** 를 남겼다 — 사본은 다른 곳에 사는 사실을 한 벌 더 갖는 것이고, #21/#22 가 정확히 그렇게 어긋났다. 클라이언트에게 직접 묻는 것이 요점이다.

### T003 negative test 1 — gen-080 재현

agent 경로의 `toOpenCodeAgent(source)` 를 `source` 로 되돌려 gen-080 이전 동작을 만들었다.

```
FAIL  OpenCode rejects the configuration REAP just wrote
      Error: Configuration is invalid at .../agent/reap-evolve.md
      ↳ Invalid input: expected record, received string tools
```

exit 1. **사용자가 실제로 겪은 오류 문자열과 동일하다.**

### T004 negative test 2 — agent 미설치

`installAgents` 의 확장자 필터를 불가능한 값으로 바꿔 0개 설치를 만들었다.

```
FAIL  OpenCode accepted the config but does not list reap-evolve
```

exit 1. **exit code 만 봤다면 통과했을 케이스다.**

### T005 `.github/workflows/ci.yml` / `release.yml` — opencode 설치

`npm i -g opencode-ai` (bin `opencode`, MIT, deps 없음). 없으면 SKIP 이 되므로 설치해야 CI 에서 실제로 돈다.

**버전 미고정.** 묻는 것이 "현재의 OpenCode 가 받아들이는가"이므로, upstream 스키마 변경으로 red 가 되는 것이 곧 원하는 신호다. 워크플로 주석에 근거를 남겼다.

### T008 `.reap/environment/summary.md`

게이트 표 + "자기진단은 두 클라이언트를 본다" 절 추가. 잡지 못하는 것(slash command 검증 불가, 버전 격차)도 함께 기록.

## Discovered Issues

### gen-080 이 slash command 에도 변환을 적용하고 있었다 — 수정함

`toOpenCodeAgent` 호출부가 **둘**이었다:

| 위치 | 대상 | 판정 |
|---|---|---|
| `installAgents` (510행) | agent 정의 | 맞다 — gen-080 의 수정 대상 |
| `installSlashCommands` (328행) | slash command 19개 | **틀렸다** |

결과적으로 설치된 모든 command 파일에 `mode: subagent` 가 붙었다:

```
---
description: "REAP Start — Start a new Generation"
mode: subagent      ← command 인데 agent 라고 선언
---
```

`git log -L` 로 확인하니 gen-080(`1abcd40`)이 두 곳 모두에 넣었다. **agent 스키마를 command 에 과잉 적용한 것이다.**

OpenCode 는 현재 이 잉여 필드를 용인한다 (`agent list` exit 0, command 가 agent 로 잡히지도 않음). 그래서 **본 세대가 만든 검사도 이것을 잡지 못한다** — `opencode command list` 같은 CLI 표면이 없다. 코드를 읽다 발견했다.

수정: slash command 는 변환 없이 그대로 쓴다. 주석에 "검사가 이것을 잡지 못한다"는 사실을 근거와 함께 남겼다 — 다음 사람이 검사를 실제보다 신뢰하지 않도록.

**genome 의 "인과로 묶인 검증 동작 fix 는 본 generation 에서 처리"에 해당한다.** 본 세대가 검증하는 바로 그 경로의 결함이고, 수정이 1줄이다.

### 치환 대상을 잘못 짚을 뻔했다

negative test 를 만들 때 `toOpenCodeAgent(source)` 를 단순 치환했는데 **첫 번째 매치가 slash command 쪽**이었다. 그대로 뒀으면 "검사가 gen-080 을 못 잡는다"는 잘못된 결론이 나왔을 것이다.

치환 후 `grep -n` 으로 어느 줄이 바뀌었는지 확인해서 알아챘다. 그리고 그 확인이 위의 과잉 적용 결함까지 드러냈다.

## Architecture Decisions

### 별도 스크립트가 아니라 확장

`npm pack` → 격리 HOME/prefix 설치가 ~40줄이라 별도 스크립트면 통째로 중복된다.

더 중요한 건 질문이 같다는 점이다. 이 게이트는 원래 **"갓 설치한 REAP 이 스스로에 대해 아무 문제도 보고하지 않는가"** 를 묻는다. 클라이언트 축을 더하는 것은 그 질문을 **"지원한다고 말하는 모든 클라이언트에 대해"** 로 넓히는 것이지 다른 질문을 만드는 게 아니다.

### 격리 — `HOME` 만으로 충분하다고 판단했고, 틀렸다

처음에 `XDG_CONFIG_HOME` 을 쓸까 검토했다가 **불필요하다고 판단했다.** 근거는 실측이었다 — fake HOME 에서 `opencode agent list` 를 돌리니 사용자 agent 가 보이지 않았으므로 opencode 가 `$HOME` 을 따른다고 결론했다.

그 실측은 맞았지만 **불완전했다.** 내 로컬에는 `XDG_CONFIG_HOME` 이 설정돼 있지 않았고, 그래서 "HOME 을 따른다"와 "XDG 가 없을 때 HOME 으로 fallback 한다"가 구분되지 않았다. **변수가 없는 환경에서 그 변수의 영향을 측정하려 한 것이다.**

CI 가 그 차이를 드러냈다 (아래 XDG 절). 지금은 `HOME` 격리를 유지하면서 자식 env 에서 `XDG_CONFIG_HOME` 을 제거한다 — 두 축을 함께 다뤄야 격리가 성립한다.

claude-code 진단을 건드리지 않도록 별도 HOME 을 쓰는 것은 그대로다.

### CI 첫 실전에서 REAP 의 실제 버그가 나왔다 — XDG_CONFIG_HOME

**계획은 "adapter 코드 변경은 범위 밖"이라고 적었다. 검사가 그 전제를 깼다.**

CI 에서 검사가 실패했고, 진단 출력이 원인을 지목했다:

```
XDG_CONFIG_HOME=/home/runner/.config
HOME (for opencode)=/tmp/tmp.cKgUMYoJzr
```

`~/.config` 는 **기본값일 뿐**이다. OpenCode 는 XDG base directory 규격을 따르므로 `XDG_CONFIG_HOME` 이 설정되면 거기를 읽는다. REAP 은 `join(home, ".config", ...)` 로 하드코딩되어 있었다.

결과: **`XDG_CONFIG_HOME` 을 설정한 사용자에게 slash command 19개와 agent 2개가 조용히 사라진다.** opencode 는 정상 기동하고 REAP 것만 없다. 오류가 없으니 사용자는 원인을 알 수 없다.

GitHub 러너가 이 변수를 설정하고, dotfile 설정을 쓰는 사용자도 흔히 해당된다.

수정: `opencodeConfigDir(home, xdgConfigHome)` 신설, commands/agent 경로가 이를 경유. **`process.env` 를 직접 읽지 않고 매개변수로 받는다** — 테스트가 fake home 을 쓰면서 실제 `XDG_CONFIG_HOME` 이 새어들면 임시 디렉토리 밖에 쓰게 된다.

### 테스트도 같은 결함을 갖고 있었다

`XDG_CONFIG_HOME=/tmp/xdgprobe` 로 CI 조건을 재현하니 unit 4건 + e2e 8건이 실패했다. 원인은 **`HOME` 만 바꾸고 `XDG_CONFIG_HOME` 은 상속시킨 것.**

gen-081 의 교훈과 정확히 같은 종류다 — *"격리 메커니즘을 프로세스 경계에 맞춰라. 한 축만으로는 사용자 환경으로 샌다."* 그때는 port/path 축이었고 이번엔 env 변수 두 개다.

- unit: `beforeAll` 에서 `XDG_CONFIG_HOME` 삭제 + `afterAll` 복원. **XDG 동작 자체를 검증하는 테스트 3건 추가** (set 시 우선 / unset 시 fallback / 빈 문자열 fallback)
- e2e: `cliWithHome` 헬퍼 2곳에서 자식 env 에서 `XDG_CONFIG_HOME` 제거

검증: `XDG_CONFIG_HOME` 설정/미설정 **양쪽 모두** 473 / 278 / 44 = 0 fail.

## Deferred Items

- **(b) agent 구동 검증** — opencode 헤드리스 모드(`opencode run`)가 `claude -p --output-format json` 만큼 판정하기 쉬운지 미확인. 유료라 CI 불가. 위험: 이것 없이는 "slash command 가 사용자에게 실제로 노출되는가"가 opencode 쪽에서 여전히 미검증이다 (gen-063 이 claude-code 에서 겪은 실패 양상)
- **slash command 검증** — `opencode command list` 가 없어 CLI 로는 불가. 파일 내용을 직접 assert 하는 e2e 라면 가능하나, 그것은 "우리가 쓴 것을 우리가 확인"이라 클라이언트에게 묻는 것과 다르다
