---
type: task
status: consumed
priority: high
createdAt: 2026-07-27T11:55:44.959Z
consumedBy: gen-076-a3679b
consumedAt: 2026-07-27T12:19:32.270Z
---

# resolve #22: install-skills 위치를 fix --check 가 legacy 로 오탐 — installer/checker 불일치

Issue: https://github.com/c-d-cc/reap/issues/22 (reporter: ImBrek, REAP 0.17.2)

## Problem

`reap install-skills` 가 설치하는 위치를 `reap fix --check` 가 "legacy" 로 경고한다. 같은 릴리즈 안에서 두 명령이 서로를 부정하므로 **어떤 지원 명령으로도 해소할 수 없는 경고**다.

### 재현 (본 repo 에서 확인, 2026-07-27)

```
$ ls ~/.claude/commands/reap.*.md | wc -l
19

$ reap fix --check
19건: "~/.claude/commands/reap.<cmd>.md: legacy reap command at user level (Phase 2 remnant)"
```

`reap install-skills` 를 다시 돌리면 cleanup-then-copy 로 같은 19개가 재배치되고 경고도 그대로다. `reap fix` (non-check) 는 user-level 을 건드리지 않으므로 **탈출구가 없다**.

### 양측 코드

| | 위치 | 내용 |
|---|---|---|
| installer | `src/adapters/claude-code/install.ts:46` | `join(homedir(), ".claude", "commands")` — docstring: *"Sync user-level `~/.claude/commands/reap.*.md` files"* |
| checker | `src/core/integrity.ts:715-722` | 같은 glob 에 warning *"legacy reap command at user level (Phase 2 remnant)"* |

### 결정적 증거 — integrity.ts 가 자기 파일 안에서 모순된다

```
integrity.ts:772-774  (cleanupLegacyProjectSkills docstring)
  "v0.15 installed skills at project-level .claude/commands/reap.*.md ...
   v0.16 uses user-level ~/.claude/commands/ only, so project-level files
   are unnecessary."

integrity.ts:715-722  (checkUserLevelArtifacts)
  "~/.claude/commands/reap.* — legacy reap commands at user level"
```

**한 파일이 같은 경로를 "v0.16 정식 위치"라고 하면서 동시에 "legacy"라고 경고한다.**

### "Phase 2" 의 정체 (git 추적으로 확인)

`git log -S "Phase 2 remnant"` → 최초 도입 `363a9a9` (2026-03-23, v0.15 시절).

같은 시기 커밋: `5d1bd35 fix(gen-066-0ff356): postinstall.cjs Phase 2 — ~/.reap/commands/ 전용 설치` (2026-03-20).

즉 **"Phase 2" 는 v0.15 에서 `~/.reap/commands/` 로 옮기던 작업의 이름**이다. 그 맥락에서 `~/.claude/commands/` 는 실제로 잔재였고 경고가 타당했다.

그 후 `f290166 feat: reap v0.16.0 — complete rewrite` 에서 어댑터가 **`~/.claude/commands/` 를 정식 위치로 되돌렸는데 checker 의 경고 문구만 v0.15 맥락으로 남았다.**

### 어느 쪽이 옳은가 — 이미 결정돼 있다

이슈는 "저자의 판단"이라 했으나, 실제로는 `~/.claude/commands/` 가 정식임이 여러 곳에서 확정돼 있다:

- README AI Client Support 표
- `installSlashCommandsOnly` docstring
- `adapters/claude-code/index.ts:16` — registerSessionIntegration 이 동기화할 3 surface 중 하나로 명시
- `integrity.ts:772-774` — 위 인용
- gen-064 가 `registerSessionIntegration` 갭을 이 전제 위에서 수정

→ **checker 가 플래그를 멈추는 것**이 답이다.

### 부수 피해 — 경고 19건이 신호를 묻는다

`fix --check` 출력이 상시 19건이라 유용한 경고가 파묻힌다. 실제로 gen-072~075 에서 부모 에이전트가 매 세션 `fix --check` 를 돌렸으면서도 **관심 있는 경고(memory/genome)만 필터링해 보느라 5세대 동안 이 문제를 놓쳤다.** 외부 제보자가 먼저 발견했다.

## Solution

### S1. `~/.claude/commands/reap.*` 경고 제거

`checkUserLevelArtifacts` 에서 해당 `checkGlobPattern` 호출을 삭제한다. gen-064 가 opencode 쪽(`~/.config/opencode/commands/`)에서 같은 경고를 제거하며 주석을 남긴 선례가 있다(`integrity.ts:724-727`) — **claude-code 만 빠뜨린 것**이므로 같은 형태의 주석을 남긴다.

