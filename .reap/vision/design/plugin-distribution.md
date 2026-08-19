# Plugin 배포 형태 — 리서치 결과

> backlog `reap-배포-형태를-skill-나열에서-plugin-으로-전환.md` 가 요구한 선행 리서치 산출물.
> 조사일 2026-08-19~20. **구현은 이 문서의 「결정 대기」가 닫힌 뒤에 착수한다.**

> **daemon 폐기 결정 (2026-08-20) 이후 읽는 법.** 상주 daemon 은 폐기되고 indexer 가 reap 패키지에
> 내장된다(backlog `daemon-폐기-및-indexer-내장…`). 이 문서의 daemon 서술은 **폐기 전 상태**이며,
> 폐기가 이 문서를 무효화하지는 않는다 — plugin 배포와 daemon 은 독립 축이다.
> 폐기가 실제로 바꾸는 것은 § 「`reap uninstall` 이 전환 후 무엇이 되는가」 하나뿐이고,
> 그 자리에 무엇이 어떻게 바뀌는지 적어두었다.

## 이 문서가 답하는 것

두 개의 서로 다른 질문이 같은 해법을 가리켜 여기서 만났다.

- **backlog 의 질문** — `/plugin` 화면에서 REAP 이 Plugin 한 줄이 아니라 Skills 19줄로 나열된다. 하나의 도구로 인식되지 않고, 설치·갱신·제거가 클라이언트의 패키지 관리 경로 밖에 있다.
- **사용자의 질문 (2026-08-20)** — "사용자 로컬에 굳이 설치하지 않고 원격 repo 에서 관리하면 로컬에 들고 있을 필요가 없어지지 않나?"

두 번째 질문에는 **아니오** 가 답이다. 그리고 그 아니오가 첫 번째 질문의 가치를 더 선명하게 만든다.

## 확정 사실

### 1. 로컬에서 없앨 수 없다 — 바뀌는 것은 관리 주체다

plugin 도 `~/.claude/plugins/cache/{marketplace}/{plugin}/{version}/` 아래로 **전부 내려받는다**. 로컬 파일이 사라지는 것이 아니라, 그 파일을 **누가 놓고 누가 지우는가**가 REAP 에서 Claude Code 로 넘어간다.

그것이 작은 이득이 아니다. gen-087(npm 12 의 install script 차단)과 gen-088(제거 경로 부재)은 **둘 다 "REAP 이 남의 홈에 직접 파일을 쓴다"에서 파생된 문제**다. 관리 주체가 넘어가면 그 부류가 통째로 사라진다.

### 2. plugin 이 담을 수 있는 것 — 필요한 것은 전부 담긴다

slash command · subagent 정의 · **SessionStart hook** · skill · MCP server.

hook 은 실물로 확인했다 — `~/.claude/plugins/cache/ouroboros/ouroboros/0.50.5/hooks/hooks.json` 이 `SessionStart` 를 `${CLAUDE_PLUGIN_ROOT}` 경유 명령으로 등록한다. REAP 은 PATH 의 `reap` 을 부르면 되므로 더 단순하다.

### 3. 이름이 바뀐다 — `/reap.start` → `/reap:start`

규칙은 `/plugin-name:command-name` 이고, plugin 이름과 같은 이름의 command 하나만 접두사 없이 축약된다.

근거: `~/.claude/plugins/cache/gptaku-plugins/insane-design/0.5.4/README.md` 가 `/insane-design:analysis`, `/insane-design:apply`, `/insane-design:build`, `/insane-design:verify` 를 호출법 표로 나열하고, 같은 이름의 `insane-design.md` 만 `/insane-design` 으로 불린다.

**agent 도 같다** — `plugin-name:agent-name` 으로 `@-mention` 에 나온다. `subagent_type: "reap-evolve"` 를 지시하는 곳이 CLAUDE.md 템플릿 · AGENTS.md 템플릿 · reap-guide · phase prompt 문자열에 흩어져 있다.

파일명도 바뀐다. `reap.start.md` 를 그대로 두면 `/reap:reap.start` 가 되므로 `start.md` 여야 한다.

**이것이 이번 리서치에서 가장 무거운 발견이다.** 얻는 것이 "관리 주체 이전"인데 잃는 것이 "사용자 전원의 명령어"라면 저울이 자명하지 않다.

### 4. 갱신 비대칭 — 그리고 그것을 없애는 경로

