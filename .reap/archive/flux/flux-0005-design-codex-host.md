---
id: flux-0005-design
slug: codex-host
type: design
title: Codex를 두 번째 호스트로 — 어댑터 없이 얹히는가
from: bk-d40973
refs:
  - ps-4f2a91:08-delivery.md
startedAt: 2026-09-20T04:18:57Z
startCommit: 7bf6790
status: closed
milestones: []
closedAt: 2026-09-20T04:44:02Z
---
## Question

사람이 "reap을 codex에서 쓸 수 있는 플러그인으로 만들고 싶다"고 했다(2026-09-20). `08-delivery.md`는 이 질문의 자리를 이미 비워뒀다 — *"REAP는 Claude Code 전용으로 시작한다. 어댑터 인터페이스는 남겨두고, **두 번째 클라이언트가 실제로 필요해질 때 채운다**"*. 폐기 표의 "opencode 어댑터"도 같은 유보다.

답할 것 넷.

① **어댑터가 필요한가.** codex 0.145.0은 플러그인 매니페스트로 `.claude-plugin/plugin.json`을, 마켓플레이스로 `.claude-plugin/marketplace.json`을 **이미 찾는다**(바이너리 실측). 그렇다면 "두 어댑터를 유지하느라 모든 기능을 두 번 만든" 과거의 비용이 이번에는 안 들 수 있다. 진짜로 그대로 얹히는가 — probe로 답한다.

② **어디까지 도는가.** skill 본문은 호스트 중립적이지 않다. `orchestrate`는 `claude agents`로 roster를 읽고 `SendMessage`로 조율한다 — codex에 그 표면이 없다면 그 skill 하나가 죽는다. 훅은 `${CLAUDE_PLUGIN_ROOT}` 하나에 걸려 있다. **"대부분 돌고 일부가 죽는" 상태를 정상으로 볼 것인가, 죽는 것을 잘라낼 것인가.**

③ **설치 경로.** `genome/application.md`가 *"설치 경로는 npm 하나 — `reap setup`이 플러그인을 `claude` CLI로 설치한다(사람 결정 2026-09-05)"*를 박아뒀다. 호스트가 둘이면 `setup`이 무엇을 하는가 — 감지해서 둘 다 / 물어보고 하나 / 사람이 플래그로 고른다.

④ **약속의 크기.** 이것은 방향 전환이다. "Claude Code 위에서 돈다"에서 "호스트 둘을 지원한다"로 가면 앞으로 모든 skill 변경이 두 호스트를 고려해야 한다. **지원(support)인가, 되면 좋고인가(best effort)** — 이 답이 문서 문구와 이후의 유지 비용을 정한다.

## Explored

### codex 플러그인 표면 (codex-cli 0.145.0, 2026-09-20 로컬 실측)

명령이 있다 — `codex plugin add|list|remove`, `codex plugin marketplace add|list|upgrade|remove`. 설치 캐시는 `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`. `marketplace add`는 로컬 경로·`owner/repo[@ref]`·HTTPS/SSH Git URL을 받고 `--sparse`도 있다.

설치된 플러그인의 모양이 우리 것과 같다.

```
<plugin>/
  .codex-plugin/plugin.json    name · version · description · author · keywords · "skills": "./skills/" · interface{...}
  skills/<name>/SKILL.md       frontmatter는 name · description
  .mcp.json                    (선택) MCP 서버 번들
```

바이너리 문자열에 매니페스트 후보가 셋씩 나란히 박혀 있다.

- 플러그인: `.codex-plugin/plugin.json` · **`.claude-plugin/plugin.json`** · `.cursor-plugin/plugin.json`
- 마켓플레이스: `.agents/plugins/marketplace.json` · **`.claude-plugin/marketplace.json`** · `.cursor-plugin/marketplace.json`

훅 이벤트 이름도 같다 — `session_start` · `user_prompt_submit` · `pre_tool_use` · `post_tool_use` · `permission_request` · `stop` · `session_end` · `compact`(바이너리의 `hooks/src/events/*.rs`). 사용자 훅 파일은 `~/.codex/hooks.json`이고 형식이 우리 `plugin/hooks/hooks.json`과 같은 모양이다(`{"hooks":{"SessionStart":[{"hooks":[{"type":"command","command":"...","timeout":10}]}]}}`).

### 아직 모르는 것 셋 — probe 대상

