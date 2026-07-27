---
type: task
status: consumed
priority: high
createdAt: 2026-07-27T18:46:05.769Z
consumedBy: gen-080-1cfd24
consumedAt: 2026-07-27T18:50:01.752Z
---

# 긴급: REAP 이 설치한 agent 파일이 OpenCode 를 동작 불능으로 만듦

## Problem

`agentClient: opencode` 사용자가 `reap install-skills` 또는 `reap update` 를 실행하면 **OpenCode 전체가 설정 오류로 멈춘다.**

```
Error: Configuration is invalid at /Users/hichoi/.config/opencode/agent/reap-evolve.md
```

이 오류가 뜨면 `opencode auth login` 을 포함해 **어떤 opencode 명령도 실행되지 않는다.** 2026-07-28 세션에서 실제로 재현됐고, REAP 이 설치한 두 파일을 치우자 즉시 정상화됐다.

### 원인 — 스키마 변환 없이 그대로 복사

`src/adapters/opencode/install.ts:417`:

```ts
await cp(join(srcDir, file), join(targetDir, file));
```

`srcDir` 은 `src/templates/agents/` 로 **claude-code 용으로 작성된 파일**이다. gen-066 이 opencode adapter 에 `installAgents` 를 추가하면서 claude-code 의 것을 그대로 복사하도록 했고, **두 클라이언트의 frontmatter 스키마가 다르다는 점을 확인하지 않았다.**

### 스키마 대조

| 필드 | REAP 이 쓴 값 | OpenCode 스키마 |
|---|---|---|
| `name: reap-evolve` | 있음 | **존재하지 않는 필드** — 파일명이 식별자 |
| `tools: Read, Edit, Write, Glob, Grep, Bash, Agent` | 콤마 구분 문자열 | **`permission` 객체** (`read`/`edit`/`bash`/... → `allow`/`ask`/`deny`). 구 `tools` 도 객체형 |
| `model: opus` | 짧은 별칭 | **`provider/model`** 형식 (예: `anthropic/claude-sonnet-4-...`) |
| `memory: project` | 있음 | **존재하지 않는 필드** |
| `mode` | 없음 | **필요** — `subagent` / `primary` / `all` |

5개 중 4개가 잘못됐고 필수 필드 1개가 빠졌다.

출처: https://opencode.ai/docs/agents/ (2026-07-28 확인)

### 왜 심각한가

이전 이슈들과 성격이 다르다:

| | 증상 |
|---|---|
| #21 | 규칙이 모순돼 agent 행동이 예측 불가 |
| #22 | 해소 불가능한 경고 19건 (기능은 동작) |
| **본 건** | **REAP 이 사용자의 다른 도구를 망가뜨린다** |

opencode 를 주력으로 쓰는 사용자가 REAP 을 설치하면 **REAP 과 무관한 작업까지 전부 막힌다.** 그리고 원인이 REAP 이라는 것을 알아채기 어렵다 — 오류 메시지는 opencode 가 낸다.

### 왜 지금까지 안 드러났나

gen-063/064 가 opencode adapter 를 만들 때 검증한 것은 **파일이 올바른 위치에 놓이는가**였다. `installAgents` e2e(gen-066)도 "파일이 복사됐는가"만 본다. **그 파일을 opencode 가 읽을 수 있는가는 아무도 확인하지 않았다.**

gen-079 가 만든 층2 검증이 정확히 이 갭을 겨냥했으나 **claude-code 만 대상**이었다. deferred 로 남긴 "OpenCode adapter 층2 미검증"이 실제 사고로 확인된 것이다.

## Out of Scope

- claude-code 용 agent 정의 자체의 내용 변경 — 그쪽은 정상 동작 중
- OpenCode adapter 의 다른 부분(instructions, plugin, slash commands) — 현재 문제 없음. 단 같은 유형의 갭이 있는지는 확인 대상

## Solution

### S1. 즉시 — opencode 용 agent 정의를 별도로 둔다