### S2. 경로를 의존성 주입으로 공유 — 재발 방지의 핵심 (유저 결정)

문구만 고치면 다음에 경로가 바뀔 때 또 어긋난다. 현재 `join(homedir(), ".claude", "commands")` 가 installer 와 checker 에 **각각 하드코딩**돼 있다.

**방식: DI. `core` → `adapters` 의존은 만들지 않는다.**

`core/integrity.ts` 가 adapter 를 import 하면 계층이 역전된다(core 는 adapter 를 몰라야 한다). 대신 **검사 대상 경로를 인자로 주입**받는다:

```ts
// core/integrity.ts — adapter 를 모른 채 주입받은 것만 검사
export async function checkUserLevelArtifacts(
  projectRoot: string,
  userLevelDirs?: { commands?: string; skills?: string },
): Promise<IntegrityResult>
```

호출부(`cli/commands/fix.ts`)가 `getAdapter(agentClient)` 로 정식 경로를 얻어 주입한다. 그러면:

- core 는 "무엇이 정식 위치인가"를 판단하지 않는다 — 주입받은 것을 검사할 뿐
- adapter 가 경로의 **단일 소유자**가 된다. 경로를 바꾸면 checker 가 자동으로 따라온다
- opencode 등 다른 adapter 도 같은 경로로 자기 위치를 주입할 수 있다

주입값이 없을 때의 동작(하위 호환)을 정의할 것 — 미주입 시 해당 검사를 건너뛰는 편이 안전하다(잘못된 기본값으로 오탐하는 것보다 낫다).

### S3. `~/.claude/skills/reap.*` error 는 유지하되 근거 주석

이슈가 "planned migration 흔적"으로 함께 지목한 항목. v0.15 는 `.claude/skills/reap.*/SKILL.md` 를 썼고 v0.16 은 쓰지 않으므로 **error 유지가 타당**하다. 다만 판단 근거가 코드에 없으므로 주석으로 남긴다.

### S4. e2e 로 합의를 고정

`install-skills` 실행 직후 `fix --check` 가 user-level 관련 경고를 내지 않아야 한다. 이 테스트가 있으면 두 명령이 다시 어긋나는 순간 드러난다.

**HOME 격리 필요** — gen-069 의 daemon e2e 패턴(HOME override)을 차용해 사용자의 실제 `~/.claude/` 를 건드리지 않게 한다.

## Out of Scope

- **릴리즈 게이트에 `fix --check` 추가** — 별도 backlog(`릴리즈-자기진단-게이트-...`)에서 다룬다. 본 건은 오탐 자체의 수정
- `.claude/commands/reap.*` (project-level) 경고 — v0.15 잔재가 맞고 `cleanupLegacyProjectSkills` 가 실제로 지운다. 변경 없음
- opencode 어댑터 — gen-064 에서 이미 정리됨

## Files to Change

- `src/core/integrity.ts` — `checkUserLevelArtifacts` (L699-739). 경고 제거 + 주석. `~/.claude/skills/` 근거 주석
- `src/adapters/claude-code/install.ts` 또는 `src/core/paths.ts` — 경로 상수 export (S2 결정에 따라)
- `tests/e2e/` — install-skills ↔ fix --check 합의 (신규, HOME 격리)
- `tests/unit/integrity.test.ts` — 기존 user-level 케이스 확인

## Acceptance

1. `reap install-skills` 직후 `reap fix --check` → user-level 관련 경고 **0건**
2. 본 repo 에서 `fix --check` 총 경고가 19건 → **0건**
3. 경로가 한 곳에서만 정의되고 installer/checker 가 그것을 참조 (grep 으로 하드코딩 중복 부재 확인)
4. `~/.claude/skills/reap.*` 는 여전히 error 로 감지 (v0.15 잔재 탐지 능력 유지)
5. e2e 가 HOME 격리 하에 동작하며 사용자 `~/.claude/` 미접촉
6. unit/e2e/scenario 회귀 없음 (baseline 461-0 / 263-1 / 44-0)

## Open Decisions

- [x] **경로 공유 방식 = DI** (유저 결정 2026-07-27). `core → adapters` 의존 금지. adapter 가 소유하고 호출부가 주입
- [ ] 주입값 미제공 시 동작 — 검사 skip 을 기본으로 보나, 기존 호출부가 모두 주입하도록 바꾸면 optional 로 둘 이유가 없을 수도 있다. 호출부 전수 확인 후 결정