1. codex가 **플러그인 번들 훅**을 읽는가. 번들 플러그인 열 몇 개 중 `hooks/`를 가진 것이 하나도 없어 규약이 안 보인다. 바이너리에 `hooks/hooks.json.staging`·`HookScope`가 있지만 그것이 플러그인 스코프를 뜻하는지는 미확인
2. 읽는다면 `${CLAUDE_PLUGIN_ROOT}`에 해당하는 변수를 무엇으로 주입하는가
3. skill이 codex 세션에서 어떻게 노출되는가 — 자동 발견인지, 사람이 부르는 이름이 `/reap:evolve` 꼴인지

### 걸리는 자리 (spec·genome에 이미 박힌 것)

- `08-delivery.md` — "Claude Code 전용으로 시작" · "마켓플레이스는 이 리포에 없다(`c-d-cc/plugins` 하나, submodule)" · "skill이 곧 slash command다"
- `genome/application.md` — "설치 경로는 npm 하나 … `claude` CLI로 설치한다(사람 결정 2026-09-05)"
- `plugin/hooks/hooks.json` — `${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh`
- `plugin/skills/orchestrate/SKILL.md` — `claude agents` roster · `SendMessage`

### probe 결과 (2026-09-20, codex 0.145.0)

스크래치패드에 `.claude-plugin/marketplace.json` 하나만 둔 임시 마켓플레이스를 만들어 이 리포의 `plugin/`을 가리키고, `marketplace add` → `plugin add` → `codex exec`까지 돌린 뒤 전부 원복했다(`config.toml` 완전 일치, `~/.codex/hooks.json` 무변경).

**① 어댑터는 필요 없다. 그대로 얹힌다.**

- `codex plugin marketplace add`가 **Claude Code 형식 `.claude-plugin/marketplace.json`을 그대로 읽었다.** 바꿀 것이 없었다
- `codex plugin add`가 `.claude-plugin/plugin.json`에서 name·version(0.18.0)을 읽어 설치했다
- `codex debug prompt-input`으로 실제 모델 입력을 떠보니 **skill 10종이 전부 `reap:carve-milestone`·`reap:complete`·`reap:evolve`·`reap:flux`·`reap:help`·`reap:init`·`reap:interview`·`reap:migrate`·`reap:orchestrate`·`reap:report-issue`로 올라갔다.** 이름 규약(`<플러그인>:<skill>`)까지 같다

**② 훅은 안 된다 — 기능이 제거됐다.**

`codex features list`가 답이다.

```
hooks           stable    true      ← 사용자 전역 ~/.codex/hooks.json
plugin_hooks    removed   false     ← 플러그인 번들 훅
```

실험 셋이 전부 실패한 이유가 이것이다 — `hooks/hooks.json`(우리 배치), 루트 `hooks.json`+절대경로, `plugin.json`에 `"hooks"` 선언. 세 번 다 `hook: SessionStart Completed`는 찍히는데(그건 사용자 전역 훅이다) 우리 스크립트는 돌지 않았다. `openai-curated`의 `replayio`·`figma`가 루트 `hooks.json`을 갖고 있는 것은 **그 기능이 살아 있던 시절의 잔재**다.

**부수 확인 — 계약 자체는 같다.** 바이너리에 `hookSpecificOutput`·`hookEventName`·`additionalContext`가 그대로 있다. 즉 우리 `session-start.sh`가 내는 JSON을 codex도 이해한다. **막힌 곳은 형식이 아니라 등록 경로 하나뿐이다.** 사람이 `~/.codex/hooks.json`에 직접 넣으면 돈다 — 그러나 그 파일을 REAP가 쓰는 것은 `invariants.md`가 금지한다("사용자의 설정 파일을 편집하지 않는다").

**③ skill이 슬래시가 아니다.**

codex는 skill을 `<skills_instructions>` 블록에 **목록으로 넣고 모델이 고르게 한다.** 사람이 `/reap:evolve`를 타이핑하는 표면이 아니다(codex의 슬래시는 `~/.codex/prompts/`가 따로 있다). `08-delivery.md`의 *"skill이 곧 slash command다"*는 Claude Code에서만 참이다.

**정리하면 — 코드 변경 0으로 skill 10종이 codex에서 돌고, 잃는 것은 SessionStart 주입 하나다.**

## Dialogue

