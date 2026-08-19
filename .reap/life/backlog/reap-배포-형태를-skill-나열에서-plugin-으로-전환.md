---
type: task
status: pending
priority: high
createdAt: 2026-08-18T23:00:41.504Z
---

# REAP 배포 형태를 skill 나열에서 plugin 으로 전환

## Problem

현재 `reap install-skills` 는 클라이언트의 user-level 디렉토리에 **개별 파일을 흩뿌리는** 방식이다.

- claude-code: `~/.claude/commands/reap.*.md` 19개 + `~/.claude/agents/reap-*.md` 2개
- opencode: `$XDG_CONFIG_HOME/opencode/commands/reap.*.md` + `.../agent/reap-*.md`

그 결과 Claude Code `/plugin` 화면에서 REAP 은 **Plugin 항목이 아니라 Skills 섹션에 `reap.abort` / `reap.back` / `reap.config` … 19줄로 나열**된다. 다른 도구들(superpowers, ouroboros, frontend-design 등)은 모두 `Plugin` 한 줄을 차지하고 enable/disable · 출처 마켓플레이스 · 버전이 함께 표시되는 것과 대비된다.

이 형태의 문제:

- REAP 이 **하나의 도구로 인식되지 않는다** — 켜고 끄기, 버전 확인, 출처 확인이 항목별로 흩어진다
- 사용자의 skill 목록을 19줄 점유한다
- 설치·갱신·제거를 REAP CLI 가 직접 파일 조작으로 수행한다 — 클라이언트의 패키지 관리 경로 밖이다

## Solution

REAP 을 **plugin 형태로 배포**해 한 단위로 설치·활성화·버전 관리되게 한다. 단, **구현 전에 리서치와 migration 설계를 먼저 끝낸다.**

### 1. 선행 리서치 (구현 착수 전 필수)

코드를 건드리기 전에, 각 agent client 별로 skill 과 plugin 의 차이를 조사한다.

**claude-code**
- plugin 정의 구조 — `.claude-plugin/plugin.json`, marketplace manifest, commands/agents/skills/hooks/mcpServers 번들 구성
- 설치 경로와 소유권 — plugin 은 어디에 놓이고 누가 갱신하는가. npm postinstall 로 배치 가능한가, marketplace 등록이 필수인가
- skill 로 남길 것 vs plugin 으로 묶을 것의 경계 (slash command / agent 정의 / SessionStart hook / MCP)
- enable·disable 토글, 버전 표시, `not used in N days` 사용량 표시가 REAP 동작에 주는 영향

**opencode**
- plugin 개념이 존재하는가. 현재 `.opencode/plugins/reap-plugin.ts` 는 **이름만 같은 다른 개념**(런타임 훅)일 가능성이 높다 — claude-code plugin 의 대응물이 무엇인지 확정할 것
- 대응물이 없다면 현행 방식을 유지하는가. 그 경우 adapter 간 비대칭을 어디에 문서화하는가

**codex** — 미지원 유지 여부만 확인

**산출물**: `.reap/vision/design/plugin-distribution.md` — 클라이언트별 비교표 + 채택 방향 + 미채택 안의 기각 사유. 리서치 없이 구현으로 넘어가지 않는다.

### 2. Migration 설계 (필수 산출물)

**이미 skill 형태로 쓰고 있는 사용자가 update 했을 때 무슨 일이 일어나는지**를 먼저 확정하고 그에 맞춰 설계한다.

- 기존 `~/.claude/commands/reap.*.md` 19개가 남으면 **plugin 과 중복 노출**된다 → 누가 언제 지우는가
- `reap.` prefix 는 REAP 예약이고 install 은 cleanup-then-copy 규약이다. 전환 후에도 이 cleanup 이 상시 돌아야 하는가, 1회성 마이그레이션인가
- `checkUserLevelArtifacts` 의 legacy 판정(`getAdapter().userLevelDirs()` 주입, gen-076/issue #22)이 plugin 경로를 어떻게 취급해야 하는가 — 전환 후 구 경로는 legacy 로 잡혀야 한다
- **`src/templates/migration/vX.Y.Z.md` 를 반드시 동반한다.** 템플릿·코드만 고치면 이미 존재하는 프로젝트에는 아무것도 도달하지 않는다 (gen-072 교훈)
- 사용자가 plugin 을 disable 한 상태에서 REAP CLI 를 쓰면 어떻게 되는가 — 실패 양상과 안내 문구
- 롤백 경로 — plugin 이 동작하지 않는 클라이언트 버전에서 구 방식으로 되돌릴 수 있는가

### 3. 검증

- `scripts/check-self-diagnosis.sh` (층1) 을 plugin 배치 검사로 확장할 수 있는가
- `scripts/check-agent-integration.sh` (층2) — plugin 으로 설치된 상태에서 `/reap.start` 가 실제로 인식되는가. **파일이 놓인 것과 클라이언트가 그것을 읽는 것은 별개다** (gen-063 / gen-079 교훈)
- opencode 쪽 `opencode agent list` 게이트(gen-082)가 계속 유효한지 확인
- 검사는 **수정 전에 먼저 실패시켜** 유효성을 확인한다 (gen-073 교훈)

## Files to Change

리서치 결과에 따라 범위가 달라진다. 현재 시점의 후보:

**배포 형태 소유**
- `src/adapters/types.ts` — `AdapterModule` 계약에 plugin 배포 개념이 필요한지
- `src/adapters/claude-code/install.ts` — `installSkills` / `installSlashCommandsOnly` / `installAgents` / `registerSessionHooks`
- `src/adapters/claude-code/index.ts` — `registerSessionIntegration` 의 user-level sync (gen-064 규약)
- `src/adapters/claude-code/skills/` — 19개 `.md` 를 plugin 번들 소스로 재배치할지
- `src/templates/agents/` — `reap-evolve.md` / `reap-evaluate.md` 의 plugin 내 위치
- `src/adapters/opencode/install.ts` — 대응물 존재 여부에 따라 (변경 없을 수 있음)
- (신규) plugin manifest — `.claude-plugin/plugin.json` 및 marketplace manifest 위치

**빌드·설치**
- `scripts/build.sh` — 정적 자산 복사 대상
- `scripts/postinstall.sh`
- `package.json` — `files` 필드

**Migration·진단**
- `src/core/integrity.ts` — `checkUserLevelArtifacts`
- `src/cli/commands/update.ts`
- (신규) `src/templates/migration/vX.Y.Z.md`
- `scripts/check-self-diagnosis.sh`, `scripts/check-agent-integration.sh`

**문서**
- `.reap/vision/design/plugin-distribution.md` (신규, 리서치 산출물)
- `~/.reap/reap-guide.md` ↔ `src/templates/reap-guide.md` § AI Client Support 표
- `.reap/genome/application.md` § Adapter Layer
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — 설치 안내가 바뀌면 **5개 로케일 전부**
