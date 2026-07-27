---
type: task
status: consumed
priority: medium
createdAt: 2026-07-27T12:17:41.052Z
consumedBy: gen-079-600b6c
consumedAt: 2026-07-27T16:37:45.295Z
---

# agent 관점 검증 (층2) — slash command·hook·import 가 실제로 동작하는지 확인하는 절차

> `릴리즈-자기진단-게이트-...` backlog 에서 **층 2** 로 분리된 항목 (유저 결정 2026-07-27). 층 1(패키지 설치·동작)은 그쪽에서 다룬다.

## Problem

### REAP 의 자동 검증은 CLI 함수 호출까지만 본다

현재 e2e 는 `installSkills()` 를 호출하고 파일이 생겼는지 확인한다. 그러나 REAP 이 실제로 성립하려면 **agent 가 그 파일을 읽고 동작해야 한다.** 그 지점을 아무도 검증하지 않는다.

### 이 갭이 반복해서 사고를 냈다

| 세대 | 무엇이 통과했나 | 무엇을 놓쳤나 | 누가 발견 |
|---|---|---|---|
| gen-063 | OpenCode adapter 의 static 로드 / dynamic refresh / entry-point (3항목) e2e 통과 | **slash command 가 실제로 뜨지 않음** | 사용자 (fitness 단계) |
| gen-064 | `installSkills` 직접 호출 e2e 전부 통과 | `reap update` 경로는 `installSkills` 를 부르지 않음 | 사용자 (코드 직접 검토) |
| gen-074 | daemon e2e 21건 통과 (소스 트리 spawn) | **npm 설치 환경에서 daemon 이 아예 동작 불가** (끊긴 심링크) | 부모 에이전트 (조사 중 우연) |
| issue #22 | — | `install-skills` 위치를 `fix --check` 가 legacy 로 오탐 | **외부 제보자** |

genome `evolution.md` 에 이미 이 교훈이 두 번 기록돼 있다 — "사용자 UX gap 은 verification 항목으로 명시(gen-063)", "사용자 직접 테스트가 e2e 가 못 잡는 갭을 잡는다(gen-064)". **그럼에도 계속 발생한다. 규율은 있고 메커니즘이 없다.**

### 층 1 로는 잡히지 않는다

층 1(`HOME`/`prefix` override + `npm pack` + `fix --check`)은 **파일이 올바른 위치에 올바른 내용으로 놓였는지**까지만 본다. 다음은 여전히 못 본다:

- Claude Code 가 `~/.claude/commands/reap.*.md` 를 **slash command 로 인식**하는가
- SessionStart hook 이 실제로 **발화**하고 context 가 주입되는가
- `CLAUDE.md` 의 `@` import 가 **로드**되는가
- OpenCode 의 `instructions` 배열이 실제로 읽히는가
- agent 가 주입된 prompt 를 받아 **의도한 행동을 하는가**

## Out of Scope

- 층 1 (패키지 설치·동작) → `릴리즈-자기진단-게이트-...` backlog
- agent 응답 **품질** 평가 — 이건 fitness 의 영역이고 정량화 금지 대상(genome § Human Judges Fitness). 여기서 보는 것은 "동작하는가"이지 "잘 하는가"가 아니다

## Solution 후보 (설계 필요 — 아직 미확정)

### A. 헤드리스 agent 실행

Claude Code 는 `claude -p "<prompt>"` 로 non-interactive 실행이 가능하다. 격리 환경에 REAP 을 설치한 뒤 실제로 띄워 확인한다.

- 검증 예: `claude -p "/reap.status"` → REAP 상태가 나오는가 (slash command 인식 확인)
- **난관**: 인증(API key/OAuth), CI 에서의 비용, 출력 판정 기준. agent 응답은 비결정적이라 문자열 일치로 판정하기 어렵다
- 판정 아이디어: agent 응답이 아니라 **부수 효과**를 본다 — `reap run start` 가 실행되어 `current.yml` 이 생겼는가 같은 관찰 가능한 상태 변화

