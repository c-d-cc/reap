# REAP

REAP는 AI와 사람이 소프트웨어를 함께 진화시키기 위한 **규약과 도구의 집합**이다. 작업의 모양을 결정하지 않고, 작업이 쓸 수 있는 도구와 저장 규약을 제공한다.

만드는 것은 둘이다. TypeScript·Bun으로 만든 CLI 바이너리 `reap`과, skill과 SessionStart 훅을 담은 Claude Code 플러그인 `plugin/`이다. 둘은 따로 설치되고 따로 갱신된다.

## 설치

```bash
npm i -g @c-d-cc/reap@next
```

Claude Code 플러그인:

```bash
claude plugin marketplace add c-d-cc/plugins
claude plugin install reap@ctod-plugins
```

확인:

```bash
reap --version
```

새 Claude Code 세션을 열면 `/reap:` skill 10종이 보이고, 세션 시작 시 상태 줄이 뜬다. 둘 다 안 보이면 플러그인 설치가 안 된 것이다.

## 첫 사용

프로젝트에서 (신규 폴더든 기존 코드베이스든):

```
/reap:init
```

정본 지식(plan source 등록, `environment/summary.md`, `genome/`)을 세운다. 그다음부터는

```
/reap:evolve
```

로 세대를 열고, 작업이 끝나면

```
/reap:complete
```

로 닫는다. 매 세션 시작 시 주입되는 상태 줄이 현재 milestone, 열린 세대, 기억과 idea가 있는 자리, 저장 구조 지도(`.reap/map.md`)의 위치를 보여준다 — 무엇을 더 읽을지는 그 지도를 보고 agent가 정한다.

## v0.17에서 왔다면

v0.17.7 이하는 `reap update`가 0.17.8로 자동 올린다. 0.17.8이 upgrade agent를 설치하고, 그 agent가 v0.18 CLI와 플러그인을 설치한 뒤 `/reap:migrate`로 넘긴다. `migrate` skill이 8단계로 데이터를 옮기고, 원본은 `.reap-v0_17/`에 그대로 보존한다 — 되돌릴 수 있다.

v0.18에서 잃는 것:

- 5단계 lifecycle 강제와 그 흐름 명령(`run start/next/back/abort/early-close`, `/reap.*` 7종) — 흐름은 이제 skill의 판단이다
- `/reap.evolve`가 세대 전체를 subagent에 위임해 자율 실행하던 것 — v0.18의 `evolve`는 주 세션이 직접 일한다
- `merge`/`pull`/`push` lifecycle과 그 슬래시 명령 3종 — `orchestrate` skill과 git 직접 사용으로 대체
- `reap-evaluate` evaluator agent
- `status`·`config`·`check-version`·`uninstall` 명령 — `ctx` 상태 줄·`doctor`·config 직접 편집·플러그인 제거로 대체
- 다국어 지원 — v0.18은 **한국어 전용**이다

자세한 대조는 [docs/reap-plan/reap_v_0_18_release/01-gap.md](docs/reap-plan/reap_v_0_18_release/01-gap.md)에 있다.

## 명령 표면

agent가 REAP를 다루는 통로는 skill이다. 플러그인이 배포하는 10종:

| skill | 언제 |
|---|---|
| [`init`](plugin/skills/init/SKILL.md) | 프로젝트당 한 번, 맨 처음 — 정본 지식을 세운다 |
| [`evolve`](plugin/skills/evolve/SKILL.md) | 세대를 열 때 — loop·exec·fix 중 무엇인지 정한다 |
| [`complete`](plugin/skills/complete/SKILL.md) | 세대를 닫을 때 |
| [`loop`](plugin/skills/loop/SKILL.md) | 새 의도를 만들 때 — 기획·설계·화면·아직 자리 없는 것 |
| [`carve-milestone`](plugin/skills/carve-milestone/SKILL.md) | plan을 실행 가능한 milestone으로 자를 때, 그리고 milestone을 닫을 때 |
| [`interview`](plugin/skills/interview/SKILL.md) | 의도가 모호해 사람이 결정해야 할 때 |
| [`orchestrate`](plugin/skills/orchestrate/SKILL.md) | 두 세션 이상이 같은 프로젝트에서 동시에 작업할 때 |
| [`cleanup`](plugin/skills/cleanup/SKILL.md) | 사람이 fitness로 milestone을 닫기로 한 직후 |
| [`migrate`](plugin/skills/migrate/SKILL.md) | v0.17 데이터를 v0.18 구조로 옮길 때 |
| [`report-issue`](plugin/skills/report-issue/SKILL.md) | REAP 자체의 결함이나 빠진 기능을 만났을 때 |

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