plugin 은 **갱신 알림만 자동이고 실행은 수동**이다(세션 시작 시 "마켓플레이스에 새 커밋이 있습니다 … `/plugin` 메뉴에서 업데이트하세요"). REAP CLI 는 `autoUpdate: true` 로 자동 갱신된다. 그대로 두면 **어긋남이 예외가 아니라 일상**이 된다.

marketplace source 6종 중 둘이 이 문제를 다룬다:

| source | 형태 | 버전 어긋남 |
|---|---|---|
| `npm` | `{"source":"npm","package":"…","version":"^0.18.0"}` | **남는다** — 버전이 여전히 둘, 핀으로 범위만 제어 |
| `command` | `{"source":"command","command":"reap plugin-root"}` (Claude Code ≥ v2.1.229) | **원리적으로 불가능** — 명령이 plugin 디렉토리 절대경로를 stdout 하고 **세션마다 재실행**된다. `npm i -g @c-d-cc/reap` 한 번으로 CLI 와 plugin 이 동시에 갱신된다 |

`command` source 는 backlog 의 미결 "npm postinstall 로 배치 가능한가"에 대한 실질적 답이기도 하다. 대가는 클라이언트 버전 하한과, 사용자가 "명령을 실행하는 plugin 소스"를 승인해야 한다는 점.

### 5. plugin 은 npm 의존을 선언할 수 없다

REAP 의 slash command 는 전부 `reap run …` 을 실행한다. plugin 만 설치한 사용자는 **명령이 보이는데 전부 실패한다**. plugin `bin/` 으로 PATH 에 실행파일을 넣을 수는 있으나 그러면 reap 이 두 벌 존재해 버전 어긋남을 자초한다.

### 6. 사용자 조작 없이 설치할 수 있다 — 다만 침습적이다

`extraKnownMarketplaces` + `enabledPlugins` 를 `settings.json` 에 쓰면 `/plugin marketplace add` 없이 등록·활성화된다. REAP 은 이미 그 파일을 쓰고 있으므로 메커니즘 교체가 아니라 **payload 교체**다. 다만 사용자의 `/plugin` 화면에 "내가 추가한 적 없는 marketplace" 가 나타난다 — 지금의 hook 등록보다 침습적이다.

(사용자 스코프 `~/.claude/settings.json` 동작은 **추정** — 문서 예시는 프로젝트 스코프다.)

## 클라이언트별 비교 — 비대칭이 확정됐다

| | claude-code | opencode |
|---|---|---|
| 한 단위 설치·활성화·버전 관리 | **있다** (plugin) | **없다** |
| slash command 원격 배포 | plugin | **불가** — 공식 문서가 "command 는 npm 패키지에서 발견되지 않는다"고 명시 |
| agent 원격 배포 | plugin | **불명** (문서 침묵 — 부재가 아니라 미확인) |
| SessionStart 상당 | plugin hook | `.opencode/plugins/reap-plugin.ts` (런타임 훅) |
| npm 으로 배포 가능한 것 | — | **plugin(런타임 훅)만** — `plugin: ["@scope/pkg"]` 한 줄로 파일 복사를 대체 |

`.opencode/plugins/reap-plugin.ts` 는 **claude-code plugin 의 대응물이 아니다.** backlog 의 추정이 맞았다 — `session.created` / `tool.execute.before` 에서 `reap dump-state --silent` 를 실행하는 런타임 훅이며 command·agent·skill 을 담지 않는다.

**따라서 전환하면 REAP 은 두 클라이언트에 영구히 다른 배포 형태를 유지한다.** backlog 가 "비대칭을 어디에 문서화하는가"라고 물어둔 것이 이제 가정이 아니라 확정 사실이다. 대상: `application.md § Adapter Layer` + `reap-guide § AI Client Support` 표 + 5 로케일.

전환으로 OpenCode 가 얻는 것은 딱 하나 — `reap-plugin.ts` 파일 복사가 npm 패키지명 한 줄이 된다. command·agent 는 그대로다.

## 자산별 원격화 가능성

