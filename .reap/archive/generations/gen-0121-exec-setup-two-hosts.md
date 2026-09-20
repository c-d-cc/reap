---
id: gen-0121-exec
slug: setup-two-hosts
type: exec
backlog: bk-90be10
title: setup이 두 호스트를 건다 — codex 감지·설치·훅 등록과 --remove
startedAt: 2026-09-20T04:45:03Z
startCommit: c988114
status: closed
closedAt: 2026-09-20T05:27:32Z
endCommit: 5d319de
---
## Intent

`bk-90be10`을 소비한다. `flux-0005-design`이 정한 것을 코드로 옮기는 일이고, 무엇이 참이어야 하는지는 `ps-4f2a91:08-delivery.md`에 있다.

`setup`이 있는 호스트를 감지해 전부 걸고, codex에서는 플러그인 훅이 없으므로 `~/.codex/hooks.json`에 REAP 항목을 직접 넣는다. 넣은 것은 `setup --remove`가 되돌린다. `orchestrate` skill은 자기가 Claude Code를 요구한다고 본문에서 말한다.

**먼저 답해야 할 것이 하나 있다** — codex가 `c-d-cc/plugins`를 Git 마켓플레이스로 받을 때 submodule까지 가져오는가. 안 가져오면 codex 쪽 설치가 빈 디렉토리를 가리키고, 그 경우 설치 경로 설계가 달라진다. 구현보다 이것이 먼저다.

**끝난 상태** — `bun test` 통과, `bun run typecheck` 통과, codex만/claude만/둘 다인 환경에서 `setup`이 각각 옳게 말하고, `setup` → `--remove` → `setup` 왕복 뒤 `~/.codex/hooks.json`이 남의 항목까지 처음과 같다.

## Open Questions

**codex는 Git 마켓플레이스의 submodule을 가져오지 않는다 — 실증됐다.**

원격 `c-d-cc/plugins`(아직 reap2 시절 상태이고 그것도 submodule 구조다)를 `codex plugin marketplace add c-d-cc/plugins`로 등록해봤다.

```
Added marketplace `ctod-plugins` from https://github.com/c-d-cc/plugins.git.
reap2@ctod-plugins  not installed  …/marketplaces/ctod-plugins/plugins/reap2/plugin
$ ls …/marketplaces/ctod-plugins/plugins/reap2/
(빈 디렉토리)
```

marketplace.json은 읽히고 플러그인 항목도 보이는데 **실체가 없다.** 바이너리의 clone 인자와도 맞는다 — `clone --filter=blob:none --no-checkout` + `sparse-checkout set --no-cone`. `--recurse-submodules`가 없고 `submodule update` 호출도 없다.

그러므로 `setup`이 codex에 `c-d-cc/plugins`를 걸면 **성공했다고 보고하면서 아무것도 설치하지 못한다.** `08-delivery.md`의 "마켓플레이스는 하나이고 이 리포는 submodule로 물린다"가 codex에서 성립하지 않는다.

**Claude Code 쪽은 미검증이다.** 이 환경에서 `ctod-plugins`는 로컬 디렉토리로 선언돼 있어(`~/.claude/settings.json`) GitHub 경유 설치가 실사용된 적이 없고, 같은 이름으로 다시 등록하려 하자 소스 불일치로 거부됐다. **즉 submodule 경로는 어느 호스트에서도 실제로 통과한 적이 없다.**

구조를 바꾸는 결정이라 사람에게 올린다.

## Verified

**codex CLI에서 상태 줄이 실제로 주입된다.** `setup`이 `~/.codex/hooks.json`에 건 항목으로 세션을 띄워 모델에게 물었다.

```
$ codex exec -c model="gpt-5.6-luna" "세션 시작에 주입된 컨텍스트에 REAP 상태가 있어? …"
있어 — 열린 세대는 `gen-0121-exec`, 현재 milestone은 `ms-022`야.
```

**훅 병합도 실제 파일에서 확인했다.** Orca가 이미 여덟 항목을 쓰고 있는 `hooks.json`에 우리 것 하나가 붙었고, SessionStart의 기존 그룹과 다른 이벤트 일곱(UserPromptSubmit·PreToolUse·PermissionRequest·PostToolUse·SubagentStart·SubagentStop·Stop)이 그대로 남았다.

**Codex 앱도 재시작하면 주입된다.** 처음엔 앱에서 *"reap 작업 경로는 있지만 진행 상태는 주입되어 있지 않습니다"*가 나왔다 — 앱이 떠 있는 채로 `setup`을 돌렸기 때문이다. ⌘Q 뒤 다시 열자 상태 줄이 전부 들어왔다(응답 언어·현재 milestone·열린 세대와 시작 커밋·열린 flux·기억·아이디어·지도). **새 대화를 여는 것으로는 부족하고 앱 프로세스를 다시 띄워야 한다.**