`src/templates/agents/` 를 클라이언트별로 분리하거나, opencode 용 frontmatter 를 생성하는 변환 계층을 둔다.

두 방식의 트레이드오프:

| 방식 | 장점 | 단점 |
|---|---|---|
| **별도 파일** (`agents/claude-code/`, `agents/opencode/`) | 각 스키마를 정확히 표현 | 본문(프롬프트)이 중복 — 한쪽만 고치는 사고 재발 위험 |
| **변환 계층** (본문 공유 + frontmatter 생성) | 본문이 단일 소스 | 변환 로직 유지 필요 |

**변환 계층이 낫다.** 본문은 REAP 의 agent 역할 정의로 클라이언트와 무관하고, 다르게 표현되어야 하는 것은 frontmatter 뿐이다. 별도 파일로 두면 issue #21 과 같은 유형(같은 내용이 두 곳, 한쪽만 갱신)을 스스로 만드는 셈이다.

### S2. 설치 시 검증

파일을 쓰고 끝내지 말고 **opencode 가 읽을 수 있는지 확인**한다. 최소한 필수 필드 존재와 금지 필드 부재를 검사한다. 가능하면 `opencode` CLI 로 실제 파싱을 시도한다.

### S3. 기존 피해자 복구

이미 잘못된 파일이 깔린 사용자가 있다. `installAgents` 는 cleanup-then-copy 이므로 새 버전 설치 시 자동 교체되지만, **REAP 을 지운 사용자**는 잔재가 남는다. `reap fix` 가 감지·정리하도록 할지 판단 필요.

### S4. carrier 표식

"agent 정의의 frontmatter 스키마"는 클라이언트마다 다른 사실이다. gen-078 의 `reap:carrier(id)` 를 붙여 다음에 agent 정의를 건드릴 때 양쪽이 보이게 한다.

## Files to Change

- `src/templates/agents/reap-evolve.md`, `reap-evaluate.md` — 본문/frontmatter 분리 구조
- `src/adapters/opencode/install.ts` `installAgents` (L390-420) — 변환 후 쓰기
- `src/adapters/claude-code/install.ts` `installAgents` — 대칭 처리
- `tests/e2e/install-agents.test.ts` — **설치된 파일이 각 클라이언트 스키마를 만족하는지** 검증 추가
- `src/cli/commands/fix.ts` 또는 `core/integrity.ts` — S3 채택 시

## Acceptance

1. `reap install-skills` (agentClient: opencode) 후 **`opencode auth list` 등 모든 opencode 명령이 정상 동작**
2. 설치된 agent 파일에 `name` / `memory` 가 없고 `mode` 가 있으며 `model` 이 `provider/model` 형식
3. claude-code 쪽은 기존 스키마 유지 (회귀 없음)
4. e2e 가 스키마 위반을 잡는다 — **의도적으로 깨뜨려 fail 을 확인할 것** (gen-073 원칙)
5. agent 본문이 단일 소스 (S1 변환 계층 채택 시)

## Open Decisions

- [ ] S1 방식 — 변환 계층 vs 별도 파일. 위 분석은 변환 계층을 권하나 구현 복잡도 확인 필요
- [ ] `mode` 값 — `reap-evolve`/`reap-evaluate` 모두 `subagent` 가 맞는지. REAP 은 이들을 subagent 로 호출한다
- [ ] `model` 값 — opencode 는 `provider/model` 을 요구하는데 사용자마다 provider 가 다르다. **생략 가능한지 확인 필요**(생략 시 사용자 기본 모델 사용). 특정 모델을 강제하면 provider 가 없는 사용자에게 또 다른 오류가 된다
- [ ] S3 — 기존 잔재 정리를 `reap fix` 에 넣을지

## Reproduction (2026-07-28)

```
$ opencode auth login
Error: Configuration is invalid at ~/.config/opencode/agent/reap-evolve.md

$ mv ~/.config/opencode/agent/reap-*.md /tmp/quarantine/
$ opencode auth list
  Credentials ~/.local/share/opencode/auth.json    ← 정상 동작
```
