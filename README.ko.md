# REAP

*[English](README.md)로도 읽을 수 있다.*

REAP는 AI와 사람이 소프트웨어를 함께 진화시키기 위한 **규약과 도구의 집합**이다. 작업의 모양을 결정하지 않고, 작업이 쓸 수 있는 도구와 저장 규약을 제공한다.

만드는 것은 둘이다. TypeScript·Bun으로 만든 CLI 바이너리 `reap`과, skill과 SessionStart 훅을 담은 플러그인 `plugin/`이다. 둘은 따로 설치되고 따로 갱신된다. 플러그인은 Claude Code와 Codex 양쪽에서 돈다.

## 설치

```bash
npm i -g @c-d-cc/reap
reap setup
```

설치는 이것이 전부다. `reap setup`이 PATH에 있는 호스트를 감지해 마켓플레이스를 등록하고 플러그인을 설치한다. Claude Code와 Codex 둘 다 있으면 둘 다 건다. 몇 번을 다시 쳐도 빠진 것만 하고, `reap setup --remove`가 그것만 되돌린다. 확인:

```bash
reap --version
```

새 세션을 열면 skill과 상태 줄이 보인다. 둘 다 안 보이면 `reap setup`을 다시 치고 그 출력을 읽는다.

- **Claude Code** — `/` 메뉴에 `/reap:` skill 8종이 뜨고, 세션 시작 시 상태 줄이 붙는다.
- **Codex** — skill 10종을 이름으로 부른다(`reap:evolve`). `/` 메뉴가 아니라 에이전트가 목록에서 고르는 자리다. Codex는 플러그인 훅을 실행하지 않으므로 상태 줄은 `reap setup`이 `~/.codex/hooks.json`에 직접 걸어 준다. **앱을 쓰고 있었다면 한 번 종료했다 열어야 한다** — 떠 있는 앱은 시작할 때 읽은 훅 목록을 그대로 쓴다.

## 첫 사용

프로젝트에서 (신규 폴더든 기존 코드베이스든):

```
/reap:init
```

정본 지식(plan source 등록, `environment/summary.md`, `genome/`)을 세운다. 그다음부터는

```
/reap:evolve
```

로 세대를 연다. 작업이 끝나면 agent가 세대를 닫는다 — 사람이 부를 것은 없다. 매 세션 시작 시 주입되는 상태 줄이 현재 milestone, 열린 세대, 기억과 idea가 있는 자리, 저장 구조 지도(`.reap/map.md`)의 위치를 보여준다 — 무엇을 더 읽을지는 그 지도를 보고 agent가 정한다.

## v0.17에서 왔다면

v0.17은 스스로 v0.18로 올라가지 않고, 세션 안에서 v0.18이 나왔다고 알려주지도 않는다. v0.17.7 이하를 쓰고 있다면 시작은 사람의 손이다.

```bash
npm i -g @c-d-cc/reap
reap setup
```

그다음 쓰는 호스트에서 새 세션을 열어 프로젝트마다 `/reap:migrate`를 부른다. 이주 전까지 v0.18은 옛 `.reap/`을 알아보고 거기에 쓰는 대신 그 사실을 말한다 — `ctx`와 `doctor`가 이 길을 가리키고 `make`·`mark`·`init`은 멈춘다. `migrate` skill이 8단계로 데이터를 옮기고, 원본은 `.reap-v0_17/`에 그대로 보존한다 — 되돌릴 수 있다.

v0.17 슬래시 명령은 지울 때까지 그대로 남고, 옛 세션 훅은 이제 v0.18 CLI를 부르게 되는데 CLI가 같은 단계를 안내로 답한다.

### 언어

REAP는 기본이 en이다. `.reap/config.yml`에 `config.language: ko`(프로젝트 밖이면 `REAP_LANG=ko`)를 두면 CLI 출력이 한국어가 된다. agent의 답은 이와 별개로 항상 사용자 언어다 — 주입되는 상태 줄의 `Response language` 줄이 agent에게 답할 언어를 알려준다.