**skill은 아직 안 보인다 — 플러그인 설치가 실패했기 때문이고 예상된 것이다.** 원격 `c-d-cc/plugins`에 reap 항목이 없다(`bk-b53de4`). skill 노출 자체는 flux-0005가 로컬 마켓플레이스로 열 종 전부 확인했다. **즉 codex에서 상태 줄과 skill은 서로 다른 경로로 오고, 이번에 한쪽씩 따로 확인된 셈이다.**

## Dead Ends

- **플러그인 번들 훅으로 codex에 상태 줄을 넣는 길.** flux-0005가 배치 셋을 시도해 실패했고 원인은 `plugin_hooks` 기능 제거였다. 이 세대는 그 결론 위에서 시작했다
- **훅 command로 설치된 `session-start.sh`의 절대경로를 쓰는 안.** 경로에 버전이 박혀(`…/reap/0.18.0/hooks/…`) 다음 릴리스에서 죽은 경로를 가리킨다. `reap ctx --hook`은 리포 밖에서 빈 출력 + exit 0이라 그대로 걸 수 있다

## Open Questions

**실행 중 발견한 결함 둘 — 둘 다 고쳤고 테스트로 고정했다.**

- `--remove`가 **다른 마켓플레이스의 `reap@reap-dev`를 우리 것으로 오인**했다. `/reap@[\w.-]+/`로 판정해서, 이 환경에서 그대로 돌렸다면 사람의 개발용 마켓플레이스 `ctod-plugins` 등록까지 지웠다. `invariants.md`의 "넣지 않은 것은 건드리지 않는다" 위반이다. 이제 `reap@ctod-plugins`가 실제로 설치돼 있을 때만 움직인다
- **플러그인 설치가 실패하면 훅 등록까지 건너뛰었다.** 훅 명령은 `reap ctx --hook`이라 플러그인과 무관한데도 그랬다. 실제 실행에서 드러났다
- `CODEX_HOME`을 무시하고 `~/.codex`를 가정하고 있었다. codex 본체는 그 변수를 존중한다

**남긴 것** — `setup`이 마켓플레이스를 등록한 뒤 플러그인 설치가 실패하면, `--remove`는 그 마켓플레이스를 지우지 않는다(우리 플러그인이 설치된 적 없으므로). 무엇을 등록했는지 기록하지 않는 한 "내가 넣은 마켓플레이스"와 "원래 있던 것"을 가를 수 없다. 남기는 쪽이 지우는 쪽보다 덜 해롭다고 보고 그렇게 뒀다.

## Outcome

`bk-90be10` 소비. `setup`이 PATH의 호스트를 감지해 있는 것 전부를 건다 — Claude Code와 Codex. 어댑터는 만들지 않았다.

**코드**

- `src/setup.ts` — `Host` 둘, 설치 동사만 갈린다(`install`/`add`). 마켓플레이스 등록·플러그인 설치·codex 훅 등록을 호스트마다 돌고, 이미 있으면 아무것도 실행하지 않는다. `--remove`는 `reap@ctod-plugins`가 **실제로 설치돼 있을 때만** 움직이고, 훅은 우리 항목만 걷어낸다. `CODEX_HOME`을 존중한다
- `pluginInstalled`가 두 호스트를 본다 — Claude Code의 `enabledPlugins`와 codex `config.toml`의 `[plugins."reap@…"]`. 한쪽에만 있어도 설치된 것이다. codex만 쓰는 사람에게 `doctor`·`init`이 거짓 안내를 하지 않는다
- `cli.ts`에 `--remove`, 메시지 카탈로그 en·ko 재구성(호스트·수동 명령·훅 경로를 파라미터로)
- `plugin/skills/orchestrate/SKILL.md` — Claude Code를 요구한다고 본문에서 말한다

**문서** — README 둘과 사이트 ko를 호스트 둘에 맞췄다. `README.ko.md`의 "셋은 agent만"(=11종)도 바로잡았다.

**검증** — `bun test` 276 · `hook.test.sh` 5 · `typecheck` 통과. 격리 `CODEX_HOME`으로 실제 실행해 훅 파일과 출력을 확인했고, codex CLI 세션에서 상태 줄이 주입되는 것을 모델 응답으로 확인했다(Verified 절).

**검증 생략** — 사람 지시(2026-09-20). 독립 검증 subagent를 띄웠으나 사람이 패스를 결정했다. 대신 격리 `CODEX_HOME`으로 실제 실행하고 codex CLI 세션에서 주입을 확인한 것이 Verified 절에 있다.

**summary.md: 갱신** (structure — `setup.ts` 행 추가, 호스트 둘, 테스트 수). **genome: 갱신** (`application.md` — 호스트 둘. `invariants.md`는 사람 결정으로 `setup` 예외가 들어갔다).

**남긴 것** — `bk-b53de4`(마켓플레이스가 플러그인 파일을 직접 싣는다). codex에서 skill이 아직 안 보이는 원인이 여기다. 막는 것은 이 리포가 아니라 `c-d-cc/plugins`의 구조와 push다.
