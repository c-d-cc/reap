# Learning

## Project Overview

REAP v0.17.3. 직전 세대(gen-081)가 테스트를 CI 에 붙였고, 그 과정에서 **검사가 있어야 할 자리에 없던 곳**이 하나 더 드러났다.

본 generation 은 **OpenCode 가 REAP 이 쓴 파일을 읽을 수 있는지**를 검사로 만든다.

## Source Backlog

`opencode-가-reap-이-쓴-파일을-읽을-수-있는지-검사-agent-list-게이트.md`

gen-080 은 REAP 이 **사용자의 다른 도구를 동작 불능으로 만든** 사고였다. `install-skills` 가 claude-code 스키마의 agent 정의를 변환 없이 `~/.config/opencode/agent/` 에 복사했고, OpenCode 는 파일 하나가 읽히지 않으면 설정 전체를 무효화한다.

**그 사고를 검사가 잡지 못했다.** 사용자가 자기 환경에서 겪고 나서야 드러났다.

## Key Findings

### 1. 기존 게이트 둘 다 이 실패를 볼 수 없다

| 게이트 | 묻는 것 | gen-080 을 잡았을까 |
|---|---|---|
| 층1 `check-self-diagnosis.sh` | 파일이 올바른 위치에 올바른 내용으로 놓이는가 | **아니오** — 파일은 정확한 자리에 정확한 본문으로 놓였다. frontmatter 스키마가 그 클라이언트용이 아니었을 뿐 |
| 층2 `check-agent-integration.sh` | 클라이언트가 그걸 읽는가 | claude-code 만 대상 |

그리고 층1 은 **claude-code 로만** 진단한다 (`reap init` 기본값). agentClient 를 바꾼 경로는 어느 게이트도 지나지 않는다.

### 2. 이것은 "층2 의 opencode 판"이 아니다 — 실패 양상 자체가 다르다

당초 "adapter 가 둘이니 갭도 둘"로 정리했는데 부정확했다.

- **Claude Code**: agent 파일 하나가 깨져도 나머지가 동작한다. 이런 전면 중단 양상이 **없다**
- **OpenCode**: 설정 검증이 all-or-nothing. 파일 하나가 **전체를 무효화**한다

즉 대응물을 복사하는 게 아니라 **OpenCode 고유 위험에 대한 새 검사**다. 그래서 비용 구조도 다르다 — 층2 는 모델 호출이 필요해 유료지만, 이건 설정 파싱이라 무료다.

### 3. 실측 — 판정 신호가 명확하다

`XDG_CONFIG_HOME` 이 아니라 **`HOME` 하나로 양방향 격리된다.**

- REAP 의 `opencodeAgentsDir(home = homedir())` → `$HOME/.config/opencode/agent`. `reap` 은 node 로 돌아 `homedir()` 가 `$HOME` 을 따른다
- **opencode 바이너리도 `HOME` 을 따른다** (실측: fake HOME 에서 사용자 agent 가 안 보임). genome longterm 의 "bun 의 `os.homedir()` 는 in-process `$HOME` 을 무시한다"가 걸릴 수 있어 확인했는데, 별도 프로세스라 문제없다

격리 HOME 에 실제 설치 경로로 넣고 측정한 결과:

```
양성  reap init → agentClient: opencode → install-skills
      → fake HOME 에 reap-evaluate.md / reap-evolve.md
      → opencode agent list : exit 0, "reap-evolve (subagent)" / "reap-evaluate (subagent)"

음성  reap-evolve.md 의 permission 을 gen-080 이전 형태(tools: 문자열)로 되돌림
      → exit 1
        Error: Configuration is invalid at .../reap-evolve.md
        ↳ Invalid input: expected record, received string tools
```

**깨진 상태를 먼저 실패시켜 확인했다** (genome 요구). 이 음성 케이스는 사용자가 실제로 겪은 오류와 동일한 문자열이다.

### 4. exit code 만 보면 안 된다

`opencode agent list` 는 **agent 를 하나도 설치하지 않아도 exit 0** 이다 (내장 agent 만 나열). exit code 만 판정하면 "REAP 이 아무것도 설치하지 않음"이 통과한다.

gen-079 교훈이 그대로 적용된다 — *"관찰이 무엇을 증명하는지 물어라."* 층2 초안이 slash command 를 전부 지워도 통과했던 것과 같은 함정이다. 따라서 **목록에 `reap-evolve` / `reap-evaluate` 가 있을 것**까지 요구해야 한다.

### 5. 기존 게이트의 구조를 따를 것

`check-self-diagnosis.sh` 의 패턴:
- `npm pack` → 격리 HOME + prefix 에 설치 → 실제 사용자 흐름 재현
- `cleanup()` + `trap EXIT` 로 임시 자원 회수
- `red()/green()/amber()/dim()` 색상 helper
- **도구 부재 시 `amber` 로 SKIP 명시 출력** (`check-agent-integration.sh` 가 `claude` 부재에 쓰는 패턴). 조용한 exit 0 은 "검사했고 깨끗하다"로 읽힌다

## Previous Generation Reference

gen-081 에서 직접 이어지는 것:

- **"green 은 환경 하나의 표본"** — 이번엔 "클라이언트 하나의 표본"이다. 층1 이 claude-code 로만 진단해 왔다
- **검사를 만들면 먼저 실패시켜라** — 이미 backlog 단계에서 음성 케이스를 확인했다
- **관찰이 무엇을 증명하는지 물어라** — 위 4번

## Backlog

pending 3건 — 모두 무관하므로 승계하지 않는다 (interview 재설계 / daemon 배포 결함 / daemon SCIP).

## Context

**차단 요인 없음.** 판정 신호·격리 방법·양성/음성 케이스가 모두 실측으로 확정됐다.

미결은 설계 판단 하나뿐이다: **기존 `check-self-diagnosis.sh` 를 확장할 것인가, 별도 스크립트로 둘 것인가.** planning 에서 결정한다.

## Clarity Level

**high**

- backlog 가 근거·재현 명령·acceptance 5항목을 갖췄다
- 실패 신호가 결정적이다 (exit code + 목록 문자열)
- 남은 것은 배치 결정이며 설계 모호성이 아니다
