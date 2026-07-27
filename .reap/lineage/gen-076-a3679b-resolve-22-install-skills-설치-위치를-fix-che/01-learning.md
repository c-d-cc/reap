# Learning

## Project Overview

REAP v0.17.2 (배포됨), embryo generation 76. GitHub issue #22 해결 세대이며 0.17.3 으로 릴리즈 예정.

앞선 gen-072(#21) 와 **같은 유형의 이슈**다 — 하나의 사실을 여러 곳이 알고 있는데 일부만 갱신됨. 재발 방지는 별도 backlog(`릴리즈-자기진단-게이트-...`)로 분리했고, 본 세대는 **오탐 자체의 수정**에 집중한다.

## Source Backlog

`resolve-22-install-skills-위치를-fix-check-가-legacy-로-오탐-installerchecker-불일치.md` (consumed by gen-076-a3679b)

## Key Findings

### 1. 재현 확인 (본 repo, 2026-07-27)

```
$ ls ~/.claude/commands/reap.*.md | wc -l   →  19
$ reap fix --check                           →  19건 "legacy reap command at user level (Phase 2 remnant)"
```

`install-skills` 를 다시 돌려도 cleanup-then-copy 로 같은 19개가 재배치되고 경고도 그대로다. `fix`(non-check)는 user-level 을 건드리지 않아 **탈출구가 없다**는 제보자 지적이 정확하다.

### 2. `integrity.ts` 가 자기 파일 안에서 모순된다 (결정적 증거)

| 위치 | 내용 |
|---|---|
| L772-774 (`cleanupLegacyProjectSkills` docstring) | *"v0.16 uses user-level `~/.claude/commands/` **only**, so project-level files are unnecessary"* |
| L715-722 (`checkUserLevelArtifacts`) | 같은 경로에 warning *"legacy reap command at user level (Phase 2 remnant)"* |

한 파일이 같은 경로를 "v0.16 정식 위치"라고 하면서 동시에 "legacy"라고 경고한다. **이슈가 "저자의 판단"이라 한 것과 달리 답은 이미 코드 안에 있다.**

### 3. "Phase 2" 의 정체 (git 추적)

`git log -S "Phase 2 remnant"` → 최초 `363a9a9` (2026-03-23, v0.15).
같은 시기: `5d1bd35 fix(gen-066-0ff356): postinstall.cjs Phase 2 — ~/.reap/commands/ 전용 설치` (2026-03-20).

**"Phase 2" = v0.15 에서 `~/.reap/commands/` 로 이전하던 작업명.** 그 맥락에서 `~/.claude/commands/` 는 실제 잔재였고 경고가 타당했다.

이후 `f290166 feat: reap v0.16.0 — complete rewrite` 에서 어댑터가 `~/.claude/commands/` 를 정식 위치로 되돌렸으나 **checker 문구만 v0.15 맥락으로 남았다.**

### 4. opencode 는 이미 올바른 패턴을 갖고 있다 (설계 근거)

```
src/adapters/opencode/install.ts:279   export function opencodeCommandsDir(home = homedir()): string
src/adapters/opencode/install.ts:374   export function opencodeAgentsDir(home = homedir()): string
src/adapters/claude-code/install.ts:46 const targetDir = join(homedir(), ".claude", "commands");  ← 인라인
```

gen-064 가 opencode 쪽에 헬퍼를 만들었고 **claude-code 만 따르지 않았다.** 즉 본 세대의 DI 작업은 새 패턴 발명이 아니라 **기존 패턴의 적용**이다.

같은 gen-064 가 opencode 의 legacy 경고를 제거하며 남긴 주석도 있다(`integrity.ts:724-727`) — claude-code 만 빠뜨린 것이 여기서도 확인된다.

### 5. 계층 구조는 깨끗하다 — DI 를 넣기 좋다

```
grep -rn "from .*adapters" src/core/   →  매치 0
```

**`core` 는 `adapters` 를 전혀 모른다.** 유저 지시("core → adapter 의존 금지, 주입할 수 있도록")가 현재 구조와 일치한다.

호출부도 단순하다:

| 함수 | 호출부 | 수 |
|---|---|---|
| `checkUserLevelArtifacts` | `cli/commands/fix.ts:39` | **1** |
| `checkProject` | `cli/commands/fix.ts:185` | **1** |

주입 지점이 한 곳이므로 시그니처 변경 비용이 낮다.

### 6. 현재 검사 3종과 각각의 타당성

| # | 대상 | 심각도 | 판정 |
|---|---|---|---|
| 1 | `~/.claude/skills/reap.*` | error | **타당** — v0.15 는 `.claude/skills/reap.*/SKILL.md` 를 썼고 v0.16 은 쓰지 않음 |
| 2 | `~/.claude/commands/reap.*` | warning | **오탐** — 정식 설치 위치 |
| 3 | `.claude/commands/reap.*` (project) | warning | **타당** — v0.15 잔재이며 `cleanupLegacyProjectSkills` 가 실제로 삭제 |

2번만 문제다. 1·3 은 유지한다.

### 7. `fix.ts` 는 아직 adapter 를 모른다

`checkProject` 는 config 를 읽지 않는다(`fixProject` 는 L165 에서 읽음). DI 를 넣으려면 `checkProject` 가 `agentClient` 를 읽고 `getAdapter()` 를 호출해야 한다.

**주의**: `getAdapter("codex")` 는 helpful Error 를 throw 한다(`adapters/index.ts`). `fix --check` 가 그것 때문에 죽으면 안 되므로 실패 시 검사를 건너뛰는 처리가 필요하다.

## Previous Generation Reference

gen-072(#21)가 같은 유형이었고 그때 genome 에 "carrier 3중 확인"을 넣었다. gen-073 이 docs 를 추가해 4중으로 늘렸다. **그럼에도 #22 가 발생했다** — 목록이 전부 문서·prompt 계열이라 "코드 대 코드"를 담지 못했다.

이 분석과 대책(canary token, 자기진단 게이트)은 별도 backlog 로 분리했다. 본 세대는 오탐 수정 + DI 까지만 한다.

## Backlog Review

pending 5건. 본 세대 후 순서는 유저 지시 대기. `릴리즈-자기진단-게이트-...` 는 **본 세대 완료가 선행 조건**이다 — 경고 0 을 만든 뒤에야 "경고 0" 게이트를 걸 수 있다.

## Context for This Generation

### Clarity Level: **High**

원인이 코드 인용 수준으로 확정됐고, 수정 방향(DI)도 유저 결정으로 확정됐다. opencode 에 참고할 기존 패턴이 있다.

### 특수 제약

- **e2e 는 HOME 격리 필수** — 테스트가 `install-skills` 를 돌리면 사용자의 실제 `~/.claude/commands/` 19개를 덮어쓴다. gen-069 의 daemon e2e 패턴(HOME override) 차용
- **`getAdapter` 실패 처리** — codex 등에서 throw 시 `fix --check` 가 죽으면 안 됨
- **0.17.3 릴리즈** — completion 에서 릴리즈 문서 일습 + `check-docs-version.sh` 통과 필요
