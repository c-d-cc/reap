# Validation Report

## Result

**pass**

## Checks

### 계획의 완료 기준 6항목

| # | 기준 | 결과 | 근거 |
|---|---|---|---|
| 1 | 정상 설치 통과 + 목록에 두 agent | ✅ | 로컬(1.3.16) / CI(1.18.9) 모두 `ok OpenCode loads reap-evolve and reap-evaluate` |
| 2 | gen-080 스키마로 되돌리면 실패 | ✅ | exit 1, 사용자가 겪은 오류 문자열과 동일 |
| 3 | agent 미설치 시 실패 | ✅ | exit 1 — exit code 만 봤다면 통과했을 케이스 |
| 4 | `opencode` 부재 시 amber SKIP | ✅ | SKIP 절 + 설치 안내. claude-code 진단은 무관하게 통과 |
| 5 | 사용자 `~/.config/opencode/` 미접근 | ✅ | 별도 `OC_HOME` + 자식 env 에서 `XDG_CONFIG_HOME` 제거 |
| 6 | CI 에서 SKIP 이 아니라 실제 실행 | ✅ | `against opencode 1.18.9` 출력 확인 |

### 기준 2·3 — 검사가 무엇을 잡는지

genome 은 "검사를 만들면 먼저 실패시켜라"를 요구한다. 두 negative test 를 각각 만들고 복원했다.

| 깨뜨린 것 | 결과 |
|---|---|
| agent 경로의 `toOpenCodeAgent(source)` → `source` (gen-080 재현) | `FAIL OpenCode rejects the configuration REAP just wrote` + 동일 오류 문자열 |
| `installAgents` 확장자 필터 무력화 (0개 설치) | `FAIL OpenCode accepted the config but does not list reap-evolve` |

두 번째가 특히 중요하다 — `agent list` 는 agent 가 없어도 exit 0 이므로, **exit code 만 보는 검사였다면 "아무것도 설치하지 않음"이 통과했다.**

### 검사가 실전에서 잡은 것 — 인위적 테스트보다 강한 증거

CI 첫 실행에서 **REAP 의 실제 사용자 영향 버그**를 잡았다.

```
XDG_CONFIG_HOME=/home/runner/.config
HOME (for opencode)=/tmp/tmp.cKgUMYoJzr
```

`XDG_CONFIG_HOME` 을 설정한 사용자에게 REAP 은 `$HOME/.config/opencode/` 에 쓰고 opencode 는 `$XDG_CONFIG_HOME/opencode/` 를 읽는다 → **slash command 19개 + agent 2개가 조용히 사라진다.** opencode 는 정상 기동하고 오류도 없다.

수정 후 CI green. 로컬(XDG 미설정)과 CI(XDG 설정) 양쪽에서 통과한다.

### 표준 검사

| 항목 | XDG 미설정 | XDG 설정 |
|---|---|---|
| unit | 473 / 0 | 473 / 0 |
| e2e | 278 / 0 | 278 / 0 |
| scenario | 44 / 0 | 44 / 0 |
| `check-self-diagnosis.sh` | pass (opencode 1.3.16) | pass — CI, opencode 1.18.9 |
| `npm run typecheck` | pass | — |
| `check-docs-version.sh` | pass | — |
| `list-carriers.sh --orphans` | orphan 0 | — |
| reap-test dispatch (리눅스 러너) | — | 473 / 278 / 44, 0 fail |

unit 이 470 → 473 인 것은 XDG 해석 검증 3건 추가분이다.

## Edge Cases

### 로컬에서 재현되지 않는 것을 재현하는 법

XDG 결함은 **개발자 로컬에서 절대 나타나지 않는다** — 그 변수가 없기 때문이다. `XDG_CONFIG_HOME=/tmp/xdgprobe` 를 앞에 붙여 CI 조건을 만들자 unit 4건 + e2e 8건이 즉시 실패했고, 그 뒤로는 로컬에서 고칠 수 있었다.

**변수가 없는 환경에서 그 변수의 영향을 측정할 수 없다.** 처음에 "opencode 는 HOME 을 따른다"고 결론한 실측이 정확히 그 함정이었다 — 맞는 관찰이었지만 "HOME 을 따른다"와 "XDG 가 없어서 HOME 으로 fallback 한다"를 구분하지 못했다.

### 버전 격차가 원인이 아님을 배제한 과정

CI(1.18.9) 실패 / 로컬(1.3.16) 통과였으므로 버전을 의심했다. 1.18.9 를 임시 prefix 에 설치해 로컬에서 돌리니 **통과했다** — 버전이 아니었다. 이어 docker 리눅스에서도 통과해 플랫폼도 배제됐다. 남은 것이 환경 변수였다.

## Issues

### 검사가 보지 못하는 것 (한계 명시)

- **slash command 를 검증하지 못한다.** `opencode command list` 같은 CLI 표면이 없다. gen-080 이 command 파일에 `mode: subagent` 를 붙이던 결함은 **코드를 읽다 발견했고 이 검사로는 잡히지 않는다**
- **(b) agent 구동 미검증.** "slash command 가 사용자에게 실제로 노출되는가"는 opencode 쪽에서 여전히 확인되지 않았다 — gen-063 이 claude-code 에서 겪은 실패 양상이 그대로 열려 있다
- **버전 격차.** 로컬은 개발자가 설치한 버전, CI 는 최신을 본다. 스크립트가 검사한 버전을 출력하므로 판정이 갈리면 근거는 남지만, **로컬 통과가 CI 통과를 보장하지 않는다** (이번이 그 사례다)
- **upstream 미고정의 대가.** OpenCode 가 스키마를 바꾸면 우리 커밋과 무관하게 red 가 된다. 의도된 설계지만 red 를 볼 때 이 가능성을 먼저 확인해야 한다 (실패 메시지에 명시)
- **`opencode` 부재 시 SKIP.** amber 로 출력되지만, 그 환경에서는 **검증되지 않았다**는 사실은 변하지 않는다
