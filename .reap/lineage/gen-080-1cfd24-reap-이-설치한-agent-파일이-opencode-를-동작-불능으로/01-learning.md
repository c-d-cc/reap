# Learning

## Project Overview

REAP v0.17.3 (미릴리즈), embryo generation 80. **사용자 환경에서 실제로 발생한 버그**를 고친다.

0.17.3 묶음이 3건에서 4건으로 늘었다 — 이 버그는 검증 도구 개선 중 우연히 발견됐다(OpenShell 샌드박스 검증 준비 → opencode 로그인 시도 → 오류).

## Source Backlog

`긴급-reap-이-설치한-agent-파일이-opencode-를-동작-불능으로-만듦-...md` (consumed by gen-080-1cfd24)

## Key Findings

### 1. 원인 확정 — `tools` 필드 하나 (backlog 분석의 정정)

backlog 는 문서 대조만으로 "5개 필드 중 4개가 틀렸다"고 적었다. **실측 결과 오류를 내는 것은 `tools` 하나다.**

```
$ opencode agent list
Error: Configuration is invalid at ~/.config/opencode/agent/reap-evolve.md
  ↳ Invalid input: expected record, received string  tools
```

`name` / `model: opus` / `memory: project` 를 남겨둔 채 `tools` 만 record 로 바꾸면 **통과한다**(probe-a 로 확인). 나머지 필드는 OpenCode 가 무시한다.

문서에 없는 필드라고 해서 오류를 내는 것은 아니었다 — **문서 대조와 실측이 다를 수 있다**는 사례다.

### 2. 재현 조건 — 명령마다 agent 로드 여부가 다르다

| 명령 | agent 로드 | 오류 |
|---|---|---|
| `opencode auth list` | 안 함 | 없음 |
| **`opencode agent list`** | **함** | **발생** |

처음에 `auth list` 로 확인하다 "재현 안 됨"으로 잘못 판단할 뻔했다. 유저는 `auth login` 에서 만났다 — 로그인 경로는 agent 를 로드한다.

**재현 명령을 잘못 고르면 버그가 없다고 결론 내린다.** 실제 사용자가 실행한 명령을 재현해야 한다.

### 3. 검증된 수정 형태

```yaml
---
description: ...
mode: subagent
tools:
  read: true
  edit: true
  write: true
  glob: true
  grep: true
  bash: true
  task: true
---
```

실측 확인(probe-b): `probe-b (subagent)` 로 정확히 인식됨.

- `mode: subagent` — 생략 시 `all` 이 되는데, REAP 은 이들을 subagent 로 호출하므로 명시가 맞다
- **`model` 은 생략한다** — OpenCode 는 `provider/model` 형식을 기대하고 사용자마다 provider 가 다르다. 특정 모델을 박으면 그 provider 가 없는 사용자에게 **새로운 오류**를 만든다. 생략하면 사용자 기본 모델을 쓴다
- `name` / `memory` 제거 — 무시되지만 남겨두면 다음 사람이 유효한 필드로 오해한다

### 4. 코드 위치

```ts
// src/adapters/opencode/install.ts:412-419
const srcDir = agentsTemplateDir();          // src/templates/agents/ (claude-code 용)
for (const file of sources) {
  await cp(join(srcDir, file), join(targetDir, file));   // ← 그대로 복사
}
```

claude-code adapter 도 같은 `agentsTemplateDir()` 를 쓴다. **하나의 템플릿을 두 클라이언트가 공유하는데 스키마가 다르다.**

### 5. 왜 검증을 통과했나

`tests/e2e/install-agents.test.ts` (gen-066) 는 **파일이 복사됐는지**만 본다. 그 파일을 OpenCode 가 읽을 수 있는지는 확인하지 않는다.

gen-079 가 만든 층2 검증이 정확히 이 갭을 겨냥했으나 **claude-code 만 대상**이었고, deferred 로 남긴 "OpenCode adapter 층2 미검증"이 실제 사고가 됐다.

### 6. 심각도 — 이전 이슈들과 성격이 다르다

| | 증상 |
|---|---|
| #21 | 규칙 모순 → agent 행동 예측 불가 |
| #22 | 해소 불가능한 경고 (기능은 동작) |
| **본 건** | **REAP 이 사용자의 다른 도구를 멈춘다** |

opencode 주력 사용자가 REAP 을 설치하면 REAP 과 무관한 작업까지 막히고, 오류는 opencode 가 내므로 원인 추적이 어렵다.

## Previous Generation Reference

gen-079 의 deferred 항목이 하루 만에 실제 사고로 확인됐다. "adapter 가 둘이므로 갭도 둘"이라 적어두고 한쪽만 검증한 결과다.

gen-078 의 carrier 개념이 여기 적용된다 — "agent 정의 frontmatter 스키마"는 클라이언트마다 다른 사실이고, 지금은 그 사실이 어디에도 표시돼 있지 않다.

## Backlog Review

pending 5건. 유저 지시: 본 세대(a) → opencode 샌드박스 검증(b). 나머지는 이후.

## Context for This Generation

### Clarity Level: **High**

원인이 실측으로 확정됐고(`tools` record), 수정 형태도 검증됐다(probe-b). backlog 의 과잉 분석은 정정됐다.

### 특수 제약

- **유저 환경이 현재 격리 상태** — `~/.config/opencode/agent/` 에 REAP 파일을 되돌려둔 상태이며, 본 세대 완료 시 올바른 형식으로 재설치해야 한다
- **본 세대가 (b)의 선행 조건** — 샌드박스에서 opencode 를 쓰려면 REAP 설치가 opencode 를 깨뜨리지 않아야 한다
- **0.17.3 묶음** — 릴리즈 노트에 본 세대 내용 추가 필요. (b) 완료 후 일괄