v0.18에서 잃는 것:

- 5단계 lifecycle 강제와 그 흐름 명령(`run start/next/back/abort/early-close`, `/reap.*` 7종) — 흐름은 이제 skill의 판단이다
- `/reap.evolve`가 세대 전체를 subagent에 위임해 자율 실행하던 것 — v0.18의 `evolve`는 주 세션이 직접 일한다
- `merge`/`pull`/`push` lifecycle과 그 슬래시 명령 3종 — `orchestrate` skill과 git 직접 사용으로 대체
- `reap-evaluate` evaluator agent — 세대를 닫기 전 독립된 눈으로 보는 역할은 `complete` skill 안의 절이 됐다
- `status`·`config`·`check-version`·`uninstall` 명령 — `ctx` 상태 줄·`doctor`·config 직접 편집·플러그인 제거로 대체

자세한 대조는 [docs/reap-plan/reap_v_0_18_release/01-gap.md](docs/reap-plan/reap_v_0_18_release/01-gap.md)에 있다.

## 명령 표면

agent가 REAP를 다루는 통로는 skill이다. 플러그인이 배포하는 10종 — 여덟은 사람이 `/` 메뉴에서 부를 수 있고, 둘은 agent만 부른다(`user-invocable: false`로 메뉴에서 숨김). Codex에는 그 구분이 없어 열 종이 모두 agent에게 보인다:

| skill | 누가 | 언제 |
|---|---|---|
| [`init`](plugin/skills/init/SKILL.md) | 사람 | 프로젝트당 한 번, 맨 처음 — 정본 지식을 세운다 |
| [`evolve`](plugin/skills/evolve/SKILL.md) | 사람 | 세대를 열 때 — flux·exec·fix 중 무엇인지 정한다 |
| [`complete`](plugin/skills/complete/SKILL.md) | agent | 세대를 닫을 때 |
| [`flux`](plugin/skills/flux/SKILL.md) | 사람 | 새 의도를 만들 때 — 기획·설계·화면·아직 자리 없는 것 |
| [`carve-milestone`](plugin/skills/carve-milestone/SKILL.md) | agent | plan을 실행 가능한 milestone으로 자를 때, 그리고 milestone을 닫을 때 |
| [`interview`](plugin/skills/interview/SKILL.md) | 사람 | 의도가 모호해 사람이 결정해야 할 때 |
| [`orchestrate`](plugin/skills/orchestrate/SKILL.md) | 사람 | 두 세션 이상이 같은 프로젝트에서 동시에 작업할 때 |
| [`migrate`](plugin/skills/migrate/SKILL.md) | 사람 | v0.17 데이터를 v0.18 구조로 옮길 때 |
| [`report-issue`](plugin/skills/report-issue/SKILL.md) | 사람 | REAP 자체의 결함이나 빠진 기능을 만났을 때 |
| [`help`](plugin/skills/help/SKILL.md) | 사람 | 지금 어디인지, 무엇을 부를 수 있는지, 다음에 뭘 할지 — 상태 줄을 다시 보여 주고 행동 하나를 제안한다 |

CLI 명령 표면은 옮겨 적지 않는다 — `reap`을 인자 없이 치면 usage가 나온다.

## 제거

```bash
claude plugin uninstall reap@ctod-plugins
npm rm -g @c-d-cc/reap
```

프로젝트에서 REAP를 걷어내려면:

```bash
rm -rf .reap
```

## 개발

```bash
bun install
bun test
bun run build       # dist/reap — bun build --compile
bun run build:node  # npm 배포용 node 번들
```

플러그인을 로컬에서 띄워 skill을 테스트하려면:

```bash
claude --plugin-dir ./plugin
```

규범은 이 리포가 아니라 [docs/superpowers/specs/reap/](docs/superpowers/specs/reap/README.md)가 소유한다.
