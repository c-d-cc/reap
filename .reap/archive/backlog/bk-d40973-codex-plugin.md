---
id: bk-d40973
slug: codex-plugin
type: design
title: REAP 플러그인을 Codex에서도 쓴다 — codex는 .claude-plugin을 이미 읽는다
createdAt: 2026-09-20T04:17:03Z
status: open
---

사람이 "reap을 codex에서 쓸 수 있는 플러그인으로 만들고 싶다"고 했다. 조사해보니 **포팅이 아니라 얹는 일**일 가능성이 크다.

## 실측 (codex-cli 0.145.0, 로컬)

Codex에 플러그인 시스템이 있다 — `codex plugin add|list|remove`, `codex plugin marketplace add|list|upgrade|remove`. 설치 캐시는 `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`.

구조가 우리 것과 같다.

```
<plugin>/
  .codex-plugin/plugin.json     ← name · version · description · author · keywords · "skills": "./skills/"
  skills/<name>/SKILL.md        ← frontmatter는 name · description
```

그리고 바이너리 안에 매니페스트 후보가 **셋 나란히** 박혀 있다.

- 플러그인: `.codex-plugin/plugin.json` · `.claude-plugin/plugin.json` · `.cursor-plugin/plugin.json`
- 마켓플레이스: `.agents/plugins/marketplace.json` · `.claude-plugin/marketplace.json` · `.cursor-plugin/marketplace.json`

훅 이벤트 이름도 같다 — `SessionStart` · `UserPromptSubmit` · `PreToolUse` · `PostToolUse` · `PermissionRequest` · `Stop` · `SessionEnd` · `Compact`. 사용자 훅은 `~/.codex/hooks.json`이고 형식이 `plugin/hooks/hooks.json`과 같은 모양이다.

## 아직 모르는 것 셋 — probe로 답한다

1. codex가 **플러그인 번들 훅**(`hooks/hooks.json`)을 읽는가. 번들 플러그인 중에 훅을 가진 것이 하나도 없어서 규약이 안 보인다
2. 읽는다면 `${CLAUDE_PLUGIN_ROOT}`에 해당하는 변수를 무엇으로 주입하는가. 지금 우리 훅 명령줄이 그 변수 하나에 걸려 있다
3. skill이 codex 세션에서 어떻게 노출되는가 — 자동 발견인지, 사람이 부르는 이름이 `/reap:evolve` 꼴인지

probe: 스크래치패드에 `.claude-plugin/marketplace.json`만 얹은 임시 마켓플레이스를 만들어 현재 `plugin/`을 가리키고, `codex plugin marketplace add` → `codex plugin add` → `codex exec`로 skill·훅 노출을 확인한 뒤 원복한다.

## 얹는다면 번지는 자리

- `reap setup` — 지금은 `claude` CLI만 부른다. 호스트가 둘이면 무엇을 기본으로 할지 사람이 정해야 한다
- `plugin/hooks/session-start.sh` — `${CLAUDE_PLUGIN_ROOT}` 의존
- `orchestrate` skill — `claude agents`로 roster를 읽고 `SendMessage`로 조율한다. codex에는 그 표면이 없다
- 문서 — README·reap.cc의 설치 절이 "Claude Code 플러그인"으로 못 박혀 있다

## 방향을 바꾸는 변경이다

"REAP는 Claude Code 위에서 돈다"가 지금의 전제다. 호스트를 둘로 여는 것은 그 전제를 건드린다 — 사람 검토가 필요하고, flux에서 정할 일이다.