| 자산 | 현재 위치 | 읽는 주체 | 원격화 | 근거 |
|---|---|---|---|---|
| slash command 19 | `~/.claude/commands/reap.*.md` | Claude Code | **가능** | plugin `commands/` |
| agent 정의 2 | `~/.claude/agents/reap-*.md` | Claude Code | **가능** (이름 변경 동반) | plugin `agents/` |
| SessionStart hook | `~/.claude/settings.json` | Claude Code | **가능** | plugin `hooks/hooks.json` (실물 확인) |
| `~/.reap/reap-guide.md` | `~/.reap/` | **CLAUDE.md 의 `@` import** | **조건부 — 아래 미결 1** | 경로를 문자 그대로 참조 |
| opencode command·agent | `$XDG_CONFIG_HOME/opencode/…` | OpenCode | **불가** | 위 표 |
| `.reap/` 프로젝트 구조 | 프로젝트 | REAP | **불가** | `reap init` 산출물 |
| `reap` CLI 바이너리 | npm 전역 | 사용자·hook·plugin | **불가** | 모든 command 가 이것을 실행 |
| ~~`@c-d-cc/reap-daemon`~~ | npm 전역 | REAP | — | **폐기 결정 (2026-08-20).** indexer 가 reap 에 내장된다 |
| `~/.reap/daemon/` → 후속 인덱스 저장 위치 | `~/.reap/` | REAP | **불가** | 사용자 데이터·파생물, 배포물 아님. **위치는 폐기 generation 이 정한다** |

### SessionStart hook 이 정적 파일로 대체 불가능한 이유

`buildKnowledgeContext` (`src/cli/commands/load-context.ts`) 의 5개 절 중 정적인 것은 `# Language` 하나뿐이다.

- `# Current State` — `.reap/life/current.yml`. **stage 전환마다 바뀐다** (한 세션에 3회 이상 가능)
- `# Strict Mode` — config 플래그 × **현재 stage** 의 곱
- `# Code Intelligence` — `config.daemon === true` 일 때만. **조건부 존재**이고 `@` import 는 조건부일 수 없다
- `# Pending Migrations` — **설치된 npm 패키지 버전**에 의존. 어떤 프로젝트 파일도 이 값을 모른다

그리고 비-REAP 디렉토리에서 조용히 종료한다 — 정적 import 로 표현 불가.

정확한 서술은 "정적 파일이면 된다"가 아니라 **"정적 파일을 쓰는 훅이 필요하다"** 이다(`.reap/.session-state.md` 가 그 예이고 OpenCode 는 그것을 읽는다). plugin 이 hook 을 소유해도 그 hook 이 `reap load-context` 를 실행하므로 **CLI 의존은 남는다.**

## gen-087 / gen-088 과의 관계

### gen-087 `ensureUserLevelAssets` — 죽지 않고 payload 가 바뀐다

claude-code 의 파일 21개 복사는 사라지지만, **OpenCode 몫이 통째로 남고** `extraKnownMarketplaces`/`enabledPlugins` 를 쓰는 새 책임이 생긴다. `AdapterModule.syncUserLevelAssets` / `UserLevelSyncResult.complete` / `.install-stamp` 라는 **계약 구조는 유지**된다.

### gen-088 `reap uninstall` — 버려지지 않고 전환의 전제가 된다

- backlog 미결 1번 "기존 `~/.claude/commands/reap.*.md` 19개가 plugin 과 중복 노출되는데 **누가 언제 지우는가**" 의 답이 gen-088 의 `removeUserLevelAssets` 다
- `settings.json` 에서 "사용자 것은 남기고 REAP 것만 빼는" 수술 로직이 `extraKnownMarketplaces`/`enabledPlugins` 에 **같은 모양 그대로** 필요하다
- `/plugin uninstall` 은 `~/.reap/` 도 npm 패키지도 모른다 — **`reap uninstall` 은 전환 후에도 유일한 완전 제거 경로**다

**따라서 전환 세대는 gen-088 머지 이후여야 한다.** 순서가 고정된다.

### `reap uninstall` 이 전환 후 무엇이 되는가

gen-088 이 만든 4단계 구조를 그대로 놓고 본다. **바뀌는 것은 3단계 하나뿐이다.**

| 단계 | 전환 후 |
|---|---|
| 1. 진입 훅 우회 | **남는다** — `ensureUserLevelAssets` 가 OpenCode 때문에 산다 |
| 2. daemon 정지 + `~/.reap/daemon/` | plugin 과 무관. **단 daemon 폐기로 별도로 바뀐다 — 아래** |
| 3. 홈 자산 제거 | **payload 가 바뀐다** (아래) |
| 4. npm 패키지 제거 | **무변경** (제거 대상 목록은 daemon 폐기로 줄어든다) |

`/plugin uninstall` 은 `~/.reap/` 도 npm 패키지도 모른다. **`reap uninstall` 은 전환 후에도 유일한 완전 제거 경로다.**

