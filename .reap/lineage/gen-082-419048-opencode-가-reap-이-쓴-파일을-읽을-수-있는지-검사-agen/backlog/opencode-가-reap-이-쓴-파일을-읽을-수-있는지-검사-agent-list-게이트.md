---
type: task
status: consumed
priority: high
createdAt: 2026-07-29T16:07:59.478Z
consumedBy: gen-082-419048
consumedAt: 2026-07-29T16:08:52.255Z
---

# OpenCode 가 REAP 이 쓴 파일을 읽을 수 있는지 검사 (agent list 게이트)

## Problem

gen-080 은 **REAP 이 사용자의 다른 도구를 동작 불능으로 만든** 사고였다. `install-skills` 가 claude-code 스키마의 agent 정의를 변환 없이 `~/.config/opencode/agent/` 에 복사했고, OpenCode 는 파일 **하나**가 읽히지 않으면 설정 전체를 무효화한다 — 모든 `opencode` 명령이 실패했다.

그 사고를 **검사가 잡지 못했다.** 사용자가 자기 환경에서 겪고 나서야 드러났다.

기존 게이트가 왜 못 잡았는지가 핵심이다:

| 게이트 | 묻는 것 | gen-080 을 잡았을까 |
|---|---|---|
| 층1 `check-self-diagnosis.sh` | 파일이 올바른 위치에 올바른 내용으로 놓이는가 | **아니오** — 파일은 정확한 자리에 정확한 본문으로 놓였다. frontmatter 스키마가 그 클라이언트용이 아니었을 뿐 |
| 층2 `check-agent-integration.sh` | 클라이언트가 그걸 읽는가 | **claude-code 만** 대상 |

gen-079 가 이 갭을 deferred 에 적어뒀고 **하루 만에 사고가 됐다.**

## 이것은 "층2 를 opencode 로 확장"이 아니다 — 종류가 다르다

당초 "adapter 가 둘이니 갭도 둘"로 정리했으나 부정확했다. 두 질문으로 갈린다:

| | 묻는 것 | 필요 | 비용 |
|---|---|---|---|
| **(a) 본 backlog** | REAP 이 쓴 파일을 클라이언트가 **읽을 수 있는가** | `opencode agent list` | **0** |
| (b) 별건 | agent 가 slash command 로 REAP 을 **구동하는가** | 모델 호출 | 유료 |

**(a) 는 claude-code 쪽에 대응물이 없다.** Claude Code 는 agent 파일 하나가 깨져도 나머지가 죽지 않으므로 이런 실패 양상 자체가 없다. 즉 이것은 "같은 검사를 다른 adapter 에 복사"가 아니라 **OpenCode 고유의 실패 양상에 대한 새 검사**다.

## Solution

`opencode agent list` 의 exit code 로 판정한다. 실측 완료 (2026-07-29):

```
정상 설정                          → exit 0, 목록에 reap-evolve / reap-evaluate (subagent)
tools 를 문자열로 되돌린 설정      → exit 1
                                     "Configuration is invalid at .../reap-evolve.md
                                      ↳ Invalid input: expected record, received string tools"
```

**깨진 상태에서 먼저 실패시켜 확인했다** (genome 요구). 재현은 `XDG_CONFIG_HOME` 을 임시 복사본으로 돌려 사용자 설정을 건드리지 않고 수행.

중요 — **모델 호출이 없다.** 설정 파싱 단계에서 끝나므로 무료·로컬·결정적이며 **CI 에 넣을 수 있다.** 층2(유료, 릴리즈 전 수동)와 성격이 다르다.

### 검사 위치

층1 게이트(`check-self-diagnosis.sh`)와 같은 질문 — "설치가 스스로에 대해 아무 문제도 보고하지 않아야 한다" — 이므로 그 옆이 자연스럽다. 다만 `opencode` 가 없는 환경에서는 **SKIP 을 명시 출력**해야 한다 (조용한 exit 0 은 "검사했고 깨끗하다"로 읽힌다 — gen-079 가 세운 원칙).

### 격리

`agent list` 는 인증·네트워크가 필요 없으므로 **`XDG_CONFIG_HOME` 임시 디렉토리만으로 완전 격리**된다. 사용자 설정을 읽지도 쓰지도 않게 만들 수 있다 — claude-code 층2 가 격리 불가였던 것(로그인이 slash command 와 같은 디렉토리)과 대조된다.

검사 흐름:
1. 임시 `XDG_CONFIG_HOME` 준비
2. 그 위치에 REAP 의 opencode adapter 로 설치 (`installAgents` / `installSlashCommands` 경로)
3. `opencode agent list` → exit 0 + `reap-evolve` / `reap-evaluate` 가 목록에 있어야 함
4. 임시 디렉토리 정리

3번의 **"목록에 있어야 함"까지 요구하는 것이 중요**하다. exit 0 만 보면 agent 를 하나도 설치하지 않아도 통과한다 (gen-079 교훈: "관찰이 무엇을 증명하는지 물어라").

## Out of Scope

- **(b) agent 구동 검증** — opencode 의 헤드리스 모드가 `claude -p --output-format json` 만큼 다루기 쉬운지 미확인. 유료라 CI 불가. 별도 판단
- OpenShell 샌드박스 — (a) 에 불필요. (b) 에도 필수가 아니며 현재 네트워크 정책에 막혀 있음

## Files to Change

- `scripts/` — 신규 검사 (또는 `check-self-diagnosis.sh` 확장)
- `.github/workflows/ci.yml` — 무료이므로 CI 편입
- `.reap/environment/summary.md` — 게이트 표 갱신

## Acceptance

1. 정상 설치에서 통과
2. **agent frontmatter 를 claude-code 스키마로 되돌리면 실패** (negative test — gen-080 재현)
3. **agent 를 하나도 설치하지 않아도 실패** (exit code 만 보지 않는다는 증거)
4. `opencode` 미설치 환경에서 **SKIP 을 명시 출력**하고 통과 — 조용히 넘어가지 않는다
5. 사용자의 `~/.config/opencode/` 를 읽지도 쓰지도 않음