### B. 클라이언트 설정 파싱 검증

agent 를 띄우지 않고, **클라이언트가 읽는 설정을 REAP 이 올바르게 썼는지** 클라이언트의 스펙에 따라 검증한다.

- `~/.claude/settings.json` 의 hook 항목이 Claude Code 스펙에 맞는 형태인가
- `opencode.json` 의 `instructions` / `plugin` 배열이 OpenCode 스펙에 맞는가
- **장점**: 결정적, 빠름, 무료
- **한계**: 스펙을 우리가 해석한 대로 검증하므로 **해석이 틀리면 같이 틀린다.** gen-063 의 실패가 정확히 이 유형(파일은 맞게 썼으나 클라이언트가 인식하는 위치가 아니었음)

### C. 수동 체크리스트 (릴리즈 전)

깨끗한 환경에서 사람이 직접 밟는다. `reapdev.versionBump` skill 에 항목으로 추가.

- **장점**: 구현 비용 0, 외부 시선에 가장 가까움
- **한계**: 사람이 건너뛴다. gen-073 이 확인한 대로 **지시문은 이미 실패한 방법**이다 — versionBump skill 은 5개 로케일을 이름까지 명시했는데도 두 번 누락됐다

### D. NVIDIA OpenShell 샌드박스

커널 레벨(Landlock LSM + seccomp) agent 격리 런타임. agent-agnostic 이며 Claude Code 호환을 명시한다.

- **적합한 이유**: 층 2 는 실제 agent 를 실행해야 하고, 그 agent 가 호스트를 건드리지 않아야 한다. 이 도구의 목적과 정확히 일치
- **걸림돌**: alpha / single-player mode. Linux 전용(Landlock·seccomp)이라 Darwin 개발 환경에서 로컬 재현 불가
- **주의**: OpenShell 은 *격리*를 풀어주지 *판정*을 풀어주지 않는다. A 의 난관(인증·비용·출력 판정)은 그대로 남는다

### 조합 가능성

A(실행) + D(격리) + B(빠른 사전 검사)가 배타적이지 않다. B 를 CI 상시, A+D 를 릴리즈 전에만 두는 계층 구성이 현실적일 수 있다.

## Files to Change

설계 확정 후. 예상 범위:
- `scripts/` — 검증 스크립트
- `.github/workflows/release.yml` 또는 별도 workflow
- `.claude/commands/reapdev.versionBump.md` — C 채택 시
- `.reap/genome/evolution.md` — 검증 원칙 반영 여부 (adapt phase)

## Acceptance

설계 확정 후 구체화. 최소 요건:

1. gen-063 의 실패(slash command 가 뜨지 않음)를 **재현 상황에서 잡아낼 수 있는가** — 과거 실패를 잡지 못하는 검증은 의미가 없다
2. gen-074 의 daemon 배포 결함을 잡는가 (층 1 도 잡지만 이중 확인)
3. 사용자의 `~/.claude/` · 전역 node_modules 미접촉
4. CI 에 넣는다면 비결정적 실패(flaky)가 없어야 한다 — agent 응답 기반 판정은 이 조건을 만족하기 어렵다

**1번이 이 backlog 의 핵심 기준이다.** 설계안을 평가할 때 "과거 사고를 잡았겠는가"로 판정한다.

## Open Decisions

- [ ] A/B/C/D 중 무엇을, 어떤 조합으로
- [ ] agent 실행을 CI 에 넣을지, 릴리즈 전에만 할지 — 비용과 flakiness 가 관건
- [ ] 판정 기준 — agent 출력 문자열인가, 부수 효과(파일/상태 변화)인가. 후자가 결정적이지만 검증 범위가 좁아진다
- [ ] OpenShell 의 alpha 상태를 어느 시점에 재평가할지 (지금은 게이트 의존성으로 부적합)
- [ ] 검증 대상 클라이언트 범위 — claude-code 만인가, opencode 도 포함인가 (adapter 가 둘이므로 갭도 둘)