#### daemon 폐기가 2단계를 어떻게 바꾸는가 (2026-08-20 결정)

상주 프로세스가 없어지면 **uninstall 이 단순해진다.** gen-088 이 daemon 때문에 지고 있던 제약 셋이 함께 사라진다:

- **"stop 이 먼저"라는 순서 제약이 없어진다.** 유휴 30분 상주하는 프로세스가 지운 파일을 다시 쓰는 경합이 애초에 성립하지 않는다. `stopDaemonIfRunning` 과 그것을 만들며 함께 고친 D2(`daemon stop` 이 꺼진 daemon 을 띄우는 문제)는 대상 자체가 사라진다
- **npm 제거 대상이 둘에서 하나로 준다.** `@c-d-cc/reap-daemon` 이 없어지므로 `reap` 만 지우면 된다
- **`source === "checkout"` 예외가 사라진다.** 사용자 작업 트리를 npm 에 넘기지 않으려던 가드는 daemon 위치 조회(`locateDaemon`)에 딸린 것이었다

**대신 새로 결정할 것이 하나 생긴다 — 인덱스를 어디에 두는가.** indexer 가 reap 에 내장되면 인덱스 저장 위치가 `~/.reap/` 안이 될 가능성이 높고, 그렇다면 **`~/.reap/` allowlist 에 그 항목을 추가해야 한다.** 추가하지 않으면 uninstall 후 인덱스가 남는다 — allowlist 는 "목록에 없는 것은 무조건 남긴다"이므로 **조용히** 남는다.

폐기 generation 이 저장 위치를 정할 때 이 문서와 `removeReapHomeAssets` 의 allowlist 를 함께 갱신할 것.

3단계의 변화:

- **claude-code** — "파일 21개 제거"가 **"`settings.json` 의 `extraKnownMarketplaces` + `enabledPlugins` 에서 REAP 항목만 빼기"** 가 된다. gen-088 이 만든 **개별 hook 단위 수술 로직이 같은 모양 그대로 재사용된다** — 사용자 것은 남기고 REAP 것만 빼는 구조
- **opencode** — **통째로 남는다.** 전환은 claude-code 편면이다
- **`~/.reap/`** — allowlist 는 그대로. `reap-guide.md` 항목만 미결 1의 결정에 따라 달라진다

### 새로 생기는 잔여물 — 같은 결함이 다른 자리에서 재발한다

**marketplace source 를 `command` 로 고르면** plugin 실체가 npm 패키지 안에 있으므로 `npm uninstall` 이 파일을 지운다. 그러나 **`settings.json` 의 등록 항목은 남고, 그것이 가리키는 명령(`reap plugin-root`)은 더 이상 존재하지 않는다.** Claude Code 는 세션마다 그 명령을 재실행하므로 매번 실패한다.

**이것은 gen-088 이 없앤 것과 정확히 같은 모양이다** — "REAP 이 사라진 뒤에도 매 세션 없는 명령을 부르는 `settings.json` 엔트리". 자리만 `hooks` 에서 `extraKnownMarketplaces` 로 옮긴다.

따라서 **전환 설계는 이 항목을 처음부터 uninstall 대상에 넣어야 한다.** 나중에 발견하면 gen-088 을 한 번 더 하게 된다.

### 설계 판단이 필요한 것 — plugin cache 를 누가 지우는가

`~/.claude/plugins/cache/{marketplace}/{plugin}/{version}/` 는 **Claude Code 소유**다.

- REAP 이 직접 지우면 클라이언트의 설치 상태 기록과 어긋난다
- 등록만 해제하고 캐시를 남기면 그것도 잔여물이다 (버전별로 쌓인다)
- `/plugin uninstall` 을 사용자가 따로 쳐야 한다면, "한 명령으로 끝난다"는 gen-088 의 설계 원칙이 깨진다

**셋 중 무엇도 자명하지 않다. 전환 세대가 답해야 한다.**

## 결정 대기 — 사람이 답해야 할 것

