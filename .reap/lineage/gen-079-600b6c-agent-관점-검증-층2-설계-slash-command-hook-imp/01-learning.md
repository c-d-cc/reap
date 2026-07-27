# Learning

## Project Overview

REAP v0.17.3 (미릴리즈), embryo generation 79. 0.17.3 묶음 **3/3**.

backlog 는 "설계 필요 — 아직 미확정" 상태로 A/B/C/D 4후보를 열어두었다. **본 세대의 첫 일은 후보 중 무엇이 실제로 가능한지 확인하는 것**이었고, 실측으로 확정했다.

## Source Backlog

`agent-관점-검증-층2-slash-commandhookimport-가-실제로-동작하는지-확인하는-절차.md` (consumed by gen-079-600b6c)

## Key Findings — 실측으로 후보를 좁혔다

### 1. 후보 A(헤드리스 agent 실행)가 **실제로 작동한다**

backlog 는 A 의 난관으로 "인증, CI 비용, 출력 판정"을 들었다. 격리 환경에서 직접 돌려 확인했다:

```
$ claude -p "Run the /reap.status slash command..." --output-format json
subtype: success | is_error: False | num_turns: 4 | cost_usd: 0.24
```

agent 응답에 REAP 상태표가 정상 출력됐고, **SessionStart hook 발화도 확인**됐다(응답이 pending migration 안내를 언급 — hook 이 주입한 context 를 읽었다는 증거).

즉 **slash command 인식 / hook 발화 / `@` import 로드가 한 번의 호출로 전부 검증된다.** gen-063 이 놓쳤던 바로 그 층이다.

### 2. 출력 판정 문제는 **부수 효과로 우회된다** (결정적)

agent 응답은 자연어이고 언어·표현이 매번 다르므로 문자열 매칭은 깨지기 쉽다. backlog 가 지적한 진짜 난관이다.

**해결: 응답이 아니라 파일 시스템 상태를 본다.**

```
$ claude -p "Use the /reap.start slash command to create a generation with the goal 'headless probe'..."
subtype: success | cost: $0.23

# 판정 — 결정적
.reap/life/current.yml 생성됨 ✓
  id: gen-001-6f6366
  stage: learning
  goal: headless probe
```

**agent 가 slash command 를 인식하지 못했다면 `current.yml` 은 생기지 않는다.** 자연어를 한 글자도 파싱하지 않고 검증된다.

### 3. 비용과 실행 시간 — CI 상시는 부적합

| 항목 | 실측 |
|---|---|
| 1회 비용 | **$0.23~0.24** |
| turns | 4 |
| 소요 | 수십 초 |

매 push 마다 돌리면 비용이 누적되고, agent 응답 시간이 비결정적이라 CI 를 느리게 한다. **릴리즈 전에만** 돌리는 것이 합리적이다 — gen-078 의 자기진단(무료·수초)과 성격이 다르다.

### 4. 후보 재평가

| 후보 | 판정 |
|---|---|
| **A. 헤드리스 실행** | **채택** — 실측으로 작동 확인. 판정은 부수 효과로 |
| B. 설정 파싱 검증 | **불채택** — 우리 해석대로 검증하므로 해석이 틀리면 같이 틀린다. gen-063 의 실패가 정확히 이 유형(파일은 맞게 썼으나 클라이언트가 읽는 위치가 아니었음) |
| C. 수동 체크리스트 | **불채택** — gen-073 이 확인한 대로 지시문은 이미 실패한 방법 |
| D. OpenShell 샌드박스 | **보류** — alpha·Linux 전용. 그리고 **격리를 풀어주지 판정을 풀어주지 않는다.** A 의 난관은 판정이었고 그건 부수 효과로 해결됐다. 로컬 실행은 이미 격리 가능(HOME override) |

D 를 보류하는 이유가 중요하다 — 유저가 이 도구를 제안한 맥락은 "전역 설치 + agent 실행의 오염 우려"였고, 그 우려는 정당했다. 그러나 **오염은 HOME/prefix override 로 이미 해결**됐고(gen-078 자기진단이 실증), 남은 문제는 판정이었는데 OpenShell 은 그 부분을 다루지 않는다.

### 5. 인증은 로컬에서만 자동

`claude -p` 는 로컬 인증(OAuth/API key)을 쓴다. CI 에서는 `ANTHROPIC_API_KEY` secret 이 필요하다. **릴리즈 전 로컬 실행**이면 인증 문제가 없다.

## Previous Generation Reference

gen-078 이 층 1(자기진단)을 완성했다. 두 층의 경계가 실측으로 분명해졌다:

| | 검증 대상 | 비용 | 위치 |
|---|---|---|---|
| 층 1 (gen-078) | 파일이 올바른 위치·내용으로 놓였는가 | 무료·수초 | CI + release |
| **층 2 (본 세대)** | **agent 가 그것을 읽고 동작하는가** | $0.24·수십초 | release 전 |

## Backlog Review

pending 4건. 본 세대 후: 0.17.3 릴리즈 → interview 재설계 / daemon 2건 / CI 테스트.

## Context for This Generation

### Clarity Level: **High** (실측 후)

착수 시점엔 medium 이었다 — backlog 가 4후보를 열어두고 "설계 필요"라고만 했다. **실측 2회로 A 확정 + 판정 방법 확보**하여 high 가 됐다.

### 0.17.3 포함 여부 — 이제 판단 가능

착수 전 우려("설계 세대라 코드가 없을 수 있음")는 해소됐다. A 가 작동하므로 **스크립트를 실제로 만들 수 있고**, 그러면 0.17.3 에 넣을 내용이 생긴다.

### 특수 제약

- **비용이 드는 검사**다. CI 상시 금지, 릴리즈 전 수동/반자동
- **판정은 반드시 부수 효과로** — 자연어 매칭은 flaky 를 만든다
- **Acceptance 1번(backlog)**: gen-063 의 실패를 재현 상황에서 잡을 수 있어야 한다. 이것이 설계 평가 기준