| 갈린 지점 | 선택지 | 답 | 비고 |
|---|---|---|---|
| codex를 어느 크기로 약속하나 | 정식 지원 / 되면 좋고(문서 한 절) / 지금은 안 한다 | **정식 지원 — 두 호스트** | 추천 없이 물었다(우선순위 판단). `08-delivery.md`의 유보 "두 번째 클라이언트가 실제로 필요해질 때"가 여기서 닫힌다 |
| SessionStart 주입 공백 | skill 자력+문서 안내(추천) / skill 자력만 / setup이 훅까지 등록 | **setup이 codex 훅까지 등록** | 추천 밖. 사람은 "상태 줄이 두 호스트에서 똑같이 동작한다"를 택했다 — invariants 완화와 제거 경로 신설이 딸려온다 |
| invariants를 어느 폭으로 완화 | 좁게(플러그인 훅 없는 호스트+자기 항목 하나, 추천) / 넓게(setup이 하는 일 전부) | **넓게** | 추천 밖. 호스트가 더 늘어도 invariants를 다시 안 고치는 쪽 |
| 훅 항목 제거 경로 | `setup --remove`(추천) / doctor가 보고만 / 문서로만 | **`setup --remove`** | 넣은 주체가 빼는 주체다. `08-delivery.md`의 "uninstall은 없다"를 고쳐 쓴다 |
| setup이 두 호스트를 다루는 법 | 감지해서 전부(추천) / 플래그 제한 / 물어본다 | **감지해서 있는 것 전부** | setup이 이미 `--version` 감지 + 재실행 안전 구조다. 플래그는 필요해지면 그때 |

## Dead Ends

- **어댑터 인터페이스.** `08-delivery.md`가 "어댑터 인터페이스는 남겨두고 두 번째 클라이언트가 필요해질 때 채운다"고 유보해 둔 그 자리 — **채울 필요가 없었다.** codex가 `.claude-plugin/*`을 직접 읽으므로 추상화 계층을 만들면 없는 차이를 만드는 것이 된다. 호스트 차이는 `setup.ts`의 명령 이름 두 개와 훅 등록 한 곳에만 있다
- **플러그인 번들 훅으로 상태 줄을 넣는 길.** 배치를 셋 시도했고(`hooks/hooks.json` · 루트 `hooks.json`+절대경로 · `plugin.json`에 `"hooks"` 선언) 전부 안 됐다. 원인은 배치가 아니라 `plugin_hooks` 기능이 codex에서 **제거된 것**이다. 되살아나면 그때 이 길이 다시 열린다

## Outcome

**규범으로 반영한 것** — 이 flux의 산출은 여기다.

- `ps-4f2a91:08-delivery.md` — "Claude Code 전용으로 시작"이 **호스트 둘**로 바뀌었다. 어댑터를 만들지 않는 이유, 갈리는 셋(설치 명령·훅 등록 자리·skill 호출 표면)의 표, 훅 계약이 같다는 사실, orchestrate가 한 호스트에만 산다는 것, 마켓플레이스는 여전히 하나라는 것. "`install`도 `uninstall`도 없다"는 **`setup --remove`로 대체**됐고, "skill이 곧 slash command다"는 Claude Code 한정으로 좁혀졌다. 폐기 표의 "opencode 어댑터" 줄은 "클라이언트 어댑터 — 호스트가 우리 매니페스트를 읽으면 그대로 얹고, 안 읽으면 만들지 않는다"로 갱신
- `genome/invariants.md` — 사용자 설정 파일 금지에 `setup` 예외가 생겼다(사람 결정). 되돌릴 수 있을 것, 넣지 않은 것은 안 건드릴 것이 함께 걸렸다
- `genome/application.md` — 호스트가 둘임을 적고 이유는 spec으로 넘겼다
- `08-delivery.md`의 "구현 중 검증할 것"에 한 줄 추가 — codex가 Git 마켓플레이스에서 submodule까지 가져오는가(로컬 경로로만 확인했다)

**실행 항목** — `bk-90be10` (setup이 두 호스트를 건다). 세대 하나 분량이라 milestone을 자르지 않았다. 이 flux를 연 관측 `bk-d40973`은 내용이 여기로 흡수되어 archived.

**남는 사실 하나.** 코드를 한 줄도 안 고친 상태에서 이미 codex에서 skill 열 종이 돈다. `bk-90be10`이 더하는 것은 *설치가 한 명령으로 끝나는 것*과 *상태 줄*이지, 동작 자체가 아니다.