1. **`~/.reap/reap-guide.md` 처리** — 나머지 설계가 여기 매달려 있다
   - (a) `~/.reap/` 에 그대로 둔다 → 가장 작다. 대신 `ensureUserLevelAssets` 가 이것 하나 때문에 산다
   - (b) plugin skill 로 옮기고 `@` import 삭제 → **"항상 로드"가 "필요할 때 로드"로 동작이 바뀐다.** phase prompt 들이 전량 주입을 전제하고 서 있다
   - (c) SessionStart hook 이 본문을 `additionalContext` 로 주입 → 매 세션 토큰 비용 무조건 지불
   - **`AGENTS.md` 도 같은 파일을 참조**하므로 두 adapter 가 결정을 공유한다. (b) 를 고르면 OpenCode 는 여전히 파일이 필요해 **두 곳에 존재**하게 된다
2. **marketplace source — `command` 인가 `npm` 인가.** `command` 만이 갱신 어긋남을 없앤다
3. **이름 변경(`/reap.start` → `/reap:start`, `reap-evolve` → `reap:reap-evolve`)을 받아들일 것인가.** 받아들이면 템플릿·guide·prompt·5 로케일·README 전수 갱신. 안 받아들이면 부분 전환
4. **adapter 비대칭을 확정할 것인가** — "REAP 은 클라이언트마다 다르게 설치된다"가 영구 사실이 된다
5. **`extraKnownMarketplaces` 를 사용자 `settings.json` 에 REAP 이 스스로 써도 되는가** — 침습성 판단
6. **0.18 브랜치 안에서 gen-088 이후 순서 확정**
7. **`plugin cache` 를 제거 시 어떻게 할 것인가** — REAP 이 지우면 클라이언트 상태와 어긋나고, 남기면 잔여물이며, 사용자가 `/plugin uninstall` 을 따로 쳐야 한다면 "한 명령으로 끝난다"는 gen-088 의 원칙이 깨진다 (위 § 참조)

## 미측정 — 전환 가능성을 좌우한다

**착수 전에 반드시 실측할 것.** 아래는 문서·검색 근거일 뿐이다.

1. **issue #11509 — 로컬 file-based marketplace 의 plugin 에서 SessionStart hook 미발화.** 현재 유효한지 미확인. `command`/`directory` source 를 고르면 **직격**이고, REAP 의 동적 컨텍스트 주입이 전부 그 hook 에 걸려 있다. **가장 매력적인 경로(2번 결정의 `command`)를 막을 수 있는 리스크다**
2. **`${CLAUDE_PLUGIN_ROOT}` 가 CLAUDE.md 의 `@` import 에서 전개되는가.** plugins-reference 가 치환 위치를 hook commands / MCP·LSP configs / monitor commands 셋으로 **열거**하고 `@` import 는 그 목록에 없다. 부재로 읽으면 "전개 안 됨"이지만 **열거가 완전하다는 보장이 문서에 없다**
3. **plugin 설치 상태에서 `/reap:start` 가 실제로 인식되는가** — 층2 검증 대상. backlog 가 이미 경고했다: **파일이 놓인 것과 클라이언트가 그것을 읽는 것은 별개다**(gen-063/079)
4. `not used in N days` 표시가 REAP 동작에 주는 영향 — 미조사

## 기각한 안

- **"원격에만 두고 로컬에는 두지 않는다"** — plugin 도 버전별 캐시 디렉토리로 전부 내려받는다. 이런 형태는 존재하지 않는다
- **plugin `bin/` 으로 CLI 까지 배포** — reap 이 두 벌 존재하게 되어 없애려던 버전 어긋남을 자초한다
- **`postuninstall` 훅으로 정리** (gen-088 관련) — npm 이 `preuninstall`/`postuninstall` 을 실행하지 않는다. npm 10.9.4(전역·로컬)와 12.0.2 에서 격리 probe 로 측정했다

## 근거의 종류

- **실물 확인**: plugin cache 디렉토리 구조, `ouroboros` 의 `hooks/hooks.json`·`plugin.json`, `insane-design` 의 README 호출법 표, `find ~/.claude/plugins -iname "*reap*"` 0건(REAP 은 plugin 이 아니다), 세션 시작 시의 marketplace 갱신 알림
- **코드 확인**: `src/adapters/{claude-code,opencode}/install.ts`, `src/adapters/index.ts`, `src/adapters/types.ts`, `src/cli/index.ts`, `src/cli/commands/load-context.ts`, `src/core/integrity.ts`, `src/templates/claude-md-section.md`
- **문서 확인**: Claude Code plugins-reference / plugin-marketplaces, OpenCode Plugins / Commands
- **추정**: `extraKnownMarketplaces` 의 사용자 스코프 동작, OpenCode 가 npm plugin 에서 agent 를 발견하는지
- **미측정**: 위 「미측정」 절 전부
